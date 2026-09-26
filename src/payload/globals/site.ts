import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Site',
    description:
      'Shared across every page: navigation, footer, brand name and contact details.',
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
      defaultValue: 'eventclassics.in',
      admin: { description: 'Wordmark shown in the hero and header.' },
    },
    {
      name: 'brandTagline',
      type: 'text',
      defaultValue: 'Build something worth remembering.',
    },
    {
      name: 'copyright',
      type: 'text',
      defaultValue: '© Event Classics',
    },
    {
      name: 'navLinks',
      type: 'array',
      label: 'Navigation links',
      minRows: 1,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
      defaultValue: [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'What We Do', href: '/services' },
        { label: 'Our Work', href: '/work' },
        { label: 'FAQ', href: '/#faq' },
      ],
    },
    {
      name: 'footerTalkLabel',
      type: 'text',
      label: 'Footer “talk” heading',
      defaultValue: 'Let\'s Talk',
    },
    {
      name: 'footerContactButtonLabel',
      type: 'text',
      defaultValue: 'View Contact',
    },
    {
      name: 'footerContactHref',
      type: 'text',
      defaultValue: '/contact-form',
    },
    {
      name: 'footerLogoVideo',
      type: 'upload',
      relationTo: 'media',
      label: 'Footer logo video',
      admin: { description: 'Looping logo animation at the bottom of every page.' },
    },
    {
      name: 'studioDetailsLabel',
      type: 'text',
      defaultValue: '(STUDIO DETAILS)',
    },
    {
      name: 'email',
      type: 'text',
      defaultValue: 'info@eventclassics.in',
    },
    {
      name: 'locationLine1',
      type: 'text',
      defaultValue: 'Based in Kolkata, India',
    },
    {
      name: 'locationLine2',
      type: 'text',
      defaultValue: 'Working worldwide.',
    },
    {
      name: 'socialsLabel',
      type: 'text',
      defaultValue: '(SOCIALS)',
    },
    {
      name: 'socials',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
      defaultValue: [
        { label: 'Facebook', url: 'https://www.facebook.com/EventClassics' },
        { label: 'Instagram', url: 'https://www.instagram.com/eventclassics.in/' },
        { label: 'YouTube', url: 'https://www.youtube.com/@EventClassics' },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/company/event-classics-in/?viewAsMember=true' },
        { label: 'Twitter/X', url: 'https://x.com/EventClassicsIN' },
      ],
    },
    {
      name: 'siteUrl',
      type: 'text',
      label: 'Production site URL',
      defaultValue: 'https://www.eventclassics.in',
      admin: {
        description:
          'Canonical origin used for metadataBase, canonical URLs, sitemap and social share cards. No trailing slash.',
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      label: 'Default SEO title',
      defaultValue: 'EVENTCLASSICS — Idea to Impact',
      admin: { description: 'Fallback <title> for pages without their own title (the home page uses this).' },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      label: 'Default meta description',
      defaultValue:
        "Strategic brand-building firm. We close the gap between what you've built and what the market thinks you've built.",
      admin: { description: 'Fallback meta description, ~150–160 characters.' },
    },
    {
      name: 'seoKeywords',
      type: 'text',
      label: 'Meta keywords',
      defaultValue: 'brand identity, brand strategy, digital design agency, Kolkata design studio',
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Default social share image',
      admin: {
        description:
          'Used for Open Graph / Twitter cards site-wide. Upload a 1200×630 image; falls back to the built-in cover art.',
      },
    },
  ],
}
