export type ParamDef = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
};

export type BodyField = {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
};

export type Endpoint = {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  category: string;
  title: string;
  description: string;
  pathParams?: ParamDef[];
  queryParams?: ParamDef[];
  bodySchema?: BodyField[];
  exampleBody?: Record<string, unknown>;
  visualize?: 'provider-summary' | 'provider-detail';
};

export const ENDPOINT_CATEGORIES = [
  'Analysis',
  'Sites',
  'Providers',
  'Jobs',
  'Directory',
  'Ops',
  'Health',
] as const;

const providerDomainParam: ParamDef = {
  name: 'domain',
  label: 'Domain',
  placeholder: 'example.com',
  required: true,
};

export const endpoints: Endpoint[] = [
  // Analysis
  {
    id: 'analyze',
    method: 'POST',
    path: '/api/sitejson/analyze',
    category: 'Analysis',
    title: 'Analyze Domain',
    description: 'Trigger a full domain analysis. Returns a job ID for polling.',
    bodySchema: [
      { name: 'domain', label: 'Domain', type: 'string', required: true, placeholder: 'example.com' },
      { name: 'force', label: 'Force re-crawl', type: 'boolean', defaultValue: 'false' },
    ],
    exampleBody: { domain: 'example.com', force: false },
  },
  {
    id: 'ingest-domains',
    method: 'POST',
    path: '/api/sitejson/ingest/domains',
    category: 'Analysis',
    title: 'Batch Ingest',
    description: 'Submit multiple domains for scheduled ingestion.',
    bodySchema: [
      { name: 'domains', label: 'Domains (JSON array)', type: 'json', required: true, placeholder: '["example.com", "test.org"]' },
    ],
    exampleBody: { domains: ['example.com', 'test.org'] },
  },

  // Sites
  {
    id: 'get-site',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}',
    category: 'Sites',
    title: 'Get Site Report',
    description: 'Retrieve the full analysis report for a domain.',
    pathParams: [providerDomainParam],
  },
  {
    id: 'get-alternatives',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/alternatives',
    category: 'Sites',
    title: 'Get Alternatives',
    description: 'Get similar/alternative sites for a domain.',
    pathParams: [providerDomainParam],
  },

  // Providers
  {
    id: 'providers-summary',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers',
    category: 'Providers',
    title: 'All Providers',
    description: 'Overview of all 11 providers with field completeness for a domain.',
    pathParams: [providerDomainParam],
    visualize: 'provider-summary',
  },
  {
    id: 'provider-visual',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/visual',
    category: 'Providers',
    title: '1. Visual',
    description: 'Screenshots + dominant color + palette',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-meta',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/meta',
    category: 'Providers',
    title: '2. Meta',
    description: 'Title + description + tech stack',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-seo',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/seo',
    category: 'Providers',
    title: '3. SEO',
    description: 'Headings + links + contacts',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-dns',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/dns',
    category: 'Providers',
    title: '4. DNS',
    description: 'DNS records (MX, NS, TXT)',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-ads',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/ads',
    category: 'Providers',
    title: '5. Ads',
    description: 'Google Ads transparency data',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-publisher',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/publisher',
    category: 'Providers',
    title: '6. Publisher',
    description: 'ads.txt parsing results',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-files',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/files',
    category: 'Providers',
    title: '7. Files',
    description: 'robots.txt + sitemap.xml presence',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-traffic',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/traffic',
    category: 'Providers',
    title: '8. Traffic',
    description: 'SimilarWeb traffic metrics',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-radar',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/radar',
    category: 'Providers',
    title: '9. Radar',
    description: 'Cloudflare Radar ranking',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-ai',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/ai',
    category: 'Providers',
    title: '10. AI',
    description: 'IAB taxonomy + business analysis + risk',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },
  {
    id: 'provider-whois',
    method: 'GET',
    path: '/api/sitejson/sites/{domain}/providers/whois',
    category: 'Providers',
    title: '11. Whois',
    description: 'Domain registration (RDAP/WHOIS)',
    pathParams: [providerDomainParam],
    visualize: 'provider-detail',
  },

  // Jobs
  {
    id: 'get-job',
    method: 'GET',
    path: '/api/sitejson/jobs/{jobId}',
    category: 'Jobs',
    title: 'Poll Job Status',
    description: 'Check the status and result of an analysis job.',
    pathParams: [
      { name: 'jobId', label: 'Job ID', placeholder: 'job_abc123', required: true },
    ],
  },

  // Directory
  {
    id: 'directory',
    method: 'GET',
    path: '/api/sitejson/directory/{type}/{slug}',
    category: 'Directory',
    title: 'Directory Listing',
    description: 'Browse sites by category, technology, or country.',
    pathParams: [
      { name: 'type', label: 'Type', placeholder: 'category', required: true },
      { name: 'slug', label: 'Slug', placeholder: 'technology', required: true },
    ],
    queryParams: [
      { name: 'page', label: 'Page', placeholder: '1', defaultValue: '1' },
      { name: 'page_size', label: 'Page Size', placeholder: '20', defaultValue: '20' },
    ],
  },

  // Ops
  {
    id: 'ops-dashboard',
    method: 'GET',
    path: '/api/sitejson/ops/dashboard',
    category: 'Ops',
    title: 'Ops Dashboard',
    description: 'Get operational dashboard stats (sites, jobs, queues).',
  },
  {
    id: 'ops-queues',
    method: 'GET',
    path: '/api/sitejson/ops/queues',
    category: 'Ops',
    title: 'Queue Stats',
    description: 'Get detailed queue statistics for all workers.',
  },
  {
    id: 'ops-retry-dlq',
    method: 'POST',
    path: '/api/sitejson/ops/retry-dlq',
    category: 'Ops',
    title: 'Retry DLQ',
    description: 'Retry failed jobs from the dead-letter queue.',
    bodySchema: [
      { name: 'queue', label: 'Queue Name', type: 'string', placeholder: 'browser' },
      { name: 'limit', label: 'Max jobs to retry', type: 'number', placeholder: '10', defaultValue: '10' },
    ],
    exampleBody: { queue: 'browser', limit: 10 },
  },

  // Health
  {
    id: 'healthz',
    method: 'GET',
    path: '/api/sitejson/health',
    category: 'Health',
    title: 'Health Check',
    description: 'Basic health check — is the API process alive?',
  },
  {
    id: 'readyz',
    method: 'GET',
    path: '/api/sitejson/health?check=ready',
    category: 'Health',
    title: 'Readiness Check',
    description: 'Readiness check — are all dependencies (DB, Redis, queues) connected?',
  },
];
