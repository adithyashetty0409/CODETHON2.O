import React from 'react';
import { Clock, CheckCircle2, Loader2, UserCheck, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status, isOverdue = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: Clock,
          label: 'Pending',
        };
      case 'Assigned':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
          dot: 'bg-sky-500',
          icon: UserCheck,
          label: 'Assigned',
        };
      case 'In Progress':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500 animate-pulse',
          icon: Loader2,
          label: 'In Progress',
        };
      case 'Completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          label: 'Completed',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          icon: Clock,
          label: status || 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs transition-colors ${
          config.bg
        } ${sizeClasses[size] || sizeClasses.md}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <Icon className={`w-3.5 h-3.5 ${status === 'In Progress' ? 'animate-spin' : ''}`} />
        <span>{config.label}</span>
      </span>

      {isOverdue && status !== 'Completed' && (
        <span
          title="Resolution SLA exceeded"
          className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 text-xs animate-bounce"
        >
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Overdue
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
