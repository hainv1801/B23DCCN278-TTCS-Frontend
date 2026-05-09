import { callFetchTour } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ITour } from '@/types/backend';
import { EnvironmentOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { sfIn } from "spring-filter-query-builder";
import { useTranslation } from 'react-i18next';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
dayjs.extend(relativeTime);

interface IProps {
    showPagination?: boolean;
}

const TourCard = (props: IProps) => {
    const { showPagination = false } = props;
    const { t } = useTranslation();
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
        <div className={styles["section-container"]}>
            <Spin spinning={isLoading} tip={t('common.loading', 'Loading...')}>
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            {/* Áp dụng class section-heading cho tiêu đề */}
                            <h2 className={styles["section-heading"]}>{t('tour.title')}</h2>

                            {!showPagination &&
                                <Link to="/tour" style={{ color: '#1890ff', fontWeight: 600 }}>
                                    {t('tour.view', 'Xem tất cả')} &rarr;
                                </Link>
                            }
                        </div>
                    </Col>

                    {displayTour?.map(item => {
                        return (
                            <Col span={24} md={12} lg={8} key={item.id}>
                                <div
                                    className={styles['tour-card']}
                                    onClick={() => handleViewDetailTour(item)}
                                >
                                    {/* 1. Phần hình ảnh */}
                                    <div className={styles['tour-image']}>
                                        <img
                                            alt={item.name}
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/destination/${item?.destination?.image}`}
                                            onError={(e) => {
                                                e.currentTarget.src = '/fallback-image.jpg';
                                            }}
                                        />
                                        {/* Tag HOT nổi bật góc phải */}
                                        <span className={styles['tour-badge']}>
                                            <FireOutlined /> HOT
                                        </span>
                                    </div>

                                    {/* 2. Phần nội dung */}
                                    <div className={styles['tour-content']}>
                                        <h3 className={styles['tour-title']}>{item.name}</h3>

                                        <div className={styles['tour-info']}>
                                            <EnvironmentOutlined style={{ color: '#58aaab' }} />
                                            <span>{item?.destination?.name} ({item?.destination?.location})</span>
                                        </div>

                                        <div className={styles['tour-info']}>
                                            <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                            <span>{item.duration} Ngày</span>
                                        </div>

                                        {/* 3. Phần Footer (Giá tiền và Thời gian cập nhật) */}
                                        <div className={styles['tour-footer']}>
                                            <span className={styles['tour-price']}>
                                                {(item.basePrice + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                            </span>
                                            <span style={{ color: '#888', fontSize: '13px' }}>
                                                {item.updatedAt ? dayjs(item.updatedAt).locale('vi').fromNow() : dayjs(item.createdAt).locale('vi').fromNow()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        )
                    })}

                    {(!displayTour || displayTour && displayTour.length === 0)
                        && !isLoading &&
                        <Col span={24}>
                            <div className={styles["empty"]}>
                                <Empty description={t('tour.empty')} />
                            </div>
                        </Col>
                    }
                </Row>

                {showPagination && <>
                    <div style={{ marginTop: 40 }}></div>
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
    )
}

export default TourCard;