import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '../payload.config'

const filename = fileURLToPath(import.meta.url)
const ROOT = path.resolve(path.dirname(filename), '..')
const PUBLIC = path.join(ROOT, 'public')

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

async function uploadMedia(
  payload: Payload,
  rel: string,
  alt: string,
): Promise<number> {
  const name = path.basename(rel)

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: name } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    console.log(`  ↺ media exists: ${rel}`)
    return existing.docs[0].id as number
  }

  const data = await readFile(path.join(PUBLIC, rel))
  const ext = path.extname(rel).toLowerCase()
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: MIME[ext] ?? 'application/octet-stream',
      name,
      size: data.length,
    },
    overrideAccess: true,
  })
  console.log(`  ＋ uploaded: ${rel}`)
  return doc.id as number
}

async function uploadMediaFromUrl(
  payload: Payload,
  url: string,
  filename: string,
  alt: string,
): Promise<number | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    console.log(`  ↺ media exists: ${filename}`)
    return existing.docs[0].id as number
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = Buffer.from(await res.arrayBuffer())
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype: 'image/jpeg', name: filename, size: data.length },
      overrideAccess: true,
    })
    console.log(`  ＋ uploaded: ${filename}`)
    return doc.id as number
  } catch {
    console.warn(`  ⚠ cover download failed for ${filename}; keeping placeholder cover.`)
    return null
  }
}

async function setGlobal(payload: Payload, slug: string, data: Record<string, unknown>) {
  await payload.updateGlobal({ slug: slug as 'site-settings', data, overrideAccess: true })
  console.log(`  ✓ global: ${slug}`)
}

type LexicalRun = string | { text: string; bold?: boolean }

function lexicalText(text: string, bold: boolean) {
  return {
    detail: 0,
    format: bold ? 1 : 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  }
}

function lexicalPara(...runs: LexicalRun[]) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: runs.map((run) =>
      typeof run === 'string'
        ? lexicalText(run, false)
        : lexicalText(run.text, !!run.bold),
    ),
    direction: 'ltr',
    textStyle: '',
    textFormat: 0,
  }
}

function lexicalH2(text: string) {
  return {
    type: 'heading',
    tag: 'h2',
    format: '',
    indent: 0,
    version: 1,
    children: [lexicalText(text, false)],
    direction: 'ltr',
  }
}

function lexicalDoc(...blocks: unknown[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: blocks,
      direction: 'ltr',
    },
  }
}

interface SeedPost {
  title: string
  slug: string
  excerpt: string
  coverImage: number
  author: string
  publishedAt: string
  content: ReturnType<typeof lexicalDoc>
  seoTitle: string
  seoDescription: string
}

