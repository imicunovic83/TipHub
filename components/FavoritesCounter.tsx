"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/useFavorites";

export default function FavoritesCounter() {
  const { count, hydrated } = useFavorites();
  if (!hydrated || count === 0) {
    return (
      <Link href="/tips?favorites=1" className="favorites-counter favorites-counter--empty" aria-label="View saved tips">
        ♡
      </Link>
    );
  }
  return (
    <Link href="/tips?favorites=1" className="favorites-counter" aria-label={`${count} saved tips`}>
      ♥ <span className="favorites-counter-num">{count}</span>
    </Link>
  );
}
