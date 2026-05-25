import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appsettings } from '../../settings/appsettings';
import { User } from '../../models/auth.models';

export interface UpdateUserAdminDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'CUSTOMER' | 'DISTRIBUTOR';
  defaultDiscount?: number;
  isActive?: boolean;
  address?: string;
  identificationType?: string;
  identificationNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private http = inject(HttpClient);
  private base = `${appsettings.apiUrl}/users`;

  getAll(role?: string): Observable<User[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    return this.http.get<User[]>(this.base, { params });
  }

  getOne(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  update(id: string, dto: UpdateUserAdminDto): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, dto);
  }

  updateMe(dto: Partial<UpdateUserAdminDto>): Observable<User> {
    return this.http.patch<User>(`${this.base}/me`, dto);
  }

  toggleActive(id: string): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}/toggle-active`, {});
  }

  getCreditHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${id}/credit-history`);
  }
}
