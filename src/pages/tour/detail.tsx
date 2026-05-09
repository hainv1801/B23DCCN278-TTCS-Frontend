import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ITour } from "@/types/backend";
import { callFetchTourById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { useTranslation } from 'react-i18next'; // Thêm đa ngôn ngữ

import { Col, Divider, Row, Skeleton, Tag, Card, Typography, Space, Button, Breadcrumb } from "antd";
import {
    EnvironmentOutlined,
    HistoryOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    CheckCircleOutlined,
    FireOutlined
} from "@ant-design/icons";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import BookingModal from "@/components/client/modal/booking.modal";

dayjs.extend(relativeTime);
const { Title, Text, Paragraph } = Typography;

const ClientTourDetailPage = (props: any) => {
    const { t } = useTranslation();
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
    }, [id]);

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: 60 }}>
            {/* HERO BANNER (Khu vực ảnh bìa siêu to khổng lồ) */}
            {tourDetail && !isLoading && (
                <div style={{
                    position: 'relative',
                    height: '500px',
                    width: '100%',
                    backgroundImage: `url(${import.meta.env.VITE_BACKEND_URL}/storage/destination/${tourDetail.destination?.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: 40
                }}>
                    {/* Lớp phủ đen mờ (Gradient Overlay) để làm nổi bật chữ */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '40px 10%' // Căn lề trái phải
                    }}>
                        {/* Breadcrumb điều hướng */}
                        <Breadcrumb
                            separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                            items={[
                                { title: <a href="/" style={{ color: '#fff' }}><HomeOutlined /></a> },
                                { title: <a href="/tour" style={{ color: '#fff' }}>{t('header.tour', 'Tour Du Lịch')}</a> },
                                { title: <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{tourDetail.name}</span> },
                            ]}
                        />

                        {/* Tiêu đề Tour */}
                        <div style={{ color: '#fff' }}>
                            <Space wrap style={{ marginBottom: 15 }}>
                                <Tag color="#ff4d4f" style={{ fontSize: 14, padding: '4px 10px', borderRadius: 20 }}>
                                    <FireOutlined /> HOT TOUR
                                </Tag>
                                {tourDetail?.categories?.map((item: any, index: number) => (
                                    <Tag key={`${index}-key`} color="processing" style={{ fontSize: 14, padding: '4px 10px', borderRadius: 20 }}>
                                        {item.name}
                                    </Tag>
                                ))}
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
                                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bordered={false}>
                                        <Title level={3} style={{ marginBottom: 20 }}>{t('tour.program')}</Title>
                                        <div style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                                            {/* Style mặc định cho các thẻ h, p bên trong bài viết HTML */}
                                            <Typography>
                                                {parse(tourDetail.description ?? "")}
                                            </Typography>
                                        </div>
                                    </Card>
                                </Col>

                                {/* CỘT PHẢI: KHỐI CTA ĐẶT TOUR */}
                                <Col span={24} lg={8}>
                                    <div style={{ position: 'sticky', top: 30 }}>
                                        {/* Thẻ giá và đặt nút đặt tour */}
                                        <Card
                                            style={{ borderRadius: 16, boxShadow: '0 12px 24px rgba(0,0,0,0.1)', border: '2px solid #1890ff' }}
                                            bordered={false}
                                        >
                                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                                <Text type="secondary" style={{ fontSize: 16 }}>{t('tour.startingPrice')}</Text>
                                                <Title level={2} style={{ color: '#d9363e', margin: '10px 0' }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tourDetail.basePrice || 0)}
                                                </Title>
                                                <Text strong type="success"><CheckCircleOutlined /> {t('tour.tax')}</Text>
                                            </div>

                                            <Button
                                                type="primary"
                                                size="large"
                                                block
                                                onClick={() => setIsModalOpen(true)}
                                                style={{
                                                    height: 56,
                                                    fontSize: 18,
                                                    fontWeight: 'bold',
                                                    borderRadius: 8,
                                                    background: 'linear-gradient(90deg, #ff4d4f 0%, #d9363e 100%)',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.4)'
                                                }}
                                            >
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