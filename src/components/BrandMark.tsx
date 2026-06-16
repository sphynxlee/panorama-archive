type BrandMarkProps = {
  className?: string;
};

/** Panorama lens mark — shared geometry with public/favicon.svg */
export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    </svg>
  );
}
