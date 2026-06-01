import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'admin_token';
const USER_KEY  = 'admin_user';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(login: string, password: string) {
    return this.http.post<{ token: string; user: any }>(`${environment.apiUrl}/admin/auth/login`, { login, password });
  }

  storeSession(token: string, user: any) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getUser(): any {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }
}
