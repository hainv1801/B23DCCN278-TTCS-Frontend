import { ModalForm, ProForm, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from "react";
import { callCreateUser, callFetchRole, callUpdateUser } from "@/config/api";
import { IUser } from "@/types/backend";
import { DebounceSelect } from "./debouce.select";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IUser | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface ICompanySelect {
    label: string;
    value: string;
    key?: string;
}

const ModalUser = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [roles, setRoles] = useState<ICompanySelect[]>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            console.log("User", dataInit);
            // Nếu có dữ liệu role, set vào state để DebounceSelect hiển thị đúng label ban đầu
            if (dataInit.roleUser) {
                setRoles([{
                    label: dataInit.roleUser.name,
                    value: dataInit.roleUser.id,
                }]);
            }

            form.setFieldsValue({
                ...dataInit,
                // Chuyển đổi về dạng object {label, value} để phù hợp với Select
                role: dataInit.roleUser ? { label: dataInit.roleUser.name, value: dataInit.roleUser.id } : undefined,
            });
        }
    }, [dataInit, form]);

    const handleReset = () => {
        form.resetFields();
        setDataInit(null);
        setRoles([]);
        setOpenModal(false);
    }

    const submitUser = async (valuesForm: any) => {
        const { name, email, password, address, age, gender, role } = valuesForm;

        // Kiểm tra an toàn trước khi truy cập .value
        const roleId = role?.value || role; // Đề phòng trường hợp role chỉ là string/number id

        const user: any = {
            name,
            email,
            password,
            age,
            gender,
            address,
            role: { id: roleId },
        }

        if (dataInit?.id) {
            user.id = dataInit.id;
            const res = await callUpdateUser(user);
            if (res.data) {
                message.success("Cập nhật user thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            const res = await callCreateUser(user);
            if (res.data) {
                message.success("Thêm mới user thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    async function fetchRoleList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchRole(`page=1&size=100&name=/${name}/i`);
        if (res && res.data) {
            return res.data.result.map((item: any) => ({
                label: item.name,
                value: item.id
            }));
        }
        return [];
    }

    return (
        <ModalForm
            title={dataInit?.id ? "Cập nhật User" : "Tạo mới User"}
            open={openModal}
            form={form}
            onFinish={submitUser}
            modalProps={{
                onCancel: handleReset,
                afterClose: handleReset,
                destroyOnClose: true,
                width: isMobile ? "100%" : 900,
                keyboard: false,
                maskClosable: false,
                okText: dataInit?.id ? "Cập nhật" : "Tạo mới",
                cancelText: "Hủy"
            }}
        >
            <Row gutter={16}>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormText
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng không bỏ trống' },
                            { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                        ]}
                        placeholder="Nhập email"
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormText.Password
                        disabled={!!dataInit?.id}
                        label="Password"
                        name="password"
                        rules={[{ required: !dataInit?.id, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập password"
                    />
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProFormText
                        label="Tên hiển thị"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập tên hiển thị"
                    />
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProFormDigit
                        label="Tuổi"
                        name="age"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập tuổi"
                    />
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProFormSelect
                        name="gender"
                        label="Giới Tính"
                        valueEnum={{
                            MALE: 'Nam',
                            FEMALE: 'Nữ',
                            OTHER: 'Khác',
                        }}
                        placeholder="Chọn giới tính"
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                    />
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProForm.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <DebounceSelect
                            showSearch
                            placeholder="Chọn vai trò"
                            fetchOptions={fetchRoleList}
                            // Không cần defaultValue={roles} ở đây vì ProFormText/setFieldsValue đã quản lý rồi
                            style={{ width: '100%' }}
                        />
                    </ProForm.Item>
                </Col>
                <Col lg={24} md={24} sm={24} xs={24}>
                    <ProFormText
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập địa chỉ"
                    />
                </Col>
            </Row>
        </ModalForm>
    );
}

export default ModalUser;