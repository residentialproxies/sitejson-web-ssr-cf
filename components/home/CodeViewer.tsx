"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CodeViewerProps {
  domain: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ domain }) => {
  const [activeTab, setActiveTab] = useState<'json' | 'curl' | 'node'>('json');
  const [copied, setCopied] = useState(false);
  const safeDomain = domain || 'example.com';
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonResponse = useMemo(() => ({
    domain: safeDomain,
    updated_at: "2025-01-15T10:42:00Z",
    radar: {
      global_rank: 854,
      rank_bucket: "Top 1k"
    },
    traffic_data: {
      monthly_visits: 1500000,
      bounce_rate: 45.2,
      top_country: "United States"
    },
    ai_analysis: {
      classification: {
        category: "Technology",
        tags: ["SaaS", "B2B"]
      },
      risk: {
        is_spam: false,
        sentiment: "Professional",
        score: 98
      }
    },
    meta: {
      tech_stack_detected: ["Next.js", "React"]
    }
  }), [safeDomain]);

  const getCode = () => {
    switch (activeTab) {
      case 'curl':
        return `curl -X GET "https://api.sitejson.com/v1/site?domain=${safeDomain}" \\
  -H "Authorization: Bearer sk_live_..."`;
      case 'node':
        return `import { SiteJson } from 'sitejson';

const client = new SiteJson('sk_live_...');
const data = await client.get('${safeDomain}');
console.log(data.radar.global_rank);`;
      default:
        return JSON.stringify(jsonResponse, null, 2);
    }
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-[#0f172a] border border-slate-800 shadow-2xl flex flex-col font-mono text-sm">
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center bg-slate-900/50 rounded-lg p-1 text-xs font-medium text-slate-400">
          <button 
            onClick={() => setActiveTab('json')}
            className={cn("px-3 py-1 rounded-md transition-all", activeTab === 'json' ? "bg-slate-700 text-white shadow-sm" : "hover:text-white")}
          >
            Response
          </button>
          <button 
            onClick={() => setActiveTab('curl')}
            className={cn("px-3 py-1 rounded-md transition-all", activeTab === 'curl' ? "bg-slate-700 text-white shadow-sm" : "hover:text-white")}
          >
            cURL
          </button>
          <button 
            onClick={() => setActiveTab('node')}
            className={cn("px-3 py-1 rounded-md transition-all", activeTab === 'node' ? "bg-slate-700 text-white shadow-sm" : "hover:text-white")}
          >
            Node
          </button>
        </div>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          title={copied ? 'Copied' : 'Copy code'}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <span className="sr-only">{copied ? 'Copied' : 'Copy code'}</span>
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
        </button>
      </div>

      {/* Code Area */}
      <div className="flex-1 p-6 overflow-auto custom-scrollbar relative">
        <AnimatePresence mode="wait" initial={!prefersReducedMotion}>
          <motion.div
            key={activeTab + domain}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute inset-0 p-6"
          >
            <pre className="leading-relaxed whitespace-pre-wrap break-all">
              {activeTab === 'json' ? (
                 <JsonSyntaxHighlight data={jsonResponse} />
              ) : (
                <code className="text-blue-100/90">{getCode()}</code>
              )}
            </pre>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const JsonSyntaxHighlight: React.FC<{ data: unknown }> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2);
  
  // Simple regex parser for basic highlighting
  const lines = jsonString.split('\n');
  
  return (
    <code>
      {lines.map((line, i) => {
        const parts = line.split(':');
        return (
          <div key={i} className="table-row">
            {parts.length > 1 ? (
              <>
                <span className="text-sky-300">{parts[0]}:</span>
                <span className="text-emerald-300 pl-1">{parts.slice(1).join(':')}</span>
              </>
            ) : (
              <span className={line.trim() === '{' || line.trim() === '}' || line.trim() === '},' ? "text-slate-500" : "text-sky-300"}>
                {line}
              </span>
            )}
            {/* Add dummy comments for demo feeling */}
            {line.includes("global_rank") && <span className="text-slate-600 ml-4 hidden md:inline">{'// Cloudflare Radar'}</span>}
            {line.includes("monthly_visits") && <span className="text-slate-600 ml-4 hidden md:inline">{'// Est. Monthly'}</span>}
            {line.includes("tech_stack_detected") && <span className="text-slate-600 ml-4 hidden md:inline">{'// Wappalyzer Core'}</span>}
          </div>
        )
      })}
    </code>
  );
};
