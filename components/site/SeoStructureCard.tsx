import React from 'react';
import type { SiteReport } from '../../lib/api-client/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Layout, FileText, Link as LinkIcon, Image as ImageIcon, CheckCircle2, XCircle, Mail, Phone, Globe } from 'lucide-react';

export const SeoStructureCard: React.FC<{ data: SiteReport }> = ({ data }) => {
  const seo = data.seo;
  const files = data.files;
  const contacts = seo?.contacts;

  if (!seo && !files) return null;

  return (
    <Card className="border border-slate-200 shadow-sm h-full flex flex-col">
      <CardHeader className="border-b border-slate-50 py-4 bg-slate-50/30">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
          <Layout size={16} className="text-blue-500" />
          Site Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex flex-col gap-4 flex-1">

        {/* Stats Row */}
        {seo && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-center mb-1 text-slate-400"><LinkIcon size={14} /></div>
              <div className="font-bold text-lg text-slate-900 leading-none">{seo.internalLinks ?? 0}</div>
              <div className="text-[10px] text-slate-500 uppercase mt-1">Internal</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-center mb-1 text-slate-400"><LinkIcon size={14} className="rotate-45" /></div>
              <div className="font-bold text-lg text-slate-900 leading-none">{seo.externalLinks ?? 0}</div>
              <div className="text-[10px] text-slate-500 uppercase mt-1">External</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-center mb-1 text-slate-400"><ImageIcon size={14} /></div>
              <div className="font-bold text-lg text-slate-900 leading-none">{seo.imagesCount ?? 0}</div>
              <div className="text-[10px] text-slate-500 uppercase mt-1">Images</div>
            </div>
          </div>
        )}

        {/* Contacts */}
        {contacts && (contacts.emails?.length || contacts.phones?.length || contacts.socialLinks?.length) ? (
          <div className="space-y-1.5">
            {contacts.emails?.[0] && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{contacts.emails[0]}</span>
              </div>
            )}
            {contacts.phones?.[0] && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone size={12} className="text-slate-400 shrink-0" />
                <span>{contacts.phones[0]}</span>
              </div>
            )}
            {contacts.socialLinks && contacts.socialLinks.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Globe size={12} className="text-slate-400 shrink-0" />
                <span>{contacts.socialLinks.length} social link{contacts.socialLinks.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Files Checklist */}
        {files && (
          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <FileText size={14} />
                <span>sitemap.xml</span>
              </div>
              {files.hasSitemap ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <XCircle size={16} className="text-slate-300" />
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <FileText size={14} />
                <span>robots.txt</span>
              </div>
              {files.hasRobots ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <XCircle size={16} className="text-slate-300" />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
