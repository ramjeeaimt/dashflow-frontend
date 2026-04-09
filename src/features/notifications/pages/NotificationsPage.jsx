import React, { useEffect, useState, useMemo } from "react";
import {
  Bell, Clock, CreditCard, CheckSquare, UserPlus, Settings,
  AlertTriangle, Search, Filter, Trash2, CheckCheck, Eye,
  ChevronDown, ArrowUpRight, Inbox, Calendar, RefreshCw
} from "lucide-react";
import Sidebar from "components/ui/Sidebar";
import Header from "components/ui/Header";
import useNotificationStore from "store/useNotificationStore";
import notificationService from "services/notification.service";
import { formatDistanceToNow, format } from "date-fns";
import useAuthStore from "store/useAuthStore";

const NotificationsPage = () => {
  const { notifications } = useNotificationStore();
  const { user } = useAuthStore();
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);

  const isAdmin = user?.role === "Admin" || user?.role === "Super Admin" || user?.role === "admin";

  const getTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return "just now";
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "just now";
    }
  };

  const getFormattedDate = (timestamp) => {
    try {
      if (!timestamp) return "";
      return format(new Date(timestamp), "MMM dd, yyyy • hh:mm a");
    } catch (e) {
      return "";
    }
  };

  const getNotificationType = (notification) => {
    return notification?.metadata?.type || notification?.type || "system";
  };

  const iconConfig = {
    TASK_ASSIGNED: { icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Task" },
    LEAVE_REQUEST: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Leave Request" },
    LEAVE_STATUS: { icon: Clock, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", label: "Leave Status" },
    PAYROLL_GENERATED: { icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Payroll" },
    WELCOME: { icon: UserPlus, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", label: "Welcome" },
    system: { icon: Settings, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "System" },
    reminder: { icon: Bell, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", label: "Reminder" },
    alert: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Alert" },
  };

  const getConfig = (notification) => {
    const type = getNotificationType(notification);
    return iconConfig[type] || iconConfig.system;
  };

  const filterOptions = [
    { key: "ALL", label: "All", icon: Inbox },
    { key: "LEAVE_REQUEST", label: "Leave Requests", icon: Clock },
    { key: "LEAVE_STATUS", label: "Leave Status", icon: Clock },
    { key: "PAYROLL_GENERATED", label: "Payroll", icon: CreditCard },
    { key: "TASK_ASSIGNED", label: "Tasks", icon: CheckSquare },
  ];

  const filteredNotifications = useMemo(() => {
    return (notifications || []).filter((n) => {
      const type = getNotificationType(n);
      const typeMatch = filterType === "ALL" || type === filterType;
      const searchMatch =
        !searchTerm ||
        (n.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.message || "").toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [notifications, filterType, searchTerm]);

  const stats = useMemo(() => {
    const all = notifications || [];
    return {
      total: all.length,
      unread: all.filter((n) => !n.read).length,
      leaves: all.filter((n) => {
        const t = getNotificationType(n);
        return t === "LEAVE_REQUEST" || t === "LEAVE_STATUS";
      }).length,
      payroll: all.filter((n) => getNotificationType(n) === "PAYROLL_GENERATED").length,
      tasks: all.filter((n) => getNotificationType(n) === "TASK_ASSIGNED").length,
    };
  }, [notifications]);

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        await notificationService.clearAll();
      } catch (err) {
        console.error("Failed to clear notifications:", err);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(
      selectedNotification?.id === notification?.id ? null : notification
    );
  };

  const navigateToAction = (notification) => {
    const type = getNotificationType(notification);
    if (notification?.actionUrl) {
      window.location.href = notification.actionUrl;
    } else if (type === "LEAVE_REQUEST") {
      window.location.href = "/employee-leave";
    } else if (type === "LEAVE_STATUS") {
      window.location.href = "/employee/leaves";
    } else if (type === "PAYROLL_GENERATED") {
      window.location.href = "/employee/payroll";
    } else if (type === "TASK_ASSIGNED") {
      window.location.href = "/projects";
    }
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach((n) => {
      let dateKey;
      try {
        const d = new Date(n.timestamp || n.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
          dateKey = "Today";
        } else if (d.toDateString() === yesterday.toDateString()) {
          dateKey = "Yesterday";
        } else {
          dateKey = format(d, "EEEE, MMM dd, yyyy");
        }
      } catch {
        dateKey = "Earlier";
      }
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 ml-56 overflow-y-auto p-6 md:p-8 mt-14">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <Bell size={14} /> Notification Center
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  All Notifications
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  {isAdmin ? "View all system notifications and employee activities" : "View your personal notifications and updates"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <Trash2 size={14} /> Clear all
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total" value={stats.total} icon={<Bell size={18} />} color="indigo" />
            <StatCard label="Unread" value={stats.unread} icon={<Eye size={18} />} color="amber" />
            <StatCard label="Leave" value={stats.leaves} icon={<Clock size={18} />} color="purple" />
            <StatCard label="Payroll" value={stats.payroll} icon={<CreditCard size={18} />} color="emerald" />
            <StatCard label="Tasks" value={stats.tasks} icon={<CheckSquare size={18} />} color="blue" />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex bg-white p-1 border border-slate-200 rounded-xl overflow-hidden">
              {filterOptions.map((opt) => {
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setFilterType(opt.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      filterType === opt.key
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <IconComp size={13} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <EmptyState filterType={filterType} />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([dateGroup, items]) => (
                <div key={dateGroup}>
                  {/* Date Group Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {dateGroup}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-semibold">
                      {items.length} notification{items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Notification Cards */}
                  <div className="space-y-3">
                    {items.map((notification) => {
                      const config = getConfig(notification);
                      const IconComp = config.icon;
                      const isSelected = selectedNotification?.id === notification.id;
                      const priority = notification?.metadata?.priority || notification?.priority;

                      return (
                        <div key={notification.id} className="group">
                          <div
                            onClick={() => handleNotificationClick(notification)}
                            className={`relative bg-white border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected
                                ? `${config.border} shadow-md ring-1 ring-offset-1 ring-${config.color}`
                                : "border-slate-200 hover:border-slate-300"
                            } ${!notification.read ? "border-l-4 " + config.border : ""}`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                <IconComp size={20} className={config.color} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color} ${config.bg} px-2 py-0.5 rounded-md`}>
                                        {config.label}
                                      </span>
                                      {priority === "high" || priority === "HIGH" ? (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                          High Priority
                                        </span>
                                      ) : null}
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                      )}
                                    </div>
                                    <h3 className={`text-sm font-bold ${!notification.read ? "text-slate-900" : "text-slate-600"}`}>
                                      {notification.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                      {notification.message}
                                    </p>
                                  </div>

                                  {/* Time */}
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                                      {getTimeAgo(notification.timestamp || notification.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Detail */}
                            {isSelected && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Message</p>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Received</p>
                                      <p className="text-sm text-slate-700 font-semibold">
                                        {getFormattedDate(notification.timestamp || notification.createdAt)}
                                      </p>
                                    </div>
                                    {notification.metadata?.status && (
                                      <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                                          notification.metadata.status === "APPROVED"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : notification.metadata.status === "REJECTED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-amber-100 text-amber-700"
                                        }`}>
                                          {notification.metadata.status}
                                        </span>
                                      </div>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToAction(notification);
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                    >
                                      <ArrowUpRight size={14} />
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ─── Sub-Components ──────────────────────────────────────────────

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white border border-${color}-100 rounded-2xl p-4 hover:shadow-md transition-all`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600`}>
        {icon}
      </div>
    </div>
  </div>
);

const EmptyState = ({ filterType }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <Inbox size={36} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-bold text-slate-700 mb-2">No notifications found</h3>
    <p className="text-sm text-slate-500 max-w-sm text-center">
      {filterType === "ALL"
        ? "You're all caught up! New notifications will appear here as they arrive."
        : `No ${filterType.toLowerCase().replace("_", " ")} notifications right now.`}
    </p>
  </div>
);

export default NotificationsPage;
