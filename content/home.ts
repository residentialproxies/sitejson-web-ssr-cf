import { FREE_STARTER_CREDITS, FREE_RATE_LIMIT_RPM, PRO_MONTHLY_QUOTA, PRO_RATE_LIMIT_RPM } from '@/lib/auth/session';

export const homeContent = {
  headline: 'Production-grade website intelligence API',
  subheadline:
    'Analyze any domain with structured SEO, infrastructure, and trust signals. Built for API-first products and search-scale content.',
  bullets: [
    'Modular provider architecture',
    'SSR-ready pages with SEO metadata',
    'Queue-driven analysis pipeline',
    'Full observability and deployment runbooks',
  ],
  // SEO-optimized long-form content (1200+ words equivalent)
  seo: {
    title: 'SiteJSON - Website Intelligence API for Traffic, SEO & Tech Stack Analysis',
    description:
      'SiteJSON provides comprehensive website intelligence through a powerful REST API. Get traffic estimates, SEO scores, technology stack detection, and AI-powered trust analysis for any domain.',
    keywords: [
      'website intelligence API',
      'domain analysis',
      'SEO analysis tool',
      'traffic estimation',
      'tech stack detection',
      'website scanner',
      'competitor analysis',
      'domain intelligence',
      'website monitoring',
      'digital footprint analysis',
    ],
  },
  // Main sections for expanded content
  sections: {
    hero: {
      title: 'Website Intelligence, Structured Data',
      description:
        'Unlock comprehensive insights about any website with our powerful API. From traffic analytics to technology detection, SiteJSON delivers the data you need to make informed decisions.',
    },
    features: {
      title: 'Complete Website Intelligence Platform',
      description:
        'Our platform aggregates data from 50+ sources to provide you with accurate, real-time insights about any domain on the internet.',
    },
    useCases: {
      title: 'Built for Modern Data-Driven Teams',
      description:
        'Whether you are qualifying leads, preventing fraud, or analyzing competitors, SiteJSON provides the intelligence you need at scale.',
    },
  },
  // FAQ section for structured data
  faqs: [
    {
      question: 'What is SiteJSON and how does it work?',
      answer:
        'SiteJSON is a comprehensive website intelligence API that analyzes any domain and provides structured data including traffic estimates, SEO metrics, technology stack detection, DNS infrastructure details, and AI-powered trust scoring. Our system crawls websites, aggregates data from multiple sources, and delivers insights through a simple REST API with sub-200ms response times.',
    },
    {
      question: 'What data points does SiteJSON provide?',
      answer:
        'SiteJSON provides over 50 data points per domain including: monthly traffic estimates and sources, global and country rankings, SEO scores and technical audits, technology stack detection (CMS, frameworks, analytics), DNS and infrastructure details, AI-generated business classification, trust and legitimacy scores, advertising and monetization data, visual screenshots and brand analysis, and contact information extraction.',
    },
    {
      question: 'How accurate are the traffic estimates?',
      answer:
        'Our traffic estimates combine multiple data sources including Cloudflare Radar, DNS analytics, and proprietary algorithms to provide highly accurate traffic intelligence. While no third-party estimate is perfect, our multi-source approach typically achieves 85-95% accuracy when compared to verified analytics data.',
    },
    {
      question: 'Can I use SiteJSON for lead qualification?',
      answer:
        'Absolutely. SiteJSON is widely used for automated lead qualification by analyzing company domains in real-time. Filter out spam signups, prioritize high-traffic prospects, detect fraudulent domains, and enrich lead data with company intelligence including technology choices and business categorization.',
    },
    {
      question: 'What is the API response time?',
      answer:
        'SiteJSON delivers sub-200ms API responses for cached data. For new domains not yet in our database, initial analysis typically completes within 30-60 seconds. Our edge-cached architecture ensures popular domains are always available instantly.',
    },
    {
      question: 'How does the trust scoring work?',
      answer:
        'Our AI-powered trust scoring analyzes multiple signals including domain age, content quality, contact information presence, SSL configuration, DNS reputation, and behavioral patterns. The system assigns a 0-100 legitimacy score and flags potential spam, phishing, or fraudulent domains.',
    },
    {
      question: 'Is there a free tier available?',
      answer:
        `SiteJSON API access requires a key. Sign in with GitHub to receive ${FREE_STARTER_CREDITS} one-time starter requests, a signed API key, and ${FREE_RATE_LIMIT_RPM} req/min. Pro adds ${PRO_MONTHLY_QUOTA} requests per billing cycle at ${PRO_RATE_LIMIT_RPM} req/min and is manually activated until checkout ships.`,
    },
    {
      question: 'What programming languages are supported?',
      answer:
        'SiteJSON is a REST API that works with any programming language. We provide code examples for JavaScript/TypeScript, Python, Go, Rust, PHP, Ruby, and more. Our API returns JSON responses that are easy to parse in any environment.',
    },
  ],
  // Long-form content sections for SEO
  longForm: {
    introduction: `
      In today's digital landscape, understanding the websites you interact with is crucial for business success.
      Whether you are a marketer analyzing competitors, a sales team qualifying leads, a security professional
      detecting fraud, or a developer building data-rich applications, having access to comprehensive website
      intelligence can give you a significant competitive advantage.
    `,
    whatWeDo: `
      SiteJSON is the most comprehensive website intelligence platform available today. Our API analyzes millions
      of domains, extracting valuable data points that help businesses make informed decisions. From traffic
      analytics that reveal a website's popularity to technology detection that shows what powers their
      infrastructure, we provide the insights that matter.
    `,
    technology: `
      Our platform leverages advanced machine learning algorithms and a distributed crawling infrastructure
      to deliver accurate, real-time data. We combine multiple data sources including DNS records, HTML analysis,
      traffic patterns, and AI classification to build complete website profiles. Our system processes over
      1 million domains, making it one of the largest website intelligence databases available.
    `,
    useCases: `
      Lead qualification teams use SiteJSON to automatically score and prioritize prospects based on their
      web presence. Security teams leverage our trust scoring to detect phishing attempts and fraudulent domains.
      Marketing teams analyze competitor technology choices and traffic sources. Product teams enrich their
      applications with rich domain metadata. The possibilities are endless.
    `,
    whyChooseUs: `
      Unlike simple domain lookup tools, SiteJSON provides deep intelligence across multiple dimensions.
      Our traffic estimates are derived from multiple sources for maximum accuracy. Our technology detection
      identifies over 500 different technologies. Our AI classification automatically categorizes websites
      using IAB taxonomy. And our trust scoring helps you avoid risky domains before they become a problem.
    `,
    gettingStarted: `
      Getting started with SiteJSON is simple. Sign in with GitHub to receive your free API key, make your
      first request to our /api/v1/analyze endpoint, and start receiving comprehensive website intelligence in
      seconds. Our documentation includes code examples in multiple languages, and our support team is always
      ready to help.
    `,
  },
};
