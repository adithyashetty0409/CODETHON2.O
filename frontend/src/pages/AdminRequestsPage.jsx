import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../services/api';
import {
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Edit3,
  Eye,
  Building2,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import RequestDetailsModal from '../components/RequestDetailsModal';
import AdminActionModal from '../components/AdminActionModal';

const departmentsList = [
  'All',
  'Administration Department',
  'Laboratory Department',
  'Maintenance Department',
  'HOD/Academic Department',
  'Library Department',
  'General Administration',
];

const AdminRequestsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';
  const initialPriority = searchParams.get('priority') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managingRequest, setManagingRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllRequests({
        search,
        status: statusFilter,
        department: deptFilter,
        priority: priorityFilter,
        sortBy,
      });
      if (res.data?.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load requests for admin', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, statusFilter, deptFilter, priorityFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrative Request Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, assign, escalate, and transition statuses for all campus service requests
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ID, student, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending (Queue)</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="All">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent 🔥</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: By Priority</option>
              <option value="status">Sort: By Status Stage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Master Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs text-slate-500 mt-2">Loading campus requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No requests match criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, department, or status filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setDeptFilter('All');
              setPriorityFilter('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
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
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Created Date</th>
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
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {req.requestId}
                    </td>
                    <td className="py-3 px-4 max-w-[140px]">
                      <p className="font-bold text-slate-900 truncate">
                        {req.student?.name || req.studentName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {req.student?.studentId || req.studentRoll || 'N/A'}
                      </p>
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
                      <StatusBadge
                        status={req.status}
                        isOverdue={req.isOverdue}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-semibold text-slate-800">
                        {req.assignedTo?.name || 'Unassigned'}
                      </p>
                      {req.assignedTo?.role && (
                        <p className="text-[10px] text-slate-400">{req.assignedTo.role}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="View Details"
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
              onClick={fetchRequests}
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Table</span>
            </button>
          </div>
        </div>
      )}

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
        onActionCompleted={() => fetchRequests()}
      />
    </div>
  );
};

export default AdminRequestsPage;
