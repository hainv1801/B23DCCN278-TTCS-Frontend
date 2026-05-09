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

        // Lấy toàn bộ giá trị từ Form (cả status và paymentStatus)
        const values = form.getFieldsValue();

        const payload: Partial<IBooking> = {
            id: dataInit?.id,
            status: values.status,
            paymentStatus: values.paymentStatus // Thêm trường cập nhật thanh toán
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
            // Đổ dữ liệu khởi tạo cho cả 2 trường
            form.setFieldsValue({
                status: dataInit.status,
                paymentStatus: dataInit.paymentStatus
            });
        }
        return () => form.resetFields();
    }, [dataInit, form])

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
                {/* Bọc toàn bộ Descriptions bằng Form để quản lý nhiều trường dễ hơn */}
                <Form form={form} layout="vertical">
                    <Descriptions title="Chi tiết đơn hàng" bordered column={2} layout="vertical">

                        <Descriptions.Item label="Khách hàng (Người đặt)">
                            {dataInit?.user?.name} <br />
                            {dataInit?.user?.email}
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái đơn">
                            <Form.Item name="status" style={{ marginBottom: 0 }}>
                                <Select style={{ width: "100%" }}>
                                    <Option value="PENDING">Chờ xử lý (PENDING)</Option>
                                    <Option value="CONFIRMED">Đã xác nhận (CONFIRMED)</Option>
                                    <Option value="CANCELLED">Đã hủy (CANCELLED)</Option>
                                    <Option value="COMPLETED">Hoàn thành (COMPLETED)</Option>
                                </Select>
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tour đăng ký" span={2}>
                            <strong>{dataInit?.schedule?.tourName}</strong>
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày khởi hành">
                            {dataInit?.schedule?.departureDate ? dayjs(dataInit?.schedule?.departureDate).format('DD-MM-YYYY') : ""}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày trở về">
                            {dataInit?.schedule?.returnDate ? dayjs(dataInit?.schedule?.returnDate).format('DD-MM-YYYY') : ""}
                        </Descriptions.Item>

                        <Descriptions.Item label="Số lượng hành khách">
                            Người lớn: <strong>{dataInit?.totalAdults}</strong> <br />
                            Trẻ em: <strong>{dataInit?.totalChildren}</strong>
                        </Descriptions.Item>

                        {/* Thêm ô Select cho Trạng thái thanh toán tại đây */}
                        <Descriptions.Item label="Thanh toán">
                            <div style={{ marginBottom: 8 }}>
                                Tổng tiền: <strong style={{ color: '#d9363e', fontSize: '16px' }}>{formatCurrency(dataInit?.totalPrice)}</strong>
                            </div>
                            <Form.Item name="paymentStatus" style={{ marginBottom: 0 }}>
                                <Select style={{ width: "100%" }}>
                                    <Option value="UNPAID">Chưa thanh toán (UNPAID)</Option>
                                    <Option value="PAID">Đã thanh toán đủ (PAID)</Option>
                                    <Option value="REFUNDED">Đã hoàn tiền (REFUNDED)</Option>
                                    <Option value="FAILED">Thanh toán lỗi (FAILED)</Option>
                                </Select>
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="Ghi chú của khách hàng" span={2}>
                            {dataInit?.note || "Không có ghi chú"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày tạo đơn">
                            {dataInit && dataInit.bookingDate ? dayjs(dataInit.bookingDate).format('DD-MM-YYYY HH:mm:ss') : ""}
                        </Descriptions.Item>

                    </Descriptions>
                </Form>
            </Drawer>
        </>
    )
}

export default ViewDetailBooking;