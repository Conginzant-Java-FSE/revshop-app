import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/shared/toast/toast';
import { Navbar } from './components/shared/navbar/navbar';
import { LocationPopupComponent } from './components/shared/location-popup/location-popup';
import { LocationService } from './services/location.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, ReactiveFormsModule, CommonModule, ToastComponent, Navbar, LocationPopupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('revshop-app');

  showLocationPopup = computed(() => !this.locationService.selectedLocation());

  constructor(public locationService: LocationService) { }
}
