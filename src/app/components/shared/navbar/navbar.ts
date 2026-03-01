import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchBarComponent } from '../../search-bar/search-bar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, SearchBarComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  cartCount: number = 0;
  unreadCount: number = 0;
  notifications: AppNotification[] = [];
  isLoggedIn: boolean = false;
  userName: string | null = '';

  
}
