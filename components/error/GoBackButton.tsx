'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GoBackButtonProps {
  className?: string;
}

export const GoBackButton: React.FC<GoBackButtonProps> = ({ className }) => {
  return (
    <Button
      variant="outline"
      onClick={() => window.history.back()}
      className={className}
    >
      <ArrowLeft className="w-4 h-4" />
      Go back
    </Button>
  );
}
