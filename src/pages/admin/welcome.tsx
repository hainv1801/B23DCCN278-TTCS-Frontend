import { useAppSelector } from '@/redux/hooks';
import { Card, Typography } from 'antd';
import { SmileOutlined, CrownOutlined, UserOutlined } from '@ant-design/icons';
import styles from 'styles/admin.module.scss'; // Dùng CSS module của bạn nếu cần

const { Title, Text } = Typography;

const WelcomeAdminPage = () => {
    // Lấy thông tin user từ Redux để hiển thị tên và chức vụ
    const user = useAppSelector(state => state.account.user);

    // Xác định icon theo Role cho đẹp
    const renderRoleIcon = () => {
        if (user?.role?.name === 'Admin' || user?.role?.name === 'SUPER_ADMIN') {
            return <CrownOutlined style={{ fontSize: '72px', color: '#faad14', marginBottom: '20px' }} />;
        }
        return <UserOutlined style={{ fontSize: '72px', color: '#1890ff', marginBottom: '20px' }} />;
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
            <Card
                bordered={false}
                style={{
                    textAlign: 'center',
                    padding: '50px 40px',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    maxWidth: '600px',
                    width: '100%'
                }}
            >
                {renderRoleIcon()}

                <Title level={2} style={{ marginBottom: '8px' }}>
                    Chào mừng trở lại, <span style={{ color: '#1890ff' }}>{user?.name || user?.email}</span>!
                </Title>

                {/* <Text type="secondary" style={{ fontSize: '16px' }}>
                    Vai trò của bạn: <strong style={{ color: '#555' }}>{user?.role?.name || 'Nhân viên'}</strong>
                </Text> */}

                {/* <div style={{ margin: '40px 0 20px 0', padding: '20px', backgroundColor: '#f0f2f5', borderRadius: '12px' }}>
                    <Text style={{ fontSize: '15px', color: '#555' }}>
                        Hệ thống quản trị nội dung NVHTravel.<br />
                        Vui lòng lựa chọn các chức năng trên thanh công cụ bên trái để bắt đầu công việc.
                    </Text>
                </div> */}

                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                    Chúc bạn một ngày làm việc hiệu quả! <SmileOutlined />
                </Text>
            </Card>
        </div>
    );
};

export default WelcomeAdminPage;