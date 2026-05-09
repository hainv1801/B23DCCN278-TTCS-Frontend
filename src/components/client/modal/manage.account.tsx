import { Modal, Table, Tabs, Tag, Form, Input, Button, Row, Col, Select, message, Spin, notification } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IBooking } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callFetchBookingByUser } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { callUpdateUser } from '@/config/api';
import { setUpdateUserInfoAction } from '@/redux/slice/accountSlide';
interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserBooking = () => {
    const [listBooking, setListBooking] = useState<IBooking[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const fetchHistory = async (page: number, size: number) => {
        setIsFetching(true);
        const res = await callFetchBookingByUser(`current=${page}&pageSize=${size}`);
        console.log(res.data);
        if (res && res.data) {
            setListBooking(res.data.result);

            if (res.data.meta && res.data.meta.total) {
                setTotal(res.data.meta.total);
            }
        }
        setIsFetching(false);
    };

    useEffect(() => {
        fetchHistory(current, pageSize);
    }, []);

    const columns: ColumnsType<IBooking> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (current - 1) * pageSize + index + 1;
            }
        },
        {
            title: 'Tên Tour',
            dataIndex: ["schedule", "tourName"],
            key: 'tourName',
            render: (text: string) => <span style={{ fontWeight: 500 }}>{text || 'N/A'}</span>
        },
        {
            title: 'Ngày khởi hành',
            dataIndex: ['schedule', 'departureDate'],
            key: 'departureDate',
            defaultSortOrder: 'descend',
            render: (date: string) => {
                return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A';
            }
        },
        {
            title: 'Tổng Tiền',
            dataIndex: "totalPrice",
            render(value) {
                return (
                    <strong style={{ color: '#d9363e' }}>
                        {value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ" : "0 đ"}
                    </strong>
                )
            },
        },
        {
            title: 'Trạng thái Đơn',
            dataIndex: "status",
            render(value) {
                const color = value === 'CONFIRMED' || value === 'SUCCESS' ? 'green' : value === 'CANCELLED' ? 'red' : 'gold';
                return <Tag color={color}>{value || 'PENDING'}</Tag>
            },
        },
        {
            title: 'Thanh toán',
            dataIndex: "paymentStatus",
            render(value) {
                const color = value === 'SUCCESS' || value === 'PAID' ? 'cyan' : value === 'FAILED' ? 'red' : 'default';
                return <Tag color={color}>{value || 'UNPAID'}</Tag>
            },
        },
        {
            title: 'Ngày đặt đơn',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            render: (date: string) => {
                return date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : 'N/A';
            },
        },
    ];

    const handleTableChange = (pagination: any) => {
        if (pagination && pagination.current) {
            const newCurrent = pagination.current;
            const newPageSize = pagination.pageSize;

            setCurrent(newCurrent);
            setPageSize(newPageSize);

            fetchHistory(newCurrent, newPageSize);
        }
    };

    return (
        <div>
            <Table<IBooking>
                columns={columns}
                dataSource={listBooking}
                loading={isFetching}
                pagination={{
                    current: current,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50']
                }}
                onChange={handleTableChange}
                rowKey="id"
                scroll={{ x: true }}
            />
        </div>
    )
}

const UserUpdateInfo = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const user = useAppSelector(state => state.account.user);
    const dispatch = useAppDispatch();

    // Điền sẵn dữ liệu của user vào Form khi component được render
    useEffect(() => {
        if (user) {
            console.log(user);
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                address: user.address,
            });
        }
    }, [user, form]);

    const onFinish = async (values: any) => {
        setIsSubmit(true);
        // Gộp id của user vào cục data để gửi lên Backend
        const dataUpdate = {
            id: user.id,
            name: values.name,
            age: values.age,
            gender: values.gender,
            address: values.address
        };

        const res = await callUpdateUser(dataUpdate);

        if (res && res.data) {
            message.success(t('account.updateSuccess', 'Cập nhật thông tin thành công!'));
            dispatch(setUpdateUserInfoAction({
                name: values.name,
                age: values.age,
                gender: values.gender,
                address: values.address
            }));
        } else {
            notification.error({
                message: t('common.error', 'Có lỗi xảy ra'),
                description: res?.message || t('account.updateFailed', 'Không thể cập nhật thông tin')
            });
        }
        setIsSubmit(false);
    };

    return (
        <Spin spinning={isSubmit}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ marginTop: 20 }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24} md={12}>
                        <Form.Item
                            label={t('account.email', 'Email đăng nhập')}
                            name="email"
                            tooltip="Email không thể thay đổi"
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <Form.Item
                            label={t('account.name', 'Họ và tên')}
                            name="name"
                            rules={[{ required: true, message: t('account.nameReq', 'Vui lòng nhập họ tên!') }]}
                        >
                            <Input placeholder={t('account.nameHolder', 'Nhập họ và tên...')} />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <Form.Item
                            label={t('account.age', 'Tuổi')}
                            name="age"
                        >
                            <Input type="number" min={1} placeholder={t('account.ageHolder', 'Nhập tuổi...')} />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <Form.Item
                            label={t('account.gender', 'Giới tính')}
                            name="gender"
                        >
                            <Select
                                placeholder={t('account.genderHolder', 'Chọn giới tính')}
                                options={[
                                    { value: 'MALE', label: t('gender.male', 'Nam') },
                                    { value: 'FEMALE', label: t('gender.female', 'Nữ') },
                                    { value: 'OTHER', label: t('gender.other', 'Khác') },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label={t('account.address', 'Địa chỉ')}
                            name="address"
                        >
                            <Input.TextArea rows={3} placeholder={t('account.addressHolder', 'Nhập địa chỉ của bạn...')} />
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmit}
                        size="large"
                        style={{ minWidth: 150 }}
                    >
                        {t('account.btnUpdate', 'Cập Nhật Thông Tin')}
                    </Button>
                </div>
            </Form>
        </Spin>
    );
};

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;
    const { t } = useTranslation();
    const onChange = (key: string) => {
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-booking',
            label: t('account.history'),
            children: <UserBooking />,
        },
        {
            key: 'user-update-info',
            label: t('account.update'),
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: t('account.password'),
            children: <p>Tính năng đang phát triển...</p>,
        },
    ];

    return (
        <>
            <Modal
                title={t('account.title')}
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1000px"}
            >
                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-booking"
                        items={items}
                        onChange={onChange}
                    />
                </div>
            </Modal>
        </>
    )
}

export default ManageAccount;