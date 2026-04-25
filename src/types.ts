export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number; // Default (Ecer)
  priceEcer: number;
  priceAgen: number;
  priceDistributor: number;
  stock: number;
  minStock: number;
  unit: string;
  supplierId: string;
}

export interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  customerId: string;
  cashierId: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Purchase {
  id: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  supplierId: string;
  supplierName?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  level: 'priceEcer' | 'priceAgen' | 'priceDistributor';
  points: number;
}

export interface SaleReturn {
  id: string;
  saleId: string;
  date: string;
  items: SaleItem[];
  total: number;
  reason: string;
}

export interface PurchaseReturn {
  id: string;
  purchaseId: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  reason: string;
}

export interface StockOpname {
  id: string;
  date: string;
  productId: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  notes: string;
  userId: string;
}

export interface StockHistory {
  id: string;
  date: string;
  productId: string;
  type: 'SALE' | 'PURCHASE' | 'SALE_RETURN' | 'PURCHASE_RETURN' | 'OPNAME' | 'ADJUSTMENT';
  referenceId: string;
  change: number;
  balanceAfter: number;
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'admin' | 'kasir' | 'owner';
  shift?: 'pagi' | 'siang';
  permissions?: string[]; // e.g., ['kasir', 'inventory', 'reports', 'settings', 'users']
}

export interface Settings {
  storeName: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number;
  dateFormat: string;
  minSpendForDiscount: number;
  autoDiscountValue: number;
  autoDiscountType: 'fixed' | 'percentage';
  pointsPer1000: number;
  gasUrl?: string;
}

export interface Database {
  settings: Settings;
  users: User[];
  products: Product[];
  categories: string[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: Sale[];
  purchases: Purchase[];
  saleReturns: SaleReturn[];
  purchaseReturns: PurchaseReturn[];
  stockOpnames: StockOpname[];
  stockHistory: StockHistory[];
  cashFlow: any[];
  shifts: any[];
  activityLog: any[];
}
