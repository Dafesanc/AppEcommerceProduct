export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  promotionalPrice?: number;
  stock: number;
  minStock: number;
  sku: string;
  categoryId: string;
  isPromotional: boolean;
  isFeatured: boolean;
  totalSales: number;
  averageRating: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: string;
  category?: Category;
  images: ProductImage[];
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isPromotional?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
