import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { AuthService } from '../../shared/services/auth.service';
import { Product, Category } from '../../models/product.models';
import { appsettings } from '../../settings/appsettings';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private router = inject(Router);
  readonly auth = inject(AuthService);

  featuredProducts = signal<Product[]>([]);
  promotionalProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loadingFeatured = signal(true);
  loadingPromos = signal(true);
  loadingCategories = signal(true);
  selectedCategory = signal<string | null>(null);

  readonly whatsappNumber = appsettings.whatsappNumber;

  ngOnInit(): void {
    this.loadFeatured();
    this.loadPromotional();
    this.loadCategories();
  }

  private loadFeatured(): void {
    this.productsService.getFeatured().subscribe({
      next: products => {
        this.featuredProducts.set(products);
        this.loadingFeatured.set(false);
      },
      error: () => this.loadingFeatured.set(false)
    });
  }

  private loadPromotional(): void {
    this.productsService.getAll({ isPromotional: true, limit: 8 }).subscribe({
      next: res => {
        this.promotionalProducts.set(res.data ?? []);
        this.loadingPromos.set(false);
      },
      error: () => this.loadingPromos.set(false)
    });
  }

  private loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: cats => {
        this.categories.set(cats.filter(c => c.isActive));
        this.loadingCategories.set(false);
      },
      error: () => this.loadingCategories.set(false)
    });
  }

  getMainImage(product: Product): string {
    return this.productsService.getMainImage(product);
  }

  getDiscount(product: Product): number {
    return this.productsService.getDiscountPercent(product);
  }

  goToProduct(id: string): void {
    this.router.navigate(['/producto', id]);
  }

  goToCatalog(categoryId?: string): void {
    if (categoryId) {
      this.router.navigate(['/catalogo'], { queryParams: { category: categoryId } });
    } else {
      this.router.navigate(['/catalogo']);
    }
  }

  openWhatsApp(product?: Product): void {
    const msg = product
      ? `Hola, estoy interesado en el producto: *${product.name}* ($${product.promotionalPrice ?? product.price}). ¿Podría darme más información?`
      : 'Hola, me gustaría obtener más información sobre sus productos.';
    const url = `https://wa.me/${this.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  trackById(_: number, item: Product): string {
    return item.id;
  }

  trackByCatId(_: number, cat: Category): string {
    return cat.id;
  }
}
