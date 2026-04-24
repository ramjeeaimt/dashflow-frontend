import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import React, { useState, useEffect } from 'react';
import { useLeaveStore } from 'store/useLeaveStore';
import { Search, Filter, Calendar, Clock, CheckCircle, List, Send, Plus, X } from 'lucide-react';

const LeaveDashboard = ({ employeeId: propEmployeeId }) => {
  const { isLoading, submitLeave, error: storeError, leaves, fetchEmployeeLeaves } = useLeaveStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isSuccess, setIsSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const activeId = propEmployeeId || user?.id || "";

  const [formData, setFormData] = useState({ startDate: '', endDate: '', type: 'casual', reason: '' });

  useEffect(() => {
    if (activeId) fetchEmployeeLeaves(activeId);
  }, [activeId]);

  // --- Search & Filter Logic ---
  const filteredLeaves = leaves?.filter(leave => {
    const matchesSearch = leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || (leave.status || 'PENDING').toUpperCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitLeave({ ...formData, employeeId: activeId, status: 'PENDING' });
    if (success) {
      setIsSuccess(true);
      setFormData({ startDate: '', endDate: '', type: 'casual', reason: '' });
      fetchEmployeeLeaves(activeId);
    }
    alert(success ? "Leave application submitted successfully!" : "Failed to submit leave application. Please try again.");
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        } min-h-screen flex flex-col pt-16 pb-8`}>
        <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 md:px-8 w-full">

          {/* 1. Header & Stats Component */}
          <div className="flex flex-col gap-8 mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My Leave Dashboard</h1>
                <p className="text-sm text-slate-500 font-medium">Manage and track your leave applications</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                  Active Session: {activeId.slice(0, 6)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total" value={leaves?.length} icon={<List size={16} />} />
              <StatCard label="Approved" value={leaves?.filter(l => l.status === 'APPROVED').length} icon={<CheckCircle size={16} />} color="text-emerald-600" />
              <StatCard label="Pending" value={leaves?.filter(l => l.status === 'PENDING').length} icon={<Clock size={16} />} color="text-amber-500" />
              <StatCard label="Rejected" value={leaves?.filter(l => l.status === 'REJECTED').length} icon={<X size={16} />} color="text-rose-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* 2. Left: Application Form (Flat Design) */}
            <div className="lg:col-span-5 border border-slate-200 bg-white rounded-xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Plus size={14} /> Request Leave
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Category</label>
                  <select name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900">
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="earned">Earned Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">From</label>
                    <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">To</label>
                    <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Note</label>
                  <textarea required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-slate-900" placeholder="Type your reason..."></textarea>
                </div>
                <button type="submit" disabled={isLoading} className="w-full h-11 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
                  {isLoading ? 'Sending...' : 'Submit Application'}
                </button>
              </form>
            </div>

            {/* 3. Right: List with Search & Filter */}
            <div className="lg:col-span-7">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by reason or type..."
                    className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2">
                  <Filter size={14} className="text-slate-400 ml-1" />
                  <select
                    className="h-9 text-xs font-bold text-slate-600 outline-none bg-transparent pr-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Leave Cards */}
              <div className="space-y-3">
                {filteredLeaves?.length > 0 ? (
                  filteredLeaves.map((leave, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-2 h-2 rounded-full ${getStatusColor(leave.status)}`} />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 capitalize">{leave.type} Leave</h4>
                          <p className="text-[11px] text-slate-400 font-medium">{leave.startDate} — {leave.endDate}</p>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">"{leave.reason}"</p>
                        </div>
                      </div>
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${getStatusText(leave.status)}`}>
                          {leave.status || 'PENDING'}
                        </span>
                        <span className="text-[9px] font-mono text-slate-300">REF:{leave.id?.slice(-5)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No matching records</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

// Helper Components & Logic
const StatCard = ({ label, value, icon, color = "text-slate-900" }) => (
  <div className="bg-white border border-slate-200 p-4  flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className={`text-xl font-bold mt-1 ${color}`}>{value || 0}</h3>
    </div>
    <div className="text-slate-200">{icon}</div>
  </div>
);

const getStatusColor = (s) => {
  if (s === 'APPROVED') return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
  if (s === 'REJECTED') return 'bg-rose-500';
  return 'bg-amber-400 animate-pulse';
};

const getStatusText = (s) => {
  if (s === 'APPROVED') return 'text-emerald-600';
  if (s === 'REJECTED') return 'text-rose-600';
  return 'text-amber-500';
};

export default LeaveDashboard;