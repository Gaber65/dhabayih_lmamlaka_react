import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, AddToCartPayload, CartLine } from '../types/cart.types';
import { cartApi } from '../api/cart';
import { catalogApi } from '../api/catalog';
import { ordersApi } from '../api/orders';

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  couponCode: string | null;
  discountAmount: number;
  selectedDeliveryDate: string;
  selectedDeliverySlot: string;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setDeliverySlot: (date: string, slot: string) => void;
}

const calculateCartTotals = (lines: CartLine[], discountAmount: number): { subtotal: number; total: number; itemCount: number } => {
  const subtotal = lines.reduce((s, l) => s + (l.lineTotal || (l.priceUnit * l.quantity) || 0), 0);
  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = lines.reduce((s, l) => s + (l.quantity || 0), 0);
  return { subtotal, total, itemCount };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {
        id: 0,
        status: 'active',
        lines: [],
        subtotal: 0,
        discountAmount: 0,
        deliveryFee: 0,
        total: 0,
        itemCount: 0,
      },
      isLoading: false,
      isCartDrawerOpen: false,
      couponCode: null,
      discountAmount: 0,
      selectedDeliveryDate: new Date().toISOString().split('T')[0],
      selectedDeliverySlot: 'صباحي (9:00 ص - 1:00 م)',

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),

      fetchCart: async () => {
        const token = localStorage.getItem('dhabayih_access_token');
        if (!token) {
          // Guest mode: compute totals from local cart
          const currentCart = get().cart || { id: 0, status: 'active', lines: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 };
          const { subtotal, total, itemCount } = calculateCartTotals(currentCart.lines || [], get().discountAmount);
          set({
            cart: { ...currentCart, subtotal, total, itemCount, discountAmount: get().discountAmount },
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true });
        try {
          const backendCart = await cartApi.getCart();
          const { subtotal, total, itemCount } = calculateCartTotals(backendCart.lines || [], get().discountAmount);
          set({
            cart: {
              ...backendCart,
              subtotal,
              discountAmount: get().discountAmount,
              deliveryFee: 0,
              total,
              itemCount,
            },
            isLoading: false,
          });
        } catch {
          // Fallback to local cart
          const currentCart = get().cart || { id: 0, status: 'active', lines: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 };
          const { subtotal, total, itemCount } = calculateCartTotals(currentCart.lines || [], get().discountAmount);
          set({
            cart: { ...currentCart, subtotal, total, itemCount, discountAmount: get().discountAmount },
            isLoading: false,
          });
        }
      },

      addToCart: async (payload: AddToCartPayload) => {
        set({ isLoading: true });
        const token = localStorage.getItem('dhabayih_access_token');

        // If authenticated, try backend first
        if (token) {
          try {
            const backendCart = await cartApi.addToCart(payload);
            const { subtotal, total, itemCount } = calculateCartTotals(backendCart.lines || [], get().discountAmount);
            set({
              cart: {
                ...backendCart,
                subtotal,
                discountAmount: get().discountAmount,
                deliveryFee: 0,
                total,
                itemCount,
              },
              isLoading: false,
              isCartDrawerOpen: true,
            });
            return;
          } catch {
            // Fall through to local cart addition
          }
        }

        // Guest Mode / Local Cart handling
        try {
          let productData: any = null;
          try {
            productData = await catalogApi.getProductById(payload.productId);
          } catch {}

          const currentCart = get().cart || { id: 0, status: 'active', lines: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 };
          const currentLines = [...(currentCart.lines || [])];

          const cuttingOpt = productData?.cuttingOptions?.find((c: any) => c.id === payload.cuttingOptionId);
          const pkgOpts = productData?.packagingOptions?.filter((p: any) => payload.packagingIds?.includes(p.id)) || [];
          const excOpts = productData?.excludedParts?.filter((e: any) => payload.excludedPartIds?.includes(e.id)) || [];

          const existingIndex = currentLines.findIndex(
            (l) => l.productId === payload.productId && l.cuttingOption?.id === payload.cuttingOptionId
          );

          const unitPrice = productData?.price || 0;
          const qty = payload.quantity || 1;

          if (existingIndex >= 0) {
            const line = currentLines[existingIndex];
            const newQty = line.quantity + qty;
            currentLines[existingIndex] = {
              ...line,
              quantity: newQty,
              lineTotal: unitPrice * newQty,
              notes: payload.notes || line.notes,
            };
          } else {
            const newLine: CartLine = {
              id: Date.now(),
              productId: payload.productId,
              productName: productData?.name || 'ذبيحة طازجة',
              productNameAr: productData?.nameAr || productData?.name || 'ذبيحة طازجة',
              productNameEn: productData?.nameEn || productData?.name || 'Fresh Sacrifice',
              productImageUrl: productData?.imageUrl || '',
              product: productData,
              weightLabel: payload.weightLabel || productData?.weight || '',
              quantity: qty,
              priceUnit: unitPrice,
              discountPercent: 0,
              lineTotal: unitPrice * qty,
              cuttingOption: cuttingOpt || null,
              cuttingOptionName: cuttingOpt?.nameAr || cuttingOpt?.name || '',
              packagingOptions: pkgOpts,
              packagingNames: pkgOpts.map((p: any) => p.nameAr || p.name),
              excludedParts: excOpts,
              excludedNames: excOpts.map((e: any) => e.nameAr || e.name),
              notes: payload.notes || '',
            };
            currentLines.push(newLine);
          }

          const { subtotal, total, itemCount } = calculateCartTotals(currentLines, get().discountAmount);

          set({
            cart: {
              id: currentCart.id || Date.now(),
              status: 'active',
              lines: currentLines,
              subtotal,
              discountAmount: get().discountAmount,
              deliveryFee: 0,
              total,
              itemCount,
            },
            isLoading: false,
            isCartDrawerOpen: true,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      updateQuantity: async (productId: number, quantity: number) => {
        if (quantity <= 0) {
          await get().removeFromCart(productId);
          return;
        }

        set({ isLoading: true });
        const token = localStorage.getItem('dhabayih_access_token');

        if (token) {
          try {
            const backendCart = await cartApi.updateCartItem({ productId, quantity });
            const { subtotal, total, itemCount } = calculateCartTotals(backendCart.lines || [], get().discountAmount);
            set({
              cart: {
                ...backendCart,
                subtotal,
                discountAmount: get().discountAmount,
                deliveryFee: 0,
                total,
                itemCount,
              },
              isLoading: false,
            });
            return;
          } catch {}
        }

        // Local Guest update
        const currentCart = get().cart || { id: 0, status: 'active', lines: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 };
        const currentLines = (currentCart.lines || []).map((line) => {
          if (line.productId === productId) {
            return {
              ...line,
              quantity,
              lineTotal: line.priceUnit * quantity,
            };
          }
          return line;
        });

        const { subtotal, total, itemCount } = calculateCartTotals(currentLines, get().discountAmount);
        set({
          cart: {
            ...currentCart,
            lines: currentLines,
            subtotal,
            discountAmount: get().discountAmount,
            total,
            itemCount,
          },
          isLoading: false,
        });
      },

      removeFromCart: async (productId: number) => {
        set({ isLoading: true });
        const token = localStorage.getItem('dhabayih_access_token');

        if (token) {
          try {
            const backendCart = await cartApi.removeFromCart(productId);
            const { subtotal, total, itemCount } = calculateCartTotals(backendCart.lines || [], get().discountAmount);
            set({
              cart: {
                ...backendCart,
                subtotal,
                discountAmount: get().discountAmount,
                deliveryFee: 0,
                total,
                itemCount,
              },
              isLoading: false,
            });
            return;
          } catch {}
        }

        // Local Guest remove
        const currentCart = get().cart || { id: 0, status: 'active', lines: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 };
        const currentLines = (currentCart.lines || []).filter((l) => l.productId !== productId);
        const { subtotal, total, itemCount } = calculateCartTotals(currentLines, get().discountAmount);

        set({
          cart: {
            ...currentCart,
            lines: currentLines,
            subtotal,
            discountAmount: get().discountAmount,
            total,
            itemCount,
          },
          isLoading: false,
        });
      },

      clearCart: async () => {
        set({
          cart: {
            id: 0,
            status: 'empty',
            lines: [],
            subtotal: 0,
            discountAmount: 0,
            deliveryFee: 0,
            total: 0,
            itemCount: 0,
          },
          couponCode: null,
          discountAmount: 0,
          isLoading: false,
        });

        const token = localStorage.getItem('dhabayih_access_token');
        if (token) {
          try {
            await cartApi.clearCart();
          } catch {}
        }
      },

      applyCoupon: async (code: string) => {
        const upper = code.trim().toUpperCase();
        try {
          await ordersApi.applyCoupon(upper);
          const { cart } = get();
          const subtotal = cart?.subtotal || cart?.lines?.reduce((s, l) => s + l.lineTotal, 0) || 0;
          const discount = Math.round(subtotal * 0.1);
          const total = Math.max(0, subtotal - discount);

          set({
            couponCode: upper,
            discountAmount: discount,
            cart: cart ? { ...cart, discountAmount: discount, total } : null,
          });

          return {
            success: true,
            message: `تم تطبيق كود الخصم (${upper}) بنجاح!`,
          };
        } catch (err: any) {
          return {
            success: false,
            message: err.response?.data?.message || 'كوبون الخصم غير صالح أو منتهي الصلاحية',
          };
        }
      },

      removeCoupon: () => {
        const { cart } = get();
        const subtotal = cart?.subtotal || cart?.lines?.reduce((s, l) => s + l.lineTotal, 0) || 0;
        set({
          couponCode: null,
          discountAmount: 0,
          cart: cart ? { ...cart, discountAmount: 0, total: subtotal } : null,
        });
      },

      setDeliverySlot: (date: string, slot: string) => {
        set({ selectedDeliveryDate: date, selectedDeliverySlot: slot });
      },
    }),
    {
      name: 'dhabayih_cart_storage',
      partialize: (state) => ({
        cart: state.cart,
        couponCode: state.couponCode,
        discountAmount: state.discountAmount,
        selectedDeliveryDate: state.selectedDeliveryDate,
        selectedDeliverySlot: state.selectedDeliverySlot,
      }),
    }
  )
);