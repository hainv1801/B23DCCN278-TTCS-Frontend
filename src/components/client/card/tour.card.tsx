import { callFetchTour } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ITour } from '@/types/backend';
import { EnvironmentOutlined, WalletOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { sfIn } from "spring-filter-query-builder";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'; // Import thêm locale tiếng Việt nếu muốn hiển thị "vài giây trước", "1 ngày trước"
dayjs.extend(relativeTime);


interface IProps {
    showPagination?: boolean;
}

const TourCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayTour, setDisplayTour] = useState<ITour[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    useEffect(() => {
        fetchTour();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchTour = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        // Xử lý bộ lọc tìm kiếm từ thanh URL (nếu có)
        const queryDestination = searchParams.get("destination");
        const queryCategories = searchParams.get("categories");

        if (queryDestination || queryCategories) {
            let q = "";
            if (queryDestination) {
                q = sfIn("destination.id", queryDestination.split(",")).toString();
            }

            if (queryCategories) {
                q = queryDestination ?
                    q + " and " + `${sfIn("categories.id", queryCategories.split(","))}`
                    : `${sfIn("categories.id", queryCategories.split(","))}`;
            }

            query += `&filter=${encodeURIComponent(q)}`;
        }

        const res = await callFetchTour(query);
        if (res && res.data) {
            setDisplayTour(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false);
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

    const handleViewDetailTour = (item: ITour) => {
        const slug = convertSlug(item.name);
        navigate(`/tour/${slug}?id=${item.id}`)
    }

    return (
        <div className={`${styles["card-tour-section"]}`}>
            {/* Giữ nguyên class CSS cũ để không vỡ layout */}
            <div className={`${styles["tour-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>Tour Du Lịch Mới Nhất</span>
                                {!showPagination &&
                                    <Link to="/tour">Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {displayTour?.map(item => {
                            return (
                                <Col span={24} md={12} key={item.id}>
                                    <Card size="small" title={null} hoverable
                                        onClick={() => handleViewDetailTour(item)}
                                    >
                                        <div className={styles["card-tour-content"]}>
                                            <div className={styles["card-tour-left"]}>
                                                <img
                                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }}
                                                    alt={item.name}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/destination/${item?.destination?.image}`}
                                                />
                                            </div>
                                            <div className={styles["card-tour-right"]}>
                                                <div className={styles["tour-title"]}>{item.name}</div>

                                                <div className={styles["tour-location"]}>
                                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />
                                                    &nbsp;{item?.destination?.name} ({item?.destination?.location})
                                                </div>

                                                <div style={{ margin: "4px 0" }}>
                                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                                    &nbsp;{item.duration} Ngày
                                                </div>

                                                <div>
                                                    <WalletOutlined style={{ color: '#d9363e' }} />
                                                    &nbsp;<strong style={{ color: '#d9363e' }}>{(item.basePrice + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VNĐ</strong>
                                                </div>

                                                <div className={styles["tour-updatedAt"]}>
                                                    {item.updatedAt ? dayjs(item.updatedAt).locale('vi').fromNow() : dayjs(item.createdAt).locale('vi').fromNow()}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayTour || displayTour && displayTour.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Chưa có tour nào" />
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

export default TourCard;