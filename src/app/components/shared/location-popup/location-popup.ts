import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService, LocationData } from '../../../services/location.service';
import { AddressService, AddressDTO } from '../../../services/address';

type View = 'choose' | 'gps' | 'manual';

@Component({
    selector: 'app-location-popup',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './location-popup.html',
    styleUrls: ['./location-popup.css']
})
export class LocationPopupComponent implements OnInit {
    currentView = signal<View>('choose');
    gpsLoading = signal<boolean>(false);
    gpsError = signal<string | null>(null);

    savedAddresses = signal<AddressDTO[]>([]);
    addressesLoading = signal<boolean>(false);
    showAddressForm = signal<boolean>(false);
    submittingAddress = signal<boolean>(false);

    newAddress: AddressDTO = {
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
    };

    constructor(
        public locationService: LocationService,
        private addressService: AddressService
    ) { }

    ngOnInit(): void { }

    // ── View navigation ──────────────────────────────────────────────────────────

    showGpsView(): void {
        this.currentView.set('gps');
        this.gpsError.set(null);
        this.startGps();
    }

    showManualView(): void {
        this.currentView.set('manual');
        this.loadSavedAddresses();
    }

    backToChoose(): void {
        this.currentView.set('choose');
        this.gpsError.set(null);
        this.showAddressForm.set(false);
    }

    // ── GPS ──────────────────────────────────────────────────────────────────────

    startGps(): void {
        this.gpsLoading.set(true);
        this.gpsError.set(null);

        this.locationService.detectGPS().subscribe({
            next: (data: LocationData) => {
                this.gpsLoading.set(false);
                this.locationService.setLocation(data);
            },
            error: (err: Error) => {
                this.gpsLoading.set(false);
                this.gpsError.set(err.message);
            }
        });
    }

    // ── Manual / Saved Addresses ──────────────────────────────────────────────────

    loadSavedAddresses(): void {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        this.addressesLoading.set(true);
        this.addressService.getAddressesByUser(Number(userId)).subscribe({
            next: (res: any) => {
                const list: AddressDTO[] = Array.isArray(res) ? res : (res.data ?? []);
                this.savedAddresses.set(list);
                this.addressesLoading.set(false);
            },
            error: () => {
                this.savedAddresses.set([]);
                this.addressesLoading.set(false);
            }
        });
    }

    selectSavedAddress(address: AddressDTO): void {
        const locationData: LocationData = {
            city: address.city,
            state: address.state,
            country: address.country,
            source: 'manual'
        };
        this.locationService.setLocation(locationData);
    }

    // ── Add New Address Form ──────────────────────────────────────────────────────

    openAddressForm(): void {
        this.newAddress = {
            addressLine: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            isDefault: false
        };
        this.showAddressForm.set(true);
    }

    cancelAddressForm(): void {
        this.showAddressForm.set(false);
    }

    submitNewAddress(): void {
        if (!this.newAddress.addressLine || !this.newAddress.city ||
            !this.newAddress.state || !this.newAddress.zipCode) {
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) return;

        this.newAddress.userId = Number(userId);
        this.submittingAddress.set(true);

        this.addressService.addAddress(this.newAddress).subscribe({
            next: (res: any) => {
                const saved: AddressDTO = res.data ?? res;
                this.submittingAddress.set(false);
                this.locationService.setLocation({
                    city: saved.city,
                    state: saved.state,
                    country: saved.country,
                    source: 'manual'
                });
            },
            error: () => {
                this.submittingAddress.set(false);
            }
        });
    }
}
