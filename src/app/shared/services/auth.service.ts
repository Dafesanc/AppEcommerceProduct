import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';
import { appsettings } from '../../settings/appsettings';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshResponse, User } from '../../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly base = `${appsettings.apiUrl}/auth`;

  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly isDistributor = computed(() => this._currentUser()?.role === 'DISTRIBUTOR');

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  refresh(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<RefreshResponse>(`${this.base}/refresh`, { refreshToken }).pipe(
      tap(res => {
        this.setAccessToken(res.accessToken);
        this.setRefreshToken(res.refreshToken);
      })
    );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`).pipe(
      tap(user => this._currentUser.set(user))
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('refreshToken');
  }

  private saveSession(res: AuthResponse): void {
    if (!this.isBrowser) return;
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    this._currentUser.set(res.user);
  }

  private setAccessToken(token: string): void {
    if (this.isBrowser) localStorage.setItem('accessToken', token);
  }

  private setRefreshToken(token: string): void {
    if (this.isBrowser) localStorage.setItem('refreshToken', token);
  }

  private loadUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
