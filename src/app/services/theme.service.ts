import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'revshop_theme';
    private mediaQueryList: MediaQueryList | null = null;

    // Expose the current user preference
    currentTheme = signal<Theme>('system');

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            // Initialize media query listener for system pref changes
            this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
            this.mediaQueryList.addEventListener('change', (e) => {
                if (this.currentTheme() === 'system') {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });

            // Load saved theme
            const saved = localStorage.getItem(this.THEME_KEY) as Theme;
            if (saved && ['light', 'dark', 'system'].includes(saved)) {
                this.currentTheme.set(saved);
            } else {
                // Initial application if it's the first time
                this.applyTheme(this.mediaQueryList.matches ? 'dark' : 'light');
            }

            // Automatically apply theme changes whenever the signal updates
            effect(() => {
                const theme = this.currentTheme();
                localStorage.setItem(this.THEME_KEY, theme);

                if (theme === 'system') {
                    this.applyTheme(this.mediaQueryList?.matches ? 'dark' : 'light');
                } else {
                    this.applyTheme(theme);
                }
            });
        }
    }

    setTheme(theme: Theme): void {
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
            this.currentTheme.set(theme);
        }
    }

    private applyTheme(resolvedTheme: 'light' | 'dark'): void {
        if (isPlatformBrowser(this.platformId)) {
            document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
        }
    }
}
