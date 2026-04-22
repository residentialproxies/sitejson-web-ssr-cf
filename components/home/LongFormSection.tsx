import React from 'react';
import Link from 'next/link';

const comparisonRows = [
  ['Basic lookup tool', 'Single data point', 'Low', 'Weak'],
  ['Manual browsing & guesswork', 'Unstructured impressions', 'Medium', 'None'],
  ['SiteJSON site data', 'Structured JSON — 50+ fields', 'High', 'Strong'],
] as const;

const workflowSteps = [
  'Start with a category, technology, or topic directory to map the landscape before opening any single domain.',
  'Open a live site data report: read traffic estimates, SEO structure, tech stack, DNS, business classification, and trust score together.',
  'Follow the alternatives and related links to explore adjacent domains without losing research context.',
  'When the manual workflow proves useful, step into API access to pull structured JSON at scale.',
] as const;

const researchLinks = [
  { href: '/directory', label: 'Directory hub', detail: 'Start broad — explore by category, technology, or topic.' },
  { href: '/directory/category', label: 'Category paths', detail: 'Browse commercial markets: finance, ecommerce, SaaS, and more.' },
  { href: '/directory/technology', label: 'Technology paths', detail: 'Cluster domains by shared frameworks, CDN, and platforms.' },
  { href: '/directory/topic', label: 'Topic paths', detail: 'Explore niche markets and editorial intent before targeting domains.' },
  { href: '/data/openai.com', label: 'Sample live report', detail: 'See all six site data layers on a recognizable domain.' },
  { href: '/insights', label: 'Insights hub', detail: 'Open broader analysis pages that support repeat research workflows.' },
] as const;

export function LongFormSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Site data — in depth</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
          What structured site data unlocks for professionals.
        </h2>

        <article className="prose prose-slate mt-10 max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
          <h2>What is structured site data?</h2>
          <p>
            <strong>Structured site data</strong> is a domain profile that captures every signal a professional needs
            to make a judgment call about a website: estimated traffic and ranking, SEO structure, technology stack,
            DNS infrastructure, business classification, and legitimacy score — all normalized into a consistent JSON
            object. The goal is not just to identify what a website is, but to give analysts, growth teams, and
            developers the data they need to act with confidence.
          </p>
          <p>
            Most tools in this category return a single metric — a traffic estimate, or a tech signal, or a domain
            age lookup. SiteJSON is different because it aggregates all six layers into one response. You do not need
            to switch tools or join sources manually; the structured JSON contains everything.
          </p>

          <h2>Who uses site data, and for what?</h2>
          <p>
            Growth and sales teams use site data to qualify prospects: verify traffic scale, check tech stack
            compatibility, confirm business category, and assess trust before spending time on outreach. SEO teams
            compare domain data across competitors to find structural gaps. Security teams check trust scores to flag
            risky or fraudulent domains. Developers pull structured site data through the API to enrich CRM records,
            internal tools, and data pipelines.
          </p>
          <p>
            The most powerful use case is workflow-level enrichment — where site data is not a one-time lookup but
            a repeatable layer applied to every domain in a list, a market segment, or a sales sequence. That is
            where the structured JSON format pays off most, because the same fields and schema apply to every domain
            regardless of industry or size.
          </p>

          <h2>Structured site data vs. manual research</h2>
          <div className="not-prose overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Approach</th>
                  <th className="px-4 py-3 font-semibold">Output</th>
                  <th className="px-4 py-3 font-semibold">Decision value</th>
                  <th className="px-4 py-3 font-semibold">Scalability</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row[0]} className="border-t border-slate-200">
                    {row.map((cell, i) => (
                      <td key={`${row[0]}-${i}`} className="px-4 py-3 text-slate-600">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>How to use SiteJSON for research</h2>
          <ol>
            {workflowSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            This flow works whether you are doing a one-off competitive analysis or building a repeatable data
            pipeline. Each step in the manual workflow maps directly to an API endpoint, so moving from research
            mode to automation mode requires no schema translation.
          </p>

          <h2>Why structured data beats one-off lookups</h2>
          <p>
            A lookup that returns a single number tells you something about one domain right now. Structured site
            data tells you the same thing about any domain — consistently, repeatably, and in a format that stacks
            with your existing tools. The six data layers (traffic, SEO, tech, DNS, business, trust) each answer
            a different question, and together they give you a research-grade profile instead of a shallow data point.
          </p>
          <p>
            SiteJSON is useful at the exploratory stage (when you browse directories and open sample reports) and
            at the scale stage (when you pull data through the API for hundreds or thousands of domains). The data
            model does not change between the two — the same JSON you see in the visual report is exactly what the
            API returns.
          </p>

          <h2>Where to start</h2>
          <div className="not-prose grid gap-4 md:grid-cols-2">
            {researchLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-clay-200 hover:shadow-md">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay-700">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </Link>
            ))}
          </div>
          <p>
            The fastest path: open the <Link href="/directory">directory</Link>, then a
            {' '}<Link href="/data/openai.com">live domain report</Link>, then one of the{' '}
            <Link href="/directory/technology">technology directories</Link> or{' '}
            <Link href="/directory/topic">topic paths</Link>. That sequence mirrors how analysts
            actually work — discovery, then depth, then context.
          </p>
        </article>
      </div>
    </section>
  );
}
