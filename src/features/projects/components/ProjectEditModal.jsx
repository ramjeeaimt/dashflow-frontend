import React, { useEffect, useState } from "react";
import { X, Save, UserPlus, Calendar, DollarSign, Github, ExternalLink, Loader2 } from "lucide-react";
import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { toast } from "react-hot-toast";

const ProjectEditModal = ({ projectId, onClose, onSaveSuccess }) => {
    const [project, setProject] = useState({
        projectName: "",
        githubLink: "",
        clientName: "",
        clientEmail: "",
        contactInfo: "",
        deadline: "",
        phase: "Planning",
        status: "active",
        assigningDate: "",
        deploymentLink: "",
        totalPayment: "",
        paymentReceived: "",
        assignedEmployeeIds: [],
        notes: "",
        isCompanyProject: false
    });
    
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Project
            const projectRes = await apiClient.get(`${API_ENDPOINTS.PROJECTS.BASE}/${projectId}`);
            const pData = projectRes.data.data || projectRes.data;
            
            // 2. Fetch Employees
            const empRes = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BASE);
            const eData = Array.isArray(empRes.data.data) ? empRes.data.data : (Array.isArray(empRes.data) ? empRes.data : []);
            setEmployees(eData);

            // Mapping project data
            const assignedIds = pData.assignedEmployees 
                ? pData.assignedEmployees.map(e => e.id)
                : (pData.assignedEmployeeIds || pData.assignedPeople || []);

            setProject({
                ...pData,
                isCompanyProject: pData.isCompanyProject || false,
                deadline: pData.deadline ? pData.deadline.split('T')[0] : "",
                assigningDate: pData.assigningDate ? pData.assigningDate.split('T')[0] : "",
                totalPayment: pData.totalPayment || 0,
                paymentReceived: pData.paymentReceived || 0,
                assignedEmployeeIds: assignedIds,
                notes: pData.notes || ""
            });
            setSelectedEmployees(assignedIds);
        } catch (err) {
            console.error("Error fetching edit data:", err);
            toast.error("Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchData();
        }
    }, [projectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    const handleEmployeeToggle = (employeeId) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...project,
                assignedEmployeeIds: selectedEmployees,
                totalPayment: Number(project.totalPayment),
                paymentReceived: Number(project.paymentReceived)
            };

            await apiClient.put(`${API_ENDPOINTS.PROJECTS.BASE}/${projectId}`, payload);
            toast.success("Project updated!");
            if (onSaveSuccess) onSaveSuccess();
            onClose();
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Save failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (!projectId) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-sidebar/60 backdrop-blur-sm">
            <div className="bg-card dark:bg-sidebar w-full max-w-3xl max-h-[90vh] overflow-hidden border border-white/20 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground dark:text-white tracking-tight">Modify Project</h2>
                        <p className="text-muted-foreground text-sm">Update parameters and team assignments</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted dark:hover:bg-sidebar rounded-xl transition-colors">
                        <X size={24} className="text-muted-foreground/70" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : (
                        <form id="project-edit-form" onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Project Name" name="projectName" value={project.projectName} onChange={handleChange} required />
                                <div className="flex items-center space-x-3 mt-1.5 md:col-span-2">
                                     <input
                                         type="checkbox"
                                         id="isCompanyProjectModal"
                                         name="isCompanyProject"
                                         checked={project.isCompanyProject || false}
                                         onChange={(e) => setProject(prev => ({ ...prev, isCompanyProject: e.target.checked }))}
                                         className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                     />
                                     <label htmlFor="isCompanyProjectModal" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                         Internal Company Project (No Client)
                                     </label>
                                 </div>
                                <FormInput label="Client Name" name="clientName" value={project.clientName} onChange={handleChange} required />
                                <FormInput label="Client Email" name="clientEmail" type="email" value={project.clientEmail} onChange={handleChange} required />
                                <FormInput label="Contact Info" name="contactInfo" value={project.contactInfo} onChange={handleChange} />
                            </div>

                            <hr className="border-border dark:border-slate-800" />

                            {/* Timeline & Progress Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Start Date" name="assigningDate" type="date" value={project.assigningDate} onChange={handleChange} />
                                <FormInput label="Deadline" name="deadline" type="date" value={project.deadline} onChange={handleChange} />
                                
                                <FormSelect 
                                    label="Current Phase" 
                                    name="phase" 
                                    value={project.phase} 
                                    onChange={handleChange}
                                    options={["Planning", "Development", "Testing", "Deployment", "Completed"]}
                                />
                                <FormSelect 
                                    label="Project Status" 
                                    name="status" 
                                    value={project.status} 
                                    onChange={handleChange}
                                    options={["active", "pending", "completed", "on-hold"]}
                                />
                            </div>

                            <hr className="border-border dark:border-slate-800" />

                            {/* Financials & Links Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Total Payment (₹)" name="totalPayment" type="number" value={project.totalPayment} onChange={handleChange} />
                                <FormInput label="Payment Received (₹)" name="paymentReceived" type="number" value={project.paymentReceived} onChange={handleChange} />
                                <FormInput label="GitHub Repository" name="githubLink" value={project.githubLink} onChange={handleChange} placeholder="https://..." />
                                <FormInput label="Deployment URL" name="deploymentLink" value={project.deploymentLink} onChange={handleChange} placeholder="https://..." />
                            </div>

                            {/* Team Assignment Section */}
                            <div className="bg-muted/60 dark:bg-sidebar/50 p-6 rounded-lg border border-border dark:border-slate-800 relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-foreground dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                                        <UserPlus size={16} /> Team Assignment
                                    </h3>
                                    <span className="bg-primary/10 dark:bg-primary/30 text-primary dark:text-indigo-400 text-[10px] font-semibold px-2 py-1 rounded-lg">
                                        {selectedEmployees.length} INDIVIDUALS
                                    </span>
                                </div>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                                        className="w-full bg-card dark:bg-sidebar border border-border dark:border-slate-700 p-4 rounded-lg flex justify-between items-center text-sm font-bold shadow-sm"
                                    >
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {selectedEmployees.length > 0 ? (
                                                selectedEmployees.slice(0, 5).map(id => {
                                                    const emp = employees.find(e => e.id === id);
                                                    return (
                                                        <div key={id} className="w-8 h-8 rounded-full bg-primary border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-white font-semibold">
                                                            {(emp?.user?.firstName?.[0] || emp?.user?.name?.[0] || 'E').toUpperCase()}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-muted-foreground/70 font-medium ml-2">Assign employees...</span>
                                            )}
                                        </div>
                                        <div className={`transition-transform duration-200 ${showEmployeeDropdown ? 'rotate-180' : ''}`}>
                                            ▼
                                        </div>
                                    </button>

                                    {showEmployeeDropdown && (
                                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-card dark:bg-sidebar border border-border dark:border-slate-700 rounded-lg shadow-sm z-20 max-h-60 overflow-y-auto">
                                            {employees.map(emp => (
                                                <label key={emp.id} className="flex items-center gap-3 p-3 hover:bg-muted/60 dark:hover:bg-slate-700/50 cursor-pointer border-b border-border dark:border-slate-700 last:border-b-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmployees.includes(emp.id)}
                                                        onChange={() => handleEmployeeToggle(emp.id)}
                                                        className="w-4 h-4 rounded-lg accent-indigo-600"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground dark:text-slate-100">{emp.user?.name || `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim() || 'Unknown'}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground/70 uppercase">{emp.department?.name || (typeof emp.department === 'string' ? emp.department : "Consultant")}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Notes */}
                            <div className="flex flex-col">
                                <label className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide mb-2 ml-1">Additional Notes</label>
                                <textarea
                                    name="notes"
                                    value={project.notes}
                                    onChange={handleChange}
                                    className="w-full bg-muted/60 dark:bg-sidebar border border-border dark:border-slate-800 p-4 rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none min-h-[100px]"
                                    placeholder="Add any internal remarks or project constraints..."
                                />
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-border dark:border-slate-800 flex justify-end gap-4 bg-muted/50 dark:bg-sidebar/50">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-muted-foreground dark:text-muted-foreground/70 hover:text-foreground dark:hover:text-white transition-colors"
                    >
                        Discard
                    </button>
                    <button 
                        form="project-edit-form"
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-sm dark:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Commit Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// Internal Form Components
const FormInput = ({ label, name, type = "text", value, onChange, placeholder, required = false }) => (
    <div className="flex flex-col">
        <label className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide mb-2 ml-1">{label}</label>
        <input
            name={name}
            type={type}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-card dark:bg-sidebar border border-border dark:border-slate-700 p-3.5 rounded-lg text-sm font-bold text-foreground dark:text-white focus:ring-2 focus:ring-ring outline-none shadow-sm transition-all"
        />
    </div>
);

const FormSelect = ({ label, name, value, onChange, options }) => (
    <div className="flex flex-col">
        <label className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide mb-2 ml-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-card dark:bg-sidebar border border-border dark:border-slate-700 p-3.5 rounded-lg text-sm font-bold text-foreground dark:text-white focus:ring-2 focus:ring-ring outline-none shadow-sm transition-all cursor-pointer"
        >
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

export default ProjectEditModal;
