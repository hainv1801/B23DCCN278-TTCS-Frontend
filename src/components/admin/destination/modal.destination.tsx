import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FooterToolbar, ModalForm, ProCard, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import 'styles/reset.scss';
import { isMobile } from 'react-device-detect';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from "react";
import { callCreateDestination, callUpdateDestination, callUploadSingleFile } from "@/config/api";
import { IDestination } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IDestination | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

// Chỉ chứa các trường do Ant Design Form quản lý
interface IFormValues {
    name: string;
    location: string;
}

interface IUploadedImage {
    name: string;
    uid: string;
}

const ModalDestination = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [animation, setAnimation] = useState<string>('open');
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);

    const [dataImage, setDataImage] = useState<IUploadedImage[]>([]);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [descriptionValue, setDescriptionValue] = useState<string>("");
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            setDescriptionValue(dataInit.description || "");
            form.setFieldsValue({
                name: dataInit.name,
                location: dataInit.location,
            });
            // Nếu có ảnh đã lưu từ trước thì hiển thị lên
            if (dataInit.image) {
                setDataImage([{
                    name: dataInit.image,
                    uid: uuidv4(),
                }]);
            }
        }
    }, [dataInit]);

    const submitDestination = async (valuesForm: IFormValues) => {
        if (dataImage.length === 0) {
            message.error('Vui lòng upload ảnh minh họa cho điểm đến!');
            return;
        }

        // Tạo object payload chuẩn bị gửi xuống Backend
        const payload: IDestination = {
            name: valuesForm.name,
            location: valuesForm.location,
            description: descriptionValue,
            image: dataImage[0].name // Lấy tên file ảnh đã upload
        };

        if (dataInit?.id) {
            // Cập nhật (truyền thêm ID vào payload)
            const updatePayload = { ...payload, id: dataInit.id };
            const res = await callUpdateDestination(updatePayload);
            if (res.data) {
                message.success("Cập nhật điểm đến thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({ message: 'Có lỗi xảy ra', description: res.message });
            }
        } else {
            // Tạo mới
            const res = await callCreateDestination(payload);
            if (res.data) {
                message.success("Thêm mới điểm đến thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({ message: 'Có lỗi xảy ra', description: res.message });
            }
        }
    };

    const handleReset = async () => {
        form.resetFields();
        setDescriptionValue("");
        setDataImage([]);
        setDataInit(null);

        setAnimation('close')
        await new Promise(r => setTimeout(r, 400))
        setOpenModal(false);
        setAnimation('open')
    };

    const handleRemoveFile = (file: any) => {
        setDataImage([]);
    };

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên file JPG/PNG/WEBP!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange = (info: any) => {
        if (info.file.status === 'uploading') {
            setLoadingUpload(true);
        }
        if (info.file.status === 'done') {
            setLoadingUpload(false);
        }
        if (info.file.status === 'error') {
            setLoadingUpload(false);
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
        }
    };

    const handleUploadFileImage = async ({ file, onSuccess, onError }: any) => {
        // Đã sửa 'company' thành 'destination' để API upload vào đúng thư mục
        const res = await callUploadSingleFile(file, "destination");
        if (res && res.data) {
            setDataImage([{
                name: res.data.fileName,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataImage([]);
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
    };

    return (
        <>
            {openModal &&
                <>
                    <ModalForm
                        title={<>{dataInit?.id ? "Cập nhật Điểm đến" : "Tạo mới Điểm đến"}</>}
                        open={openModal}
                        modalProps={{
                            onCancel: () => { handleReset() },
                            afterClose: () => handleReset(),
                            destroyOnClose: true,
                            width: isMobile ? "100%" : 900,
                            footer: null,
                            keyboard: false,
                            maskClosable: false,
                            className: `modal-destination ${animation}`,
                            rootClassName: `modal-destination-root ${animation}`
                        }}
                        scrollToFirstError={true}
                        preserve={false}
                        form={form}
                        onFinish={submitDestination}
                        initialValues={dataInit?.id ? dataInit : {}}
                        submitter={{
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                            submitButtonProps: { icon: <CheckSquareOutlined /> },
                            searchConfig: {
                                resetText: "Hủy",
                                submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                            }
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <ProFormText
                                    label="Tên điểm đến"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Ví dụ: Vịnh Hạ Long, Sapa..."
                                />
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Ảnh minh họa"
                                    name="image"
                                    rules={[{
                                        required: true,
                                        message: 'Vui lòng upload ảnh',
                                        validator: () => {
                                            if (dataImage.length > 0) return Promise.resolve();
                                            else return Promise.reject(false);
                                        }
                                    }]}
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="image"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={handleUploadFileImage}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChange}
                                            onRemove={(file) => handleRemoveFile(file)}
                                            onPreview={handlePreview}
                                            defaultFileList={
                                                dataInit?.id && dataInit?.image ?
                                                    [
                                                        {
                                                            uid: uuidv4(),
                                                            name: dataInit?.image ?? "",
                                                            status: 'done',
                                                            url: `${import.meta.env.VITE_BACKEND_URL}/storage/destination/${dataInit?.image}`,
                                                        }
                                                    ] : []
                                            }
                                        >
                                            <div>
                                                {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        </Upload>
                                    </ConfigProvider>
                                </Form.Item>
                            </Col>

                            <Col span={16}>
                                <ProFormTextArea
                                    label="Vị trí / Tỉnh thành"
                                    name="location"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập vị trí (VD: Quảng Ninh, Lào Cai...)"
                                    fieldProps={{
                                        autoSize: { minRows: 4 }
                                    }}
                                />
                            </Col>

                            <ProCard
                                title="Mô tả chi tiết"
                                headStyle={{ color: '#d81921' }}
                                style={{ marginBottom: 20 }}
                                headerBordered
                                size="small"
                                bordered
                            >
                                <Col span={24}>
                                    <ReactQuill
                                        theme="snow"
                                        value={descriptionValue}
                                        onChange={setDescriptionValue}
                                    />
                                </Col>
                            </ProCard>
                        </Row>
                    </ModalForm>

                    <Modal
                        open={previewOpen}
                        title={previewTitle}
                        footer={null}
                        onCancel={() => setPreviewOpen(false)}
                        style={{ zIndex: 1500 }}
                    >
                        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </>
            }
        </>
    )
}

export default ModalDestination;