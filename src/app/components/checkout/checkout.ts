import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem } from '../../models/cart.model';
import { Navbar } from '../shared/navbar/navbar';
import { Footer } from '../shared/footer/footer';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, Navbar, Footer],
    templateUrl: './checkout.html',
    styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
    currentStep: number = 1;
    cartItems: CartItem[] = [];
    grandTotal: number = 0;
    orderNumber: string = '';
    showConfirmationModal: boolean = false;

    shippingInfo = {
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
    };

    paymentMethod: string = 'COD';

    cardInfo = {
        cardNumber: '',
        expiry: '',
        cvv: ''
    };

    upiId: string = '';

    constructor(
        private cartService: CartService,
        private notificationService: NotificationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cartItems = this.cartService.getCartItems();
        this.grandTotal = this.cartService.getGrandTotal();

        if (this.cartItems.length === 0) {
            this.router.navigate(['/cart']);
        }
    }

    nextStep(): void {
        if (this.currentStep < 3) {
            this.currentStep++;
        }
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    goToStep(step: number): void {
        if (step <= this.currentStep) {
            this.currentStep = step;
        }
    }

    isShippingValid(): boolean {
        return !!(
            this.shippingInfo.fullName &&
            this.shippingInfo.addressLine1 &&
            this.shippingInfo.city &&
            this.shippingInfo.state &&
            this.shippingInfo.zipCode &&
            this.shippingInfo.phone
        );
    }

    isPaymentValid(): boolean {
        if (this.paymentMethod === 'COD') return true;
        if (this.paymentMethod === 'CARD') {
            return !!(this.cardInfo.cardNumber && this.cardInfo.expiry && this.cardInfo.cvv);
        }
        if (this.paymentMethod === 'UPI') {
            return !!this.upiId;
        }
        return false;
    }

    getPaymentLabel(): string {
        switch (this.paymentMethod) {
            case 'COD': return 'Cash on Delivery';
            case 'CARD': return 'Credit / Debit Card';
            case 'UPI': return 'UPI';
            default: return '';
        }
    }

    placeOrder(): void {
        this.orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        const orderPayload = {
            userId: localStorage.getItem('userId'),
            items: this.cartItems,
            shippingAddress: this.shippingInfo,
            paymentMethod: this.paymentMethod,
            totalAmount: this.grandTotal
        };

        this.cartService.placeOrder(orderPayload).subscribe({
            next: () => {
                this.onOrderSuccess();
            },
            error: () => {
                this.onOrderSuccess();
            }
        });
    }

    private onOrderSuccess(): void {
        this.notificationService.addNotification('Order ' + this.orderNumber + ' Placed Successfully!');
        this.cartService.clearCart();
        this.showConfirmationModal = true;
    }

    closeModal(): void {
        this.showConfirmationModal = false;
        this.router.navigate(['/']);
    }
}
