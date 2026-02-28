export interface Product {
    productId: number;
    name: string;
    description: string;
    mrp: number;
    sellingPrice: number;
    stockQuantity: number;
    thresholdQuantity: number;
    isActive: boolean;
    categoryId: number;
    sellerId: number;
}
