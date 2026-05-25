import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../shared/services/products.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';
import { Product, ProductImage } from '../../models/product.models';
import { appsettings } from '../../settings/appsettings';

@Component({
  selector: 'app-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);

  product = signal<Product | null>(null);
  loading = signal(true);
  selectedImage = signal<string>('');
  quantity = signal(1);
  addingToCart = signal(false);
  toastMessage = signal<string | null>(null);

  readonly whatsappNumber = appsettings.whatsappNumber;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadProduct(params['id']);
    });
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productsService.getOne(id).subscribe({
      next: p => {
        this.product.set(p);
        const main = p.images?.find(img => img.isMain) ?? p.images?.[0];
        this.selectedImage.set(main?.url ?? '');
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/not-found']);
      }
    });
  }

  selectImage(img: ProductImage): void {
    this.selectedImage.set(img.url);
  }

  incrementQty(): void {
    const p = this.product();
    if (p && this.quantity() < p.stock) this.quantity.update(v => v + 1);
  }

  decrementQty(): void {
    if (this.quantity() > 1) this.quantity.update(v => v - 1);
  }

  addToCart(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const p = this.product();
    if (!p) return;
    this.cart.add(p, this.quantity());
    this.addingToCart.set(true);
    setTimeout(() => this.addingToCart.set(false), 800);
    this.showToast('Producto agregado al carrito');
  }

  openWhatsApp(): void {
    const p = this.product();
    if (!p) return;
    const price = p.promotionalPrice ?? p.price;
    const msg = `Hola, estoy interesado en el producto:\n*${p.name}*\nPrecio: $${price}\n\n¿Me puede dar más información?`;
    window.open(`https://wa.me/${this.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  getDiscount(): number {
    const p = this.product();
    return p ? this.productsService.getDiscountPercent(p) : 0;
  }

  getStars(rating: number): { full: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({ full: i + 1 <= Math.round(rating) }));
  }

  goBack(): void {
    this.router.navigate(['/catalogo']);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
