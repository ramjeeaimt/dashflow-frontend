import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import Sidebar from "../../../components/ui/Sidebar";
import Header from "../../../components/ui/Header";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";

const ProjectDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const fetchProject = async () => {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.PROJECTS.BASE}/${id}`);
            const data = res.data.data || res.data;
            let assignedPeople = data.assignedPeople;
            if (typeof assignedPeople === 'string') {
                assignedPeople = assignedPeople.replace(/[{}"]/g, "").split(",").map(p => p.trim());
            }
            setProject({ ...data, assignedPeople });
        } catch (err) {
            console.error("Error fetching project:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const breadcrumbItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Projects", path: "/projects" },
        { label: project?.projectName || "Details", path: "#" }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950">
            <Header onToggleSidebar={toggleMobileSidebar} />
            <Sidebar 
                isCollapsed={sidebarCollapsed} 
                onToggleCollapse={handleToggleSidebar}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />
            
            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8 px-4 sm:px-6 md:px-8`}>
                <div className="max-w-7xl mx-auto">
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
                                <div className="absolute top-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="mt-4 text-slate-500 font-medium animate-pulse">Building View...</p>
                        </div>
                    ) : !project ? (
                        <div className="p-10 text-center text-slate-500">Project not found</div>
                    ) : (
                        <>
                            {/* TOP ACTION BAR */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <BreadcrumbNavigation items={breadcrumbItems} />
                                    <div className="flex items-center gap-3 mt-2">
                                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {project.projectName}
                                        </h1>
                                        <StatusBadge phase={project.phase} />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => navigate("/projects")} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                        Back
                                    </button>
                                    <button onClick={() => navigate(`/edit-project/${id}`)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-none">
                                        Edit Project
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* LEFT COLUMN */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <StatCard label="Total Budget" value={`₹${project.totalPayment}`} color="blue" />
                                        <StatCard label="Collected" value={`₹${project.paymentReceived}`} color="green" />
                                        <StatCard label="Deadline" value={project.deadline} color="orange" />
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-100">Project Overview</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                            <DetailItem label="Assigning Date" value={project.assigningDate} />
                                            <DetailItem label="Current Phase" value={project.phase} />
                                            <div className="md:col-span-2">
                                                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Links</p>
                                                <div className="space-y-3">
                                                    <LinkItem label="GitHub Repository" url={project.githubLink} />
                                                    <LinkItem label="Live Deployment" url={project.deploymentLink} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">Team Members</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.assignedPeople?.map((person, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                        {person.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{person}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white rounded-2xl p-6 text-black shadow-xl shadow-indigo-100 dark:shadow-none border border-slate-100">
                                        <h3 className="text-lg font-bold mb-4 opacity-90">Client Details</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Client Name:</p>
                                                <p className="text-xl font-medium mt-1">{project.clientName}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Contact Information:</p>
                                                <p className="mt-1">{project.contactInfo}</p>
                                                <p className="mt-1 opacity-80">{project.clientEmail}</p>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100">
                                                <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-lg transition text-sm font-medium">
                                                    Email Client
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Payment Progress</h3>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-green-500 h-full transition-all duration-1000" 
                                                style={{ width: `${(project.paymentReceived / project.totalPayment) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">
                                            {Math.round((project.paymentReceived / project.totalPayment) * 100)}% of total budget collected
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

// Sub-components
const StatCard = ({ label, value, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100",
        orange: "bg-orange-50 text-orange-700 border-orange-100"
    };
    return (
        <div className={`${colors[color]} p-4 rounded-2xl border flex flex-col items-center justify-center text-center shadow-sm`}>
            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70 mb-1">{label}</p>
            <p className="text-lg font-bold tracking-tight">{value || "-"}</p>
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{value || "Not set"}</p>
    </div>
);

const LinkItem = ({ label, url }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline truncate max-w-[200px]">
            {url ? "View Link ↗" : "N/A"}
        </a>
    </div>
);

const StatusBadge = ({ phase }) => {
    const styles = {
        'Completed': "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        'Development': "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        'default': "bg-slate-100 text-slate-600"
    };
    return (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${styles[phase] || styles.default}`}>
            {phase}
        </span>
    );
};

export default ProjectDetails;