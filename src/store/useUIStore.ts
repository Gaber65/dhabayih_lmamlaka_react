import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface UIStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  activeStoryIndex: number | null;
  activeStoryUser: any | null;
  openStory: (user: any, index?: number) => void;
  closeStory: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  toasts: [],
  activeStoryIndex: null,
  activeStoryUser: null,

  addToast: (toast) => {
    // Prevent duplicate toast spam with identical message
    const currentToasts = get().toasts;
    const isDuplicate = currentToasts.some(
      (t: ToastMessage) => t.message === toast.message && t.type === toast.type
    );
    if (isDuplicate) return;

    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  openStory: (user, index = 0) => {
    set({ activeStoryUser: user, activeStoryIndex: index });
  },

  closeStory: () => {
    set({ activeStoryUser: null, activeStoryIndex: null });
  },
}));