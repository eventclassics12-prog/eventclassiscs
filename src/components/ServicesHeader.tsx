import Link from "next/link";
import SterlingGateKineticNavigation from "./ui/sterling-gate-kinetic-navigation";
import "./ServicesHeader.css";

interface ServicesHeaderProps {
  /** Which nav entry gets `aria-current="page"`. */
  currentPage?: "about" | "services" | "work";
}

const NAV_LINKS: ReadonlyArray<{
  label: string;
  href: string;
  page?: "about" | "services" | "work";
}> = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about", page: "about" },
  { label: "What We Do", href: "/services", page: "services" },
  { label: "Our Work", href: "/work", page: "work" },
  { label: "FAQ", href: "/#faq" },
] as const;

export function ServicesHeader({ currentPage }: ServicesHeaderProps) {
  return (
    <>
      <header className="svc-head">
        {/* Left spacer — keeps the links optically centred in the
         * viewport, exactly like .m-hero__nav-brand on the homepage.
         * The wordmark overlays it from outside the flex flow below. */}
        <div className="svc-head__brand-spacer" aria-hidden="true" />

        <Link
          className="svc-head__brand"
          href="/"
          aria-label="Eventclassics — home"
        >
          eventclassics.in
        </Link>

        <nav className="svc-head__links-wrap" aria-label="Primary">
          <ul className="svc-head__links" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  {...(link.page && link.page === currentPage
                    ? { "aria-current": "page" }
                    : {})}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="svc-head__actions" aria-hidden="true" />
      </header>

      {/* Fullscreen menu — trigger fixed where the CTA pill used to sit
       * (same 2.75rem pill geometry, outside the band's blend group). */}
      <SterlingGateKineticNavigation />
    </>
  );
}

export default ServicesHeader;
