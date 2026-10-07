import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

type NotificationState = {
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        { id: 'welcome', title: 'Bem-vinda ao OWEJI', message: 'Explore a coleção e guarde as suas peças favoritas.', time: 'Hoje', read: false },
        { id: 'collection', title: 'Novidades na coleção', message: 'Descubra os novos looks escolhidos para esta estação.', time: 'Hoje', read: false },
      ],
      markRead: (id) => set((state) => ({ notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item) })),
      markAllRead: () => set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })) })),
    }),
    { name: 'oweji-notifications', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
