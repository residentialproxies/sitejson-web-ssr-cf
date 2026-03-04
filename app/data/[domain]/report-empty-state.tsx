import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ReportEmptyStateProps = {
  domain: string;
  section: string;
};

export function ReportEmptyState({ domain, section }: ReportEmptyStateProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
      <h2 className="text-lg font-medium text-gray-900 mb-1">Report temporarily unavailable</h2>
      <p className="text-sm text-gray-500 mb-5">
        We couldn&apos;t load the {section} data for <span className="font-medium text-gray-700">{domain}</span>. Try running a fresh analysis.
      </p>
      <Link href={`/site/${domain}`}>
        <Button>Analyze {domain}</Button>
      </Link>
    </div>
  );
}
