import { MagneticButton } from "@/components/ui/magnetic-button";
import type { SiteSettingsData } from "@/lib/cms";
import { mediaUrl } from "@/lib/cms";
import "./Footer.css";

const NAV_ITEMS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "What We Do", href: "/services" },
  { label: "Our Work",   href: "/work" },
  { label: "Journal",     href: "/blog" },
  { label: "FAQ",        href: "/#faq" },
];

const SOCIAL_ITEMS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Facebook", href: "https://www.facebook.com/EventClassics" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/eventclassics.in/",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@EventClassics",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/event-classics-in/?viewAsMember=true",
  },
  { label: "Twitter/X", href: "https://x.com/EventClassicsIN" },
];

interface FooterProps {
  site?: SiteSettingsData | null;
}

export function Footer({ site }: FooterProps) {
  const brandName = site?.brandName ?? "eventclassics.in";
  const brandTagline =
    site?.brandTagline ?? "Build something worth remembering.";
  const navItems: ReadonlyArray<{ label: string; href: string }> =
    site?.navLinks?.length ? site.navLinks : NAV_ITEMS;
  const talkLabel = site?.footerTalkLabel ?? "Let's Talk";
  const contactButtonLabel = site?.footerContactButtonLabel ?? "View Contact";
  const contactHref = site?.footerContactHref ?? "/contact-form";
  const logoVideoSrc =
    mediaUrl(site?.footerLogoVideo) ?? "/videos/footer-logo-magnific.mp4";
  const studioDetailsLabel = site?.studioDetailsLabel ?? "(STUDIO DETAILS)";
  const email = site?.email ?? "info@eventclassics.in";
  const locationLine1 = site?.locationLine1 ?? "Based in Kolkata, India";
  const locationLine2 = site?.locationLine2 ?? "Working worldwide.";
  const socialsLabel = site?.socialsLabel ?? "(SOCIALS)";
  const socialItems = site?.socials?.length
    ? site.socials.map((item) => ({ label: item.label, href: item.url }))
    : SOCIAL_ITEMS;
  const copyright = site?.copyright ?? "© Event Classics";

  return (
    <footer className="footer" id="site-footer">
      <div className="footer__inner">
        <nav className="footer__nav-col" aria-label="Site navigation">
          <div className="footer__brand">
            <div className="footer__brand-name">{brandName}</div>
            <div className="footer__brand-tagline">
              {brandTagline}
            </div>
          </div>

          <ul className="footer__nav-list">
            {navItems.map((item) => (
              <li key={item.label} className="footer__nav-item">
                <a className="footer__nav-link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            className="footer__magnetic-zone"
            href={contactHref}
          >
            <span className="footer__talk-link">
              {talkLabel} <span aria-hidden="true">→</span>
            </span>

            <MagneticButton>
              <span
                className="m-hero__cta footer__contact-button"
              >
                <span>{contactButtonLabel}</span>
              </span>
            </MagneticButton>
          </a>
        </nav>

        <div className="footer__right-col">
          <div className="footer__logo-wrap" aria-hidden="true">
            <video
              className="footer__logo-video"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source
                src={logoVideoSrc}
                type="video/mp4"
              />
            </video>
          </div>

          <div className="footer__details-socials">
            <div className="footer__details">
              <span className="footer__micro-label">{studioDetailsLabel}</span>

              <a
                className="footer__email"
                href={`mailto:${email}`}
              >
                <span className="footer__email-icon" aria-hidden="true">@</span>
                <span className="footer__email-text">{email}</span>
              </a>

              <p className="footer__location">
                {locationLine1}
                <br />
                {locationLine2}
              </p>
            </div>

            <div className="footer__socials">
              <span className="footer__micro-label">{socialsLabel}</span>
              <ul className="footer__socials-list">
                {socialItems.map((item) => (
                  <li key={item.label} className="footer__socials-item">
                    <a
                      className="footer__socials-link"
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="footer__socials-label">{item.label}</span>
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
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="footer__copyright">
        {copyright}
      </p>
    </footer>
  );
}

export default Footer;
