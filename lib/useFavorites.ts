"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tiphub:favorites";
const SYNC_EVENT = "tiphub-favorites-changed";

function readFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeToStorage(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // localStorage can throw in private/quota-exceeded modes — silently noop.
  }
}

// Subscribes to localStorage changes (both same-tab via custom event and
// cross-tab via the native storage event) so every component sharing this
// hook stays in sync.
export function useFavorites(): {
  favorites: Set<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
  hydrated: boolean;
} {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readFromStorage());
    setHydrated(true);

    const onChange = () => setFavorites(readFromStorage());
    window.addEventListener(SYNC_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(SYNC_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      writeToStorage(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, isFavorite, toggle, count: favorites.size, hydrated };
}
