export function Badge({
  variant,
  children,
}: {
  variant?: "default" | "pitch" | "gold" | "rose" | "solid";
  children: React.ReactNode;
}) {
  const className =
    variant === "pitch" ? "badge badge--pitch"
    : variant === "gold" ? "badge badge--gold"
    : variant === "rose" ? "badge badge--rose"
    : variant === "solid" ? "badge badge--solid"
    : "badge";

  return <span className={className}>{children}</span>;
}
