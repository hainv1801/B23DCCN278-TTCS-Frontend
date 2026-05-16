import { callFetchTour } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ITour } from '@/types/backend';
import { EnvironmentOutlined, ClockCircleOutlined, FireOutlined, CalendarOutlined } from '@ant-design/icons';
import { Col, Empty, Pagination, Row, Spin, Tag } from 'antd';
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
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;

        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const queryDestination = searchParams.get("destination");
        const queryCategories = searchParams.get("categories");

        let filterArray: string[] = [];

        // 1. SỬA Ở ĐÂY: Thay "destination.id" thành "destination.location"
        if (queryDestination) {
            filterArray.push(sfIn("destination.name", queryDestination.split(",")).toString());
        }

        // 2. Categories thì giữ nguyên vì bên SearchClient bạn truyền ID
        if (queryCategories) {
            const categoryIds = queryCategories.split(",").map(id => Number(id));

            // Truyền mảng số vào sfIn
            filterArray.push(sfIn("categories.id", categoryIds).toString());
        }

        // Gộp tất cả các filter lại bằng chữ 'and'
        if (filterArray.length > 0) {
            const finalFilter = filterArray.join(" and ");
            // Encode URI để các ký tự đặc biệt (dấu cách, dấu phẩy) không làm gãy URL
            query += `&filter=${encodeURIComponent(finalFilter)}`;
        }

        const res = await callFetchTour(query);
        if (res && res.data) {
            setDisplayTour(res.data.result);
            setTotal(res.data.meta.total);
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
                            <h2 className={styles["section-heading"]}>{t('tour.title')}</h2>

                            {!showPagination &&
                                <Link to="/tour" style={{ color: '#1890ff', fontWeight: 600 }}>
                                    {t('tour.view', 'Xem tất cả')} &rarr;
                                </Link>
                            }
                        </div>
                    </Col>

                    {displayTour?.map(item => {
                        // 1. Logic lọc các lịch trình đang mở và chưa khởi hành
                        const upcomingSchedules = item.tourSchedules
                            ?.filter(s => s.status === 'OPEN' && dayjs(s.departureDate).isAfter(dayjs(), 'day'))
                            ?.sort((a, b) => dayjs(a.departureDate).diff(dayjs(b.departureDate)))
                            ?.slice(0, 3); // Lấy tối đa 3 ngày gần nhất để UI không bị tràn

                        return (
                            <Col span={24} md={12} lg={8} key={item.id}>
                                <div
                                    className={styles['tour-card']}
                                    onClick={() => handleViewDetailTour(item)}
                                >
                                    <div className={styles['tour-image']}>
                                        <img
                                            alt={item.name}
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/destination/${item?.destination?.image}`}
                                            onError={(e) => {
                                                e.currentTarget.src = '/fallback-image.jpg';
                                            }}
                                        />
                                        <span className={styles['tour-badge']}>
                                            <FireOutlined /> HOT
                                        </span>
                                    </div>

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

                                        {/* 2. Hiển thị Lịch khởi hành */}
                                        <div className={styles['tour-info']} style={{ marginTop: '8px', alignItems: 'flex-start' }}>
                                            <CalendarOutlined style={{ color: '#faad14', marginTop: '4px' }} />
                                            <div style={{ marginLeft: 6, display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {upcomingSchedules && upcomingSchedules.length > 0 ? (
                                                    upcomingSchedules.map((schedule, idx) => (
                                                        <Tag color="processing" key={idx} style={{ margin: 0 }}>
                                                            {dayjs(schedule.departureDate).format('DD/MM')}
                                                        </Tag>
                                                    ))
                                                ) : (
                                                    <span style={{ color: '#888', fontSize: '13px' }}>Đang cập nhật lịch</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles['tour-footer']}>
                                            <span className={styles['tour-price']}>
                                                {(item.basePrice + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                            </span>
                                            <span style={{ color: '#888', fontSize: '13px' }}>
                                                {item.updatedAt ?
                                                    dayjs(item.updatedAt).locale('vi').fromNow() : dayjs(item.createdAt).locale('vi').fromNow()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        )
                    })}

                    {(!displayTour || displayTour && displayTour.length === 0) && !isLoading &&
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