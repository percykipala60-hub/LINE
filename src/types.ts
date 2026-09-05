export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stockQuantity: number;
  sku?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Product {
  id: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  isActive: boolean;
  isNewDrop?: boolean;
  isTrending?: boolean;
  rating?: number;
  reviewsCount?: number;
  variants: ProductVariant[];
  tags?: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface StoryDrop {
  id: string;
  title: string;
  tag: string;
  image: string;
  hasNew: boolean;
  caption: string;
}

export interface OrderDetails {
  customerName: string;
  phone: string;
  deliveryCity: string;
  deliveryAddress: string;
  preferredNetwork: 'whatsapp' | 'instagram';
  notes?: string;
}

export interface SellerContact {
  whatsappNumber: string; // e.g. +243... or international format
  whatsappName: string;
  instagramHandle: string;
  instagramUrl: string;
}
