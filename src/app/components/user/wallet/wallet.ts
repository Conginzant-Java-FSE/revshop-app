import { Component, OnInit, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../../../services/wallet.service';
import { AuthService } from '../../../services/auth';
import { Header } from '../../shared/header/header';
import { Wallet, WalletTransaction } from '../../../models/wallet.model';

// Declare Razorpay globally so TypeScript knows about it
declare var Razorpay: any;

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Header],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.css']
})
export class WalletComponent implements OnInit {

  wallet = signal<Wallet | null>(null);
  transactions = signal<WalletTransaction[]>([]);
  loading = signal<boolean>(true);
  errorMsg = signal<string>('');
  successMsg = signal<string>('');

  // KYC Forms
  mobileNumber = '';
  otp = '';
  showOtpField = false;
  kycLoading = false;

  // Add Money
  addAmount: number | null = null;
  addMoneyLoading = signal<boolean>(false);

  constructor(
    public authService: AuthService,
    private walletService: WalletService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadWallet();
    this.loadRazorpayScript();
  }

  loadWallet() {
    this.loading.set(true);
    this.walletService.getBalance().subscribe({
      next: (res) => {
        this.wallet.set(res.data);
        if (res.data && res.data.kycVerified) {
          this.loadTransactions();
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        // If 404 or not found, it means wallet isn't created yet -> show KYC screen
        this.wallet.set(null);
        this.loading.set(false);
      }
    });
  }

  loadTransactions() {
    this.walletService.getTransactions().subscribe({
      next: (res) => {
        this.transactions.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // --- KYC Flow ---
  sendOtp() {
    if (!this.mobileNumber) {
      this.errorMsg.set('Please enter a mobile number');
      return;
    }
    this.kycLoading = true;
    this.errorMsg.set('');
    this.walletService.sendSmsOtp(this.mobileNumber).subscribe({
      next: () => {
        this.showOtpField = true;
        this.kycLoading = false;
        this.successMsg.set('OTP sent successfully!');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to send OTP');
        this.kycLoading = false;
      }
    });
  }

  verifyOtp() {
    if (!this.otp) {
      this.errorMsg.set('Please enter the OTP');
      return;
    }
    this.kycLoading = true;
    this.errorMsg.set('');
    this.walletService.verifyKyc(this.mobileNumber, this.otp).subscribe({
      next: (res) => {
        this.wallet.set(res.data);
        this.kycLoading = false;
        this.successMsg.set('KYC Verified Successfully! Your wallet is active.');
        setTimeout(() => this.successMsg.set(''), 3000);
        this.loadTransactions();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Invalid OTP');
        this.kycLoading = false;
      }
    });
  }

  // --- Add Money Flow ---
  initiateAddMoney() {
    if (!this.addAmount || this.addAmount <= 0) {
      this.errorMsg.set('Please enter a valid amount');
      setTimeout(() => this.errorMsg.set(''), 3000);
      return;
    }

    this.addMoneyLoading.set(true);
    this.walletService.createRazorpayOrder(this.addAmount).subscribe({
      next: (res) => {
        const orderId = res.data;
        this.openRazorpayPopup(orderId, this.addAmount!);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to initiate payment');
        this.addMoneyLoading.set(false);
      }
    });
  }

  private openRazorpayPopup(orderId: string, amount: number) {
    const options = {
      key: 'rzp_test_SN3NFchLw7eXEa', // Should ideally come from env/service
      amount: amount * 100, // paise
      currency: 'INR',
      name: 'RevShop Wallet',
      description: 'Add money to wallet',
      order_id: orderId,
      handler: (response: any) => {
        this.ngZone.run(() => {
          this.verifyPayment(amount, response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
        });
      },
      prefill: {
        name: this.authService.authState().name,
      },
      theme: { color: '#0d6efd' },
      modal: {
        ondismiss: () => {
          this.ngZone.run(() => {
            this.errorMsg.set('Payment was cancelled. No amount was added.');
            this.addMoneyLoading.set(false);
            setTimeout(() => this.errorMsg.set(''), 4000);
          });
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      this.ngZone.run(() => {
        this.errorMsg.set('Payment failed: ' + (response.error?.description || 'Unknown error'));
        this.addMoneyLoading.set(false);
      });
    });
    rzp.open();
  }

  private verifyPayment(amount: number, paymentId: string, orderId: string, signature: string) {
    this.walletService.verifyPayment(amount, paymentId, orderId, signature).subscribe({
      next: (res) => {
        this.wallet.set(res.data);
        this.addMoneyLoading.set(false);
        this.addAmount = null;
        this.successMsg.set(`₹${amount} added successfully!`);
        setTimeout(() => this.successMsg.set(''), 3000);
        this.loadTransactions();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Payment verification failed');
        this.addMoneyLoading.set(false);
      }
    });
  }

  // Load script dynamically
  private loadRazorpayScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }
}
