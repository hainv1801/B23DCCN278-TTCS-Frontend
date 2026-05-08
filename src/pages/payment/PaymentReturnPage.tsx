import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Card, Typography, Divider } from 'antd';
import { callVerifyVNPay } from '@/config/api';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const PaymentReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Lấy chuỗi query param trên thanh URL (ví dụ: vnp_Amount=...&vnp_ResponseCode=00...)
                const queryString = searchParams.toString();
                const res = await callVerifyVNPay(queryString);

                // vnp_ResponseCode = '00' nghĩa là giao dịch thành công
                if (searchParams.get('vnp_ResponseCode') === '00' && res?.data?.status === 'SUCCESS') {
                    setStatus('success');
                    setPaymentData(res.data);
                } else {
                    setStatus('error');
                }
            } catch (err) {
                setStatus('error');
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Đang xử lý kết quả thanh toán..." />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', padding: 20 }}>
            <Card style={{ width: '100%', maxWidth: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Result
                    status={status}
                    title={status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
                    subTitle={
                        status === 'success'
                            ? 'Cảm ơn bạn đã sử dụng dịch vụ. Đơn hàng của bạn đã được ghi nhận.'
                            : 'Giao dịch bị hủy hoặc có lỗi xảy ra. Vui lòng thử lại.'
                    }
                    extra={[
                        <Button type="primary" key="history" onClick={() => navigate('/')} size="large">
                            Xem lịch sử đơn hàng
                        </Button>,
                        <Button key="home" onClick={() => navigate('/')} size="large">
                            Về trang chủ
                        </Button>,
                    ]}
                />

                {status === 'success' && paymentData && (
                    <>
                        <Divider dashed />
                        <div style={{ padding: '0 20px' }}>
                            <Title level={5}>Chi tiết giao dịch</Title>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Mã giao dịch:</Text>
                                <Text strong>{paymentData.transactionCode}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Ngân hàng:</Text>
                                <Text strong>{paymentData.bankCode}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Thời gian:</Text>
                                <Text strong>{dayjs(paymentData.paymentDate).format('DD/MM/YYYY HH:mm:ss')}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Tổng tiền:</Text>
                                <Text strong style={{ color: '#cf1322', fontSize: 16 }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentData.amount)}
                                </Text>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default PaymentReturnPage;