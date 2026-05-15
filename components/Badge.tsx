export function Badge({
  variant,
  children,
}: {
  variant?: "default" | "pitch" | "gold" | "rose" | "solid" | "blue" | "violet" | "orange";
  children: React.ReactNode;
}) {
  const className =
    variant === "pitch" ? "badge badge--pitch"
    : variant === "gold" ? "badge badge--gold"
    : variant === "rose" ? "badge badge--rose"
    : variant === "solid" ? "badge badge--solid"
    : variant === "blue" ? "badge badge--blue"
    : variant === "violet" ? "badge badge--violet"
    : variant === "orange" ? "badge badge--orange"
    : "badge";

  return <span className={className}>{children}</span>;
}
