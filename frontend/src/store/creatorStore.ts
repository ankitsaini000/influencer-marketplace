import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rating: number;
  reviews: number;
  category: string;
  level: string;
  description: string;
  startingPrice: string;
  isLiked?: boolean;
  location: string;
  // ... other creator properties
}

interface CreatorStore {
  likedCreators: Creator[];
  toggleLike: (creator: Creator) => void;
  removeLike: (creatorId: string) => void;
}

export const useCreatorStore = create<CreatorStore>()(
  persist(
    (set) => ({
      likedCreators: [],
      toggleLike: (creator) =>
        set((state) => {
          const isLiked = state.likedCreators.some((c) => c.id === creator.id);
          return {
            likedCreators: isLiked
              ? state.likedCreators.filter((c) => c.id !== creator.id)
              : [...state.likedCreators, { ...creator, isLiked: true }],
          };
        }),
      removeLike: (creatorId) =>
        set((state) => ({
          likedCreators: state.likedCreators.filter((c) => c.id !== creatorId),
        })),
    }),
    {
      name: "creator-storage",
    }
  )
);
