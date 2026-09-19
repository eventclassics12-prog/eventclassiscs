import Link from "next/link";
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

      {/* CTA pill — fixed outside the header band (same reasoning as the
       * homepage: keeps its z-index out of any transformed ancestor and
       * difference-blends as one group). */}
      <a className="svc-head__cta" href="#final-cta">
        <span className="svc-head__cta-label">Let&apos;s close the gap</span>
        <span className="svc-head__cta-arrow" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </span>
      </a>
    </>
  );
}

export default ServicesHeader;
