import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ITour } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification, Tooltip } from "antd";
import { useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteTour } from "@/config/api";
import queryString from 'query-string';
import { useNavigate } from "react-router-dom";
import { fetchTour } from "@/redux/slice/tourSlide";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
// import { sfIn } from "spring-filter-query-builder"; // Tạm thời ẩn nếu không dùng mảng

const TourPage = () => {
    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.tour.isFetching);
    const meta = useAppSelector(state => state.tour.meta);
    const tours = useAppSelector(state => state.tour.result);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleDeleteTour = async (id: string | undefined | number) => {
        if (id) {
            const res = await callDeleteTour(id);
            if (res && res.data) {
                message.success('Xóa Tour thành công');
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

    const columns: ProColumns<ITour>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Tên Tour',
            dataIndex: 'name', // Đổi dataIndex thành 'name' cho đúng với entity Tour
            key: 'name',
            width: 300, // Chiều rộng của cột
            render: (_dom: any, entity: any) => {
                // Lấy tên tour từ entity
                const tourName = entity?.name || "Đang cập nhật...";

                return (
                    <Tooltip title={tourName} placement="topLeft">
                        <div style={{
                            width: 270, // Cố định cứng chiều rộng thẻ div (nhỏ hơn width của cột)
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
            title: 'Điểm đến',
            dataIndex: ["destination", "name"],
            sorter: true,
            hideInSearch: true, // Nếu backend không hỗ trợ filter nested dễ dàng, ta nên ẩn ô search này
        },
        {
            title: 'Giá cơ bản',
            dataIndex: 'basePrice',
            sorter: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.basePrice;
                return <strong style={{ color: '#d9363e' }}>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VNĐ</strong>
            },
        },
        {
            title: 'Thời gian (Ngày)',
            dataIndex: 'duration',
            sorter: true,
            render(dom, entity, index, action, schema) {
                return <>{entity.duration} Ngày</>
            },
        },
        // Bỏ cột Trạng thái (active) do ITour của chúng ta không khai báo trường này
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 150,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 150,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Hành động',
            hideInSearch: true,
            width: 100,
            render: (_value, entity, _index, _action) => (
                <Space>

                    <Access
                        permission={ALL_PERMISSIONS.TOURS?.UPDATE ?? ALL_PERMISSIONS.TOURS.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            type=""
                            onClick={() => {
                                navigate(`/admin/tour/upsert?id=${entity.id}`)
                            }}
                        />
                    </Access >
                    <Access
                        permission={ALL_PERMISSIONS.TOURS?.DELETE ?? ALL_PERMISSIONS.TOURS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa tour"}
                            description={"Bạn có chắc chắn muốn xóa tour này?"}
                            onConfirm={() => handleDeleteTour(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space >
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {

        const clone = { ...params };
        let parts = [];
        // Ánh xạ lại các trường filter cho khớp với ITour
        if (clone.name) parts.push(`name ~ '${clone.name}'`);
        if (clone.basePrice) parts.push(`basePrice = ${clone.basePrice}`);
        if (clone.duration) parts.push(`duration = ${clone.duration}`);

        clone.filter = parts.join(' and ');
        if (!clone.filter) delete clone.filter;

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;
        delete clone.name;
        delete clone.basePrice;
        delete clone.duration;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        const fields = ["name", "basePrice", "duration", "createdAt", "updatedAt"];
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;
                }
            }
        }

        // Mặc định sort theo updatedAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.TOURS?.GET_PAGINATE ?? ALL_PERMISSIONS.TOURS.GET_PAGINATE}
            >
                <DataTable<ITour>
                    actionRef={tableRef}
                    headerTitle="Danh sách Tours"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={tours}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchTour({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => navigate('upsert')}
                            >
                                Thêm mới
                            </Button>
                        );
                    }}
                />
            </Access>
        </div >
    )
}

export default TourPage;