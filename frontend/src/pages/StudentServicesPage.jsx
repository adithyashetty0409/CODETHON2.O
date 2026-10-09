import React, { useState, useEffect } from 'react';
import { servicesApi } from '../services/api';
import {
  FileText,
  Cpu,
  Wrench,
  CalendarCheck,
  CreditCard,
  BookOpen,
  HelpCircle,
  Search,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import CreateRequestModal from '../components/CreateRequestModal';

const iconMap = {
  FileText,
  Cpu,
  Wrench,
  CalendarCheck,
  CreditCard,
  BookOpen,
  HelpCircle,
};

const StudentServicesPage = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await servicesApi.getAll();
        if (res.data?.data) {
          setServices(res.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchServices();
  }, []);

  const departments = ['All', ...new Set(services.map((s) => s.department))];

  const filteredServices = services.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === 'All' || s.department === selectedDept;
    return matchSearch && matchDept;
  });

  const handleOpenRequest = (service) => {
    setActiveService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus Services Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse available college operations, facilities, and academic request channels
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search services or departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((srv) => {
          const Icon = iconMap[srv.icon] || HelpCircle;
          return (
            <div
              key={srv._id || srv.id || srv.name}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 group-hover:from-indigo-600 group-hover:to-blue-600 group-hover:text-white transition-all flex items-center justify-center shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>SLA: {srv.slaDays || 3} Days</span>
                  </span>
                </div>

                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {srv.department}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                  {srv.name}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Official Portal</span>
                <button
                  onClick={() => handleOpenRequest(srv)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Request Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No services match your search.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDept('All');
            }}
            className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Modal */}
      <CreateRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedService={activeService}
        onRequestCreated={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default StudentServicesPage;
