import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";
import { usePayrollStore } from "store/payrollStore";
import {
  Search, FileText, Download, Filter,
  ChevronRight, AlertCircle, Calendar,
  MoreHorizontal, Loader2, Banknote, X,
  CalendarDays
} from "lucide-react";
import Sidebar from "components/ui/Sidebar";
import Header from "components/ui/Header";

// PDF Libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentYear = new Date().getFullYear();

const EmployeePayrollPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { payrolls, fetchEmployeePayrolls, loading } = usePayrollStore();
  

  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  // New Filter States
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("");

  // States for PDF Preview
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const pdfRef = useRef();

 useEffect(() => {
  // 🔹 Check karein ki user profile load ho chuki hai
  if (user) {
    // Priority: employee object ki ID, then fallback to user.id
    const targetId = user.employee?.id || user.id; 
    
    console.log("Calling Store with ID:", targetId);
    fetchEmployeePayrolls(targetId);
  }
}, [user, fetchEmployeePayrolls]);

  // ========== PDF DOWNLOAD LOGIC ==========
  const downloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${monthNames[selectedPayroll.month - 1]}_${selectedPayroll.year}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  // ========== ADVANCED FILTERING LOGIC ==========
  const filteredPayrolls = useMemo(() => {
    if (!payrolls || !Array.isArray(payrolls)) return [];

    return payrolls.filter((p) => {
      // 1. Status Filter (Paid/Pending)
      const statusMatch = activeTab === "All" || p.status?.toLowerCase() === activeTab.toLowerCase();
      
      // 2. Month Filter
      const monthMatch = selectedMonth === "All" || p.month === parseInt(selectedMonth);
      
      // 3. Year Filter
      const yearMatch = selectedYear === "" || p.year?.toString().includes(selectedYear);

      // 4. Search Input (Global Search)
      const mName = monthNames[p.month - 1] || "";
      const searchMatch = searchTerm === "" || 
                         mName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.year?.toString().includes(searchTerm) ||
                         p.id.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && monthMatch && yearMatch && searchMatch;
    });
  }, [payrolls, activeTab, searchTerm, selectedMonth, selectedYear]);

  // ========== DYNAMIC STATS ==========
  const stats = useMemo(() => {
    if (!payrolls || payrolls.length === 0) return { ytd: 0, lastNet: 0, pending: 0 };
    const ytd = payrolls.reduce((acc, curr) => acc + (Number(curr.netSalary) || 0), 0);
    const lastNet = Number(payrolls[0]?.netSalary) || 0;
    const pending = payrolls.filter(p => p.status !== 'paid').length;
    return { ytd, lastNet, pending };
  }, [payrolls]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 mt-16 overflow-y-auto p-4 md:p-8 space-y-6 pb-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payroll History</h1>
              <p className="text-sm text-slate-500">Welcome, {user?.name || "Employee"}. View your earnings summary.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-xs font-black text-slate-700 hover:shadow-md transition-all rounded-xl">
              {/* <Download size={14} /> Download YTD Report */}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Year to Date" value={`₹${stats.ytd.toLocaleString('en-IN')}`} icon={<Banknote size={20} />} color="indigo" loading={loading} />
            <StatCard title="Last Payout" value={`₹${stats.lastNet.toLocaleString('en-IN')}`} icon={<FileText size={20} />} color="emerald" loading={loading} />
            <StatCard title="Pending Review" value={stats.pending} icon={<Loader2 size={20} />} color="amber" loading={loading} />
            <StatCard title="Current Year" value={currentYear} icon={<Calendar size={20} />} color="slate" loading={loading} />
          </div>

          {/* Filters & Data Container */}
          <div className="bg-white border border-slate-200  overflow-hidden ">
            
            {/* Toolbar Section */}
            <div className="p-5 border-b border-slate-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex bg-slate-100 p-1 ">
                  {["All", "Paid", "Pending"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-1.5 text-[11px] font-black uppercase  transition-all ${
                        activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Advanced Filter Inputs */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Month Select */}
                  <div className="relative">
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="All">All Months</option>
                      {monthNames.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Year Input */}
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Year (e.g. 2026)"
                      className="w-24 pl-3 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    />
                  </div>

                  {/* Global Search */}
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search ID or Keyword..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Clear Filters */}
                  {(selectedMonth !== "All" || selectedYear !== "" || searchTerm !== "") && (
                    <button 
                      onClick={() => {setSelectedMonth("All"); setSelectedYear(""); setSearchTerm("");}}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="Clear Filters"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Billing Period</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <LoadingRows />
                  ) : filteredPayrolls.length > 0 ? (
                    filteredPayrolls.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => { setSelectedPayroll(p); setIsPreviewOpen(true); }}
                        className="hover:bg-slate-50 transition-all cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <span className="text-[10px] font-black">{monthNames[p.month - 1]}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{monthNames[p.month - 1]} {p.year}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">REF: {p.id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-900 tracking-tight">₹{Number(p.netSalary).toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {p.status === 'paid' ? 'Completed' : 'Processing'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                           <span className="px-2 py-1 bg-green-500 text-white rounded-full">View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-20 text-center">
                        <AlertCircle className="mx-auto text-slate-200 mb-2" size={48} />
                        <p className="text-slate-400 font-bold italic text-sm">No payroll records match these filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Preview Modal */}
        {isPreviewOpen && selectedPayroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white  w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
              <div ref={pdfRef} className="p-8 bg-white">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Salary Payslip</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{monthNames[selectedPayroll.month - 1]} {selectedPayroll.year}</p>
                </div>
                <div className="space-y-4">
                  <DetailRow label="Employee" value={user?.name} />
                  <DetailRow label="Basic Salary" value={`₹${selectedPayroll.basicSalary}`} />
                  <DetailRow label="Allowances" value={`₹${selectedPayroll.allowances}`} />
                  <DetailRow label="Deductions" value={`- ₹${selectedPayroll.deductions}`} isRed />
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Net Amount</span>
                    <span className="text-xl font-black text-slate-900">₹{Number(selectedPayroll.netSalary).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button onClick={() => setIsPreviewOpen(false)} className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100">Close</button>
                <button onClick={downloadPDF} className="flex-1 px-6 py-3 bg-indigo-600  text-xs font-black text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color, loading }) => (
  <div className={`bg-white p-5 border border-slate-200  flex items-start justify-between`}>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      {loading ? <div className="h-7 w-24 bg-slate-50 animate-pulse rounded mt-2" /> : <h3 className="text-xl font-black text-slate-900 mt-1">{value}</h3>}
    </div>
    <div className={`p-2.5 bg-${color}-50 text-${color}-600 rounded-xl`}>{icon}</div>
  </div>
);

const DetailRow = ({ label, value, isRed }) => (
  <div className="flex justify-between border-b border-slate-50 pb-2">
    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-bold ${isRed ? 'text-red-500' : 'text-slate-800'}`}>{value}</span>
  </div>
);

const LoadingRows = () => (
  <>
    {[1, 2, 3].map((i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4"><div className="h-12 w-full bg-slate-50 rounded-xl" /></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-50 rounded" /></td>
        <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-50 rounded-full" /></td>
        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-50 rounded ml-auto" /></td>
      </tr>
    ))}
  </>
);

export default EmployeePayrollPage;