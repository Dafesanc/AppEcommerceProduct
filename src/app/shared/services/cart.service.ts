import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../models/product.models';
import { CartItem } from '../../models/cart.models';

const CART_KEY = 'cart_items';
const IVA_RATE = 0.15;
const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 5;

@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private _items = signal<CartItem[]>(this.loadFromStorage());
  readonly items = this._items.asReadonly();

  readonly count = computed(() =>
    this._items().reduce((acc, i) => acc + i.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((acc, i) => {
      const price = i.product.promotionalPrice ?? i.product.price;
      return acc + price * i.quantity;
    }, 0)
  );

  readonly shipping = computed(() =>
    this.subtotal() >= SHIPPING_THRESHOLD ? 0 : (this._items().length > 0 ? SHIPPING_COST : 0)
  );

  readonly iva = computed(() =>
    (this.subtotal() + this.shipping()) * IVA_RATE
  );

  readonly total = computed(() =>
    this.subtotal() + this.shipping() + this.iva()
  );

  // Kept for backwards compat — cart is now always in memory
  load(): void {}

  add(product: Product, quantity = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.productId === product.id);
      const updated = existing
        ? items.map(i => i.productId === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i)
        : [...items, { productId: product.id, quantity, product }];
      this.save(updated);
      return updated;
    });
  }

  update(productId: string, quantity: number): void {
    if (quantity < 1) return;
    this._items.update(items => {
      const updated = items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      );
      this.save(updated);
      return updated;
    });
  }

  remove(productId: string): void {
    this._items.update(items => {
      const updated = items.filter(i => i.productId !== productId);
      this.save(updated);
      return updated;
    });
  }

  clear(): void {
    this._items.set([]);
    this.save([]);
  }

  private save(items: CartItem[]): void {
    if (this.isBrowser) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }

  private loadFromStorage(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
