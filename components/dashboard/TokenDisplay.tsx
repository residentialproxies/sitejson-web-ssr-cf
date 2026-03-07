'use client';

import { useState } from 'react';
import { ClipboardCopy, Check } from 'lucide-react';

export function TokenDisplay({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const masked = token.length > 12
    ? `${token.slice(0, 10)}${'*'.repeat(6)}${token.slice(-4)}`
    : token;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4">
      <code className="break-all text-xs text-slate-100">{masked}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        aria-label={copied ? 'Copied' : 'Copy token'}
      >
        {copied ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <Check size={14} />
            <span className="text-xs">Copied!</span>
          </span>
        ) : (
          <ClipboardCopy size={14} />
        )}
      </button>
    </div>
  );
}
