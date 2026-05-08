export const ALL_PERMISSIONS = {
    DESTINATIONS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/destinations', module: "DESTINATIONS" },
        CREATE: { method: "POST", apiPath: '/api/v1/destinations', module: "DESTINATIONS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/destinations', module: "DESTINATIONS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/destinations/{id}', module: "DESTINATIONS" },
    },
    TOURS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/tours', module: "TOURS" },
        CREATE: { method: "POST", apiPath: '/api/v1/tours', module: "TOURS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/tours', module: "TOURS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/tours/{id}', module: "TOURS" },
    },
    TOUR_SCHEDULES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/tour-schedules', module: "TOUR_SCHEDULES" },
        CREATE: { method: "POST", apiPath: '/api/v1/tour-schedules', module: "TOUR_SCHEDULES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/tour-schedules', module: "TOUR_SCHEDULES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/tour-schedules/{id}', module: "TOUR_SCHEDULES" },
    },
    PERMISSIONS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        CREATE: { method: "POST", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/permissions/{id}', module: "PERMISSIONS" },
    },
    BOOKINGS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/bookings', module: "BOOKINGS" },
        CREATE: { method: "POST", apiPath: '/api/v1/bookings', module: "BOOKINGS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/bookings', module: "BOOKINGS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/bookings/{id}', module: "BOOKINGS" },
    },
    PAYMENTS: {
        CREATE: {method: "POST", apiPath: '/api/v1/payments', module:"PAYMENTS"},
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/payments', module: "PAYMENTS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/payments', module: "PAYMENTS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/payments/{id}', module: "PAYMENTS" },
        CREATE_URL: {method: "POST", apiPath: '/api/v1/payments/create-payment-url', module:"PAYMENTS"},
        GET_RETURN: { method: "GET", apiPath: '/api/v1/payments/vnpay-return', module: "PAYMENTS" }
    },
    ROLES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/roles', module: "ROLES" },
        CREATE: { method: "POST", apiPath: '/api/v1/roles', module: "ROLES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/roles', module: "ROLES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/roles/{id}', module: "ROLES" },
    },
    USERS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/users', module: "USERS" },
        CREATE: { method: "POST", apiPath: '/api/v1/users', module: "USERS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/users', module: "USERS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/users/{id}', module: "USERS" },
    },
}