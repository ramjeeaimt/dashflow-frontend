import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import employeeService from '../../../services/employee.service';
import financeService from '../../../services/finance.service';
import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import useAuthStore from '../../../store/useAuthStore';
import { attendanceService } from '../../../services/attendance.service';

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
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [payslipRecords, setPayslipRecords] = useState([]);
    const [profileTab, setProfileTab] = useState('attendance');

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

    // Fetch attendance & payslip data for employee profile
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [attData, payRes] = await Promise.all([
                    attendanceService.getAll({ employeeId: id }),
                    financeService.getEmployeePayrolls(id),
                ]);
                setAttendanceRecords(Array.isArray(attData) ? attData : []);
                const payArr = payRes || [];
                setPayslipRecords(Array.isArray(payArr) ? payArr : []);
            } catch (err) {
                console.error('Failed to fetch attendance/payslip data:', err);
            }
        };
        if (id) fetchProfileData();
    }, [id]);

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
                newRoleIds = newRoleIds.filter(id => id !== roleId);
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

    if (loading) return <div className="h-screen flex items-center justify-center"><Icon name="Loader" className="animate-spin text-primary" size={40} /></div>;
    if (!employee) return <div>Not found</div>;

    const currentRoleIds = employee.user?.roles?.map(r => r.id) || [];
    const isIntern = employee.employmentType?.toLowerCase() === 'intern';

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
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* TOP ACTION BAR */}
                    <div className="flex items-center justify-between mb-10 bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted/60 rounded-xl transition-all"><Icon name="ArrowLeft" size={20} className="text-muted-foreground/70" /></button>
                            <h1 className="font-bold text-foreground">Employee Command Center</h1>
                        </div>
                        <div className="flex items-center gap-2">
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT: Profile & Timeline */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-card rounded-lg p-8 border border-border/60 shadow-sm text-center">
                                <div className="w-28 h-28 rounded-lg bg-primary/10 mx-auto mb-6 p-1 border border-border overflow-hidden">
                                    <img src={employee.avatar || `https://ui-avatars.com/api/?name=${employee.user?.firstName}+${employee.user?.lastName}&background=6366f1&color=fff`} className="w-full h-full object-cover rounded-lg" alt="avatar" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{employee.user?.firstName} {employee.user?.lastName}</h2>
                                <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mt-2 px-3 py-1 bg-primary/10 inline-block rounded-full">{employee.designation?.name || 'Staff'}</p>
                            </div>

                            {/* TIMELINE */}
                            <div className="bg-card rounded-lg p-8 border border-border/60 shadow-sm">
                                <h3 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wide mb-8">Career Journey</h3>
                                <div className="space-y-8">
                                    {timeline.map((item, index) => (
                                        <div key={index} className="flex gap-4 relative">
                                            {index !== timeline.length - 1 && <div className="absolute left-4 top-8 w-0.5 h-8 bg-muted"></div>}
                                            <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white shrink-0 shadow-sm `}>
                                                <Icon name={item.icon} size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{item.title}</p>
                                                <p className="text-[10px] text-muted-foreground/70 font-bold uppercase mt-1">{item.date ? new Date(item.date).getFullYear() : 'Active'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Responsibilities & Controls */}
                        <div className="lg:col-span-8 space-y-8">

                            <div className="bg-card rounded-lg border border-border/60 shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-50 bg-muted/20 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-foreground">Responsibility Management</h3>
                                    <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Status: <span className="text-emerald-500">{employee.status}</span></span>
                                </div>

                                <div className="divide-y divide-slate-50">
                                    {roles.map((role) => {
                                        const isActive = currentRoleIds.includes(role.id);
                                        const isManager = role.name === 'Manager';
                                        const isAdmin = role.name === 'Admin';
                                        const canBeAdmin = currentRoleIds.some(rid => roles.find(r => r.id === rid)?.name === 'Manager');

                                        // CUSTOM LOGIC: Hide Admin if not a manager yet, or show it as disabled
                                        if (isAdmin && !canBeAdmin && !isActive) return null;

                                        return (
                                            <div key={role.id} className="p-8 flex items-start justify-between hover:bg-muted/30 transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-base font-bold text-foreground">{role.name === 'Manager' ? 'Department Oversight' : role.name === 'Admin' ? 'System Administration' : 'Standard Operations'}</h4>
                                                        {isActive && <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full uppercase">Current</span>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground font-medium max-w-lg">{role.description || 'Access level definition.'}</p>
                                                </div>
                                                <button onClick={() => handleRoleChange(role.id, isActive ? 'revoke' : 'grant')} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${isActive ? 'bg-muted text-muted-foreground' : 'bg-sidebar text-white'}`}>
                                                    {isActive ? 'Revoke Access' : `Grant Access`}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* PROJECT & INFO */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-card rounded-lg p-8 border border-border/60 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-primary font-bold text-xs">Edit Designation</button>
                                    </div>
                                    <h4 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-6">Internal Role</h4>
                                    <p className="text-lg font-bold text-foreground">{employee.designation?.name || 'Staff Member'}</p>
                                    <p className="text-xs text-muted-foreground/70 mt-2 font-medium">Mapped to {employee.department?.name || 'General'} Department</p>
                                </div>
                                <div className="bg-card rounded-lg p-8 border border-border/60 shadow-sm group">
                                    <div className="flex justify-between mb-6">
                                        <h4 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Active Projects</h4>
                                        <button className="text-primary font-bold text-xs opacity-0 group-hover:opacity-100">Edit Projects</button>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center text-[10px] font-bold text-muted-foreground/70">P{i}</div>)}
                                    </div>
                                    <p className="text-xs text-muted-foreground/70 mt-4 font-medium">Assigned to 3 active projects</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== ATTENDANCE & PAYSLIP SECTION ===== */}
                    <div className="bg-card rounded-lg border border-border/60 shadow-sm overflow-hidden mt-8">
                        <div className="px-8 py-5 border-b border-slate-50 bg-muted/20 flex items-center gap-4">
                            <h3 className="text-sm font-bold text-foreground mr-auto">Employee Records</h3>
                            <button onClick={() => setProfileTab('attendance')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileTab === 'attendance' ? 'bg-sidebar text-white shadow-sm ' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
                                <span className="flex items-center gap-1.5"><Icon name="Clock" size={13} /> Attendance</span>
                            </button>
                            <button onClick={() => setProfileTab('payslips')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileTab === 'payslips' ? 'bg-sidebar text-white shadow-sm ' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
                                <span className="flex items-center gap-1.5"><Icon name="FileText" size={13} /> Payslips</span>
                            </button>
                        </div>

                        {/* Attendance Tab */}
                        {profileTab === 'attendance' && (
                            <div className="p-8">
                                {attendanceRecords.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Icon name="Calendar" size={40} className="text-slate-200 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-muted-foreground/70">No attendance records found</p>
                                        <p className="text-[10px] text-muted-foreground/70 mt-1">Attendance data will appear here once the employee checks in.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide pb-3 pr-4">Date</th>
                                                    <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide pb-3 pr-4">Check-in</th>
                                                    <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide pb-3 pr-4">Check-out</th>
                                                    <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide pb-3 pr-4">Hours</th>
                                                    <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide pb-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceRecords.slice(0, 30).map((record) => {
                                                    const checkIn = record.checkInTimestamp ? new Date(record.checkInTimestamp) : null;
                                                    const checkOut = record.checkOutTimestamp ? new Date(record.checkOutTimestamp) : null;
                                                    const hours = checkIn && checkOut ? ((checkOut - checkIn) / 3600000).toFixed(1) : '--';
                                                    return (
                                                        <tr key={record.id} className="border-b border-slate-50 hover:bg-muted/30 transition-all">
                                                            <td className="py-3 pr-4 text-sm font-medium text-foreground">
                                                                {checkIn ? checkIn.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                                                            </td>
                                                            <td className="py-3 pr-4 text-sm text-muted-foreground">
                                                                {checkIn ? checkIn.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                                                            </td>
                                                            <td className="py-3 pr-4 text-sm text-muted-foreground">
                                                                {checkOut ? checkOut.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                                                            </td>
                                                            <td className="py-3 pr-4 text-sm text-muted-foreground">{hours} hrs</td>
                                                            <td className="py-3">
                                                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${record.late ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                                    {record.late ? 'Late' : 'On Time'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {attendanceRecords.length > 30 && (
                                            <p className="text-[10px] text-muted-foreground/70 mt-4 text-center">Showing latest 30 records of {attendanceRecords.length} total</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payslips Tab */}
                        {profileTab === 'payslips' && (
                            <div className="p-8">
                                {payslipRecords.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Icon name="FileText" size={40} className="text-slate-200 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-muted-foreground/70">No payslips available</p>
                                        <p className="text-[10px] text-muted-foreground/70 mt-1">Payslip records will appear here after payroll is processed.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {payslipRecords.map((slip) => (
                                            <div key={slip.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/60 transition-all border border-transparent hover:border-border">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                        <Icon name="FileText" size={16} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">
                                                            {new Date(0, (slip.month || 1) - 1).toLocaleString('default', { month: 'long' })} {slip.year}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">Net Salary: ₹{slip.netSalary?.toLocaleString('en-IN') || '0'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
 slip.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
 slip.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
 'bg-muted/60 text-muted-foreground border-border'
 }`}>
                                                        {slip.status || 'pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeeDetailsPage;
