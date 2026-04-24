import React from 'react';
import Link from 'next/link';

const comparisonRows = [
  ['Basic lookup tool', 'Single-page answer', 'Low', 'Weak'],
  ['Marketing landing page', 'Product promise only', 'Medium', 'Medium'],
  ['SiteJSON research workflow', 'Directory → report → alternatives', 'High', 'Strong'],
] as const;

const workflowSteps = [
  'Start with a category, technology, or topic hub to frame the question before you open any single domain.',
  'Open a live report and read SEO, traffic, tech, business, and trust signals together — not in isolation.',
  'Use related resources and alternatives to branch into adjacent domains, then compare what changes and what stays consistent.',
  'Move into API access only after the manual workflow proves genuine value for your team or product use case.',
] as const;

const researchLinks = [
  { href: '/directory', label: 'Directory hub', detail: 'Start broad when you need market or category context.' },
  { href: '/directory/category', label: 'Category paths', detail: 'Browse commercial markets like finance, e-commerce, or SaaS.' },
  { href: '/directory/technology', label: 'Technology paths', detail: 'See which frameworks and platforms cluster together.' },
  { href: '/directory/topic', label: 'Topic paths', detail: 'Explore niche and editorial intent before picking target domains.' },
  { href: '/data/openai.com', label: 'Sample live report', detail: 'See how a recognizable site reads across all modules.' },
  { href: '/insights', label: 'Insights hub', detail: 'Open broader analysis pages that support repeat research.' },
] as const;

export function LongFormSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-clay-600">Long-form context</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
          A professional site-data platform reads like an analyst playbook.
        </h2>

        <article className="prose prose-slate mt-10 max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
          <h2>What is website intelligence?</h2>
          <p>
            <strong>Website intelligence</strong> is the practice of turning a domain into structured evidence about
            market position, search visibility, technical maturity, business intent, and trust posture. The goal is not
            merely to identify a website, but to help a professional decide what that website <em>means</em> within a research,
            sales, SEO, or competitive workflow.
          </p>
          <p>
            Most tools in this category stop too early. They behave like simple lookup utilities or thin landing pages
            that promise data without showing how a visitor should act on it. SiteJSON is most valuable when it works
            like a guided research environment: start with discovery, open a live report, branch into alternatives,
            and move into API automation only after the manual workflow proves genuinely useful.
          </p>

          <h2>How professional teams use SiteJSON</h2>
          <p>
            Experienced researchers, growth teams, and SEO operators rarely make decisions from a single metric. They
            want a compact but credible view of a domain: how much traffic it likely attracts, how clearly it is
            structured for search, what technology it runs on, how trustworthy the brand appears, and which adjacent
            websites deserve review next. That is why the homepage emphasizes research paths over generic call-to-action copy.
          </p>
          <p>
            The strongest product message is not &ldquo;we have data.&rdquo; It is &ldquo;we help you move from uncertainty to a better
            decision.&rdquo; Directory hubs create a high-level map. Domain reports provide structured evidence. Alternatives
            and related links preserve research momentum. Together, those layers form a pSEO system that is genuinely
            useful to both humans and search engines because each page has a clear job in the journey.
          </p>

          <h2>Lookup pages vs. a real research workflow</h2>
          <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Experience</th>
                  <th className="px-4 py-3 font-semibold">Primary output</th>
                  <th className="px-4 py-3 font-semibold">Decision value</th>
                  <th className="px-4 py-3 font-semibold">SEO durability</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row[0]} className={`border-t border-slate-200 ${i === comparisonRows.length - 1 ? 'bg-clay-50/60' : ''}`}>
                    {row.map((cell, j) => (
                      <td key={cell} className={`px-4 py-3 text-slate-600 ${j === 0 && i === comparisonRows.length - 1 ? 'font-semibold text-slate-900' : ''}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>How to use SiteJSON like a data analyst</h2>
          <ol>
            {workflowSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            This flow is especially powerful for programmatic SEO and aggregation products because it prevents every
            page from becoming an isolated dead end. The hub page teaches discovery. The report page teaches
            interpretation. The alternatives layer enables comparison. Search engines understand the hierarchy, and
            visitors stay longer because the next action is always obvious.
          </p>

          <h2>Why professional pSEO depends on aggregation quality</h2>
          <p>
            Aggregation works only when pages are more useful together than in isolation. A thin directory can be
            crawled, but it does not earn trust. A thin report may rank for a specific domain, but it will not build
            authority. A strong pSEO system uses repeatable templates without sounding templated — distinct page
            intents, stronger summaries, better internal links, and content that explains <em>how</em> data should be read.
          </p>
          <p>
            SiteJSON is well-positioned here because the product already has multiple reusable surfaces: browse hubs,
            domain reports, subpages for traffic and SEO, alternatives, compare views, and insights. The right strategy
            is to make each of those pages feel like a professional extension of the same research system. Once that is
            true, organic traffic becomes more qualified because the page experience matches the intent behind the query.
          </p>

          <h2>Where to go next</h2>
          <div className="not-prose grid gap-4 md:grid-cols-2">
            {researchLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-clay-200 hover:shadow-md">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-clay-700">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </Link>
            ))}
          </div>
          <p>
            The fastest path to understanding the product: open the <Link href="/directory">directory hub</Link>, then
            a <Link href="/data/openai.com">live domain report</Link>, then one of the{' '}
            <Link href="/directory/technology">technology directories</Link> or{' '}
            <Link href="/directory/topic">topic paths</Link>. That sequence mirrors how an analyst actually works — and it
            gives search visitors a clear reason to keep exploring.
          </p>
        </article>
      </div>
    </section>
  );
}
