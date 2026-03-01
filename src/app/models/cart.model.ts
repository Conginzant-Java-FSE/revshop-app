export interface CartItem {
    productId: number;
    productName: string;
    imageUrl: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface Cart {
    items: CartItem[];
    totalItems: number;
    grandTotal: number;
}
