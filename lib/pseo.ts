import type { AlternativeSite, DirectoryItem, DirectoryStats, SiteReport } from '@/lib/api-client/types';
import { formatNumber, normalizeDirectorySlug } from '@/lib/utils';

export type DirectoryType = 'category' | 'technology' | 'topic';

export type FaqEntry = {
  question: string;
  answer: string;
};

export type DirectorySeed = {
  type: DirectoryType;
  slug: string;
  label: string;
  title: string;
  description: string;
  intent: string;
};

export type LinkCard = {
  href: string;
  label: string;
  description: string;
  eyebrow?: string;
  reason?: string;
};

export type FeaturedReport = {
  domain: string;
  title: string;
  description: string;
  href: string;
  vertical: string;
  bestFor: string;
  signals: string[];
};

export type ResearchSignalCard = {
  title: string;
  value: string;
  description: string;
};

export type UseCaseCard = {
  title: string;
  description: string;
  cta: string;
  href: string;
};

export type ReportSectionKey = 'overview' | 'seo' | 'traffic' | 'tech' | 'business' | 'alternatives';

export const DIRECTORY_TYPE_ORDER: DirectoryType[] = ['category', 'technology', 'topic'];

export const isDirectoryType = (value: string): value is DirectoryType => (
  DIRECTORY_TYPE_ORDER.includes(value as DirectoryType)
);

export const DIRECTORY_SEEDS: Record<DirectoryType, DirectorySeed> = {
  category: {
    type: 'category',
    slug: 'technology',
    label: 'Industry Categories',
    title: 'Browse websites by business category',
    description: 'Start with industry and market intent, then drill into live reports for the sites that matter.',
    intent: 'Best for competitor research, market mapping, and account qualification.',
  },
  technology: {
    type: 'technology',
    slug: 'react',
    label: 'Technology Stacks',
    title: 'Browse websites by technology stack',
    description: 'Find websites that use a framework, CMS, or platform, then open the report to inspect trust and traffic signals.',
    intent: 'Best for sales discovery, developer research, and technical benchmarking.',
  },
  topic: {
    type: 'topic',
    slug: 'finance',
    label: 'Topics & Niches',
    title: 'Browse websites by topic and audience',
    description: 'Explore vertical themes and editorial niches, then jump into domain-level intelligence for deeper analysis.',
    intent: 'Best for editorial research, pSEO discovery, and partner scouting.',
  },
};

export const FEATURED_REPORTS: FeaturedReport[] = [
  {
    domain: 'openai.com',
    title: 'AI product report',
    description: 'See how a high-interest product site is presented across trust, traffic, SEO, and tech.',
    href: '/data/openai.com',
    vertical: 'AI software',
    bestFor: 'Studying breakout product positioning and authority signals.',
    signals: ['Trust and legitimacy posture', 'Traffic and rank context', 'Technical stack clues'],
  },
  {
    domain: 'stripe.com',
    title: 'B2B infrastructure report',
    description: 'Inspect brand authority, infrastructure, and monetization clues on a mature B2B site.',
    href: '/data/stripe.com',
    vertical: 'Fintech infrastructure',
    bestFor: 'Understanding how mature platform businesses surface credibility.',
    signals: ['Business and monetization notes', 'SEO structure maturity', 'Infrastructure footprint'],
  },
  {
    domain: 'figma.com',
    title: 'Design platform report',
    description: 'Use a recognizable SaaS example to understand how the modules read on a strong brand.',
    href: '/data/figma.com',
    vertical: 'Design SaaS',
    bestFor: 'Reviewing category fit, product positioning, and audience signals.',
    signals: ['Category and taxonomy fit', 'Trust and sentiment review', 'Traffic scale snapshot'],
  },
  {
    domain: 'vercel.com',
    title: 'Developer platform report',
    description: 'Open a developer-focused report to compare stack signals, rankings, and business posture.',
    href: '/data/vercel.com',
    vertical: 'Developer tools',
    bestFor: 'Benchmarking technical maturity and ecosystem credibility.',
    signals: ['Tech stack and providers', 'Traffic quality indicators', 'Alternative path exploration'],
  },
];

