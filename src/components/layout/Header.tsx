import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { PRIMARY_NAV, MENU_SECTIONS } from "./nav";
import { SearchIcon } from "./SearchIcon";
import { routes } from "@/lib/routes";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line-dark/70 bg-stage/92 backdrop-blur supports-[backdrop-filter]:bg-stage/80">
      <div className="container-gallery flex h-16 items-center justify-between gap-6 lg:h-[88px]">
        <Logo />
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="label py-3 text-on-dark transition-colors hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`${routes.collection()}#search`}
                className="label inline-flex items-center gap-2 py-3 text-on-dark transition-colors hover:text-accent"
              >
                <SearchIcon />
                Search
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-1 lg:hidden">
          <Link
            href={`${routes.collection()}#search`}
            className="inline-flex h-11 w-11 items-center justify-center text-on-dark"
            aria-label="Search the collection"
          >
            <SearchIcon />
          </Link>
          <MobileMenu sections={MENU_SECTIONS} />
        </div>
      </div>
    </header>
  );
}
