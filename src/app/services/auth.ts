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

}