export const RESEARCH_SIGNAL_CARDS: ResearchSignalCard[] = [
  {
    title: 'Directory-first discovery',
    value: '3 browse hubs',
    description: 'Start from category, technology, or topic pages before you open any single report.',
  },
  {
    title: 'Analyst-grade report depth',
    value: '6 report modules',
    description: 'Traffic, SEO, tech, business, trust context, and alternatives stay connected in one workflow.',
  },
  {
    title: 'Professional internal linking',
    value: 'Cross-page paths',
    description: 'Visitors can move from hubs to reports to adjacent examples without losing context.',
  },
  {
    title: 'Utility before signup',
    value: 'API optional',
    description: 'The site proves the data model first, then hands power users a structured API path.',
  },
];

export const USE_CASE_CARDS: UseCaseCard[] = [
  {
    title: 'Investigate a market faster',
    description: 'Start with a directory, open live reports, and compare traffic, SEO, and trust signals without guessing.',
    cta: 'Browse directory hubs',
    href: '/directory',
  },
  {
    title: 'Qualify leads with evidence',
    description: 'Use the domain report to see whether a company looks legitimate, how large it may be, and what it runs on.',
    cta: 'Open a live report',
    href: '/data/openai.com',
  },
  {
    title: 'Move into API workflows later',
    description: 'When the site experience proves useful, step into docs and signed API access without losing the exploration path.',
    cta: 'Review API access',
    href: '/#pricing',
  },
];

export const HOME_FAQS: FaqEntry[] = [
  {
    question: 'What can I do on SiteJSON before requesting API access?',
    answer: 'You can browse directory hubs, open live domain reports, compare trust and traffic signals, and use the site as a research workflow before touching the API.',
  },
  {
    question: 'Why are the directory pages useful for SEO and user retention?',
    answer: 'They create crawlable discovery paths, but more importantly they help users move from broad market exploration into specific, high-intent domain reports that keep them engaged.',
  },
  {
    question: 'How is the report experience different from a simple domain lookup?',
    answer: 'Each report organizes SEO, traffic, technology, business, and trust signals into user-friendly modules so a visitor can understand what matters and where to go next.',
  },
  {
    question: 'Who is this experience designed for?',
    answer: 'This version is built for mixed audiences: investigators, marketers, growth teams, sales operators, and API buyers who want utility first and integration second.',
  },
];

const DIRECTORY_TYPE_FAQS: Record<DirectoryType, FaqEntry[]> = {
  category: [
    {
      question: 'When should I browse category directories first?',
      answer: 'Use category pages when you want a market-level starting point, such as technology, finance, or ecommerce, and need to identify which sites deserve deeper review.',
    },
    {
      question: 'What should I do after opening a category result?',
      answer: 'Open the report page for a promising domain, then use the related links to branch into adjacent directories or similar websites.',
    },
  ],
  technology: [
    {
      question: 'What are technology directories best at?',
      answer: 'They help you find websites built with a framework or platform so you can compare implementation patterns, competitive clusters, and likely technical maturity.',
    },
    {
      question: 'How do I move from a technology page to useful analysis?',
      answer: 'Open a few report pages from the listing, compare their traffic and trust modules, then pivot into related business categories for broader context.',
    },
  ],
  topic: [
    {
      question: 'What is the difference between a topic page and a category page?',
      answer: 'A topic page is more editorial and audience oriented. It is useful when you care about niche intent and content themes more than formal business classification.',
    },
    {
      question: 'How should I use topic pages in a research workflow?',
      answer: 'Start with the topic, identify standout domains, then use the report modules to judge authority, monetization posture, and technical sophistication.',
    },
  ],
};

