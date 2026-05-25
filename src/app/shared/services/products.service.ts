import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appsettings } from '../../settings/appsettings';
import { Product, ProductsResponse, ProductQuery } from '../../models/product.models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private base = `${appsettings.apiUrl}/products`;

  getAll(query: ProductQuery = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return this.http.get<ProductsResponse>(this.base, { params });
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/featured`);
  }

  getOne(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  getMainImage(product: Product): string {
    const main = product.images?.find(img => img.isMain);
    return main?.url ?? product.images?.[0]?.url ?? '/placeholder-product.png';
  }

  getDiscountPercent(product: Product): number {
    if (!product.promotionalPrice || product.promotionalPrice >= product.price) return 0;
    return Math.round(((product.price - product.promotionalPrice) / product.price) * 100);
  }
}
