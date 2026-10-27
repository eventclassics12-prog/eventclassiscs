import type { GlobalConfig } from 'payload'

const mediaUpload = (label: string, description?: string) => ({
  name: 'image',
  type: 'upload' as const,
  relationTo: 'media' as const,
  filterOptions: { mimeType: { contains: 'image/' } },
  label,
  admin: description ? { description } : undefined,
})

export const HomeHero: GlobalConfig = {
  slug: 'home-hero',
  label: 'Hero',
  admin: {
    group: 'Home',
    description: 'Top hero section of the home page.',
  },
  fields: [
    {
      name: 'brand',
      type: 'text',
      label: 'Homepage wordmark override',
      admin: { description: 'Optional. Clear this to use Site Settings → Brand Name.' },
    },
    {
      name: 'headline',
      type: 'textarea',
      required: true,
      defaultValue: 'Idea to Impact\n\nPROCESS. PRECISION. PERFORMANCE.',
      admin: { description: 'Line breaks are kept as shown.' },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Book A Call Now!',
    },
    {
      name: 'ctaHref',
      type: 'text',
      defaultValue: '/contact-form',
    },
  ],
}

export const HomeBrands: GlobalConfig = {
  slug: 'home-brands',
  label: 'Trusted By',
  admin: {
    group: 'Home',
    description: 'Manage the Trusted By logo grid. Expand a client logo row, then upload a new logo or choose an existing image.',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Trusted by',
    },
    {
      name: 'brands',
      type: 'array',
      label: 'Client logos',
      labels: { singular: 'Client logo', plural: 'Client logos' },
      admin: { initCollapsed: false, description: 'Use Add Client logo to add a row. The Logo control is inside each row.' },
      minRows: 0,
      fields: [
        {
          ...mediaUpload('Logo'),
          name: 'logo',
          displayPreview: true,
          admin: { allowCreate: true, description: 'Upload a new image here, or select an image from Media.' },
        },
        { name: 'name', type: 'text', label: 'Client name', required: true },
      ],
    },
  ],
}

export const HomeStatement: GlobalConfig = {
  slug: 'home-statement',
  label: 'Statement',
  admin: {
    group: 'Home',
    description: 'The big “10+” statement section.',
  },
  fields: [
    { name: 'stat', type: 'text', required: true, defaultValue: '10+' },
    {
      name: 'statCaption',
      type: 'text',
      defaultValue: 'From disruptive creative businesses to consumer-first companies.',
    },
    {
      name: 'paragraphs',
      type: 'array',
      minRows: 0,
      fields: [{ name: 'text', type: 'textarea', required: true }],
      defaultValue: [
        { text: "Great founders don't usually have an ambition problem." },
        { text: 'They have the product. They have the people. They have the proof.' },
        { text: "But somewhere between what they've built and what the market sees, something gets lost." },
        { text: 'The story gets lost. The positioning gets crowded. The brand starts looking smaller than the business behind it.' },
        { text: 'Most agencies fix the surface.' },
        { text: "Between what you've built and what the market thinks you've built." },
      ],
    },
  ],
}

export const HomeGap: GlobalConfig = {
  slug: 'home-gap',
  label: 'We Close The Gap',
  admin: {
    group: 'Home',
    description: '“We close the gap” band with the gap image.',
  },
  fields: [
    { name: 'phraseLeft', type: 'text', defaultValue: 'WE CLOSE' },
    { name: 'phraseRight', type: 'text', defaultValue: 'THE GAP' },
    { ...mediaUpload('Gap image'), name: 'image' },
    {
      name: 'copy',
      type: 'textarea',
      defaultValue:
        "Between what you've built and what the market thinks you've built.",
    },
  ],
}

export const HomeKeepScrolling: GlobalConfig = {
  slug: 'home-keep-scrolling',
  label: 'Keep Scrolling',
  admin: {
    group: 'Home',
    description: 'Circular “keep scrolling” divider text.',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'KEEP SCROLLING',
    },
  ],
}

export const HomeSuccessStories: GlobalConfig = {
  slug: 'home-success-stories',
  label: 'Success Stories',
  admin: {
    group: 'Home',
    description: 'Pinned-scroll case study section on the home page.',
  },
  fields: [
    { name: 'label', type: 'text', defaultValue: 'Success Stories' },
    { name: 'pagerTag', type: 'text', defaultValue: 'SS' },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      label: 'Default project video',
      filterOptions: { mimeType: { contains: 'video/' } },
      admin: { description: 'Video played on case-study hover or mobile visibility. Individual projects can override it.' },
    },
    {
      name: 'projects',
      type: 'array',
      minRows: 0,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'stat', type: 'text', required: true },
        { name: 'statCaption', type: 'text', required: true },
        { ...mediaUpload('Project image'), name: 'image' },
        { name: 'video', type: 'upload', relationTo: 'media', filterOptions: { mimeType: { contains: 'video/' } }, label: 'Project video override' },
      ],
    },
  ],
}

export const HomeServices: GlobalConfig = {
  slug: 'home-services',
  label: 'Services',
  admin: {
    group: 'Home',
    description:
      'Service list — shared by the home page section and the Services page.',
  },
  fields: [
    {
      name: 'intro',
      type: 'textarea',
      defaultValue: 'We don’t sell services.\nWe connect the pieces that make a brand work.',
    },
    { name: 'label', type: 'text', defaultValue: 'What we can help with' },
    {
      name: 'services',
      type: 'array',
      minRows: 0,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'kicker', type: 'text' },
        { name: 'description', type: 'textarea', required: true },
        {
          name: 'subItems',
          type: 'array',
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        { ...mediaUpload('Service image'), name: 'image' },
        { name: 'imageLabel', type: 'text' },
      ],
    },
  ],
}

export const HomeFaq: GlobalConfig = {
  slug: 'home-faq',
  label: 'FAQ',
  admin: {
    group: 'Home',
    description: 'Frequently asked questions on the home page.',
  },
  fields: [
    { name: 'label', type: 'text', defaultValue: 'FAQs' },
    {
      name: 'ctaHeading',
      type: 'textarea',
      defaultValue: 'Still have questions?\nChat with us',
    },
    { name: 'ctaButtonLabel', type: 'text', defaultValue: 'Book a call with us' },
    { name: 'ctaHref', type: 'text', defaultValue: '/contact-form' },
    {
      name: 'headline',
      type: 'textarea',
      defaultValue: 'Here’s what you should know before working with us.',
    },
    {
      name: 'faqs',
      type: 'array',
      minRows: 0,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}
