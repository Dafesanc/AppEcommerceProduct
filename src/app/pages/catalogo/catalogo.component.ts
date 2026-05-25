import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';
import { Product, Category } from '../../models/product.models';
import { appsettings } from '../../settings/appsettings';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  addingToCart = signal<string | null>(null);
  toastMessage = signal<string | null>(null);

  // Filtros
  search = signal('');
  selectedCategory = signal<string>('');
  sortBy = signal('totalSales');
  sortOrder = signal<'asc' | 'desc'>('desc');
  showPromos = signal(false);

  // Paginación
  page = signal(1);
  total = signal(0);
  readonly limit = 12;
  totalPages = computed(() => Math.ceil(this.total() / this.limit));

  readonly whatsappNumber = appsettings.whatsappNumber;

  ngOnInit(): void {
    this.categoriesService.getAll().subscribe(cats => this.categories.set(cats.filter(c => c.isActive)));

    this.route.queryParams.subscribe(params => {
      if (params['category']) this.selectedCategory.set(params['category']);
      if (params['search']) this.search.set(params['search']);
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService.getAll({
      page: this.page(),
      limit: this.limit,
      search: this.search() || undefined,
      categoryId: this.selectedCategory() || undefined,
      sortBy: this.sortBy(),
      order: this.sortOrder(),
      isPromotional: this.showPromos() || undefined,
    }).subscribe({
      next: res => {
        this.products.set(res.data ?? []);
        this.total.set(res.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    this.loadProducts();
  }

  selectCategory(id: string): void {
    this.selectedCategory.set(id);
    this.page.set(1);
    this.loadProducts();
  }

  changeSort(value: string): void {
    this.sortBy.set(value);
    this.page.set(1);
    this.loadProducts();
  }

  togglePromos(): void {
    this.showPromos.update(v => !v);
    this.page.set(1);
    this.loadProducts();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cart.add(product, 1);
    this.addingToCart.set(product.id);
    setTimeout(() => this.addingToCart.set(null), 600);
    this.showToast(`"${product.name}" agregado al carrito`);
  }

  openWhatsApp(product: Product, event: Event): void {
    event.stopPropagation();
    const msg = `Hola, estoy interesado en *${product.name}* ($${product.promotionalPrice ?? product.price}). ¿Me puede dar más información?`;
    window.open(`https://wa.me/${this.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  openWhatsAppGeneral(): void {
    const msg = `Hola, quisiera más información sobre sus productos.`;
    window.open(`https://wa.me/${this.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  goToProduct(id: string): void {
    this.router.navigate(['/producto', id]);
  }

  getMainImage(product: Product): string {
    return this.productsService.getMainImage(product);
  }

  getDiscount(product: Product): number {
    return this.productsService.getDiscountPercent(product);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  get pages(): number[] {
    const total = this.totalPages();
    const current = this.page();
    const range: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      range.push(i);
    }
    return range;
  }

  trackById(_: number, p: Product) { return p.id; }
  trackByCat(_: number, c: Category) { return c.id; }
}
