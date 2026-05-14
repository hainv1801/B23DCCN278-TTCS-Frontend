import { Button, Col, Form, Row, Select, notification } from 'antd';
import { EnvironmentOutlined, MonitorOutlined } from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllCategory } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SearchClient = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsCategories, setOptionsCategories] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryDestination = searchParams.get("destination");
            const queryCategories = searchParams.get("categories")
            if (queryDestination) {
                form.setFieldValue("location", queryDestination.split(","))
            }
            if (queryCategories) {
                form.setFieldValue("categories", queryCategories.split(","))
            }
        }
    }, [location.search])

    useEffect(() => {
        fetchCategory();
    }, [])

    const fetchCategory = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await callFetchAllCategory(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsCategories(arr);
        }
    }

    const onFinish = async (values: any) => {
        let query = "";
        if (values?.location?.length) {
            query = `destination=${values?.location?.join(",")}`;
        }
        if (values?.categories?.length) {
            query = values.location?.length ? query + `&categories=${values?.categories?.join(",")}`
                :
                `categories=${values?.categories?.join(",")}`;
        }

        if (!query) {
            notification.error({
                message: t('search.errorTitle', 'Có lỗi xảy ra'),
                description: t('search.errorDesc', 'Vui lòng chọn tiêu chí để search')
            });
            return;
        }
        navigate(`/tour?${query}`);
    }

    return (
        <ProForm
            form={form}
            onFinish={onFinish}
            submitter={
                {
                    render: () => <></>
                }
            }
        >
            <Row gutter={[20, 20]} align="middle">
                <Col span={24}><h2>{t('search.heading', 'Tour du lịch vip nhất quả đất')}</h2></Col>

                {/* Thanh Danh mục: Chiếm 10/24 */}
                <Col span={24} md={10}>
                    <ProForm.Item
                        name="categories"
                        style={{ marginBottom: 0 }}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={
                                <>
                                    <MonitorOutlined /> {t('search.categoryPlaceholder', 'Tìm theo danh mục...')}
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsCategories}
                        />
                    </ProForm.Item>
                </Col>

                {/* Thanh Địa điểm: Chiếm 10/24 */}
                <Col span={24} md={10}>
                    <ProForm.Item
                        name="location"
                        style={{ marginBottom: 0 }}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={
                                <>
                                    <EnvironmentOutlined /> {t('search.locationPlaceholder', 'Địa điểm...')}
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsLocations}
                        />
                    </ProForm.Item>
                </Col>

                {/* Nút Search: Chiếm 4/24 */}
                <Col span={24} md={4}>
                    <Button
                        type='primary'
                        style={{ width: '100%' }}
                        onClick={() => form.submit()}
                    >
                        {t('search.button', 'Search')}
                    </Button>
                </Col>
            </Row>
        </ProForm>
    )
}
export default SearchClient;