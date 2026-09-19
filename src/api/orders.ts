import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import {
  CheckoutPayload,
  CheckoutResult,
  OrderDetail,
  OrderListItem,
  PaymentMethod,
} from '../types/order.types';

export const ordersApi = {
  getCheckoutSummary: async () => {
    const response = await apiClient.get(ServerStrings.checkoutSummary);
    return response.data?.data || response.data;
  },

  checkout: async (payload: CheckoutPayload): Promise<CheckoutResult> => {
    const body = {
      delivery_type: payload.deliveryType,
      payment_method_id: payload.paymentMethodId,
      ...(payload.addressId ? { address_id: payload.addressId } : {}),
      ...(payload.branchId ? { branch_id: payload.branchId } : {}),
      ...(payload.notes ? { notes: payload.notes } : {}),
      ...(payload.couponCode ? { coupon_code: payload.couponCode } : {}),
      ...(payload.redeemPoints !== undefined ? { redeem_points: payload.redeemPoints } : {}),
      ...(payload.deliveryDate ? { delivery_date: payload.deliveryDate } : {}),
      ...(payload.deliveryTimeSlot ? { delivery_time_slot: payload.deliveryTimeSlot } : {}),
    };
    const response = await apiClient.post(ServerStrings.checkout, body);
    const data = response.data?.data || response.data;
    return {
      orderId: Number(data.order_id || data.id || 0),
      orderNumber: data.order_number || String(data.order_id || ''),
      state: data.state || 'pending',
      paymentStatus: data.payment_status || 'unpaid',
      subtotal: Number(data.subtotal || 0),
      discountAmount: Number(data.discount_amount || 0),
      pointsRedeemed: Number(data.points_redeemed || 0),
      loyaltyDiscountAmount: Number(data.loyalty_discount_amount || 0),
      total: Number(data.total || 0),
      paymentUrl: data.payment_url,
      publishableKey: data.publishable_key,
      amountMinorUnits: data.amount_minor_units,
    };
  },

  getOrders: async (state?: string): Promise<OrderListItem[]> => {
    const response = await apiClient.get(ServerStrings.orders, {
      params: state ? { state } : undefined,
    });
    const data = response.data?.data || response.data;
    const list = Array.isArray(data) ? data : [];
    return list.map((item: any) => ({
      id: Number(item.id || 0),
      name: item.name || `Order #${item.id}`,
      date: item.date || '',
      state: item.state || 'pending',
      paymentStatus: item.payment_status || 'unpaid',
      total: Number(item.total || 0),
      itemCount: Number(item.item_count || item.lines_count || 1),
      firstItemName: item.first_item_name,
    }));
  },

  getOrderDetail: async (orderId: number): Promise<OrderDetail> => {
    const response = await apiClient.get(ServerStrings.orderById(orderId));
    const data = response.data?.data || response.data;
    return {
      id: Number(data.id || orderId),
      name: data.name || `Order #${orderId}`,
      date: data.date || '',
      state: data.state || 'pending',
      paymentStatus: data.payment_status || 'unpaid',
      subtotal: Number(data.subtotal || 0),
      discountAmount: Number(data.discount_amount || 0),
      couponCode: data.coupon_code,
      pointsRedeemed: Number(data.points_redeemed || 0),
      loyaltyDiscountAmount: Number(data.loyalty_discount_amount || 0),
      taxAmount: Number(data.tax_amount || 0),
      total: Number(data.total || 0),
      paymentMethod: data.payment_method,
      notes: data.notes,
      lines: (data.lines || []).map((l: any) => ({
        id: Number(l.id || 0),
        productId: Number(l.product_id || 0),
        name: l.name || '',
        priceUnit: Number(l.price_unit || 0),
        quantity: Number(l.quantity || 1),
        discount: Number(l.discount || 0),
        priceSubtotal: Number(l.price_subtotal || 0),
        discountAmount: Number(l.discount_amount || 0),
        cuttingOption: l.cutting_option ? { id: l.cutting_option.id, name: l.cutting_option.name } : null,
        packaging: l.packaging ? { id: l.packaging.id, name: l.packaging.name } : null,
        excludedParts: Array.isArray(l.excluded_parts) ? l.excluded_parts : [],
      })),
      timeline: (data.timeline || []).map((t: any) => ({
        id: Number(t.id || 0),
        statusFrom: t.status_from || '',
        statusTo: t.status_to || '',
        description: t.description || '',
        timestamp: t.timestamp || '',
      })),
    };
  },

  cancelOrder: async (orderId: number): Promise<void> => {
    await apiClient.post(ServerStrings.cancelOrder(orderId));
  },

  receiveOrder: async (orderId: number): Promise<void> => {
    await apiClient.post(ServerStrings.receiveOrder(orderId));
  },

  applyCoupon: async (code: string, orderId?: number): Promise<string> => {
    const response = await apiClient.post(ServerStrings.applyCoupon, {
      code,
      ...(orderId ? { order_id: orderId } : {}),
    });
    return response.data?.message || 'Coupon applied';
  },

  removeCoupon: async (orderId?: number): Promise<string> => {
    const response = await apiClient.post(ServerStrings.removeCoupon, {
      ...(orderId ? { order_id: orderId } : {}),
    });
    return response.data?.message || 'Coupon removed';
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get(ServerStrings.paymentMethods);
    const data = response.data?.data || response.data;
    const list = Array.isArray(data) ? data : [];
    return list.map((p: any) => ({
      id: Number(p.id || 0),
      name: p.name || '',
      code: p.code || '',
      paymentType: p.payment_type || 'online',
      provider: p.provider || '',
      isInstallment: Boolean(p.is_installment),
      maxInstallments: Number(p.max_installments || 0),
      description: p.description || '',
    }));
  },

  initiatePayment: async (orderId: number, callbackUrl?: string, errorUrl?: string, paymentMethodCode: string = 'myfatoorah'): Promise<{ paymentUrl: string; invoiceId: string }> => {
    const response = await apiClient.post(ServerStrings.initiatePayment, {
      order_id: orderId,
      callback_url: callbackUrl,
      error_url: errorUrl,
      payment_method_code: paymentMethodCode,
    });
    const data = response.data?.data || response.data;
    return {
      paymentUrl: data.payment_url || '',
      invoiceId: data.invoice_id || '',
    };
  },

  verifyPayment: async (orderId?: number, paymentId?: string): Promise<CheckoutResult & { success?: boolean; message?: string }> => {
    const response = await apiClient.post(ServerStrings.verifyPayment, {
      order_id: orderId,
      payment_id: paymentId,
    });
    const data = response.data?.data || response.data;
    return {
      orderId: Number(data.order_id || orderId || 0),
      orderNumber: data.order_number || '',
      state: data.state || (data.success ? 'confirmed' : 'pending'),
      paymentStatus: data.payment_status || (data.success ? 'paid' : 'failed'),
      subtotal: Number(data.subtotal || 0),
      discountAmount: Number(data.discount_amount || 0),
      pointsRedeemed: Number(data.points_redeemed || 0),
      loyaltyDiscountAmount: Number(data.loyalty_discount_amount || 0),
      total: Number(data.total || 0),
      success: data.success,
      message: data.message,
    };
  },
};