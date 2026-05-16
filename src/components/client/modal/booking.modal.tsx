import { Modal, Form, InputNumber, Radio, Button, Typography, Divider, Space, message, Row, Col, Card, Select, Input } from 'antd';
import { CreditCardOutlined, MoneyCollectOutlined, UserOutlined, CalendarOutlined, TagOutlined } from '@ant-design/icons';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { callCreateBooking, callCreatePaymentUrl, callCheckVoucher } from '@/config/api'; // Thêm callCheckVoucher
import { ITour } from '@/types/backend';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface BookingModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
    tourDetail: ITour | null;
}

const BookingModal = (props: BookingModalProps) => {
    const { isModalOpen, setIsModalOpen, tourDetail } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    // --- STATE VOUCHER ---
    const [voucherCodeInput, setVoucherCodeInput] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

    // 1. Lọc các lịch trình hợp lệ
    const activeSchedules = useMemo(() => {
        if (!tourDetail?.tourSchedules) return [];
        return tourDetail.tourSchedules.filter(s =>
            s.status === 'OPEN' && dayjs(s.departureDate).isAfter(dayjs())
        );
    }, [tourDetail]);

    // 2. Lắng nghe form để tính tiền
    const selectedScheduleId = Form.useWatch('tourScheduleId', form);
    const totalAdults = Form.useWatch('totalAdults', form) || 1;
    const totalChildren = Form.useWatch('totalChildren', form) || 0;

    const currentSchedule = useMemo(() =>
        activeSchedules.find(s => s.id === selectedScheduleId),
        [selectedScheduleId, activeSchedules]);

    const priceAdult = currentSchedule?.priceAdult || 0;
    const priceChild = currentSchedule?.priceChild || 0;
    const remainingSeats = currentSchedule ? (currentSchedule.capacity - currentSchedule.bookedSeats) : 0;

    // --- TÍNH TOÁN TIỀN VÀ KHUYẾN MÃI ---
    const basePrice = (totalAdults * priceAdult) + (totalChildren * priceChild);

    let discountAmount = 0;
    if (appliedVoucher) {
        if (appliedVoucher.discountType === 'PERCENT') {
            discountAmount = basePrice * (appliedVoucher.discountValue / 100);
            if (discountAmount > appliedVoucher.maxDiscount) {
                discountAmount = appliedVoucher.maxDiscount;
            }
        } else {
            discountAmount = appliedVoucher.discountValue;
        }
    }
    const finalPrice = Math.max(0, basePrice - discountAmount);

    // Tự động gỡ voucher nếu giá trị đơn hàng bị giảm xuống dưới mức tối thiểu
    useEffect(() => {
        if (appliedVoucher && basePrice < appliedVoucher.minOrderValue) {
            setAppliedVoucher(null);
            setVoucherCodeInput('');
            message.warning('Đơn hàng không còn đủ điều kiện giá trị tối thiểu để áp dụng mã giảm giá này!');
        }
    }, [basePrice, appliedVoucher]);

    // Reset form
    useEffect(() => {
        if (isModalOpen) {
            form.resetFields();
            setVoucherCodeInput('');
            setAppliedVoucher(null);
            if (activeSchedules.length > 0) {
                form.setFieldsValue({
                    tourScheduleId: activeSchedules[0].id,
                    totalAdults: 1,
                    totalChildren: 0,
                    paymentMethod: 'VNPAY'
                });
            }
        }
    }, [isModalOpen, activeSchedules, form]);

    const handleClose = () => {
        setIsModalOpen(false);
    };

    // --- XỬ LÝ VOUCHER ---
    const handleApplyVoucher = async () => {
        if (!voucherCodeInput.trim()) {
            message.warning("Vui lòng nhập mã giảm giá!");
            return;
        }
        setIsCheckingVoucher(true);
        try {
            const res = await callCheckVoucher({ code: voucherCodeInput.toUpperCase(), orderTotal: basePrice });
            if (res && res.data) {
                setAppliedVoucher(res.data);
                message.success('Áp dụng mã giảm giá thành công!');
            } else {
                message.error(res.message || 'Mã giảm giá không hợp lệ!');
                setAppliedVoucher(null);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Lỗi khi kiểm tra mã giảm giá!';
            message.error(errorMessage);
            setAppliedVoucher(null);
        } finally {
            setIsCheckingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCodeInput('');
    };

    // --- GỌI API ĐẶT TOUR ---
    const handleFinish = async (values: any) => {
        console.log(values);
        setLoading(true);
        try {
            const reqData = {
                tourScheduleId: values.tourScheduleId,
                totalAdults: values.totalAdults,
                totalChildren: values.totalChildren,
                note: values.note || "",
                paymentMethod: values.paymentMethod,
                voucherCode: appliedVoucher ? appliedVoucher.code : null // Truyền mã voucher lên BE
            };

            const resBooking = await callCreateBooking(reqData);

            if (resBooking && resBooking.data) {
                const bookingId = resBooking.data.id;
                // Ưu tiên lấy giá trả về từ Backend để tạo thanh toán cho chuẩn xác
                const paymentTotalPrice = resBooking.data.totalPrice || finalPrice;

                if (values.paymentMethod === 'VNPAY') {
                    message.loading(t('booking.message'), 2);
                    const paymentReq = { bookingId, totalPrice: paymentTotalPrice };
                    const resPayment = await callCreatePaymentUrl(paymentReq);

                    if (resPayment?.data?.paymentUrl) {
                        window.location.href = resPayment.data.paymentUrl;
                    } else {
                        message.error('Không thể khởi tạo cổng thanh toán!');
                    }
                } else {
                    message.success(t('booking.successMessage'));
                    setIsModalOpen(false);
                    form.resetFields();
                    navigate('/');
                }
            } else {
                message.error('Có lỗi xảy ra khi tạo đơn hàng!');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Không thể kết nối đến máy chủ!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Format tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0, textAlign: 'center' }}>{t('booking.title')}</Title>}
            open={isModalOpen}
            onCancel={handleClose}
            footer={null}
            width={700}
            centered
            maskClosable={false}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>

                {/* 1. THÔNG TIN TOUR */}
                <Card size="small" style={{ backgroundColor: '#f0f2f5', marginBottom: 20, borderRadius: 8, border: 'none' }}>
                    <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{tourDetail?.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 13 }}>{t('booking.notice')}</Text>
                </Card>

                {/* 2. CHỌN NGÀY VÀ SỐ LƯỢNG */}
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            name="tourScheduleId"
                            label={<Text strong>{t('booking.departureTime')}</Text>}
                            rules={[{ required: true, message: t('booking.timeMessage') }]}
                        >
                            <Select
                                placeholder={t('booking.timeMessage')}
                                size="large"
                                suffixIcon={<CalendarOutlined />}
                            >
                                {activeSchedules.map(s => (
                                    <Option key={s.id} value={s.id}>
                                        {dayjs(s.departureDate).format('DD/MM/YYYY')} - {t('booking.available')} {s.capacity - s.bookedSeats} {t('booking.slot')}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="totalAdults" label={<Text strong>{t('booking.adult')}</Text>}>
                            <InputNumber
                                min={1}
                                max={remainingSeats}
                                style={{ width: '100%' }}
                                size="large"
                                addonBefore={<UserOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="totalChildren" label={<Text strong>{t('booking.child')}</Text>}>
                            <InputNumber
                                min={0}
                                max={remainingSeats - totalAdults}
                                style={{ width: '100%' }}
                                size="large"
                                addonBefore={<UserOutlined />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* 3. GHI CHÚ */}
                <Form.Item name="note" label={<Text strong>{t('booking.note')}</Text>} style={{ marginBottom: 16 }}>
                    <TextArea
                        rows={2}
                        placeholder={t('booking.notePlaceHolder')}
                        maxLength={255}
                    />
                </Form.Item>

                {/* --- ÁP DỤNG MÃ GIẢM GIÁ --- */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong><TagOutlined />{t('booking.voucher')}</Text>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <Input
                            placeholder={t('booking.voucherMessage')}
                            value={voucherCodeInput}
                            onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                            disabled={!!appliedVoucher}
                            style={{ flex: 1 }}
                        />
                        {!appliedVoucher ? (
                            <Button type="primary" loading={isCheckingVoucher} onClick={handleApplyVoucher}>
                                {t('booking.apply')}
                            </Button>
                        ) : (
                            <Button danger onClick={handleRemoveVoucher}>
                                {t('booking.cancel')}
                            </Button>
                        )}
                    </div>
                    {appliedVoucher && (
                        <Text type="success" style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
                            ✅ {appliedVoucher.description || `Đã áp dụng mã ${appliedVoucher.code}`}
                        </Text>
                    )}
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* 4. PHƯƠNG THỨC THANH TOÁN */}
                <Title level={5} style={{ marginBottom: 12 }}>{t('booking.method')}</Title>
                <Form.Item name="paymentMethod">
                    <Radio.Group style={{ width: '100%' }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Radio.Button
                                    value="VNPAY"
                                    style={{ width: '100%', height: 'auto', padding: '12px', borderRadius: 8, textAlign: 'center' }}
                                >
                                    <CreditCardOutlined style={{ fontSize: 24, color: '#1677ff', marginBottom: 8 }} />
                                    <div style={{ lineHeight: '1.2' }}>
                                        <Text strong>VNPay</Text><br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>{t('booking.support')}</Text>
                                    </div>
                                </Radio.Button>
                            </Col>
                            <Col span={12}>
                                <Radio.Button
                                    value="CASH"
                                    style={{ width: '100%', height: 'auto', padding: '12px', borderRadius: 8, textAlign: 'center' }}
                                >
                                    <MoneyCollectOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                                    <div style={{ lineHeight: '1.2' }}>
                                        <Text strong>{t('booking.cash')}</Text><br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>{t('booking.cashNote')}</Text>
                                    </div>
                                </Radio.Button>
                            </Col>
                        </Row>
                    </Radio.Group>
                </Form.Item>

                {/* 5. TỔNG TIỀN VÀ NÚT CHỐT ĐƠN */}
                <div style={{ backgroundColor: '#fffbe6', padding: '16px', borderRadius: 8, border: '1px solid #ffe58f', marginTop: 24 }}>
                    <Row align="middle" justify="space-between">
                        <Col span={12}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Chi tiết giá */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text type="secondary" style={{ fontSize: 14 }}>{t('booking.subtotal')}:</Text>
                                    <Text strong>{formatCurrency(basePrice)}</Text>
                                </div>
                                {appliedVoucher && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#52c41a' }}>
                                        <Text style={{ fontSize: 14, color: 'inherit' }}>{t('booking.discount')}</Text>
                                        <Text strong style={{ color: 'inherit' }}>- {formatCurrency(discountAmount)}</Text>
                                    </div>
                                )}
                                <div style={{ borderTop: '1px solid #ffd591', margin: '4px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
                                    <Text type="secondary" style={{ fontSize: 14 }}>{t('booking.total')}:</Text>
                                    <Text strong style={{ fontSize: 24, color: '#cf1322', lineHeight: 1 }}>
                                        {formatCurrency(finalPrice)}
                                    </Text>
                                </div>
                            </div>
                        </Col>
                        <Col>
                            <Space>
                                <Button onClick={handleClose} size="large" style={{ borderRadius: 6 }}>{t('booking.cancel')}</Button>
                                <Button type="primary" htmlType="submit" size="large" loading={loading} disabled={!currentSchedule} style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', borderRadius: 6, fontWeight: 'bold' }}>
                                    {t('booking.confirm')}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Modal>
    );
};

export default BookingModal;