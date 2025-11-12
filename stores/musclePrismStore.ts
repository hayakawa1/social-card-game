import { create } from "zustand";

interface Character {
  id: string;
  name: string;
  type: string;
  emoji: string;
  level: number;
  exp: number;
  attack: number;
  defense: number;
  imageUrl?: string;
}

interface MusclePrismStore {
  // Selected character
  selectedCharacter: Character | null;
  setSelectedCharacter: (character: Character | null) => void;

  // Training state
  isTraining: boolean;
  setIsTraining: (training: boolean) => void;

  // Gacha state
  isGachaOpen: boolean;
  setIsGachaOpen: (open: boolean) => void;
  gachaResults: any[];
  setGachaResults: (results: any[]) => void;

  // Energy
  energy: number;
  maxEnergy: number;
  setEnergy: (energy: number) => void;

  // Notifications
  notifications: Array<{ id: string; message: string; type: string }>;
  addNotification: (message: string, type: string) => void;
  removeNotification: (id: string) => void;
}

export const useMusclePrismStore = create<MusclePrismStore>((set) => ({
  // Initial state
  selectedCharacter: null,
  isTraining: false,
  isGachaOpen: false,
  gachaResults: [],
  energy: 10,
  maxEnergy: 10,
  notifications: [],

  // Actions
  setSelectedCharacter: (character) => set({ selectedCharacter: character }),
  setIsTraining: (training) => set({ isTraining: training }),
  setIsGachaOpen: (open) => set({ isGachaOpen: open }),
  setGachaResults: (results) => set({ gachaResults: results }),
  setEnergy: (energy) => set({ energy }),

  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), message, type },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
