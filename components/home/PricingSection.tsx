import React from 'react';
import { Check, ArrowRight, Github, KeyRound, Rocket, BookOpen } from 'lucide-react';
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
  icon: React.ElementType;
  features: string[];
};

const plans: PricingPlan[] = [
  {
    name: 'Docs & Demo',
    price: '$0 / month',
    subtitle: 'Explore the product before requesting API access',
    ctaLabel: 'View Live Example',
    ctaHref: '/data/openai.com',
    ctaVariant: 'outline',
    icon: BookOpen,
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
    price: '$0 / month',
    subtitle: 'GitHub login unlocks your signed API key instantly',
    badge: 'Recommended',
    ctaLabel: 'Get API Key with GitHub',
    ctaHref: '/api/auth/github/start',
    ctaVariant: 'clay',
    icon: Github,
    features: [
      `${FREE_STARTER_CREDITS} one-time starter requests`,
      `${FREE_RATE_LIMIT_RPM} req/min rate limit`,
      'Signed API key on sign-in',
      'Personal usage dashboard',
      'Starter quota visibility',
      'No credit card required',
    ],
  },
  {
    name: 'Pro',
    price: 'Manual activation',
    subtitle: 'For teams and high-volume use cases',
    ctaLabel: 'Request Pro Access',
    ctaHref: 'mailto:hello@sitejson.com?subject=Activate%20SiteJSON%20Pro',
    ctaVariant: 'outline',
    icon: Rocket,
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
    <section id="pricing" className="relative overflow-hidden border-t border-ink-200 bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(217,119,87,0.09),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(139,154,109,0.08),transparent_38%)]" />

      <div className="container relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-clay-600">Pricing</p>
          <h2 className="mb-4 text-4xl font-medium text-ink-900 md:text-5xl">
            Free to explore.<br />
            <span className="text-ink-500">Sign in to build.</span>
          </h2>
          <p className="text-lg leading-relaxed text-ink-600">
            Browse every report and directory without an account. Sign in with GitHub to unlock {FREE_STARTER_CREDITS} API requests, a signed key, and {FREE_RATE_LIMIT_RPM} req/min — no credit card needed.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-600">
              {FREE_STARTER_CREDITS} starter requests
            </span>
            <span className="rounded-full border border-sage-300 bg-sage-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-700">
              API key required
            </span>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Pro checkout coming soon
            </span>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          {plans.map((plan) => {
            const highlighted = plan.name === 'Free';
            const PlanIcon = plan.icon;

            return (
              <article
                key={plan.name}
                className={[
                  'relative rounded-2xl border bg-white p-7 transition-all',
                  highlighted
                    ? 'border-clay-300 shadow-2xl shadow-clay-200/40 lg:-translate-y-3'
                    : 'border-ink-200 shadow-sm hover:-translate-y-1 hover:shadow-md',
                ].join(' ')}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-6 rounded-full bg-clay-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${highlighted ? 'bg-clay-100 text-clay-700' : 'bg-slate-100 text-slate-600'}`}>
                    <PlanIcon size={18} />
                  </div>
                  <h3 className="mb-1 text-xl font-semibold text-ink-900">{plan.name}</h3>
                  <p className="font-mono text-lg font-bold tracking-tight text-ink-800">{plan.price}</p>
                  <p className="mt-1.5 text-sm leading-6 text-ink-500">{plan.subtitle}</p>
                </div>

                <ul className="mb-8 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-700">
                      <Check size={15} className={`mt-0.5 shrink-0 ${highlighted ? 'text-clay-600' : 'text-sage-600'}`} />
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
                    {plan.name === 'Free' && <KeyRound size={15} />}
                    {plan.ctaLabel}
                    <ArrowRight size={15} />
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
