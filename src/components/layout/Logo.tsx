import Link from "next/link";

/** Typographic wordmark with monogram. Accessible name: "MURANIQ — Home". */
export function Logo() {
  return (
    <Link href="/" aria-label="MURANIQ — Home" className="group inline-flex items-center gap-2.5 py-2">
      <svg aria-hidden="true" width="30" height="30" viewBox="0 0 34 34" className="shrink-0">
        <rect x="0.5" y="0.5" width="33" height="33" fill="none" stroke="var(--color-accent)" />
        <path d="M8 25V9.5l9 10 9-10V25" fill="none" stroke="var(--color-accent)" strokeWidth="1.4" />
      </svg>
      <span className="font-display text-[1.125rem] font-semibold tracking-[0.2em] text-on-dark xs:text-[1.375rem] xs:tracking-[0.28em]">MURANIQ</span>
    </Link>
  );
}
