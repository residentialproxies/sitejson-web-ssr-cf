import React from 'react';
import { Check, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '../ui/Button';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS, PRO_MONTHLY_QUOTA, PRO_RATE_LIMIT_RPM } from '@/lib/auth/session';

type PricingPlan = {
  name: string;
  price: string;
  subtitle: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaVariant: 'clay' | 'outline';
  features: string[];
};

const plans: PricingPlan[] = [
  {
    name: 'Docs & Demo',
    price: '$0 /month',
    subtitle: 'Explore the product before requesting API access',
    ctaLabel: 'View Live Example',
    ctaHref: '/data/openai.com',
    ctaVariant: 'outline',
    features: [
      'Public documentation access',
      'Live directory and site examples',
      'Reference payload previews',
      'No anonymous API requests',
      'Upgrade path via GitHub login',
      'Manual Pro activation available',
    ],
  },
  {
    name: 'Free',
    price: '$0 /month',
    subtitle: 'GitHub login unlocks your free API key',
    badge: 'Recommended',
    ctaLabel: 'Get API Key with GitHub',
    ctaHref: '/api/auth/github/start',
    ctaVariant: 'clay',
    features: [
      `${FREE_STARTER_CREDITS} one-time starter requests`,
      `${FREE_RATE_LIMIT_RPM} req/min rate limit`,
      'Signed API key',
      'Personal dashboard',
      'Starter usage visibility',
      'No credit card required',
    ],
  },
  {
    name: 'Pro',
    price: 'Manual activation',
    subtitle: 'For teams and power users',
    ctaLabel: 'Request Pro Access',
    ctaHref: 'mailto:hello@sitejson.com?subject=Activate%20SiteJSON%20Pro',
    ctaVariant: 'outline',
    features: [
      `${PRO_MONTHLY_QUOTA} requests per billing cycle`,
      `${PRO_RATE_LIMIT_RPM} req/min rate limit`,
      'Manual activation for now',
      'Billing integration coming soon',
      'Priority support',
      'Team-friendly upgrade path',
    ],
  },
];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="relative overflow-hidden border-y border-ink-200 bg-white py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(217,119,87,0.11),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(139,154,109,0.1),transparent_36%)]" />
      <div className="container relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-clay-200 bg-clay-50 px-4 py-1.5 text-sm font-medium text-clay-700">
            <ShieldCheck size={16} />
            Simple, Transparent Pricing
          </div>
          <h2 className="mb-4 text-4xl font-medium text-ink-900 md:text-5xl">
            GitHub login unlocks the API.
          </h2>
          <p className="text-lg leading-relaxed text-ink-600">
            Anonymous API access is disabled. Sign in with GitHub to receive {FREE_STARTER_CREDITS} one-time starter
            requests, a signed API key, and {FREE_RATE_LIMIT_RPM} req/min. Pro adds {PRO_MONTHLY_QUOTA} requests per
            billing cycle at {PRO_RATE_LIMIT_RPM} req/min.
          </p>
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-600">
              {FREE_STARTER_CREDITS} one-time starter requests
            </span>
            <span className="rounded-full border border-sage-300 bg-sage-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-700">
              API key required
            </span>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Pro checkout coming later
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const highlighted = plan.name === 'Free';

            return (
              <article
                key={plan.name}
                className={[
                  'relative rounded-2xl border bg-white p-7 shadow-sm transition-all',
                  highlighted
                    ? 'border-clay-300 shadow-xl shadow-clay-200/50 lg:-translate-y-2'
                    : 'border-ink-200 hover:-translate-y-1 hover:shadow-md',
                ].join(' ')}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-6 rounded-full bg-clay-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5 flex min-h-[86px] flex-col justify-between">
                  <h3 className="mb-1 text-2xl font-medium text-ink-900">{plan.name}</h3>
                  <p className="font-mono text-xl font-semibold tracking-tight text-ink-800">{plan.price}</p>
                  <p className="mt-1 text-sm text-ink-500">{plan.subtitle}</p>
                </div>

                <ul className="mb-8 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-700">
                      <Check size={16} className="mt-0.5 shrink-0 text-sage-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a href={plan.ctaHref} className="block">
                  <Button
                    variant={plan.ctaVariant}
                    size="md"
                    className="w-full justify-center font-semibold"
                    shimmer={highlighted}
                  >
                    {plan.name === 'Free' && <KeyRound size={16} />}
                    {plan.ctaLabel}
                    <ArrowRight size={16} />
                  </Button>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
