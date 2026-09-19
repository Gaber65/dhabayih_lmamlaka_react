import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address } from '../types/address.types';
import { addressApi } from '../api/address';

interface AddressState {
  activeAddress: Address | null;
  addresses: Address[];
  isLoading: boolean;
  isLocationModalOpen: boolean;

  setActiveAddress: (address: Address) => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  fetchAddresses: () => Promise<Address[]>;
  addAddress: (payload: any) => Promise<Address>;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      activeAddress: null,
      addresses: [],
      isLoading: false,
      isLocationModalOpen: false,

      setActiveAddress: (address) => set({ activeAddress: address, isLocationModalOpen: false }),
      openLocationModal: () => set({ isLocationModalOpen: true }),
      closeLocationModal: () => set({ isLocationModalOpen: false }),

      fetchAddresses: async () => {
        set({ isLoading: true });
        try {
          const list = await addressApi.getAddresses();
          const defaultAddr = list.find((a) => a.isDefault) || list[0] || null;
          set((state) => ({
            addresses: list,
            activeAddress: state.activeAddress ? (list.find((a) => a.id === state.activeAddress?.id) || defaultAddr) : defaultAddr,
            isLoading: false,
          }));
          return list;
        } catch {
          set({ isLoading: false });
          return [];
        }
      },

      addAddress: async (payload) => {
        set({ isLoading: true });
        try {
          const created = await addressApi.createAddress(payload);
          await get().fetchAddresses();
          set({ activeAddress: created, isLocationModalOpen: false });
          return created;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'dhabayih_active_address_storage',
      partialize: (state) => ({
        activeAddress: state.activeAddress,
      }),
    }
  )
);
