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

    constructor(private router: Router) { }

    ngOnInit(): void {
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

    onSearch(): void {
        const trimmed = this.keyword.trim();
        if (trimmed) {
            this.router.navigate(['/products'], { queryParams: { search: trimmed } });
        }
    }
}
