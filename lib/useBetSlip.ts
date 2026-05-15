"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tiphub:betslip";
const SYNC_EVENT = "tiphub-betslip-changed";

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // localStorage write can fail — silently noop.
  }
}

export function useBetSlip(): {
  ids: string[];
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  count: number;
  hydrated: boolean;
} {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readFromStorage());
    setHydrated(true);

    const onChange = () => setIds(readFromStorage());
    window.addEventListener(SYNC_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(SYNC_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const add = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeToStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      writeToStorage(next);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeToStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    writeToStorage([]);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, has, add, remove, toggle, clear, count: ids.length, hydrated };
}
