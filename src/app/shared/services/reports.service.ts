import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appsettings } from '../../settings/appsettings';

export interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  period: { from: string; to: string };
}

export interface BestSeller {
  productId: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface StockAlert {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  orders: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private base = `${appsettings.apiUrl}/reports`;

  getSalesSummary(from?: string, to?: string): Observable<SalesSummary> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<SalesSummary>(`${this.base}/sales`, { params });
  }

  getBestSellers(limit = 10): Observable<BestSeller[]> {
    return this.http.get<BestSeller[]>(`${this.base}/best-sellers`, { params: new HttpParams().set('limit', limit) });
  }

  getStockReport(): Observable<StockAlert[]> {
    return this.http.get<StockAlert[]>(`${this.base}/stock`);
  }

  getRevenue(period: 'day' | 'week' | 'month' = 'month'): Observable<RevenueByPeriod[]> {
    return this.http.get<RevenueByPeriod[]>(`${this.base}/revenue`, { params: new HttpParams().set('period', period) });
  }
}
