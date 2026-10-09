import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  AlertTriangle,
  MapPin,
  Paperclip,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import WorkflowTracker from './WorkflowTracker';
import { useNotifications } from '../context/NotificationContext';

const RequestDetailsModal = ({ isOpen, onClose, request, onOpenAdminAction }) => {
  const { showToast } = useNotifications();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(request.requestId);
    setCopied(true);
    showToast(`Copied ${request.requestId} to clipboard`, 'info', 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOverdue = request.isOverdue;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-fade-in my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <FileText className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-indigo-200">
                  {request.requestId}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <h3 className="text-sm font-semibold text-white truncate max-w-sm sm:max-w-md">
                {request.subject}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Escalation Warning Banner */}
        {isOverdue && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold">⚠️ SLA Escalation Alert: Request is Overdue</p>
              <p className="text-[11px] text-rose-700">
                This request has exceeded its estimated resolution time ({new Date(request.estimatedCompletion).toLocaleDateString()}). Department Head and Escalation Desk have been notified.
              </p>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Tracker */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Progress Workflow</span>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} isOverdue={isOverdue} />
              </div>
            </div>
            <WorkflowTracker
              currentStatus={request.status}
              assignedTo={request.assignedTo}
              department={request.department}
            />
          </div>

          {/* Core Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Service Category & Dept</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">{request.serviceName}</p>
              <p className="text-slate-600 font-semibold">{request.department}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Assigned Personnel</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {request.assignedTo?.name || 'Unassigned'}
              </p>
              <p className="text-slate-500 font-medium">
                {request.assignedTo?.role ? `${request.assignedTo.role} • ` : ''}
                {request.assignedTo?.department || request.department}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Timeline Schedule</span>
              </div>
              <p className="text-slate-700">
                <span className="font-semibold">Submitted:</span>{' '}
                {new Date(request.createdAt).toLocaleString()}
              </p>
              <p className="text-slate-700">
                <span className="font-semibold">Estimated Completion:</span>{' '}
                {request.estimatedCompletion ? (
                  <span className={isOverdue ? 'text-rose-600 font-bold' : 'font-medium'}>
                    {new Date(request.estimatedCompletion).toLocaleDateString()}
                  </span>
                ) : (
                  'Pending SLA estimation'
                )}
              </p>
              {request.completedAt && (
                <p className="text-emerald-700 font-semibold">
                  <span>Resolved:</span> {new Date(request.completedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Location & Student Details</span>
              </div>
              <p className="text-slate-700">
                <span className="font-semibold">Student:</span>{' '}
                {request.student?.name || request.studentName || 'Student'} (
                {request.student?.studentId || request.studentRoll || 'N/A'})
              </p>
              <p className="text-slate-700">
                <span className="font-semibold">Location:</span>{' '}
                {request.location || 'Campus / General'}
              </p>
              {request.attachmentName && (
                <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{request.attachmentName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Request Description
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {request.description}
            </p>
          </div>

          {/* Remarks Section */}
          {request.remarks && (
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
              <h4 className="text-xs font-bold text-indigo-900">Official Administrative Remarks</h4>
              <p className="text-xs text-indigo-800 italic">“{request.remarks}”</p>
            </div>
          )}

          {/* Request Activity History Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Activity History & Audit Trail
            </h4>
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
              {request.history && request.history.length > 0 ? (
                request.history.map((h, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 group-hover:scale-125 transition-transform" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{h.action}</span>
                        {h.newStatus && (
                          <span className="px-2 py-0.2 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200">
                            Status: {h.newStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By {h.changedBy} • {new Date(h.timestamp).toLocaleString()}
                      </p>
                      {h.remarks && (
                        <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                          {h.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No activity logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Last updated: {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-3">
            {onOpenAdminAction && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminAction(request);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Manage / Assign Request
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
