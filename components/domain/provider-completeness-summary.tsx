import type { SiteProviderSummaryItem } from '@/lib/api-client/types';

const pct = (value: number) => `${Math.round(value * 100)}%`;

type ProviderDataSummaryProps = {
  providers: SiteProviderSummaryItem[];
};

export function ProviderDataSummary({ providers }: ProviderDataSummaryProps) {
  if (!providers || providers.length === 0) {
    return null;
  }

  const totals = providers.reduce(
    (acc, item) => {
      acc.fields += item.completeness.total;
      acc.present += item.completeness.present;
      return acc;
    },
    { fields: 0, present: 0 },
  );

  if (totals.fields === 0) {
    return null;
  }

  const ratio = totals.present / totals.fields;
  const providersWithGaps = providers.filter((item) => item.completeness.missing > 0);
  const width = Math.max(2, Math.round(ratio * 100));

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Provider Completeness</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {totals.present}/{totals.fields} fields populated ({pct(ratio)})
          </p>
        </div>
        <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {providers.length} providers
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${width}%` }} />
      </div>

      {providersWithGaps.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Providers with missing fields</p>
          <div className="flex flex-wrap gap-1.5">
            {providersWithGaps.map((item) => (
              <span
                key={item.provider}
                className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
              >
                {item.provider}: {item.completeness.present}/{item.completeness.total}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <details className="mt-3">
        <summary className="cursor-pointer select-none text-xs text-blue-700 hover:text-blue-800">
          View field-level status
        </summary>
        <div className="mt-2 space-y-2">
          {providers.map((item) => {
            const missingFields = Object.entries(item.completeness.fields)
              .filter(([, ok]) => !ok)
              .map(([field]) => field);
            return (
              <div key={item.provider} className="rounded border border-gray-200 p-2">
                <p className="text-xs font-medium text-gray-800">
                  {item.provider}: {item.completeness.present}/{item.completeness.total}
                </p>
                {missingFields.length > 0 ? (
                  <p className="text-xs text-gray-500 mt-1">
                    Missing: {missingFields.join(', ')}
                  </p>
                ) : (
                  <p className="text-xs text-emerald-600 mt-1">All expected fields present</p>
                )}
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
