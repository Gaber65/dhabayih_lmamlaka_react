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

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  activeStoryIndex: null,
  activeStoryUser: null,

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
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