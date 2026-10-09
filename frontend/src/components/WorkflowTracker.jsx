import React from 'react';
import { Clock, UserCheck, Loader2, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 'Pending', label: 'Pending', desc: 'Request submitted', icon: Clock },
  { id: 'Assigned', label: 'Assigned', desc: 'Routed to department', icon: UserCheck },
  { id: 'In Progress', label: 'In Progress', desc: 'Resolution underway', icon: Loader2 },
  { id: 'Completed', label: 'Completed', desc: 'Resolved & closed', icon: CheckCircle2 },
];

const statusOrder = ['Pending', 'Assigned', 'In Progress', 'Completed'];

const WorkflowTracker = ({ currentStatus, assignedTo, department }) => {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="w-full py-4 px-2">
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Bar */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 transition-all duration-700 ease-out"
            style={{
              width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center text-center group max-w-[100px] sm:max-w-[130px]"
            >
              {/* Node Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 shadow-indigo-200'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Icon
                    className={`w-5 h-5 ${
                      isCurrent && step.id === 'In Progress' ? 'animate-spin' : ''
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="mt-2.5">
                <p
                  className={`text-xs sm:text-sm font-semibold transition-colors ${
                    isCurrent
                      ? 'text-indigo-600'
                      : isDone
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5 font-normal">
                  {step.id === 'Assigned' && assignedTo?.name && assignedTo.name !== 'Unassigned'
                    ? assignedTo.name
                    : step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowTracker;