async function upsertPost(payload: Payload, post: SeedPost) {
  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: post.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const data = post as unknown as never
  if (existing.docs[0]) {
    await payload.update({
      collection: 'posts',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
    console.log(`  ↺ post exists: ${post.slug}`)
    return
  }
  await payload.create({ collection: 'posts', data, overrideAccess: true })
  console.log(`  ＋ post: ${post.slug}`)
}

async function clearDevPushMarker(payload: Payload): Promise<void> {
  try {
    const res = await payload.delete({
      collection: 'payload-migrations',
      where: { batch: { equals: -1 } },
      overrideAccess: true,
    })
    const cleared = res.docs?.length ?? 0
    if (cleared > 0) {
      console.log(`  ✕ cleared ${cleared} dev-push marker(s); builds will not prompt for migrations`)
    }
  } catch {
    console.log('  ↺ no dev-push marker to clear')
  }
}

async function main() {
  const payload = await getPayload({ config })

  console.log('Uploading media…')
  const brand1 = await uploadMedia(payload, 'brands/brand1.png', 'IQVIA')
  const brand2 = await uploadMedia(payload, 'brands/brand2.png', 'Manipal Hospitals')
  const brand3 = await uploadMedia(payload, 'brands/brand3.png', 'Redmonk Wellness')
  const brand4 = await uploadMedia(payload, 'brands/brand4.png', 'Team Taurus')
  const gapImg = await uploadMedia(payload, 'gap.png', 'We close the gap')
  const svcIdentity = await uploadMedia(payload, 'services/brand-identity.png', 'Brand identity')
  const svcGrowth = await uploadMedia(payload, 'services/growth-strategy.png', 'Growth strategy')
  const svcSocial = await uploadMedia(payload, 'services/social-media.png', 'Social media')
  const svcContent = await uploadMedia(payload, 'services/content-creation.png', 'Content creation')
  const ctaScale = await uploadMedia(payload, 'cta-scale.jpg', 'Final call to action')
  const founderAvatar = await uploadMedia(payload, 'about-founder-avatar.jpg', 'Pamal Mondal')
  const vidAbout = await uploadMedia(payload, 'videos/chrome-about-loop.mp4', 'About hero loop')
  const vidServices = await uploadMedia(payload, 'videos/chrome-services-loop.mp4', 'Services hero loop')
  const vidMammoth = await uploadMedia(payload, 'videos/success-stories-mammoth.webm', 'Success stories loop')
  const vidFooter = await uploadMedia(payload, 'videos/footer-logo-magnific.mp4', 'Footer logo loop')

  console.log('Seeding site settings…')
  await setGlobal(payload, 'site-settings', {
    brandName: 'eventclassics.in',
    brandTagline: 'Build something worth remembering.',
    copyright: '© Event Classics',
    navLinks: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about' },
      { label: 'What We Do', href: '/services' },
      { label: 'Our Work', href: '/work' },
      { label: 'Journal', href: '/blog' },
      { label: 'FAQ', href: '/#faq' },
    ],
    footerTalkLabel: "Let's Talk",
    footerContactButtonLabel: 'View Contact',
    footerContactHref: '/contact-form',
    footerLogoVideo: vidFooter,
    studioDetailsLabel: '(STUDIO DETAILS)',
    email: 'info@eventclassics.in',
    locationLine1: 'Based in Kolkata, India',
    locationLine2: 'Working worldwide.',
    socialsLabel: '(SOCIALS)',
    socials: [
      { label: 'Facebook', url: 'https://www.facebook.com/EventClassics' },
      { label: 'Instagram', url: 'https://www.instagram.com/eventclassics.in/' },
      { label: 'YouTube', url: 'https://www.youtube.com/@EventClassics' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/company/event-classics-in/?viewAsMember=true' },
      { label: 'Twitter/X', url: 'https://x.com/EventClassicsIN' },
    ],
    siteUrl: 'https://www.eventclassics.in',
    seoTitle: 'EVENTCLASSICS — Idea to Impact',
    seoDescription:
      "Strategic brand-building firm. We close the gap between what you've built and what the market thinks you've built.",
    seoKeywords: 'brand identity, brand strategy, digital design agency, Kolkata design studio',
    ogImage: ctaScale,
  })

  console.log('Seeding home globals…')
  await setGlobal(payload, 'home-hero', {
    brand: 'eventclassics.in',
    headline: 'Idea to Impact\n\nPROCESS. PRECISION. PERFORMANCE.',
    ctaLabel: 'Book A Call Now!',
    ctaHref: '/contact-form',
  })

  await setGlobal(payload, 'home-brands', {
    label: 'Trusted by',
    brands: [
      { logo: brand1, name: 'IQVIA' },
      { logo: brand2, name: 'Manipal Hospitals' },
      { logo: brand3, name: 'Redmonk Wellness' },
      { logo: brand4, name: 'Team Taurus' },
    ],
  })

  await setGlobal(payload, 'home-statement', {
    stat: '10+',
    statCaption: 'From disruptive creative businesses to consumer-first companies.',
    paragraphs: [
      { text: "Great founders don't usually have an ambition problem." },
      { text: 'They have the product. They have the people. They have the proof.' },
      { text: "But somewhere between what they've built and what the market sees, something gets lost." },
      { text: 'The story gets lost. The positioning gets crowded. The brand starts looking smaller than the business behind it.' },
      { text: 'Most agencies fix the surface.' },
      { text: "Between what you've built and what the market thinks you've built." },
    ],
    bylineName: 'Pamal Mondal',
    bylineRole: 'Strategic Brand-Building Firm',
    bylineInitials: 'P',
  })

  await setGlobal(payload, 'home-gap', {
    phraseLeft: 'WE CLOSE',
    phraseRight: 'THE GAP',
    image: gapImg,
    copy: "Between what you've built and what the market thinks you've built.",
  })

  await setGlobal(payload, 'home-keep-scrolling', {
    label: 'KEEP SCROLLING',
  })

  await setGlobal(payload, 'home-success-stories', {
    label: 'Success Stories',
    pagerTag: 'SS',
    video: vidMammoth,
    projects: [
      {
        title: 'IQVIA',
        description:
          "IQVIA didn't need another efficiency promise. It needed systems that worked around the business. We built customized CRM and ERP solutions around real workflows — supported by strategic and technology-led frameworks designed to reduce friction across teams.",
        stat: '—',
        statCaption: 'Making complex workflow better.',
        image: svcGrowth,
      },
      {
        title: 'Manipal Hospitals',
        description:
          "Healthcare is full of information. But people don't remember information — they remember how a brand made them feel. We shaped storytelling, branding campaigns and strategic communication around a clearer idea of trust — making the brand more human, recognizable and relevant to the people it serves.",
        stat: '—',
        statCaption: 'Making trust easier to feel.',
        image: svcContent,
      },
      {
        title: 'Redmonk Wellness',
        description:
          "Wellness brands don't need more content. They need content that feels worth stopping for. We built a sharper content approach around short, crisp and raw communication — designed for the way people actually consume information today.",
        stat: '—',
        statCaption: 'Turning attention into action.',
        image: svcSocial,
      },
      {
        title: 'Team Taurus',
        description:
          "Real estate is often reduced to location, price and square feet. People don't buy spaces like spreadsheets. They imagine what it will feel like to live there. We helped sharpen the brand narrative around the experience behind the spaces — making the communication more distinctive, considered and relevant to the people it was built for.",
        stat: '—',
        statCaption: 'Spaces that feel lived in.',
        image: svcIdentity,
      },
    ],
  })

  await setGlobal(payload, 'home-services', {
    intro: "We don't sell services.\nWe connect the pieces that make a brand work.",
    label: 'What we can help with',
    services: [
      {
        name: 'Brand Identity & Positioning',
        kicker: 'Be known for something.',
        description: 'Defining what you own, who it matters to and why anyone should choose you.',
        subItems: [
          { value: 'Research' },
          { value: 'Position' },
          { value: 'Identity' },
          { value: 'Brand System' },
        ],
        image: svcIdentity,
        imageLabel: 'BRAND IDENTITY',
      },
      {
        name: 'Growth Strategy & Market Intelligence',
        kicker: 'Stop guessing.',
        description: 'Turning audience behavior, competitor movements and market signals into decisions you can actually execute.',
        subItems: [
          { value: 'Research' },
          { value: 'Intelligence' },
          { value: 'Roadmap' },
          { value: 'Execution' },
        ],
        image: svcGrowth,
        imageLabel: 'GROWTH STRATEGY',
      },
      {
        name: 'Social Media & Audience Growth',
        kicker: 'Attention is not the goal.',
        description: 'Building content and campaigns that turn attention into audience, audience into action and action into growth.',
        subItems: [
          { value: 'Content' },
          { value: 'Distribution' },
          { value: 'Campaigns' },
          { value: 'Performance' },
        ],
        image: svcSocial,
        imageLabel: 'SOCIAL MEDIA',
      },
      {
        name: 'Content Creation & Production',
        kicker: 'Short. Crisp. Raw.',
        description: 'Turning strategy into content that feels relevant to the platform and different from everything around it.',
        subItems: [
          { value: 'Intelligence' },
          { value: 'Concept' },
          { value: 'Production' },
          { value: 'Optimisation' },
        ],
        image: svcContent,
        imageLabel: 'CONTENT CREATION',
      },
    ],
  })

  await setGlobal(payload, 'home-faq', {
    label: 'FAQs',
    ctaHeading: 'Still have questions?\nChat with us',
    ctaButtonLabel: 'Book a call with us',
    ctaHref: '/contact-form',
    headline: "Here's what you should know before working with us.",
    faqs: [
      {
        question: 'Who actually works on our project?',
        answer: 'A small senior team. The people who work are the people who build it.',
      },
      {
        question: 'How long does the work take?',
        answer:
          'Brand work typically takes 4–6 weeks. Larger brand-and-digital engagements run 8–12 weeks. Bigger problems are scoped in phases. You start seeing progress before everything is executed.',
      },
      {
        question: 'How do you work with client teams?',
        answer:
          "Weekly working sessions. Synchronized communication. You always know what's happening, what's blocked and what needs to be done next.",
      },
      {
        question: 'What do you need from us?',
        answer:
          "A clear brief or one honest conversation. We'll ask the questions from there. By the end of the first week, the direction, scope and next steps should be clear.",
      },
      {
        question: 'Do you only provide strategy?',
        answer: 'No. We build it, execute it, measure it and improve it.',
      },
      {
        question: 'Can you work with our existing team?',
        answer:
          "Yes. We can work alongside founders, internal teams and existing partners. The objective isn't to replace people. It's to make the whole system work better together.",
      },
      {
        question: 'What happens after the project?',
        answer:
          'We can stay. For growth, optimization, content, new initiatives or ongoing strategic support. Or we can hand everything over with the systems and documentation your team needs. Either way, the work should continue working.',
      },
      {
        question: 'How much does it cost?',
        answer:
          'Every business starts from a different problem. So we scope the problem before pricing the solution. No packaged work for the sake of a package. No surprise scope.',
      },
    ],
  })

  await setGlobal(payload, 'page-about', {
    heroVideo: vidAbout,
    heroTitle: 'We’re a strategic brand-building partner for founders with momentum',
    heroLede:
      'Get a senior brand team embedded directly into your project. When you don’t have time to waste, we strip it back to what matters: fast-moving, reactive work that gets your product noticed.',
    circularInner: "Round and round the letters go, where they stop, you'll know.",
    circularOuter: "Round and round the letters go, where they stop, you'll know.",
    storyTitle:
      'We set you on a path to go from idea to impact with a partner that just gets the ins and outs of brand life.',
    quoteLead:
      '"I started Event Classics after seeing how founders, seed rounds and small teams couldn\'t get access to top-tier brand work because of the costs and delays associated with agency bloat."',
    storyParagraphs: [
      {
        text: 'This doesn\'t mean we\'re a \'cheap choice\'. It means we cut the fat around the service and get straight to the output: the assets you need to fuel growth and turn ideas into investable propositions. We are your direct line into world-class design, understandings of your results, without the red tape of account managers or the delays of opening a ticket.',
      },
      {
        text: 'The system works. Since our first launch, we\'ve built the brand systems that helped our clients raise over ₹100Mn in funding, the kind of investment that opens them to long-term success. If you’re thinking of hiring an agency, this is your solution — embedded design that rolls with your momentum.',
      },
    ],
    founderAvatar,
    founderName: 'Pamal Mondal',
    founderRole: 'Founder & Lead Brand Designer',
    manifestoTitle: 'Execution over ego.\nWe’re lean by design.',
    manifestoCtaLabel: 'Find out what we offer',
    manifestoCtaHref: '/services',
    principles: [
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
  })

  await setGlobal(payload, 'page-services', {
    heroVideo: vidServices,
    heroTitle: 'Four disciplines.\nOne brand system.',
    heroLede:
      'Strategy, identity, distribution and content — built as one connected system, not four disconnected vendors.',
    finalCtaLines: [
      { text: 'Your business has already done the hard part.' },
      { text: "You've built something worth noticing." },
      { text: 'Now make sure the market sees it.' },
    ],
    finalCtaKicker: 'Start a conversation',
    finalCtaLabel: 'Book a call',
    finalCtaHref: '/contact-form',
    finalCtaImage: ctaScale,
  })

  await setGlobal(payload, 'page-work', {
    heroTitle: 'Selected work from teams with momentum',
    heroLede:
      'A senior brand team embedded directly into each project — fast-moving, reactive work that gets your product shipped and noticed.',
    projectsLabel: 'Projects',
    projects: [
      {
        title: 'IQVIA',
        kickerParts: [
          { text: 'Systems that ' },
          { text: 'work around the business.', highlight: true },
        ],
        intro:
          "IQVIA didn't need another efficiency promise. It needed systems built around the business — not bolted onto it.",
        body: 'We engineered the platform around real workflows: custom CRM and ERP integrations, supported by a clear strategic and technology-led framework designed to remove friction across every team that touched it.',
        includes: [
          { value: 'Workflow mapping across CRM & ERP teams' },
          { value: 'Custom systems integration' },
          { value: 'Technology-led strategic frameworks' },
          { value: 'Friction-reduction audits' },
        ],
        caption: 'Making complex workflow better.',
        image: svcGrowth,
        alt: 'IQVIA project — crystal growth visual',
      },
      {
        title: 'Manipal Hospitals',
        kickerParts: [
          { text: 'Making ' },
          { text: 'trust', highlight: true },
          { text: ' easier to feel.' },
        ],
        intro:
          "Healthcare is full of information, but people don't remember information — they remember how a brand made them feel.",
        body: 'We shaped the storytelling, branding campaigns and strategic communication around a clearer idea of care. The result is a health brand that feels human, recognizable and relevant to the people it serves.',
        includes: [
          { value: 'Brand storytelling & narrative system' },
          { value: 'Campaign design & production' },
          { value: 'Strategic communication' },
          { value: 'Care-experience messaging' },
        ],
        caption: 'Making trust easier to feel.',
        image: svcContent,
        alt: 'Manipal Hospitals project — film camera visual',
      },
      {
        title: 'Redmonk Wellness',
        kickerParts: [
          { text: 'Content that feels ' },
          { text: 'worth stopping for.', highlight: true },
        ],
        intro:
          "Wellness brands don't need more content. They need content that feels worth stopping for.",
        body: 'We built a sharper approach around short, crisp and raw communication — designed for the way people actually consume information today: fast feeds, short attention spans, and moments that reward brands that can be understood in a single glance.',
        includes: [
          { value: 'Short-form content strategy' },
          { value: 'Raw, crisp communication' },
          { value: 'Attention-first formats' },
          { value: 'Community & channel voice' },
        ],
        caption: 'Turning attention into action.',
        image: svcSocial,
        alt: 'Redmonk Wellness project — pink network visual',
      },
      {
        title: 'Team Taurus',
        kickerParts: [
          { text: 'Spaces that feel ' },
          { text: 'lived in.', highlight: true },
        ],
        intro:
          "Real estate is often reduced to location, price and square feet. People don't buy spaces like spreadsheets — they imagine what it will feel like to live there.",
        body: 'We sharpened the brand narrative around the experience behind the spaces, making the communication more distinctive, considered and relevant to the people it was built for.',
        includes: [
          { value: 'Brand narrative & positioning' },
          { value: 'Experience-led campaigns' },
          { value: 'Distinctive communication design' },
          { value: 'Considered spatial voice' },
        ],
        caption: 'Spaces that feel lived in.',
        image: svcIdentity,
        alt: 'Team Taurus project — clay identity mark',
      },
    ],
    marqueeLine1: 'We build. We refine.',
    marqueeLine2: [
      { text: 'We listen. We think. ' },
      { text: 'We ship.', highlight: true },
      { text: " That's our work in motion." },
    ],
    marqueeVideo: vidMammoth,
    includesLabel: 'Includes:',
    readMoreLabel: 'Read more',
    readLessLabel: 'Read less',
  })

  await setGlobal(payload, 'page-contact', {
    introHeading: 'Let\'s build something worth remembering.',
    introLede:
      'Briefs, questions, or a quick sanity check on an idea — pick whichever fits and we\'ll get back within one business day. For active engagements, write to us directly at info@eventclassics.in.',
    introEmail: 'info@eventclassics.in',
    cardTitle: 'Get in touch',
    cardDescription:
      'Have a brief, an idea, or a question about how we work? Fill out the form and we\'ll get back within one business day. For active briefs, write to us directly.',
    email: 'info@eventclassics.in',
    phone: '983-1234-059',
    address: 'Kolkata, India · Working worldwide',
    labelName: 'Name',
    labelEmail: 'Email',
    labelPhone: 'Phone',
    labelMessage: 'Message',
    submitLabel: 'Send message',
    submittingLabel: 'Sending…',
    errorMessage: 'Please fill in your name, email and message.',
  })

  await setGlobal(payload, 'page-thank-you', {
    heading: 'Thank you for contacting us.',
    sub: 'We’ll get back to you very soon.',
    ctaLabel: 'Go to home',
    ctaHref: '/',
  })

  console.log('Seeding journal covers…')
  const coverBrandNotLogo =
    (await uploadMediaFromUrl(
      payload,
      'https://muse.ai/files/1270913649446010/1076789725213984/px70xf1yww0iumsrwv430dg3/media-generation-journal-brand-not-logo-0-d9d6a003-9c60-493c-a594-7b6dcb35dc0c.jpg',
      'journal-brand-not-logo.jpg',
      'Hands tearing paper to reveal brand guideline sheets',
    )) ?? svcIdentity
  const coverCloseTheGap =
    (await uploadMediaFromUrl(
      payload,
      'https://muse.ai/files/1270913649446010/2024415794878529/xydjbkwqn6r0h3vcfb4f8kvf/media-generation-journal-close-the-gap-0-d670d71a-6cb3-4d88-a917-c8eb44a0add8.jpg',
      'journal-close-the-gap.jpg',
      'A lone figure crossing a concrete bridge over a dark chasm',
    )) ?? gapImg
  const coverLaunchDay =
    (await uploadMediaFromUrl(
      payload,
      'https://muse.ai/files/1270913649446010/1663638395479709/tgrop42nn0juqt35xgczl4gp/media-generation-journal-launch-day-0-4823384e-9cbc-48af-860d-beaafa1d9ed9.jpg',
      'journal-launch-day.jpg',
      'A lone runner on an empty road at dawn',
    )) ?? ctaScale

  console.log('Seeding journal posts…')
  await upsertPost(payload, {
    title: 'Why your brand is not your logo',
    slug: 'why-your-brand-is-not-your-logo',
    excerpt:
      'A logo is a flag. A brand is the country — the story, the behaviour, the feeling people carry after every interaction.',
    coverImage: coverBrandNotLogo,
    author: 'EventClassics Studio',
    publishedAt: '2026-09-18T10:00:00.000Z',
    content: lexicalDoc(
      lexicalPara(
        'Ask ten founders what their brand is and nine will point at their logo. It is an understandable mistake — the logo is the most visible artefact of the whole system. But a logo is a flag, and a brand is the country it flies over.',
      ),
      lexicalPara(
        'Your brand is the sum of every interaction a customer has with you: the tone of your emails, the speed of your support, the way your packaging feels in the hand, the confidence of your pricing page. The logo merely signs the work.',
      ),
      lexicalH2('Start with behaviour, not pixels'),
      lexicalPara(
        'When we begin an engagement, we never open a design tool in the first week. We interview customers, read support tickets, and map the moments that actually shape perception. The visual identity that follows is then a compression of something real — not decoration applied on top of a vague brief.',
      ),
      lexicalPara(
        'The test is simple: ',
        {
          text: 'cover the logo and ask whether the experience is still recognisably yours.',
          bold: true,
        },
        ' If the answer is no, you do not have a brand problem in your design files. You have a brand problem in your behaviour.',
      ),
    ),
    seoTitle: 'Why your brand is not your logo',
    seoDescription:
      'A logo is a flag; a brand is the country. Why behaviour — not pixels — is what the market actually remembers.',
  })

  await upsertPost(payload, {
    title: 'Close the gap: what the market thinks you built',
    slug: 'close-the-gap',
    excerpt:
      'There is what you built, and there is what the market thinks you built. The distance between the two is where growth goes to die.',
    coverImage: coverCloseTheGap,
    author: 'EventClassics Studio',
    publishedAt: '2026-09-08T10:00:00.000Z',
    content: lexicalDoc(
      lexicalPara(
        'Every ambitious company we meet lives with the same quiet frustration. The product is excellent. The team is serious. The customers who find it, love it. And yet the market at large holds a picture of the company that is two years out of date — smaller, vaguer, less capable than the reality.',
      ),
      lexicalPara(
        'We call this the gap: the distance between what you have built and what the market thinks you have built. It is not a marketing problem in the shallow sense. It is a translation problem. The work exists; the story has not caught up.',
      ),
      lexicalH2('The gap compounds'),
      lexicalPara(
        'A stale perception does not sit still — it charges interest. Talent joins the company they think you are. Partners price the risk they think you carry. Customers shortlist the category they think you belong to. Every quarter the story lags, the cost of catching up rises.',
      ),
      lexicalPara(
        'Closing the gap is not about louder claims. It is about evidence, arranged so the market cannot miss it: sharper positioning, a visual system with intent behind it, and communication that says the true thing plainly. That is the work we do — idea to impact.',
      ),
    ),
    seoTitle: 'Close the gap: what the market thinks you built',
    seoDescription:
      'The distance between what you built and what the market thinks you built is where growth goes to die. How to close it.',
  })

  await upsertPost(payload, {
    title: 'Launch day is not the finish line',
    slug: 'launch-day-is-not-the-finish-line',
    excerpt:
      'Most brands are built for the applause of launch week. The ones that last are built for the silence of week twelve.',
    coverImage: coverLaunchDay,
    author: 'EventClassics Studio',
    publishedAt: '2026-08-28T10:00:00.000Z',
    content: lexicalDoc(
      lexicalPara(
        'There is a particular energy in the final week before a launch. The site is nearly done, the assets are exporting, the team is running on momentum and caffeine. Everything points at one date circled on the calendar — as if the brand will be finished when the countdown hits zero.',
      ),
      lexicalPara(
        'It will not be. Launch day is the noisiest, least representative day of a brand’s life. Friends share it, the industry nods, and then the feed moves on. What remains is the long quiet stretch where the brand has to earn attention from strangers, repeatedly, without novelty on its side.',
      ),
      lexicalH2('Design for week twelve'),
      lexicalPara(
        'We advise founders to design backwards from the twelfth week: does the identity system still feel sharp when it has to carry its fiftieth LinkedIn post? Does the voice still sound like you when it has to say something boring, like a pricing change? Systems that survive the ordinary are the ones that compound.',
      ),
      lexicalPara(
        'A launch is a starting gun, not a trophy. Build the brand for the race, not the photo at the start line.',
      ),
    ),
    seoTitle: 'Launch day is not the finish line',
    seoDescription:
      'Most brands are built for the applause of launch week. The ones that last are built for the silence of week twelve.',
  })

  await clearDevPushMarker(payload)

  console.log('Seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
