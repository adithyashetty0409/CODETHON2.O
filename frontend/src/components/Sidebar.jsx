import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Bell,
  PlusCircle,
  Clock,
  Loader2,
  CheckCircle2,
  Building2,
  LogOut,
  X,
  Shield,
  User,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, onOpenCreateModal }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Campus Services', path: '/services', icon: Layers },
    { name: 'My Requests', path: '/my-requests', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'All Requests', path: '/admin/requests', icon: FileText },
    { name: 'Pending Queue', path: '/admin/requests?status=Pending', icon: Clock },
    { name: 'In Progress', path: '/admin/requests?status=In Progress', icon: Loader2 },
    { name: 'Completed', path: '/admin/requests?status=Completed', icon: CheckCircle2 },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const navLinks = isAdmin ? adminLinks : studentLinks;

  const isLinkActive = (path) => {
    if (path.includes('?')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search === `?${query}`;
    }
    return location.pathname === path && !location.search;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              SC
            </div>
            <span className="font-bold text-slate-800">Smart Campus</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">{user?.department}</p>
              <div className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-100/60 px-1.5 py-0.2 rounded-md">
                {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                <span>{isAdmin ? 'Admin / Staff' : (user?.studentId || 'Student')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Button for Students */}
        {!isAdmin && onOpenCreateModal && (
          <div className="px-4 mb-3">
            <button
              onClick={() => {
                onOpenCreateModal();
                if (isOpen) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Request</span>
            </button>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isAdmin ? 'Administrative Menu' : 'Student Services'}
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          <div className="px-3 pt-2 text-[10px] text-slate-400 text-center">
            Smart Campus SMS • v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
