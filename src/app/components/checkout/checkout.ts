import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService, AddressDTO } from '../../services/address';
import { CartService, CartDTO } from '../../services/cart';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast';
import { CouponService, Coupon } from '../../services/coupon.service';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';
import { ApiResponse } from '../../models/api-response.model';


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
    selectedAddressId: number | null = null;
    paymentMethod = signal<string>('RAZORPAY');
    coupons = signal<Coupon[]>([]);

    // Coupon state
    couponCode = signal<string>('');
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
    submitting: boolean = false;
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
        private notificationService: NotificationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const userId = Number(localStorage.getItem('userId'));
        if (!userId) {
            this.router.navigate(['/login']);
            return;
        }

        this.addressService.getAddressesByUser(userId).subscribe({
            next: (res: any) => {
                // Backend returns bare List<AddressDTO> not wrapped in ApiResponse
                const addrs: AddressDTO[] = Array.isArray(res) ? res : (res.data ?? []);
                this.addresses.set(addrs);
                // Auto-select default address or first address
                const def = addrs.find((a: any) => a.isDefault) ?? addrs[0];
                if (def?.addressId) this.selectedAddressId = def.addressId;
            },
            error: () => { }
        });

        this.cartService.getCartByUserId(userId).subscribe({
            next: (res: ApiResponse<CartDTO>) => {
                this.cart.set(res.data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });

        this.couponService.getActiveCoupons().subscribe({
            next: (res: ApiResponse<Coupon[]>) => {
                this.coupons.set(res.data || []);
            },
            error: () => { }
        });
    }

    get subtotal(): number {
        const cart = this.cart();
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum: number, item: any) => {
            const unitPrice = item.price ?? item.sellingPrice ?? item.subtotal ?? 0;
            const qty = item.quantity ?? 1;
            return sum + (unitPrice * qty);
        }, 0);
    }

    get finalTotal(): number {
        return Math.max(0, this.subtotal - this.discountAmount);
    }

    applyCoupon(): void {
        const code = this.couponCode().trim();
        if (!code) {
            return;
        }
        this.applyingCoupon = true;
        this.couponMessage = '';
        this.couponService.validateCoupon(code, this.subtotal).subscribe({
            next: (res: ApiResponse<any>) => {
                const result = res.data;
                this.applyingCoupon = false;
                if (result.valid) {
                    this.discountAmount = result.discountAmount;
                    this.appliedCouponCode = this.couponCode();
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
        this.couponCode.set('');
        this.appliedCouponCode = '';
        this.discountAmount = 0;
        this.couponMessage = '';
        this.couponSuccess = false;
    }

    selectCoupon(code: string): void {
        this.couponCode.set(code);
        this.applyCoupon();
    }

    /** Main pay flow — places order then triggers Razorpay popup */
    placeOrder(): void {
        const userId = Number(localStorage.getItem('userId'));
        const addrId = this.selectedAddressId;
        const cart = this.cart();

        if (addrId === null || addrId === undefined) {
            this.toastService.error('Please select a shipping address.');
            return;
        }
        if (!cart || !cart.items || cart.items.length === 0) { this.toastService.error('Your cart is empty.'); return; }

        const request = {
            userId,
            shippingAddressId: addrId,
            billingAddressId: addrId,
            paymentMethod: this.paymentMethod(),
            items: cart.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
        };

        this.orderService.placeOrder(userId, request).subscribe({
            next: (res: any) => {
                if (this.paymentMethod() === 'COD') {
                    this.toastService.success('Order placed successfully (Cash on Delivery)');
                    this.submitting = false;
                    this.notificationService.triggerRefresh();
                    // Clear cart properly after COD
                    this.cartService.clearCart(userId).subscribe({
                        next: () => this.router.navigate(['/profile']),
                        error: () => this.router.navigate(['/profile'])
                    });
                    return;
                }

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
            next: (res: ApiResponse<any>) => {
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
                        theme: { color: '#0d6efd' },
                        modal: {
                            ondismiss: () => {
                                this.orderService.cancelOrder(orderId, userId).subscribe({
                                    next: () => {
                                        this.toastService.error('Payment window closed. Order cancelled.');
                                        this.submitting = false;
                                    },
                                    error: () => {
                                        this.toastService.error('Payment cancelled. (Order cancellation failed)');
                                        this.submitting = false;
                                    }
                                });
                            }
                        }
                    };
                    const rzp = new (window as any).Razorpay(options);
                    rzp.on('payment.failed', (response: any) => {
                        this.toastService.error(response.error.description || 'Payment Failed');
                        this.submitting = false;
                        this.orderService.cancelOrder(orderId, userId).subscribe();
                    });
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
                this.notificationService.triggerRefresh();
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
        this.addressForm.userId = userId; // Ensure userId is set
        this.addressService.addAddress(this.addressForm).subscribe({
            next: (res: ApiResponse<AddressDTO>) => {
                // Backend returns bare AddressDTO (not wrapped in ApiResponse)
                const newAddress: AddressDTO = res.data ?? res;
                this.addresses.update(prev => [...prev, newAddress]);
                this.selectedAddressId = newAddress.addressId ?? null;
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

    onSavedAddressSelect(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const addrId = Number(select.value);
        this.selectedAddressId = addrId || null;
    }
}
