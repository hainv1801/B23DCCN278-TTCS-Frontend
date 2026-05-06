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

const UserBooking = (props: any) => {
    const [listBooking, setListBooking] = useState<IBooking[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchBookingByUser();
            if (res && res.data) {
                // Sắp xếp đơn mới nhất lên đầu nếu Backend chưa sort
                const sortedData = (res.data.result as IBooking[]).sort((a, b) => {
                    return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
                });
                setListBooking(sortedData);
            }
            setIsFetching(false);
        }
        init();
    }, [])

    const columns: ColumnsType<IBooking> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Tên Tour',
            dataIndex: ["tourSchedule", "tour", "name"],
        },
        {
            title: 'Ngày Khởi Hành',
            dataIndex: ["tourSchedule", "departureDate"],
            render(value) {
                return (
                    <strong style={{ color: '#1890ff' }}>
                        {value ? dayjs(value).format('DD-MM-YYYY') : ""}
                    </strong>
                )
            },
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
                const color = value === 'CONFIRMED' ? 'green' : value === 'CANCELLED' ? 'red' : 'gold';
                return <Tag color={color}>{value}</Tag>
            },
        },
        {
            title: 'Thanh toán',
            dataIndex: "paymentStatus",
            render(value) {
                const color = value === 'PAID' ? 'cyan' : 'default';
                return <Tag color={color}>{value}</Tag>
            },
        },
        {
            title: 'Ngày đặt',
            dataIndex: "createdAt",
            render(value, record, index) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        }
    ];

    return (
        <div>
            <Table<IBooking>
                columns={columns}
                dataSource={listBooking}
                loading={isFetching}
                pagination={{ pageSize: 5 }} // Thêm phân trang nhỏ gọn cho khách hàng dễ nhìn
                rowKey="id"
                scroll={{ x: true }}
            />
        </div>
    )
}

const UserUpdateInfo = (props: any) => {
    return (
        <div>
            {/* //todo: Phần cập nhật thông tin cá nhân */}
        </div>
    )
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => {
        // console.log(key);
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
            children: `//todo`,
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