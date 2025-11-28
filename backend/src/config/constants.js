export const CATEGORIES = ['pc-parts', 'laptops', 'cctv', 'accessories'];

export const STOCK_STATUS = {
    IN_STOCK: 'in-stock',
    LOW_STOCK: 'low-stock',
    OUT_OF_STOCK: 'out-of-stock'
};

export const PAYMENT_METHODS = {
    BANK_TRANSFER: 'bank-transfer',
    CASH_ON_DELIVERY: 'cash-on-delivery'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending_confirmation',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
    REFUNDED: 'refunded'
};

export const SHIPPING_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    MANAGER: 'manager'
};

export const AUTH_PROVIDERS = {
    LOCAL: 'local',
    GOOGLE: 'google'
};
