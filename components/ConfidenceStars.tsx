export default function ConfidenceStars({ value }: { value: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <span className="tip-confidence" aria-label={`Confidence ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= value ? "tip-confidence-star" : "tip-confidence-star is-empty"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}
