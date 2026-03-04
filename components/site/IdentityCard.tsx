import React from 'react';
import Image from 'next/image';
import type { SiteReport } from '../../lib/api-client/types';
import { Card } from '../ui/Card';

const screenshotFallback = (domain: string) =>
  `https://image.thum.io/get/width/1200/noanimate/https://${domain}`;

export const IdentityCard: React.FC<{ data: SiteReport }> = ({ data }) => {
  const screenshotUrl = data.visual?.screenshotUrl || screenshotFallback(data.domain ?? '');
  const dominantColor = data.visual?.dominantColor;
  const palette = data.visual?.palette;

  return (
    <Card className="overflow-hidden flex flex-col border border-slate-200 shadow-sm bg-white h-full">
      {/* Browser Header Mockup */}
      <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
        </div>
        <div className="flex-1 bg-white rounded-md h-7 shadow-sm text-xs flex items-center px-3 text-slate-500 gap-2 overflow-hidden">
          <Image
            src={`https://www.google.com/s2/favicons?domain=${data.domain}&sz=32`}
            alt=""
            width={14}
            height={14}
            className="w-3.5 h-3.5 opacity-70"
          />
          <span className="truncate">{data.domain}</span>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50 group min-h-[250px]">
        <div className="w-full h-full relative overflow-hidden">
          <Image
            src={screenshotUrl}
            alt={`Screenshot of ${data.domain}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />

          {/* Overlay: Brand Colors */}
          {dominantColor && (
            <div className="absolute bottom-4 right-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white/95 backdrop-blur shadow-lg rounded-lg p-2 flex items-center gap-3 border border-slate-100">
                <div className="flex gap-1">
                  <div
                    className="w-8 h-8 rounded-md shadow-inner border border-slate-100"
                    style={{ backgroundColor: dominantColor }}
                  />
                  {palette?.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-8 rounded shadow-inner border border-slate-100"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Brand Color</span>
                  <span className="text-xs font-mono font-medium text-slate-900">{dominantColor}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
