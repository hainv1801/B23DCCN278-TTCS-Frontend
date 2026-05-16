import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, message, Spin, Result, Button } from 'antd';
import {
    DollarCircleOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    FlagOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { callFetchDashboardStats, callFetchRevenueChart } from '../../config/api';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
const AdminDashboard = () => {
    const user = useAppSelector(state => state.account.user);

    // 2. Lấy tên Role của user (Thay đổi đường dẫn user?.role?.name tùy thuộc vào cấu trúc JSON backend của bạn trả về)
    const roleName = user?.role?.name;

    // 3. Logic chặn quyền: Nếu không phải Admin (hoặc Super Admin) thì chặn lại
    if (roleName !== 'ADMIN') {
        return (
            <Result
                status="403"
                title="403 - Truy cập bị từ chối"
                subTitle="Xin lỗi, chỉ có tài khoản Quản trị viên (Admin) mới có thể xem các số liệu thống kê này."
                extra={
                    <Button type="primary">
                        <Link to="/">Về trang chủ</Link>
                    </Button>
                }
            />
        );
    }
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalUsers: 0,
        totalTours: 0
    });
    const [chartData, setChartData] = useState([]);
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [statsRes, chartRes] = await Promise.all([
                    callFetchDashboardStats(),
                    callFetchRevenueChart()
                ]);

                if (statsRes && statsRes.data) {
                    setStats(statsRes.data);
                }
                if (chartRes && chartRes.data) {
                    setChartData(chartRes.data);
                }
            } catch (error) {
                message.error("Lỗi khi tải dữ liệu thống kê!");
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    // Format tiền tệ VNĐ chuẩn xác
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '24px' }}>Tổng quan hệ thống</h2>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Tổng Doanh Thu"
                            value={stats.totalRevenue}
                            formatter={(value) => formatter.format(Number(value))}
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                            prefix={<DollarCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Tổng Đơn Đặt Tour"
                            value={stats.totalBookings}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Tổng Số Khách Hàng"
                            value={stats.totalUsers}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Tour Đang Hoạt Động"
                            value={stats.totalTours}
                            valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                            prefix={<FlagOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
            <div style={{ marginTop: '40px' }}>
                <Card
                    title={`Biểu đồ doanh thu năm ${new Date().getFullYear()}`}
                    bordered={false}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                    {/* Bọc trong ResponsiveContainer để biểu đồ tự co giãn theo màn hình */}
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis
                                tickFormatter={(value) =>
                                    new Intl.NumberFormat('vi-VN', {
                                        notation: "compact",
                                        compactDisplay: "short"
                                    }).format(value)
                                }
                            />
                            {/* Tooltip hiển thị khi đưa chuột vào cột */}
                            <Tooltip
                                formatter={(value: string | number | undefined | any) => [
                                    formatter.format(Number(value || 0)),
                                    'Doanh thu'
                                ]}
                                cursor={{ fill: '#f5f5f5' }}
                            />
                            <Legend />
                            {/* Cột hiển thị số liệu */}
                            <Bar dataKey="total" name="Doanh thu (VNĐ)" fill="#1890ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;