export const REPORT_SECTION_COPY: Record<ReportSectionKey, { title: string; summary: string; bullets: string[] }> = {
  overview: {
    title: 'Start here before opening deeper tabs',
    summary: 'This overview turns the raw report into a fast read: what kind of site this is, how it appears to perform, and which detail modules are most worth opening next.',
    bullets: [
      'Use the SEO card to judge structure quality.',
      'Use traffic and rank signals to estimate market weight.',
      'Use business and trust modules before outreach or partnership decisions.',
    ],
  },
  seo: {
    title: 'Use the SEO tab as a quality and discoverability check',
    summary: 'These metrics help you decide whether a site is structured clearly enough for search and users. Strong heading, linking, and technical file patterns usually indicate better discoverability.',
    bullets: [
      'Check heading counts to spot thin or messy structure.',
      'Review robots and sitemap presence before treating a site as search-mature.',
      'Use taxonomy and AI notes to understand topical fit.',
    ],
  },
  traffic: {
    title: 'Traffic metrics tell you how visible the site likely is',
    summary: 'Use rank, visits, geography, and engagement signals together. No single metric is enough, but the combination is useful for prioritization and market sizing.',
    bullets: [
      'Compare global rank and monthly visits first.',
      'Use top countries and traffic mix to understand audience shape.',
      'Check domain age and dates before making durable assumptions.',
    ],
  },
  tech: {
    title: 'Technology data helps you qualify implementation maturity',
    summary: 'This section shows what the site appears to run on, which providers support it, and whether the technical footprint looks modern, stable, and discoverable.',
    bullets: [
      'Stack tags are useful for sales, partnerships, and benchmarking.',
      'DNS and files help you judge operational hygiene.',
      'Provider health and timing reveal how complete the current read is.',
    ],
  },
  business: {
    title: 'Business signals help answer “is this a real opportunity?”',
    summary: 'Use the business tab to understand trust, monetization, audience fit, and brand posture before you spend time on outreach, partnerships, or competitive teardown work.',
    bullets: [
      'Trust score and sentiment are your first risk screen.',
      'Business summary and audience notes speed up qualification.',
      'Ads and monetization patterns reveal how the site captures value.',
    ],
  },
  alternatives: {
    title: 'Use alternatives to map the competitive landscape',
    summary: 'This page lists websites that share audience, category, or technology overlap with the current domain. Use it to discover competitors, substitutes, and adjacent players.',
    bullets: [
      'Compare alternatives by rank and match score to prioritize research.',
      'Open individual reports for any alternative to dig into traffic and trust signals.',
      'Use match reasons to understand why each site was surfaced.',
    ],
  },
};

export function getDirectoryTypeLabel(type: DirectoryType): string {
  return DIRECTORY_SEEDS[type].label;
}

export function getDirectorySeed(type: DirectoryType): DirectorySeed {
  return DIRECTORY_SEEDS[type];
}

export function getDirectoryHubFaqs(): FaqEntry[] {
  return [
    {
      question: 'Why does the directory hub matter?',
      answer: 'It gives visitors a utility-first starting point: browse by market, technology, or topic, then move into live report pages with far more context.',
    },
    {
      question: 'What is the fastest way to use the directory?',
      answer: 'Pick the browse path closest to your job-to-be-done, inspect the preview sites, then open a report and keep navigating through related links.',
    },
  ];
}

export function getDirectoryTypeFaqs(type: DirectoryType): FaqEntry[] {
  return DIRECTORY_TYPE_FAQS[type];
}

export function getDirectoryDetailFaqs(type: DirectoryType, slug: string): FaqEntry[] {
  const displaySlug = toDisplayLabel(slug);
  const shared = DIRECTORY_TYPE_FAQS[type];

  return [
    {
      question: `What can I learn from the ${displaySlug} ${type} page?`,
      answer: `Use this page to scan websites connected to ${displaySlug}, open the strongest candidates, and compare their detailed report modules before making a decision.`,
    },
    ...shared,
  ];
}

export function getDirectoryTypeLinks(): LinkCard[] {
  return DIRECTORY_TYPE_ORDER.map((type) => {
    const seed = DIRECTORY_SEEDS[type];
    return {
      href: `/directory/${type}`,
      label: seed.label,
      description: seed.description,
    };
  });
}

type RelatedDirectoryLinkOptions = {
  type: DirectoryType;
  slug: string;
  items?: DirectoryItem[];
  stats?: DirectoryStats | null;
  limit?: number;
};

