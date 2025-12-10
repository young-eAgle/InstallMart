export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  subcategory?: string;
  stock: number;
  image_url?: string | null;
  brand?: string | null;
  tags?: string[];
  featured?: boolean;
  specifications?: Record<string, string>;
}

export interface CartItem extends Pick<Product, "id" | "name" | "price" | "image_url" | "category"> {
  quantity: number;
  installmentMonths?: number;
}

export type UserRole = "superadmin" | "admin" | "manager" | "customer" | "guest";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface OrderItem extends CartItem {}

export type PaymentMethod = "jazzcash" | "easypaisa" | "bank" | "mock";
export type PaymentStatus = "pending" | "verified" | "rejected";

export interface Installment {
  _id: string;
  dueDate: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  paidAt?: string;
  transactionId?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  installmentMonths: number;
  monthlyPayment: number;
  status: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentProofUrl?: string;
  paymentStatus: PaymentStatus;
  installments: Installment[];
  nextDueDate?: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
}
// NEW: Wishlist interface
export interface Wishlist {
  id: string;
  user: string;
  products: Product[];
  productCount?: number;
}

// NEW: Enhanced Admin Stats
export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingInstallments: number;
  pendingInstallmentsCount?: number;
  overdueInstallments?: number;
  overdueInstallmentsCount?: number;
  upcomingPayments?: number;
  upcomingPaymentsCount?: number;
  monthlyCommitment: number;
  monthlySales?: {
    month: string;
    year: number;
    sales: number;
    orders: number;
  }[];
  topProducts: {
    name: string;
    count: number;
    revenue: number;
  }[];
  paymentMethodStats?: {
    _id: string;
    count: number;
    total: number;
  }[];
  installmentPlanStats?: {
    _id: number;
    count: number;
    totalValue: number;
  }[];
}