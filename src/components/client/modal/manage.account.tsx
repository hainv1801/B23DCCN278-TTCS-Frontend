import { Modal, Table, Tabs, Tag } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IBooking } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callFetchBookingByUser } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserBooking = () => {
    const [listBooking, setListBooking] = useState<IBooking[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    // State quản lý phân trang
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    // Hàm fetch được tách riêng để gọi lại mỗi khi user bấm chuyển trang
    const fetchHistory = async (page: number, size: number) => {
        setIsFetching(true);
        // Cần đảm bảo hàm gọi API này đã được sửa ở file api.ts để nhận tham số
        // Ví dụ: return axios.get(`/api/v1/bookings/by-user?current=${page}&pageSize=${size}`)
        const res = await callFetchBookingByUser(`current=${page}&pageSize=${size}`);
        console.log(res.data);
        if (res && res.data) {
            // Lưu dữ liệu vào bảng
            setListBooking(res.data.result);

            // Cập nhật tổng số đơn hàng để hiển thị đúng số lượng trang
            if (res.data.meta && res.data.meta.total) {
                setTotal(res.data.meta.total);
            }
        }
        setIsFetching(false);
    };

    // Chạy lần đầu khi component được render
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
                // Công thức tính STT tịnh tiến theo trang
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
            dataIndex: 'bookingDate', // Thường backend chuẩn sẽ dùng createdAt cho ngày tạo
            key: 'bookingDate',
            render: (date: string) => {
                return date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : 'N/A';
            },
        },
    ];

    // Xử lý sự kiện khi bấm nút chuyển trang
    const handleTableChange = (pagination: any) => {
        if (pagination && pagination.current) {
            const newCurrent = pagination.current;
            const newPageSize = pagination.pageSize;

            // Cập nhật State
            setCurrent(newCurrent);
            setPageSize(newPageSize);

            // Gọi lại API với số trang mới
            fetchHistory(newCurrent, newPageSize);
        }
    };

    return (
        <div>
            <Table<IBooking>
                columns={columns}
                dataSource={listBooking}
                loading={isFetching}
                // Đồng bộ cấu hình phân trang vào Table
                pagination={{
                    current: current,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true, // Cho phép thay đổi số dòng / trang
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
    return (
        <div>
            {/* //todo: Phần cập nhật thông tin cá nhân */}
            <p>Tính năng đang phát triển...</p>
        </div>
    )
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => {
        // Có thể thêm logic gọi lại dữ liệu khi đổi tab nếu cần
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-booking',
            label: `Lịch sử đặt tour`,
            children: <UserBooking />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <p>Tính năng đang phát triển...</p>,
        },
    ];

    return (
        <>
            <Modal
                title="Quản lý tài khoản"
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