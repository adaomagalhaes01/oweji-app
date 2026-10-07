import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AccountType = 'customer' | 'merchant';

type Profile = {
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  storeName: string;
};

type ProfileState = Profile & { updateProfile: (profile: Partial<Profile>) => void };

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: 'Adão Manuel',
      email: 'adao@email.com',
      phone: '',
      accountType: 'customer',
      storeName: '',
      updateProfile: (profile) => set(profile),
    }),
    { name: 'oweji-profile', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
