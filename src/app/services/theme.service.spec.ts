import { TestBed } from '@angular/core/testing';
import { ThemeService, Theme } from './theme.service';
import { PLATFORM_ID } from '@angular/core';

describe('ThemeService', () => {
    let service: ThemeService;

    // We'll map event listeners so we can trigger them
    let mediaQueryListeners: { [key: string]: Function[] } = {};
    let mockMediaQueryList: any;

    beforeEach(() => {
        mediaQueryListeners = {};

        mockMediaQueryList = {
            matches: false, // Default to light mode system preference
            addEventListener: (event: string, callback: Function) => {
                if (!mediaQueryListeners[event]) {
                    mediaQueryListeners[event] = [];
                }
                mediaQueryListeners[event].push(callback);
            },
            removeEventListener: jasmine.createSpy('removeEventListener')
        };

        spyOn(window, 'matchMedia').and.returnValue(mockMediaQueryList);
        spyOn(localStorage, 'getItem').and.returnValue(null);
        spyOn(localStorage, 'setItem').and.stub();
        spyOn(document.documentElement, 'setAttribute').and.stub();

        TestBed.configureTestingModule({
            providers: [
                ThemeService,
                { provide: PLATFORM_ID, useValue: 'browser' }
            ]
        });
    });

    it('should be created', () => {
        service = TestBed.inject(ThemeService);
        expect(service).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should default to system theme when no local storage value exists and matchMedia is light', () => {
            service = TestBed.inject(ThemeService);
            expect(service.currentTheme()).toBe('system');
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-bs-theme', 'light');
        });

        it('should default to system theme when no local storage value exists and matchMedia is dark', () => {
            mockMediaQueryList.matches = true;
            service = TestBed.inject(ThemeService);
            expect(service.currentTheme()).toBe('system');
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-bs-theme', 'dark');
        });

        it('should load theme from localStorage if valid', () => {
            (localStorage.getItem as jasmine.Spy).and.returnValue('dark');
            service = TestBed.inject(ThemeService);
            expect(service.currentTheme()).toBe('dark');
            // the effect will eventually fire
        });

        it('should disregard invalid localStorage themes', () => {
            (localStorage.getItem as jasmine.Spy).and.returnValue('invalid-theme');
            service = TestBed.inject(ThemeService);
            expect(service.currentTheme()).toBe('system');
        });
    });

    describe('Changing Theme', () => {
        beforeEach(() => {
            service = TestBed.inject(ThemeService);
            (document.documentElement.setAttribute as jasmine.Spy).calls.reset();
            (localStorage.setItem as jasmine.Spy).calls.reset();
        });

        it('should set the theme to dark and apply it', async () => {
            service.setTheme('dark');
            expect(service.currentTheme()).toBe('dark');

            // Wait for signal effect
            await TestBed.flushEffects();

            expect(localStorage.setItem).toHaveBeenCalledWith('revshop_theme', 'dark');
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-bs-theme', 'dark');
        });

        it('should set the theme to light and apply it', async () => {
            service.setTheme('light');
            expect(service.currentTheme()).toBe('light');

            // Wait for signal effect
            await TestBed.flushEffects();

            expect(localStorage.setItem).toHaveBeenCalledWith('revshop_theme', 'light');
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-bs-theme', 'light');
        });

        it('should disregard invalid themes via setTheme', () => {
            const initialTheme = service.currentTheme();
            service.setTheme('hacker-mode' as any);
            expect(service.currentTheme()).toBe(initialTheme);
        });
    });

    describe('System Preference Changes', () => {
        beforeEach(() => {
            service = TestBed.inject(ThemeService);
            (document.documentElement.setAttribute as jasmine.Spy).calls.reset();
        });

        it('should apply dark theme if preference switches to dark while in system mode', () => {
            // currently in system mode, defaulting to light
            expect(service.currentTheme()).toBe('system');

            // Trigger system switch to dark
            mockMediaQueryList.matches = true;
            mediaQueryListeners['change'].forEach(cb => cb({ matches: true }));

            expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-bs-theme', 'dark');
        });

        it('should not apply system preference changes if user manually overrode theme', () => {
            service.setTheme('light');

            (document.documentElement.setAttribute as jasmine.Spy).calls.reset();

            // Trigger system switch to dark
            mockMediaQueryList.matches = true;
            mediaQueryListeners['change'].forEach(cb => cb({ matches: true }));

            // shouldn't do anything because currentTheme is 'light', not 'system'
            expect(document.documentElement.setAttribute).not.toHaveBeenCalled();
        });
    });
});
