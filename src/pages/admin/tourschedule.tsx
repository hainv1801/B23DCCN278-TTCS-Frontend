import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ITourSchedule } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteTourSchedule } from "@/config/api";
import queryString from 'query-string';
import { useNavigate } from "react-router-dom";
import { fetchTourSchedule } from "@/redux/slice/tourScheduleSlide";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfIn } from "spring-filter-query-builder";

const TourSchedulePage = () => {
    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.tourSchedule.isFetching);
    const meta = useAppSelector(state => state.tourSchedule.meta);
    const tourSchedules = useAppSelector(state => state.tourSchedule.result);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleDeleteTourSchedule = async (id: number | undefined) => {
        if (id) {
            const res = await callDeleteTourSchedule(id);
            if (res && res.data) {
                message.success('Xóa Lịch trình thành công');
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

    const formatCurrency = (value: number | undefined) => {
        if (!value) return "0 đ";
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ";
    };

    const columns: ProColumns<ITourSchedule>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return <>{(index + 1) + (meta.page - 1) * (meta.pageSize)}</>
            },
            hideInSearch: true,
        },
        {
            title: 'Tên Tour',
            dataIndex: 'tourInfo',
            render: (text, record) => {
                return (
                    <strong style={{ color: '#333' }}>
                        {record?.tourInfo?.name || 'N/A'}
                    </strong>
                );
            },
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: 'Hướng dẫn viên',
            dataIndex: 'guideInfo',
            render: (text, record) => {
                console.log(record);
                return (
                    <strong style={{ color: '#333' }}>
                        {record?.guideInfo?.name || 'N/A'}
                    </strong>
                );
            },
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: 'Ngày đi',
            dataIndex: 'departureDate',
            valueType: 'date',
            sorter: true,
            render: (text, record) => {
                // Đổi màu nếu lịch trình trong quá khứ
                const isPast = dayjs(record.departureDate).isBefore(dayjs(), 'day');
                return (
                    <strong style={{ color: isPast ? '#bfbfbf' : '#1890ff' }}>
                        {record.departureDate ? dayjs(record.departureDate).format('DD-MM-YYYY') : ""}
                    </strong>
                )
            },
        },
        {
            title: 'Ngày về',
            dataIndex: 'returnDate',
            valueType: 'date',
            hideInSearch: true,
            render: (text, record) => {
                return <>{record.returnDate ? dayjs(record.returnDate).format('DD-MM-YYYY') : ""}</>
            },
        },
        {
            title: 'Tình trạng chỗ',
            hideInSearch: true,
            render: (text, record) => {
                const isFull = record.bookedSeats >= record.capacity;
                return (
                    <Tag color={isFull ? "red" : "blue"}>
                        {record.bookedSeats} / {record.capacity}
                    </Tag>
                )
            },
        },
        {
            title: 'Giá vé (NL / TE)',
            hideInSearch: true,
            render: (text, record) => {
                return (
                    <div>
                        <span style={{ color: '#d9363e', fontWeight: 'bold' }}>{formatCurrency(record.priceAdult)}</span>
                        <br />
                        <span style={{ fontSize: '12px', color: '#888' }}>{formatCurrency(record.priceChild)}</span>
                    </div>
                )
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            render: (text, record) => {
                let color = 'default';
                if (record.status === 'OPEN') color = 'green';
                if (record.status === 'CLOSED' || record.status === 'FULL') color = 'gold';
                if (record.status === 'CANCELLED') color = 'red';
                return <Tag color={color}>{record.status}</Tag>
            },
            renderFormItem: () => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        OPEN: 'Đang mở',
                        CLOSED: 'Đã đóng',
                        FULL: 'Đã đầy',
                        CANCELLED: 'Đã hủy',
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },
        {
            title: 'Hành động',
            hideInSearch: true,
            width: 100,
            render: (_value, entity) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.TOUR_SCHEDULES?.UPDATE ?? ALL_PERMISSIONS.TOUR_SCHEDULES.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500', opacity: entity.status === 'CANCELLED' ? 0.5 : 1 }}
                            onClick={() => {
                                if (entity.status !== 'CANCELLED') navigate(`/admin/tour-schedule/upsert?id=${entity.id}`);
                                else message.warning("Không thể sửa lịch trình đã bị hủy.");
                            }}
                        />
                    </Access >
                    <Access permission={ALL_PERMISSIONS.TOUR_SCHEDULES?.DELETE ?? ALL_PERMISSIONS.TOUR_SCHEDULES.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa"}
                            description={"Bạn có chắc chắn muốn xóa lịch trình này?"}
                            onConfirm={() => handleDeleteTourSchedule(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space >
            ),
        },
    ];

    const buildQuery = (params: any, sort: any) => {
        const clone = { ...params };
        let parts = [];

        // Đảm bảo Spring Filter Query Builder xử lý ngày chính xác bằng toán tử ~ (like) hoặc =
        if (clone.departureDate) {
            parts.push(`departureDate = '${clone.departureDate}'`);
        }

        if (clone?.status?.length) {
            parts.push(`${sfIn("status", clone.status).toString()}`);
        }

        clone.filter = parts.join(' and ');
        if (!clone.filter) delete clone.filter;

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;
        delete clone.departureDate;
        delete clone.status;

        let temp = queryString.stringify(clone);
        let sortBy = "";

        if (sort && Object.keys(sort).length > 0) {
            const field = Object.keys(sort)[0];
            sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
            temp = `${temp}&${sortBy}`;
        } else {
            temp = `${temp}&sort=departureDate,asc`;
        }

        return temp;
    }

    return (
        <div>
            <Access permission={ALL_PERMISSIONS.TOUR_SCHEDULES?.GET_PAGINATE ?? ALL_PERMISSIONS.TOUR_SCHEDULES.GET_PAGINATE}>
                <DataTable<ITourSchedule>
                    actionRef={tableRef}
                    headerTitle="Quản lý Lịch trình Tour"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={tourSchedules}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort);
                        dispatch(fetchTourSchedule({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => <div> {range[0]}-{range[1]} trên {total} dòng</div>
                    }}
                    rowSelection={false}
                    toolBarRender={() => [
                        <Button
                            key="create-new" // Khi trả về mảng, React yêu cầu có key
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => navigate('upsert')}
                        >
                            Thêm mới
                        </Button>
                    ]}
                />
            </Access>
        </div >
    )
}

export default TourSchedulePage;