import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ITour } from "@/types/backend";
import { callFetchTourById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';

// BỔ SUNG IMPORTS: Card, Typography, Space, Button từ antd
import { Col, Divider, Row, Skeleton, Tag, Card, Typography, Space, Button } from "antd";
// BỔ SUNG ICONS
import { EnvironmentOutlined, HistoryOutlined, WalletOutlined, ClockCircleOutlined } from "@ant-design/icons";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'; // Sử dụng tiếng Việt cho phần thời gian
import BookingModal from "@/components/client/modal/booking.modal";

dayjs.extend(relativeTime);
const { Title, Text } = Typography; // Destructuring lấy Title và Text để dùng cho đẹp

const ClientTourDetailPage = (props: any) => {
    const [tourDetail, setTourDetail] = useState<ITour | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // tour id

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
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ? (
                <Skeleton active />
            ) : (
                <Row gutter={[30, 20]}>
                    {tourDetail && tourDetail.id && (
                        <>
                            {/* CỘT TRÁI: CHI TIẾT TOUR */}
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {tourDetail.name}
                                </div>

                                {/* ĐÃ XÓA NÚT BUTTON ĐẶT TOUR CŨ Ở ĐÂY ĐỂ CHUYỂN SANG CỘT PHẢI */}
                                <Divider />

                                {/* Phân loại tour */}
                                <div className={styles["skills"]}>
                                    {tourDetail?.categories?.map((item: any, index: number) => {
                                        return (
                                            <Tag key={`${index}-key`} color="blue" >
                                                {item.name}
                                            </Tag>
                                        )
                                    })}
                                </div>

                                {/* Giá cơ bản */}
                                <div className={styles["salary"]} style={{ marginTop: 15 }}>
                                    <WalletOutlined style={{ color: '#d9363e' }} />
                                    <span style={{ color: '#d9363e', fontWeight: 'bold' }}>
                                        &nbsp;{(tourDetail.basePrice + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VNĐ
                                    </span>
                                </div>

                                {/* Thời gian đi */}
                                <div className={styles["location"]} style={{ marginTop: 10 }}>
                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />&nbsp;{tourDetail.duration} Ngày
                                </div>

                                {/* Địa điểm */}
                                <div className={styles["location"]} style={{ marginTop: 10 }}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{tourDetail.destination?.name} ({tourDetail.destination?.location})
                                </div>

                                {/* Thời gian cập nhật */}
                                <div style={{ marginTop: 10, color: '#888' }}>
                                    <HistoryOutlined /> Cập nhật {tourDetail.updatedAt ? dayjs(tourDetail.updatedAt).locale("vi").fromNow() : dayjs(tourDetail.createdAt).locale("vi").fromNow()}
                                </div>

                                <Divider />

                                {/* Chi tiết chương trình tour */}
                                <div className={styles["description"]}>
                                    {parse(tourDetail.description ?? "")}
                                </div>
                            </Col>

                            {/* CỘT PHẢI: KHỐI CTA ĐẶT TOUR VÀ ĐIỂM ĐẾN */}
                            <Col span={24} md={8}>
                                {/* Bao bọc bằng div sticky để cuộn theo màn hình */}
                                <div style={{ position: 'sticky', top: 20 }}>

                                    {/* 1. KHỐI NÚT ĐẶT TOUR NỔI BẬT */}
                                    <Card
                                        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: 20 }}
                                        bordered={false}
                                    >
                                        <Text type="secondary">Giá tham khảo chỉ từ</Text>
                                        <Title level={2} style={{ color: '#cf1322', marginTop: 4, marginBottom: 16 }}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tourDetail.basePrice || 0)}
                                        </Title>

                                        <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
                                            <Space>
                                                <ClockCircleOutlined style={{ color: '#1677ff' }} />
                                                <Text>Thời gian: <Text strong>{tourDetail.duration} ngày</Text></Text>
                                            </Space>
                                            <Space>
                                                <EnvironmentOutlined style={{ color: '#1677ff' }} />
                                                <Text>Khám phá: <Text strong>{tourDetail.destination?.name}</Text></Text>
                                            </Space>
                                        </Space>

                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            onClick={() => setIsModalOpen(true)}
                                            style={{
                                                height: 50,
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                                backgroundColor: '#ff4d4f',
                                                borderColor: '#ff4d4f'
                                            }}
                                        >
                                            ĐẶT TOUR NGAY
                                        </Button>
                                    </Card>

                                    {/* 2. KHỐI ẢNH ĐIỂM ĐẾN */}
                                    <div className={styles["company"]} style={{ padding: 15, backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <div style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
                                            <img
                                                style={{ width: '100%', objectFit: 'cover' }}
                                                alt={tourDetail.destination?.name}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/destination/${tourDetail.destination?.image}`}
                                            />
                                        </div>
                                        <div style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', fontSize: '18px' }}>
                                            {tourDetail.destination?.name}
                                        </div>
                                        <div style={{ textAlign: 'center', color: '#888', marginTop: 5 }}>
                                            {tourDetail.destination?.location}
                                        </div>
                                    </div>

                                </div>
                            </Col>
                        </>
                    )}
                </Row>
            )}

            {/* Modal đặt tour */}
            <BookingModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                tourDetail={tourDetail}
            />
        </div>
    )
}
export default ClientTourDetailPage;