import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService, AddressDTO } from '../../services/address';
import { CartService, CartDTO } from '../../services/cart';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast';
import { CouponService } from '../../services/coupon.service';
import { PaymentService } from '../../services/payment.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './checkout.html',
    styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
    loading = signal<boolean>(true);
    addresses = signal<AddressDTO[]>([]);
    cart = signal<CartDTO | null>(null);
    selectedAddressId = signal<number | null>(null);
    paymentMethod = signal<string>('RAZORPAY');

    // Coupon state
    couponCode = '';
    appliedCouponCode = '';
    couponMessage = '';
    couponSuccess = false;
    discountAmount = 0;
    applyingCoupon = false;

    // Card Details Signals (kept for backward compat)
    cardNumber = signal<string>('');
    expiryDate = signal<string>('');
    cvv = signal<string>('');

    // Address Modal State
    showAddressModal = signal<boolean>(false);
    submittingAddress = signal<boolean>(false);
    addressForm: AddressDTO = {
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
    };

    constructor(
        private addressService: AddressService,
        private cartService: CartService,
        private orderService: OrderService,
        private toastService: ToastService,
        private couponService: CouponService,
        private paymentService: PaymentService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const userId = Number(localStorage.getItem('userId'));
        if (!userId) {
            this.router.navigate(['/login']);
            return;
        }

        this.addressService.getAddressesByUserId(userId).subscribe({
            next: (res) => this.addresses.set(res.data ?? []),
            error: () => { }
        });

        this.cartService.getCartByUserId(userId).subscribe({
            next: (res) => {
                this.cart.set(res.data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    get subtotal(): number {
        const cart = this.cart();
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum: number, item: any) => sum + (item.sellingPrice * item.quantity), 0);
    }

    get finalTotal(): number {
        return Math.max(0, this.subtotal - this.discountAmount);
    }

    applyCoupon(): void {
        if (!this.couponCode.trim()) return;
        this.applyingCoupon = true;
        this.couponMessage = '';
        this.couponService.validateCoupon(this.couponCode.trim(), this.subtotal).subscribe({
            next: (res) => {
                const result = res.data;
                this.applyingCoupon = false;
                if (result.valid) {
                    this.discountAmount = result.discountAmount;
                    this.appliedCouponCode = this.couponCode;
                    this.couponSuccess = true;
                    this.couponMessage = result.message;
                } else {
                    this.discountAmount = 0;
                    this.appliedCouponCode = '';
                    this.couponSuccess = false;
                    this.couponMessage = result.message;
                }
            },
            error: () => {
                this.applyingCoupon = false;
                this.couponSuccess = false;
                this.couponMessage = 'Could not validate coupon. Please try again.';
            }
        });
    }

    removeCoupon(): void {
        this.couponCode = '';
        this.appliedCouponCode = '';
        this.discountAmount = 0;
        this.couponMessage = '';
        this.couponSuccess = false;
    }

    /** Main pay flow — places order then triggers Razorpay popup */
    placeOrder(): void {
        const userId = Number(localStorage.getItem('userId'));
        const addrId = this.selectedAddressId();
        const cart = this.cart();

        if (!addrId) { this.toastService.error('Please select a shipping address.'); return; }
        if (!cart || !cart.items || cart.items.length === 0) { this.toastService.error('Your cart is empty.'); return; }

        const request = {
            userId,
            shippingAddressId: addrId,
            billingAddressId: addrId,
            paymentMethod: 'RAZORPAY',
            items: cart.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
        };

        this.orderService.placeOrder(userId, request).subscribe({
            next: (res: any) => {
                const orderId = res.data?.orderId ?? res.data?.order?.orderId;
                if (!orderId) {
                    this.toastService.error('Order placed but payment initialization failed.');
                    return;
                }
                this.initiateRazorpayPayment(orderId, this.finalTotal, userId);
            },
            error: (err: any) => this.toastService.error('Order failed: ' + (err?.error?.message ?? 'Unknown error'))
        });
    }

    private initiateRazorpayPayment(orderId: number, amount: number, userId: number): void {
        this.paymentService.createRazorpayOrder(amount, orderId).subscribe({
            next: (res) => {
                const rzpData = res.data;
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    const options = {
                        key: rzpData.keyId,
                        amount: rzpData.amount,
                        currency: rzpData.currency,
                        name: 'RevShop',
                        description: 'Order Payment',
                        order_id: rzpData.razorpayOrderId,
                        handler: (response: any) => {
                            this.verifyAndConfirm(response, orderId);
                        },
                        prefill: {
                            name: localStorage.getItem('userName') ?? '',
                            email: localStorage.getItem('userEmail') ?? ''
                        },
                        theme: { color: '#0d6efd' }
                    };
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                };
                document.body.appendChild(script);
            },
            error: () => this.toastService.error('Payment initialization failed. Please try again.')
        });
    }

    private verifyAndConfirm(paymentResponse: any, orderId: number): void {
        this.paymentService.verifyPayment({
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
            internalOrderId: orderId
        }).subscribe({
            next: () => {
                this.toastService.success('Payment Successful! 🎉');
                setTimeout(() => this.router.navigate(['/orders']), 1500);
            },
            error: () => this.toastService.error('Payment verification failed. Contact support with your payment ID.')
        });
    }

    // Modal Methods
    openAddressModal(): void {
        this.addressForm = {
            addressLine: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false
        };
        this.showAddressModal.set(true);
    }

    closeAddressModal(): void {
        this.showAddressModal.set(false);
    }

    onAddressSubmit(): void {
        const userId = Number(localStorage.getItem('userId'));
        if (!userId) return;

        if (!this.addressForm.addressLine || !this.addressForm.city || !this.addressForm.state || !this.addressForm.zipCode) {
            this.toastService.error('Please fill all required fields');
            return;
        }

        this.submittingAddress.set(true);
        this.addressService.addAddress(this.addressForm, userId).subscribe({
            next: (res) => {
                const newAddress = res.data;
                this.addresses.update(prev => [...prev, newAddress]);
                this.selectedAddressId.set(newAddress.addressId!);
                this.toastService.success('Address added successfully');
                this.submittingAddress.set(false);
                this.closeAddressModal();
            },
            error: () => {
                this.toastService.error('Failed to add address');
                this.submittingAddress.set(false);
            }
        });
    }
}
