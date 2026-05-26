import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { UsersAdminService } from '../../shared/services/users-admin.service';
import { CreditService } from '../../shared/services/credit.service';
import { OrdersService } from '../../shared/services/orders.service';

export interface Movement {
  id: string;
  type: 'CREDIT_IN' | 'PURCHASE';
  label: string;
  sublabel: string;
  amount: number;
  date: string;
  statusColor?: string;
}

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  readonly auth = inject(AuthService);
  private usersService = inject(UsersAdminService);
  private creditService = inject(CreditService);
  private ordersService = inject(OrdersService);

  activeTab = signal<'info' | 'credito'>('info');
  editMode = signal(false);
  saving = signal(false);
  saveSuccess = signal('');
  saveError = signal('');

  movements = signal<Movement[]>([]);
  movementsLoading = signal(false);

  readonly totalSpent = computed(() =>
    this.movements().filter(m => m.type === 'PURCHASE').reduce((s, m) => s + m.amount, 0)
  );
  readonly totalCredited = computed(() =>
    this.movements().filter(m => m.type === 'CREDIT_IN').reduce((s, m) => s + m.amount, 0)
  );

  profileForm = signal({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    identificationType: '',
    identificationNumber: '',
  });

  readonly idTypes = [
    { value: 'CEDULA', label: 'Cédula' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'RUC', label: 'RUC' },
  ];

  ngOnInit(): void {
    this.syncForm();
    this.loadMovements();
  }

  private syncForm(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.profileForm.set({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? '',
        address: user.address ?? '',
        identificationType: user.identificationType ?? '',
        identificationNumber: user.identificationNumber ?? '',
      });
    }
  }

  loadMovements(): void {
    this.movementsLoading.set(true);
    forkJoin({
      credits: this.creditService.getMyHistory(),
      orders: this.ordersService.getAll(1, 100),
    }).subscribe({
      next: ({ credits, orders }) => {
        const creditMovements: Movement[] = credits.map(c => ({
          id: c.id,
          type: 'CREDIT_IN',
          label: this.getCreditTypeLabel(c.transactionType),
          sublabel: c.observations || c.uniqueTransactionCode || '',
          amount: c.amount,
          date: c.createdAt,
        }));

        const orderMovements: Movement[] = (orders.data ?? []).map(o => ({
          id: o.id,
          type: 'PURCHASE',
          label: `Pedido #${o.orderNumber}`,
          sublabel: this.getPaymentMethodLabel(o.paymentMethod),
          amount: o.total,
          date: o.createdAt,
          statusColor: this.getOrderStatusColor(o.status),
        }));

        const all = [...creditMovements, ...orderMovements]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.movements.set(all);
        this.movementsLoading.set(false);
      },
      error: () => this.movementsLoading.set(false),
    });
  }

  private getPaymentMethodLabel(method: string): string {
    const m: Record<string, string> = {
      CREDIT_BALANCE: 'Pagado con saldo',
      TRANSFER: 'Transferencia bancaria',
      CASH: 'Efectivo / Contra entrega',
      PAYPAL: 'PayPal',
    };
    return m[method] ?? method;
  }

  private getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'text-yellow-600',
      CONFIRMED: 'text-blue-600',
      PROCESSING: 'text-purple-600',
      SHIPPED: 'text-indigo-600',
      DELIVERED: 'text-green-600',
      CANCELLED: 'text-red-500',
    };
    return colors[status] ?? 'text-gray-500';
  }

  startEdit(): void {
    this.syncForm();
    this.saveSuccess.set('');
    this.saveError.set('');
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
  }

  saveProfile(): void {
    this.saving.set(true);
    this.saveSuccess.set('');
    this.saveError.set('');
    const f = this.profileForm();
    this.usersService.updateMe({
      firstName: f.firstName || undefined,
      lastName: f.lastName || undefined,
      phone: f.phone || undefined,
      address: f.address || undefined,
      identificationType: f.identificationType || undefined,
      identificationNumber: f.identificationNumber || undefined,
    }).subscribe({
      next: () => {
        this.auth.getMe().subscribe();
        this.saving.set(false);
        this.editMode.set(false);
        this.saveSuccess.set('Perfil actualizado correctamente.');
        setTimeout(() => this.saveSuccess.set(''), 3000);
      },
      error: e => {
        this.saveError.set(e.error?.message || 'Error al guardar los cambios.');
        this.saving.set(false);
      },
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      CUSTOMER: 'Cliente',
      DISTRIBUTOR: 'Distribuidor',
    };
    return labels[role] ?? role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      DISTRIBUTOR: 'bg-blue-100 text-blue-700',
      CUSTOMER: 'bg-green-100 text-green-700',
    };
    return classes[role] ?? 'bg-gray-100 text-gray-700';
  }

  getCreditTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      TRANSFER: 'Transferencia',
      DEPOSIT: 'Depósito',
      DEBIT: 'Débito (compra)',
      REFUND: 'Reembolso',
    };
    return labels[type] ?? type;
  }

  getCreditTypeColor(type: string): string {
    const colors: Record<string, string> = {
      TRANSFER: 'text-green-600',
      DEPOSIT: 'text-green-600',
      DEBIT: 'text-red-600',
      REFUND: 'text-blue-600',
    };
    return colors[type] ?? 'text-gray-600';
  }

  getCreditAmountPrefix(type: string): string {
    return type === 'DEBIT' ? '-' : '+';
  }

  updatePF(field: string, value: string): void {
    this.profileForm.update((f: any) => ({ ...f, [field]: value }));
  }
}
