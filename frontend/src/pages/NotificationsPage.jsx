import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id || notif.id);
    if (notif.requestId) {
      if (isAdmin) {
        navigate(`/admin/requests?search=${notif.requestId}`);
      } else {
        navigate(`/my-requests?search=${notif.requestId}`);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time assignment updates, status transitions, and SLA alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are all caught up! New updates on your service tickets will appear here.
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            const isEscalation = notif.type === 'escalation' || notif.message.includes('overdue');
            const isSuccess = notif.type === 'success' || notif.message.includes('Completed');

            return (
              <div
                key={notif._id || notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start gap-4 ${
                  !notif.read ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className="shrink-0 mt-1">
                  {isEscalation ? (
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : isSuccess ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Info className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      {notif.message}
                    </p>
                    {!notif.read && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {notif.requestId && (
                      <span className="font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.2 rounded border border-indigo-200/60">
                        {notif.requestId}
                      </span>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 self-center" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