function collectCandidateSlugs(values: string[]): string[] {
  return values
    .map((value) => normalizeDirectorySlug(value))
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
}

export function getRelatedDirectoryLinks({
  type,
  slug,
  items = [],
  stats = null,
  limit = 6,
}: RelatedDirectoryLinkOptions): LinkCard[] {
  const links: LinkCard[] = [];
  const seen = new Set<string>();
  const displaySlug = toDisplayLabel(slug);
  const currentSlug = normalizeDirectorySlug(slug);

  const pushLink = (item: LinkCard) => {
    if (seen.has(item.href)) return;
    seen.add(item.href);
    links.push(item);
  };

  pushLink({
    href: `/directory/${type}`,
    label: `More ${getDirectoryTypeLabel(type)}`,
    description: `Return to the ${type} hub and keep browsing adjacent live examples.`,
    eyebrow: 'Hub',
    reason: 'Return to the parent hub when you want a broader cluster view.',
  });

  const topItem = items[0];
  const secondItem = items[1];

  if (topItem?.domain) {
    pushLink({
      href: `/data/${topItem.domain}`,
      label: `Open top ${displaySlug} report`,
      description: `Start with ${topItem.domain} if you want a live report connected to this directory theme.`,
      eyebrow: 'Live report',
      reason: 'The top result is usually the fastest way to understand what this directory represents in practice.',
    });
  }

  if (secondItem?.domain) {
    pushLink({
      href: `/data/${secondItem.domain}`,
      label: `Open another ${displaySlug} example`,
      description: `Use ${secondItem.domain} as a second live report so you can compare patterns inside this directory.`,
      eyebrow: 'Second example',
      reason: 'A second report helps you tell whether the first site is representative or an outlier.',
    });

    const [firstDomain, secondDomain] = [topItem?.domain ?? '', secondItem.domain].sort();
    if (firstDomain && secondDomain) {
      pushLink({
        href: `/compare/${firstDomain}/vs/${secondDomain}`,
        label: 'Compare top examples',
        description: `Move from the list into a side-by-side comparison of ${firstDomain} and ${secondDomain}.`,
        eyebrow: 'Comparison',
        reason: 'Comparisons turn a shortlist into a decision, especially for competitive or qualification work.',
      });
    }
  }

  const technologyCandidates = collectCandidateSlugs([
    ...(stats?.topTechnologies?.map((entry) => entry.name) ?? []),
    ...items.flatMap((item) => item.techStack ?? []),
  ]).filter((candidate) => candidate !== currentSlug).slice(0, 2);

  const topicCandidates = collectCandidateSlugs([
    ...(stats?.topTags?.map((entry) => entry.name) ?? []),
    ...items.flatMap((item) => item.tags ?? []),
  ]).filter((candidate) => candidate !== currentSlug).slice(0, 2);

  const maxPivotDepth = Math.max(technologyCandidates.length, topicCandidates.length);
  for (let index = 0; index < maxPivotDepth; index += 1) {
    const technologyCandidate = technologyCandidates[index];
    if (technologyCandidate) {
      pushLink({
        href: `/directory/technology/${technologyCandidate}`,
        label: `Browse ${toDisplayLabel(technologyCandidate)} websites`,
        description: `Pivot from ${displaySlug} into a technology cluster that overlaps with the current directory.`,
        eyebrow: 'Technology pivot',
        reason: 'Technology pivots help you move from a market list into implementation-specific research.',
      });
    }

    const topicCandidate = topicCandidates[index];
    if (topicCandidate) {
      pushLink({
        href: `/directory/topic/${topicCandidate}`,
        label: `Browse ${toDisplayLabel(topicCandidate)} sites`,
        description: `Open an adjacent topic page related to ${displaySlug} and keep exploring editorial or niche overlap.`,
        eyebrow: 'Topic pivot',
        reason: 'Topic pivots are useful when you want audience or intent context beyond the current list.',
      });
    }
  }

  pushLink({
    href: '/directory',
    label: 'All browse paths',
    description: `Switch out of ${displaySlug} and choose a different starting point.`,
    eyebrow: 'Browse map',
    reason: 'Use the full browse map when you want a different angle on the same market.',
  });

  if (links.length < limit) {
    for (const value of DIRECTORY_TYPE_ORDER) {
      if (value === type) continue;
      const seed = DIRECTORY_SEEDS[value];
      pushLink({
        href: `/directory/${value}/${seed.slug}`,
        label: `${seed.label} examples`,
        description: seed.intent,
        eyebrow: 'Fallback path',
        reason: 'This is a stable adjacent browse path when the current page has limited cluster data.',
      });
      if (links.length >= limit) break;
    }
  }

  return links.slice(0, limit);
}

