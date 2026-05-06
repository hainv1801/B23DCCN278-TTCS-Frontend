import { useState, useEffect } from 'react';
import {
    HomeOutlined,
    CompassOutlined,
    GlobalOutlined,
    ContactsOutlined,
    FireOutlined,
    LogoutOutlined,
    MenuFoldOutlined
} from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, MenuProps, Space, message, Menu, ConfigProvider } from 'antd';
import styles from '@/styles/client.module.scss';
import { isMobile } from 'react-device-detect';
import { FaReact } from 'react-icons/fa';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';

const Header = (props: any) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

    const [current, setCurrent] = useState('home');
    const location = useLocation();

    const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location])

    // Cập nhật icon du lịch
    const items: MenuProps['items'] = [
        {
            label: <Link to={'/'}>Trang Chủ</Link>,
            key: '/',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to={'/tour'}>Tour Du Lịch</Link>,
            key: '/tour',
            icon: <CompassOutlined />,
        },
        {
            label: <Link to={'/destination'}>Địa Điểm Hot</Link>,
            key: '/destination',
            icon: <GlobalOutlined />,
        }
    ];

    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const itemsDropdown = [
        {
            label: <span onClick={() => setOpenManageAccount(true)}>Quản lý tài khoản</span>,
            key: 'manage-account',
            icon: <ContactsOutlined />
        },
        ...(user.role?.permissions?.length ? [{
            label: <Link to={"/admin"}>Trang Quản Trị</Link>,
            key: 'admin',
            icon: <FireOutlined />
        }] : []),
        {
            label: <span onClick={() => handleLogout()}>Đăng xuất</span>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    const itemsMobiles = [...items, ...itemsDropdown];

    return (
        <>
            <div className={styles["header-section"]} style={{ backgroundColor: '#222831', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className={styles["container"]}>
                    {!isMobile ?
                        <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 20 }}>

                            {/* 1. KHU VỰC LOGO: Thêm flexShrink: 0 để không bị ép nhỏ */}
                            <div className={styles['brand']} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
                                <FaReact size={30} color="#1890ff" title='Booking Tour' />
                                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                    NVH<span style={{ color: '#1890ff' }}>Travel</span>
                                </span>
                            </div>

                            {/* 2. KHU VỰC MENU: display: block và width: 100% để Antd tính toán đúng */}
                            <div className={styles['top-menu']} style={{ flex: 1, minWidth: 0, display: 'block' }}>
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorPrimary: '#1890ff',
                                            colorBgContainer: 'transparent',
                                            colorText: '#e0e0e0',
                                            fontSize: 16,
                                        },
                                        components: {
                                            Menu: {
                                                horizontalItemSelectedColor: '#fff',
                                                itemHoverColor: '#fff',
                                            }
                                        }
                                    }}
                                >
                                    <Menu
                                        selectedKeys={[current]}
                                        mode="horizontal"
                                        items={items}
                                        // Bỏ display flex ở đây, dùng justifyContent của chính Antd
                                        style={{ borderBottom: 'none', width: '100%', justifyContent: 'center', backgroundColor: 'transparent' }}
                                    />
                                </ConfigProvider>
                            </div>

                            {/* 3. KHU VỰC USER / ĐĂNG NHẬP: Thêm flexShrink: 0 */}
                            <div className={styles['extra']} style={{ flexShrink: 0 }}>
                                {isAuthenticated === false ?
                                    <Link to={'/login'} style={{
                                        padding: '8px 20px',
                                        backgroundColor: '#1890ff',
                                        color: '#fff',
                                        borderRadius: '4px',
                                        fontWeight: 500,
                                        textDecoration: 'none'
                                    }}>
                                        Đăng Nhập
                                    </Link>
                                    :
                                    <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                        <Space style={{ cursor: "pointer", color: '#fff', padding: '5px 10px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                            <span>Welcome {user?.name}</span>
                                            <Avatar style={{ backgroundColor: '#1890ff' }}>
                                                {user?.name?.substring(0, 2)?.toUpperCase()}
                                            </Avatar>
                                        </Space>
                                    </Dropdown>
                                }
                            </div>

                        </div>
                        :
                        /* HEADER GIAO DIỆN MOBILE */
                        <div className={styles['header-mobile']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '15px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
                                <FaReact size={24} color="#1890ff" />
                                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                                    Viet<span style={{ color: '#1890ff' }}>Travel</span>
                                </span>
                            </div>
                            <MenuFoldOutlined style={{ fontSize: '24px', color: '#fff' }} onClick={() => setOpenMobileMenu(true)} />
                        </div>
                    }
                </div>
            </div>

            <Drawer
                title="Menu Điều Hướng"
                placement="right"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
                styles={{ body: { padding: 0 } }}
            >
                <Menu
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="vertical"
                    items={itemsMobiles}
                    style={{ borderRight: 'none' }}
                />
            </Drawer>

            <ManageAccount
                open={openMangeAccount}
                onClose={setOpenManageAccount}
            />
        </>
    )
};

export default Header;