import type { Field, GlobalConfig } from 'payload'

const uploadField = (
  name: string,
  label: string,
  description?: string,
) => ({
  name,
  type: 'upload' as const,
  relationTo: 'media' as const,
  filterOptions: { mimeType: { contains: /video/i.test(label) ? 'video/' : 'image/' } },
  label,
  admin: description ? { description } : undefined,
})

const seoFields: Field[] = [
  { name: 'seoTitle', type: 'text', label: 'SEO title', admin: { description: 'Optional browser tab and search title.' } },
  { name: 'seoDescription', type: 'textarea', label: 'SEO description' },
  uploadField('ogImage', 'Social share image'),
]

export const PageAbout: GlobalConfig = {
  slug: 'page-about',
  label: 'About Page',
  admin: {
    group: 'Pages',
    description: 'Content of the /about page.',
  },
  fields: [
    ...seoFields,
    uploadField('heroVideo', 'Hero video', 'Looping chrome video in the about hero.'),
    uploadField('circularLogo', 'Circular text logo'),
    {
      name: 'heroTitle',
      type: 'textarea',
      defaultValue: "We’re a strategic brand-building partner for founders with momentum",
    },
    {
      name: 'heroLede',
      type: 'textarea',
      defaultValue:
        'Get a senior brand team embedded directly into your project. When you don’t have time to waste, we strip it back to what matters: fast-moving, reactive work that gets your product noticed.',
    },
    { name: 'circularInner', type: 'text', defaultValue: "Round and round the letters go, where they stop, you'll know." },
    { name: 'circularOuter', type: 'text', defaultValue: "Round and round the letters go, where they stop, you'll know." },
    {
      name: 'storyTitle',
      type: 'textarea',
      defaultValue: 'We set you on a path to go from idea to impact with a partner that just gets the ins and outs of brand life.',
    },
    {
      name: 'quoteLead',
      type: 'textarea',
      defaultValue:
        '"I started Event Classics after seeing how founders, seed rounds and small teams couldn\'t get access to top-tier brand work because of the costs and delays associated with agency bloat."',
    },
    {
      name: 'storyParagraphs',
      type: 'array',
      minRows: 0,
      fields: [{ name: 'text', type: 'textarea', required: true }],
      defaultValue: [
        {
          text: 'This doesn\'t mean we\'re a \'cheap choice\'. It means we cut the fat around the service and get straight to the output: the assets you need to fuel growth and turn ideas into investable propositions. We are your direct line into world-class design, understandings of your results, without the red tape of account managers or the delays of opening a ticket.',
        },
        {
          text: 'The system works. Since our first launch, we\'ve built the brand systems that helped our clients raise over ₹100Mn in funding, the kind of investment that opens them to long-term success. If you’re thinking of hiring an agency, this is your solution — embedded design that rolls with your momentum.',
        },
      ],
    },
    uploadField('founderAvatar', 'Founder photo'),
    { name: 'founderName', type: 'text', defaultValue: 'Pamal Mondal' },
    { name: 'founderRole', type: 'text', defaultValue: 'Founder & Lead Brand Designer' },
    {
      name: 'manifestoTitle',
      type: 'textarea',
      defaultValue: 'Execution over ego.\nWe’re lean by design.',
    },
    { name: 'manifestoCtaLabel', type: 'text', defaultValue: 'Find out what we offer' },
    { name: 'manifestoCtaHref', type: 'text', defaultValue: '/services' },
    {
      name: 'principles',
      type: 'array',
      minRows: 0,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
      defaultValue: [
        {
          title: 'Embedded, no outsourced',
          body: "We plug straight into your sprints, your standups, your launches. It feels like we're extended team, without the commitment of new staff. We don't slow you down when you need to iterate fast and move goalposts.",
        },
        {
          title: 'Progress over process',
          body: "We're here to move the product forward, not add layers for the sake of it. No bloated workshops. No six-week marches. We zero in on what needs to be done to move you forwards and focus on getting there.",
        },
        {
          title: 'Quality first',
          body: "Just because we're output-oriented, we never cut corners on quality. We save our time and resources for impactful, creative, and unique brand thinking. You're getting the core quality, lean and stripped of unnecessary ceremony.",
        },
        {
          title: 'We aim to be recommended',
          body: 'Every project is treated like the start of a long-term relationship. We care about doing work that founders genuinely want to recommend. Every client relationship is a partnership built on trust, communication, and shared outcomes.',
        },
      ],
    },
  ],
}

