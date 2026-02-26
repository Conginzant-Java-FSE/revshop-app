import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  registerBuyer(buyerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/buyer`, buyerData);
  }

  registerSeller(sellerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/seller`, sellerData);
  }

  // ==== Authentication Helper Methods ====

  /**
   * Saves authentication data to localStorage
   */
  saveAuthData(token: string, role: string, userId: string, name: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('name', name);
  }

  /**
   * Clears authentication data from localStorage
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
  }

  /**
   * Returns whether a user is currently logged in (token exists)
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Returns the current user's role
   */
  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

}
