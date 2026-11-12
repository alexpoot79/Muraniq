"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Header link that knows where the visitor is: the current section keeps its
 * gold underline and is announced as the current page or section.
 */
export function NavLink({ href, label, className }: { href: string; label: string; className: string }) {
  const pathname = usePathname() ?? "/";
  const exact = pathname === href;
  const within = !exact && href !== "/" && pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={exact ? "page" : within ? "true" : undefined}
      className={`${className} ${exact || within ? "text-on-dark after:scale-x-100" : ""}`}
    >
      {label}
    </Link>
  );
}
