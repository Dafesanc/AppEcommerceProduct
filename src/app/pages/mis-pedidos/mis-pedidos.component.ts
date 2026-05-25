import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../shared/services/orders.service';
import { Order, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../../models/order.models';

@Component({
  selector: 'app-mis-pedidos',
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-pedidos.component.html',
})
export class MisPedidosComponent implements OnInit {
  private ordersService = inject(OrdersService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  page = signal(1);
  total = signal(0);
  expandedOrderId = signal<string | null>(null);

  readonly ORDER_STATUS_LABELS = ORDER_STATUS_LABELS;
  readonly PAYMENT_METHOD_LABELS = PAYMENT_METHOD_LABELS;
  readonly PAYMENT_STATUS_LABELS = PAYMENT_STATUS_LABELS;
  readonly limit = 10;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.ordersService.getAll(this.page(), this.limit).subscribe({
      next: res => {
        this.orders.set(res.data ?? []);
        this.total.set(res.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleExpand(orderId: string): void {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? null : orderId);
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.total() / this.limit);
  }

  pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-purple-100 text-purple-700',
      SHIPPED: 'bg-indigo-100 text-indigo-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] ?? 'bg-gray-100 text-gray-700';
  }

  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-600',
      PAID: 'bg-green-50 text-green-600',
      FAILED: 'bg-red-50 text-red-600',
      REFUNDED: 'bg-gray-50 text-gray-600',
    };
    return colors[status] ?? 'bg-gray-50 text-gray-600';
  }
}
