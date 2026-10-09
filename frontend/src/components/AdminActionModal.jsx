import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  X,
  UserCheck,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const departmentList = [
  'Administration Department',
  'Laboratory Department',
  'Maintenance Department',
  'HOD/Academic Department',
  'Library Department',
  'General Administration',
];

const facultyRoster = {
  'Administration Department': [
    { name: 'Ms. Sunita Rao', role: 'Head Registrar' },
    { name: 'Mr. Rajesh Mehra', role: 'Student Affairs Officer' },
  ],
  'Laboratory Department': [
    { name: 'Dr. K. Raman', role: 'Lab In-Charge' },
    { name: 'Er. Sandeep Joshi', role: 'Technical Systems Lead' },
  ],
  'Maintenance Department': [
    { name: 'Ramesh Kumar', role: 'AV & Facility Technician' },
    { name: 'HVAC Emergency Team', role: 'Cooling Specialist' },
  ],
  'HOD/Academic Department': [
    { name: 'Prof. Anjali Mehta', role: 'ECE Dept HOD' },
    { name: 'Dr. V. Srinivasan', role: 'CSE Dept HOD' },
  ],
  'Library Department': [
    { name: 'Mr. David Paul', role: 'Chief Librarian' },
    { name: 'Ms. Geeta Nair', role: 'Digital Repository Lead' },
  ],
  'General Administration': [
    { name: 'Campus Helpdesk Desk 1', role: 'Support Coordinator' },
  ],
};

const AdminActionModal = ({ isOpen, onClose, request, onActionCompleted }) => {
  const { showToast } = useNotifications();
  const [department, setDepartment] = useState('');
  const [assignedPersonName, setAssignedPersonName] = useState('');
  const [assignedPersonRole, setAssignedPersonRole] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [targetStatus, setTargetStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (request) {
      setDepartment(request.department || 'Administration Department');
      setAssignedPersonName(request.assignedTo?.name || '');
      setAssignedPersonRole(request.assignedTo?.role || '');
      setPriority(request.priority || 'Normal');
      setTargetStatus(request.status || 'Pending');
      setRemarks(request.remarks || '');
      setEstimatedCompletion(
        request.estimatedCompletion
          ? new Date(request.estimatedCompletion).toISOString().split('T')[0]
          : ''
      );
      setError('');
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleDepartmentChange = (newDept) => {
    setDepartment(newDept);
    const availableStaff = facultyRoster[newDept] || [];
    if (availableStaff.length > 0) {
      setAssignedPersonName(availableStaff[0].name);
      setAssignedPersonRole(availableStaff[0].role);
    } else {
      setAssignedPersonName('Unassigned');
      setAssignedPersonRole('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const reqId = request._id || request.id || request.requestId;

      // 1. If status changed, update status first (verifies transitions)
      if (targetStatus !== request.status) {
        await adminApi.updateStatus(reqId, {
          status: targetStatus,
          remarks: remarks || `Status shifted to ${targetStatus}`,
        });
      }

      // 2. Update assignment and details
      await adminApi.assign(reqId, {
        department,
        assignedTo: {
          name: assignedPersonName || 'Unassigned',
          role: assignedPersonRole || '',
          department,
        },
        remarks,
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion).toISOString() : null,
      });

      // 3. Update priority if changed
      if (priority !== request.priority) {
        await adminApi.updateDetails(reqId, {
          priority,
          remarks,
          estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion).toISOString() : null,
        });
      }

      showToast(`Request ${request.requestId} updated successfully!`, 'success');
      if (onActionCompleted) {
        onActionCompleted();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update request.');
    } finally {
      setLoading(false);
    }
  };

  const availableStaff = facultyRoster[department] || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-fade-in my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Shield className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Manage & Assign Request</h3>
              <p className="text-xs text-indigo-200 font-mono">{request.requestId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Context Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{request.subject}</span>
              <PriorityBadge priority={request.priority} size="sm" />
            </div>
            <p className="text-[11px] text-slate-500">
              Student: {request.student?.name || request.studentName} (
              {request.student?.studentId || request.studentRoll || 'ID N/A'}) •{' '}
              {request.serviceName}
            </p>
          </div>

          {/* Department Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assigned Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
            >
              {departmentList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty / Personnel Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty / Officer Name
              </label>
              {availableStaff.length > 0 ? (
                <select
                  value={assignedPersonName}
                  onChange={(e) => {
                    const sel = availableStaff.find((s) => s.name === e.target.value);
                    setAssignedPersonName(e.target.value);
                    if (sel) setAssignedPersonRole(sel.role);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
                >
                  <option value="Unassigned">-- Select Officer --</option>
                  {availableStaff.map((staff) => (
                    <option key={staff.name} value={staff.name}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Officer name"
                  value={assignedPersonName}
                  onChange={(e) => setAssignedPersonName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designation / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Lab In-Charge, Registrar"
                value={assignedPersonRole}
                onChange={(e) => setAssignedPersonRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Status Workflow Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Update Request Status (Workflow: Pending → Assigned → In Progress → Completed)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Pending', 'Assigned', 'In Progress', 'Completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTargetStatus(st)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center transition-all ${
                    targetStatus === st
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Estimated Completion Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Resolution Date
              </label>
              <input
                type="date"
                value={estimatedCompletion}
                onChange={(e) => setEstimatedCompletion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Administrative Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Administrative Remarks / Feedback for Student
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Document verified, technician arriving at 2 PM, or issued certificate..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading && <Clock className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Saving Changes...' : 'Save & Notify Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminActionModal;
