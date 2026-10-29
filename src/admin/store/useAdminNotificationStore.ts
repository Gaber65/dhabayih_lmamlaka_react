import { create } from 'zustand';
import { AdminOrder } from '../api/adminApi';

export interface AdminOrderNotification {
  id: number;
  orderId: number;
  orderName: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  paymentMethod?: string;
  date: string;
  isRead: boolean;
  timestamp: number;
}

interface AdminNotificationState {
  soundEnabled: boolean;
  toggleSound: () => void;
  unreadCount: number;
  notifications: AdminOrderNotification[];
  activePopup: AdminOrder | null;
  newOrderIds: number[];
  triggerNewOrder: (order: AdminOrder) => void;
  markAllAsRead: () => void;
  markAsRead: (orderId: number) => void;
  dismissPopup: () => void;
  clearNewBadge: (orderId: number) => void;
}

// Synthesized fallback chime using browser Web Audio API
export const playSynthesizedChime = () => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Note 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);

    // Note 3: D6 (1174.66 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1174.66, now + 0.22);
    gain3.gain.setValueAtTime(0, now + 0.22);
    gain3.gain.linearRampToValueAtTime(0.4, now + 0.27);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.22);
    osc3.stop(now + 1.1);
  } catch (err) {
    console.warn('Web Audio playback error:', err);
  }
};

// Play branded app notification audio file, with automatic fallback
export const playNewOrderChime = () => {
  try {
    const audio = new Audio('/sounds/notification_sound.mp3');
    audio.play().catch((err) => {
      console.warn('Audio element play failed, falling back to Web Audio API synthesized chime:', err);
      playSynthesizedChime();
    });
  } catch (err) {
    console.warn('Audio element init failed, falling back to Web Audio API:', err);
    playSynthesizedChime();
  }
};

let titleBlinkInterval: ReturnType<typeof setInterval> | null = null;
const originalTitle = document.title;

const flashTabTitle = (orderName: string) => {
  if (titleBlinkInterval) clearInterval(titleBlinkInterval);
  let isAlert = true;
  let blinks = 0;
  titleBlinkInterval = setInterval(() => {
    document.title = isAlert ? `🔔 طلب جديد! (${orderName})` : originalTitle;
    isAlert = !isAlert;
    blinks++;
    if (blinks >= 14) {
      if (titleBlinkInterval) clearInterval(titleBlinkInterval);
      titleBlinkInterval = null;
      document.title = originalTitle;
    }
  }, 1000);
};

export const useAdminNotificationStore = create<AdminNotificationState>((set, get) => {
  const initialSound = localStorage.getItem('admin_order_sound_enabled') !== 'false';

  return {
    soundEnabled: initialSound,
    unreadCount: 0,
    notifications: [],
    activePopup: null,
    newOrderIds: [],

    toggleSound: () => {
      const next = !get().soundEnabled;
      localStorage.setItem('admin_order_sound_enabled', String(next));
      set({ soundEnabled: next });
      if (next) {
        playNewOrderChime();
      }
    },

    triggerNewOrder: (order: AdminOrder) => {
      const { soundEnabled, notifications, unreadCount, newOrderIds } = get();

      // Play audio chime
      if (soundEnabled) {
        playNewOrderChime();
      }

      // Flash tab title
      flashTabTitle(order.name || `#${order.id}`);

      // Add to notifications
      const newNotif: AdminOrderNotification = {
        id: Date.now() + Math.random(),
        orderId: order.id,
        orderName: order.name || `Order #${order.id}`,
        customerName: order.customerName || 'عميل المتجر',
        customerPhone: order.customerPhone,
        total: Number(order.total || 0),
        paymentMethod: order.paymentMethod,
        date: order.date || new Date().toISOString(),
        isRead: false,
        timestamp: Date.now(),
      };

      set({
        activePopup: order,
        unreadCount: unreadCount + 1,
        notifications: [newNotif, ...notifications.slice(0, 49)],
        newOrderIds: Array.from(new Set([order.id, ...newOrderIds])),
      });
    },

    markAllAsRead: () => {
      const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
    },

    markAsRead: (orderId: number) => {
      const updated = get().notifications.map((n) =>
        n.orderId === orderId ? { ...n, isRead: true } : n
      );
      const remainingUnread = updated.filter((n) => !n.isRead).length;
      set({ notifications: updated, unreadCount: remainingUnread });
    },

    dismissPopup: () => {
      set({ activePopup: null });
    },

    clearNewBadge: (orderId: number) => {
      set((state) => ({
        newOrderIds: state.newOrderIds.filter((id) => id !== orderId),
      }));
    },
  };
});
