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

    // New Modal State for Decisions
    const [decisionModal, setDecisionModal] = useState({ isOpen: false, type: null, leaveId: null, note: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

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

    const handleStatusUpdate = async (id, status, note) => {
        if (!id) return alert("Error: ID not found!");

        setIsSubmitting(true);
        try {
            await financeService.updateLeaveStatus(id, status, note || "");
            setLeaves(prev => prev.map(l =>
                (l._id === id || l.id === id)
                    ? { ...l, status: status.toUpperCase(), adminComment: note || "" }
                    : l
            ));
            setExpandedRow(null);
            setDecisionModal({ isOpen: false, type: null, leaveId: null, note: '' });
        } catch (err) {
            console.error("Handler Error:", err);
            alert("Update failed!");
        } finally {
            setIsSubmitting(false);
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
        <div className="min-h-screen bg-muted/50 font-sans text-foreground">
            <Header onToggleSidebar={toggleMobileSidebar} />
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleSidebar}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} pt-16 pb-8`}>
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">

                    {/* Stats Header */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-[10px] uppercase tracking-wide">
                                <ShieldAlert size={14} /> Admin Control Panel
                            </div>
                            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Leave & Attendance</h1>
                            <p className="text-sm text-muted-foreground font-medium mt-1">Manage employee leave requests and approvals.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full xl:w-auto">
                            <StatBox label="Pending Review" value={stats.pending} color="amber" icon={<Clock size={16} />} />
                            <StatBox label="Active Approved" value={stats.approved} color="emerald" icon={<UserCheck size={16} />} />
                            <StatBox label="Out Today" value={stats.onLeaveToday} color="rose" icon={<CalendarDays size={16} />} />
                        </div>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div className="flex bg-muted/60 p-1 rounded-xl border border-border">
                            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-6 py-2 rounded-lg text-[10px] font-semibold tracking-wide transition-all ${filterStatus === s
 ? "bg-card text-primary shadow-md border border-border"
 : "text-muted-foreground/70 hover:text-muted-foreground"
 }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={16} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                className="w-full pl-12 pr-4 py-3 bg-muted/60 border border-border rounded-xl text-sm font-medium focus:bg-card focus:border-primary outline-none transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Decision Table */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr className="text-muted-foreground/70 text-[10px] uppercase font-semibold tracking-wide">
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
                                                onDelete={handleDeleteLeave}
                                                isExpanded={expandedRow === (leave._id || leave.id)}
                                                onToggle={() => setExpandedRow(expandedRow === (leave._id || leave.id) ? null : (leave._id || leave.id))}
                                                onOpenDecisionModal={(type, id) => setDecisionModal({ isOpen: true, type, leaveId: id, note: '' })}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                                    <Search size={24} />
                                                </div>
                                                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">No matching leave records</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Decision Modal */}
            {decisionModal.isOpen && (
                <div className="fixed inset-0 bg-sidebar/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-lg w-full max-w-md shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`p-6 border-b ${decisionModal.type === 'APPROVED' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <h3 className={`text-xl font-semibold flex items-center gap-2 ${decisionModal.type === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {decisionModal.type === 'APPROVED' ? <Check size={24} /> : <X size={24} />}
                                {decisionModal.type === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
                            </h3>
                            <p className={`text-xs mt-1 font-bold tracking-wide uppercase ${decisionModal.type === 'APPROVED' ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>
                                Please provide a mandatory note below
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea
                                autoFocus
                                placeholder={decisionModal.type === 'APPROVED' ? "Type approval note/conditions here..." : "Type rejection reason here..."}
                                className="w-full p-4 bg-muted/60 border border-border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-inner resize-none"
                                rows="4"
                                value={decisionModal.note}
                                onChange={(e) => setDecisionModal(prev => ({ ...prev, note: e.target.value }))}
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDecisionModal({ isOpen: false, type: null, leaveId: null, note: '' })}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wide text-muted-foreground bg-muted hover:bg-border hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(decisionModal.leaveId, decisionModal.type, decisionModal.note)}
                                    disabled={isSubmitting}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wide text-white shadow-md transition-all disabled:opacity-70 disabled:cursor-wait ${decisionModal.type === 'APPROVED' ? 'bg-emerald-500 hover:bg-emerald-600 ' : 'bg-rose-500 hover:bg-rose-600 '
 }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LeaveRow = ({ leave, onDelete, isExpanded, onToggle, onOpenDecisionModal }) => {
    const lId = leave._id || leave.id;
    const firstName = leave.employee?.user?.firstName || "Unknown";
    const lastName = leave.employee?.user?.lastName || "";
    const fullName = `${firstName} ${lastName}`;
    const empCode = leave.employee?.employeeCode || "N/A";

    return (
        <>
            <tr className={`group transition-all ${isExpanded ? 'bg-primary/20' : 'hover:bg-muted/40'}`}>
                <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-sidebar text-white rounded-xl flex items-center justify-center font-semibold text-xs shadow-sm transition-transform">
                            {firstName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-foreground text-sm leading-none">{fullName}</p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1.5 font-bold tracking-wider">{empCode}</p>
                        </div>
                    </div>
                </td>
                <td className="px-8 py-5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-md border border-border">
                        {leave.type || leave.leaveType || 'General'}
                    </span>
                </td>
                <td className="px-8 py-5">
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <span>{new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        {leave.endDate && (
                            <>
                                <span className="text-muted-foreground/70">-</span>
                                <span>{new Date(leave.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                            </>
                        )}
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 font-bold mt-1 uppercase">
                        {leave.endDate ? 'Duration' : 'Starting Date'}
                    </div>
                </td>
                <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-semibold uppercase tracking-wide border ${leave.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
 leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
 }`}>
                        {leave.status}
                    </span>
                </td>
                <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                        <button
                            onClick={onToggle}
                            className={`p-2.5 rounded-xl transition-all ${isExpanded ? 'bg-primary text-white shadow-sm ' : 'bg-muted text-muted-foreground/70 hover:text-primary'}`}
                            title="Notes"
                        >
                            <MessageSquare size={16} />
                        </button>

                        <div className="h-6 w-[1px] bg-muted mx-1" />

                        {leave.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() => onOpenDecisionModal('APPROVED', lId)}
                                    className="p-2.5 rounded-xl transition-all text-muted-foreground/70 hover:text-emerald-600 hover:bg-emerald-50"
                                    title="Approve"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => onOpenDecisionModal('REJECTED', lId)}
                                    className="p-2.5 rounded-xl transition-all text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-50"
                                    title="Reject"
                                >
                                    <X size={18} />
                                </button>
                                <div className="h-6 w-[1px] bg-muted mx-1" />
                            </>
                        )}

                        <button
                            onClick={() => onDelete(lId)}
                            className="p-2.5 text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-primary/10">
                    <td colSpan="5" className="px-12 py-8 border-l-4 border-primary">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                                    <Info size={12} /> Employee Reason
                                </h4>
                                <div className="bg-card p-5 rounded-lg border border-border text-sm text-muted-foreground font-medium italic shadow-sm leading-relaxed">
                                    "{leave.reason || "No reason specified."}"
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide flex items-center gap-2">
                                    <MessageSquare size={12} /> Administrator Note
                                </h4>
                                {leave.status !== 'PENDING' ? (
                                    <div className="bg-muted/60 p-5 rounded-lg border border-border text-sm text-foreground font-medium shadow-sm leading-relaxed whitespace-pre-wrap">
                                        {leave.adminComment || "No administrator note provided."}
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 p-5 rounded-lg border border-amber-200 text-sm text-amber-800 font-medium shadow-sm flex items-center gap-3">
                                        <Clock size={20} className="text-amber-500" />
                                        <span>Click the Approve or Reject action buttons to enter a decision note.</span>
                                    </div>
                                )}
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
    <div className={`bg-card border border-border p-4 rounded-lg flex items-center justify-between shadow-sm group hover:border-${color}-300 transition-all`}>
        <div>
            <div className="flex items-center gap-2 text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                {icon} {label}
            </div>
            <p className="text-2xl font-semibold text-foreground leading-tight tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 transition-transform`}>
            {icon}
        </div>
    </div>
);

const SkeletonRows = () => (
    [1, 2, 3, 4, 5].map(i => (
        <tr key={i}>
            <td colSpan="5" className="px-8 py-6">
                <div className="h-12 bg-muted w-full rounded-xl animate-pulse" />
            </td>
        </tr>
    ))
);

export default AdminLeaveManagement;