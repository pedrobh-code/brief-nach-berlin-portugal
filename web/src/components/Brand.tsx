import Link from "next/link";
export function Envelope({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 30"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="26"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m3 4 17 13L37 4M3 27l12-12m22 12L25 15"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
export default function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Carta à Assembleia — início">
      <Envelope />
      <span>
        Carta à<br />
        Assembleia<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
