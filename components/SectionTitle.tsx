type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="title-page">{title}</h2>
      {description ? (
        <p className="text-muted max-prose">{description}</p>
      ) : null}
    </div>
  );
}