export function getReportDirectoryLinks(report: SiteReport): LinkCard[] {
  const links: LinkCard[] = [];
  const seen = new Set<string>();

  const pushLink = (href: string, label: string, description: string) => {
    if (seen.has(href)) return;
    seen.add(href);
    links.push({ href, label, description });
  };

  const categorySlug = report.taxonomy?.iabCategory ? normalizeDirectorySlug(report.taxonomy.iabCategory) : '';
  const topicSlug = report.taxonomy?.iabSubCategory ? normalizeDirectorySlug(report.taxonomy.iabSubCategory) : '';
  const techSlugs = (report.meta?.techStackDetected ?? [])
    .map((value) => normalizeDirectorySlug(value))
    .filter(Boolean)
    .slice(0, 2);

  if (categorySlug) {
    pushLink(
      `/directory/category/${categorySlug}`,
      `Browse ${report.taxonomy?.iabCategory} sites`,
      'Move from this single report into the broader market cluster.',
    );
  }

  if (topicSlug) {
    pushLink(
      `/directory/topic/${topicSlug}`,
      `Browse ${report.taxonomy?.iabSubCategory} sites`,
      'Use the topic route when audience and editorial intent matter more than category.',
    );
  }

  for (const techSlug of techSlugs) {
    pushLink(
      `/directory/technology/${techSlug}`,
      `Browse ${toDisplayLabel(techSlug)} websites`,
      'Pivot from one domain into a stack-based discovery path.',
    );
  }

  if (links.length < 3) {
    for (const type of DIRECTORY_TYPE_ORDER) {
      const seed = DIRECTORY_SEEDS[type];
      pushLink(
        `/directory/${type}/${seed.slug}`,
        `Open ${seed.label}`,
        seed.intent,
      );
      if (links.length >= 3) break;
    }
  }

  return links.slice(0, 4);
}

export function getAlternativeLinks(alternatives: AlternativeSite[]): LinkCard[] {
  return alternatives.slice(0, 4).map((alternative) => ({
    href: `/data/${alternative.domain}`,
    label: alternative.domain,
    description: alternative.reasons?.[0] ?? 'Open a related live report and compare it with the current domain.',
  }));
}

export function buildExecutiveSummary(domain: string, report: SiteReport): { title: string; summary: string; bullets: string[] } {
  const category = report.taxonomy?.iabCategory ?? 'an uncategorized property';
  const trustScore = report.aiAnalysis?.risk?.score;
  const monthlyVisits = report.trafficData?.monthlyVisits;
  const techStack = report.meta?.techStackDetected ?? [];
  const visibleTech = techStack.slice(0, 2).join(', ');

  const trafficLine = monthlyVisits
    ? `Traffic signals point to roughly ${formatNumber(monthlyVisits)} monthly visits.`
    : 'Traffic estimates are limited, so use the trust and structure modules first.';

  const trustLine = trustScore != null
    ? `Current AI trust scoring is ${trustScore}/100.`
    : 'Trust scoring is still limited, so review the business and technical modules together.';

  const stackLine = visibleTech
    ? `The stack appears to include ${visibleTech}.`
    : 'Technology detection is incomplete, so infrastructure clues may be more useful than stack tags.';

  return {
    title: `How to read ${domain} quickly`,
    summary: `${domain} looks like ${category.toLowerCase()}. ${trafficLine} ${trustLine}`,
    bullets: [
      stackLine,
      'Open the Traffic tab if you need audience scale and geography before outreach.',
      'Open the Business tab if trust, monetization, or positioning is your first decision filter.',
    ],
  };
}

