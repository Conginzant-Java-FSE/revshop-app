import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface LocationData {
  city: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  source: 'gps' | 'manual';
}

const STORAGE_KEY = 'deliveryLocation';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  selectedLocation = signal<LocationData | null>(null);

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.selectedLocation.set(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  setLocation(data: LocationData): void {
    this.selectedLocation.set(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  clearLocation(): void {
    this.selectedLocation.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  detectGPS(): Observable<LocationData> {
    return new Observable<LocationData>(observer => {
      if (!navigator.geolocation) {
        observer.error(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Reverse geocode using Nominatim (free, no API key)
          const nominatimUrl =
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;

          this.http.get<any>(nominatimUrl).pipe(
            catchError(() => of(null))
          ).subscribe(geoRes => {
            const addr = geoRes?.address;

            // Most specific locality (nagar / area / neighbourhood)
            const area =
              addr?.neighbourhood ||
              addr?.suburb ||
              addr?.village ||
              addr?.hamlet ||
              addr?.residential ||
              null;

            // City / Town / District
            const cityName =
              addr?.city ||
              addr?.town ||
              addr?.city_district ||
              addr?.county ||
              null;

            const pincode = addr?.postcode || null;
            const state = addr?.state || undefined;
            const country = addr?.country || undefined;

            // Compose: "Madhapur, Hyderabad - 500081"
            const parts: string[] = [];
            if (area) parts.push(area);
            if (cityName) parts.push(cityName);
            const city = parts.length
              ? parts.join(', ') + (pincode ? ' - ' + pincode : '')
              : (pincode || 'My Location');

            const data: LocationData = { city, state, country, lat, lng, source: 'gps' };
            observer.next(data);
            observer.complete();
          });
        },
        (error) => {
          let message = 'Unable to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'The request to get your location timed out.';
          }
          observer.error(new Error(message));
        },
        { timeout: 10000 }
      );
    });
  }
}

