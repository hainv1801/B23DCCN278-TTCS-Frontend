import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IDestination } from "@/types/backend";
import { callFetchDestinationById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

const ClientDestinationDetailPage = (props: any) => {
    const [destinationDetail, setDestinationDetail] = useState<IDestination | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // destination id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchDestinationById(+id);
                if (res?.data) {
                    setDestinationDetail(res.data)
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
                    {destinationDetail && destinationDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {destinationDetail.name}
                                </div>

                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{(destinationDetail?.location)}
                                </div>

                                <Divider />
                                <div className={styles["description"]}>
                                    {/* Sử dụng html-react-parser để render HTML từ ReactQuill */}
                                    {parse(destinationDetail?.description ?? "")}
                                </div>
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
                                        <img
                                            style={{ width: '100%', objectFit: 'cover' }}
                                            alt={destinationDetail?.name}
                                            // Đổi đường dẫn thư mục thành /storage/destination/ và trường image
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/destination/${destinationDetail?.image}`}
                                        />
                                    </div>
                                    <div style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', fontSize: '18px' }}>
                                        {destinationDetail?.name}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
        </div>
    )
}
export default ClientDestinationDetailPage;