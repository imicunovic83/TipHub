"use client";

import { useBetSlip } from "@/lib/useBetSlip";

export default function AddToSlipButton({ tipId }: { tipId: string }) {
  const { has, toggle, hydrated } = useBetSlip();
  const inSlip = hydrated && has(tipId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(tipId);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={inSlip ? "slip-add-btn is-in" : "slip-add-btn"}
      aria-pressed={inSlip}
      aria-label={inSlip ? "Remove from bet slip" : "Add to bet slip"}
    >
      {inSlip ? "✓ In slip" : "+ Slip"}
    </button>
  );
}
