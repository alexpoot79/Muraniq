"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelection } from "./store";

/**
 * Header entry to the Private Selection. Shown only once something is saved,
 * so the header never carries an empty control.
 */
export function SelectionLink({ className = "" }: { className?: string }) {
  const ids = useSelection();
  const pathname = usePathname();
  if (ids.length === 0) return null;
  const here = pathname === "/selection/";
  return (
    <Link href="/selection/" aria-current={here ? "page" : undefined} className={className}>
      Selection <span className="numeral ml-1 text-base tracking-normal text-accent">{ids.length}</span>
      <span className="sr-only">{ids.length === 1 ? " work saved" : " works saved"}</span>
    </Link>
  );
}
