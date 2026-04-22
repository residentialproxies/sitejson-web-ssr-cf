import { FREE_STARTER_CREDITS, FREE_RATE_LIMIT_RPM, PRO_MONTHLY_QUOTA, PRO_RATE_LIMIT_RPM } from '@/lib/auth/session';

export const homeContent = {
  headline: 'Site data for any domain, structured as JSON',
  subheadline:
    'Look up any website and get traffic estimates, SEO signals, tech stack detection, DNS infrastructure, business classification, and AI trust scoring — all as structured JSON.',
  bullets: [
    'Traffic estimates, global ranking, and engagement metrics',
    'Full technology stack detection across 500+ signatures',
    'SEO structure: headings, links, meta tags, robots and sitemap',
    'AI-powered trust scoring and IAB business classification',
    'DNS infrastructure: nameservers, MX records, provider fingerprints',
    'Advertiser networks: AdSense IDs, ads.txt, publisher signals',
  ],
  seo: {
    title: 'SiteJSON — Site Data API: Traffic, Tech Stack, SEO & Trust Scoring',
    description:
      'SiteJSON returns structured site data for any domain via REST API. Get traffic estimates, SEO signals, technology stack detection, DNS infrastructure, business classification, and AI trust scoring as JSON.',
    keywords: [
      'site data API',
      'domain data API',
      'website data lookup',
      'traffic estimation',
      'tech stack detection',
      'SEO structure analysis',
      'trust score API',
      'DNS lookup API',
      'competitor data',
      'structured site data',
      'website intelligence',
      'domain enrichment API',
    ],
  },
  sections: {
    hero: {
      title: 'Site Data for Any Domain, Structured as JSON',
      description:
        'Enter any URL and get back traffic estimates, SEO signals, technology fingerprints, DNS infrastructure, business classification, and a trust score — all in one structured JSON response.',
    },
    features: {
      title: '50+ Data Points Per Domain',
      description:
        'SiteJSON aggregates data from traffic databases, DNS providers, HTML analysis, and AI classification to build a complete, structured site profile for any domain.',
    },
    useCases: {
      title: 'Site Data for Every Workflow',
      description:
        'Whether you are qualifying leads, mapping a market, detecting fraud, or enriching a data pipeline — SiteJSON delivers the domain data you need as clean, typed JSON.',
    },
  },
  faqs: [
    {
      question: 'What is SiteJSON and what site data does it return?',
      answer:
        'SiteJSON is a site data API that turns any domain into a structured JSON profile. Enter a URL and get back traffic estimates, SEO structure signals, technology stack detection, DNS infrastructure details, AI-generated business classification, and a legitimacy trust score.',
    },
    {
      question: 'What data fields are included in a site data response?',
      answer:
        'Each response includes: monthly traffic estimates, global and country rank, bounce rate, traffic source breakdown, SEO heading counts and link totals, technology stack detection (500+ signatures), DNS records (NS, MX, TXT), advertiser network signals (AdSense, ads.txt), AI business summary, IAB taxonomy classification, domain age, and a 0-100 legitimacy trust score.',
    },
    {
      question: 'How accurate are the traffic estimates?',
      answer:
        'Traffic estimates combine multiple ranking and DNS analytics sources with estimation models. Using multiple sources improves accuracy compared to single-source tools, though no third-party traffic estimate is exact.',
    },
    {
      question: 'How does the tech stack detection work?',
      answer:
        'SiteJSON fingerprints each domain against 500+ known technology signatures, including frameworks, CMS platforms, CDN providers, analytics tools, payment processors, A/B testing tools, chat widgets, and advertising networks. Detection uses HTTP headers, HTML patterns, script sources, and DNS records.',
    },
    {
      question: 'Can I use site data for lead qualification?',
      answer:
        'Yes. Look up any prospect domain to see estimated traffic scale, technology stack, business category, domain age, and trust score. Use structured site data to filter low-quality leads and prioritize outreach based on evidence instead of guesswork.',
    },
    {
      question: 'How fast are API responses?',
      answer:
        'Cached domain data returns in under 200ms. For domains not yet in the database, initial analysis typically completes within 30 to 60 seconds. Popular domains are always available instantly.',
    },
    {
      question: 'How does the AI trust scoring work?',
      answer:
        'The trust model analyzes domain age, SSL configuration, content quality indicators, contact information signals, DNS reputation, and behavioral patterns. It returns a 0-100 legitimacy score and a sentiment classification (Professional or Spammy) with associated risk flags.',
    },
    {
      question: 'Is there a free tier?',
      answer:
        `Sign in with GitHub to receive ${FREE_STARTER_CREDITS} one-time starter requests, a signed API key, and a rate limit of ${FREE_RATE_LIMIT_RPM} req/min. Pro adds ${PRO_MONTHLY_QUOTA} requests per billing cycle at ${PRO_RATE_LIMIT_RPM} req/min.`,
    },
    {
      question: 'What programming languages work with the API?',
      answer:
        'SiteJSON is a REST API that returns JSON. It works with any language or HTTP client — JavaScript, Python, Go, Rust, PHP, Ruby, and more. The same data structure you see in the visual report is what the API returns.',
    },
  ],
  longForm: {
    introduction: `
      Structured site data transforms how professionals research, qualify, and analyze the web.
      Instead of manually browsing a competitor's homepage and guessing at their scale or technology,
      you get every meaningful signal — traffic, SEO, tech, DNS, trust — aggregated into a single
      consistent JSON object per domain.
    `,
    whatWeDo: `
      SiteJSON is a site data platform that analyzes any domain and returns a structured JSON profile.
      Each profile combines traffic estimates, SEO structure signals, technology fingerprints, DNS
      infrastructure data, AI-generated business classification, and a legitimacy trust score.
      The same data is available both as a visual report and through the REST API.
    `,
    technology: `
      The platform combines multiple data sources: traffic ranking databases for visit estimates,
      DNS resolution for infrastructure signals, HTTP and HTML analysis for SEO and tech detection
      (fingerprinting against 500+ known signatures), and AI classification models for business
      context and trust scoring. Every field is normalized into a consistent schema so the same
      logic works on any domain you look up.
    `,
    useCases: `
      Growth teams use site data to qualify leads by checking traffic scale, tech stack, and trust score
      before outreach. SEO teams compare domain SEO structure against competitors to find gaps.
      Security and compliance teams check trust scores to flag risky or fraudulent domains.
      Developers pull structured site data through the API to enrich CRM records, data pipelines,
      and internal products.
    `,
    whyChooseUs: `
      Unlike simple lookup tools, SiteJSON returns depth across every signal layer. Traffic estimates
      come from multiple ranking sources. Technology detection covers 500+ signatures. Business
      classification uses IAB taxonomy. Trust scoring evaluates legitimacy across DNS, content, and
      behavioral signals. And every data point is available as structured JSON through the API — no
      scraping, no parsing, no guesswork.
    `,
    gettingStarted: `
      Sign in with GitHub to get your API key and start pulling structured site data. Browse the
      directory to explore site profiles across categories, technology stacks, and topics — or enter
      any URL to generate a fresh data profile on demand.
    `,
  },
};
