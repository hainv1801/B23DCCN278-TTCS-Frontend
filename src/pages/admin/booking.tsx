import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IBooking } from "@/types/backend";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Space, Tag, message, notification, Tooltip } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteBooking } from "@/config/api";
import queryString from 'query-string';
import { fetchBooking } from "@/redux/slice/bookingSlide"; // Bạn nhớ tạo/đổi tên slice này nhé
import ViewDetailBooking from "@/components/admin/booking/view.booking"; // Component View bạn vừa tạo
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";

const BookingPage = () => {
    const tableRef = useRef<ActionType>();

    // Đổi state.resume thành state.booking
    const isFetching = useAppSelector(state => state.booking.isFetching);
    const meta = useAppSelector(state => state.booking.meta);
    const bookings = useAppSelector(state => state.booking.result);
    const dispatch = useAppDispatch();

    const [dataInit, setDataInit] = useState<IBooking | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    // Chức năng xóa đơn (nếu cần thiết cho admin)
    const handleDeleteBooking = async (id: number | undefined) => {
        if (id) {
            const res = await callDeleteBooking(id.toString());
            if (res && res.data) {
                message.success('Xóa Đơn đặt tour thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IBooking>[] = [
        {
            title: 'Mã Đơn',
            dataIndex: 'id',
            width: 80,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={(e) => {
                        e.preventDefault();
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        #{record.id}
                    </a>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Khách hàng',
            dataIndex: ["user", "name"],
            hideInSearch: true,
        },
        {
            title: 'Tên Tour',
            dataIndex: ['schedule', 'tourName'],
            key: 'tourName',
            width: 300, // Chiều rộng của cột
            render: (_dom: any, entity: any) => {
                const tourName = entity?.schedule?.tourName || "Đang cập nhật...";
                return (
                    <Tooltip title={tourName} placement="topLeft">
                        <div style={{
                            width: 270, // <--- CỐ ĐỊNH CỨNG CHIỀU RỘNG TẠI ĐÂY (Nên nhỏ hơn width cột tầm 20-30px)
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {tourName}
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.totalPrice;
                return <strong style={{ color: '#d9363e' }}>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</strong>
            },
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            sorter: true,
            render: (text, record, index, action) => {
                // Hiển thị tag màu sắc cho dễ nhìn
                const color = (record.status === 'CONFIRMED' || record.status === 'COMPLETED') ? 'green' : record.status === 'CANCELLED' ? 'red' : 'gold';
                return <Tag color={color}>{record.status}</Tag>
            },
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PENDING: 'PENDING',
                        CONFIRMED: 'CONFIRMED',
                        CANCELLED: 'CANCELLED',
                        COMPLETED: 'COMPLETED'
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            hideInSearch: true,
            render: (text, record, index, action) => {
                const color = record.paymentStatus === 'PAID' ? 'cyan' : 'default';
                return <Tag color={color}>{record.paymentStatus}</Tag>
            },
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            width: 150,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.bookingDate ? dayjs(record.bookingDate).format('DD-MM-YYYY HH:mm') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Actions',
            hideInSearch: true,
            width: 80,
            align: 'center',
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EyeOutlined
                        style={{
                            fontSize: 20,
                            color: '#1890ff',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            setOpenViewDetail(true);
                            setDataInit(entity);
                        }}
                    />
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };

        if (clone?.status?.length) {
            clone.filter = sfIn("status", clone.status).toString();
            delete clone.status;
        }

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.status) {
            sortBy = sort.status === 'ascend' ? "sort=status,asc" : "sort=status,desc";
        }

        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }

        // Mặc định sort theo ngày tạo mới nhất (đơn mới lên đầu)
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=createdAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.BOOKINGS?.GET_PAGINATE ?? ALL_PERMISSIONS.BOOKINGS.GET_PAGINATE}
            >
                <DataTable<IBooking>
                    actionRef={tableRef}
                    headerTitle="Danh sách Đơn Đặt Tour"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={bookings}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchBooking({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} dòng</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <></> // Booking thường do Client tạo, Admin chỉ xem/duyệt nên không có nút "Thêm mới" ở đây
                        );
                    }}
                />
            </Access>
            <ViewDetailBooking
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />
        </div >
    )
}

export default BookingPage;