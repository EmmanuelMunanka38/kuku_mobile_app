export interface Product {
  id: number;
  farmId?: number;
  name: string;
  description?: string;
  price: number;
  inventory: number;
  category: string;
  weight?: string;
  image?: string;
  farm?: { id: number; name: string };
  createdAt: string;
}

export interface Farm {
  id: number;
  userId: number;
  name: string;
  description?: string;
  logo?: string;
  heroImage?: string;
  rating: number;
  reviewCount: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isOrganic: boolean;
  tags: string[];
  openStatus: string;
  deliveryTime: string;
  user?: { name: string };
  products?: Product[];
}

export interface Driver {
  id: number;
  name?: string;
  phone?: string;
}

export interface Order {
  id: number;
  userId?: number;
  driverId?: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  phone?: string;
  addressId?: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryAddress?: string;
  snippePaymentReference?: string;
  snippePaymentStatus?: string;
  items: OrderItem[];
  driver?: Driver;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Address {
  id: number;
  label?: string;
  phone?: string;
  street: string;
  city: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}
