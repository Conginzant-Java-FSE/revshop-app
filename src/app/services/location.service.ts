import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface LocationData {
  city: string;
  state?: string;
  country?: string;
  area?: string;
  zipCode?: string;
  addressLine?: string;
  street?: string;
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
  isPopupDismissed = signal<boolean>(false);

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
    this.isPopupDismissed.set(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  dismissPopup(): void {
    this.isPopupDismissed.set(true);
  }

  showPopup(): void {
    this.isPopupDismissed.set(false);
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
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&addressdetails=1`;

          this.http.get<any>(nominatimUrl).pipe(
            catchError(() => of(null))
          ).subscribe(geoRes => {
            const addr = geoRes?.address;

            // Most specific locality (nagar / area / neighbourhood)
            const houseNumber = addr?.house_number || '';
            const road = addr?.road || '';
            const neighbourhood =
              addr?.neighbourhood ||
              addr?.suburb ||
              addr?.village ||
              addr?.hamlet ||
              addr?.residential ||
              '';

            // City / Town / District
            const cityName =
              addr?.city ||
              addr?.town ||
              addr?.city_district ||
              addr?.county ||
              null;

            const zipCode = addr?.postcode || null;
            const state = addr?.state || undefined;
            const country = addr?.country || undefined;

            // Compose detailed address line: "123, Ward 28"
            const lineParts: string[] = [];
            if (houseNumber) lineParts.push(houseNumber);
            if (neighbourhood) lineParts.push(neighbourhood);
            const addressLine = lineParts.join(', ');

            // Street / Landmark: "Main Rd"
            const street = road || '';

            // Fallback for city
            const city = cityName || neighbourhood || 'Unknown City';

            const data: LocationData = { 
              city: city, 
              state, 
              country, 
              area: neighbourhood || undefined,
              zipCode: zipCode || undefined,
              addressLine,
              street,
              lat, 
              lng, 
              source: 'gps' 
            };

            // Update display city for the header preview
            const cityDisplayParts: string[] = [];
            if (city !== 'Unknown City') cityDisplayParts.push(city);
            if (zipCode) cityDisplayParts.push(zipCode);
            
            // Note: We don't overwrite the full data.city because it's used in form fields
            // but we can add a helper or just return the granular data
            
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
}

