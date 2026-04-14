import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";
import Header from "../../../components/ui/Header";
import Sidebar from "../../../components/ui/Sidebar";
import { ProjectFilter, ActionDropdown, useProjectStore } from "features/projects";
import useAuthStore from "../../../store/useAuthStore";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import ProjectAnalyticsGraph from "./ProjectAnalyticsGraph";
import ProjectDetailsModal from "../components/ProjectDetailsModal";
import ProjectEditModal from "../components/ProjectEditModal";
import Icon from "../../../components/AppIcon";

const Projects = () => {
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState("");
  const [budget, setBudget] = useState(""); 
  const [deadlineStatus, setDeadlineStatus] = useState(""); 
  const [sort, setSort] = useState("All"); 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const { user, isAuthenticated } = useAuthStore();
  
  // FIX 1: Corrected "updatedproject" to "updateProject" to match your store
  const { projects, loading, fetchProjects, deleteProject, updateProject } = useProjectStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.company?.id) {
      fetchProjects(user.company.id);
    }
  }, [isAuthenticated, user?.company?.id]);


  const parsePeople = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    return str
      .replace(/[{}"]/g, "")
      .split(",")
      .map((p) => p.trim());
  };

  const cleanProjects = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      assignedPeople: parsePeople(p.assignedPeople),
      status: p.phase === 'Completed' ? 'completed' : (p.status || 'active'),
    }));
  }, [projects]);

  // FIX 2: Ensuring this function uses the correctly named 'updateProject'
  const handleStatusChange = async (id, newPhase) => {
    if (!user?.company?.id) {
      alert("User session expired. Please log in again.");
      return;
    }

    try {
      await updateProject(id, { phase: newPhase }, user.company.id);
      console.log(`Status updated to: ${newPhase}`);
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id, user.company.id);
        alert("Project deleted successfully");
      } catch (err) {
        alert("Failed to delete project");
      }
    }
  };

  const filteredProjects = useMemo(() => {
    return cleanProjects
      .filter((p) => {
        const matchesSearch = p.projectName.toLowerCase().includes(search.toLowerCase());
        const matchesPhase = phase === "" || p.phase === phase;

        const today = new Date();
        const deadline = new Date(p.deadline); 
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

        let matchesDeadline = true;
        if (deadlineStatus === "Overdue") matchesDeadline = diffDays < 0;
        else if (deadlineStatus === "Due this week") matchesDeadline = diffDays >= 0 && diffDays <= 7;
        else if (deadlineStatus === "Upcoming") matchesDeadline = diffDays > 7;

        let matchesBudget = true;
        if (budget === "Low Budget") matchesBudget = p.totalPayment < 50000;
        else if (budget === "Medium Budget") matchesBudget = p.totalPayment >= 50000 && p.totalPayment <= 150000;
        else if (budget === "High Budget") matchesBudget = p.totalPayment > 150000;

        return matchesSearch && matchesPhase && matchesDeadline && matchesBudget;
      })
      .sort((a, b) => {
        if (sort === "Recently Added") return new Date(b.assigningDate) - new Date(a.assigningDate);
        if (sort === "Closest Deadline") return new Date(a.deadline) - new Date(b.deadline);
        if (sort === "Price: Low to High") return a.totalPayment - b.totalPayment;
        if (sort === "Price: High to Low") return b.totalPayment - a.totalPayment;
        return 0;
      });
  }, [cleanProjects, search, phase, deadlineStatus, budget, sort]);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
        <div className="p-8 max-w-[1600px] mx-auto space-y-10">
          <BreadcrumbNavigation items={breadcrumbItems} />

          {/* Industrial Header Block */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-8 bg-blue-800 text-white border-b-4 border-blue-900 shadow-[12px_12px_0px_rgba(15,23,42,0.1)] group">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">
                <span className="w-8 h-px bg-blue-800"></span>
                <span>PROJECT_MANIFEST: OVERSIGHT_ACTIVE</span>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
                Projects_Base
              </h1>
              <p className="text-blue-300/60 text-xs font-bold uppercase tracking-[0.2em] max-w-xl">
                 Unified management and milestone tracking protocol for company infrastructure
              </p>
            </div>
            <button
              onClick={() => navigate("/add-project")}
              className="mt-6 lg:mt-0 inline-flex items-center gap-4 px-8 py-4 bg-white text-blue-950 font-black uppercase tracking-[0.2em] text-[10px] shadow-[8px_8px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 border-b-4 border-blue-200"
            >
              <Plus size={18} strokeWidth={3} />
              Engage_New_Project
            </button>
          </div>

          {/* Diagnostic Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_rgba(15,23,42,0.05)] divide-y md:divide-y-0 md:divide-x-2 divide-slate-900">
            <div className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Total_Units</p>
                <h3 className="text-3xl font-black text-slate-900 font-mono italic">{filteredProjects.length}</h3>
              </div>
              <div className="w-12 h-12 border-2 border-slate-100 flex items-center justify-center group-hover:border-slate-900 transition-colors">
                <div className="w-2 h-2 bg-slate-900"></div>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Active_Vectors</p>
                <h3 className="text-3xl font-black text-blue-600 font-mono italic">{filteredProjects.filter(p => p.status === 'active').length}</h3>
              </div>
              <div className="w-12 h-12 border-2 border-slate-100 flex items-center justify-center group-hover:border-blue-600 transition-colors">
                 <div className="w-4 h-0.5 bg-blue-600 animate-pulse"></div>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Completed_Artifacts</p>
                <h3 className="text-3xl font-black text-emerald-600 font-mono italic">{filteredProjects.filter(p => p.phase === 'Completed').length}</h3>
              </div>
              <Icon name="Check" size={24} className="text-slate-200 group-hover:text-emerald-600 transition-colors" strokeWidth={3} />
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-6 bg-slate-950"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-950">INTELLIGENCE_CENTER</h3>
             </div>
             <ProjectAnalyticsGraph />
          </div>

          <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-[12px_12px_0px_rgba(15,23,42,0.05)]">
            <ProjectFilter
              search={search} setSearch={setSearch}
              phase={phase} setPhase={setPhase}
              budget={budget} setBudget={setBudget}
              sort={sort} setSort={setSort}
              deadlineStatus={deadlineStatus} setDeadlineStatus={setDeadlineStatus}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50">
                 <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent animate-spin mb-4"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing_Manifest...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-slate-50/30 border-t-2 border-slate-900">
                <div className="w-24 h-24 bg-white border-4 border-slate-900 flex items-center justify-center mb-8 shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                  <Briefcase size={40} className="text-slate-900" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Null_Record_Set_Detected</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 max-w-md leading-relaxed">
                  {search || phase || budget || deadlineStatus ? 
                    "No projects match current filter vectors. Adjust parameters or check terminal connection." :
                    "Infrastructure is currently idle. Initialize first project artifact to begin tracking."
                  }
                </p>
                <button
                  onClick={() => navigate("/add-project")}
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_rgba(0,0,0,0.15)] hover:shadow-none transition-all"
                >
                  Engage_System_Initialization
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border-t-2 border-slate-900">
                <table className="w-full divide-y-2 divide-slate-900">
                  <thead className="bg-slate-50">
                    <tr className="divide-x border-b-2 border-slate-900">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project / Identity</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stakeholder</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol / Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deadline_Index</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource_Alloc</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution_Map</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit_Team</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredProjects.map((project, index) => (
                      <tr key={project?.id || `project-${index}`} className="hover:bg-slate-50 transition-colors divide-x divide-slate-100 group">
                        <td className="px-6 py-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-12 h-12 bg-slate-900 flex items-center justify-center text-white">
                              <Briefcase size={20} strokeWidth={2.5} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{project.projectName}</div>
                              <div className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">ID::{project.id?.split('-')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-xs font-black text-slate-900 uppercase tracking-[0.05em]">{project.clientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono italic">{project.clientEmail}</div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex flex-col gap-1.5">
                                <span className={`inline-flex px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] border-2 w-fit ${
                                project.phase === 'Completed' ? 'border-emerald-900 bg-emerald-50 text-emerald-900' :
                                project.phase === 'Development' ? 'border-blue-900 bg-blue-50 text-blue-900' :
                                project.phase === 'Testing' ? 'border-amber-900 bg-amber-50 text-amber-900' :
                                'border-slate-900 bg-slate-50 text-slate-900'
                                }`}>
                                {project.phase}
                                </span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{project.status || 'ACTIVE_MODE'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-sm font-black text-slate-900 font-mono uppercase">
                            {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </div>
                          <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${
                            Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) < 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            T-{Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))} DAYS_REMAINING
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-sm font-black text-slate-900 font-mono italic">
                            ₹{project.totalPayment?.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-1">
                            RECEIVED: ₹{project.paymentReceived?.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-16 h-2 bg-slate-100 border border-slate-200 shadow-inner overflow-hidden">
                                <div
                                  className="bg-slate-900 h-full transition-all duration-700"
                                  style={{ width: `${project.totalPayment > 0 ? Math.min((project.paymentReceived / project.totalPayment) * 100, 100) : 0}%` }}
                                />
                             </div>
                             <span className="text-[10px] font-black font-mono text-slate-900">
                                {project.totalPayment > 0 ? Math.round((project.paymentReceived / project.totalPayment) * 100) : 0}%
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          {project.assignedPeople && project.assignedPeople.length > 0 ? (
                            <div className="flex items-center">
                              <div className="flex -space-x-1.5">
                                {project.assignedPeople.slice(0, 3).map((person, idx) => (
                                  <div key={idx} className="w-8 h-8 border-2 border-white bg-slate-950 text-white flex items-center justify-center text-[9px] font-black uppercase tracking-tighter shadow-sm">
                                    {person.split(' ')[0][0]}{person.split(' ')[1]?.[0] || ''}
                                  </div>
                                ))}
                              </div>
                              {project.assignedPeople.length > 3 && (
                                <span className="ml-2 text-[9px] font-black text-slate-400 italic">+{project.assignedPeople.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[9px] font-black text-slate-300 uppercase italic">UNASSIGNED</span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setIsViewModalOpen(true);
                              }}
                              className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(15,23,42,0.1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white hover:border-slate-900 transition-all border-b-4"
                            >
                               <Icon name="Edit" size={16} strokeWidth={2.5}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {isViewModalOpen && (
          <ProjectDetailsModal 
            projectId={selectedProjectId} 
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedProjectId(null);
            }} 
          />
        )}
        {isEditModalOpen && (
          <ProjectEditModal 
            projectId={selectedProjectId} 
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProjectId(null);
            }} 
            onSaveSuccess={() => {
              if (user?.company?.id) fetchProjects(user.company.id);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Projects;
