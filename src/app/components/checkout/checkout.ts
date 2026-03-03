import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService, AddressDTO } from '../../services/address';
import { CartService, CartDTO } from '../../services/cart';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast'; // Added this

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
    paymentMethod = signal<string>('CREDIT_CARD');

    // Card Details Signals
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
        private toastService: ToastService, // Added this
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

    placeOrder(): void {
        const userId = Number(localStorage.getItem('userId'));
        const addrId = this.selectedAddressId();
        const cart = this.cart();

        if (!addrId) { alert('Please select a shipping address.'); return; }
        if (!cart || !cart.items || cart.items.length === 0) { alert('Your cart is empty.'); return; }

        // Payment Validation
        if (this.paymentMethod() === 'CREDIT_CARD') {
            if (!this.cardNumber() || !this.expiryDate() || !this.cvv()) {
                alert('Please fill in all card details.');
                return;
            }
        }

        const request = {
            userId,
            shippingAddressId: addrId,
            billingAddressId: addrId,
            paymentMethod: this.paymentMethod(),
            items: cart.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
        };

        this.orderService.placeOrder(userId, request).subscribe({
            next: () => {
                this.toastService.success('Order placed successfully!');
                setTimeout(() => this.router.navigate(['/orders']), 1500);
            },
            error: (err) => alert('Order failed: ' + (err?.error?.message ?? 'Unknown error'))
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
            this.toastService.success('Please fill all required fields');
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
            error: (err) => {
                this.toastService.success('Failed to add address');
                this.submittingAddress.set(false);
            }
        });
    }
}
