import { Modal, Form, InputNumber, Radio, Button, Typography, Divider, Space, message, Row, Col, Card, Select, Input } from 'antd';
import { CreditCardOutlined, MoneyCollectOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { callCreateBooking, callCreatePaymentUrl } from '@/config/api';
import { ITour } from '@/types/backend';
import dayjs from 'dayjs';

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
    const totalPrice = (totalAdults * priceAdult) + (totalChildren * priceChild);
    const remainingSeats = currentSchedule ? (currentSchedule.capacity - currentSchedule.bookedSeats) : 0;

    // Reset form
    useEffect(() => {
        if (isModalOpen) {
            form.resetFields();
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

    // Gọi API Đặt Tour
    const handleFinish = async (values: any) => {
        setLoading(true);
        try {
            const reqData = {
                tourScheduleId: values.tourScheduleId,
                totalAdults: values.totalAdults,
                totalChildren: values.totalChildren,
                note: values.note || ""
            };

            const resBooking = await callCreateBooking(reqData);

            if (resBooking && resBooking.data) {
                const bookingId = resBooking.data.id;
                const finalPrice = resBooking.data.totalPrice || totalPrice;

                if (values.paymentMethod === 'VNPAY') {
                    message.loading('Đang chuyển hướng đến cổng thanh toán...', 2);
                    const paymentReq = { bookingId, totalPrice: finalPrice };
                    const resPayment = await callCreatePaymentUrl(paymentReq);

                    if (resPayment?.data?.paymentUrl) {
                        window.location.href = resPayment.data.paymentUrl;
                    } else {
                        message.error('Không thể khởi tạo cổng thanh toán!');
                    }
                } else {
                    message.success('Đặt tour thành công!');
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

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0, textAlign: 'center' }}>Xác Nhận Đặt Tour</Title>}
            open={isModalOpen}
            onCancel={handleClose}
            footer={null}
            width={650} // Nới rộng form ra một chút cho cân đối
            centered
            maskClosable={false}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>

                {/* 1. THÔNG TIN TOUR (Dùng nền nhạt để tách biệt) */}
                <Card size="small" style={{ backgroundColor: '#f0f2f5', marginBottom: 20, borderRadius: 8, border: 'none' }}>
                    <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{tourDetail?.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 13 }}>Vui lòng chọn đúng lịch trình và hoàn tất thông tin đặt chỗ phía dưới.</Text>
                </Card>

                {/* 2. CHỌN NGÀY VÀ SỐ LƯỢNG KẾT HỢP */}
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            name="tourScheduleId"
                            label={<Text strong>Ngày khởi hành</Text>}
                            rules={[{ required: true, message: 'Vui lòng chọn ngày đi!' }]}
                        >
                            <Select
                                placeholder="Chọn ngày bạn muốn đi"
                                size="large"
                                suffixIcon={<CalendarOutlined />}
                            >
                                {activeSchedules.map(s => (
                                    <Option key={s.id} value={s.id}>
                                        {dayjs(s.departureDate).format('DD/MM/YYYY')} - Còn trống {s.capacity - s.bookedSeats} chỗ
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="totalAdults" label={<Text strong>Người lớn</Text>}>
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
                        <Form.Item name="totalChildren" label={<Text strong>Trẻ em (Dưới 12 tuổi)</Text>}>
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
                <Form.Item name="note" label={<Text strong>Ghi chú thêm (Tùy chọn)</Text>} style={{ marginBottom: 16 }}>
                    <TextArea
                        rows={2} // Giảm xuống 2 dòng cho đỡ chiếm diện tích
                        placeholder="Yêu cầu ăn chay, đón tại điểm khác..."
                        maxLength={255}
                    />
                </Form.Item>

                <Divider style={{ margin: '16px 0' }} />

                {/* 4. PHƯƠNG THỨC THANH TOÁN (Xếp ngang cho cân đối) */}
                <Title level={5} style={{ marginBottom: 12 }}>Phương thức thanh toán</Title>
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
                                        <Text strong>Thanh toán VNPay</Text><br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>Hỗ trợ thẻ ATM, Visa, QR</Text>
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
                                        <Text strong>Tiền mặt / Chuyển khoản</Text><br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>Thanh toán sau với NV</Text>
                                    </div>
                                </Radio.Button>
                            </Col>
                        </Row>
                    </Radio.Group>
                </Form.Item>

                {/* 5. TỔNG TIỀN VÀ NÚT CHỐT ĐƠN */}
                <div style={{ backgroundColor: '#fffbe6', padding: '16px', borderRadius: 8, border: '1px solid #ffe58f', marginTop: 24 }}>
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Text type="secondary" style={{ fontSize: 14 }}>Tổng thanh toán:</Text>
                            <br />
                            <Text strong style={{ fontSize: 26, color: '#cf1322' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                            </Text>
                        </Col>
                        <Col>
                            <Space>
                                <Button onClick={handleClose} size="large" style={{ borderRadius: 6 }}>Hủy</Button>
                                <Button type="primary" htmlType="submit" size="large" loading={loading} disabled={!currentSchedule} style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', borderRadius: 6, fontWeight: 'bold' }}>
                                    Xác nhận Đặt Tour
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