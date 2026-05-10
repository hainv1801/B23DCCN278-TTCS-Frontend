import { Breadcrumb, Col, ConfigProvider, Divider, Form, Row, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { useState, useEffect } from 'react';
import { callCreateTourSchedule, callFetchTour, callFetchTourScheduleById, callFetchAvailableGuides, callUpdateTourSchedule } from "@/config/api";
import enUS from 'antd/lib/locale/en_US';
import dayjs from 'dayjs';
import { ITourSchedule } from "@/types/backend";

interface ITourSelect {
    label: string;
    value: string;
    key?: string;
    basePrice?: number; // Thêm trường basePrice để lấy giá gốc
}

const ViewUpsertTourSchedule = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState<ITourSelect[]>([]);
    const [availableGuides, setAvailableGuides] = useState<{ label: string, value: number }[]>([]);
    const [loadingGuides, setLoadingGuides] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id");
    const [dataUpdate, setDataUpdate] = useState<ITourSchedule | null>(null);
    const [form] = Form.useForm();

    const departureDate = Form.useWatch('departureDate', form);
    const returnDate = Form.useWatch('returnDate', form);

    useEffect(() => {
        const init = async () => {
            if (id) {
                const res = await callFetchTourScheduleById(+id);
                if (res && res.data) {
                    console.log("Tour", res.data);
                    setDataUpdate(res.data);
                    if (res.data.tourInfo) {
                        setTours([{
                            label: res.data.tourInfo.name,
                            value: res.data.tourInfo.id?.toString() as string,
                        }]);
                    }

                    form.setFieldsValue({
                        ...res.data,
                        tour: res.data.tourInfo ? {
                            label: res.data.tourInfo.name,
                            value: res.data.tourInfo.id?.toString(),
                        } : undefined,
                        departureDate: res.data.departureDate ? dayjs(res.data.departureDate) : null,
                        returnDate: res.data.returnDate ? dayjs(res.data.returnDate) : null,
                        guide: res.data.guideInfo ? res.data.guideInfo.id : undefined
                    });
                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id]);

    useEffect(() => {
        const fetchGuides = async () => {
            if (departureDate && returnDate && dayjs(departureDate).isBefore(dayjs(returnDate).add(1, 'day'))) {
                setLoadingGuides(true);
                try {
                    const start = dayjs(departureDate).format('YYYY-MM-DD');
                    const end = dayjs(returnDate).format('YYYY-MM-DD');
                    const res = await callFetchAvailableGuides(start, end);

                    if (res && res.data) {
                        let guideOptions = res.data.map((item: any) => ({
                            label: `${item.name} (${item.email})`,
                            value: item.id
                        }));

                        if (dataUpdate?.guideInfo) {
                            const isExist = guideOptions.find((g: any) => g.value === dataUpdate.guideInfo?.id);
                            if (!isExist) {
                                guideOptions.unshift({
                                    label: `${dataUpdate.guideInfo.name} (${dataUpdate.guideInfo.email}) - Đang đảm nhiệm`,
                                    value: dataUpdate.guideInfo.id
                                });
                            }
                        }

                        setAvailableGuides(guideOptions);

                        const currentGuideId = form.getFieldValue('guide');
                        if (currentGuideId && !dataUpdate) {
                            const isStillAvailable = guideOptions.find((g: any) => g.value === currentGuideId);
                            if (!isStillAvailable) {
                                form.setFieldValue('guide', undefined);
                                message.info("Hướng dẫn viên đã chọn không rảnh trong khoảng thời gian này.");
                            }
                        }
                    }
                } catch (error) {
                    console.error("Lỗi khi tải danh sách HDV: ", error);
                }
                setLoadingGuides(false);
            } else {
                setAvailableGuides([]);
            }
        };

        fetchGuides();
    }, [departureDate, returnDate, dataUpdate, form]);

    async function fetchTourList(name: string): Promise<ITourSelect[]> {
        const res = await callFetchTour(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            console.log("Tour", res.data);
            return res.data.result.map(item => ({
                label: item.name as string,
                value: item.id?.toString() as string,
                basePrice: item.basePrice
            }));
        } else return [];
    }

    // Tự động điền giá trị dự kiến khi chọn Tour
    const handleTourChange = (newValue: any) => {
        setTours(newValue);
        if (newValue && newValue.length > 0 && !dataUpdate) {
            const selectedTour = newValue[0];
            if (selectedTour.basePrice) {
                form.setFieldsValue({
                    priceAdult: selectedTour.basePrice,
                    priceChild: selectedTour.basePrice * 0.7 // Giả định trẻ em 70% giá
                });
            }
        }
    };

    const onFinish = async (values: any) => {
        const payload: any = {
            ...values,
            tour: { id: +values.tour.value },
            departureDate: dayjs(values.departureDate).format('YYYY-MM-DD'),
            returnDate: dayjs(values.returnDate).format('YYYY-MM-DD'),
            bookedSeats: dataUpdate?.bookedSeats || 0,
            guide: values.guide ? { id: values.guide } : null
        };

        if (dataUpdate?.id) {
            payload.id = dataUpdate.id;
            const res = await callUpdateTourSchedule(payload);
            if (res.data) {
                message.success("Cập nhật lịch trình thành công");
                navigate('/admin/tour-schedule');
            } else {
                notification.error({ message: 'Có lỗi xảy ra', description: res.message });
            }
        } else {
            const res = await callCreateTourSchedule(payload);
            if (res.data) {
                message.success("Tạo mới lịch trình thành công");
                navigate('/admin/tour-schedule');
            } else {
                notification.error({ message: 'Có lỗi xảy ra', description: res.message });
            }
        }
    }

    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        { title: <Link to="/admin/tour-schedule">Lịch trình Tour</Link> },
                        { title: dataUpdate?.id ? 'Cập nhật lịch trình' : 'Thêm mới lịch trình' },
                    ]}
                />
            </div>
            <div>
                <ConfigProvider locale={enUS}>
                    <ProForm
                        form={form}
                        onFinish={onFinish}
                        submitter={{
                            searchConfig: { resetText: "Hủy", submitText: <>{dataUpdate?.id ? "Cập nhật" : "Tạo mới"}</> },
                            onReset: () => navigate('/admin/tour-schedule'),
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                        }}
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={12}>
                                <ProForm.Item name="tour" label="Chọn Tour" rules={[{ required: true, message: 'Vui lòng chọn tour!' }]}>
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        // defaultValue={tours}
                                        // value={tours}
                                        placeholder="Gõ tên tour để tìm kiếm..."
                                        fetchOptions={fetchTourList}
                                        onChange={handleTourChange}
                                        style={{ width: '100%' }}
                                    />
                                </ProForm.Item>
                            </Col>

                            <Col span={24} md={12}>
                                <ProFormSelect
                                    name="guide"
                                    label="Phân công Hướng dẫn viên"
                                    placeholder={(!departureDate || !returnDate) ? "Chọn ngày hợp lệ để xem HDV rảnh..." : "-- Chọn hướng dẫn viên --"}
                                    disabled={!departureDate || !returnDate}
                                    options={availableGuides}
                                    fieldProps={{ loading: loadingGuides, showSearch: true, optionFilterProp: "label" }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="status"
                                    label="Trạng thái lịch trình"
                                    options={[
                                        { label: 'Đang mở (OPEN)', value: 'OPEN' },
                                        { label: 'Đã đóng (CLOSED)', value: 'CLOSED' },
                                        { label: 'Đã hủy (CANCELLED)', value: 'CANCELLED' },
                                    ]}
                                    initialValue={'OPEN'}
                                    rules={[{ required: true }]}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDigit label="Tổng số chỗ (Capacity)" name="capacity" min={1} rules={[{ required: true }]} placeholder="Ví dụ: 30" />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày khởi hành"
                                    name="departureDate"
                                    rules={[{ required: true }]}
                                    fieldProps={{ style: { width: '100%' } }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày trở về"
                                    name="returnDate"
                                    dependencies={['departureDate']}
                                    rules={[
                                        { required: true },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || !getFieldValue('departureDate')) return Promise.resolve();
                                                if (value.isBefore(getFieldValue('departureDate'))) {
                                                    return Promise.reject(new Error('Ngày về phải sau ngày đi!'));
                                                }
                                                return Promise.resolve();
                                            },
                                        }),
                                    ]}
                                    fieldProps={{ style: { width: '100%' } }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Giá người lớn"
                                    name="priceAdult"
                                    rules={[{ required: true }]}
                                    fieldProps={{ addonAfter: " VNĐ", formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), parser: (v) => +(v || '').replace(/\$\s?|(,*)/g, '') }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Giá trẻ em"
                                    name="priceChild"
                                    rules={[{ required: true }]}
                                    fieldProps={{ addonAfter: " VNĐ", formatter: (v: any) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), parser: (v) => +(v || '').replace(/\$\s?|(,*)/g, '') }}
                                />
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>
            </div>
        </div>
    )
}

export default ViewUpsertTourSchedule;