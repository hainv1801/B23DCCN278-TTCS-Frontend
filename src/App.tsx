import { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import Loading from 'components/share/loading';
import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import Header from 'components/client/header.client';
import Footer from 'components/client/footer.client';
import HomePage from 'pages/home';
import styles from 'styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import DestinationPage from './pages/admin/destination';
import PermissionPage from './pages/admin/permission';
import BookingPage from './pages/admin/booking';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import { fetchAccount } from './redux/slice/accountSlide';
import LayoutApp from './components/share/layout.app';
import ViewUpsertTour from './components/admin/tour/upsert.tour';
import ClientTourPage from './pages/tour';
import ClientTourDetailPage from './pages/tour/detail';
import ClientDestinationPage from './pages/destination';
import ClientDestinationDetailPage from './pages/destination/detail';
import TourTabs from './pages/admin/tour/tour.tabs';
import PaymentReturnPage from './pages/payment/PaymentReturnPage';
// import CategoryPage from './pages/admin/category';
import ViewUpsertTourSchedule from './components/admin/tour/upsert.tour.schedule';
import MyTasksPage from './pages/admin/MyTasksPage';
import TourSchedulePage from './pages/admin/tourschedule';
import VoucherPage from './pages/admin/voucher';
const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth' });
    }

  }, [location]);

  return (
    <div className='layout-app' ref={rootRef}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className={styles['content-app']}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);


  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    dispatch(fetchAccount())
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "tour", element: <ClientTourPage /> },
        { path: "tour/:id", element: <ClientTourDetailPage /> },
        { path: "destination", element: <ClientDestinationPage /> },
        { path: "destination/:id", element: <ClientDestinationDetailPage /> },
        { path: "payments/vnpay-return", element: <PaymentReturnPage /> }
      ],
    },

    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /> </LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true, element:
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
        },
        {
          path: "destination",
          element:
            <ProtectedRoute>
              <DestinationPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },

        {
          path: "tour",
          children: [
            {
              index: true,
              element: <ProtectedRoute><TourTabs /></ProtectedRoute>
            },
            {
              path: "upsert", element:
                <ProtectedRoute><ViewUpsertTour /></ProtectedRoute>
            }
          ]
        },
        {
          path: "tour-schedule",
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <TourSchedulePage />
                </ProtectedRoute>
              )
            },
            {
              path: "upsert",
              element: (
                <ProtectedRoute>
                  <ViewUpsertTourSchedule />
                </ProtectedRoute>
              )
            }
          ]
        },
        {
          path: "my-tasks",
          element:
            <ProtectedRoute>
              <MyTasksPage />
            </ProtectedRoute>
        },
        {
          path: "booking",
          element:
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
        },
        {
          path: "voucher",
          element:
            <ProtectedRoute>
              <VoucherPage />
            </ProtectedRoute>
        },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        }
      ],
    },

    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}