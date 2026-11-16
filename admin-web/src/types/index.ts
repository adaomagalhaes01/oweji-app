import { OrderStatus } from '../constants/order-status';

export type UserRole = 'admin' | 'merchant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  storeName?: string;
  avatarUrl?: string;
}

export type StoreStatus = 'active' | 'pending' | 'suspended';

export interface Store {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  province: string;
  logo: string;
  banner?: string;
  status: StoreStatus;
  commissionRate: number; // percentage (e.g., 10%)
  createdAt: number;
  iban: string;
  bankName: string;
  totalSales: number;
  productsCount: number;
}

export type ProductCondition = 'new' | 'semi-new' | 'good-used';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  condition: ProductCondition;
  stock: number;
  sizes: string[];
  colors: string[];
  image: string;
  merchantId: string;
  merchantStoreName: string;
  available: boolean;
  createdAt: number;
  views?: number;
}

export interface CustomerDeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  municipality: string;
  address: string;
  reference: string;
}

export interface OrderLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  size: string;
  color: string;
  merchantId: string;
  merchantStoreName: string;
}

export interface OrderReceipt {
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: number;
}

export interface Order {
  id: string;
  createdAt: number;
  customer: CustomerDeliveryDetails;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'bank-transfer';
  paymentReference: string;
  receipt?: OrderReceipt;
  validatedAt?: number;
  validationNotes?: string;
}

export interface Category {
  id: string;
  label: string;
  iconName?: string;
  productCount?: number;
}