export const PageServices: GlobalConfig = {
  slug: 'page-services',
  label: 'Services Page',
  admin: {
    group: 'Pages',
    description:
      'Content of the /services page. The service list itself is shared — edit it under Home → Services.',
  },
  fields: [
    ...seoFields,
    uploadField('heroVideo', 'Hero video', 'Looping chrome video in the services hero.'),
    {
      name: 'heroTitle',
      type: 'textarea',
      defaultValue: 'Four disciplines.\nOne brand system.',
    },
    {
      name: 'heroLede',
      type: 'textarea',
      defaultValue:
        'Strategy, identity, distribution and content — built as one connected system, not four disconnected vendors.',
    },
    {
      name: 'finalCtaLines',
      type: 'array',
      label: 'Final CTA lines',
      minRows: 0,
      fields: [{ name: 'text', type: 'text', required: true }],
      defaultValue: [
        { text: 'Your business has already done the hard part.' },
        { text: "You've built something worth noticing." },
        { text: 'Now make sure the market sees it.' },
      ],
    },
    { name: 'finalCtaKicker', type: 'text', defaultValue: 'Start a conversation' },
    { name: 'finalCtaLabel', type: 'text', defaultValue: 'Book a call' },
    { name: 'finalCtaHref', type: 'text', defaultValue: '/contact-form' },
    uploadField('finalCtaImage', 'Final CTA image'),
  ],
}

