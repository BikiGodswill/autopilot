export default function Card({ children, className = "", hover = false, as: Tag = "div" }) {
  return (
    <Tag
      className={`rounded-2xl border border-ash-200 bg-white shadow-card ${
        hover ? "transition-shadow duration-200 hover:shadow-card-hover" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
