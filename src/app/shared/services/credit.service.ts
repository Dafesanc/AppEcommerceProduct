import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appsettings } from '../../settings/appsettings';

export interface CreateCreditDto {
  userId: string;
  transactionType: 'TRANSFER' | 'DEPOSIT';
  uniqueTransactionCode: string;
  originBank: string;
  originAccount: string;
  originAccountType: string;
  destinationBank: string;
  destinationAccount: string;
  destinationAccountType: string;
  amount: number;
  transactionDate: string;
  observations?: string;
  reference?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  adminId: string;
  transactionType: 'TRANSFER' | 'DEPOSIT';
  uniqueTransactionCode: string;
  originBank: string;
  originAccount: string;
  originAccountType: string;
  destinationBank: string;
  destinationAccount: string;
  destinationAccountType: string;
  amount: number;
  transactionDate: string;
  observations?: string;
  reference?: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class CreditService {
  private http = inject(HttpClient);
  private base = `${appsettings.apiUrl}/credit`;

  assign(dto: CreateCreditDto): Observable<CreditTransaction> {
    return this.http.post<CreditTransaction>(this.base, dto);
  }

  getAll(page = 1, limit = 20): Observable<{ data: CreditTransaction[]; total: number }> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<{ data: CreditTransaction[]; total: number }>(this.base, { params });
  }

  getMyHistory(): Observable<CreditTransaction[]> {
    return this.http.get<CreditTransaction[]>(`${this.base}/my-history`);
  }

  getByUser(userId: string): Observable<CreditTransaction[]> {
    return this.http.get<CreditTransaction[]>(`${this.base}/user/${userId}`);
  }

  updateStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'REJECTED'): Observable<CreditTransaction> {
    return this.http.patch<CreditTransaction>(`${this.base}/${id}/status`, { status });
  }
}
