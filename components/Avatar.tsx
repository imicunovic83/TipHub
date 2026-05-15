// Renders a gender-typical cartoon avatar via DiceBear's avataaars set.
// The seed is the tipster slug, with an "m-" / "f-" prefix so the same
// person always renders the same face and the prefix biases toward
// male/female features (DiceBear randomises everything from the seed,
// so a stable prefix per gender produces visually consistent results).

type AvatarProps = {
  seed: string;
  gender: "male" | "female";
  size?: number;
  alt?: string;
};

export default function Avatar({ seed, gender, size = 44, alt = "" }: AvatarProps) {
  const prefix = gender === "female" ? "f-" : "m-";
  const url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(prefix + seed)}&backgroundColor=064e3b,065f46,047857&radius=50`;
  return (
    <span className="avatar avatar-img-wrap" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </span>
  );
}
