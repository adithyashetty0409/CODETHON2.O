import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { requestsApi } from '../services/api';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Clock,
  Loader2,
  Calendar,
  Building2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CreateRequestModal from '../components/CreateRequestModal';
import RequestDetailsModal from '../components/RequestDetailsModal';

const StudentRequestsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestsApi.getMy({
        search,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
      });
      if (res.data?.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch student requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, statusFilter, priorityFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Request History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status, audit timelines, and administrative remarks for your submitted tickets
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by ID, subject, or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: By Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-7 h-7 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs text-slate-500 mt-2">Loading your requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No requests match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try clearing filters or submit a new service request.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setPriorityFilter('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Service & Subject</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {requests.map((req) => (
                  <tr
                    key={req._id || req.id || req.requestId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {req.requestId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{req.subject}</p>
                      <p className="text-[11px] text-slate-500">{req.serviceName}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {req.department}
                    </td>
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
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {req.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
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

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {requests.length} request(s)</span>
            <button
              onClick={fetchRequests}
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRequestCreated={() => fetchRequests()}
      />

      <RequestDetailsModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
};

export default StudentRequestsPage;
