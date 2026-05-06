import { Breadcrumb, Col, ConfigProvider, Divider, Form, Row, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { useState, useEffect } from 'react';
import { callCreateTourSchedule, callFetchTour, callFetchTourScheduleById, callUpdateTourSchedule } from "@/config/api";
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import dayjs from 'dayjs';
import { ITourSchedule } from "@/types/backend";

interface ITourSelect {
    label: string;
    value: string;
    key?: string;
}

const ViewUpsertTourSchedule = (props: any) => {
    const navigate = useNavigate();
    const [tours, setTours] = useState<ITourSelect[]>([]);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // schedule id
    const [dataUpdate, setDataUpdate] = useState<ITourSchedule | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const init = async () => {
            if (id) {
                const res = await callFetchTourScheduleById(+id);
                if (res && res.data) {
                    setDataUpdate(res.data);

                    // Khởi tạo Tour đã chọn trong dropdown
                    if (res.data.tour) {
                        setTours([{
                            label: res.data.tour.name,
                            value: res.data.tour.id?.toString() as string,
                        }]);
                    }

                    // Đổ dữ liệu vào form và convert ngày sang định dạng dayjs
                    form.setFieldsValue({
                        ...res.data,
                        tour: res.data.tour ? {
                            label: res.data.tour.name,
                            value: res.data.tour.id?.toString(),
                        } : undefined,
                        departureDate: res.data.departureDate ? dayjs(res.data.departureDate) : null,
                        returnDate: res.data.returnDate ? dayjs(res.data.returnDate) : null,
                    });
                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id]);

    // Tìm kiếm Tour để gắn lịch trình
    async function fetchTourList(name: string): Promise<ITourSelect[]> {
        const res = await callFetchTour(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            return res.data.result.map(item => ({
                label: item.name as string,
                value: item.id?.toString() as string
            }));
        } else return [];
    }

    const onFinish = async (values: any) => {
        const payload: any = {
            ...values,
            tour: { id: +values.tour.value },
            // Format ngày về chuỗi YYYY-MM-DD để khớp với LocalDate của Java
            departureDate: dayjs(values.departureDate).format('YYYY-MM-DD'),
            returnDate: dayjs(values.returnDate).format('YYYY-MM-DD'),
            bookedSeats: dataUpdate?.bookedSeats || 0 // Giữ nguyên số chỗ đã đặt nếu là update
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
                            searchConfig: {
                                resetText: "Hủy",
                                submitText: <>{dataUpdate?.id ? "Cập nhật" : "Tạo mới"}</>
                            },
                            onReset: () => navigate('/admin/tour-schedule'),
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                        }}
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={12}>
                                <ProForm.Item
                                    name="tour"
                                    label="Chọn Tour"
                                    rules={[{ required: true, message: 'Vui lòng chọn tour!' }]}
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        defaultValue={tours}
                                        value={tours}
                                        placeholder="Gõ tên tour để tìm kiếm..."
                                        fetchOptions={fetchTourList}
                                        onChange={(newValue: any) => setTours(newValue)}
                                        style={{ width: '100%' }}
                                    />
                                </ProForm.Item>
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
                                <ProFormDigit
                                    label="Tổng số chỗ (Capacity)"
                                    name="capacity"
                                    min={1}
                                    rules={[{ required: true }]}
                                    placeholder="Ví dụ: 30"
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày khởi hành"
                                    name="departureDate"
                                    rules={[{ required: true }]}
                                    fieldProps={{
                                        style: { width: '100%' }
                                    }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày trở về"
                                    name="returnDate"
                                    rules={[{ required: true }]}
                                    fieldProps={{
                                        style: { width: '100%' }
                                    }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Giá người lớn"
                                    name="priceAdult"
                                    rules={[{ required: true }]}
                                    fieldProps={{
                                        addonAfter: " VNĐ",
                                        formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                    }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Giá trẻ em"
                                    name="priceChild"
                                    rules={[{ required: true }]}
                                    fieldProps={{
                                        addonAfter: " VNĐ",
                                        formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                    }}
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