import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { Cart, AddToCartPayload } from '../types/cart.types';

const mapCart = (data: any): Cart => {
  const cartData = data?.cart || data?.data?.cart || data?.data || data || {};
  const rawLines = Array.isArray(cartData.lines) ? cartData.lines : [];

  return {
    id: Number(cartData.id || 0),
    status: cartData.status || 'active',
    lines: rawLines.map((l: any) => ({
      id: Number(l.id || 0),
      productId: Number(l.product_id || 0),
      productName: l.product_name || '',
      productImageUrl: l.product_image_url || '',
      product: {
        id: Number(l.product_id || 0),
        name: l.product_name || '',
        nameAr: l.product_name || '',
        imageUrl: l.product_image_url || '',
      },
      weightLabel: l.weight_label || '',
      quantity: Number(l.quantity || 1),
      priceUnit: Number(l.price_unit || 0),
      discountPercent: Number(l.discount_percent || 0),
      lineTotal: Number(l.line_total || 0),
      cuttingOption: l.cutting_option ? { id: l.cutting_option.id, name: l.cutting_option.name } : null,
      cuttingOptionName: l.cutting_option?.name || '',
      packagingOptions: Array.isArray(l.packaging_options) ? l.packaging_options : [],
      packagingNames: Array.isArray(l.packaging_options) ? l.packaging_options.map((p: any) => p.name) : [],
      excludedParts: Array.isArray(l.excluded_parts) ? l.excluded_parts : [],
      notes: l.notes || '',
    })),
    subtotal: Number(cartData.subtotal || 0),
    deliveryFee: Number(cartData.delivery_fee || 0),
    total: Number(cartData.grand_total || cartData.total || 0),
    itemCount: rawLines.length,
  };
};

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get(ServerStrings.cart);
    return mapCart(response.data);
  },

  addToCart: async (payload: AddToCartPayload): Promise<Cart> => {
    const body = {
      product_id: payload.productId,
      quantity: payload.quantity,
      ...(payload.cuttingOptionId ? { cutting_option_id: payload.cuttingOptionId } : {}),
      ...(payload.packagingIds && payload.packagingIds.length > 0 ? { packaging_ids: payload.packagingIds } : {}),
      ...(payload.excludedPartIds && payload.excludedPartIds.length > 0 ? { excluded_part_ids: payload.excludedPartIds } : {}),
      ...(payload.notes ? { notes: payload.notes } : {}),
    };
    const response = await apiClient.post(ServerStrings.addToCart, body);
    return mapCart(response.data);
  },

  updateCartItem: async (payload: AddToCartPayload): Promise<Cart> => {
    const body = {
      product_id: payload.productId,
      quantity: payload.quantity,
      ...(payload.cuttingOptionId ? { cutting_option_id: payload.cuttingOptionId } : {}),
      ...(payload.packagingIds ? { packaging_ids: payload.packagingIds } : {}),
      ...(payload.excludedPartIds ? { excluded_part_ids: payload.excludedPartIds } : {}),
      ...(payload.notes ? { notes: payload.notes } : {}),
    };
    const response = await apiClient.put(ServerStrings.updateCart, body);
    return mapCart(response.data);
  },

  removeFromCart: async (productId: number): Promise<Cart> => {
    const response = await apiClient.delete(ServerStrings.removeCartItem(productId));
    return mapCart(response.data);
  },

  clearCart: async (): Promise<Cart> => {
    try {
      const response = await apiClient.delete(ServerStrings.clearCart);
      return mapCart(response.data);
    } catch {
      return {
        id: 0,
        status: 'empty',
        lines: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        itemCount: 0,
      };
    }
  },
};