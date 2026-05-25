import { Product } from './product.models';

export type PaymentMethod = 'CARD' | 'PAYPAL' | 'CREDIT_BALANCE' | 'CASH' | 'TRANSFER';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  notes?: string;
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  notes?: string;
  shippingAddress?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: 'Tarjeta',
  PAYPAL: 'PayPal',
  CREDIT_BALANCE: 'Saldo / Cupo',
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
};
