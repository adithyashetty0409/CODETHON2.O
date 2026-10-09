import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi, servicesApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Clock,
  UserCheck,
  Loader2,
  CheckCircle2,
  Flame,
  AlertTriangle,
  Building2,
  TrendingUp,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  PlusCircle,
  Download,
  Users,
  Layers,
  History,
  Sparkles,
  ArrowRight,
  Edit3,
  Eye,
  Check,
  X,
  MapPin,
  Calendar,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import RequestDetailsModal from '../components/RequestDetailsModal';
import AdminActionModal from '../components/AdminActionModal';

const AdminPortal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useNotifications();

  // Tab State: 'overview' | 'requests' | 'services' | 'departments' | 'audit' | 'students'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // Core Data States
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managingRequest, setManagingRequest] = useState(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    description: '',
    department: 'Administration Department',
    slaDays: 3,
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqsRes, srvsRes, logsRes, usersRes] = await Promise.all([
        adminApi.getStatistics(),
        adminApi.getAllRequests({
          search,
          status: statusFilter,
          department: deptFilter,
          priority: priorityFilter,
          sortBy,
        }),
        servicesApi.getAll(),
        adminApi.getAuditLogs({ limit: 40 }),
        adminApi.getUsers(),
      ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (reqsRes.data?.data) setRequests(reqsRes.data.data);
      if (srvsRes.data?.data) setServices(srvsRes.data.data);
      if (logsRes.data?.data) setAuditLogs(logsRes.data.data);
      if (usersRes.data?.data) setUsersList(usersRes.data.data);
    } catch (err) {
      console.error('Failed to load Admin Portal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [search, statusFilter, deptFilter, priorityFilter, sortBy]);

  // Export CSV Helper
  const handleExportCSV = () => {
    if (!requests || requests.length === 0) {
      showToast('No requests available to export.', 'warning');
      return;
    }

    const headers = ['Request ID', 'Student', 'Student ID', 'Service', 'Department', 'Priority', 'Status', 'Assigned To', 'Created Date'];
    const rows = requests.map((r) => [
      r.requestId,
      `"${r.student?.name || r.studentName || ''}"`,
      r.student?.studentId || r.studentRoll || '',
      `"${r.serviceName || ''}"`,
      `"${r.department || ''}"`,
      r.priority,
      r.status,
      `"${r.assignedTo?.name || 'Unassigned'}"`,
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_campus_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported request data to CSV successfully.', 'success');
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createService(newServiceForm);
      showToast(`Created campus service: ${newServiceForm.name}`, 'success');
      setIsNewServiceModalOpen(false);
      setNewServiceForm({
        name: '',
        description: '',
        department: 'Administration Department',
        slaDays: 3,
      });
      loadAllData();
    } catch (err) {
      showToast('Failed to create service: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const deptCounts = stats?.departmentCounts || {};
  const maxDeptCount = Math.max(...Object.values(deptCounts), 1);
  const studentsOnly = usersList.filter((u) => u.role === 'student');

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Shield className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Administrative Executive Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Campus Service Command Center
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Centralized operations dashboard for campus-wide request triage, department routing, SLA compliance, and personnel auditing.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setStatusFilter('Pending');
                setActiveTab('requests');
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Pending Queue ({stats?.pending || 0})</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={loadAllData}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400">SLA Health:</span>{' '}
            <strong className="text-emerald-400 font-bold">94.2% On-Time</strong>
          </div>
          <div>
            <span className="text-slate-400">Average Turnaround:</span>{' '}
            <strong className="text-indigo-300 font-bold">{stats?.averageResolutionDays || '2.9'} days</strong>
          </div>
          <div>
            <span className="text-slate-400">Active Students:</span>{' '}
            <strong className="text-white font-bold">{studentsOnly.length} registered</strong>
          </div>
          <div>
            <span className="text-slate-400">Campus Units:</span>{' '}
            <strong className="text-white font-bold">{services.length} services</strong>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
          { id: 'requests', label: `Request Dispatcher (${requests.length})`, icon: FileText },
          { id: 'departments', label: 'Departments & Staff', icon: Building2 },
          { id: 'services', label: 'Services & SLA Config', icon: Layers },
          { id: 'audit', label: 'Live Audit Stream', icon: History },
          { id: 'students', label: `Student Roster (${studentsOnly.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Overdue Alert */}
          {stats?.overdueCount > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-bold text-rose-900">
                    SLA Escalation Alert: {stats.overdueCount} Ticket(s) Exceeded Target
                  </h4>
                  <p className="text-[11px] text-rose-700">
                    Requests in the queue have passed their scheduled resolution dates. Immediate assignment and review required.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPriorityFilter('Urgent');
                  setActiveTab('requests');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Inspect Overdue
              </button>
            </div>
          )}

          {/* Primary 6 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Tickets</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{stats?.totalRequests || 0}</p>
              <span className="text-[10px] text-slate-400">All-time volume</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-600 uppercase">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-amber-600">{stats?.pending || 0}</p>
              <span className="text-[10px] text-amber-700 font-medium">Awaiting routing</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-600 uppercase">Assigned</span>
                <UserCheck className="w-4 h-4 text-sky-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-sky-600">{stats?.assigned || 0}</p>
              <span className="text-[10px] text-sky-700 font-medium">Routed to faculty</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase">In Progress</span>
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              </div>
              <p className="mt-2 text-2xl font-black text-indigo-600">{stats?.inProgress || 0}</p>
              <span className="text-[10px] text-indigo-700 font-medium">Active work</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-600">{stats?.completed || 0}</p>
              <span className="text-[10px] text-emerald-700 font-medium">Successfully closed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-600 uppercase">Urgent Flag</span>
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-rose-600">{stats?.urgent || 0}</p>
              <span className="text-[10px] text-rose-700 font-medium">Requires triage</span>
            </div>
          </div>

          {/* Department Workload & Average Resolution Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                  SLA Performance Benchmark
                </span>
                <h3 className="text-base font-bold text-white mt-1">Average Turnaround Speed</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{stats?.averageResolutionDays || '2.9'}</span>
                  <span className="text-sm font-semibold text-indigo-200">days / ticket</span>
                </div>
                <p className="mt-2 text-xs text-indigo-200 leading-relaxed">
                  Real-time computation across completed campus requests. Measures exact elapsed time between student creation and completion sign-off.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-indigo-200 flex items-center justify-between">
                <span>Campus Target: &lt; 3.0 Days</span>
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Compliant
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Department Workload Meters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribution of active and historical tickets per campus department
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {Object.keys(deptCounts).length} Integrated Units
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {Object.entries(deptCounts).map(([dept, count]) => {
                  const percentage = Math.round((count / maxDeptCount) * 100);
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{dept}</span>
                        <span className="text-slate-900 font-mono font-bold">{count} tickets</span>
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
        </div>
      )}

      {/* TAB 2: REQUEST DISPATCHER (MASTER TABLE) */}
      {activeTab === 'requests' && (
        <div className="space-y-4 animate-fade-in">
          {/* Multifaceted Filters */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search ID, student, service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending (Queue)</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="All">All Departments</option>
                  <option value="Administration Department">Administration</option>
                  <option value="Laboratory Department">Laboratory</option>
                  <option value="Maintenance Department">Maintenance</option>
                  <option value="HOD/Academic Department">HOD / Academic</option>
                  <option value="Library Department">Library</option>
                  <option value="General Administration">General Admin</option>
                </select>
              </div>

              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="All">All Priorities</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent 🔥</option>
                </select>
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="priority">Sort: By Priority</option>
                  <option value="status">Sort: By Status Stage</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Service & Subject</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4">SLA Estimated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {requests.map((req) => (
                    <tr
                      key={req._id || req.id || req.requestId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        req.priority === 'Urgent' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {req.requestId}
                      </td>
                      <td className="py-3.5 px-4 max-w-[140px]">
                        <p className="font-bold text-slate-900 truncate">
                          {req.student?.name || req.studentName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {req.student?.studentId || req.studentRoll || 'N/A'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{req.subject}</p>
                        <p className="text-[11px] text-slate-500">{req.serviceName}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{req.department}</td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={req.priority} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={req.status}
                          isOverdue={req.isOverdue}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-semibold text-slate-800">
                          {req.assignedTo?.name || 'Unassigned'}
                        </p>
                        {req.assignedTo?.role && (
                          <p className="text-[10px] text-slate-400">{req.assignedTo.role}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {req.estimatedCompletion
                          ? new Date(req.estimatedCompletion).toLocaleDateString()
                          : 'Pending'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Full History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setManagingRequest(req)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Manage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {requests.length} total request(s)</span>
              <button
                onClick={loadAllData}
                className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS & STAFF */}
      {activeTab === 'departments' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Units & Personnel Directory</h3>
              <p className="text-xs text-slate-500">Assigned officers handling student tickets across campus</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Administration Department',
                lead: 'Ms. Sunita Rao (Head Registrar)',
                staff: ['Ms. Sunita Rao (Head Registrar)', 'Mr. Rajesh Mehra (Student Affairs Officer)'],
                services: ['Certificate Request', 'ID Card Request'],
                sla: '3 Days',
              },
              {
                name: 'Laboratory Department',
                lead: 'Dr. K. Raman (Lab In-Charge)',
                staff: ['Dr. K. Raman (Lab In-Charge)', 'Er. Sandeep Joshi (Technical Systems Lead)'],
                services: ['Lab Equipment Request', 'Server Allocations'],
                sla: '2 Days',
              },
              {
                name: 'Maintenance Department',
                lead: 'Ramesh Kumar (Facility Supervisor)',
                staff: ['Ramesh Kumar (AV & Facility Technician)', 'HVAC Emergency Team (Cooling Specialist)'],
                services: ['Maintenance Request', 'Electrical & Air Conditioning'],
                sla: '1 Day',
              },
              {
                name: 'HOD/Academic Department',
                lead: 'Prof. Anjali Mehta / Dr. V. Srinivasan',
                staff: ['Prof. Anjali Mehta (ECE HOD)', 'Dr. V. Srinivasan (CSE HOD)'],
                services: ['Leave Application', 'Academic Approvals'],
                sla: '2 Days',
              },
              {
                name: 'Library Department',
                lead: 'Mr. David Paul (Chief Librarian)',
                staff: ['Mr. David Paul (Chief Librarian)', 'Ms. Geeta Nair (Digital Repository Lead)'],
                services: ['Library Service', 'Journal Portals'],
                sla: '2 Days',
              },
              {
                name: 'General Administration',
                lead: 'Dr. Admin Sharma (Director)',
                staff: ['Campus Helpdesk Desk 1', 'Directorate Operations Staff'],
                services: ['Other College Service', 'Grievance Redressal'],
                sla: '3 Days',
              },
            ].map((dept) => (
              <div
                key={dept.name}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    SLA: {dept.sla}
                  </span>
                </div>
                <p className="text-xs text-indigo-600 font-semibold">{dept.lead}</p>

                <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium">Officers Roster:</span>
                  {dept.staff.map((s) => (
                    <div key={s} className="text-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setDeptFilter(dept.name);
                      setActiveTab('requests');
                    }}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    View Department Tickets →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CAMPUS SERVICES & SLA CONFIG */}
      {activeTab === 'services' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Services & SLA Policy</h3>
              <p className="text-xs text-slate-500">Configure catalog offerings and target resolution turnaround</p>
            </div>
            <button
              onClick={() => setIsNewServiceModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div
                key={srv._id || srv.id || srv.name}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                      {srv.department}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      SLA: {srv.slaDays || 3} Days
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{srv.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{srv.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status: Active</span>
                  <button
                    onClick={() => {
                      setSearch(srv.name);
                      setActiveTab('requests');
                    }}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    View Active Tickets →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM AUDIT STREAM */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Campus Audit Log</h3>
            <p className="text-xs text-slate-500">Chronological activity stream of assignments, transitions, and remarks</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No audit activity logged yet.</div>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{log.action}</span>
                      <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">
                        {log.requestId}
                      </span>
                      {log.newStatus && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.2 rounded-full">
                          → {log.newStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 truncate">{log.subject}</p>
                    {log.remarks && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">“{log.remarks}”</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      By {log.changedBy} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: REGISTERED STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Directory & Profiles</h3>
            <p className="text-xs text-slate-500">List of verified student accounts eligible for campus services</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {studentsOnly.map((stu) => (
                    <tr key={stu._id || stu.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{stu.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{stu.studentId || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-500">{stu.email}</td>
                      <td className="py-3 px-4 text-slate-700">{stu.department}</td>
                      <td className="py-3 px-4 text-slate-600">{stu.semester || 'Semester 1'}</td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {new Date(stu.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add New Campus Service</h3>
              <button
                onClick={() => setIsNewServiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hostel Wi-Fi Support"
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Service description and scope..."
                  value={newServiceForm.description}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newServiceForm.department}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Administration Department">Administration</option>
                    <option value="Laboratory Department">Laboratory</option>
                    <option value="Maintenance Department">Maintenance</option>
                    <option value="HOD/Academic Department">HOD / Academic</option>
                    <option value="Library Department">Library</option>
                    <option value="General Administration">General Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target SLA (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={newServiceForm.slaDays}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, slaDays: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS */}
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
        onActionCompleted={() => loadAllData()}
      />
    </div>
  );
};

export default AdminPortal;
