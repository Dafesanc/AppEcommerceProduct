import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appsettings } from '../../settings/appsettings';
import { Order, OrdersResponse, CreateOrderRequest } from '../../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private base = `${appsettings.apiUrl}/orders`;

  create(dto: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.base, dto);
  }

  getAll(page = 1, limit = 10): Observable<OrdersResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<OrdersResponse>(this.base, { params });
  }

  getOne(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  updateStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/status`, { status });
  }
}
