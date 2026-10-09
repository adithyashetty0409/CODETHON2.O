import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  FileText,
  Clock,
  UserCheck,
  Loader2,
  CheckCircle2,
  Flame,
  AlertTriangle,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import RequestDetailsModal from '../components/RequestDetailsModal';
import AdminActionModal from '../components/AdminActionModal';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managingRequest, setManagingRequest] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStatistics();
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p className="text-xs text-slate-500 mt-2">Loading campus operations intelligence...</p>
      </div>
    );
  }

  const deptCounts = stats.departmentCounts || {};
  const maxDeptCount = Math.max(...Object.values(deptCounts), 1);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Administrative Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus Service Analytics & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time request queues, SLA performance metrics, and departmental workload distribution
          </p>
        </div>
      </div>

      {/* Escalation Alert Banner */}
      {stats.overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                ⚠️ SLA Escalation Active: {stats.overdueCount} Request(s) Overdue
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                These requests have exceeded their estimated turnaround SLA. Immediate department intervention recommended.
              </p>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = '/admin/requests?priority=Urgent')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs shrink-0 cursor-pointer"
          >
            Review Overdue Tickets
          </button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalRequests}</p>
          <span className="text-[10px] text-slate-400">Total logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">{stats.pending}</p>
          <span className="text-[10px] text-amber-700 font-medium">Unassigned queue</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-600 uppercase">Assigned</span>
            <UserCheck className="w-4 h-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-600">{stats.assigned}</p>
          <span className="text-[10px] text-sky-700 font-medium">Routed to staff</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 uppercase">In Progress</span>
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-600">{stats.inProgress}</p>
          <span className="text-[10px] text-indigo-700 font-medium">Active work</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{stats.completed}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Resolved tickets</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 uppercase">Urgent</span>
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600">{stats.urgent}</p>
          <span className="text-[10px] text-rose-700 font-medium">High priority</span>
        </div>
      </div>

      {/* Analytics & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Resolution Time Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                Resolution Turnaround
              </span>
              <TrendingUp className="w-4 h-4 text-indigo-300" />
            </div>
            <h3 className="text-base font-bold text-white mt-1">Average Resolution Time</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">
                {stats.averageResolutionDays}
              </span>
              <span className="text-sm font-semibold text-indigo-200">days</span>
            </div>
            <p className="mt-2 text-xs text-indigo-200 leading-relaxed">
              Calculated dynamically as <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Completed Date - Created Date</code> across all finalized tickets.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-indigo-200 flex items-center justify-between">
            <span>Standard SLA Target: 3.0 days</span>
            <span className="font-bold text-emerald-300">Within Target</span>
          </div>
        </div>

        {/* Department Workload Visualization */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department Workload Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Active & completed ticket volume across campus wings
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {Object.keys(deptCounts).length} Departments
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const percentage = Math.round((count / maxDeptCount) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{dept}</span>
                    <span className="text-slate-900 font-mono font-bold">{count} requests</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Urgent & High-Priority Triage Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">High-Priority & Urgent Triage</h2>
            <p className="text-xs text-slate-500">Unresolved high-stakes tickets requiring attention</p>
          </div>
          <button
            onClick={() => (window.location.href = '/admin/requests')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Manage All Requests →
          </button>
        </div>

        {stats.highPriorityRequests && stats.highPriorityRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.highPriorityRequests.map((req) => (
              <div
                key={req._id || req.id || req.requestId}
                className={`p-4 rounded-2xl bg-white border transition-all shadow-2xs hover:shadow-md flex flex-col justify-between ${
                  req.priority === 'Urgent' ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-indigo-600">
                      {req.requestId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={req.priority} size="sm" />
                      <StatusBadge status={req.status} isOverdue={req.isOverdue} size="sm" />
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{req.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{req.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    {req.department} • Assigned: {req.assignedTo?.name || 'Unassigned'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setManagingRequest(req)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No urgent pending tickets.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <RequestDetailsModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onOpenAdminAction={(req) => setManagingRequest(req)}
      />

      <AdminActionModal
        isOpen={!!managingRequest}
        onClose={() => setManagingRequest(null)}
        request={managingRequest}
        onActionCompleted={() => fetchStats()}
      />
    </div>
  );
};

export default AdminDashboard;
