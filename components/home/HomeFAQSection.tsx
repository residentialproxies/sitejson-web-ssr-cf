import React from 'react';
import { FaqSection } from '@/components/shared/FaqSection';
import { HOME_FAQS } from '@/lib/pseo';

export function HomeFAQSection() {
  return (
    <FaqSection
      title="Common questions from search visitors and buyers"
      description="The homepage should answer what the product is, why the browse paths matter, and how a visitor can keep exploring without friction."
      items={HOME_FAQS}
    />
  );
}
