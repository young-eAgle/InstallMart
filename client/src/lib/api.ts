import type {
  AuthUser,
  Order,
  Product,
  PaymentMethod,
  Wishlist,
  AdminStats,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/";

const buildUrl = (
  path: string,
  params?: Record<string, string | number | undefined>,
) => {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

const request = async <T>(path: string, options: RequestInit = {}) => {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody.message || "Request failed";
    throw new Error(message);
  }

  return res.json() as Promise<T>;
};

// Helper for multipart/form-data requests (file uploads)
const uploadRequest = async <T>(
  path: string,
  formData: FormData,
  token?: string,
  method: string = "POST",
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    method,
    body: formData,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody.message || "Upload failed";
    throw new Error(message);
  }

  return res.json() as Promise<T>;
};

export const productApi = {
  list: (params?: {
    category?: string;
    subcategory?: string;
    search?: string;
    featured?: boolean;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) =>
    request<{
      products: Product[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      filters?: {
        brands: string[];
        minPrice: number;
        maxPrice: number;
      };
    }>(
      buildUrl("/api/products", {
        category: params?.category,
        subcategory: params?.subcategory,
        search: params?.search,
        featured: params?.featured ? "true" : undefined,
        brand: params?.brand,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        sort: params?.sort,
        page: params?.page,
        limit: params?.limit,
      }),
    ),
  get: (id: string) =>
    request<{ product: Product }>(buildUrl(`/api/products/${id}`)),
};

export const authApi = {
  register: (payload: { fullName: string; email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>(buildUrl("/api/auth/register"), {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>(buildUrl("/api/auth/login"), {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: (token: string) =>
    request<{ user: AuthUser }>(buildUrl("/api/auth/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

// Updated order API to support guest orders and return order ID
export const orderApi = {
  create: (
    payload: {
      items: { id: string; quantity: number }[];
      shippingAddress: string;
      phone: string;
      installmentMonths: number;
      paymentMethod: PaymentMethod;
      paymentReference?: string;
      paymentProofUrl?: string;
      customerInfo?: {
        fullName: string;
        email: string;
      }; // Optional for guest orders
    },
    token?: string, // Optional token for authenticated users
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Add authorization header only if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Use different endpoint for guest orders
    const endpoint = token ? "/api/orders" : "/api/orders/guest";
    
    return request<{ order: Order }>(buildUrl(endpoint), {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    });
  },
  mine: (token: string) =>
    request<{ orders: Order[] }>(buildUrl("/api/orders/mine"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  // Get guest order by ID
  getGuestOrder: (orderId: string) =>
    request<{ order: Order }>(buildUrl(`/api/orders/guest/${orderId}`)),
};

// NEW: Wishlist API
export const wishlistApi = {
  get: (token: string) =>
    request<{ wishlist: Wishlist }>(buildUrl("/api/wishlist"), {
      headers: { Authorization: `Bearer ${token}` },
    }),
  add: (productId: string, token: string) =>
    request<{ wishlist: Wishlist; message: string }>(
      buildUrl(`/api/wishlist/${productId}`),
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
  remove: (productId: string, token: string) =>
    request<{ wishlist: Wishlist; message: string }>(
      buildUrl(`/api/wishlist/${productId}`),
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
  clear: (token: string) =>
    request<{ wishlist: Wishlist; message: string }>(
      buildUrl("/api/wishlist"),
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
  check: (productId: string, token: string) =>
    request<{ isInWishlist: boolean }>(
      buildUrl(`/api/wishlist/check/${productId}`),
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
};

export const adminApi = {
  stats: (token: string) =>
    request<{ stats: AdminStats }>(buildUrl("/api/admin/stats"), {
      headers: { Authorization: `Bearer ${token}` },
    }),
  users: (token: string) =>
    request<{ users: AuthUser[] }>(buildUrl("/api/admin/users"), {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateUserRole: (token: string, userId: string, role: string) =>
    request<AuthUser>(buildUrl(`/api/admin/users/${userId}/role`), {
      method: "PATCH",
      body: JSON.stringify({ role }),
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    }),
  orders: (token: string) =>
    request<{ orders: Order[] }>(buildUrl("/api/admin/orders"), {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateInstallment: (
    orderId: string,
    installmentId: string,
    payload: { status: "pending" | "paid" | "overdue"; transactionId?: string },
    token: string,
  ) =>
    request<{ order: Order }>(
      buildUrl(`/api/admin/orders/${orderId}/installments/${installmentId}`),
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
  updatePaymentStatus: (
    orderId: string,
    paymentStatus: "pending" | "verified" | "rejected",
    token: string,
  ) =>
    request<{ order: Order }>(
      buildUrl(`/api/admin/orders/${orderId}/payment`),
      {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus }),
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  // Updated with file upload support
  createProduct: (formData: FormData, token: string) =>
    uploadRequest<{ product: Product }>(
      buildUrl("/api/admin/products"),
      formData,
      token,
    ),

  updateProduct: (id: string, formData: FormData, token: string) => {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(buildUrl(`/api/admin/products/${id}`), {
      method: "PUT",
      body: formData,
      headers,
    }).then(async (res) => {
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.message || "Update failed");
      }
      return res.json() as Promise<{ product: Product }>;
    });
  },

  deleteProduct: (id: string, token: string) =>
    request<{ message: string; productName?: string }>(
      buildUrl(`/api/admin/products/${id}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    ),
};

export const categoryApi = {
  list: () => request<{ categories: any[] }>(buildUrl("/api/categories")),

  get: (slug: string) =>
    request<{ category: any }>(buildUrl(`/api/categories/${slug}`)),

  create: (payload: any, imageFile: File | null, token: string) => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("slug", payload.slug);
    formData.append("color", payload.color);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.order !== undefined)
      formData.append("order", payload.order.toString());
    if (imageFile) formData.append("icon", imageFile);

    return uploadRequest<{ category: any }>(
      buildUrl("/api/categories"),
      formData,
      token,
    );
  },

  update: (id: string, payload: any, imageFile: File | null, token: string) => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("slug", payload.slug);
    formData.append("color", payload.color);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.order !== undefined)
      formData.append("order", payload.order.toString());
    if (payload.isActive !== undefined)
      formData.append("isActive", payload.isActive.toString());
    if (imageFile) formData.append("icon", imageFile);

    return uploadRequest<{ category: any }>(
      buildUrl(`/api/categories/${id}`),
      formData,
      token,
      "PUT",
    );
  },

  delete: async (id: string, token: string) =>
    request<{ message: string; categoryName?: string }>(
      buildUrl(`/api/categories/${id}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    ),
};

// Payment API
export const paymentApi = {
  initialize: (
    payload: {
      orderId: string;
      paymentMethod: "jazzcash" | "easypaisa" | "mock";
      installmentId?: string;
    },
    token: string,
  ) =>
    request<{
      success: boolean;
      paymentUrl: string;
      formData: Record<string, string>;
      transactionRef: string;
      orderId: string;
      installmentId?: string;
      redirectUrl?: string;
    }>(buildUrl("/api/payment/initialize"), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  getStatus: (
    orderId: string,
    installmentId: string | undefined,
    token: string,
  ) =>
    request<{
      status?: string;
      amount?: number;
      paidAt?: string;
      transactionId?: string;
      totalInstallments?: number;
      paidInstallments?: number;
      pendingInstallments?: number;
      overdueInstallments?: number;
    }>(
      buildUrl(
        `/api/payment/status/${orderId}${installmentId ? `/${installmentId}` : ""}`,
      ),
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
};

export const storageKeys = {
  authToken: "installmart_token",
};

// Banner API
export const bannerApi = {
  // Public - get active banners
  getActive: (type?: string) =>
    request<{ banners: any[] }>(
      buildUrl("/api/banners/active", type ? { type } : {}),
    ),

  // Admin - get all banners
  getAll: (token: string) =>
    request<{ banners: any[] }>(buildUrl("/api/banners"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Admin - get single banner
  get: (id: string, token: string) =>
    request<{ banner: any }>(buildUrl(`/api/banners/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Admin - create banner
  create: async (formData: FormData, token: string) => {
    return uploadRequest<{ banner: any }>(
      buildUrl("/api/banners"),
      formData,
      token,
    );
  },

  // Admin - update banner
  update: async (id: string, formData: FormData, token: string) => {
    return uploadRequest<{ banner: any }>(
      buildUrl(`/api/banners/${id}`),
      formData,
      token,
      "PUT",
    );
  },

  // Admin - delete banner
  delete: (id: string, token: string) =>
    request<{ message: string }>(buildUrl(`/api/banners/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

// Document API
export const documentApi = {
  // User - get my documents
  getMyDocuments: (token: string) =>
    request<{
      documents: any[];
      verificationStatus: string;
      documentsVerified: boolean;
    }>(buildUrl("/api/documents/my"), {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // User - upload document
  upload: (formData: FormData, token: string) =>
    uploadRequest<{ message: string; document: any }>(
      buildUrl("/api/documents/upload"),
      formData,
      token,
    ),

  // User - delete document
  delete: (documentId: string, token: string) =>
    request<{ message: string }>(
      buildUrl(`/api/documents/${documentId}`),
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  // Guest - upload document
  uploadGuest: (formData: FormData) =>
    uploadRequest<{ success: boolean; message: string; document?: any }>(
      buildUrl("/api/documents/guest/upload"),
      formData,
    ),

  // Guest - get documents by order ID
  getGuestDocuments: (orderId: string) =>
    request<{ documents: any[] }>(buildUrl(`/api/documents/guest/${orderId}`)),
};