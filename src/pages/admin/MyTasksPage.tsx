import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Space, Button, Drawer, Modal, Form, Select, message, notification } from 'antd';
import { callFetchMyTasks, callFetchBooking, callUpdateTourSchedule } from '@/config/api';
import dayjs from 'dayjs';
import { TeamOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const MyTasksPage = () => {
    // State cho bảng Lịch phân công
    const [listSchedules, setListSchedules] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [meta, setMeta] = useState({ current: 1, pageSize: 10, total: 0 });

    // State cho Drawer Xem Khách hàng
    const [openCustomerDrawer, setOpenCustomerDrawer] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [selectedTourName, setSelectedTourName] = useState("");

    // State cho Modal Cập nhật trạng thái
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchMyTasks(meta.current, meta.pageSize);
    }, []);

    // 1. FETCH LỊCH PHÂN CÔNG
    const fetchMyTasks = async (current: number, pageSize: number) => {
        setIsLoading(true);
        const res = await callFetchMyTasks(`page=${current}&size=${pageSize}&sort=departureDate,asc`);

        if (res && res.data) {
            setListSchedules(res.data.result);
            setMeta({
                current: res.data.meta.page,
                pageSize: res.data.meta.pageSize,
                total: res.data.meta.total
            });
        }
        setIsLoading(false);
    };

    const handleTableChange = (pagination: any) => {
        fetchMyTasks(pagination.current, pagination.pageSize);
    };

    // 2. XỬ LÝ XEM KHÁCH HÀNG
    const handleViewCustomers = async (record: any) => {
        setOpenCustomerDrawer(true);
        setSelectedTourName(record.tourInfo?.name);
        setIsLoadingCustomers(true);

        // Gọi API lấy danh sách booking của lịch trình này
        // Lưu ý: Đảm bảo Spring Filter hỗ trợ truy vấn schedule.id
        const res = await callFetchBooking(`page=1&size=100&filter=tourSchedule.id:${record.id}`);
        if (res && res.data) {
            // Chỉ lấy những khách đã thanh toán hoặc đã xác nhận (tuỳ logic nghiệp vụ của bạn)
            const validCustomers = res.data.result.filter((item: any) => item.status !== 'CANCELLED');
            setCustomers(validCustomers);
        } else {
            setCustomers([]);
        }
        setIsLoadingCustomers(false);
    };

    // 3. XỬ LÝ CẬP NHẬT TRẠNG THÁI
    const handleOpenStatusModal = (record: any) => {
        setCurrentSchedule(record);
        form.setFieldsValue({ status: record.status });
        setOpenStatusModal(true);
    };

    const handleUpdateStatus = async (values: any) => {
        if (!currentSchedule) return;

        // Tạo payload tái cấu trúc lại object giống như khi Upsert để không bị mất data
        const payload: any = {
            ...currentSchedule,
            tour: { id: currentSchedule.tourInfo?.id },
            guide: currentSchedule.guide ? { id: currentSchedule.guide.id } : null,
            status: values.status,
            departureDate: dayjs(currentSchedule.departureDate).format('YYYY-MM-DD'),
            returnDate: dayjs(currentSchedule.returnDate).format('YYYY-MM-DD'),
        };

        const res = await callUpdateTourSchedule(payload);
        console.log("Update", payload);
        if (res && res.data) {
            message.success("Cập nhật trạng thái thành công!");
            setOpenStatusModal(false);
            fetchMyTasks(meta.current, meta.pageSize); // Reload lại bảng
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }
    };

    // --- CỘT BẢNG LỊCH PHÂN CÔNG ---
    const columns = [
        {
            title: 'Tên Tour',
            dataIndex: ['tourInfo', 'name'],
            key: 'tourName',
            render: (text: string) => <strong>{text}</strong>
        },
        {
            title: 'Ngày khởi hành',
            dataIndex: 'departureDate',
            render: (text: string) => <span style={{ color: '#d9363e', fontWeight: 500 }}>{dayjs(text).format('DD/MM/YYYY')}</span>,
        },
        {
            title: 'Ngày về',
            dataIndex: 'returnDate',
            render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Tình trạng chỗ',
            render: (_: any, record: any) => (
                <Tag color={record.bookedSeats >= record.capacity ? "red" : "blue"}>
                    {record.bookedSeats || 0} / {record.capacity}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'OPEN') color = 'processing';
                if (status === 'CLOSED' || status === 'FULL') color = 'warning';
                if (status === 'CANCELLED') color = 'error';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Hành động',
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="primary"
                        ghost
                        icon={<TeamOutlined />}
                        size="small"
                        onClick={() => handleViewCustomers(record)}
                    >
                        Khách hàng
                    </Button>
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleOpenStatusModal(record)}
                    >
                        Cập nhật
                    </Button>
                </Space>
            )
        }
    ];

    // --- CỘT BẢNG KHÁCH HÀNG (TRONG DRAWER) ---
    const customerColumns = [
        {
            title: 'Khách hàng',
            dataIndex: ['user', 'name'],
            render: (text: string, record: any) => (
                <>
                    <strong>{text}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: '#888' }}>{record.user?.email}</span>
                </>
            )
        },
        {
            title: 'Số lượng vé',
            render: (_: any, record: any) => (
                <span>{record.totalAdults} NL, {record.totalChildren} TE</span>
            )
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            render: (text: string) => text || <span style={{ color: '#ccc' }}>Không có</span>
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            render: (status: string) => {
                const color = status === 'PAID' ? 'cyan' : 'default';
                return <Tag color={color}>{status}</Tag>;
            }
        }
    ];

    return (
        <div style={{ padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
            <Title level={3} style={{ marginBottom: 20 }}>Lịch trình phân công</Title>

            <Table
                columns={columns}
                dataSource={listSchedules}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
            />

            {/* DRAWER: XEM DANH SÁCH KHÁCH HÀNG */}
            <Drawer
                title={`Danh sách khách hàng - ${selectedTourName}`}
                placement="right"
                width={650}
                onClose={() => setOpenCustomerDrawer(false)}
                open={openCustomerDrawer}
            >
                <Table
                    columns={customerColumns}
                    dataSource={customers}
                    rowKey="id"
                    loading={isLoadingCustomers}
                    pagination={false}
                    bordered
                    size="small"
                />
            </Drawer>

            {/* MODAL: CẬP NHẬT TRẠNG THÁI */}
            <Modal
                title="Cập nhật trạng thái Tour"
                open={openStatusModal}
                onCancel={() => setOpenStatusModal(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
                    <Form.Item
                        name="status"
                        label="Trạng thái Lịch trình"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select>
                            <Option value="OPEN">Đang mở (OPEN)</Option>
                            <Option value="CLOSED">Đã đóng (CLOSED)</Option>
                            <Option value="FULL">Đã đầy (FULL)</Option>
                            <Option value="CANCELLED">Đã hủy (CANCELLED)</Option>
                            <Option value="COMPLETED">Đã hoàn thành (COMPLETED)</Option>
                        </Select>
                    </Form.Item>
                    <p style={{ color: '#888', fontSize: 13 }}>
                        Lưu ý: Hướng dẫn viên vui lòng cập nhật trạng thái thực tế của Tour để hệ thống ghi nhận.
                    </p>
                </Form>
            </Modal>
        </div>
    );
};

export default MyTasksPage;