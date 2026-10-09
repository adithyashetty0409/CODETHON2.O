import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  Layers,
  FileText,
  Cpu,
  Wrench,
  CalendarCheck,
  CreditCard,
  BookOpen,
  HelpCircle,
  BarChart3,
  Users,
  Building,
  KeyRound,
  Zap,
} from 'lucide-react';

const iconMap = {
  FileText,
  Cpu,
  Wrench,
  CalendarCheck,
  CreditCard,
  BookOpen,
  HelpCircle,
};

const LandingPage = () => {
  const { user, login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await servicesApi.getAll();
        if (res.data?.data) {
          setServices(res.data.data);
        }
      } catch (e) {}
    };
    fetchServices();
  }, []);

  const handleQuickDemoLogin = async (email, password, role) => {
    try {
      setDemoLoading(true);
      await login(email, password);
      showToast(`Welcome! Logged in as ${role === 'admin' ? 'Campus Administrator' : 'Student'}.`, 'success');
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      showToast('Login failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                SmartCampus
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 ml-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                SMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/70 text-indigo-700 text-xs font-bold border border-indigo-200/60 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Official College Codethon Platform 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Smart Campus{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Service Management
            </span>{' '}
            System
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Submit, track and manage campus services from one centralized platform. From certificates and lab gear to maintenance tickets and leave requests — fully streamlined with real-time SLA tracking.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center gap-2"
            >
              <span>Student Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
            >
              Register New Student
            </Link>
            <Link
              to="/admin/login"
              className="px-6 py-3 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin / Faculty Portal</span>
            </Link>
          </div>

          {/* Quick Demo 1-Click Launchers */}
          <div className="mt-12 p-4 sm:p-5 max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-200/80 shadow-lg text-left">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Codethon Instant Demo Accounts (1-Click Login)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">No typing required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                disabled={demoLoading}
                onClick={() => handleQuickDemoLogin('admin@campus.edu', 'Admin@123', 'admin')}
                className="p-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 hover:from-indigo-100 hover:to-purple-100 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">Campus Admin</span>
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Dr. Admin Sharma</p>
                <p className="text-[10px] text-indigo-600 font-mono mt-1 group-hover:underline">
                  admin@campus.edu →
                </p>
              </button>

              <button
                disabled={demoLoading}
                onClick={() => handleQuickDemoLogin('alex@student.edu', 'Student@123', 'student')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Student #1</span>
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Alex Morgan (CS Sem 6)</p>
                <p className="text-[10px] text-blue-600 font-mono mt-1 group-hover:underline">
                  alex@student.edu →
                </p>
              </button>

              <button
                disabled={demoLoading}
                onClick={() => handleQuickDemoLogin('priya@student.edu', 'Student@123', 'student')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Student #2</span>
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Priya Patel (ECE Sem 4)</p>
                <p className="text-[10px] text-purple-600 font-mono mt-1 group-hover:underline">
                  priya@student.edu →
                </p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Modern Campus Operations Engine
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Designed to replace slow paper-based college workflows with automated ticketing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Easy Requests</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Submit academic, facility, or administrative requests in under 30 seconds with automatic department routing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Real-Time Tracking</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Follow your ticket through Pending, Assigned, In Progress, and Completed stages with live status timeline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Faster Resolution</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Automated escalation alerts prevent delays and maintain a 2.4-day average resolution turnaround.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Centralized Analytics</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Faculty & admin dashboards with department workload meters, priority queues, and audit history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Services Directory Preview */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Full Campus Support
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Available Campus Services
              </h2>
            </div>
            <Link
              to="/login"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Explore all services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((srv) => {
              const Icon = iconMap[srv.icon] || HelpCircle;
              return (
                <div
                  key={srv._id || srv.id || srv.name}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {srv.department}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{srv.name}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Standard SLA: <strong className="text-slate-700">{srv.slaDays || 3} Days</strong>
                    </span>
                    <Link
                      to="/login"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      Request Service →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white">Smart Campus SMS</span>
            <span>• College Codethon 2026</span>
          </div>
          <p>© 2026 Smart Campus Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
