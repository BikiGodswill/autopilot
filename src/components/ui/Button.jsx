import Link from "next/link";

const VARIANTS = {
  primary:
    "bg-ink text-white hover:bg-ink-soft shadow-card hover:shadow-card-hover",
  accent:
    "bg-signal-teal text-ink hover:brightness-95 shadow-card hover:shadow-card-hover",
  outline:
    "border border-ash-300 text-ink hover:border-ink hover:bg-ash-50",
  ghost: "text-ink hover:bg-ash-100",
};

const SIZES = {
  sm: "text-sm px-3.5 py-2 rounded-lg",
  md: "text-sm px-5 py-2.5 rounded-lg",
  lg: "text-base px-6 py-3.5 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  type = "button",
  className = "",
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
