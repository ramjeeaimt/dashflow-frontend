import React, { useEffect, useState, useMemo } from "react";
import { 
  Check, X, Clock, AlertCircle, ChevronDown, ChevronUp, 
  Info, Search, Filter, Download, UserCheck, CalendarDays,
  MoreVertical, MessageSquare, ShieldAlert
} from "lucide-react";
import financeService from "services/finance.service"; 
import Sidebar from "components/ui/Sidebar";
import Header from "components/ui/Header";

const AdminLeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [adminNote, setAdminNote] = useState({}); 

    const fetchAllLeaves = async () => {
        setLoading(true);
        try {
            const data = await financeService.getAllLeaves();
            setLeaves(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("UI Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllLeaves(); }, []);

    // MAIN DECISION FUNCTION
   // AdminLeaveManagement.jsx
const handleStatusUpdate = async (id, status) => {
    // 🛠️ Check: Agar MongoDB hai toh use leave._id, warna leave.id
    if (!id) return alert("Error: ID not found!");

    const note = adminNote[id] || ""; 
    
    try {
        // Service call matches @Patch(':id/status')
        await financeService.updateLeaveStatus(id, status, note);
        
        // UI Update logic (Aapka original logic)
        setLeaves(prev => prev.map(l => 
            (l._id === id || l.id === id) 
                ? { ...l, status: status.toUpperCase(), adminComment: note } 
                : l
        ));

        setExpandedRow(null);
        alert(`Status updated to ${status}!`);
    } catch (err) {
        console.error("Handler Error:", err);
        alert(err.response?.status === 404 
            ? "404: Endpoint mismatch! Check if BASE is '/leaves'" 
            : "Update failed!");
    }
};
    const filteredLeaves = useMemo(() => {
        return leaves.filter(l => {
            const statusMatch = filterStatus === "ALL" || l.status === filterStatus;
            const nameMatch = (l.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase());
            return statusMatch && nameMatch;
        });
    }, [leaves, filterStatus, searchTerm]);

    const stats = useMemo(() => ({
        pending: leaves.filter(l => l.status === "PENDING").length,
        approved: leaves.filter(l => l.status === "APPROVED").length,
        onLeaveToday: leaves.filter(l => l.status === "APPROVED").length, // Example logic
    }), [leaves]);

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 ml-56 overflow-y-auto p-4 md:p-8 space-y-6 mt-14">
                    
                    {/* Stats Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 bg-white p-6 ">
                        <div>
                            <div className="flex items-center gap-2 mb-1 text-indigo-900 font-bold text-xs uppercase tracking-widest">
                                <ShieldAlert size={14} /> Admin Control Panel
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leave & Attendance</h1>
                            <p className="text-sm text-slate-500 font-medium mt-1">Manage employee leave requests and approvals.</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <StatBox label="Pending Review" value={stats.pending} color="amber" icon={<Clock size={16}/>} />
                            <StatBox label="Active Approved" value={stats.approved} color="emerald" icon={<UserCheck size={16}/>} />
                            <StatBox label="Out Today" value={stats.onLeaveToday} color="rose" icon={<CalendarDays size={16}/>} />
                        </div>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex bg-white p-1  border">
                            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-5 py-2  text-[11px] font-black transition-all ${
                                        filterStatus === s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search by employee..." 
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200  text-sm focus:ring-2  outline-none transition-all"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Decision Table */}
                    <div className="bg-white border border-slate-200  overflow-hidden mb-10">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.15em]">
                                    <th className="px-8 py-6">Employee Info</th>
                                    <th className="px-8 py-6">Category</th>
                                    <th className="px-8 py-6">Schedule</th>
                                    <th className="px-8 py-6">Verification</th>
                                    <th className="px-8 py-6 text-right">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <SkeletonRows />
                                ) : filteredLeaves.map((leave) => (
                                    <LeaveRow 
                                        key={leave._id || leave.id} 
                                        leave={leave} 
                                        onUpdate={handleStatusUpdate}
                                        isExpanded={expandedRow === (leave._id || leave.id)}
                                        onToggle={() => setExpandedRow(expandedRow === (leave._id || leave.id) ? null : (leave._id || leave.id))}
                                        adminNote={adminNote}
                                        setAdminNote={setAdminNote}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

const LeaveRow = ({ leave, onUpdate, isExpanded, onToggle, adminNote, setAdminNote }) => {
    const lId = leave._id || leave.id;

    return (
        <>
            <tr className={`group transition-all ${isExpanded ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'}`}>
                <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-800 text-white rounded-xl flex items-center justify-center font-black text-xs">
                            {leave.employeeName?.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="font-bold text-slate-900 text-sm leading-none">{leave.employeeName}</p>
                    </div>
                </td>
                <td className="px-8 py-5 text-xs font-black text-slate-700 uppercase">{leave.leaveType}</td>
                <td className="px-8 py-5 text-sm font-black text-slate-800">{leave.startDate}</td>
                <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        leave.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                        {leave.status}
                    </span>
                </td>
                <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-3">
                        <button onClick={onToggle} className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <MessageSquare size={18}/>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200" />
                        
                        {/* APPROVE BUTTON */}
                        <button 
                            onClick={() => onUpdate(lId, 'APPROVED')}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Approve Leave"
                        >
                            <Check size={20}/>
                        </button>
                        
                        {/* REJECT BUTTON */}
                        <button 
                            onClick={() => onUpdate(lId, 'REJECTED')}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Reject Leave"
                        >
                            <X size={20}/>
                        </button>
                    </div>
                </td>
            </tr>
            
            {isExpanded && (
                <tr className="bg-slate-50/30">
                    <td colSpan="5" className="px-12 py-8 border-l-4 border-indigo-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase italic">Employee Reason</h4>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-sm text-slate-600 font-medium italic">
                                    "{leave.reason || "No reason specified."}"
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase italic">Your Remark (Will be shown to employee)</h4>
                                <textarea 
                                    placeholder="Write why you are approving/rejecting..."
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                                    rows="3"
                                    value={adminNote[lId] || ""}
                                    onChange={(e) => setAdminNote({...adminNote, [lId]: e.target.value})}
                                />
                                <p className="text-[9px] text-slate-400">* Note is required for rejections to maintain transparency.</p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

const StatBox = ({ label, value, color, icon }) => (
    <div className={`bg-white border-l-4 border-${color}-500 px-4 py-2 min-w-[120px]`}>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
            {icon} {label}
        </div>
        <p className="text-xl font-black text-slate-900 leading-tight mt-1">{value}</p>
    </div>
);

const SkeletonRows = () => (
    [1,2,3].map(i => (
        <tr key={i} className="animate-pulse">
            <td colSpan="5" className="px-8 py-10"><div className="h-10 bg-slate-100 w-full" /></td>
        </tr>
    ))
);

export default AdminLeaveManagement;