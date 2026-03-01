import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TrackingService } from '../../../services/tracking.service';
import { TrackingDetail } from '../../../models/tracking.model';

@Component({
  selector: 'app-tracking-modal',
  templateUrl: './tracking-modal.component.html',
  styleUrls: ['./tracking-modal.component.css']
})
export class TrackingModalComponent implements OnInit {
  @Input() orderId!: number;
  @Input() orderNumber!: string;
  @Output() close = new EventEmitter<void>();

  trackingDetails: TrackingDetail[] = [];
  loading = true;
  error = false;

  constructor(private trackingService: TrackingService) { }

  ngOnInit(): void {
    this.loadTrackingDetails();
  }

  loadTrackingDetails(): void {
    this.loading = true;
    this.trackingService.getTrackingDetails(this.orderId).subscribe({
      next: (res: any) => {
        this.trackingDetails = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
