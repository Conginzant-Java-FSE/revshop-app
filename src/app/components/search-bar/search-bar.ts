import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-search-bar',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './search-bar.html',
    styleUrl: './search-bar.css',
})
export class SearchBarComponent implements OnInit {
    keyword: string = '';
    isReadonly = true;
    recentSearches: string[] = [];
    showDropdown = false;

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.loadRecentSearches();

        // Remove readonly after short delay so Chrome can't autofill during render
        setTimeout(() => { this.isReadonly = false; }, 300);

        // Clear keyword when navigating away from products page
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd)
        ).subscribe((e: any) => {
            if (!e.urlAfterRedirects?.startsWith('/products')) {
                this.keyword = '';
            }
        });
    }

    loadRecentSearches() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const stored = localStorage.getItem('revshop_recent_searches');
            if (stored) {
                this.recentSearches = JSON.parse(stored);
            }
        }
    }

    saveSearch(term: string) {
        if (!term) return;
        this.recentSearches = this.recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase());
        this.recentSearches.unshift(term);
        if (this.recentSearches.length > 5) this.recentSearches.pop();
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('revshop_recent_searches', JSON.stringify(this.recentSearches));
        }
    }

    onSearch(): void {
        const trimmed = this.keyword.trim();
        if (trimmed) {
            this.saveSearch(trimmed);
            this.showDropdown = false;
            this.router.navigate(['/products'], { queryParams: { search: trimmed } });
        }
    }

    selectSearch(term: string) {
        this.keyword = term;
        this.onSearch();
    }

    clearHistory(event: Event) {
        event.stopPropagation();
        this.recentSearches = [];
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('revshop_recent_searches');
        }
    }

    @HostListener('document:click', ['$event'])
    closeDropdown(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.search-bar-group')) {
            this.showDropdown = false;
        }
    }
}
