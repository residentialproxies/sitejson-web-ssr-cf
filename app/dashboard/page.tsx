import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { KeyRound, BarChart3, Gauge, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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

  return (
    <main className="min-h-[calc(100vh-10rem)] bg-slate-50 py-12">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 rounded-2xl border border-clay-200 bg-white p-7 shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-clay-600">Signed in with GitHub</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome back, {session.name ?? session.login}
          </h1>
          <p className="mt-2 text-slate-600">
            Plan: <span className="font-semibold capitalize">{session.plan}</span> (200 req/min)
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/playground">
              <Button variant="clay">Try API Playground</Button>
            </a>
            <a href="/api/auth/logout">
              <Button variant="outline">Logout</Button>
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <KeyRound size={18} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">API Key Management</h2>
            <p className="mt-2 text-sm text-slate-600">
              Placeholder: generate/revoke keys and rotate credentials from this dashboard.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BarChart3 size={18} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Usage Tracking</h2>
            <p className="mt-2 text-sm text-slate-600">
              Placeholder: per-key request volume, status codes, and hourly trend charts.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Gauge size={18} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Rate Limit Status</h2>
            <p className="mt-2 text-sm text-slate-600">
              Current entitlement: <span className="font-medium">200 req/min</span>.
            </p>
          </section>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ShieldCheck size={16} />
            Next step
          </div>
          <p className="text-sm text-slate-600">
            We are currently keeping pricing simple: free anonymous and free GitHub plans only. Pro billing is intentionally not enabled yet.
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
