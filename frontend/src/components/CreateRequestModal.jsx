import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { requestsApi, servicesApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  X,
  PlusCircle,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';

const defaultDepartmentMap = {
  'Certificate Request': 'Administration Department',
  'Lab Equipment Request': 'Laboratory Department',
  'Maintenance Request': 'Maintenance Department',
  'Leave Application': 'HOD/Academic Department',
  'ID Card Request': 'Administration Department',
  'Library Service': 'Library Department',
  'Other College Service': 'General Administration',
};

const CreateRequestModal = ({ isOpen, onClose, preselectedService, onRequestCreated }) => {
  const { showToast } = useNotifications();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceName: '',
    subject: '',
    description: '',
    department: '',
    priority: 'Normal',
    location: '',
    attachmentName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await servicesApi.getAll();
        if (res.data?.data) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load services', err);
      }
    };
    if (isOpen) {
      loadServices();
      setCreatedResult(null);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedService) {
      const defaultDept =
        preselectedService.department ||
        defaultDepartmentMap[preselectedService.name] ||
        'Administration Department';

      setFormData((prev) => ({
        ...prev,
        serviceName: preselectedService.name,
        department: defaultDept,
      }));
    } else if (services.length > 0 && !formData.serviceName) {
      const first = services[0];
      setFormData((prev) => ({
        ...prev,
        serviceName: first.name,
        department: first.department || defaultDepartmentMap[first.name] || 'Administration Department',
      }));
    }
  }, [preselectedService, services]);

  if (!isOpen) return null;

  const handleServiceChange = (e) => {
    const val = e.target.value;
    const selected = services.find((s) => s.name === val);
    const dept =
      selected?.department ||
      defaultDepartmentMap[val] ||
      'General Administration';

    setFormData((prev) => ({
      ...prev,
      serviceName: val,
      department: dept,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        attachmentName: file.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.serviceName) {
      setError('Please select a campus service.');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Please enter a request subject/title.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a detailed description.');
      return;
    }

    try {
      setLoading(true);
      const res = await requestsApi.create(formData);
      if (res.data?.success) {
        setCreatedResult(res.data.data);
        showToast(`Request ${res.data.data.requestId} created successfully!`, 'success');

        // Confetti effect
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        if (onRequestCreated) {
          onRequestCreated(res.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit service request.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceName: services[0]?.name || 'Certificate Request',
      subject: '',
      description: '',
      department: services[0]?.department || 'Administration Department',
      priority: 'Normal',
      location: '',
      attachmentName: '',
    });
    setCreatedResult(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
              <PlusCircle className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Service Request</h3>
              <p className="text-xs text-indigo-200">Submit an official campus support ticket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {createdResult ? (
            /* Success confirmation card */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Request Submitted Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your campus ticket has been routed and assigned.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 inline-block text-left w-full max-w-md mx-auto space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Unique Request ID:</span>
                  <span className="font-mono font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded">
                    {createdResult.requestId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Service Type:</span>
                  <span className="font-semibold text-slate-800">{createdResult.serviceName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Assigned Department:</span>
                  <span className="font-semibold text-slate-800">{createdResult.department}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Initial Status:</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Pending
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Create Another Request
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
                >
                  Close & View Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.serviceName}
                  onChange={handleServiceChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
                >
                  {services.map((s) => (
                    <option key={s._id || s.id || s.name} value={s.name}>
                      {s.name} ({s.department})
                    </option>
                  ))}
                  {services.length === 0 && (
                    <>
                      <option value="Certificate Request">Certificate Request</option>
                      <option value="Lab Equipment Request">Lab Equipment Request</option>
                      <option value="Maintenance Request">Maintenance Request</option>
                      <option value="Leave Application">Leave Application</option>
                      <option value="ID Card Request">ID Card Request</option>
                      <option value="Library Service">Library Service</option>
                      <option value="Other College Service">Other College Service</option>
                    </>
                  )}
                </select>
              </div>

              {/* Subject Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request for Bonafide Certificate / Projector Repair"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail your request, purpose, relevant dates, or specific requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Department Auto-fill */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department Auto-Assigned
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Auto-selected based on service type.
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location / Room (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS Lab 2 / Block B 301"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Normal', 'High', 'Urgent'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                        formData.priority === p
                          ? p === 'Urgent'
                            ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-200'
                            : p === 'High'
                            ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-200'
                            : 'bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <PriorityBadge priority={p} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Attachment
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 cursor-pointer text-xs font-medium text-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                  </label>
                  {formData.attachmentName ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{formData.attachmentName}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
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
                  <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRequestModal;
