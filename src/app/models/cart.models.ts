import { Product } from './product.models';

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}
