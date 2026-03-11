import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LocationPopupComponent } from './location-popup';
import { LocationService, LocationData } from '../../../services/location.service';
import { AddressService, AddressDTO } from '../../../services/address';

describe('LocationPopupComponent', () => {
    let component: LocationPopupComponent;
    let fixture: ComponentFixture<LocationPopupComponent>;
    let mockLocationService: jasmine.SpyObj<LocationService>;
    let mockAddressService: jasmine.SpyObj<AddressService>;

    const mockGpsLocation: LocationData = {
        city: 'Current Location',
        lat: 17.385,
        lng: 78.4867,
        source: 'gps'
    };

    const mockAddresses: AddressDTO[] = [
        {
            addressId: 1,
            addressLine: '10 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India',
            isDefault: true
        },
        {
            addressId: 2,
            addressLine: '5 Anna Salai',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipCode: '600002',
            country: 'India',
            isDefault: false
        }
    ];

    beforeEach(async () => {
        // Spy objects
        mockLocationService = jasmine.createSpyObj<LocationService>(
            'LocationService',
            ['setLocation', 'clearLocation', 'detectGPS'],
            {
                selectedLocation: signal(null) as any
            }
        );

        mockAddressService = jasmine.createSpyObj<AddressService>(
            'AddressService',
            ['getAddressesByUser', 'addAddress']
        );

        // Default stubs
        mockLocationService.detectGPS.and.returnValue(of(mockGpsLocation));
        mockAddressService.getAddressesByUser.and.returnValue(of(mockAddresses));
        mockAddressService.addAddress.and.returnValue(of(mockAddresses[0]));

        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'userId') return '1';
            return null;
        });

        await TestBed.configureTestingModule({
            imports: [LocationPopupComponent, CommonModule, FormsModule],
            providers: [
                { provide: LocationService, useValue: mockLocationService },
                { provide: AddressService, useValue: mockAddressService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LocationPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // ── Creation ──────────────────────────────────────────────────────────────

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // ── Choose view (default) ─────────────────────────────────────────────────

    it('should show method-chooser view by default', () => {
        expect(component.currentView()).toBe('choose');
    });

    // ── GPS view ──────────────────────────────────────────────────────────────

    it('should switch to GPS view when showGpsView() is called', () => {
        component.showGpsView();
        expect(component.currentView()).toBe('gps');
    });

    it('should call locationService.detectGPS() when GPS view is triggered', () => {
        component.showGpsView();
        expect(mockLocationService.detectGPS).toHaveBeenCalled();
    });

    it('should call locationService.setLocation() on GPS success', fakeAsync(() => {
        mockLocationService.detectGPS.and.returnValue(of(mockGpsLocation));
        component.showGpsView();
        tick();
        expect(mockLocationService.setLocation).toHaveBeenCalledWith(mockGpsLocation);
    }));

    it('should set gpsError on GPS failure', fakeAsync(() => {
        mockLocationService.detectGPS.and.returnValue(
            throwError(() => new Error('Location permission denied.'))
        );
        component.currentView.set('gps');
        component.startGps();
        tick();
        expect(component.gpsError()).toBe('Location permission denied.');
    }));

    it('should show error message on GPS failure and hide spinner', fakeAsync(() => {
        mockLocationService.detectGPS.and.returnValue(
            throwError(() => new Error('Unable to retrieve your location.'))
        );
        component.currentView.set('gps');
        component.startGps();
        tick();
        expect(component.gpsLoading()).toBeFalse();
        expect(component.gpsError()).toBeTruthy();
    }));

    // ── Manual view ───────────────────────────────────────────────────────────

    it('should switch to manual view when showManualView() is called', () => {
        component.showManualView();
        expect(component.currentView()).toBe('manual');
    });

    it('should load saved addresses from backend when user is logged in', fakeAsync(() => {
        mockAddressService.getAddressesByUser.and.returnValue(of(mockAddresses));
        component.showManualView();
        tick();
        expect(mockAddressService.getAddressesByUser).toHaveBeenCalledWith(1);
        expect(component.savedAddresses().length).toBe(2);
    }));

    it('should call locationService.setLocation() when a saved address is selected', () => {
        component.selectSavedAddress(mockAddresses[0]);
        expect(mockLocationService.setLocation).toHaveBeenCalledWith({
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            source: 'manual'
        });
    });

    // ── Add New Address form ──────────────────────────────────────────────────

    it('should reveal Add New Address form on openAddressForm()', () => {
        expect(component.showAddressForm()).toBeFalse();
        component.openAddressForm();
        expect(component.showAddressForm()).toBeTrue();
    });

    it('should hide the form on cancelAddressForm()', () => {
        component.openAddressForm();
        component.cancelAddressForm();
        expect(component.showAddressForm()).toBeFalse();
    });

    it('should call AddressService.addAddress() and locationService.setLocation() on form submit', fakeAsync(() => {
        const savedAddress: AddressDTO = {
            addressId: 99,
            addressLine: '7 Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            zipCode: '700001',
            country: 'India',
            isDefault: false
        };
        mockAddressService.addAddress.and.returnValue(of(savedAddress));

        component.newAddress = {
            addressLine: '7 Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            zipCode: '700001',
            country: 'India',
            isDefault: false
        };

        component.submitNewAddress();
        tick();

        expect(mockAddressService.addAddress).toHaveBeenCalled();
        expect(mockLocationService.setLocation).toHaveBeenCalledWith({
            city: 'Kolkata',
            state: 'West Bengal',
            country: 'India',
            source: 'manual'
        });
    }));

    // ── Back navigation ───────────────────────────────────────────────────────

    it('should go back to choose view on backToChoose()', () => {
        component.showManualView();
        component.backToChoose();
        expect(component.currentView()).toBe('choose');
    });
});
