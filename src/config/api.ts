import { IBackendRes, IAccount, IUser, IModelPaginate, IGetAccount, IPermission, IRole, IBooking, ICategory, IDestination, IPayment, ITour, ITourSchedule} from '@/types/backend';
import axios from 'config/axios-customize';

/**
 * 
Module Auth
 */
export const callRegister = (name: string, email: string, password: string, age: number, gender: string, address: string) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { name, email, password, age, gender, address })
}

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folderType);

    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}




/**
 *
Module Destination
 */
export const callCreateDestination = (destination: IDestination) => {
    return axios.post<IBackendRes<IDestination>>('/api/v1/destinations', destination)
}

export const callUpdateDestination = (destination: IDestination) => {
    return axios.put<IBackendRes<IDestination>>(`/api/v1/destinations`,destination)
}

export const callDeleteDestination = (id: string | number) => {
    return axios.delete<IBackendRes<IDestination>>(`/api/v1/destinations/${id}`);
}

export const callFetchDestination = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IDestination>>>(`/api/v1/destinations?${query}`);
}

export const callFetchDestinationById = (id: string | number) => {
    return axios.get<IBackendRes<IDestination>>(`/api/v1/destinations/${id}`);
}

/**
 * 
Module Category
 */
export const callCreateCategory = (category : ICategory) => {
    return axios.post<IBackendRes<ICategory>>('/api/v1/categories', category)
}

export const callUpdateCategory = (category : ICategory) => {
    return axios.put<IBackendRes<ICategory>>(`/api/v1/categories`, category)
}

export const callDeleteCategory = (id: string | number) => {
    return axios.delete<IBackendRes<ICategory>>(`/api/v1/categories/${id}`);
}

export const callFetchAllCategory = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICategory>>>(`/api/v1/categories?${query}`);
}



/**
 * 
Module User
 */
export const callCreateUser = (user: IUser) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user })
}

export const callUpdateUser = (user: IUser) => {
    return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user })
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callFetchUser = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

export const callFetchAvailableGuides = (startDate: string, endDate: string) => {
    return axios.get(`/api/v1/users/available-guides?startDate=${startDate}&endDate=${endDate}`);
};
/**
 *
Module Tour
 */
export const callCreateTour = (tour: ITour) => {
    return axios.post<IBackendRes<ITour>>('/api/v1/tours', tour)
}

export const callUpdateTour = (tour: ITour) => {
    return axios.put<IBackendRes<ITour>>(`/api/v1/tours`, tour)
}

export const callDeleteTour = (id: string | number) => {
    return axios.delete<IBackendRes<ITour>>(`/api/v1/tours/${id}`);
}

export const callFetchTour = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ITour>>>(`/api/v1/tours?${query}`);
}

export const callFetchTourById = (id: string | number) => {
    return axios.get<IBackendRes<ITour>>(`/api/v1/tours/${id}`);
}

/**
 * ==========================================
 * MODULE TOUR SCHEDULES (Lịch khởi hành)
 * ==========================================
 */
export const callCreateTourSchedule = (schedule: any) => {
    return axios.post<IBackendRes<ITourSchedule>>('/api/v1/tour-schedules', schedule)
}
export const callUpdateTourSchedule = (schedule: any) => {
    return axios.put<IBackendRes<ITourSchedule>>(`/api/v1/tour-schedules`, schedule)
}
export const callDeleteTourSchedule = (id: number | string) => {
    return axios.delete<IBackendRes<any>>(`/api/v1/tour-schedules/${id}`);
}
export const callFetchTourSchedule = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ITourSchedule>>>(`/api/v1/tour-schedules?${query}`);
}
export const callFetchTourScheduleById = (id: number | string) => {
    return axios.get<IBackendRes<ITourSchedule>>(`/api/v1/tour-schedules/${id}`);
}

export const callFetchMyTasks = (query: string) => {
    return axios.get(`/api/v1/tour-schedules/my-tasks?${query}`);
};
/**
 * 
Module Booking
 */
export const callCreateBooking = (bookingReq : any ) => {
    return axios.post<IBackendRes<IBooking>>('/api/v1/bookings', bookingReq)
}

export const callUpdateBookingStatus = (booking : Partial<IBooking>) => {
    return axios.put<IBackendRes<IBooking>>(`/api/v1/bookings`, booking)
}

export const callDeleteBooking = (id: string) => {
    return axios.delete<IBackendRes<IBooking>>(`/api/v1/bookings/${id}`);
}

export const callFetchBooking = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IBooking>>>(`/api/v1/bookings?${query}`);
}

export const callFetchBookingById = (id: string) => {
    return axios.get<IBackendRes<IBooking>>(`/api/v1/bookings/${id}`);
}

export const callFetchBookingByUser = (query: string) => {
    return axios.post<IBackendRes<IModelPaginate<IBooking>>>(`/api/v1/bookings/by-user?${query}`);
}

/**
 * 
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission })
}

export const callUpdatePermission = (permission: IPermission, id: string) => {
    return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions`, { id, ...permission })
}

export const callDeletePermission = (id: string) => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

export const callFetchPermission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}

export const callFetchPermissionById = (id: string) => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

/**
 * 
Module Role
 */
export const callCreateRole = (role: IRole) => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role })
}

export const callUpdateRole = (role: IRole, id: string) => {
    return axios.put<IBackendRes<IRole>>(`/api/v1/roles`, { id, ...role })
}

export const callDeleteRole = (id: string) => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

export const callFetchRole = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}

export const callFetchRoleById = (id: string) => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}


// Gọi API tạo URL thanh toán VNPay (Giả định bạn đã làm theo hướng dẫn Backend lúc trước)
export const callCreatePaymentUrl = (data: any) => {
    return axios.post(`/api/v1/payments/create-payment-url`, data);
};
export const callVerifyVNPay = (queryString: string) => {
    // Truyền toàn bộ query parameter xuống backend để verify
    return axios.get(`/api/v1/payments/vnpay-return?${queryString}`);
};

/**
 * Module Comments
 */
export const callFetchCommentsByTour = (tourId: number, query: string) => {
    return axios.get(`/api/v1/comments/tour/${tourId}?${query}`);
};

// Kiểm tra quyền
export const callCheckCommentEligibility = (tourId: number) => {
    return axios.get(`/api/v1/comments/check-eligibility?tourId=${tourId}`);
};

// Đăng bình luận
export const callCreateComment = (data: any) => {
    return axios.post('/api/v1/comments', data);
};

// --- API VOUCHER ---
export const callFetchVoucher = (query: string) => {
    return axios.get(`/api/v1/vouchers?${query}`);
}
export const callCreateVoucher = (data: any) => {
    return axios.post('/api/v1/vouchers', data);
}
export const callUpdateVoucher = (data: any) => {
    return axios.put('/api/v1/vouchers', data);
}
export const callDeleteVoucher = (id: number) => {
    return axios.delete(`/api/v1/vouchers/${id}`);
}
export const callCheckVoucher = (data: { code: string, orderTotal: number }) => {
    return axios.post('/api/v1/vouchers/check', data);
}