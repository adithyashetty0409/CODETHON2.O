import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Clock,
  ArrowRight,
  Shield,
  FileCheck,
  Cpu,
  Wrench,
  BookOpen,
} from 'lucide-react';

const departmentsData = [
  {
    name: 'Administration Department',
    code: 'ADMIN',
    lead: 'Ms. Sunita Rao (Head Registrar)',
    staffCount: 6,
    avgSla: '3.0 days',
    icon: Building2,
    servicesHandled: ['Certificate Request', 'ID Card Request'],
    description: 'Handles official student attestations, ID reissuance, bonafide verification, and general records.',
  },
  {
    name: 'Laboratory Department',
    code: 'LAB',
    lead: 'Dr. K. Raman (Lab In-Charge)',
    staffCount: 8,
    avgSla: '2.0 days',
    icon: Cpu,
    servicesHandled: ['Lab Equipment Request', 'Computing Workstations'],
    description: 'Oversees computer labs, VLSI testing equipment, 3D printing facilities, and server allocation.',
  },
  {
    name: 'Maintenance Department',
    code: 'MAINT',
    lead: 'Ramesh Kumar (Facility Supervisor)',
    staffCount: 12,
    avgSla: '1.5 days',
    icon: Wrench,
    servicesHandled: ['Maintenance Request', 'Electrical & HVAC'],
    description: 'Campus civil maintenance, air conditioning, projector systems, classroom plumbing, and emergency fixes.',
  },
  {
    name: 'HOD/Academic Department',
    code: 'ACAD',
    lead: 'Prof. Anjali Mehta / Dr. V. Srinivasan',
    staffCount: 14,
    avgSla: '2.0 days',
    icon: FileCheck,
    servicesHandled: ['Leave Application', 'Academic Approvals'],
    description: 'Academic permissions, medical leave approvals, course syllabus concessions, and HOD verifications.',
  },
  {
    name: 'Library Department',
    code: 'LIB',
    lead: 'Mr. David Paul (Chief Librarian)',
    staffCount: 5,
    avgSla: '2.0 days',
    icon: BookOpen,
    servicesHandled: ['Library Service', 'Journal Portals'],
    description: 'Book lending, research journal subscriptions, institutional access credentials, and study room allocation.',
  },
  {
    name: 'General Administration',
    code: 'GEN-ADMIN',
    lead: 'Dr. Admin Sharma (Director)',
    staffCount: 4,
    avgSla: '2.5 days',
    icon: Shield,
    servicesHandled: ['Other College Service', 'Grievance Redressal'],
    description: 'General student inquiries, lost & found claims, campus transport coordination, and welfare escalations.',
  },
];

const AdminDepartmentsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Campus Departments & Service Units
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Operational wings, assigned faculty leads, and service delivery channels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departmentsData.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.name}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">{dept.lead}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {dept.description}
                </p>

                <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Staff Personnel:</span>
                    <strong className="text-slate-800">{dept.staffCount} Officers</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Target Resolution:</span>
                    <strong className="text-slate-800">{dept.avgSla}</strong>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dept.servicesHandled.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() =>
                    navigate(`/admin/requests?department=${encodeURIComponent(dept.name)}`)
                  }
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Department Requests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDepartmentsPage;
