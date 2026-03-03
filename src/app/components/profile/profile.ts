import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container mt-5 pt-5">
      <div class="card shadow-sm border-0 p-4 rounded-4 text-center">
        <i class="fa-solid fa-circle-user fs-1 text-primary mb-3"></i>
        <h2>My Profile</h2>
        <p class="text-muted">Component coming soon...</p>
      </div>
    </div>
  `
})
export class ProfileComponent { }
