// ==================================================
// FILE: ./src/pages/tour/detail.tsx
// ==================================================
import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ITour, ITourSchedule } from "@/types/backend"; // Bổ sung import ITourSchedule
import { callFetchTourById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { useTranslation } from 'react-i18next';

// Thêm đa ngôn ngữ
import TourComment from "@/components/client/card/TourComment";
import { Col, Divider, Row, Skeleton, Tag, Card, Typography, Space, Button, Breadcrumb, Table, Empty } from "antd"; // Bổ sung Table, Empty
import { EnvironmentOutlined, HistoryOutlined, ClockCircleOutlined, HomeOutlined, CheckCircleOutlined, FireOutlined, CalendarOutlined } from "@ant-design/icons"; // Bổ sung CalendarOutlined
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import BookingModal from "@/components/client/modal/booking.modal";

dayjs.extend(relativeTime);
const { Title, Text, Paragraph } = Typography;

const ClientTourDetailPage = (props: any) => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const [tourDetail, setTourDetail] = useState<ITour | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id");

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchTourById(+id);
                if (res?.data) {
                    setTourDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id, i18n.language]);

    // Lọc ra các lịch trình đang mở (OPEN) và ngày khởi hành ở thì tương lai
    const upcomingSchedules = tourDetail?.tourSchedules?.filter(
        item => item.status === 'OPEN' && dayjs(item.departureDate).isAfter(dayjs(), 'day')
    )?.sort((a, b) => dayjs(a.departureDate).diff(dayjs(b.departureDate))) || [];

    // Cột hiển thị bảng lịch trình
    const columns = [
        {
            title: t('booking.departureTime'),
            dataIndex: 'departureDate',
            key: 'departureDate',
            render: (date: string) => (
                <span style={{ fontWeight: 600, color: '#1ee0ac' }}>
                    <CalendarOutlined style={{ marginRight: 5 }} />
                    {dayjs(date).format('DD/MM/YYYY')}
                </span>
            ),
        },
        {
            title: t('booking.returnTime'),
            dataIndex: 'returnDate',
            key: 'returnDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: t('booking.price'),
            dataIndex: 'priceAdult',
            key: 'priceAdult',
            render: (price: number) => (
                <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
                    {`${price}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                </span>
            ),
        },
        {
            title: t('booking.status'),
            key: 'availableSeats',
            render: (_: any, record: ITourSchedule) => {
                const left = record.capacity - record.bookedSeats;
                return (
                    <Tag color={left > 0 ? "green" : "red"}>
                        {left > 0 ? t('booking.available') + ` ${left} ` + t('booking.slot') : 'Hết chỗ'}
                    </Tag>
                );
            },
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: ITourSchedule) => {
                const isAvailable = (record.capacity - record.bookedSeats) > 0;
                return (
                    <Button
                        type="primary"
                        danger
                        disabled={!isAvailable}
                        onClick={() => setIsModalOpen(true)}
                        size="small"
                        style={{ borderRadius: 4 }}
                    >
                        {t('tour.booking')}
                    </Button>
                );
            },
        },
    ];
    console.log("Detail", tourDetail);
    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: 60 }}>
            {/* HERO BANNER (Khu vực ảnh bìa siêu to khổng lồ) */}
            {tourDetail && !isLoading && (
                <div style={{ position: 'relative', height: '500px', width: '100%', backgroundImage: `url(${import.meta.env.VITE_BACKEND_URL}/storage/destination/${tourDetail.destination?.image})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 40 }}>
                    {/* Lớp phủ đen mờ (Gradient Overlay) để làm nổi bật chữ */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 10%' }}>
                        {/* Breadcrumb điều hướng */}
                        <Breadcrumb separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>} items={[
                            { title: <a href="/" style={{ color: '#fff' }}><HomeOutlined /></a> },
                            { title: <a href="/tour" style={{ color: '#fff' }}>{t('header.tour', 'Tour Du Lịch')}</a> },
                            { title: <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{tourDetail.name}</span> },
                        ]} />

                        {/* Tiêu đề Tour */}
                        <div style={{ color: '#fff' }}>
                            <Space wrap style={{ marginBottom: 15 }}>
                                <Tag color="#ff4d4f" style={{ fontSize: 14, padding: '4px 10px', borderRadius: 20 }}>
                                    <FireOutlined /> HOT TOUR
                                </Tag>
                                {/* Thể loại tour (Categories) đã được lấy và render sẵn tại đây */}
                                {tourDetail?.categories?.map((item: any, index: number) => {
                                    // Kiểm tra ngôn ngữ của Category
                                    const categoryName = currentLang === 'en' && item.nameEN ? item.nameEN : item.name;

                                    return (
                                        <Tag key={`${index}-key`} color="processing" style={{ fontSize: 14, padding: '4px 10px', borderRadius: 20 }}>
                                            {categoryName}
                                        </Tag>
                                    )
                                })}
                            </Space>
                            <Title style={{ color: '#fff', fontSize: '3rem', margin: 0, textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                                {tourDetail.name}
                            </Title>
                            <Space style={{ marginTop: 15, fontSize: 16, color: '#e0e0e0' }} split={<Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />}>
                                <span><EnvironmentOutlined /> {tourDetail.destination?.name}</span>
                                <span><ClockCircleOutlined /> {tourDetail.duration} {t('tour.days')}</span>
                            </Space>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles["container"]}>
                {isLoading ? (
                    <Card style={{ borderRadius: 16 }}><Skeleton active paragraph={{ rows: 10 }} /></Card>
                ) : (
                    <Row gutter={[40, 30]}>
                        {tourDetail && tourDetail.id && (
                            <>
                                {/* CỘT TRÁI: NỘI DUNG CHI TIẾT */}
                                <Col span={24} lg={16}>
                                    {/* Quick Info Bar */}
                                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 30 }} bordered={false}>
                                        <Row gutter={[20, 20]}>
                                            <Col span={12} md={8}>
                                                <Text type="secondary">{t('tour.duration')}</Text>
                                                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>{tourDetail.duration} {t('tour.days')}</Title>
                                            </Col>
                                            <Col span={12} md={8}>
                                                <Text type="secondary">{t('tour.destination')}</Text>
                                                <Title level={4} style={{ margin: 0, color: '#58aaab' }}>{tourDetail.destination?.name}</Title>
                                            </Col>
                                            <Col span={24} md={8}>
                                                <Text type="secondary">{t('tour.transportation')}</Text>
                                                <Title level={4} style={{ margin: 0 }}>{t('tour.car')}</Title>
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* Bài viết mô tả */}
                                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 30 }} bordered={false}>
                                        <Title level={3} style={{ marginBottom: 20 }}>{t('tour.description')}</Title>
                                        <div style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                                            {/* Style mặc định cho các thẻ h, p bên trong bài viết HTML */}
                                            <Typography>
                                                <div style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                                                    <Typography>
                                                        {parse((currentLang === 'en' && tourDetail.descriptionEN ? tourDetail.descriptionEN : tourDetail.description) ?? "")}
                                                    </Typography>
                                                </div>
                                            </Typography>
                                        </div>
                                    </Card>

                                    {/* BỔ SUNG: Bảng danh sách các lịch trình khởi hành */}
                                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bordered={false}>
                                        <Title level={3} style={{ marginBottom: 20 }}><CalendarOutlined /> {t('tour.program')}</Title>
                                        {upcomingSchedules.length > 0 ? (
                                            <Table
                                                columns={columns}
                                                dataSource={upcomingSchedules}
                                                rowKey="id"
                                                pagination={upcomingSchedules.length > 5 ? { pageSize: 5 } : false}
                                                scroll={{ x: true }}
                                            />
                                        ) : (
                                            <Empty description="Hiện tại chưa có lịch trình mới nào được mở cho tour này." />
                                        )}
                                    </Card>

                                    {/* Phần comment */}
                                    <TourComment tourId={tourDetail.id} />
                                </Col>

                                {/* CỘT PHẢI: KHỐI CTA ĐẶT TOUR */}
                                <Col span={24} lg={8}>
                                    <div style={{ position: 'sticky', top: 30 }}>
                                        {/* Thẻ giá và đặt nút đặt tour */}
                                        <Card style={{ borderRadius: 16, boxShadow: '0 12px 24px rgba(0,0,0,0.1)', border: '2px solid #1890ff' }} bordered={false} >
                                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                                <Text type="secondary" style={{ fontSize: 16 }}>{t('tour.startingPrice')}</Text>
                                                <Title level={2} style={{ color: '#d9363e', margin: '10px 0' }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tourDetail.basePrice || 0)}
                                                </Title>
                                                <Text strong type="success"><CheckCircleOutlined /> {t('tour.tax')}</Text>
                                            </div>
                                            <Button type="primary" size="large" block onClick={() => setIsModalOpen(true)} style={{ height: 56, fontSize: 18, fontWeight: 'bold', borderRadius: 8, background: 'linear-gradient(90deg, #ff4d4f 0%, #d9363e 100%)', border: 'none', boxShadow: '0 4px 12px rgba(255, 77, 79, 0.4)' }} >
                                                {t('tour.booking')}
                                            </Button>

                                            <Divider dashed />

                                            {/* Cam kết của dịch vụ */}
                                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                                <Text><CheckCircleOutlined style={{ color: '#52c41a' }} /> {t('tour.confirm')}</Text>
                                                <Text><CheckCircleOutlined style={{ color: '#52c41a' }} /> {t('tour.support')}</Text>
                                                <Text><CheckCircleOutlined style={{ color: '#52c41a' }} /> {t('tour.payment')}</Text>
                                            </Space>
                                        </Card>
                                    </div>
                                </Col>
                            </>
                        )}
                    </Row>
                )}
                <BookingModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    tourDetail={tourDetail}
                />
            </div>
        </div>
    )
}

export default ClientTourDetailPage;