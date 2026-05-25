import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UsersAdminService } from '../../shared/services/users-admin.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  readonly auth = inject(AuthService);
  private usersService = inject(UsersAdminService);

  activeTab = signal<'info' | 'credito'>('info');
  editMode = signal(false);
  saving = signal(false);
  saveSuccess = signal('');
  saveError = signal('');

  creditHistory = signal<any[]>([]);
  creditLoading = signal(false);

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
    const user = this.auth.currentUser();
    if (user) this.loadCreditHistory(user.id);
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

  loadCreditHistory(userId: string): void {
    this.creditLoading.set(true);
    this.usersService.getCreditHistory(userId).subscribe({
      next: data => { this.creditHistory.set(data); this.creditLoading.set(false); },
      error: () => this.creditLoading.set(false),
    });
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
