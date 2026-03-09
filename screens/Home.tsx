'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { ResearchSignalsSection } from '@/components/home/ResearchSignalsSection';
import { BrowsePathsSection } from '@/components/home/BrowsePathsSection';
import { FeaturedReportsSection } from '@/components/home/FeaturedReportsSection';
import { UseCasesSection } from '@/components/home/UseCasesSection';
import { LongFormSection } from '@/components/home/LongFormSection';
import { HomeFAQSection } from '@/components/home/HomeFAQSection';
import { PricingSection } from '@/components/home/PricingSection';

const BentoGrid = dynamic(
  () => import('../components/home/BentoGrid').then((mod) => mod.BentoGrid),
  {
    ssr: false,
    loading: () => (
      <section className="bg-clay-50/50 py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mx-auto mb-4 h-8 w-2/3 animate-pulse rounded-lg bg-ink-100" />
            <div className="mx-auto h-5 w-1/2 animate-pulse rounded-lg bg-ink-100" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse rounded-xl border border-ink-200 bg-white ${index === 0 ? 'col-span-1 h-[400px] md:col-span-2 md:row-span-2' : 'h-[180px]'}`}
              />
            ))}
          </div>
        </div>
      </section>
    ),
  },
);

const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <ResearchSignalsSection />
      <BrowsePathsSection />
      <FeaturedReportsSection />
      <BentoGrid />
      <UseCasesSection />
      <LongFormSection />
      <div className="container mx-auto max-w-7xl px-4 py-20 md:px-6">
        <HomeFAQSection />
      </div>
      <PricingSection />
    </div>
  );
};

export default Home;
