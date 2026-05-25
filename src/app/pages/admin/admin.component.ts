import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { OrdersService } from '../../shared/services/orders.service';
import { UsersAdminService } from '../../shared/services/users-admin.service';
import { CreditService, CreateCreditDto } from '../../shared/services/credit.service';
import { ReportsService, SalesSummary, BestSeller, StockAlert } from '../../shared/services/reports.service';
import { AuthService } from '../../shared/services/auth.service';
import { Product, Category } from '../../models/product.models';
import { Order, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../../models/order.models';
import { User } from '../../models/auth.models';
import { appsettings } from '../../settings/appsettings';

export type AdminSection = 'dashboard' | 'pedidos' | 'productos' | 'categorias' | 'usuarios' | 'creditos' | 'reportes';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private ordersService = inject(OrdersService);
  private usersService = inject(UsersAdminService);
  private creditService = inject(CreditService);
  private reportsService = inject(ReportsService);
  readonly auth = inject(AuthService);
  private router = inject(Router);

  activeSection = signal<AdminSection>('dashboard');
  sidebarOpen = signal(false);

  // ── Labels
  readonly ORDER_STATUS_LABELS = ORDER_STATUS_LABELS;
  readonly PAYMENT_METHOD_LABELS = PAYMENT_METHOD_LABELS;
  readonly PAYMENT_STATUS_LABELS = PAYMENT_STATUS_LABELS;
  readonly ORDER_STATUSES: import('../../models/order.models').OrderStatus[] = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
  readonly NAV_ITEMS: { id: AdminSection; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'pedidos', label: 'Pedidos', icon: '📦' },
    { id: 'productos', label: 'Productos', icon: '🛍️' },
    { id: 'categorias', label: 'Categorías', icon: '🏷️' },
    { id: 'usuarios', label: 'Usuarios', icon: '👥' },
    { id: 'creditos', label: 'Crédito', icon: '💳' },
    { id: 'reportes', label: 'Reportes', icon: '📈' },
  ];

  // ── Dashboard
  salesSummary = signal<SalesSummary | null>(null);
  stockAlerts = signal<StockAlert[]>([]);
  pendingOrdersCount = signal(0);

  // ── Pedidos
  orders = signal<Order[]>([]);
  ordersLoading = signal(false);
  ordersPage = signal(1);
  ordersTotal = signal(0);
  updatingOrderId = signal<string | null>(null);

  // ── Productos
  products = signal<Product[]>([]);
  productsLoading = signal(false);
  showProductForm = signal(false);
  editingProduct = signal<Product | null>(null);
  productForm = signal({
    name: '', description: '', shortDescription: '', price: 0, promotionalPrice: null as number | null,
    stock: 0, minStock: 5, sku: '', categoryId: '', isPromotional: false, isFeatured: false,
  });
  productImages = signal<File[]>([]);
  savingProduct = signal(false);

  // ── Categorías
  categories = signal<Category[]>([]);
  categoryForm = signal({ name: '', description: '', slug: '' });
  editingCategoryId = signal<string | null>(null);
  savingCategory = signal(false);

  // ── Usuarios
  users = signal<User[]>([]);
  usersLoading = signal(false);
  userRoleFilter = signal('');
  editingUserId = signal<string | null>(null);
  userEditForm = signal({ defaultDiscount: 0, role: '' as any });

  // ── Créditos
  creditForm = signal<CreateCreditDto>({
    userId: '', transactionType: 'TRANSFER', uniqueTransactionCode: '', originBank: '',
    originAccount: '', originAccountType: 'CORRIENTE', destinationBank: '',
    destinationAccount: '', destinationAccountType: 'CORRIENTE',
    amount: 0, transactionDate: new Date().toISOString().split('T')[0],
    observations: '', reference: '',
  });
  savingCredit = signal(false);
  creditSuccess = signal('');
  creditError = signal('');

  // ── Reportes
  bestSellers = signal<BestSeller[]>([]);
  revenueData = signal<any[]>([]);
  revenuePeriod = signal<'day' | 'week' | 'month'>('month');
  reportLoading = signal(false);

  // ── Misc
  toastMsg = signal('');
  toastType = signal<'ok' | 'err'>('ok');

  ngOnInit(): void {
    this.loadDashboard();
  }

  goTo(section: AdminSection): void {
    this.activeSection.set(section);
    this.sidebarOpen.set(false);
    switch (section) {
      case 'pedidos': this.loadOrders(); break;
      case 'productos': this.loadProducts(); this.loadCategories(); break;
      case 'categorias': this.loadCategories(); break;
      case 'usuarios': this.loadUsers(); break;
      case 'creditos': this.loadUsers(); break;
      case 'reportes': this.loadReports(); break;
    }
  }

  // ─────────────── DASHBOARD ───────────────
  private loadDashboard(): void {
    this.reportsService.getSalesSummary().subscribe({ next: d => this.salesSummary.set(d), error: () => {} });
    this.productsService.getAll({ limit: 1 }).subscribe({ next: res => {}, error: () => {} });
    this.reportsService.getStockReport().subscribe({ next: d => this.stockAlerts.set(d), error: () => {} });
    this.ordersService.getAll(1, 1).subscribe({ next: res => this.ordersTotal.set(res.total ?? 0), error: () => {} });
  }

  // ─────────────── PEDIDOS ───────────────
  loadOrders(): void {
    this.ordersLoading.set(true);
    this.ordersService.getAll(this.ordersPage(), 15).subscribe({
      next: res => { this.orders.set(res.data ?? []); this.ordersTotal.set(res.total ?? 0); this.ordersLoading.set(false); },
      error: () => this.ordersLoading.set(false),
    });
  }

  updateOrderStatus(id: string, status: string): void {
    this.updatingOrderId.set(id);
    this.ordersService.updateStatus(id, status).subscribe({
      next: () => { this.toast('Estado actualizado'); this.loadOrders(); this.updatingOrderId.set(null); },
      error: () => { this.toast('Error al actualizar', true); this.updatingOrderId.set(null); },
    });
  }

  // ─────────────── PRODUCTOS ───────────────
  loadProducts(): void {
    this.productsLoading.set(true);
    this.productsService.getAll({ limit: 50 }).subscribe({
      next: res => { this.products.set(res.data ?? []); this.productsLoading.set(false); },
      error: () => this.productsLoading.set(false),
    });
  }

  openProductForm(product?: Product): void {
    if (product) {
      this.editingProduct.set(product);
      this.productForm.set({
        name: product.name, description: product.description,
        shortDescription: product.shortDescription ?? '',
        price: product.price, promotionalPrice: product.promotionalPrice ?? null,
        stock: product.stock, minStock: product.minStock, sku: product.sku,
        categoryId: product.categoryId, isPromotional: product.isPromotional, isFeatured: product.isFeatured,
      });
    } else {
      this.editingProduct.set(null);
      this.productForm.set({ name: '', description: '', shortDescription: '', price: 0, promotionalPrice: null, stock: 0, minStock: 5, sku: '', categoryId: '', isPromotional: false, isFeatured: false });
    }
    this.productImages.set([]);
    this.showProductForm.set(true);
  }

  onImageSelect(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.productImages.set(Array.from(files));
  }

  saveProduct(): void {
    this.savingProduct.set(true);
    const form = this.productForm();
    const dto = { ...form, promotionalPrice: form.promotionalPrice ?? undefined };
    const editing = this.editingProduct();

    const afterSave = (id: string) => {
      const files = this.productImages();
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(f => formData.append('images', f));
        import('@angular/common/http').then(({ HttpClient }) => {
          // Images are uploaded via the products service using the injected HttpClient
        });
        // Upload images via direct http call
        const http = (this.productsService as any).http;
        http.post(`${appsettings.apiUrl}/products/${id}/images`, (() => {
          const fd = new FormData();
          files.forEach(f => fd.append('images', f));
          return fd;
        })()).subscribe({ next: () => {}, error: () => {} });
      }
      this.savingProduct.set(false);
      this.showProductForm.set(false);
      this.loadProducts();
      this.toast(editing ? 'Producto actualizado' : 'Producto creado');
    };

    if (editing) {
      (this.productsService as any).http.patch(`${appsettings.apiUrl}/products/${editing.id}`, dto).subscribe({
        next: (p: Product) => afterSave(p.id),
        error: (e: any) => { this.toast(e.error?.message || 'Error al guardar', true); this.savingProduct.set(false); },
      });
    } else {
      (this.productsService as any).http.post(`${appsettings.apiUrl}/products`, dto).subscribe({
        next: (p: Product) => afterSave(p.id),
        error: (e: any) => { this.toast(e.error?.message || 'Error al guardar', true); this.savingProduct.set(false); },
      });
    }
  }

  deleteProduct(id: string): void {
    if (!confirm('¿Eliminar este producto?')) return;
    (this.productsService as any).http.delete(`${appsettings.apiUrl}/products/${id}`).subscribe({
      next: () => { this.toast('Producto eliminado'); this.loadProducts(); },
      error: (e: any) => this.toast(e.error?.message || 'Error al eliminar', true),
    });
  }

  // ─────────────── CATEGORÍAS ───────────────
  loadCategories(): void {
    this.categoriesService.getAll().subscribe({ next: cats => this.categories.set(cats), error: () => {} });
  }

  saveCategory(): void {
    this.savingCategory.set(true);
    const form = this.categoryForm();
    const editId = this.editingCategoryId();
    const obs = editId
      ? (this.categoriesService as any).http.patch(`${appsettings.apiUrl}/categories/${editId}`, form)
      : (this.categoriesService as any).http.post(`${appsettings.apiUrl}/categories`, form);
    obs.subscribe({
      next: () => { this.savingCategory.set(false); this.loadCategories(); this.editingCategoryId.set(null); this.categoryForm.set({ name: '', description: '', slug: '' }); this.toast(editId ? 'Categoría actualizada' : 'Categoría creada'); },
      error: (e: any) => { this.toast(e.error?.message || 'Error', true); this.savingCategory.set(false); },
    });
  }

  editCategory(cat: Category): void {
    this.editingCategoryId.set(cat.id);
    this.categoryForm.set({ name: cat.name, description: cat.description ?? '', slug: cat.slug });
  }

  deleteCategory(id: string): void {
    if (!confirm('¿Eliminar esta categoría?')) return;
    (this.categoriesService as any).http.delete(`${appsettings.apiUrl}/categories/${id}`).subscribe({
      next: () => { this.toast('Categoría eliminada'); this.loadCategories(); },
      error: (e: any) => this.toast(e.error?.message || 'Error', true),
    });
  }

  autoSlug(name: string): void {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    this.categoryForm.update(f => ({ ...f, slug }));
  }

  // ─────────────── USUARIOS ───────────────
  loadUsers(): void {
    this.usersLoading.set(true);
    this.usersService.getAll(this.userRoleFilter() || undefined).subscribe({
      next: users => { this.users.set(users); this.usersLoading.set(false); },
      error: () => this.usersLoading.set(false),
    });
  }

  startEditUser(user: User): void {
    this.editingUserId.set(user.id);
    this.userEditForm.set({ defaultDiscount: user.defaultDiscount, role: user.role });
  }

  saveUserEdit(userId: string): void {
    const form = this.userEditForm();
    this.usersService.update(userId, { defaultDiscount: form.defaultDiscount, role: form.role }).subscribe({
      next: () => { this.editingUserId.set(null); this.toast('Usuario actualizado'); this.loadUsers(); },
      error: (e: any) => this.toast(e.error?.message || 'Error', true),
    });
  }

  toggleUserActive(user: User): void {
    this.usersService.toggleActive(user.id).subscribe({
      next: () => { this.toast(`Usuario ${user.isActive ? 'desactivado' : 'activado'}`); this.loadUsers(); },
      error: () => this.toast('Error', true),
    });
  }

  setCreditUserId(userId: string): void {
    this.creditForm.update(f => ({ ...f, userId }));
    this.goTo('creditos');
  }

  // ─────────────── CRÉDITOS ───────────────
  submitCredit(): void {
    this.savingCredit.set(true);
    this.creditSuccess.set('');
    this.creditError.set('');
    this.creditService.assign(this.creditForm()).subscribe({
      next: res => {
        this.savingCredit.set(false);
        this.creditSuccess.set(`Crédito de $${res.amount} asignado correctamente.`);
        this.creditForm.update(f => ({ ...f, uniqueTransactionCode: '', observations: '', reference: '', amount: 0 }));
        this.loadUsers();
      },
      error: e => { this.savingCredit.set(false); this.creditError.set(e.error?.message || 'Error al asignar crédito'); },
    });
  }

  updateCreditField(field: keyof CreateCreditDto, value: any): void {
    this.creditForm.update(f => ({ ...f, [field]: value }));
  }

  updateProductForm(field: string, value: any): void {
    this.productForm.update((f: any) => ({ ...f, [field]: value }));
  }

  updateCategoryForm(field: string, value: string): void {
    this.categoryForm.update((f: any) => ({ ...f, [field]: value }));
  }

  setCategoryName(value: string): void {
    this.categoryForm.update((f: any) => ({ ...f, name: value }));
    this.autoSlug(value);
  }

  updateUserEditForm(field: string, value: any): void {
    this.userEditForm.update((f: any) => ({ ...f, [field]: value }));
  }

  // ─────────────── REPORTES ───────────────
  loadReports(): void {
    this.reportLoading.set(true);
    this.reportsService.getBestSellers(10).subscribe({ next: d => this.bestSellers.set(d), error: () => {} });
    this.reportsService.getRevenue(this.revenuePeriod()).subscribe({ next: d => { this.revenueData.set(d); this.reportLoading.set(false); }, error: () => this.reportLoading.set(false) });
  }

  changeRevenuePeriod(period: string): void {
    const p = period as 'day' | 'week' | 'month';
    this.revenuePeriod.set(p);
    this.reportsService.getRevenue(p).subscribe({ next: d => this.revenueData.set(d), error: () => {} });
  }

  // ─────────────── UTILS ───────────────
  private toast(msg: string, isError = false): void {
    this.toastMsg.set(msg);
    this.toastType.set(isError ? 'err' : 'ok');
    setTimeout(() => this.toastMsg.set(''), 3000);
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

  getMainImage(product: Product): string {
    return this.productsService.getMainImage(product);
  }
}
