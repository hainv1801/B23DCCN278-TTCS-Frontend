import { callUpdateBookingStatus } from "@/config/api";
import { IBooking } from "@/types/backend";
import { Button, Descriptions, Drawer, Form, Select, message, notification, Tag } from "antd";
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

const { Option } = Select;

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IBooking | null | any;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ViewDetailBooking = (props: IProps) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { onClose, open, dataInit, setDataInit, reloadTable } = props;
    const [form] = Form.useForm();

    const handleChangeStatus = async () => {
        setIsSubmit(true);

        const status = form.getFieldValue('status');

        // SỬA Ở ĐÂY: Truyền vào một Object (Partial<IBooking>) chứa id và status
        const payload: Partial<IBooking> = {
            id: dataInit?.id,
            status: status
        };

        const res = await callUpdateBookingStatus(payload);

        if (res.data) {
            message.success("Cập nhật trạng thái đơn đặt tour thành công!");
            setDataInit(null);
            onClose(false);
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

        setIsSubmit(false);
    }

    useEffect(() => {
        if (dataInit) {
            form.setFieldValue("status", dataInit.status)
        }
        return () => form.resetFields();
    }, [dataInit])

    // Format tiền tệ
    const formatCurrency = (value: number | undefined) => {
        if (!value) return "0 VNĐ";
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " VNĐ";
    };

    return (
        <>
            <Drawer
                title="Thông Tin Đơn Đặt Tour"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"50vw"}
                maskClosable={false}
                destroyOnClose
                extra={
                    <Button loading={isSubmit} type="primary" onClick={handleChangeStatus}>
                        Cập nhật trạng thái
                    </Button>
                }
            >
                <Descriptions title="Chi tiết đơn hàng" bordered column={2} layout="vertical">

                    <Descriptions.Item label="Khách hàng (Người đặt)">
                        {dataInit?.user?.name} <br />
                        {dataInit?.user?.email}
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái đơn">
                        <Form form={form}>
                            <Form.Item name={"status"} style={{ marginBottom: 0 }}>
                                <Select style={{ width: "100%" }} defaultValue={dataInit?.status}>
                                    <Option value="PENDING">Chờ xử lý (PENDING)</Option>
                                    <Option value="CONFIRMED">Đã xác nhận (CONFIRMED)</Option>
                                    <Option value="CANCELLED">Đã hủy (CANCELLED)</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tour đăng ký" span={2}>
                        <strong>{dataInit?.tourSchedule?.tour?.name}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày khởi hành">
                        {dataInit?.tourSchedule?.departureDate ? dayjs(dataInit?.tourSchedule?.departureDate).format('DD-MM-YYYY') : ""}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày trở về">
                        {dataInit?.tourSchedule?.returnDate ? dayjs(dataInit?.tourSchedule?.returnDate).format('DD-MM-YYYY') : ""}
                    </Descriptions.Item>

                    <Descriptions.Item label="Số lượng hành khách">
                        Người lớn: <strong>{dataInit?.totalAdults}</strong> <br />
                        Trẻ em: <strong>{dataInit?.totalChildren}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Thanh toán">
                        Tổng tiền: <strong style={{ color: '#d9363e', fontSize: '16px' }}>{formatCurrency(dataInit?.totalPrice)}</strong> <br />
                        Tình trạng: {
                            dataInit?.paymentStatus === 'PAID' ? <Tag color="success">Đã thanh toán</Tag> :
                                dataInit?.paymentStatus === 'REFUNDED' ? <Tag color="default">Đã hoàn tiền</Tag> :
                                    <Tag color="warning">Chưa thanh toán</Tag>
                        }
                    </Descriptions.Item>

                    <Descriptions.Item label="Ghi chú của khách hàng" span={2}>
                        {dataInit?.note || "Không có ghi chú"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo đơn">
                        {dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}
                    </Descriptions.Item>

                    <Descriptions.Item label="Cập nhật lần cuối">
                        {dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}
                    </Descriptions.Item>

                </Descriptions>
            </Drawer>
        </>
    )
}

export default ViewDetailBooking;