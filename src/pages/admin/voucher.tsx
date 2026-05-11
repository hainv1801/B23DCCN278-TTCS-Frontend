import { ActionType, ModalForm, ProColumns, ProFormDateTimePicker, ProFormDependency, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useRef, useState } from "react";
import DataTable from "@/components/client/data-table";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import queryString from "query-string";
import { callCreateVoucher, callDeleteVoucher, callFetchVoucher, callUpdateVoucher } from "@/config/api";
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import 'dayjs/locale/en';

// Thiết lập locale cho dayjs
dayjs.locale('vi');
const VoucherPage = () => {
    const tableRef = useRef<ActionType>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<any>(null);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleDelete = async (id: number) => {
        const res = await callDeleteVoucher(id);
        if (res && res.data) {
            message.success('Xóa Voucher thành công');
            reloadTable();
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: res.message });
        }
    }

    const columns: ProColumns<any>[] = [
        {
            title: 'Mã Voucher',
            dataIndex: 'code',
            render: (text) => <strong style={{ color: '#d9363e' }}>{text}</strong>
        },
        {
            title: 'Loại giảm giá',
            dataIndex: 'discountType',
            valueEnum: {
                PERCENT: { text: 'Phần trăm (%)', status: 'Processing' },
                FLAT: { text: 'Số tiền cố định (VNĐ)', status: 'Success' },
            }
        },
        {
            title: 'Mức giảm',
            hideInSearch: true,
            render: (_: any, record: any) => {
                if (record.discountType === 'PERCENT') {
                    return <span>{record.discountValue}% (Tối đa {record.maxDiscount?.toLocaleString()}đ)</span>;
                }
                return <span>{record.discountValue?.toLocaleString()}đ</span>;
            }
        },
        {
            title: 'Lượt dùng',
            hideInSearch: true,
            render: (_: any, record: any) => (
                <Tag color={record.usedCount >= record.usageLimit ? 'red' : 'blue'}>
                    {record.usedCount} / {record.usageLimit}
                </Tag>
            )
        },
        {
            title: 'Hạn sử dụng',
            hideInSearch: true,
            render: (_: any, record: any) => {
                const isExpired = dayjs().isAfter(dayjs(record.endDate));
                return (
                    <span style={{ color: isExpired ? 'red' : '#333' }}>
                        {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}
                    </span>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render: (active) => <Tag color={active ? 'green' : 'default'}>{active ? 'Đang bật' : 'Đã tắt'}</Tag>
        },
        {
            title: 'Hành động',
            hideInSearch: true,
            render: (_: any, entity: any) => (
                <Space>
                    <EditOutlined
                        style={{ fontSize: 20, color: '#ffa500', cursor: 'pointer' }}
                        onClick={() => {
                            setDataInit(entity);
                            setOpenModal(true);
                        }}
                    />
                    <Popconfirm title="Xác nhận xóa" description="Bạn có chắc muốn xóa mã này?" onConfirm={() => handleDelete(entity.id)}>
                        <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f', cursor: 'pointer' }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <DataTable
                actionRef={tableRef}
                headerTitle="Quản lý Mã giảm giá (Voucher)"
                rowKey="id"
                request={async (params, sort, filter) => {
                    const query = queryString.stringify({
                        page: params.current,
                        size: params.pageSize,
                        filter: params.code ? `code~'${params.code}'` : undefined,
                        sort: "createdAt,desc"
                    });
                    const res = await callFetchVoucher(query);
                    return {
                        data: res.data?.result || [],
                        success: true,
                        total: res.data?.meta?.total || 0,
                    };
                }}
                columns={columns}
                toolBarRender={() => [
                    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setDataInit(null); setOpenModal(true); }}>
                        Thêm mới
                    </Button>
                ]}
            />
            <ConfigProvider locale={enUS}>
                <ModalForm
                    title={dataInit?.id ? "Cập nhật Voucher" : "Tạo mới Voucher"}
                    open={openModal}
                    modalProps={{ onCancel: () => setOpenModal(false), destroyOnClose: true }}
                    initialValues={dataInit ? {
                        ...dataInit,
                        startDate: dataInit.startDate ? dayjs(dataInit.startDate) : null,
                        endDate: dataInit.endDate ? dayjs(dataInit.endDate) : null,
                    } : { active: true, discountType: 'PERCENT' }}
                    onFinish={async (values: any) => {
                        const payload = {
                            ...values,
                            id: dataInit?.id,
                            startDate: dayjs(values.startDate).toISOString(),
                            endDate: dayjs(values.endDate).toISOString(),
                        };
                        const res = dataInit?.id ? await callUpdateVoucher(payload) : await callCreateVoucher(payload);

                        if (res?.data) {
                            message.success(dataInit?.id ? "Cập nhật thành công!" : "Tạo mới thành công!");
                            setOpenModal(false);
                            reloadTable();
                        } else {
                            notification.error({ message: 'Lỗi', description: res?.message });
                        }
                        return true;
                    }}
                >
                    <ProFormText name="code" label="Mã Voucher" rules={[{ required: true }]} disabled={!!dataInit?.id} placeholder="Ví dụ: SUMMER2026" />
                    <ProFormText name="description" label="Mô tả ngắn" placeholder="Ví dụ: Khuyến mại chào Hè" />

                    <ProFormSelect
                        name="discountType"
                        label="Loại giảm giá"
                        options={[{ label: 'Phần trăm (%)', value: 'PERCENT' }, { label: 'Số tiền (VNĐ)', value: 'FLAT' }]}
                        rules={[{ required: true }]}
                    />

                    <ProFormDigit
                        name="discountValue"
                        label="Giá trị giảm"
                        rules={[{ required: true }]}
                        min={1}
                        placeholder=""
                        fieldProps={{ addonAfter: " VNĐ", formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), parser: (v) => +(v || '').replace(/\$\s?|(,*)/g, '') }}
                    />

                    <ProFormDependency name={['discountType']}>
                        {({ discountType }) => {
                            return discountType === 'PERCENT' ? (
                                <ProFormDigit
                                    name="maxDiscount"
                                    label="Mức giảm tối đa (VNĐ)"
                                    min={0}
                                    placeholder="Ví dụ: 500000"
                                    fieldProps={{ addonAfter: " VNĐ", formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), parser: (v) => +(v || '').replace(/\$\s?|(,*)/g, '') }}
                                />
                            ) : null;
                        }}
                    </ProFormDependency>

                    <ProFormDigit
                        name="minOrderValue"
                        label="Giá trị đơn hàng tối thiểu (VNĐ)" min={0}
                        rules={[{ required: true }]}
                        placeholder=""
                        fieldProps={{ addonAfter: " VNĐ", formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), parser: (v) => +(v || '').replace(/\$\s?|(,*)/g, '') }}
                    />
                    <ProFormDigit
                        name="usageLimit"
                        label="Tổng số lượt sử dụng"
                        min={1}
                        rules={[{ required: true }]}
                        placeholder=""
                        fieldProps={{ addonAfter: " VNĐ", formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), parser: (v) => +(v || '').replace(/\$\s?|(,*)/g, '') }}
                    />

                    <ProFormDateTimePicker
                        name="startDate"
                        label="Ngày bắt đầu"
                        placeholder=""
                        rules={[{ required: true }]}
                    />
                    <ProFormDateTimePicker
                        name="endDate"
                        label="Ngày kết thúc"
                        placeholder=""
                        rules={[{ required: true }]}
                    />
                    <ProFormSwitch name="active" label="Kích hoạt" />
                </ModalForm>
            </ConfigProvider>
        </>
    );
};

export default VoucherPage;