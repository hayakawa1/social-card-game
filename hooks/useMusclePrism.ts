"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Player Profile Hook
export function usePlayerProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/player/profile",
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    player: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Cards Collection Hook
export function useCardsCollection() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/cards/collection",
    fetcher
  );

  return {
    cards: data?.cards || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Card Masters Hook
export function useCardMasters() {
  const { data, error, isLoading } = useSWR("/api/cards/master", fetcher);

  return {
    cardMasters: data?.cards || [],
    isLoading,
    isError: error,
  };
}

// Gacha Banners Hook
export function useGachaBanners() {
  const { data, error, isLoading } = useSWR("/api/gacha/banners", fetcher);

  return {
    banners: data?.banners || [],
    isLoading,
    isError: error,
  };
}

// Perform Gacha Pull
export async function performGachaPull(
  bannerId: string,
  pullType: "single" | "multi",
  currency: "gold" | "gems"
) {
  const response = await fetch("/api/gacha/pull", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bannerId,
      pullType,
      currency,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Gacha pull failed");
  }

  return response.json();
}

// Daily Login Hook
export function useDailyLogin() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/player/daily-login",
    fetcher
  );

  return {
    loginData: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Claim Daily Login
export async function claimDailyLogin() {
  const response = await fetch("/api/player/daily-login/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to claim daily login");
  }

  return response.json();
}

// Training (Card Enhancement)
export async function trainCharacter(
  targetCardId: string,
  materialCardIds: string[],
  gold: number
) {
  const response = await fetch("/api/cards/enhance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetCardId,
      materialCardIds,
      gold,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Training failed");
  }

  return response.json();
}

// Quests Hook
export function useQuests() {
  const { data, error, isLoading } = useSWR("/api/quests", fetcher);

  return {
    quests: data?.quests || [],
    isLoading,
    isError: error,
  };
}

// Start Quest
export async function startQuest(questId: string) {
  const response = await fetch(`/api/quests/${questId}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to start quest");
  }

  return response.json();
}
