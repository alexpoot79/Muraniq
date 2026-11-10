import Link from "next/link";

/** Uppercase text link with a drawn arrow that extends on hover. */
export function ArrowLink({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span>{children}</span>
      <span aria-hidden="true" className="arrow" />
    </>
  );
  return external ? (
    <a href={href} className={`link-arrow ${className}`} rel="noopener">
      {inner}
    </a>
  ) : (
    <Link href={href} className={`link-arrow ${className}`}>
      {inner}
    </Link>
  );
}
