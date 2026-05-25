import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';
import { OrdersService } from '../../shared/services/orders.service';
import { AuthService } from '../../shared/services/auth.service';
import { PaymentMethod, Order, PAYMENT_METHOD_LABELS } from '../../models/order.models';
import { appsettings } from '../../settings/appsettings';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private ordersService = inject(OrdersService);
  private router = inject(Router);

  paymentMethod = signal<PaymentMethod>('CASH');
  shippingAddress = signal('');
  notes = signal('');
  loading = signal(false);
  error = signal('');
  completedOrder = signal<Order | null>(null);

  readonly whatsappNumber = appsettings.whatsappNumber;
  readonly PAYMENT_LABELS = PAYMENT_METHOD_LABELS;

  readonly paymentOptions: { value: PaymentMethod; label: string; desc: string; icon: string }[] = [
    { value: 'CASH', label: 'Efectivo', desc: 'Paga en efectivo al momento de entrega o retiro', icon: '💵' },
    { value: 'TRANSFER', label: 'Transferencia', desc: 'Transfiere a nuestra cuenta y envía el comprobante por WhatsApp', icon: '🏦' },
    { value: 'CREDIT_BALANCE', label: 'Saldo / Cupo', desc: `Saldo disponible: $${this.auth.currentUser()?.creditBalance?.toFixed(2) ?? '0.00'}`, icon: '💳' },
    { value: 'PAYPAL', label: 'PayPal', desc: 'Pago seguro en línea con PayPal', icon: '🅿️' },
  ];

  readonly hasEnoughCredit = computed(() => {
    const balance = this.auth.currentUser()?.creditBalance ?? 0;
    return balance >= this.cart.total();
  });

  ngOnInit(): void {
    this.cart.load();
    if (this.cart.items().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  placeOrder(): void {
    if (this.cart.items().length === 0) return;

    if (this.paymentMethod() === 'PAYPAL') {
      this.error.set('El pago por PayPal estará disponible próximamente. Por ahora usa otro método o contáctanos por WhatsApp.');
      return;
    }

    if (this.paymentMethod() === 'CREDIT_BALANCE' && !this.hasEnoughCredit()) {
      this.error.set('Saldo insuficiente. Tu saldo actual no cubre el total del pedido.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const dto = {
      items: this.cart.items().map(i => ({ productId: i.productId, quantity: i.quantity })),
      paymentMethod: this.paymentMethod(),
      notes: this.notes() || undefined,
      shippingAddress: this.shippingAddress() || undefined,
    };

    this.ordersService.create(dto).subscribe({
      next: order => {
        this.completedOrder.set(order);
        this.cart.clear();
        this.loading.set(false);

        if (this.paymentMethod() === 'TRANSFER') {
          setTimeout(() => this.openWhatsAppConfirmation(order), 1500);
        }
      },
      error: err => {
        this.error.set(err.error?.message || 'Error al procesar el pedido. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }

  openWhatsAppConfirmation(order: Order): void {
    const msg = `Hola, acabo de realizar el pedido *#${order.orderNumber}* por un total de *$${order.total.toFixed(2)}*.\nMétodo de pago: Transferencia.\nAdjunto mi comprobante de pago.`;
    window.open(`https://wa.me/${this.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  goToOrders(): void {
    this.router.navigate(['/mis-pedidos']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
