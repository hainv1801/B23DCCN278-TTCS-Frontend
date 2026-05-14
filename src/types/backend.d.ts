export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        age?: number;
        gender?: string;
        address?: string;
        role: {
            id: string;
            name: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[]
        }
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> {
}

export interface IUser {
    id?: string;
    name: string;
    email: string;
    password?: string;
    age: number;
    gender: string;
    address: string;
    roleUser?: {
        id: string;
        name: string;
    }

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}


export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IDestination {
    id?: number;
    name: string;
    description?: string;
    location?: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface ICategory {
    id?: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface ITour {
    id?: number;
    name: string;
    basePrice: number;
    duration: number;
    description: string;
    destination?: IDestination
    categories?: ICategory[];
    tourSchedules?: ITourSchedule[];
    createdAt?: string;
    updatedAt?: string; 
    createdBy?: string;
    updatedBy?: string;
}

export interface ITourSchedule {
    id?: number;
    departureDate: string; // Date string
    returnDate: string;
    priceAdult: number;
    priceChild: number;
    capacity: number;
    bookedSeats: number;
    status: 'OPEN' | 'CLOSED' | 'CANCELLED' | 'FULL';
    tourInfo?: {
        id: number;
        name: string;
    };
    guideInfo?:{
        id: number;
        name: string;
        email: string;
    }
    createdAt?: string;
    updatedAt?: string;
}

export interface IBooking {
    id?: number;
    bookingDate: string;
    totalAdults: number;
    totalChildren: number;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'| 'COMPLETED';
    paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
    note?: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    schedule?: {
        id: number;
        tourName: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface IPayment {
    id?: number;
    booking?: IBooking;
    amount: number;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'VNPAY';
    status: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';
    transactionCode: string;
    bankCode: string;
    paymentDate: string;
}