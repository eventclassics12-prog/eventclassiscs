import type { GlobalConfig } from 'payload'

const uploadField = (
  name: string,
  label: string,
  description?: string,
) => ({
  name,
  type: 'upload' as const,
  relationTo: 'media' as const,
  label,
  admin: description ? { description } : undefined,
})

export const PageAbout: GlobalConfig = {
  slug: 'page-about',
  label: 'About Page',
  admin: {
    group: 'Pages',
    description: 'Content of the /about page.',
  },
  fields: [
    uploadField('heroVideo', 'Hero video', 'Looping chrome video in the about hero.'),
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
      minRows: 1,
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
      minRows: 1,
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
      minRows: 1,
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
    description: 'Content of the /work page.',
  },
  fields: [
    {
      name: 'heroTitle',
      type: 'textarea',
      defaultValue: 'Selected work from teams with momentum',
    },
    {
      name: 'heroLede',
      type: 'textarea',
      defaultValue:
        'A senior brand team embedded directly into each project — fast-moving, reactive work that gets your product shipped and noticed.',
    },
    { name: 'projectsLabel', type: 'text', defaultValue: 'Projects' },
    {
      name: 'projects',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
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
        { name: 'body', type: 'textarea' },
        {
          name: 'includes',
          type: 'array',
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        { name: 'caption', type: 'text' },
        uploadField('image', 'Project image'),
        { name: 'alt', type: 'text' },
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
    { name: 'includesLabel', type: 'text', defaultValue: 'Includes:' },
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
          'The email address inside this text is automatically turned into a mailto link.',
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
