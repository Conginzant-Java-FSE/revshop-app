import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartDTO } from '../../services/cart';
import { AddressService, AddressDTO } from '../../services/address';
import { OrderService, OrderRequestDTO } from '../../services/order';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './checkout.html',
    styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
    cart = signal<CartDTO | null>(null);
    addresses = signal<AddressDTO[]>([]);
    selectedAddressId = signal<number | null>(null);
    paymentMethod = signal<string>('CREDIT_CARD');
    loading = signal<boolean>(true);

    constructor(
        private cartService: CartService,
        private addressService: AddressService,
        private orderService: OrderService,
        private router: Router,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        const userId = localStorage.getItem('userId');
        if (userId) {
            this.loadCart(Number(userId));
            this.loadAddresses(Number(userId));
        }
    }

    loadCart(userId: number): void {
        this.cartService.getCartByUserId(userId).subscribe({
            next: (res) => this.cart.set(res.data)
        });
    }

    loadAddresses(userId: number): void {
        this.addressService.getAddressesByUserId(userId).subscribe({
            next: (res) => {
                this.addresses.set(res.data);
                if (res.data.length > 0) {
                    const defaultAddr = res.data.find(a => a.isDefault);
                    this.selectedAddressId.set(defaultAddr ? defaultAddr.addressId! : res.data[0].addressId!);
                }
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    placeOrder(): void {
        const userId = localStorage.getItem('userId');
        const currentCart = this.cart();
        const addressId = this.selectedAddressId();

        if (!userId || !currentCart || !addressId) {
            alert('Please fill all details');
            return;
        }

        const orderRequest: OrderRequestDTO = {
            userId: Number(userId),
            shippingAddressId: addressId,
            billingAddressId: addressId,
            paymentMethod: this.paymentMethod(),
            items: currentCart.cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        };

        this.orderService.placeOrder(Number(userId), orderRequest).subscribe({
            next: (res) => {
                this.toastService.success('Order placed successfully! Order ID: ' + res.data.orderNumber);
                this.cartService.clearCart(Number(userId)).subscribe();
                this.router.navigate(['/dashboard']);
            },
            error: (err) => console.error(err)
        });
    }
}
