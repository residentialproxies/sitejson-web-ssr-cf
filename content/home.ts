import { FREE_STARTER_CREDITS, FREE_RATE_LIMIT_RPM, PRO_MONTHLY_QUOTA, PRO_RATE_LIMIT_RPM } from '@/lib/auth/session';

export const homeContent = {
  headline: 'Structured site data for any domain',
  subheadline:
    'Look up any website and get traffic, SEO, tech stack, trust score, and business data back as structured JSON.',
  bullets: [
    'Traffic estimates, rankings, and engagement metrics',
    'Full technology stack detection across 500+ signatures',
    'SEO structure analysis with heading maps and link counts',
    'AI-powered trust scoring and business classification',
  ],
  seo: {
    title: 'SiteJSON - Site Data API for Traffic, SEO & Tech Stack Analysis',
    description:
      'SiteJSON provides structured site data through a REST API. Get traffic estimates, SEO metrics, technology stack detection, and AI-powered trust analysis for any domain.',
    keywords: [
      'site data API',
      'domain data',
      'SEO analysis tool',
      'traffic estimation',
      'tech stack detection',
      'website data lookup',
      'competitor data',
      'domain data API',
      'structured site data',
      'website technology detection',
    ],
  },
  sections: {
    hero: {
      title: 'Structured Site Data for Any Domain',
      description:
        'Enter a URL and get back traffic estimates, SEO metrics, technology detection, DNS details, business classification, and a trust score — all as structured JSON.',
    },
    features: {
      title: 'Complete Site Data Platform',
      description:
        'SiteJSON aggregates data from multiple sources to build a structured profile for any domain on the internet.',
    },
    useCases: {
      title: 'Site Data for Every Workflow',
      description:
        'Whether you are qualifying leads, analyzing competitors, or enriching a CRM — SiteJSON delivers the domain data you need to make faster decisions.',
    },
  },
  faqs: [
    {
      question: 'What is SiteJSON and what data does it provide?',
      answer:
        'SiteJSON is a site data platform that turns any domain into a structured data profile. Enter a URL and get back traffic estimates, SEO metrics, technology stack detection, DNS infrastructure details, AI-powered business classification, and a trust score — all as JSON.',
    },
    {
      question: 'What data points are included in a site data profile?',
      answer:
        'Each profile includes: monthly traffic estimates and sources, global and country rankings, SEO structure analysis (headings, links, meta tags), technology stack detection across 500+ frameworks and tools, DNS and infrastructure details, AI-generated business classification, trust and legitimacy scores, and contact information extraction.',
    },
    {
      question: 'How accurate are the traffic estimates?',
      answer:
        'Traffic estimates combine multiple data sources including ranking databases, DNS analytics, and estimation models. The multi-source approach improves accuracy compared to single-source tools, though no third-party estimate is perfect.',
    },
    {
      question: 'Can I use SiteJSON data for lead qualification?',
      answer:
        'Yes. Look up any prospect domain to see traffic scale, technology stack, business category, and trust score. Use the data to filter out low-quality leads and prioritize outreach based on evidence rather than guesswork.',
    },
    {
      question: 'How fast is the API?',
      answer:
        'Cached data returns in under 200ms. For domains not yet in the database, initial analysis typically completes within 30-60 seconds. Popular domains are always available instantly.',
    },
    {
      question: 'How does the trust scoring work?',
      answer:
        'The AI trust model analyzes domain age, content quality, contact information, SSL configuration, DNS reputation, and behavioral patterns. It assigns a 0-100 legitimacy score and flags potential risks.',
    },
    {
      question: 'Is there a free tier?',
      answer:
        `Sign in with GitHub to receive ${FREE_STARTER_CREDITS} one-time starter requests, a signed API key, and a rate limit of ${FREE_RATE_LIMIT_RPM} req/min. Pro adds ${PRO_MONTHLY_QUOTA} requests per billing cycle at ${PRO_RATE_LIMIT_RPM} req/min.`,
    },
    {
      question: 'What programming languages work with the API?',
      answer:
        'SiteJSON is a REST API that returns JSON. It works with any language — JavaScript, Python, Go, Rust, PHP, Ruby, and more. The same data you see on the site is available through the API.',
    },
  ],
  longForm: {
    introduction: `
      Understanding the websites you interact with is essential for business decisions.
      Whether you are qualifying leads, analyzing competitors, detecting fraud, or building
      data-rich applications, having access to structured site data gives you a significant advantage.
    `,
    whatWeDo: `
      SiteJSON is a site data platform that analyzes any domain and returns a structured data profile.
      From traffic estimates that reveal a website's scale to technology detection that shows what
      powers their infrastructure, SiteJSON provides the data points that matter — all in one place.
    `,
    technology: `
      The platform combines multiple data sources including DNS records, HTML analysis, traffic
      estimation models, technology fingerprinting against 500+ known signatures, and AI classification
      models. The result is a single, consistent JSON object per domain that you can browse on the
      site or pull through the REST API.
    `,
    useCases: `
      Growth teams use site data to qualify leads by checking traffic, tech stack, and business category.
      SEO teams compare domain data against competitors to find gaps. Security teams check trust scores
      to flag risky domains. Developers pull structured data through the API to enrich their own products.
    `,
    whyChooseUs: `
      Unlike simple domain lookup tools, SiteJSON combines depth with structure. Traffic estimates
      come from multiple sources. Technology detection covers 500+ signatures. AI classification
      uses IAB taxonomy. Trust scoring evaluates legitimacy across multiple signals. And every
      data point is available as structured JSON through the API.
    `,
    gettingStarted: `
      Sign in with GitHub to get your API key and start pulling structured site data. Browse the
      directory to explore data for thousands of domains, or enter any URL to generate a fresh
      data profile on demand.
    `,
  },
};
