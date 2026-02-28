export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderRequest {
    userId: number;
    shippingAddressId: number;
    billingAddressId: number;
    items: OrderItemRequest[];
    paymentMethod: string;
}

export interface OrderItemResponse {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface OrderResponse {
    orderId: number;
    orderNumber: string;
    totalAmount: number;
    status: string;
    orderDate: string;
    paymentMethod: string;
    items: OrderItemResponse[];
}
