import { FREE_STARTER_CREDITS, FREE_RATE_LIMIT_RPM, PRO_MONTHLY_QUOTA, PRO_RATE_LIMIT_RPM } from '@/lib/auth/session';

export const homeContent = {
  headline: 'Instant website intelligence for any domain',
  subheadline:
    'Enter any URL and get back traffic estimates, SEO structure, tech stack, trust score, and business signals — structured as clean JSON.',
  bullets: [
    'Traffic estimates, global rankings, and audience engagement metrics',
    'Technology stack detection across 500+ frameworks and platforms',
    'SEO structure analysis: headings, links, meta tags, and indexability',
    'AI-powered trust scoring and IAB business classification',
  ],
  seo: {
    title: 'SiteJSON — Website Intelligence API for Traffic, SEO & Tech Stack',
    description:
      'Turn any domain into a structured data profile. SiteJSON delivers traffic estimates, SEO signals, technology detection, and AI trust scoring via a clean REST API.',
    keywords: [
      'website intelligence API',
      'domain data API',
      'SEO analysis API',
      'traffic estimation tool',
      'tech stack detection',
      'website data lookup',
      'competitor intelligence',
      'structured site data',
      'website technology fingerprinting',
      'domain trust scoring',
    ],
  },
  sections: {
    hero: {
      title: 'Website Intelligence for Any Domain',
      description:
        'Enter a URL and get traffic estimates, SEO signals, technology detection, DNS details, business classification, and a trust score — all as structured JSON in one request.',
    },
    features: {
      title: 'One Platform. Every Signal That Matters.',
      description:
        'SiteJSON aggregates 50+ data points from DNS, HTML, and traffic providers into a single structured profile for any domain on the internet.',
    },
    useCases: {
      title: 'From Research to Decision in One Workflow',
      description:
        'Qualifying prospects, mapping competitors, or enriching a CRM — SiteJSON gives you the domain intelligence you need to move faster and decide with confidence.',
    },
  },
  faqs: [
    {
      question: 'What is SiteJSON and what data does it return?',
      answer:
        'SiteJSON is a website intelligence platform that turns any domain into a structured data profile. You get traffic estimates, SEO metrics, technology stack detection, DNS infrastructure details, AI-powered business classification, and a trust score — all returned as clean JSON.',
    },
    {
      question: 'What data points are included in a site profile?',
      answer:
        'Each profile includes: monthly traffic estimates and sources, global and country-level rankings, SEO structure analysis (headings, links, meta tags, indexability), technology detection across 500+ frameworks and tools, DNS and infrastructure details, AI-generated business classification, trust and legitimacy scores, and contact information extraction.',
    },
    {
      question: 'How accurate are the traffic estimates?',
      answer:
        'Traffic estimates combine multiple data sources including ranking databases, DNS analytics, and multi-model estimation. The blended approach improves accuracy compared to single-source tools, though no third-party estimate is exact.',
    },
    {
      question: 'Can I use SiteJSON for lead qualification?',
      answer:
        'Yes. Pull any prospect domain to see traffic scale, technology stack, business category, and trust score. Filter out weak leads and prioritize outreach based on evidence, not guesswork.',
    },
    {
      question: 'How fast does the API respond?',
      answer:
        'Cached data returns in under 200ms. For domains not yet in the index, initial analysis typically completes in 30–60 seconds. High-traffic domains are always available instantly.',
    },
    {
      question: 'How does the AI trust scoring work?',
      answer:
        'The AI trust model evaluates domain age, content quality, contact information, SSL configuration, DNS reputation, and behavioral patterns. It produces a 0–100 legitimacy score and flags potential risks for review.',
    },
    {
      question: 'Is there a free tier?',
      answer:
        `Sign in with GitHub to receive ${FREE_STARTER_CREDITS} one-time starter requests, a signed API key, and a rate limit of ${FREE_RATE_LIMIT_RPM} req/min. Pro adds ${PRO_MONTHLY_QUOTA} requests per billing cycle at ${PRO_RATE_LIMIT_RPM} req/min.`,
    },
    {
      question: 'Which languages and runtimes work with the API?',
      answer:
        'SiteJSON is a standard REST API that returns JSON. It works natively with JavaScript, Python, Go, Rust, PHP, Ruby, and any other language that can make an HTTP request. The same data you explore on the site is available in full through the API.',
    },
  ],
  longForm: {
    introduction: `
      Every business decision that involves a website starts with a question: who is this, how big are they,
      and can they be trusted? Whether you are qualifying leads, mapping competitors, auditing partners, or
      building data-rich applications, structured site intelligence gives you a decisive edge over teams
      still relying on manual research.
    `,
    whatWeDo: `
      SiteJSON is a website intelligence platform that turns any domain into a rich, structured data profile.
      Traffic estimates reveal a site's audience scale. Technology detection exposes what powers its
      infrastructure. Trust scoring surfaces legitimacy signals. Every data point is formatted consistently
      so you can query it, compare it, and act on it immediately.
    `,
    technology: `
      The platform combines DNS records, HTML analysis, traffic estimation models, technology fingerprinting
      against 500+ known signatures, and AI classification models trained on IAB taxonomy. The result is a
      single, consistent JSON object per domain — ready to browse on the site or pull programmatically
      through the REST API.
    `,
    useCases: `
      Growth teams qualify leads by checking traffic scale, tech stack, and category fit before the first touch.
      SEO teams benchmark their domain data against competitors to identify structural gaps. Security teams
      run trust scoring to flag high-risk domains before engaging. Developers integrate the API to enrich
      their own CRMs, dashboards, and research tools with live site intelligence.
    `,
    whyChooseUs: `
      Unlike shallow lookup tools, SiteJSON pairs depth with structure. Traffic comes from multiple blended
      sources. Technology detection covers 500+ signatures. Business classification uses IAB taxonomy.
      Trust scoring weighs legitimacy across a dozen independent signals. And every data point ships as
      clean, predictable JSON — so you can build on it the moment you receive it.
    `,
    gettingStarted: `
      Sign in with GitHub to claim your free API key and start pulling site intelligence immediately.
      Browse the directory to explore profiles for thousands of domains, or enter any URL to trigger
      a fresh analysis on demand. No credit card required to get started.
    `,
  },
};
