import { Breadcrumb, Col, ConfigProvider, Divider, Form, Row, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select"; // Giữ nguyên đường dẫn file của bạn
import { FooterToolbar, ProForm, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { useState, useEffect } from 'react';
import { callCreateTour, callFetchAllCategory, callFetchDestination, callFetchTourById, callUpdateTour } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import { ITour, ICategory } from "@/types/backend";

// Định nghĩa lại các Interface cho dropdown
interface ICategorySelect {
    label: string;
    value: string;
    key?: string;
}

interface IDestinationSelect {
    label: string;
    value: string;
    key?: string;
}

const ViewUpsertTour = (props: any) => {
    const [destinations, setDestinations] = useState<IDestinationSelect[]>([]);
    const [categories, setCategories] = useState<ICategorySelect[]>([]);

    const navigate = useNavigate();
    const [descriptionValue, setDescriptionValue] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // tour id
    const [dataUpdate, setDataUpdate] = useState<ITour | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const init = async () => {
            // Lấy danh sách Loại Tour (Category)
            const tempCategories = await fetchCategoryList();
            setCategories(tempCategories);

            // Nếu đang ở chế độ Chỉnh sửa (có ID)
            if (id) {
                const res = await callFetchTourById(id);
                if (res && res.data) {
                    setDataUpdate(res.data);
                    setDescriptionValue(res.data.description);

                    // Khởi tạo giá trị Điểm đến cho dropdown DebounceSelect
                    if (res.data.destination) {
                        setDestinations([{
                            label: res.data.destination.name,
                            value: res.data.destination.id?.toString() as string,
                            key: res.data.destination.id?.toString()
                        }]);
                    }

                    // Khởi tạo giá trị Các loại tour
                    const selectedCategories = res.data?.categories?.map((item: ICategory) => {
                        return {
                            label: item.name,
                            value: item.id?.toString(),
                            key: item.id?.toString()
                        }
                    });

                    // Đổ dữ liệu vào Form
                    form.setFieldsValue({
                        ...res.data,
                        destination: res.data.destination ? {
                            label: res.data.destination.name,
                            value: res.data.destination.id?.toString(),
                            key: res.data.destination.id?.toString()
                        } : undefined,
                        categories: selectedCategories
                    });
                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id]);

    // Tìm kiếm Điểm đến động (Debounce)
    async function fetchDestinationList(name: string): Promise<IDestinationSelect[]> {
        const res = await callFetchDestination(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            return res.data.result.map(item => ({
                label: item.name as string,
                value: item.id?.toString() as string
            }));
        } else return [];
    }

    // Lấy toàn bộ Loại tour
    async function fetchCategoryList(): Promise<ICategorySelect[]> {
        const res = await callFetchAllCategory(`page=1&size=100`);
        if (res && res.data) {
            return res.data.result.map(item => ({
                label: item.name as string,
                value: item.id?.toString() as string
            }));
        } else return [];
    }

    const onFinish = async (values: any) => {
        // Xử lý mảng Loại Tour: Chuyển từ mảng string/object sang mảng object [{id: 1}] để Spring Boot hiểu
        let arrCategories = [];
        if (values?.categories && typeof values?.categories[0] === 'object') {
            arrCategories = values.categories.map((item: any) => ({ id: +item.value }));
        } else if (values?.categories) {
            arrCategories = values.categories.map((item: any) => ({ id: +item }));
        }

        // Gom dữ liệu thành object ITour chuẩn
        const tourPayload: ITour = {
            name: values.name,
            basePrice: values.basePrice,
            duration: values.duration,
            description: descriptionValue,
            categories: arrCategories,
            destination: values.destination ? { id: +(values.destination.value) } as any : undefined,
            // active: values.active // Bỏ comment nếu Backend của bạn có trường trạng thái active
        };

        if (dataUpdate?.id) {
            // Cập nhật (Update)
            tourPayload.id = dataUpdate.id; // Gắn ID vào payload
            const res = await callUpdateTour(tourPayload);
            if (res.data) {
                message.success("Cập nhật Tour thành công");
                navigate('/admin/tour');
            } else {
                notification.error({ message: 'Có lỗi xảy ra', description: res.message });
            }
        } else {
            // Tạo mới (Create)
            const res = await callCreateTour(tourPayload);
            if (res.data) {
                message.success("Tạo mới Tour thành công");
                navigate('/admin/tour');
            } else {
                notification.error({ message: 'Có lỗi xảy ra', description: res.message });
            }
        }
    }

    return (
        <div className={styles["upsert-tour-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        { title: <Link to="/admin/tour">Quản lý Tour</Link> },
                        { title: dataUpdate?.id ? 'Cập nhật Tour' : 'Thêm mới Tour' },
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
                                submitText: <>{dataUpdate?.id ? "Cập nhật Tour" : "Tạo mới Tour"}</>
                            },
                            onReset: () => navigate('/admin/tour'),
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                            submitButtonProps: { icon: <CheckSquareOutlined /> },
                        }}
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={12}>
                                <ProFormText
                                    label="Tên Tour"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên tour!' }]}
                                    placeholder="Nhập tên tour (VD: Tour Đà Nẵng - Hội An 3N2Đ)"
                                />
                            </Col>

                            <Col span={24} md={12}>
                                <ProForm.Item
                                    name="destination"
                                    label="Điểm đến (Nơi khởi hành/tổ chức)"
                                    rules={[{ required: true, message: 'Vui lòng chọn điểm đến!' }]}
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        defaultValue={destinations}
                                        value={destinations}
                                        placeholder="Gõ để tìm kiếm điểm đến..."
                                        fetchOptions={fetchDestinationList}
                                        onChange={(newValue: any) => {
                                            if (newValue?.length === 0 || newValue?.length === 1) {
                                                setDestinations(newValue as IDestinationSelect[]);
                                            }
                                        }}
                                        style={{ width: '100%' }}
                                    />
                                </ProForm.Item>
                            </Col>

                            <Col span={24} md={8}>
                                <ProFormSelect
                                    name="categories"
                                    label="Phân loại Tour"
                                    options={categories}
                                    placeholder="Chọn một hoặc nhiều loại tour"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại tour!' }]}
                                    allowClear
                                    mode="multiple"
                                />
                            </Col>

                            <Col span={24} md={8}>
                                <ProFormDigit
                                    label="Giá cơ bản"
                                    name="basePrice"
                                    rules={[{ required: true, message: 'Vui lòng nhập giá cơ bản!' }]}
                                    placeholder="Ví dụ: 2500000"
                                    fieldProps={{
                                        addonAfter: " VNĐ",
                                        formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                        parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                                    }}
                                />
                            </Col>

                            <Col span={24} md={8}>
                                <ProFormDigit
                                    label="Thời gian (Số ngày)"
                                    name="duration"
                                    rules={[{ required: true, message: 'Vui lòng nhập số ngày!' }]}
                                    placeholder="Ví dụ: 3"
                                    fieldProps={{
                                        addonAfter: " Ngày",
                                    }}
                                />
                            </Col>

                            {/* Bỏ comment đoạn này nếu bảng Tour của bạn có trường trạng thái active/inactive */}
                            {/* <Col span={24} md={24}>
                                <ProFormSwitch
                                    label="Trạng thái hiển thị"
                                    name="active"
                                    checkedChildren="ĐANG MỞ"
                                    unCheckedChildren="ĐÓNG"
                                    initialValue={true}
                                />
                            </Col> */}

                            <Col span={24}>
                                <ProForm.Item
                                    name="description"
                                    label="Chương trình Tour / Mô tả chi tiết"
                                    rules={[{ required: true, message: 'Vui lòng nhập chương trình tour!' }]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={descriptionValue}
                                        onChange={setDescriptionValue}
                                    />
                                </ProForm.Item>
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>
            </div>
        </div>
    )
}

export default ViewUpsertTour;