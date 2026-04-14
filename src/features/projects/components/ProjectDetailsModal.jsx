import React, { useEffect, useState } from "react";
import { X, Briefcase, Calendar, DollarSign, Github, ExternalLink, Mail, User, Clock, Loader2 } from "lucide-react";
import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { employeeService } from "../../../services/employee.service";

const ProjectDetailsModal = ({ projectId, onClose }) => {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [employeeMap, setEmployeeMap] = useState({});

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const [projectRes, employees] = await Promise.all([
                apiClient.get(`${API_ENDPOINTS.PROJECTS.BASE}/${projectId}`),
                employeeService.getAll()
            ]);
            
            const data = projectRes.data.data || projectRes.data;
            
            // Map employee IDs to names
            const map = {};
            employees.forEach(emp => {
                map[emp.id] = `${emp.user?.firstName || "Unknown"} ${emp.user?.lastName || ""}`.trim();
            });
            setEmployeeMap(map);

            let assignedPeople = data.assignedPeople;
            if (typeof assignedPeople === 'string') {
                assignedPeople = assignedPeople.replace(/[{}"]/g, "").split(",").map(p => p.trim());
            } else if (!Array.isArray(assignedPeople)) {
                assignedPeople = [];
            }
            
            setProject({ ...data, assignedPeople });
        } catch (err) {
            console.error("Error fetching project:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);

    if (!projectId) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-none shadow-[24px_24px_0px_rgba(15,23,42,0.1)] overflow-hidden border-2 border-slate-900 flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Industrial Header Bloc */}
                <div className="px-8 py-6 border-b-2 border-slate-900 flex justify-between items-center bg-blue-800 text-white">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-900 text-blue-200 border-2 border-blue-700 flex items-center justify-center">
                            <Briefcase size={28} strokeWidth={3} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-300">
                                <span className="w-8 h-px bg-blue-500"></span>
                                <span>PROJECT_OVERSIGHT_PROTOCOL</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none italic">
                                Unit_Details
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-blue-900 text-blue-200 border-2 border-blue-700 hover:bg-white hover:text-blue-950 transition-all hover:scale-105 active:scale-95"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="w-16 h-1 bg-slate-100 overflow-hidden relative mb-6">
                                <div className="absolute inset-0 bg-slate-900 animate-[loading-bar_1.5s_infinite]"></div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">SYNCHRONIZING_CORE_DATA...</p>
                        </div>
                    ) : project ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Left Side: Overview & Team */}
                            <div className="lg:col-span-2 space-y-10">
                                {/* Diagnostic Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 bg-white border-2 border-slate-900 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-900">
                                    <DetailCard 
                                        icon={<DollarSign size={18} strokeWidth={3} />} 
                                        label="Capital_Allocation" 
                                        value={`₹${project.totalPayment?.toLocaleString()}`} 
                                    />
                                    <DetailCard 
                                        icon={<Clock size={18} strokeWidth={3} />} 
                                        label="Temporal_Deadline" 
                                        value={new Date(project.deadline).toLocaleDateString()} 
                                    />
                                    <DetailCard 
                                        icon={<ExternalLink size={18} strokeWidth={3} />} 
                                        label="Deployment_Phase" 
                                        value={project.phase} 
                                    />
                                </div>

                                {/* Description Area */}
                                <div className="bg-slate-50 border-2 border-slate-900 p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-900/[0.03] group-hover:bg-slate-900/[0.05 transition-all -rotate-45 translate-x-8 -translate-y-8" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 border-b border-slate-200 pb-2">Technical_Summary</h3>
                                    <p className="text-slate-900 font-bold leading-relaxed text-sm italic">
                                        "{project.description || "NO_SPECIFICATIONS_PROVIDED_FOR_THIS_UNIT."}"
                                    </p>
                                </div>

                                {/* Personnel Manifest */}
                                <div>
                                    <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-900 pb-2">
                                        <User size={18} strokeWidth={3} className="text-slate-900" />
                                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Team_Manifest</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {project.assignedPeople?.length > 0 ? (
                                            project.assignedPeople.map((person, i) => {
                                                const resolvedName = employeeMap[person] || person;
                                                return (
                                                    <div key={i} className="flex items-center gap-4 bg-white border-2 border-slate-900 px-6 py-3 transition-all hover:bg-slate-900 group">
                                                        <div className="w-6 h-6 bg-slate-900 text-white flex items-center justify-center text-[10px] font-black group-hover:bg-white group-hover:text-slate-900 transition-colors">
                                                            {resolvedName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest group-hover:text-white transition-colors">
                                                            {resolvedName}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Personnel: UNASSIGNED</p>
                                        )}
                                    </div>
                                </div>

                                {/* External Links */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                    <LinkSection icon={<Github size={18} />} label="Repository_Branch" url={project.githubLink} />
                                    <LinkSection icon={<ExternalLink size={18} />} label="Deployment_Vector" url={project.deploymentLink} />
                                </div>
                            </div>

                            {/* Right Side: Client & Progress */}
                            <div className="space-y-8">
                                {/* Client Entity Card */}
                                <div className="bg-slate-900 p-8 text-white border-2 border-slate-900 shadow-[8px_8px_0px_rgba(15,23,42,0.1)] group">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 border-b border-white/10 pb-2">Client_Identity</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Full_Designation</p>
                                            <p className="text-2xl font-black tracking-tight mt-1 italic">{project.clientName}</p>
                                        </div>
                                        <div className="flex items-center gap-5 bg-white/5 border border-white/10 p-5 group-hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 bg-white text-slate-900 flex items-center justify-center">
                                                <Mail size={20} strokeWidth={3} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Comm_Channel</p>
                                                <p className="text-xs font-bold truncate lowercase">{project.clientEmail}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Metadata</p>
                                            <p className="text-[11px] font-bold text-slate-300 leading-relaxed italic">{project.contactInfo || "NO_ADDITIONAL_INTERCEPTED_DATA"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Industrial Collection Gauge */}
                                <div className="bg-white p-8 border-2 border-slate-900 shadow-[8px_8px_0px_rgba(15,23,42,0.05)]">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Collection_Level</h3>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Status: PHASE_COMPLETE</p>
                                        </div>
                                        <span className="text-sm font-black text-emerald-600 font-mono italic">
                                            {project.totalPayment > 0 ? Math.round((project.paymentReceived / project.totalPayment) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-6 border-2 border-slate-900 overflow-hidden relative">
                                        <div 
                                            className="bg-emerald-500 h-full transition-all duration-1000 ease-out border-r-2 border-slate-900 shadow-[2px_0_0_rgba(15,23,42,1)]" 
                                            style={{ width: `${project.totalPayment > 0 ? (project.paymentReceived / project.totalPayment) * 100 : 0}%` }}
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Received</p>
                                            <p className="text-base font-black text-slate-900 font-mono italic">₹{project.paymentReceived?.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right border-l-2 border-slate-100 pl-4">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deficit</p>
                                            <p className="text-base font-black text-slate-900 font-mono italic">₹{(project.totalPayment - project.paymentReceived)?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-24 text-center border-2 border-slate-100 border-dashed">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">CRITICAL_ERROR: PROJECT_NOT_FOUND</p>
                        </div>
                    )}
                </div>

                {/* Footer Protocols */}
                <div className="px-8 py-6 border-t-2 border-slate-900 bg-slate-50 flex justify-end gap-6">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white border-2 border-slate-200 hover:border-slate-900 hover:text-slate-950 transition-all active:scale-95"
                    >
                        Exit_Diagnostics
                    </button>
                    {project && (
                        <a 
                            href={`/edit-project/${project.id}`}
                            className="px-8 py-3 text-[10px] font-black text-white bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 transition-all active:scale-95 shadow-[4px_4px_0px_rgba(15,23,42,0.1)]"
                        >
                            Execute_Full_Modification
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

// Internal Industrial Components
const DetailCard = ({ icon, label, value }) => {
    return (
        <div className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
                <div className="text-slate-400 group-hover:text-slate-900 transition-colors">
                    {icon}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-lg font-black text-slate-900 font-mono italic tracking-tighter">{value || "N/A"}</p>
        </div>
    );
};

const LinkSection = ({ icon, label, url }) => (
    <div className="bg-white p-5 border-2 border-slate-900 flex items-center justify-between group hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-5">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900 transition-all">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="text-[11px] font-black text-blue-800 hover:underline flex items-center gap-1 uppercase tracking-widest">
                        Access_Vector <ExternalLink size={10} strokeWidth={3} />
                    </a>
                ) : (
                    <p className="text-[10px] font-black text-slate-300 uppercase italic">U_UNDEFINED</p>
                )}
            </div>
        </div>
    </div>
);

export default ProjectDetailsModal;
