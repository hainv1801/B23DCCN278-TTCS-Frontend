import { callFetchDestination } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { IDestination } from '@/types/backend';
import { Card, Col, Divider, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss'; // Lưu ý cập nhật CSS trong file này nếu cần

interface IProps {
    showPagination?: boolean;
}

const DestinationCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayDestination, setDisplayDestination] = useState<IDestination[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchDestination();
    }, [current, pageSize, filter, sortQuery]);

    const fetchDestination = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchDestination(query);
        if (res && res.data) {
            setDisplayDestination(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailDestination = (item: IDestination) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/destination/${slug}?id=${item.id}`)
        }
    }

    return (
        <div className={`${styles["company-section"]}`}>
            {/* Nếu bạn đổi tên class trong file scss thì nhớ update lại tên class ở đây nhé */}
            <div className={styles["company-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>Các Điểm Đến Phổ Biến</span>
                                {!showPagination &&
                                    <Link to="/destination">Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {displayDestination?.map(item => {
                            return (
                                <Col span={24} md={6} key={item.id}>
                                    <Card
                                        onClick={() => handleViewDetailDestination(item)}
                                        style={{ height: 350 }}
                                        hoverable
                                        cover={
                                            <div className={styles["card-customize"]} >
                                                <img
                                                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                                    alt={item.name}
                                                    // Cập nhật thư mục lấy ảnh thành "destination" và biến là item.image
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/destination/${item?.image}`}
                                                />
                                            </div>
                                        }
                                    >
                                        <Divider style={{ margin: "12px 0" }} />
                                        <h3 style={{ textAlign: "center", fontSize: "16px", color: "#333" }}>{item.name}</h3>
                                        <p style={{ textAlign: "center", color: "#888", fontSize: "13px" }}>
                                            {item.location}
                                        </p>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayDestination || displayDestination && displayDestination.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Chưa có điểm đến nào" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default DestinationCard;