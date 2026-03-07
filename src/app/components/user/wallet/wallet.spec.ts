import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WalletComponent } from './wallet';
import { WalletService } from '../../../services/wallet.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('WalletComponent', () => {
  let component: WalletComponent;
  let fixture: ComponentFixture<WalletComponent>;
  let walletService: jasmine.SpyObj<WalletService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('WalletService', ['getBalance', 'getTransactions', 'sendSmsOtp', 'verifyKyc']);

    await TestBed.configureTestingModule({
      imports: [WalletComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: WalletService, useValue: spy }
      ]
    })
      .compileComponents();

    walletService = TestBed.inject(WalletService) as jasmine.SpyObj<WalletService>;
    walletService.getBalance.and.returnValue(of({
      message: 'Success',
      data: { walletId: 1, balance: 100, kycVerified: true, isActive: true } as any
    }));
    walletService.getTransactions.and.returnValue(of({ message: 'Success', data: [] }));

    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load balance on init', () => {
    expect(walletService.getBalance).toHaveBeenCalled();
    expect(component.wallet()?.balance).toBe(100);
  });

  it('should handle KYC verification flow', () => {
    component.mobileNumber = '1234567890';
    walletService.sendSmsOtp.and.returnValue(of({ message: 'OTP Sent', data: '' }));

    component.sendOtp();

    expect(walletService.sendSmsOtp).toHaveBeenCalledWith('1234567890');
    expect(component.showOtpField).toBeTrue();
  });
});
