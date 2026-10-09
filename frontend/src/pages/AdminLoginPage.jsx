import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  KeyRound,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide administrative email and credentials.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role !== 'admin' && user.role !== 'faculty') {
        setError('This portal is reserved for Campus Administrators and Faculty Leads.');
        return;
      }
      showToast(`Welcome, ${user.name}! Administrative Command Center unlocked.`, 'success');
      navigate('/admin');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Administrative authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickAdmin = () => {
    setEmail('admin@campus.edu');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 mb-3">
          <Shield className="w-8 h-8" />
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-2">
          Executive Access Gate
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin & Faculty Command Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Smart Campus Service Management System • Authorized Personnel Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 sm:px-8 shadow-2xl border border-slate-700/80 rounded-3xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Administrative Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Enter Admin Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo 1-Click Filler */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Codethon Evaluator Access</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handle1ClickAdmin}
              className="w-full p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/40 text-left flex items-center justify-between text-xs text-indigo-200 transition-colors"
            >
              <div>
                <span className="font-bold text-white block">Dr. Admin Sharma (Director)</span>
                <span className="text-[10px] text-slate-400 font-mono">admin@campus.edu</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                1-Click Fill
              </span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-xs text-slate-400 flex items-center justify-between">
            <Link to="/login" className="hover:text-white transition-colors">
              ← Student Login
            </Link>
            <Link to="/" className="hover:text-white transition-colors">
              Campus Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
