import React, { useState, useEffect } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    ApiOutlined,
    UserOutlined,
    BankOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AliwangwangOutlined,
    BugOutlined,
    ScheduleOutlined,
    CalendarOutlined,
    GiftOutlined
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { callLogout } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);

    const permissions = useAppSelector(state => state.account.user.role.permissions);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
        const userRoleName = user?.role?.name;
        console.log(user);
        if (permissions?.length || ACL_ENABLE === 'false') {

            const viewDestination = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.DESTINATIONS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.DESTINATIONS.GET_PAGINATE.method
            )

            const viewUser = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            const viewTour = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.TOURS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.TOURS.GET_PAGINATE.method
            )
            const viewTourSchedule = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.TOUR_SCHEDULES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.TOUR_SCHEDULES.GET_PAGINATE.method
            )
            const viewBooking = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.BOOKINGS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.BOOKINGS.GET_PAGINATE.method
            )

            const viewRole = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
            )

            const viewPermission = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.method
            )
            const viewVoucher = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.VOUCHERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.VOUCHERS.GET_PAGINATE.method
            )
            const full = [
                {
                    label: <Link to='/admin'>Dashboard</Link>,
                    key: '/admin',
                    icon: <AppstoreOutlined />
                },
                ...(viewDestination || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/destination'>Destination</Link>,
                    key: '/admin/destination',
                    icon: <BankOutlined />,
                }] : []),

                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/user'>User</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined />
                }] : []),
                ...(viewTour || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/tour'>Tour</Link>,
                    key: '/admin/tour',
                    icon: <ScheduleOutlined />
                }] : []),
                ...(viewTourSchedule || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/tour-schedule'>Tour Schedule</Link>,
                    key: '/admin/tour-schedule',
                    icon: <ScheduleOutlined />
                }] : []),
                ...(userRoleName === 'Guide' || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/my-tasks'>Lịch phân công</Link>,
                    key: '/admin/my-tasks',
                    icon: <CalendarOutlined />
                }] : []),
                ...(viewBooking || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/booking'>Booking</Link>,
                    key: '/admin/booking',
                    icon: <AliwangwangOutlined />
                }] : []),
                ...(viewVoucher || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/voucher'>Voucher</Link>,
                    key: '/admin/voucher',
                    icon: <GiftOutlined />
                }] : []),
                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/permission'>Permission</Link>,
                    key: '/admin/permission',
                    icon: <ApiOutlined />
                }] : []),
                ...(viewRole || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/role'>Role</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                }] : []),



            ];

            setMenuItems(full);
        }
    }, [permissions])
    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    // if (isMobile) {
    //     items.push({
    //         label: <label
    //             style={{ cursor: 'pointer' }}
    //             onClick={() => handleLogout()}
    //         >Đăng xuất</label>,
    //         key: 'logout',
    //         icon: <LogoutOutlined />
    //     })
    // }

    const itemsDropdown = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },
    ];

    return (
        <>
            <Layout
                style={{ minHeight: '100vh' }}
                className="layout-admin"
            >
                {!isMobile ?
                    <Sider
                        theme='light'
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}>
                        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                            <BugOutlined />  ADMIN
                        </div>
                        <Menu
                            selectedKeys={[activeMenu]}
                            mode="inline"
                            items={menuItems}
                            onClick={(e) => setActiveMenu(e.key)}
                        />
                    </Sider>
                    :
                    <Menu
                        selectedKeys={[activeMenu]}
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                        mode="horizontal"
                    />
                }

                <Layout>
                    {!isMobile &&
                        <div className='admin-header' style={{ display: "flex", justifyContent: "space-between", marginRight: 20 }}>
                            <Button
                                type="text"
                                icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space style={{ cursor: "pointer" }}>
                                    Welcome {user?.name}
                                    <Avatar> {user?.name?.substring(0, 2)?.toUpperCase()} </Avatar>

                                </Space>
                            </Dropdown>
                        </div>
                    }
                    <Content style={{ padding: '15px' }}>
                        <Outlet />
                    </Content>
                    {/* <Footer style={{ padding: 10, textAlign: 'center' }}>
                        React Typescript series Nest.JS &copy; Hỏi Dân IT - Made with <HeartTwoTone />
                    </Footer> */}
                </Layout>
            </Layout>

        </>
    );
};

export default LayoutAdmin;