import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { callCreateCategory, callUpdateCategory } from "@/config/api";
import { ICategory } from "@/types/backend";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: ICategory | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalCategory = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [form] = Form.useForm();

    const submitCategory = async (valuesForm: any) => {
        const { name, nameEN } = valuesForm;

        if (dataInit?.id) {
            // Cập nhật (Update)
            // Lưu ý: Hãy chắc chắn hàm callUpdateCategory trong api.ts của bạn đang nhận 2 tham số là (id, name)
            // hoặc nhận 1 object { id, name } tùy theo cách bạn đã viết. Dưới đây là cách gọi truyền 1 object:
            const res = await callUpdateCategory({ id: dataInit.id, name, nameEN } as any);

            if (res.data) {
                message.success("Cập nhật loại tour thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.error
                });
            }
        } else {
            // Tạo mới (Create)
            const res = await callCreateCategory({ name, nameEN } as any);

            if (res.data) {
                message.success("Thêm mới loại tour thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.error
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật Loại Tour" : "Tạo mới Loại Tour"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 600,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitCategory}
                initialValues={dataInit?.id ? dataInit : {}}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <ProFormText
                            label="Tên loại tour (Tiếng Việt)"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập tên loại tour (VD: Du lịch sinh thái, Khám phá, Nghỉ dưỡng...)"
                        />
                    </Col>
                </Row>
                <Col span={24}>
                    <ProFormText
                        label="Tên loại tour (Tiếng Anh)"
                        name="nameEn"
                        placeholder="Nhập tên loại tour bằng tiếng Anh (VD: Ecotourism, Discovery...)"
                    />
                </Col>
            </ModalForm>
        </>
    )
}

export default ModalCategory;