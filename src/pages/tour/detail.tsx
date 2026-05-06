import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ITour } from "@/types/backend";
import { callFetchTourById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag } from "antd";
import { EnvironmentOutlined, HistoryOutlined, WalletOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'; // Sử dụng tiếng Việt cho phần thời gian
import BookingModal from "@/components/client/modal/booking.modal"; // Bạn nhớ đổi tên file apply.modal thành booking.modal nhé

dayjs.extend(relativeTime);

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
                const res = await callFetchTourById(+id); // Ép kiểu id sang number nếu API cần
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
            {isLoading ?
                <Skeleton active />
                :
                <Row gutter={[20, 20]}>
                    {tourDetail && tourDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {tourDetail.name}
                                </div>
                                <div style={{ marginTop: 15 }}>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className={styles["btn-apply"]}
                                    >
                                        Đặt Tour Ngay
                                    </button>
                                </div>
                                <Divider />

                                {/* Phân loại tour (Thay cho Skills) */}
                                <div className={styles["skills"]}>
                                    {tourDetail?.categories?.map((item: any, index: number) => {
                                        return (
                                            <Tag key={`${index}-key`} color="blue" >
                                                {item.name}
                                            </Tag>
                                        )
                                    })}
                                </div>

                                {/* Giá cơ bản (Thay cho Salary) */}
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

                            {/* Cột bên phải hiển thị thông tin điểm đến */}
                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
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
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }

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