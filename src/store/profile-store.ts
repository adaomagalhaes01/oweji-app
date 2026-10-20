import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AccountType = 'customer' | 'merchant';
export type DeliveryAddress = { id: string; label: string; fullName: string; phone: string; province: string; municipality: string; address: string; reference: string; isDefault: boolean };

type Profile = {
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  storeName: string;
  avatarUri: string | null;
  addresses: DeliveryAddress[];
  isSignedIn: boolean;
  hasHydrated: boolean;
};

type ProfileState = Profile & {
  updateProfile: (profile: Partial<Profile>) => void;
  saveAddress: (address: Omit<DeliveryAddress, 'id'> & { id?: string }) => void;
  removeAddress: (id: string) => void;
  setSignedIn: (signedIn: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: 'Adão Manuel',
      email: 'adao@email.com',
      phone: '',
      accountType: 'customer',
      storeName: '',
      avatarUri: null,
      addresses: [],
      isSignedIn: true,
      hasHydrated: false,
      updateProfile: (profile) => set(profile),
      saveAddress: (address) => set((state) => {
        const id = address.id ?? `ADDR-${Date.now().toString(36)}`;
        const next = state.addresses.filter((item) => item.id !== id).map((item) => ({ ...item, isDefault: address.isDefault ? false : item.isDefault }));
        const saved = { ...address, id };
        next.push(saved);
        if (!next.some((item) => item.isDefault) && next.length) next[0].isDefault = true;
        return { addresses: next };
      }),
      removeAddress: (id) => set((state) => {
        const addresses = state.addresses.filter((address) => address.id !== id);
        if (!addresses.some((address) => address.isDefault) && addresses.length) addresses[0].isDefault = true;
        return { addresses };
      }),
      setSignedIn: (isSignedIn) => set({ isSignedIn }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'oweji-profile',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persisted) => ({ ...(persisted as Profile), avatarUri: null, addresses: [], isSignedIn: true }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
