import React from 'react';
import { AlertCircle, Flame, ShieldAlert, Check } from 'lucide-react';

const PriorityBadge = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  switch (priority) {
    case 'Urgent':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs shadow-rose-100 ${
            sizeClasses[size] || sizeClasses.md
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500 animate-pulse" />
          <span>Urgent</span>
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs ${
            sizeClasses[size] || sizeClasses.md
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>High</span>
        </span>
      );
    case 'Normal':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${
            sizeClasses[size] || sizeClasses.md
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Normal</span>
        </span>
      );
  }
};

export default PriorityBadge;
