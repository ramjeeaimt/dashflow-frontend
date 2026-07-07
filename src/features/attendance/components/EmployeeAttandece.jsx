import React, { useState, useEffect, useMemo } from "react";
import attendanceService from "services/attendance.service";
import useAuthStore from "store/useAuthStore";
import { Search, Calendar, FileDown, Clock, MapPin } from "lucide-react";
import Header from "components/ui/Header";
import Sidebar from "components/ui/Sidebar";
import WFHRequestModal from "./WFHRequestModal";
import WorkFromHomeRequestList from "./WorkFromHomeRequestList";
import Icon from "../../../components/AppIcon";


const AttendanceHistory = () => {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isWFHModalOpen, setIsWFHModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');


  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2024, 2025, 2026];

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await attendanceService.getAll({ employeeId: user?.id });
        setLogs(Array.isArray(res) ? res : []);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchLogs();
  }, [user]);

  // Logic: Filter & 10:00 AM Threshold
  const filteredData = useMemo(() => {
    return logs.filter(log => {
      const d = new Date(log.date);
      const matchesDate = d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
      const matchesSearch = log.status?.toLowerCase().includes(searchTerm.toLowerCase()) || log.date.includes(searchTerm);
      return matchesDate && matchesSearch;
    }).map(log => {
      let isLate = false;
      if (log.checkInTime) {
        const [hrs, mins] = log.checkInTime.split(':').map(Number);
        if (hrs > 10 || (hrs === 10 && mins > 0)) isLate = true;
      }
      return { ...log, isLate };
    });
  }, [logs, selectedMonth, selectedYear, searchTerm]);

  const stats = useMemo(() => {
    const late = filteredData.filter(l => l.isLate).length;
    const present = filteredData.length - late;
    const totalHrs = filteredData.reduce((acc, curr) => acc + (parseFloat(curr.workHours) || 0), 0);
    return { late, present, totalHrs: totalHrs.toFixed(1) };
  }, [filteredData]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/50 font-sans text-foreground">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className={`transition-all duration-300 ${
 sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
 } pt-16 pb-8`}>
        <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Attendance Overview</h1>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto bg-card p-1 rounded-lg border border-border">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={14} />
              <input
                type="text"
                placeholder="Search..."
                className="text-xs pl-8 pr-3 py-2 outline-none w-full md:w-44 border-r border-border"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold px-2 py-2 outline-none bg-transparent cursor-pointer"
            >
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-bold px-2 py-2 outline-none bg-transparent cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={() => setIsWFHModalOpen(true)}
              className="bg-primary text-white px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm "
            >
              Request Work From Home
            </button>
            <button className="bg-sidebar text-white px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
              <FileDown size={14} /> Export
            </button>
          </div>
        </div>

        {/* Medium Stat Cards - Balanced & Bold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Monthly Present" value={stats.present} color="text-emerald-600" sub="Days on-time" />
          <StatCard label="Late Arrivals" value={stats.late} color="text-amber-600" sub="After 10:00 AM" />
          <StatCard label="Total Hours" value={stats.totalHrs} color="text-primary" sub="Working time" />
          <StatCard label="Working Days" value={filteredData.length} color="text-foreground" sub="In this month" />
        </div>

        {/* Tab System */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="flex border-b border-border bg-muted/30">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'logs'
 ? 'bg-card text-primary border-b-2 border-primary'
 : 'text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/60'
 }`}
            >
              <Calendar size={14} />
              Attendance Logs
            </button>
            <button
              onClick={() => setActiveTab('wfh')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'wfh'
 ? 'bg-card text-primary border-b-2 border-primary'
 : 'text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/60'
 }`}
            >
              <MapPin size={14} />
              WFH Requests
            </button>
          </div>

          <div className="p-0">
            {activeTab === 'logs' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      <th className="p-4 pl-6">Log Date</th>
                      <th className="p-4">Shift Status</th>
                      <th className="p-4 text-center">Timing (In - Out)</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4 pr-6 text-right">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan="5" className="p-12 text-center text-xs font-bold text-muted-foreground/70 uppercase tracking-wide">Refreshing logs...</td></tr>
                    ) : filteredData.length > 0 ? filteredData.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/80 transition-all group cursor-default">
                        <td className="p-4 pl-6">
                          <div className="text-sm font-bold text-foreground">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-tighter mt-0.5">{new Date(log.date).toLocaleDateString('en-GB', { weekday: 'long' })}</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-semibold px-2.5 py-1 rounded border uppercase tracking-wider ${log.status === "wfh" ? "text-primary border-border bg-primary/10" :
 log.isLate ? "text-amber-600 border-amber-100 bg-amber-50" : "text-emerald-600 border-emerald-100 bg-emerald-50"
 }`}>
                            {log.status === "wfh" ? "WFH" : log.isLate ? "LATE ENTRY" : "ON TIME"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-xs font-bold text-foreground flex items-center justify-center gap-2">
                            {log.checkInTime || "--:--"} <span className="text-slate-200">→</span> {log.checkOutTime || "--:--"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <Clock size={12} className="text-indigo-400" /> {log.workHours || "0.0"} hrs
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground/70 font-medium">
                            {log.location === 'WFH' ? <Icon name="Home" size={12} className="text-indigo-400" /> : <MapPin size={12} />}
                            {log.location || (log.status === 'wfh' ? 'WFH' : 'Office')}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="p-16 text-center text-sm text-muted-foreground/70 font-medium italic">No attendance history found for this period.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-card min-h-[400px]">
                <WorkFromHomeRequestList employeeId={user?.id} />
              </div>
            )}
          </div>
        </div>
      </main>
      <WFHRequestModal
        isOpen={isWFHModalOpen}
        onClose={() => setIsWFHModalOpen(false)}
        employeeId={user?.id}
      />
    </div>
  </div>
);
};

// Balanced Stat Card Component
const StatCard = ({ label, value, color, sub }) => (
  <div className="bg-card border border-border p-6 rounded-lg group hover:border-border transition-all">
    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide leading-none mb-2">{label}</p>
    <h3 className={`text-3xl font-semibold tracking-tight ${color} leading-none`}>{value}</h3>
    <p className="text-[10px] text-muted-foreground/70 font-medium mt-2">{sub}</p>
  </div>
);

export default AttendanceHistory;