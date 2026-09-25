import Link from "next/link";
import SterlingGateKineticNavigation from "./ui/sterling-gate-kinetic-navigation";
import type { SiteSettingsData } from "@/lib/cms";
import "./ServicesHeader.css";

type PageKey = "about" | "services" | "work" | "blog";

interface ServicesHeaderProps {
  /** Which nav entry gets `aria-current="page"`. */
  currentPage?: PageKey;
  /** Optional CMS site settings; falls back to the built-in copy. */
  site?: SiteSettingsData | null;
}

const NAV_LINKS: ReadonlyArray<{
  label: string;
  href: string;
  page?: PageKey;
}> = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about", page: "about" },
  { label: "What We Do", href: "/services", page: "services" },
  { label: "Our Work", href: "/work", page: "work" },
  { label: "Journal", href: "/blog", page: "blog" },
  { label: "FAQ", href: "/#faq" },
] as const;

/** Map a CMS-provided href back to the page key used for `aria-current`. */
const HREF_TO_PAGE: Record<string, PageKey> = {
  "/about": "about",
  "/services": "services",
  "/work": "work",
  "/blog": "blog",
};

function pageForHref(href: string): PageKey | undefined {
  return HREF_TO_PAGE[href];
}

export function ServicesHeader({ currentPage, site }: ServicesHeaderProps) {
  const brandName = site?.brandName ?? "eventclassics.in";
  const links: ReadonlyArray<{
    label: string;
    href: string;
    page?: PageKey;
  }> = site?.navLinks?.length
    ? site.navLinks.map((link) => ({
        label: link.label,
        href: link.href,
        page: pageForHref(link.href),
      }))
    : NAV_LINKS;

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
          {brandName}
        </Link>

        <nav className="svc-head__links-wrap" aria-label="Primary">
          <ul className="svc-head__links" role="list">
            {links.map((link) => (
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
      <SterlingGateKineticNavigation site={site} />
    </>
  );
}

export default ServicesHeader;
