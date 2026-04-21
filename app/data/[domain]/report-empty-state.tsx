import Link from 'next/link';
import { CircleAlert as AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ReportEmptyStateProps = {
  domain: string;
  section: string;
};

export function ReportEmptyState({ domain, section }: ReportEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
        <AlertCircle className="h-7 w-7 text-amber-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">Report temporarily unavailable</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
        We couldn&apos;t load the {section} data for <span className="font-medium text-slate-700">{domain}</span>.
        This can happen when a site has never been analyzed or if the data is still being processed.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={`/site/${domain}`}>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Analyze {domain}
          </Button>
        </Link>
        <Link href="/directory">
          <Button variant="outline" className="gap-2">
            Browse directory
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
