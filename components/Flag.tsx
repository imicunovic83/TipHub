// Renders a country flag using the lipis/flag-icons SVG set served via
// jsDelivr. SVG is preferred over flagcdn.com PNGs because some headless
// Chrome environments block cross-origin PNGs via ORB; SVG with proper
// content-type is unaffected. Accepts ISO 3166-1 alpha-2 codes plus the
// "gb-eng" / "gb-sct" subdivisions used for England and Scotland.

type FlagProps = {
  code: string;
  alt: string;
  width?: number;
};

export default function Flag({ code, alt, width = 24 }: FlagProps) {
  const lower = code.toLowerCase();
  const height = Math.round(width * 0.75);
  const src = `https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/flags/4x3/${lower}.svg`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      title={alt}
      className="flag-img"
      loading="lazy"
    />
  );
}