export function buildComparisonSummary(
  domainA: string,
  reportA: SiteReport,
  domainB: string,
  reportB: SiteReport,
): { title: string; summary: string; bullets: string[] } {
  const visitsA = reportA.trafficData?.monthlyVisits;
  const visitsB = reportB.trafficData?.monthlyVisits;
  const trustA = reportA.aiAnalysis?.risk?.score;
  const trustB = reportB.aiAnalysis?.risk?.score;

  let trafficLine: string;
  if (visitsA != null && visitsB != null) {
    const leader = visitsA >= visitsB ? domainA : domainB;
    trafficLine = `${leader} leads in monthly traffic with ${formatNumber(Math.max(visitsA, visitsB))} visits.`;
  } else {
    trafficLine = 'Traffic data is limited for at least one domain, so compare structure and trust signals instead.';
  }

  let trustLine: string;
  if (trustA != null && trustB != null) {
    const leader = trustA >= trustB ? domainA : domainB;
    trustLine = `${leader} scores higher on AI trust (${Math.max(trustA, trustB)}/100).`;
  } else {
    trustLine = 'Trust scoring is incomplete for one or both domains.';
  }

  return {
    title: `${domainA} vs ${domainB} at a glance`,
    summary: `${trafficLine} ${trustLine}`,
    bullets: [
      'Compare monthly visits, bounce rate, and domain age to understand audience scale.',
      'Use the trust score and category to evaluate positioning and risk.',
      'Open individual reports for deeper analysis on either domain.',
    ],
  };
}

export function getComparisonFaqs(domainA: string, domainB: string): FaqEntry[] {
  return [
    {
      question: `How does ${domainA} compare to ${domainB}?`,
      answer: `This page compares traffic, trust score, technology stack, category, domain age, and engagement metrics between ${domainA} and ${domainB} side by side.`,
    },
    {
      question: 'Which metrics determine the winner in each row?',
      answer: 'Higher monthly visits, higher trust score, and longer domain age are better. Lower bounce rate and lower global rank number are better. Tech stack and category are shown for reference without a winner.',
    },
    {
      question: 'Where does the comparison data come from?',
      answer: 'Data is sourced from SiteJSON reports including traffic estimates, AI-driven trust scoring, DNS records, technology detection, and category taxonomy.',
    },
  ];
}

export function getAlternativesFaqs(domain: string): FaqEntry[] {
  return [
    {
      question: `What are the best alternatives to ${domain}?`,
      answer: `This page lists websites that share audience, category, or technology overlap with ${domain}. Each alternative includes a match score and reasons so you can evaluate relevance quickly.`,
    },
    {
      question: `How are alternatives to ${domain} determined?`,
      answer: 'Alternatives are identified using a combination of category taxonomy, technology stack overlap, traffic patterns, and audience similarity signals from the SiteJSON analysis pipeline.',
    },
    {
      question: 'Can I compare an alternative directly with this domain?',
      answer: `Yes. Click any alternative to open its full report, or use the compare feature to see ${domain} side by side with a competitor.`,
    },
  ];
}

export function buildAlternativesSummary(
  domain: string,
  alternatives: AlternativeSite[],
): { title: string; summary: string; bullets: string[] } {
  const count = alternatives.length;
  const topDomains = alternatives.slice(0, 3).map((a) => a.domain).join(', ');

  return {
    title: `${count} alternatives to ${domain}`,
    summary: count > 0
      ? `We found ${count} websites similar to ${domain}. Top matches include ${topDomains}.`
      : `No alternatives have been identified for ${domain} yet. Try running a fresh analysis.`,
    bullets: [
      'Each alternative is ranked by relevance based on category, audience, and technology overlap.',
      'Open any alternative to see its full SiteJSON report.',
      'Use match reasons to understand why each site was surfaced as a competitor or substitute.',
    ],
  };
}

function toDisplayLabel(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
