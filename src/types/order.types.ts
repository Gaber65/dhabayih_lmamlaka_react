import { ProductOption } from './product.types';

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  paymentType: string;
  provider: string;
  isInstallment: boolean;
  maxInstallments: number;
  description: string;
  icon?: string;
}

export interface OrderLine {
  id: number;
  productId: number;
  name: string;
  priceUnit: number;
  quantity: number;
  discount: number;
  priceSubtotal: number;
  discountAmount: number;
  cuttingOption?: ProductOption | null;
  packaging?: ProductOption | null;
  excludedParts?: ProductOption[];
}

export interface OrderTimeline {
  id: number;
  statusFrom: string;
  statusTo: string;
  description: string;
  timestamp: string;
}

export interface OrderDetail {
  id: number;
  name: string;
  date: string;
  state: 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out' | 'delivered' | 'cancelled' | 'refunded' | string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  pointsRedeemed: number;
  loyaltyDiscountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod?: string;
  notes?: string;
  lines: OrderLine[];
  timeline: OrderTimeline[];
}

export interface OrderListItem {
  id: number;
  name: string;
  date: string;
  state: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  firstItemName?: string;
}

export interface CheckoutPayload {
  deliveryType: 'delivery' | 'pickup' | 'address';
  addressId?: number;
  branchId?: number;

  paymentMethodId: number;
  notes?: string;
  couponCode?: string;
  redeemPoints?: boolean;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
}

export interface CheckoutResult {
  orderId: number;
  orderNumber: string;
  state: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  pointsRedeemed: number;
  loyaltyDiscountAmount: number;
  total: number;
  paymentUrl?: string;
  publishableKey?: string;
  amountMinorUnits?: number;
}