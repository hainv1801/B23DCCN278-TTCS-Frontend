import { useState, useEffect } from 'react';
import { Select, Avatar, Drawer, Dropdown, MenuProps, Space, message, Menu, ConfigProvider, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    HomeOutlined,
    CompassOutlined,
    GlobalOutlined,
    ContactsOutlined,
    FireOutlined,
    LogoutOutlined,
    MenuFoldOutlined
} from '@ant-design/icons';
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

    // Gọi t và i18n từ react-i18next
    const { t, i18n } = useTranslation();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);
    const [current, setCurrent] = useState('home');
    const location = useLocation();
    const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

    const handleChangeLanguage = (value: string) => {
        i18n.changeLanguage(value);
    };

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location]);

    // Thay thế text tĩnh bằng hàm t() để đa ngôn ngữ
    const items: MenuProps['items'] = [
        {
            label: <Link to={'/'}>{t('header.home', 'Trang Chủ')}</Link>,
            key: '/',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to={'/tour'}>{t('header.tour', 'Tour Du Lịch')}</Link>,
            key: '/tour',
            icon: <CompassOutlined />,
        },
        {
            label: <Link to={'/destination'}>{t('header.destination', 'Địa Điểm Hot')}</Link>,
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
            message.success(t('header.logoutSuccess', 'Đăng xuất thành công'));
            navigate('/');
        }
    };

    const itemsDropdown = [
        {
            label: <span onClick={() => setOpenManageAccount(true)}>{t('header.account')}</span>,
            key: 'manage-account',
            icon: <ContactsOutlined />
        },
        ...(user.role?.permissions?.length && user.role?.name != 'Customer' ? [{
            label: <Link to={"/admin"}>{t('header.admin')}</Link>,
            key: 'admin',
            icon: <FireOutlined />
        }] : []),
        {
            label: <span onClick={() => handleLogout()}>{t('header.logout')}</span>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    const itemsMobiles = [...items, ...itemsDropdown];

    // Tạo Component Select Ngôn Ngữ dùng chung cho cả Mobile và Desktop
    const LanguageSwitcher = () => (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm, // Kích hoạt giao diện tối cho ô Select
                token: {
                    colorBgContainer: 'rgba(255,255,255,0.1)', // Nền trong suốt nhẹ
                    colorBorder: 'transparent',
                }
            }}
        >
            <Select
                defaultValue={i18n.language || 'vi'}
                style={{ width: 135 }}
                onChange={handleChangeLanguage}
                options={[
                    { value: 'vi', label: '🇻🇳 Tiếng Việt' },
                    { value: 'en', label: '🇺🇸 English' },
                ]}
            />
        </ConfigProvider>
    );

    return (
        <>
            <div className={styles["header-section"]} style={{ backgroundColor: '#222831', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className={styles["container"]}>
                    {!isMobile ?
                        <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 20 }}>
                            {/* 1. KHU VỰC LOGO */}
                            <div className={styles['brand']} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
                                <FaReact size={30} color="#1890ff" title='Booking Tour' />
                                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                    NVH<span style={{ color: '#1890ff' }}>Travel</span>
                                </span>
                            </div>

                            {/* 2. KHU VỰC MENU */}
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
                                        style={{ borderBottom: 'none', width: '100%', justifyContent: 'center', backgroundColor: 'transparent' }}
                                    />
                                </ConfigProvider>
                            </div>

                            {/* 3. KHU VỰC ĐIỀU KHIỂN (NGÔN NGỮ + USER) - Gom chung bằng Flex */}
                            <div className={styles['extra']} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>

                                {/* Gắn Language Switcher vào đây */}
                                <LanguageSwitcher />

                                {isAuthenticated === false ?
                                    <Link to={'/login'} style={{
                                        padding: '8px 20px',
                                        backgroundColor: '#1890ff',
                                        color: '#fff',
                                        borderRadius: '4px',
                                        fontWeight: 500,
                                        textDecoration: 'none'
                                    }}>
                                        {t('header.login', 'Đăng Nhập')}
                                    </Link>
                                    :
                                    <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                        <Space style={{ cursor: "pointer", color: '#fff', padding: '5px 10px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                            <span>{t('header.welcome', 'Xin chào')} {user?.name}</span>
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
                                    NVH<span style={{ color: '#1890ff' }}>Travel</span>
                                </span>
                            </div>

                            {/* Gom Language Switcher và Menu ba gạch lại với nhau */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <LanguageSwitcher />
                                <MenuFoldOutlined style={{ fontSize: '24px', color: '#fff' }} onClick={() => setOpenMobileMenu(true)} />
                            </div>
                        </div>
                    }
                </div>
            </div>

            <Drawer
                title={t('header.menuTitle', 'Menu Điều Hướng')}
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