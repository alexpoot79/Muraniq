import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { SelectionLink } from "@/features/selection/SelectionLink";
import { MobileMenu } from "./MobileMenu";
import { MENU_SECTIONS, NAV_LEFT, NAV_RIGHT } from "./nav";

const navLink =
  "label relative inline-flex min-h-11 items-center text-on-dark/80 transition-colors duration-300 hover:text-on-dark after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-center after:scale-x-0 after:bg-accent after:transition-transform after:duration-500 after:ease-[var(--ease-silk)] hover:after:scale-x-100";

/** Maison layout: navigation either side of the centred logo lockup. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line-dark/80 bg-stage/95 backdrop-blur-md supports-[backdrop-filter]:bg-stage/88">
      <div className="container-gallery grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-24">
        <div className="flex items-center">
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {NAV_LEFT.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} label={item.label} className={navLink} />
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:hidden">
            <MobileMenu sections={MENU_SECTIONS} />
          </div>
        </div>

        <Logo className="justify-self-center" height={52} imgClassName="h-11 w-auto lg:h-[3.25rem]" />

        <div className="flex items-center justify-end gap-10">
          <SelectionLink className={`${navLink} lg:hidden`} />
          <nav aria-label="Secondary" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              <li className="empty:hidden">
                <SelectionLink className={navLink} />
              </li>
              {NAV_RIGHT.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} label={item.label} className={navLink} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
