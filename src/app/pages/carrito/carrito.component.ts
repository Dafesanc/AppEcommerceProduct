import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';
import { ProductsService } from '../../shared/services/products.service';
import { CartItem } from '../../models/cart.models';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
})
export class CarritoComponent {
  readonly cart = inject(CartService);
  readonly productsService = inject(ProductsService);
  private router = inject(Router);

  updateQty(productId: string, qty: number): void {
    this.cart.update(productId, qty);
  }

  remove(productId: string): void {
    this.cart.remove(productId);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  getItemPrice(item: CartItem): number {
    return (item.product.promotionalPrice ?? item.product.price) * item.quantity;
  }
}
