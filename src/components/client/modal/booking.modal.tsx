import { useAppSelector } from "@/redux/hooks";
import { ITour } from "@/types/backend";
import { ProForm, ProFormDigit, ProFormSelect, ProFormTextArea, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, Divider, Form, Modal, Row, message, notification } from "antd";
import { useNavigate } from "react-router-dom";
import enUS from 'antd/lib/locale/en_US';
import { callCreateBooking, callFetchTourSchedule } from "@/config/api";
import { useState, useEffect } from 'react';
import dayjs from "dayjs";

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    tourDetail: ITour | null;
}

const BookingModal = (props: IProps) => {
    const { isModalOpen, setIsModalOpen, tourDetail } = props;
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Lưu danh sách lịch trình (ngày khởi hành) của tour này
    const [schedules, setSchedules] = useState<{ label: string, value: number }[]>([]);

    // Khi mở modal, tự động gọi API lấy danh sách các lịch trình ĐANG MỞ của tour này
    useEffect(() => {
        if (isModalOpen && tourDetail?.id) {
            const fetchAvailableSchedules = async () => {
                // Tìm các lịch trình thuộc Tour này và đang có trạng thái OPEN
                const query = `filter=tour.id:'${tourDetail.id}' and status:'OPEN'&sort=departureDate,asc`;
                const res = await callFetchTourSchedule(query);

                if (res?.data?.result) {
                    const mappedSchedules = res.data.result.map(item => ({
                        label: `Khởi hành: ${dayjs(item.departureDate).format('DD/MM/YYYY')} - Về: ${dayjs(item.returnDate).format('DD/MM/YYYY')} (Còn ${item.capacity - item.bookedSeats} chỗ)`,
                        value: item.id as number
                    }));
                    setSchedules(mappedSchedules);
                }
            };
            fetchAvailableSchedules();
        } else {
            form.resetFields();
            setSchedules([]);
        }
    }, [isModalOpen, tourDetail, form]);


    const handleOkButton = () => {
        if (!isAuthenticated) {
            setIsModalOpen(false);
            navigate(`/login?callback=${window.location.href}`);
            return;
        }
        // Kích hoạt submit form, form sẽ tự gọi hàm onFinish bên dưới nếu qua được validate
        form.submit();
    }

    const onFinish = async (values: any) => {
        if (tourDetail) {
            // Chuẩn bị payload gửi xuống backend
            const payload = {
                tourSchedule: { id: values.tourScheduleId },
                totalAdults: values.totalAdults,
                totalChildren: values.totalChildren,
                note: values.note
            };

            const res = await callCreateBooking(payload);
            if (res.data) {
                message.success("Đặt tour thành công! Vui lòng chờ xác nhận từ hệ thống.");
                setIsModalOpen(false);
                form.resetFields();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    return (
        <>
            <Modal title="Xác Nhận Đặt Tour"
                open={isModalOpen}
                onOk={() => handleOkButton()}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={false}
                okText={isAuthenticated ? "Xác Nhận Đặt Tour" : "Đăng Nhập Để Đặt Tour"}
                cancelText="Hủy"
                destroyOnClose={true}
                width={600}
            >
                <Divider />
                {isAuthenticated ?
                    <div>
                        <ConfigProvider locale={enUS}>
                            <ProForm
                                form={form}
                                onFinish={onFinish}
                                submitter={{
                                    render: () => <></> // Ẩn nút submit mặc định của ProForm vì ta dùng nút OK của Modal
                                }}
                            >
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <div style={{ marginBottom: 15, fontSize: 15 }}>
                                            Bạn đang đặt tour: <b style={{ color: '#1890ff' }}>{tourDetail?.name}</b>
                                        </div>
                                    </Col>

                                    {/* Thông tin liên hệ (Lấy từ User đang đăng nhập) */}
                                    <Col span={24} md={12}>
                                        <ProFormText
                                            label="Họ và Tên"
                                            name={"name"}
                                            disabled
                                            initialValue={user?.name}
                                        />
                                    </Col>
                                    <Col span={24} md={12}>
                                        <ProFormText
                                            label="Email liên hệ"
                                            name={"email"}
                                            disabled
                                            initialValue={user?.email}
                                        />
                                    </Col>

                                    {/* Chọn lịch trình */}
                                    <Col span={24}>
                                        <ProFormSelect
                                            name="tourScheduleId"
                                            label="Ngày khởi hành"
                                            options={schedules}
                                            placeholder="Vui lòng chọn ngày khởi hành"
                                            rules={[{ required: true, message: 'Vui lòng chọn ngày khởi hành!' }]}
                                        />
                                    </Col>

                                    {/* Số lượng người */}
                                    <Col span={12}>
                                        <ProFormDigit
                                            name="totalAdults"
                                            label="Số người lớn"
                                            min={1}
                                            initialValue={1}
                                            rules={[{ required: true, message: 'Vui lòng nhập số người lớn!' }]}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <ProFormDigit
                                            name="totalChildren"
                                            label="Số trẻ em"
                                            min={0}
                                            initialValue={0}
                                            rules={[{ required: true, message: 'Vui lòng nhập số trẻ em!' }]}
                                        />
                                    </Col>

                                    {/* Ghi chú */}
                                    <Col span={24}>
                                        <ProFormTextArea
                                            name="note"
                                            label="Ghi chú thêm"
                                            placeholder="Yêu cầu đặc biệt về phòng, ăn uống, xe đưa đón..."
                                            fieldProps={{
                                                autoSize: { minRows: 3, maxRows: 5 }
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </ProForm>
                        </ConfigProvider>
                    </div>
                    :
                    <div>
                        Bạn chưa đăng nhập hệ thống. Vui lòng đăng nhập để có thể Đặt Tour bạn nhé!
                    </div>
                }
            </Modal>
        </>
    )
}
export default BookingModal;