import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WalletService } from './wallet.service';
import { Wallet, WalletTransaction } from '../models/wallet.model';
import { ApiResponse } from '../models/api-response.model';

describe('WalletService', () => {
    let service: WalletService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [WalletService]
        });
        service = TestBed.inject(WalletService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch balance', () => {
        const mockWallet: Wallet = {
            walletId: 1,
            balance: 100,
            kycVerified: true,
            isActive: true,
            mobileNumber: '1234567890'
        };
        const mockResponse: ApiResponse<Wallet> = { message: 'Success', data: mockWallet };

        service.getBalance().subscribe(res => {
            expect(res.data.balance).toBe(100);
            expect(res.data.kycVerified).toBeTrue();
        });

        const req = httpMock.expectOne('http://localhost:8080/api/wallets/balance');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should send SMS OTP', () => {
        const mockResponse: ApiResponse<string> = { message: 'OTP Sent', data: '' };

        service.sendSmsOtp('1234567890').subscribe(res => {
            expect(res.message).toBe('OTP Sent');
        });

        const req = httpMock.expectOne('http://localhost:8080/api/wallets/kyc/send-sms');
        expect(req.request.method).toBe('POST');
        expect(req.request.body.mobileNumber).toBe('1234567890');
        req.flush(mockResponse);
    });

    it('should verify KYC', () => {
        const mockWallet: Wallet = { walletId: 1, balance: 0, kycVerified: true, isActive: true, mobileNumber: '1234567890' };
        const mockResponse: ApiResponse<Wallet> = { message: 'Verified', data: mockWallet };

        service.verifyKyc('1234567890', '123456').subscribe(res => {
            expect(res.data.kycVerified).toBeTrue();
        });

        const req = httpMock.expectOne('http://localhost:8080/api/wallets/kyc/verify');
        expect(req.request.method).toBe('POST');
        expect(req.request.body.otp).toBe('123456');
        req.flush(mockResponse);
    });

    it('should fetch transactions', () => {
        const mockTransactions: WalletTransaction[] = [
            { transactionId: 1, amount: 50, transactionType: 'CREDIT', description: 'Test', referenceId: 'REF1', createdAt: '2025-01-01' }
        ];
        const mockResponse: ApiResponse<WalletTransaction[]> = { message: 'Success', data: mockTransactions };

        service.getTransactions().subscribe(res => {
            expect(res.data.length).toBe(1);
            expect(res.data[0].amount).toBe(50);
        });

        const req = httpMock.expectOne('http://localhost:8080/api/wallets/transactions');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });
});
