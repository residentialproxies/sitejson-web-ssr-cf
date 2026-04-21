import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChartBar as BarChart3, Clock3, Coins, Gauge, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TokenDisplay } from '@/components/dashboard/TokenDisplay';
import { BILLING_MODE_MANUAL, FREE_STARTER_CREDITS, PRO_MONTHLY_QUOTA, SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import {
  getUserEntitlements,
  isAccountEntitlementsConfigurationError,
} from '@/lib/entitlements';
import {
  isStarterCreditsConfigurationError,
  listRecentStarterCreditActivity,
} from '@/lib/starter-credits';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your SiteJSON API access and account entitlements.',
  robots: {
    index: false,
    follow: false,
  },
};

const formatDateTime = (value: string | null): string => {
  if (!value) return 'No active Pro billing cycle';
  return new Date(value).toLocaleString('en-US', {
    hour12: false,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/api/auth/github/start');
  }

  const session = await verifySessionToken(token);
  if (!session) {
    redirect('/api/auth/github/start');
  }

  let entitlements: Awaited<ReturnType<typeof getUserEntitlements>> | null = null;
  let recentActivity: Awaited<ReturnType<typeof listRecentStarterCreditActivity>> = [];
  let entitlementError: string | null = null;

  try {
    [entitlements, recentActivity] = await Promise.all([
      getUserEntitlements({
        sub: session.sub,
        login: session.login,
      }),
      listRecentStarterCreditActivity(
        {
          sub: session.sub,
          login: session.login,
          plan: 'free',
        },
        6,
      ),
    ]);
  } catch (error) {
    if (isStarterCreditsConfigurationError(error) || isAccountEntitlementsConfigurationError(error)) {
      entitlementError = error.message;
    } else {
      throw error;
    }
  }

  return (
    <main className="min-h-[calc(100vh-10rem)] bg-slate-50 py-12">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 rounded-2xl border border-clay-200 bg-white p-7 shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-clay-600">Signed in with GitHub</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome back, {session.name ?? session.login}
          </h1>
          <p className="mt-2 text-slate-600">
            Your current plan is <span className="font-semibold capitalize">{entitlements?.plan ?? 'free'}</span> with a{' '}
            <span className="font-semibold">{entitlements?.rateLimitPerMinute ?? 10} req/min</span> API key entitlement.
          </p>
          {entitlements ? (
            <p className="mt-3 text-sm text-slate-600">
              Free starter remaining:{' '}
              <span className="font-semibold text-slate-900">{entitlements.starterCredits.remainingCredits}</span>
              {' '}of {entitlements.starterCredits.totalCredits}. Pro monthly remaining:{' '}
              <span className="font-semibold text-slate-900">{entitlements.monthlyQuota.remaining}</span>
              {entitlements.monthlyQuota.active ? ` of ${entitlements.monthlyQuota.total}` : ` of ${PRO_MONTHLY_QUOTA} when Pro is active`}.
            </p>
          ) : null}
          {entitlementError ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Entitlements are not fully configured yet: {entitlementError}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/api/auth/github/start">
              <Button variant="clay">Refresh GitHub Session</Button>
            </a>
            <a href="/api/auth/logout">
              <Button variant="outline">Logout</Button>
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Coins size={18} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Free Starter</h2>
            <p className="mt-2 text-sm text-slate-600">
              GitHub sign-in grants a one-time <span className="font-medium">{FREE_STARTER_CREDITS} request</span> starter balance.
            </p>
            {entitlements ? (
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-medium">{entitlements.starterCredits.remainingCredits}</span> remaining ·{' '}
                <span className="font-medium">{entitlements.starterCredits.usedCredits}</span> used
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <KeyRound size={18} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">API Key</h2>
            <p className="mt-2 text-sm text-slate-600">
              Use this signed key with <span className="font-mono">Authorization: Bearer ...</span> or <span className="font-mono">x-api-key</span>.
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Auth provider: <span className="font-medium capitalize">{session.authProvider}</span>
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Gauge size={18} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Rate Limit</h2>
            <p className="mt-2 text-sm text-slate-600">
              Current entitlement: <span className="font-medium">{entitlements?.rateLimitPerMinute ?? 10} req/min</span>.
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Plan: <span className="font-medium capitalize">{entitlements?.plan ?? 'free'}</span>
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Clock3 size={18} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Pro Monthly Quota</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pro includes <span className="font-medium">{PRO_MONTHLY_QUOTA} requests per billing cycle</span> with manual activation for now.
            </p>
            {entitlements ? (
              <p className="mt-3 text-sm text-slate-700">
                {entitlements.monthlyQuota.active
                  ? `${entitlements.monthlyQuota.remaining} remaining · resets ${formatDateTime(entitlements.monthlyQuota.resetAt)}`
                  : 'No active Pro billing cycle yet.'}
              </p>
            ) : null}
          </section>
        </div>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ShieldCheck size={16} />
            API key
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Anonymous API access is disabled. Send this key on every request to <span className="font-mono">/api/sitejson/*</span>.
          </p>
          <TokenDisplay token={token} />
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BarChart3 size={16} />
              Usage tracking
            </div>
            <p className="text-sm text-slate-600">
              Free starter calls are written to the starter ledger before proxying. Active Pro users consume their monthly quota first and preserve any leftover starter balance.
            </p>
            {recentActivity.length > 0 ? (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-3 py-2">
                    <div>
                      <p className="font-medium text-slate-900">{item.reason === 'starter_grant' ? 'Starter grant' : item.endpoint}</p>
                      <p className="text-xs text-slate-500">{item.method} · {new Date(item.createdAt).toLocaleString('en-US', { hour12: false })}</p>
                    </div>
                    <div className="text-right">
                      <p className={item.delta < 0 ? 'font-medium text-amber-700' : 'font-medium text-emerald-700'}>
                        {item.delta > 0 ? '+' : ''}
                        {item.delta}
                      </p>
                      <p className="text-xs text-slate-500">Balance {item.balanceAfter}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock3 size={16} />
              Billing & Upgrade
            </div>
            <p className="text-sm text-slate-600">
              Billing mode is <span className="font-medium uppercase">{BILLING_MODE_MANUAL}</span>. Public checkout stays offline until the payment provider is connected.
            </p>
            <p className="mt-3 text-sm text-slate-600">
              For now, Pro activation is handled manually and grants {PRO_MONTHLY_QUOTA} requests per billing cycle at 100 req/min.
            </p>
            <p className="mt-3 text-sm">
              <a href="mailto:hello@sitejson.com?subject=Activate%20SiteJSON%20Pro" className="font-medium text-clay-700 hover:underline">
                Request manual Pro activation
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ShieldCheck size={16} />
            Next step
          </div>
          <p className="text-sm text-slate-600">
            Free access is active now with a session-backed API key. Payments are not wired yet, but the Pro plan model, monthly quota tracking, and billing-cycle reset logic are now part of the product foundation.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/#pricing" className="font-medium text-clay-700 hover:underline">
              Review plan details on the pricing section
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