export const PageWork: GlobalConfig = {
  slug: 'page-work',
  label: 'Work Page',
  admin: {
    group: 'Pages',
    description:
      'Every word, image and label on /work and on each project page under /work/[slug].',
  },
  fields: [
    ...seoFields,
    {
      name: 'heroLede',
      type: 'textarea',
      label: 'Board intro',
      defaultValue:
        'A senior brand team embedded directly into each project — fast-moving, reactive work that gets your product shipped and noticed.',
    },
    {
      name: 'projectsLabel',
      type: 'text',
      label: 'Board heading',
      defaultValue: 'Projects',
      admin: { description: 'Screen-reader heading for the board of case studies.' },
    },
    {
      type: 'collapsible',
      label: 'Project page labels',
      admin: {
        description:
          'Navigation and chapter headings repeated on every project page.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'backLabel',
          type: 'text',
          label: 'Back link',
          defaultValue: 'All work',
        },
        {
          name: 'nextLabel',
          type: 'text',
          label: 'Next project label',
          defaultValue: 'Next project',
        },
        {
          name: 'approachEyebrow',
          type: 'text',
          label: 'Approach — eyebrow',
          defaultValue: 'The approach',
        },
        {
          name: 'approachLinkLabel',
          type: 'text',
          label: 'Approach — link',
          defaultValue: 'Explore the approach',
        },
        {
          name: 'includesLabel',
          type: 'text',
          label: 'Includes label',
          defaultValue: 'Includes:',
        },
        {
          name: 'caseStudyLabel',
          type: 'text',
          label: 'Case study heading',
          defaultValue: 'Case study',
        },
        { name: 'ideaLabel', type: 'text', defaultValue: 'The idea' },
        { name: 'executionLabel', type: 'text', defaultValue: 'Execution' },
        { name: 'challengesLabel', type: 'text', defaultValue: 'Challenges' },
        {
          name: 'challengesNote',
          type: 'text',
          label: 'Challenges — note',
          defaultValue: 'What we faced, and how we solved it.',
        },
        {
          name: 'challengeColumnLabel',
          type: 'text',
          label: 'Challenges — column',
          defaultValue: 'The challenge',
        },
        {
          name: 'solutionColumnLabel',
          type: 'text',
          label: 'Solutions — column',
          defaultValue: 'How we solved it',
        },
        { name: 'impactLabel', type: 'text', defaultValue: 'Impact' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Diagram defaults',
      admin: {
        description:
          'Defaults for the connected-approach diagram. Any project can override them under Projects → Diagram.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'diagramCaption',
          type: 'text',
          label: 'Caption',
          defaultValue: 'A connected approach',
        },
        {
          name: 'diagramTriggerLabel',
          type: 'text',
          label: 'Trigger label',
          defaultValue: 'Brief',
        },
        {
          name: 'diagramRootEyebrow',
          type: 'text',
          label: 'Root eyebrow',
          defaultValue: 'Brand system',
        },
        {
          name: 'diagramRootNote',
          type: 'text',
          label: 'Root note',
          defaultValue: 'Strategy into expression',
        },
        {
          name: 'diagramItemsLabel',
          type: 'text',
          label: 'Nodes label',
          defaultValue: 'Connected disciplines',
        },
      ],
    },
    {
      name: 'projects',
      type: 'array',
      label: 'Projects',
      minRows: 0,
      admin: {
        description:
          'One entry per project. The order here is the order on the board, in the next-project link, and in the sitemap.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'slug',
          type: 'text',
          label: 'URL slug',
          admin: {
            description:
              'Address of the project page, e.g. “manipal-hospitals”. Leave empty to derive it from the title.',
          },
        },
        {
          name: 'flagship',
          type: 'checkbox',
          label: 'Flagship',
          defaultValue: false,
          admin: {
            description:
              'Highlights the Flagship word above the project name on the work board.',
          },
        },
        {
          name: 'cardTags',
          type: 'array',
          label: 'Board card pills',
          admin: {
            description:
              'The pills printed over the image on the work board. Empty falls back to the first two Includes entries.',
          },
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        {
          name: 'kickerParts',
          type: 'array',
          label: 'Kicker parts',
          admin: { description: 'Tick “highlight” to render a part in blue.' },
          fields: [
            { name: 'text', type: 'text', required: true },
            { name: 'highlight', type: 'checkbox', defaultValue: false },
          ],
        },
        { name: 'intro', type: 'textarea' },
        { name: 'body', type: 'textarea', label: 'Approach copy' },
        {
          name: 'includes',
          type: 'array',
          label: 'Deliverables',
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        { name: 'caption', type: 'text', label: 'Approach heading' },
        uploadField('image', 'Project image'),
        { name: 'alt', type: 'text', label: 'Image alt text' },
        {
          name: 'diagram',
          type: 'group',
          label: 'Diagram',
          admin: {
            description:
              'The connected-approach diagram on this project page. Empty fields fall back to the diagram defaults above; empty nodes fall back to the deliverables.',
          },
          fields: [
            {
              name: 'hideCaption',
              type: 'checkbox',
              label: 'Hide caption',
              defaultValue: false,
              admin: {
                description: 'Hides the “A connected approach” caption above the diagram.',
              },
            },
            { name: 'triggerLabel', type: 'text', label: 'Trigger label' },
            { name: 'eyebrow', type: 'text', label: 'Root eyebrow' },
            { name: 'title', type: 'text', label: 'Root title' },
            { name: 'note', type: 'text', label: 'Root note' },
            { name: 'itemsLabel', type: 'text', label: 'Nodes label' },
            {
              name: 'items',
              type: 'array',
              label: 'Nodes',
              minRows: 0,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'note', type: 'text' },
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Case study',
          admin: {
            description:
              'The four chapters under the hero: the idea, execution, challenges and impact. Empty chapters fall back to the bundled copy, then to the project intro.',
          },
          fields: [
            {
              name: 'idea',
              type: 'textarea',
              label: 'The idea — statement',
              admin: {
                description: 'The big opening line of the case study.',
              },
            },
            {
              name: 'executionIntro',
              type: 'textarea',
              label: 'Execution — intro',
            },
            {
              name: 'executionSteps',
              type: 'array',
              label: 'Execution — steps',
              minRows: 0,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea' },
              ],
            },
            {
              name: 'challenges',
              type: 'array',
              label: 'Challenges — faced & solved',
              minRows: 0,
              fields: [
                { name: 'challenge', type: 'text', required: true },
                { name: 'solution', type: 'textarea', required: true },
              ],
            },
            {
              name: 'impactStats',
              type: 'array',
              label: 'Impact — numbers',
              minRows: 0,
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Keep the unit in the value, e.g. “42%” or “3.1×”.',
                  },
                },
                { name: 'label', type: 'text', required: true },
              ],
            },
            {
              name: 'impactNote',
              type: 'text',
              label: 'Impact — footnote',
              admin: {
                description: 'Optional source line under the numbers.',
              },
            },
          ],
        },
      ],
    },
    { name: 'marqueeLine1', type: 'text', defaultValue: 'We build. We refine.' },
    {
      name: 'marqueeLine2',
      type: 'array',
      label: 'Marquee line 2 parts',
      admin: { description: 'Tick “highlight” to render a part in blue.' },
      fields: [
        { name: 'text', type: 'text', required: true },
        { name: 'highlight', type: 'checkbox', defaultValue: false },
      ],
      defaultValue: [
        { text: 'We listen. We think. ' },
        { text: 'We ship.', highlight: true },
        { text: " That's our work in motion." },
      ],
    },
    uploadField('marqueeVideo', 'Marquee video'),
    { name: 'readMoreLabel', type: 'text', defaultValue: 'Read more' },
    { name: 'readLessLabel', type: 'text', defaultValue: 'Read less' },
  ],
}

