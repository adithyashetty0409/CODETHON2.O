import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestsApi, servicesApi } from '../services/api';
import {
  PlusCircle,
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  Cpu,
  Wrench,
  CalendarCheck,
  CreditCard,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CreateRequestModal from '../components/CreateRequestModal';
import RequestDetailsModal from '../components/RequestDetailsModal';

const iconMap = {
  FileText,
  Cpu,
  Wrench,
  CalendarCheck,
  CreditCard,
  BookOpen,
  HelpCircle,
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, srvRes] = await Promise.all([
        requestsApi.getMy(),
        servicesApi.getAll(),
      ]);
      if (reqRes.data?.data) setRequests(reqRes.data.data);
      if (srvRes.data?.data) setServices(srvRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'Pending').length;
  const inProgress = requests.filter((r) => r.status === 'In Progress' || r.status === 'Assigned').length;
  const completed = requests.filter((r) => r.status === 'Completed').length;
  const overdueCount = requests.filter((r) => r.isOverdue).length;

  const handleOpenCreateWithService = (service) => {
    setSelectedService(service);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Campus Service Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              Track active service tickets, check resolution SLAs, or request certificates and facility support.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-indigo-200">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                {user?.department}
              </span>
              <span>•</span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                {user?.semester}
              </span>
              <span>•</span>
              <span className="font-mono bg-white/10 px-2.5 py-0.5 rounded-full">
                {user?.studentId}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedService(null);
              setIsCreateModalOpen(true);
            }}
            className="self-start md:self-center px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Create New Request</span>
          </button>
        </div>
      </div>

      {/* Overdue Warning Alert if any request is past SLA */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold">SLA Escalation Notice: {overdueCount} Request(s) Overdue</p>
              <p className="text-[11px] text-rose-700">
                One or more of your requests has exceeded its estimated completion time. Priority escalation flags have been raised to administrators.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{total}</span>
            <span className="text-xs text-slate-400 font-medium">all time</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pending}</span>
            <span className="text-xs text-slate-400 font-medium">awaiting review</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{inProgress}</span>
            <span className="text-xs text-slate-400 font-medium">active resolution</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{completed}</span>
            <span className="text-xs text-slate-400 font-medium">resolved</span>
          </div>
        </div>
      </div>

      {/* Available Campus Services Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Campus Services</h2>
            <p className="text-xs text-slate-500">Select a category to quickly file a request</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((srv) => {
            const Icon = iconMap[srv.icon] || HelpCircle;
            return (
              <div
                key={srv._id || srv.id || srv.name}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full">
                      SLA: {srv.slaDays || 3}d
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {srv.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {srv.department}
                  </span>
                  <button
                    onClick={() => handleOpenCreateWithService(srv)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Request</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Service Requests</h2>
            <p className="text-xs text-slate-500">Latest tickets submitted by your account</p>
          </div>
          <button
            onClick={() => (window.location.href = '/my-requests')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All ({total}) →
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
            <p className="text-xs text-slate-500 mt-2">Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No requests submitted yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't requested any campus services yet. Click below to file your first ticket!
            </p>
            <button
              onClick={() => {
                setSelectedService(null);
                setIsCreateModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              Create First Request
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Subject & Service</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {requests.slice(0, 5).map((req) => (
                    <tr key={req._id || req.id || req.requestId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {req.requestId}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{req.subject}</p>
                        <p className="text-[11px] text-slate-500">{req.serviceName}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{req.department}</td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={req.priority} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} isOverdue={req.isOverdue} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        preselectedService={selectedService}
        onRequestCreated={() => loadData()}
      />

      <RequestDetailsModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
};

export default StudentDashboard;
