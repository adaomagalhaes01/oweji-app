import { create } from 'zustand';

type FeedbackState = {
  message: string;
  showToast: (message: string) => void;
  dismissToast: () => void;
};

export const useFeedbackStore = create<FeedbackState>((set) => ({
  message: '',
  showToast: (message) => set({ message }),
  dismissToast: () => set({ message: '' }),
}));
