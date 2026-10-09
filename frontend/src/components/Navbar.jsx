import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  GraduationCap,
  Bell,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  CheckCheck,
  ChevronDown,
  Clock,
  Sparkles,
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Left Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                SmartCampus
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 ml-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                SMS
              </span>
            </div>
          </Link>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Role Indicator Badge */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {isAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Admin / Faculty Portal</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Student Portal</span>
                </>
              )}
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif._id || notif.id}
                        onClick={() => {
                          markAsRead(notif._id || notif.id);
                          if (notif.requestId) {
                            setShowNotifDropdown(false);
                            navigate(isAdmin ? `/admin/requests?search=${notif.requestId}` : `/my-requests?search=${notif.requestId}`);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                          !notif.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full inline-block ${
                              !notif.read ? 'bg-indigo-600' : 'bg-transparent'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-800 font-medium leading-snug">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.createdAt).toLocaleDateString()} •{' '}
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-3 py-2 border-t border-slate-100 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {user.studentId || user.role}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                      {user.department} {user.semester ? `• ${user.semester}` : ''}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Dashboard
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Bell className="w-4 h-4 text-slate-500" />
                      Notifications
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
