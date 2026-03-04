import React from 'react';
import { Card } from '../ui/Card';

interface StatusPollerProps {
  progress: number;
  message: string;
}

export const StatusPoller: React.FC<StatusPollerProps> = ({ progress, message }) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4">
      <Card className="p-8 border-none shadow-none bg-transparent text-center">
        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            {/* Animated Ring */}
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
            ></div>
            <span className="text-xl font-bold text-slate-700">{progress}%</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">{message}</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          We are analyzing traffic patterns, technical stack, and running AI models on this domain. This usually takes 10-20 seconds.
        </p>

        {/* Progress Bar Steps */}
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span className={progress > 10 ? "text-blue-600" : ""}>DNS</span>
            <span className={progress > 30 ? "text-blue-600" : ""}>Visual</span>
            <span className={progress > 60 ? "text-blue-600" : ""}>AI Analysis</span>
            <span className={progress > 90 ? "text-blue-600" : ""}>Report</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
