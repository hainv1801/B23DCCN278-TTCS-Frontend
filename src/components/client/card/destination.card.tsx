import { callFetchDestination } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { IDestination } from '@/types/backend';
import { Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { useTranslation } from 'react-i18next';
import { EnvironmentOutlined } from '@ant-design/icons';

interface IProps {
    showPagination?: boolean;
}

const DestinationCard = (props: IProps) => {
    const { showPagination = false } = props;
    const { t } = useTranslation();
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
        <div className={styles["section-container"]}>
            <Spin spinning={isLoading} tip={t('common.loading', 'Loading...')}>
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            {/* Áp dụng class section-heading cho tiêu đề */}
                            <h2 className={styles["section-heading"]}>
                                {t('destination.title', 'Địa Điểm Hot')}
                            </h2>
                            {!showPagination &&
                                <Link to="/destination" style={{ color: '#1890ff', fontWeight: 600 }}>
                                    {t('destination.view', 'Xem tất cả')} &rarr;
                                </Link>
                            }
                        </div>
                    </Col>

                    {displayDestination?.map(item => {
                        return (
                            <Col span={24} md={6} key={item.id}>
                                {/* Giao diện Card Địa điểm mới */}
                                <div
                                    className={styles['destination-card']}
                                    onClick={() => handleViewDetailDestination(item)}
                                >
                                    <img
                                        className={styles['dest-image']}
                                        alt={item.name}
                                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/destination/${item?.image}`}
                                        onError={(e) => {
                                            // Fallback ảnh lỗi nếu không tải được
                                            e.currentTarget.src = '/fallback-image.jpg';
                                        }}
                                    />
                                    <div className={styles['dest-overlay']}>
                                        <h3 className={styles['dest-title']}>{item.name}</h3>
                                        <span className={styles['dest-count']}>
                                            <EnvironmentOutlined style={{ marginRight: 5 }} />
                                            {item.location}
                                        </span>
                                    </div>
                                </div>
                            </Col>
                        )
                    })}

                    {(!displayDestination || displayDestination && displayDestination.length === 0)
                        && !isLoading &&
                        <Col span={24}>
                            <div className={styles["empty"]}>
                                <Empty description={t('destination.empty', 'Chưa có dữ liệu địa điểm')} />
                            </div>
                        </Col>
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
    )
}

export default DestinationCard;