import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TrackingService } from '../../../services/tracking.service';
import { of } from 'rxjs';
import { TrackingModalComponent } from './tracking-modal';

describe('TrackingModalComponent', () => {
  let component: TrackingModalComponent;
  let fixture: ComponentFixture<TrackingModalComponent>;
  let mockTrackingService: any;

  beforeEach(async () => {
    mockTrackingService = jasmine.createSpyObj('TrackingService', ['getTrackingDetails']);
    mockTrackingService.getTrackingDetails.and.returnValue(of({ message: 'OK', data: [] }));

    await TestBed.configureTestingModule({
      imports: [TrackingModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TrackingService, useValue: mockTrackingService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
