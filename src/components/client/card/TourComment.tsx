import { useState, useEffect } from 'react';
import { List, Avatar, Input, Button, Rate, message, Form, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';
import { callFetchCommentsByTour, callCheckCommentEligibility, callCreateComment } from '@/config/api';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface IProps {
    tourId: number;
}

const TourComment = (props: IProps) => {
    const { tourId } = props;
    const { t } = useTranslation();
    const [comments, setComments] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canComment, setCanComment] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [form] = Form.useForm();

    useEffect(() => {
        if (tourId) {
            fetchComments();
            if (isAuthenticated) {
                checkEligibility();
            }
        }
    }, [tourId, isAuthenticated]);

    const checkEligibility = async () => {
        const res = await callCheckCommentEligibility(tourId);
        if (res && res.data !== undefined) {
            setCanComment(res.data);
        }
    };

    const fetchComments = async () => {
        setIsFetching(true);
        // Lấy 100 comment mới nhất, sort giảm dần theo ngày
        const res = await callFetchCommentsByTour(tourId, 'page=0&size=100&sort=createdAt,desc');
        if (res && res.data) {
            setComments(res.data.result);
            setTotalItems(res.data.meta.total);
        }
        setIsFetching(false);
    };

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const dataSubmit = {
            tourId: tourId,
            content: values.content,
            rating: values.rating || 5
        };

        const res = await callCreateComment(dataSubmit);
        if (res && res.data) {
            message.success(t('comment.success', 'Đã gửi đánh giá thành công!'));
            form.resetFields();
            fetchComments();
        } else {
            message.error(t('common.error', 'Có lỗi xảy ra!'));
        }
        setIsSubmitting(false);
    };

    const renderCommentForm = () => {
        if (!isAuthenticated) {
            return (
                <div style={{ textAlign: 'center', padding: '30px 0', backgroundColor: '#fafafa', borderRadius: 12, border: '1px dashed #d9d9d9' }}>
                    <LockOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 10 }} />
                    <p style={{ color: '#595959', fontSize: 16 }}>{t('comment.loginPrompt', 'Đăng nhập để xem bạn có đủ điều kiện đánh giá không.')}</p>
                    <Button type="primary" href="/login">{t('header.login', 'Đăng nhập')}</Button>
                </div>
            );
        }

        if (!canComment) {
            return (
                <div style={{ textAlign: 'center', padding: '20px 0', backgroundColor: '#fffbe6', borderRadius: 12, border: '1px solid #ffe58f' }}>
                    <Text strong style={{ color: '#faad14', fontSize: 16 }}>{t('comment.onlyVerified', 'Chỉ khách hàng đã trải nghiệm mới được đánh giá')}</Text>
                    <p style={{ color: '#8c8c8c', marginTop: 5 }}>
                        {t('comment.verifiedPrompt', 'Hệ thống ghi nhận bạn chưa hoàn thành Tour này. Hãy đặt tour và trải nghiệm thực tế để để lại đánh giá nhé!')}
                    </p>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', gap: 16 }}>
                <Avatar size="large" style={{ backgroundColor: '#1890ff' }}>
                    {user?.name?.substring(0, 2)?.toUpperCase() || <UserOutlined />}
                </Avatar>
                <div style={{ flex: 1 }}>
                    <Form form={form} onFinish={onFinish}>
                        <Form.Item name="rating" initialValue={5} style={{ marginBottom: 8 }}>
                            <Rate />
                        </Form.Item>
                        <Form.Item name="content" rules={[{ required: true, message: t('comment.requireMsg', 'Vui lòng nhập nội dung!') }]}>
                            <TextArea rows={4} placeholder={t('comment.placeholder', 'Chia sẻ trải nghiệm chân thực của bạn về tour này...')} />
                        </Form.Item>
                        <Form.Item style={{ textAlign: 'right', margin: 0 }}>
                            <Button htmlType="submit" loading={isSubmitting} type="primary" size="large">
                                {t('comment.btnSubmit', 'Gửi Đánh Giá')}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        );
    };

    return (
        <div style={{ marginTop: 40, backgroundColor: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Title level={3} style={{ marginBottom: 30 }}>{t('comment.title', 'Đánh giá & Bình luận')} ({totalItems})</Title>
            <div style={{ marginBottom: 40 }}>{renderCommentForm()}</div>

            <List
                loading={isFetching}
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#87d068' }}>{item.user?.name?.substring(0, 1)}</Avatar>}
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontWeight: 'bold' }}>{item.user?.name}</span>
                                    <Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} />
                                    <span style={{ color: '#888', fontSize: 12, marginLeft: 'auto' }}>
                                        {dayjs(item.createdAt).locale('vi').fromNow()}
                                    </span>
                                </div>
                            }
                            description={<div style={{ color: '#333', marginTop: 8 }}>{item.content}</div>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TourComment;