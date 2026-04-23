import React, { useEffect, useState, useMemo } from "react";
import { 
  Check, X, Clock, AlertCircle, ChevronDown, ChevronUp, 
  Info, Search, Filter, Download, UserCheck, CalendarDays,
  MoreVertical, MessageSquare, ShieldAlert, Trash2
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

    const handleStatusUpdate = async (id, status) => {
        if (!id) return alert("Error: ID not found!");
        const note = adminNote[id] || ""; 
        
        try {
            await financeService.updateLeaveStatus(id, status, note);
            setLeaves(prev => prev.map(l => 
                (l._id === id || l.id === id) 
                    ? { ...l, status: status.toUpperCase(), adminComment: note } 
                    : l
            ));
            setExpandedRow(null);
            alert(`Status updated to ${status}!`);
        } catch (err) {
            console.error("Handler Error:", err);
            alert("Update failed!");
        }
    };

    const handleDeleteLeave = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leave record permanently?")) return;
        try {
            await financeService.deleteLeave(id);
            setLeaves(prev => prev.filter(l => (l._id !== id && l.id !== id)));
            alert("Leave record deleted successfully!");
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete failed! This might be because the backend needs a restart to pick up the new Delete route.");
        }
    };

    const filteredLeaves = useMemo(() => {
        return leaves.filter(l => {
            const statusMatch = filterStatus === "ALL" || l.status === filterStatus;
            const firstName = l.employee?.user?.firstName || "";
            const lastName = l.employee?.user?.lastName || "";
            const fullName = `${firstName} ${lastName}`.toLowerCase();
            const nameMatch = fullName.includes(searchTerm.toLowerCase()) || 
                             (l.employee?.employeeCode || "").toLowerCase().includes(searchTerm.toLowerCase());
            return statusMatch && nameMatch;
        });
    }, [leaves, filterStatus, searchTerm]);

    const stats = useMemo(() => ({
        pending: leaves.filter(l => l.status === "PENDING").length,
        approved: leaves.filter(l => l.status === "APPROVED").length,
        onLeaveToday: leaves.filter(l => l.status === "APPROVED").length, 
    }), [leaves]);

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">
            <Header />
            <Sidebar />
            
            <main className="lg:pl-64 pt-16 transition-all duration-300">
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
                    
                    {/* Stats Header */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                <ShieldAlert size={14} /> Admin Control Panel
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leave & Attendance</h1>
                            <p className="text-sm text-slate-500 font-medium mt-1">Manage employee leave requests and approvals.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full xl:w-auto">
                            <StatBox label="Pending Review" value={stats.pending} color="amber" icon={<Clock size={16}/>} />
                            <StatBox label="Active Approved" value={stats.approved} color="emerald" icon={<UserCheck size={16}/>} />
                            <StatBox label="Out Today" value={stats.onLeaveToday} color="rose" icon={<CalendarDays size={16}/>} />
                        </div>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                                        filterStatus === s 
                                        ? "bg-white text-indigo-600 shadow-md border border-slate-100" 
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search employees..." 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Decision Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                        <th className="px-8 py-5">Employee Info</th>
                                        <th className="px-8 py-5">Category</th>
                                        <th className="px-8 py-5">Schedule</th>
                                        <th className="px-8 py-5">Verification</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <SkeletonRows />
                                    ) : filteredLeaves.length > 0 ? (
                                        filteredLeaves.map((leave) => (
                                            <LeaveRow 
                                                key={leave._id || leave.id} 
                                                leave={leave} 
                                                onUpdate={handleStatusUpdate}
                                                onDelete={handleDeleteLeave}
                                                isExpanded={expandedRow === (leave._id || leave.id)}
                                                onToggle={() => setExpandedRow(expandedRow === (leave._id || leave.id) ? null : (leave._id || leave.id))}
                                                adminNote={adminNote}
                                                setAdminNote={setAdminNote}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                                    <Search size={24} />
                                                </div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching leave records</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const LeaveRow = ({ leave, onUpdate, onDelete, isExpanded, onToggle, adminNote, setAdminNote }) => {
    const lId = leave._id || leave.id;
    const firstName = leave.employee?.user?.firstName || "Unknown";
    const lastName = leave.employee?.user?.lastName || "";
    const fullName = `${firstName} ${lastName}`;
    const empCode = leave.employee?.employeeCode || "N/A";

    return (
        <>
            <tr className={`group transition-all ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-slate-50/40'}`}>
                <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform">
                            {firstName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-sm leading-none">{fullName}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-bold tracking-wider">{empCode}</p>
                        </div>
                    </div>
                </td>
                <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-slate-600 uppercase bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        {leave.leaveType}
                    </span>
                </td>
                <td className="px-8 py-5">
                    <div className="text-xs font-black text-slate-700">
                        {new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Starting Date</div>
                </td>
                <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        leave.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                        {leave.status}
                    </span>
                </td>
                <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                        <button 
                            onClick={onToggle} 
                            className={`p-2.5 rounded-xl transition-all ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400 hover:text-indigo-600'}`}
                            title="Notes"
                        >
                            <MessageSquare size={16}/>
                        </button>
                        
                        <div className="h-6 w-[1px] bg-slate-100 mx-1" />

                        <button 
                            onClick={() => onUpdate(lId, 'APPROVED')}
                            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Approve"
                        >
                            <Check size={18}/>
                        </button>
                        <button 
                            onClick={() => onUpdate(lId, 'REJECTED')}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Reject"
                        >
                            <X size={18}/>
                        </button>

                        <div className="h-6 w-[1px] bg-slate-100 mx-1" />

                        <button 
                            onClick={() => onDelete(lId)}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete"
                        >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                </td>
            </tr>
            
            {isExpanded && (
                <tr className="bg-indigo-50/10">
                    <td colSpan="5" className="px-12 py-8 border-l-4 border-indigo-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <Info size={12} /> Employee Reason
                                </h4>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 text-sm text-slate-600 font-medium italic shadow-sm leading-relaxed">
                                    "{leave.reason || "No reason specified."}"
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={12} /> Administrator's Decision Remark
                                </h4>
                                <textarea 
                                    placeholder="Add a remark for the employee..."
                                    className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm resize-none"
                                    rows="3"
                                    value={adminNote[lId] || ""}
                                    onChange={(e) => setAdminNote({...adminNote, [lId]: e.target.value})}
                                />
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// Sub-components
const StatBox = ({ label, value, color, icon }) => (
    <div className={`bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm group hover:border-${color}-300 transition-all`}>
        <div>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
                {icon} {label}
            </div>
            <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
    </div>
);

const SkeletonRows = () => (
    [1,2,3,4,5].map(i => (
        <tr key={i}>
            <td colSpan="5" className="px-8 py-6">
                <div className="h-12 bg-slate-100 w-full rounded-xl animate-pulse" />
            </td>
        </tr>
    ))
);

export default AdminLeaveManagement;