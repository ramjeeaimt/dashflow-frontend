import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";
import { usePayrollStore } from "store/payrollStore";
import { 
  Search, FileText, Download, Filter, 
  ChevronRight, AlertCircle, Calendar,
  MoreHorizontal, Loader2, Banknote, X
} from "lucide-react";
import Sidebar from "components/ui/Sidebar";
import Header from "components/ui/Header";

// PDF Libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EmployeePayrollPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { payrolls, fetchEmployeePayrolls, loading } = usePayrollStore();

  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for PDF Preview
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    if (user.id || user.employeeId) {
      console.log("EmployeeId:", user.employeeId);
      fetchEmployeePayrolls(user.employeeId);
    }
  }, [user]);

  // ========== PDF DOWNLOAD LOGIC (Error Free) ==========
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
      pdf.save(`Payslip_${monthNames[selectedPayroll.month-1]}_${selectedPayroll.year}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  // ========== DYNAMIC FILTERING & SEARCH (Your Original Logic) ==========
  const filteredPayrolls = useMemo(() => {
    if (!payrolls || !Array.isArray(payrolls)) return [];
    
    return payrolls.filter((p) => {
      const mName = monthNames[p.month - 1] || "";
      const statusMatch = activeTab === "All" || p.status?.toLowerCase() === activeTab.toLowerCase();
      const searchMatch = mName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.year?.toString().includes(searchTerm);
      
      return statusMatch && searchMatch;
    });
  }, [payrolls, activeTab, searchTerm]);

  // ========== DYNAMIC STATS (Your Original Logic) ==========
  const stats = useMemo(() => {
    if (!payrolls || payrolls.length === 0) return { ytd: 0, lastNet: 0, pending: 0 };
    
    const ytd = payrolls.reduce((acc, curr) => acc + (Number(curr.netSalary) || 0), 0);
    const lastNet = Number(payrolls[0]?.netSalary) || 0;
    const pending = payrolls.filter(p => p.status !== 'paid').length;

    return { ytd, lastNet, pending };
  }, [payrolls]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 ml-56 mt-10 overflow-y-auto p-4 md:p-8 space-y-6">
          {/* Section 1: Dynamic Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payroll History</h1>
              <p className="text-sm text-slate-500">Welcome, {user?.name || "Employee"}. View your earnings and tax summaries.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200  text-xs font-bold text-slate-700 hover:shadow-md transition-all">
                <Download size={14} /> Download YTD Report
              </button>
            </div>
          </div>

          {/* Section 2: Real-time Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Year to Date" value={`₹${stats.ytd.toLocaleString('en-IN')}`} icon={<Banknote size={20}/>} color="indigo" loading={loading} />
            <StatCard title="Last Payout" value={`₹${stats.lastNet.toLocaleString('en-IN')}`} icon={<FileText size={20}/>} color="emerald" loading={loading} />
            <StatCard title="Pending Review" value={stats.pending} icon={<Loader2 size={20}/>} color="amber" loading={loading} />
            <StatCard title="Next Cycle" value="Apr 01" icon={<Calendar size={20}/>} color="slate" loading={loading} />
          </div>

          {/* Section 3: Data Container */}
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                {["All", "Paid", "Pending"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 md:px-6 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter by month or year..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Dynamic Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Billing Period</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4 text-right">Statement</th>
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
                              <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {p.id.slice(-6)}</p>
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
                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            {p.status === 'paid' ? 'Completed' : 'Processing'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-20 text-center">
                        <AlertCircle className="mx-auto text-slate-200 mb-2" size={48} />
                        <p className="text-slate-400 font-bold">No dynamic data found matching your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* ========== PREVIEW MODAL (Integrated Feature) ========== */}
        {isPreviewOpen && selectedPayroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
              {/* PDF Content Area */}
              <div ref={pdfRef} className="p-8 bg-white">
                <div className="text-center mb-6">
                   <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Salary Payslip</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{monthNames[selectedPayroll.month-1]} {selectedPayroll.year}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Employee</span>
                    <span className="text-sm font-bold text-slate-800">{user?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Basic Salary</span>
                    <span className="text-sm font-bold text-slate-800">₹{selectedPayroll.basicSalary}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Allowances</span>
                    <span className="text-sm font-bold text-slate-800">₹{selectedPayroll.allowances}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2 text-red-500">
                    <span className="text-[10px] font-black uppercase">Deductions</span>
                    <span className="text-sm font-bold">- ₹{selectedPayroll.deductions}</span>
                  </div>
                  <div className="flex justify-between pt-4">
                    <span className="text-xs font-black text-indigo-600 uppercase">Net Amount Paid</span>
                    <span className="text-xl font-black text-slate-900">₹{Number(selectedPayroll.netSalary).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-100 text-[8px] text-slate-300 text-center uppercase font-bold tracking-widest">
                  Official Record • {selectedPayroll.id}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 bg-slate-50 flex gap-3">
                <button onClick={() => setIsPreviewOpen(false)} className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all">
                  Close
                </button>
                <button 
                  onClick={downloadPDF}
                  className="flex-1 px-6 py-3 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={14}/> Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ========== HELPER COMPONENTS (Your Original Content) ==========

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className={`bg-white p-5  border border-slate-200 shadow-sm flex items-start justify-between`}>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      {loading ? (
        <div className="h-7 w-24 bg-slate-100 animate-pulse rounded mt-2" />
      ) : (
        <h3 className="text-xl font-black text-slate-900 mt-1">{value}</h3>
      )}
    </div>
    <div className={`p-2 bg-${color}-50 text-${color}-600 rounded-xl`}>
      {icon}
    </div>
  </div>
);

const LoadingRows = () => (
  <>
    {[1, 2, 3, 4].map((i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded-lg" /></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded" /></td>
        <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded-full" /></td>
        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 rounded ml-auto" /></td>
      </tr>
    ))}
  </>
);

export default EmployeePayrollPage;