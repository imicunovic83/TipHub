"use client";

import { useFavorites } from "@/lib/useFavorites";

export default function FavoriteButton({ tipId }: { tipId: string }) {
  const { isFavorite, toggle, hydrated } = useFavorites();
  const active = hydrated && isFavorite(tipId);

  // Stop propagation so clicking the heart inside a Link doesn't navigate.
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(tipId);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "favorite-btn is-active" : "favorite-btn"}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      title={active ? "Saved" : "Save tip"}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}