export const PageContact: GlobalConfig = {
  slug: 'page-contact',
  label: 'Contact Page',
  admin: {
    group: 'Pages',
    description: 'Content of the /contact-form page.',
  },
  fields: [
    ...seoFields,
    {
      name: 'introHeading',
      type: 'textarea',
      defaultValue: 'Let\'s build something worth remembering.',
    },
    {
      name: 'introLede',
      type: 'textarea',
      defaultValue:
        'Briefs, questions, or a quick sanity check on an idea — pick whichever fits and we\'ll get back within one business day. For active engagements, write to us directly at info@eventclassics.in.',
      admin: {
        description:
          'Use {email} to insert Intro Email as a link. Existing info@eventclassics.in text also follows Intro Email.',
      },
    },
    { name: 'introEmail', type: 'text', defaultValue: 'info@eventclassics.in' },
    { name: 'cardTitle', type: 'text', defaultValue: 'Get in touch' },
    {
      name: 'cardDescription',
      type: 'textarea',
      defaultValue:
        'Have a brief, an idea, or a question about how we work? Fill out the form and we\'ll get back within one business day. For active briefs, write to us directly.',
    },
    { name: 'email', type: 'text', defaultValue: 'info@eventclassics.in' },
    { name: 'phone', type: 'text', defaultValue: '983-1234-059' },
    { name: 'address', type: 'text', defaultValue: 'Kolkata, India · Working worldwide' },
    { name: 'infoEmailLabel', type: 'text', defaultValue: 'Email' },
    { name: 'infoPhoneLabel', type: 'text', defaultValue: 'Studio' },
    { name: 'infoAddressLabel', type: 'text', defaultValue: 'Address' },
    { name: 'failureMessage', type: 'textarea', defaultValue: 'Your message could not be sent. Please try again or email us directly.' },
    { name: 'labelName', type: 'text', defaultValue: 'Name' },
    { name: 'labelEmail', type: 'text', defaultValue: 'Email' },
    { name: 'labelPhone', type: 'text', defaultValue: 'Phone' },
    { name: 'labelMessage', type: 'text', defaultValue: 'Message' },
    { name: 'submitLabel', type: 'text', defaultValue: 'Send message' },
    { name: 'submittingLabel', type: 'text', defaultValue: 'Sending…' },
    {
      name: 'errorMessage',
      type: 'textarea',
      defaultValue: 'Please fill in your name, email and message.',
    },
  ],
}

export const PageThankYou: GlobalConfig = {
  slug: 'page-thank-you',
  label: 'Thank-You Page',
  admin: {
    group: 'Pages',
    description: 'Confirmation shown after the contact form is submitted.',
  },
  fields: [
    ...seoFields,
    {
      name: 'heading',
      type: 'textarea',
      defaultValue: 'Thank you for contacting us.',
    },
    {
      name: 'sub',
      type: 'textarea',
      defaultValue: 'We’ll get back to you very soon.',
    },
    { name: 'ctaLabel', type: 'text', defaultValue: 'Go to home' },
    { name: 'ctaHref', type: 'text', defaultValue: '/' },
  ],
}

export const PageBlog: GlobalConfig = {
  slug: 'page-blog',
  label: 'Journal Page',
  admin: { group: 'Pages', description: 'Journal heading, supporting copy and article navigation. Edit articles under Posts.' },
  fields: [
    ...seoFields,
    { name: 'label', type: 'text', defaultValue: 'Journal' },
    { name: 'heroTitle', type: 'text', defaultValue: 'Journal' },
    { name: 'heroLede', type: 'textarea', defaultValue: 'Notes on building brands people remember — from the studio floor.' },
    { name: 'emptyMessage', type: 'textarea', defaultValue: 'No posts yet — check back soon.' },
    { name: 'backLabel', type: 'text', defaultValue: 'All posts' },
  ],
}
