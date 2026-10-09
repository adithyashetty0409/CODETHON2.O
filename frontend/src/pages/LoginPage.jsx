import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  GraduationCap,
  Lock,
  Mail,
  Shield,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  KeyRound,
  User,
} from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.state?.defaultRole === 'admin' ? 'admin' : 'student'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin' || user.role === 'faculty') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid credentials. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (e, p, tab) => {
    setEmail(e);
    setPassword(p);
    setActiveTab(tab);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Icon & Heading */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Smart Campus
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your institutional credentials to access your service portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl border border-slate-200 rounded-3xl">
          {/* Role Tabs */}
          <div className="flex p-1 mb-6 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'student'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin / Faculty</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder={
                    activeTab === 'admin' ? 'admin@campus.edu' : 'alex@student.edu'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Fillers */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>Codethon 1-Click Fillers</span>
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() =>
                  setCredentials('admin@campus.edu', 'Admin@123', 'admin')
                }
                className="w-full py-1.5 px-3 rounded-lg text-left text-xs bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 text-slate-700 font-medium flex items-center justify-between transition-colors"
              >
                <span>🛡️ Admin: Dr. Admin Sharma</span>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">Auto-fill</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setCredentials('alex@student.edu', 'Student@123', 'student')
                }
                className="w-full py-1.5 px-3 rounded-lg text-left text-xs bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 text-slate-700 font-medium flex items-center justify-between transition-colors"
              >
                <span>🎓 Student: Alex Morgan (CS Sem 6)</span>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">Auto-fill</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setCredentials('priya@student.edu', 'Student@123', 'student')
                }
                className="w-full py-1.5 px-3 rounded-lg text-left text-xs bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 text-slate-700 font-medium flex items-center justify-between transition-colors"
              >
                <span>🎓 Student: Priya Patel (ECE Sem 4)</span>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">Auto-fill</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
