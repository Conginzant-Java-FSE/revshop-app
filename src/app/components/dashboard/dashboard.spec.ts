import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { ProductService } from '../../services/product';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: { userRole: () => 'BUYER' } },
        { provide: Router, useValue: { navigate: () => { } } },
        { provide: OrderService, useValue: {} },
        { provide: ProductService, useValue: {} }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
