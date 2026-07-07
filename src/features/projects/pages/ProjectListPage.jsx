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

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" }
  ];

  return (
    <div className="min-h-screen bg-muted/60">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar} 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-10">
          <BreadcrumbNavigation items={breadcrumbItems} />

          {/* Clean Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Project Management</h1>
              <p className="text-muted-foreground text-sm mt-1 font-medium italic">Monitor milestones, budgets, and team allocation in real-time</p>
            </div>
            <button
              onClick={() => navigate("/add-project")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl text-sm shadow-sm hover:bg-primary/90 transition-all "
            >
              <Plus size={18} strokeWidth={3} />
              Add New Project
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1">Total Projects</p>
                <h3 className="text-4xl font-bold text-foreground">{filteredProjects.length}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-transform">
                <Briefcase size={24} />
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1">Active Projects</p>
                <h3 className="text-4xl font-bold text-primary">{filteredProjects.filter(p => p.status === 'active').length}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-transform">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1">Completed</p>
                <h3 className="text-4xl font-bold text-emerald-600">{filteredProjects.filter(p => p.phase === 'Completed').length}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center transition-transform">
                <Icon name="Check" size={24} strokeWidth={3} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="mb-6">
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">Performance analytics</h3>
             </div>
             <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                <ProjectAnalyticsGraph />
             </div>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <ProjectFilter
              search={search} setSearch={setSearch}
              phase={phase} setPhase={setPhase}
              budget={budget} setBudget={setBudget}
              sort={sort} setSort={setSort}
              deadlineStatus={deadlineStatus} setDeadlineStatus={setDeadlineStatus}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-muted/50">
                 <div className="w-16 h-16 border-4 border-border border-t-blue-600 animate-spin mb-4"></div>
                 <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/70">Syncing_Manifest...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-muted/30 border-t border-border">
                <div className="w-24 h-24 bg-card border border-border flex items-center justify-center mb-8 shadow-sm">
                  <Briefcase size={40} className="text-foreground" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-4">No record found</h3>
                <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em] mb-10 max-w-md leading-relaxed">
                  {search || phase || budget || deadlineStatus ? 
                    "No projects match current filter vectors. Adjust parameters or check terminal connection." :
                    "No projects yet. Create your first project to get started."
                  }
                </p>
                <button
                  onClick={() => navigate("/add-project")}
                  className="px-8 py-3 bg-sidebar text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm hover:bg-sidebar transition-all"
                >
                  Engage_System_Initialization
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Project</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Stakeholder</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Deadline</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Team</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProjects.map((project, index) => (
                      <tr key={project?.id || `project-${index}`} className="hover:bg-muted/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                              <Briefcase size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-foreground">{project.projectName}</div>
                              <div className="text-[11px] text-muted-foreground/70 font-medium">#{project.id?.split('-')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-foreground">{project.clientName}</div>
                          <div className="text-[11px] text-muted-foreground/70">{project.clientEmail}</div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col gap-1.5">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
 project.phase === 'Completed' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' :
 project.phase === 'Development' ? 'border-border bg-primary/10 text-primary' :
 project.phase === 'Testing' ? 'border-amber-100 bg-amber-50 text-amber-700' :
 'border-border bg-muted/60 text-muted-foreground'
 }`}>
                                {project.phase}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground/70 flex items-center gap-1">
                                  <div className={`w-1 h-1 rounded-full ${project.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                  {project.status || 'Active'}
                                </span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-foreground">
                            {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </div>
                          <div className={`text-[10px] font-bold mt-1 ${
 Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) < 0 ? 'text-rose-500' : 'text-muted-foreground/70'
 }`}>
                            {Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-foreground">
                            ₹{project.totalPayment?.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="bg-primary h-full transition-all duration-700 rounded-full"
                                  style={{ width: `${project.totalPayment > 0 ? Math.min((project.paymentReceived / project.totalPayment) * 100, 100) : 0}%` }}
                                />
                             </div>
                             <span className="text-[10px] font-bold text-foreground">
                                {project.totalPayment > 0 ? Math.round((project.paymentReceived / project.totalPayment) * 100) : 0}%
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {project.assignedPeople && project.assignedPeople.length > 0 ? (
                            <div className="flex items-center -space-x-2">
                              {project.assignedPeople.slice(0, 3).map((person, idx) => (
                                <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm" title={person}>
                                  {person.split(' ')[0][0]}{person.split(' ')[1]?.[0] || ''}
                                </div>
                              ))}
                              {project.assignedPeople.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-muted/60 text-muted-foreground/70 flex items-center justify-center text-[10px] font-bold">
                                  +{project.assignedPeople.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/70 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setIsViewModalOpen(true);
                              }}
                              className="px-4 py-2 bg-sidebar text-white text-[11px] font-bold rounded-lg hover:bg-sidebar transition-all "
                            >
                              Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 text-muted-foreground/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            >
                               <Icon name="Edit" size={18} />
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
