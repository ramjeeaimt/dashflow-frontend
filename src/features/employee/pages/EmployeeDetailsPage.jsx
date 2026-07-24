import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import employeeService from '../../../services/employee.service';
import financeService from '../../../services/finance.service';
import uploadService from '../../upload/uploadService';
import designationService from '../../../services/designation.service';
import { taskService } from '../../../services/task.service';
import { leaveService } from '../../../services/leaveService';
import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import useAuthStore from '../../../store/useAuthStore';
import { attendanceService } from '../../../services/attendance.service';
import AttendanceTimeline, { WorkModeSummary } from '../../attendance/components/AttendanceTimeline';
import AttendanceCalendar from '../../attendance/components/AttendanceCalendar';
import WorkModeBadge from '../../attendance/components/WorkModeBadge';

const RECORD_TABS = [
    { key: 'attendance', label: 'Attendance', icon: 'Clock' },
    { key: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
    { key: 'projects', label: 'Projects', icon: 'Briefcase' },
    { key: 'leaves', label: 'Leaves', icon: 'Palmtree' },
    { key: 'documents', label: 'Documents', icon: 'FileText' },
    { key: 'payslips', label: 'Payslips', icon: 'Wallet' },
];

const STATUS_PILL = {
    done: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'in-progress': 'bg-primary/10 text-primary border-primary/20',
    review: 'bg-amber-50 text-amber-600 border-amber-100',
    todo: 'bg-muted/60 text-muted-foreground border-border',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const pill = (status) => STATUS_PILL[status] || 'bg-muted/60 text-muted-foreground border-border';

const inclusiveDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start), e = new Date(end);
    const diff = Math.round((e - s) / 86400000);
    return Number.isNaN(diff) ? 1 : diff + 1;
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const EmployeeDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [roles, setRoles] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [payslipRecords, setPayslipRecords] = useState([]);
    const [profileTab, setProfileTab] = useState('attendance');
    const [workMode, setWorkMode] = useState(null);

    // Records data
    const [tasks, setTasks] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [busyPayslip, setBusyPayslip] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const fileInputRef = useRef(null);

    // Avatar, promotion, birthday, attendance view
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarInputRef = useRef(null);
    const [attendanceView, setAttendanceView] = useState('calendar');
    const [designations, setDesignations] = useState([]);
    const [promoteModal, setPromoteModal] = useState(false);
    const [promoteForm, setPromoteForm] = useState({ designationId: '', salary: '', effectiveDate: '' });
    const [savingPromotion, setSavingPromotion] = useState(false);
    const [editingDob, setEditingDob] = useState(false);
    const [dobValue, setDobValue] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [empData, rolesData] = await Promise.all([
                    employeeService.getById(id),
                    apiClient.get(API_ENDPOINTS.ACCESS_CONTROL.ROLES, { params: { companyId: currentUser?.company?.id } })
                ]);
                setEmployee(empData);
                setRoles(rolesData.data?.data || rolesData.data || []);
            } catch (error) {
                console.error('Failed to fetch details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, currentUser]);

    // Payslips, work-mode, tasks and leaves — everything that feeds the records
    // tabs is loaded up front so switching tabs is instant.
    useEffect(() => {
        if (!id) return;
        const fetchProfileData = async () => {
            const [timelineResult, payResult, taskResult, leaveResult] = await Promise.allSettled([
                attendanceService.getTimeline(id),
                financeService.getEmployeePayrolls(id),
                taskService.list({ assigneeId: id }),
                leaveService.getEmployeeLeaves(id),
            ]);

            if (timelineResult.status === 'fulfilled') {
                setWorkMode({
                    policy: timelineResult.value?.wfhPolicy || null,
                    requests: timelineResult.value?.wfhRequests || [],
                });
            }
            if (payResult.status === 'fulfilled') {
                setPayslipRecords(Array.isArray(payResult.value) ? payResult.value : []);
            }
            if (taskResult.status === 'fulfilled') {
                setTasks(Array.isArray(taskResult.value) ? taskResult.value : []);
            }
            if (leaveResult.status === 'fulfilled') {
                const res = leaveResult.value;
                const data = res?.data?.data ?? res?.data ?? res ?? [];
                setLeaves(Array.isArray(data) ? data : []);
            }
        };
        fetchProfileData();
    }, [id]);

    // Projects the employee actually works on, derived from their assigned tasks.
    const projects = useMemo(() => {
        const map = new Map();
        tasks.forEach((t) => {
            const key = t.project?.id || t.projectId || 'unassigned';
            if (!map.has(key)) {
                map.set(key, { id: key, name: t.project?.name || 'Unassigned', status: t.project?.status, tasks: [], done: 0 });
            }
            const entry = map.get(key);
            entry.tasks.push(t);
            if (t.status === 'done') entry.done += 1;
        });
        return Array.from(map.values());
    }, [tasks]);

    const handleAction = async (action, payload = {}) => {
        if (!window.confirm(`Are you sure you want to ${action} this employee?`)) return;
        setIsUpdating(true);
        try {
            const updateData = { ...employee, ...payload };
            if (action === 'terminate') updateData.status = 'terminated';
            if (action === 'block') updateData.status = 'blocked';
            if (action === 'inactive') updateData.status = 'inactive';
            if (action === 'active') updateData.status = 'active';

            await employeeService.update(id, updateData);
            const updated = await employeeService.getById(id);
            setEmployee(updated);
            alert(`Employee ${action}d successfully.`);
        } catch (error) {
            console.error(`${action} failed:`, error);
        } finally {
            setIsUpdating(false);
            setActiveMenu(null);
        }
    };

    const handleRoleChange = async (roleId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this access?`)) return;
        setIsUpdating(true);
        setActiveMenu(null);
        try {
            let newRoleIds = [...(employee.user?.roles?.map(r => r.id) || [])];
            if (action === 'grant') newRoleIds = [roleId];
            else {
                newRoleIds = newRoleIds.filter(rid => rid !== roleId);
                if (newRoleIds.length === 0) {
                    const empRole = roles.find(r => r.name === 'Employee');
                    if (empRole) newRoleIds = [empRole.id];
                }
            }
            await employeeService.update(id, { ...employee, roleIds: newRoleIds, sendPromotionEmail: action === 'grant' });
            const updated = await employeeService.getById(id);
            setEmployee(updated);
        } catch (error) { console.error(error); }
        finally { setIsUpdating(false); }
    };

    // ---- Documents ----
    const persistDocuments = async (documents) => {
        await employeeService.update(id, { ...employee, documents });
        const updated = await employeeService.getById(id);
        setEmployee(updated);
    };

    const handleDocUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingDoc(true);
        try {
            const res = await uploadService.uploadDocument(file);
            const url = res?.url || res?.data?.url;
            if (!url) throw new Error('No URL returned');
            const uploader = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || currentUser?.email || 'User';
            const newDoc = {
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                url,
                publicId: res?.publicId,
                uploadedAt: new Date().toISOString(),
                uploadedBy: uploader,
            };
            await persistDocuments([...(employee.documents || []), newDoc]);
        } catch (err) {
            console.error('Document upload failed:', err);
            alert('Failed to upload document.');
        } finally {
            setUploadingDoc(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeDocument = async (index) => {
        if (!window.confirm('Remove this document?')) return;
        try {
            await persistDocuments((employee.documents || []).filter((_, i) => i !== index));
        } catch (err) {
            console.error('Failed to remove document:', err);
            alert('Failed to remove document.');
        }
    };

    // ---- Avatar (edit profile image) ----
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const res = await uploadService.uploadImage(file);
            const url = res?.url || res?.data?.url;
            if (!url) throw new Error('No URL returned');
            await employeeService.update(id, { ...employee, avatar: url });
            const updated = await employeeService.getById(id);
            setEmployee(updated);
        } catch (err) {
            console.error('Avatar upload failed:', err);
            alert('Failed to update profile image.');
        } finally {
            setUploadingAvatar(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    // ---- Promotion ----
    const openPromote = async () => {
        setPromoteForm({ designationId: employee.designationId || '', salary: employee.salary || '', effectiveDate: new Date().toISOString().slice(0, 10) });
        setPromoteModal(true);
        if (designations.length === 0) {
            try {
                setDesignations(await designationService.getAll(currentUser?.company?.id));
            } catch (err) { console.error('Failed to load designations:', err); }
        }
    };

    const submitPromotion = async () => {
        if (!promoteForm.designationId) { alert('Please select a new designation.'); return; }
        setSavingPromotion(true);
        try {
            await employeeService.update(id, {
                ...employee,
                designationId: promoteForm.designationId,
                salary: promoteForm.salary || employee.salary,
            });
            const updated = await employeeService.getById(id);
            setEmployee(updated);
            setPromoteModal(false);
            alert('Promotion applied successfully.');
        } catch (err) {
            console.error('Promotion failed:', err);
            alert('Failed to apply promotion.');
        } finally {
            setSavingPromotion(false);
        }
    };

    // ---- Birthday ----
    const saveDob = async () => {
        try {
            await employeeService.update(id, { ...employee, dateOfBirth: dobValue || null });
            const updated = await employeeService.getById(id);
            setEmployee(updated);
            setEditingDob(false);
        } catch (err) {
            console.error('Failed to save birthday:', err);
            alert('Failed to save birthday.');
        }
    };

    // ---- Payslips ----
    const handlePayslip = async (slip, mode) => {
        setBusyPayslip(`${slip.id}-${mode}`);
        try {
            const blob = await financeService.getPayslipPdf(slip.id);
            const url = window.URL.createObjectURL(blob);
            if (mode === 'download') {
                const a = document.createElement('a');
                a.href = url;
                a.download = `payslip-${slip.month || ''}-${slip.year || ''}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => window.URL.revokeObjectURL(url), 2000);
            } else {
                window.open(url, '_blank', 'noopener');
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);
            }
        } catch (err) {
            console.error('Payslip fetch failed:', err);
            alert('Unable to load payslip PDF.');
        } finally {
            setBusyPayslip(null);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Icon name="Loader" className="animate-spin text-primary" size={40} /></div>;
    if (!employee) return <div>Not found</div>;

    const currentRoleIds = employee.user?.roles?.map(r => r.id) || [];
    const isIntern = employee.employmentType?.toLowerCase() === 'intern';
    const documents = employee.documents || [];

    const timeline = [
        { title: 'Onboarded', date: employee.hireDate, icon: 'UserPlus', color: 'bg-primary' },
        { title: isIntern ? 'Started as Intern' : 'Started as Employee', date: employee.hireDate, icon: 'FileText', color: 'bg-slate-500' },
        currentRoleIds.some(rid => roles.find(r => r.id === rid)?.name === 'Manager') &&
        { title: 'Promoted to Management', date: 'Active', icon: 'TrendingUp', color: 'bg-primary' }
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-[#FBFBFE]">
            <Header />
            <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} pt-16 pb-12`}>
                <div className="max-w-6xl mx-auto px-6 py-6">

                    {/* TOP ACTION BAR */}
                    <div className="flex items-center justify-between mb-6 bg-card p-3 rounded-lg border border-border shadow-sm">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted/60 rounded-xl transition-all"><Icon name="ArrowLeft" size={20} className="text-muted-foreground/70" /></button>
                            <h1 className="font-bold text-foreground">Employee Command Center</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={openPromote} className="px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-2">
                                <Icon name="TrendingUp" size={14} /> Promote
                            </button>
                            <button onClick={() => alert('ID Card Generated!')} className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/10 transition-all flex items-center gap-2">
                                <Icon name="CreditCard" size={14} /> Generate ID Card
                            </button>
                            <div className="relative">
                                <button onClick={() => setActiveMenu(activeMenu === 'main' ? null : 'main')} className="p-2 bg-sidebar text-white rounded-xl shadow-sm "><Icon name="MoreHorizontal" size={20} /></button>
                                {activeMenu === 'main' && (
                                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-sm py-2 z-50">
                                        <button onClick={() => handleAction('block')} className="w-full px-4 py-2 text-left text-xs font-bold text-muted-foreground hover:bg-muted/60 flex items-center gap-2"><Icon name="Slash" size={14} /> Block Access</button>
                                        <button onClick={() => handleAction('inactive')} className="w-full px-4 py-2 text-left text-xs font-bold text-muted-foreground hover:bg-muted/60 flex items-center gap-2"><Icon name="Moon" size={14} /> Make Inactive</button>
                                        <div className="border-t border-slate-50 my-1"></div>
                                        <button onClick={() => handleAction('terminate')} className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"><Icon name="UserX" size={14} /> Terminate</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT: Profile & Timeline */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-card rounded-lg p-6 border border-border/60 shadow-sm text-center">
                                <div className="relative w-24 h-24 mx-auto mb-4 group">
                                    <div className="w-24 h-24 rounded-lg bg-primary/10 p-1 border border-border overflow-hidden">
                                        <img src={employee.avatar || `https://ui-avatars.com/api/?name=${employee.user?.firstName}+${employee.user?.lastName}&background=6366f1&color=fff`} className="w-full h-full object-cover rounded-lg" alt="avatar" />
                                    </div>
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        title="Edit profile image"
                                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {uploadingAvatar ? <Icon name="Loader" size={18} className="animate-spin" /> : <Icon name="Camera" size={18} />}
                                    </button>
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sidebar text-white flex items-center justify-center shadow-sm border-2 border-card"
                                    >
                                        <Icon name="Pencil" size={12} />
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{employee.user?.firstName} {employee.user?.lastName}</h2>
                                <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mt-2 px-3 py-1 bg-primary/10 inline-block rounded-full">{employee.designation?.name || 'Staff'}</p>
                                {workMode?.policy && (
                                    <div className="mt-4 flex justify-center">
                                        <WorkModeBadge policy={workMode.policy} showHint />
                                    </div>
                                )}

                                {/* Birthday — captured so the admin gets a birthday alert */}
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-xs">
                                    <Icon name="Gift" size={14} className="text-primary" />
                                    {editingDob ? (
                                        <span className="flex items-center gap-1.5">
                                            <input type="date" value={dobValue} onChange={(e) => setDobValue(e.target.value)} className="border border-border rounded-md px-2 py-1 text-xs" />
                                            <button onClick={saveDob} className="text-primary font-bold">Save</button>
                                            <button onClick={() => setEditingDob(false)} className="text-muted-foreground/70">Cancel</button>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                            {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' }) : 'Birthday not set'}
                                            <button onClick={() => { setDobValue(employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().slice(0, 10) : ''); setEditingDob(true); }} className="text-primary font-bold">{employee.dateOfBirth ? 'Edit' : 'Add'}</button>
                                        </span>
                                    )}
                                </div>

                                {/* Quick stats — replaces the tall placeholder cards */}
                                <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-slate-50">
                                    <div>
                                        <p className="text-lg font-bold text-foreground">{projects.length}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wide">Projects</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-foreground">{tasks.length}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wide">Tasks</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-foreground">{leaves.length}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wide">Leaves</p>
                                    </div>
                                </div>
                            </div>

                            {/* Work arrangement — permanent WFH vs granted days */}
                            {workMode?.policy && (
                                <WorkModeSummary policy={workMode.policy} requests={workMode.requests} />
                            )}

                            {/* Role / Department */}
                            <div className="bg-card rounded-lg p-6 border border-border/60 shadow-sm">
                                <h4 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-2">Internal Role</h4>
                                <p className="text-base font-bold text-foreground">{employee.designation?.name || 'Staff Member'}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1 font-medium">Mapped to {employee.department?.name || 'General'} Department</p>
                            </div>

                            {/* TIMELINE */}
                            <div className="bg-card rounded-lg p-6 border border-border/60 shadow-sm">
                                <h3 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wide mb-6">Career Journey</h3>
                                <div className="space-y-6">
                                    {timeline.map((item, index) => (
                                        <div key={index} className="flex gap-4 relative">
                                            {index !== timeline.length - 1 && <div className="absolute left-4 top-8 w-0.5 h-6 bg-muted"></div>}
                                            <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white shrink-0 shadow-sm `}>
                                                <Icon name={item.icon} size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{item.title}</p>
                                                <p className="text-[10px] text-muted-foreground/70 font-bold uppercase mt-1">{item.date && item.date !== 'Active' ? fmtDate(item.date) : 'Active'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Responsibilities & Records */}
                        <div className="lg:col-span-8 space-y-6">

                            <div className="bg-card rounded-lg border border-border/60 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-50 bg-muted/20 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-foreground">Responsibility Management</h3>
                                    <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Status: <span className="text-emerald-500">{employee.status}</span></span>
                                </div>

                                <div className="divide-y divide-slate-50">
                                    {roles.map((role) => {
                                        const isActive = currentRoleIds.includes(role.id);
                                        const isAdmin = role.name === 'Admin';
                                        const canBeAdmin = currentRoleIds.some(rid => roles.find(r => r.id === rid)?.name === 'Manager');
                                        if (isAdmin && !canBeAdmin && !isActive) return null;

                                        return (
                                            <div key={role.id} className="px-6 py-4 flex items-start justify-between hover:bg-muted/30 transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-sm font-bold text-foreground">{role.name === 'Manager' ? 'Department Oversight' : role.name === 'Admin' ? 'System Administration' : 'Standard Operations'}</h4>
                                                        {isActive && <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full uppercase">Current</span>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-medium max-w-lg">{role.description || 'Access level definition.'}</p>
                                                </div>
                                                <button onClick={() => handleRoleChange(role.id, isActive ? 'revoke' : 'grant')} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all shrink-0 ml-3 ${isActive ? 'bg-muted text-muted-foreground' : 'bg-sidebar text-white'}`}>
                                                    {isActive ? 'Revoke Access' : `Grant Access`}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ===== UNIFIED RECORDS PANEL ===== */}
                            <div className="bg-card rounded-lg border border-border/60 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-50 bg-muted/20 flex items-center gap-1.5 overflow-x-auto">
                                    <h3 className="text-sm font-bold text-foreground mr-auto pl-2 shrink-0">Employee Records</h3>
                                    {RECORD_TABS.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setProfileTab(tab.key)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${profileTab === tab.key ? 'bg-sidebar text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-border'}`}
                                        >
                                            <span className="flex items-center gap-1.5"><Icon name={tab.icon} size={13} /> {tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Attendance */}
                                {profileTab === 'attendance' && (
                                    <div className="p-6">
                                        <div className="flex items-center gap-1.5 mb-5 w-fit bg-muted/60 p-1 rounded-xl">
                                            <button onClick={() => setAttendanceView('calendar')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${attendanceView === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                                                <Icon name="Calendar" size={13} /> Calendar
                                            </button>
                                            <button onClick={() => setAttendanceView('timeline')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${attendanceView === 'timeline' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                                                <Icon name="List" size={13} /> Timeline
                                            </button>
                                        </div>
                                        {attendanceView === 'calendar'
                                            ? <AttendanceCalendar employeeId={id} />
                                            : <AttendanceTimeline employeeId={id} />}
                                    </div>
                                )}

                                {/* Tasks */}
                                {profileTab === 'tasks' && (
                                    <div className="p-6">
                                        {tasks.length === 0 ? (
                                            <EmptyState icon="CheckSquare" title="No tasks assigned" hint="Tasks assigned to this employee will appear here." />
                                        ) : (
                                            <div className="space-y-2">
                                                {tasks.map((t) => (
                                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 border border-transparent hover:border-border transition-all">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-foreground truncate">{t.title}</p>
                                                            <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5 flex items-center gap-2">
                                                                <span className="flex items-center gap-1"><Icon name="Briefcase" size={11} /> {t.project?.name || 'No project'}</span>
                                                                {t.dueDate && <span className="flex items-center gap-1"><Icon name="Calendar" size={11} /> {fmtDate(t.dueDate)}</span>}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                                            {typeof t.progress === 'number' && <span className="text-[10px] font-bold text-muted-foreground/70">{t.progress}%</span>}
                                                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${pill(t.status)}`}>{t.status || 'todo'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Projects */}
                                {profileTab === 'projects' && (
                                    <div className="p-6">
                                        {projects.length === 0 ? (
                                            <EmptyState icon="Briefcase" title="No active projects" hint="Projects the employee is working on will appear here." />
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {projects.map((p) => {
                                                    const pct = p.tasks.length ? Math.round((p.done / p.tasks.length) * 100) : 0;
                                                    return (
                                                        <div key={p.id} className="p-4 rounded-lg bg-muted/40 border border-border/60">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                                                                <span className="text-[10px] font-bold text-muted-foreground/70">{p.done}/{p.tasks.length}</span>
                                                            </div>
                                                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground/70 font-medium mt-2">{p.tasks.length} task{p.tasks.length !== 1 ? 's' : ''} · {pct}% done</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Leaves */}
                                {profileTab === 'leaves' && (
                                    <div className="p-6">
                                        {leaves.length === 0 ? (
                                            <EmptyState icon="Palmtree" title="No leave records" hint="Leave requests taken by this employee will appear here." />
                                        ) : (
                                            <div className="space-y-2">
                                                {leaves.map((lv) => (
                                                    <div key={lv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-transparent hover:border-border transition-all">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-foreground capitalize">{lv.type} leave · {inclusiveDays(lv.startDate, lv.endDate)} day{inclusiveDays(lv.startDate, lv.endDate) !== 1 ? 's' : ''}</p>
                                                            <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">{fmtDate(lv.startDate)} → {fmtDate(lv.endDate)}{lv.reason ? ` · ${lv.reason}` : ''}</p>
                                                        </div>
                                                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border shrink-0 ml-3 ${pill(lv.status)}`}>{lv.status || 'pending'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Documents */}
                                {profileTab === 'documents' && (
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wide">Attached Files ({documents.length})</p>
                                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleDocUpload} />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingDoc}
                                                className="px-4 py-2 bg-sidebar text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-60"
                                            >
                                                {uploadingDoc ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Upload" size={14} />}
                                                {uploadingDoc ? 'Uploading…' : 'Upload Document'}
                                            </button>
                                        </div>
                                        {documents.length === 0 ? (
                                            <EmptyState icon="FileText" title="No documents yet" hint="Upload contracts, ID proofs or certificates — you can add your own too." />
                                        ) : (
                                            <div className="space-y-2">
                                                {documents.map((doc, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-transparent hover:border-border transition-all">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                                <Icon name="FileText" size={15} className="text-primary" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-foreground truncate">{doc.name}</p>
                                                                <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">
                                                                    {doc.size ? `${doc.size} · ` : ''}{doc.uploadedBy ? `by ${doc.uploadedBy}` : ''}{doc.uploadedAt ? ` · ${fmtDate(doc.uploadedAt)}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                                            <button onClick={() => window.open(doc.url, '_blank', 'noopener')} title="Preview" className="p-2 border border-border rounded-lg hover:bg-muted/60 text-muted-foreground"><Icon name="Eye" size={14} /></button>
                                                            <a href={doc.url} download target="_blank" rel="noopener noreferrer" title="Download" className="p-2 border border-border rounded-lg hover:bg-muted/60 text-muted-foreground"><Icon name="Download" size={14} /></a>
                                                            <button onClick={() => removeDocument(idx)} title="Remove" className="p-2 border border-rose-50 rounded-lg text-rose-500 hover:bg-rose-50"><Icon name="Trash2" size={14} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Payslips */}
                                {profileTab === 'payslips' && (
                                    <div className="p-6">
                                        {payslipRecords.length === 0 ? (
                                            <EmptyState icon="Wallet" title="No payslips available" hint="Payslip records will appear here after payroll is processed." />
                                        ) : (
                                            <div className="space-y-2">
                                                {payslipRecords.map((slip) => (
                                                    <div key={slip.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-all border border-transparent hover:border-border">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                                <Icon name="FileText" size={15} className="text-primary" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-foreground">
                                                                    {new Date(0, (slip.month || 1) - 1).toLocaleString('default', { month: 'long' })} {slip.year}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">Net Salary: ₹{slip.netSalary?.toLocaleString('en-IN') || '0'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${pill(slip.status)}`}>{slip.status || 'pending'}</span>
                                                            <button onClick={() => handlePayslip(slip, 'preview')} disabled={busyPayslip === `${slip.id}-preview`} title="Preview" className="p-2 border border-border rounded-lg hover:bg-muted/60 text-muted-foreground disabled:opacity-50">
                                                                {busyPayslip === `${slip.id}-preview` ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Eye" size={14} />}
                                                            </button>
                                                            <button onClick={() => handlePayslip(slip, 'download')} disabled={busyPayslip === `${slip.id}-download`} title="Download" className="p-2 border border-border rounded-lg hover:bg-muted/60 text-muted-foreground disabled:opacity-50">
                                                                {busyPayslip === `${slip.id}-download` ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Download" size={14} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* PROMOTION MODAL */}
            {promoteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setPromoteModal(false)}>
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Icon name="TrendingUp" size={16} className="text-emerald-600" /> Promote Employee</h3>
                            <button onClick={() => setPromoteModal(false)} className="p-1 hover:bg-muted/60 rounded-lg text-muted-foreground/70"><Icon name="X" size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">New Designation</label>
                                <select value={promoteForm.designationId} onChange={(e) => setPromoteForm((f) => ({ ...f, designationId: e.target.value }))} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-card">
                                    <option value="">Select designation…</option>
                                    {designations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Revised Salary (optional)</label>
                                <input type="text" value={promoteForm.salary} onChange={(e) => setPromoteForm((f) => ({ ...f, salary: e.target.value }))} placeholder="e.g. 45000" className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Effective Date</label>
                                <input type="date" value={promoteForm.effectiveDate} onChange={(e) => setPromoteForm((f) => ({ ...f, effectiveDate: e.target.value }))} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-50 flex justify-end gap-2">
                            <button onClick={() => setPromoteModal(false)} className="px-4 py-2 text-xs font-bold text-muted-foreground rounded-xl hover:bg-muted/60">Cancel</button>
                            <button onClick={submitPromotion} disabled={savingPromotion} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-60">
                                {savingPromotion && <Icon name="Loader" size={14} className="animate-spin" />} Apply Promotion
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const EmptyState = ({ icon, title, hint }) => (
    <div className="text-center py-10">
        <Icon name={icon} size={36} className="text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-bold text-muted-foreground/70">{title}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">{hint}</p>
    </div>
);

export default EmployeeDetailsPage;
