export const ServerStrings = {
  // 1. Auth
  register: '/api/v1/auth/register',
  registerVerify: '/api/v1/auth/register/verify',
  login: '/api/v1/auth/login',
  loginVerify: '/api/v1/auth/login/verify',
  profile: '/api/v1/me',
  updateProfile: '/api/v1/me',
  refreshToken: '/api/v1/auth/refresh',
  logout: '/api/v1/auth/logout',

  // 2. Categories & Catalog
  categories: '/api/v1/categories',
  catalogCategories: '/api/v1/catalog/categories',
  categoryById: (id: number) => `/api/v1/catalog/category/${id}`,
  categoryProducts: (id: number) => `/api/v1/categories/${id}/products`,

  // 3. Products
  products: '/api/v1/products',
  catalogProducts: '/api/catalog/products',
  productById: (id: number) => `/api/catalog/product/${id}`,
  search: (q: string) => `/api/v1/products/search?q=${encodeURIComponent(q)}`,


  // 4. Cart
  cart: '/api/v1/cart',
  addToCart: '/api/v1/cart/add',
  updateCart: '/api/v1/cart/update',
  removeCartItem: (productId: number) => `/api/v1/cart/remove/${productId}`,
  clearCart: '/api/v1/cart/clear',

  // 5. Checkout & Orders
  checkoutSummary: '/api/v1/checkout/summary',
  checkout: '/api/v1/checkout',
  paymentMethods: '/api/v1/payment-methods',
  orders: '/api/v1/orders',
  orderById: (id: number) => `/api/v1/orders/${id}`,
  cancelOrder: (id: number) => `/api/v1/orders/${id}/cancel`,
  receiveOrder: (id: number) => `/api/v1/orders/${id}/receive`,
  applyCoupon: '/api/v1/orders/apply-coupon',
  removeCoupon: '/api/v1/orders/remove-coupon',
  initiatePayment: '/api/v1/payments/myfatoorah/initiate',
  verifyPayment: '/api/v1/payments/myfatoorah/verify',
  switchPaymentMethod: (orderId: number) => `/api/v1/orders/${orderId}/switch-payment-method`,

  // 6. Loyalty
  loyaltySummary: '/api/v1/loyalty/summary',
  loyaltyTransactions: '/api/v1/loyalty/transactions',
  redeemPoints: '/api/v1/loyalty/redeem',

  // 7. Home & Highlights
  home: '/api/v1/home',
  highlights: '/api/v1/highlights',
  highlightById: (id: number) => `/api/v1/highlights/${id}`,
  banners: '/api/v1/banners',

  // 8. Addresses
  addresses: '/api/v1/addresses',
  addressById: (id: number) => `/api/v1/addresses/${id}`,
  setDefaultAddress: (id: number) => `/api/v1/addresses/${id}/set-default`,
};