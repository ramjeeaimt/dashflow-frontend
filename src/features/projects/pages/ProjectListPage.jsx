import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";
import Header from "../../../components/ui/Header";
import Sidebar from "../../../components/ui/Sidebar";
import { ProjectFilter, ActionDropdown, useProjectStore } from "features/projects";
import useAuthStore from "../../../store/useAuthStore";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import ProjectAnalyticsGraph from "./ProjectAnalyticsGraph";

const Projects = () => {
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState("");
  const [budget, setBudget] = useState(""); 
  const [deadlineStatus, setDeadlineStatus] = useState(""); 
  const [sort, setSort] = useState("All"); 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
        <div className="p-6">
          <BreadcrumbNavigation items={breadcrumbItems} />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Projects
              </h1>
              <p className="text-gray-600 text-lg">
                Manage and track your company projects and milestones
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {filteredProjects.length} Projects
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {filteredProjects.filter(p => p.status === 'active').length} Active
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {filteredProjects.filter(p => p.phase === 'Completed').length} Completed
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/add-project")}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              Add New Project
            </button>
          </div>

          <div className="mb-8">
            <ProjectAnalyticsGraph />
          </div>

          <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
            <ProjectFilter
              search={search} setSearch={setSearch}
              phase={phase} setPhase={setPhase}
              budget={budget} setBudget={setBudget}
              sort={sort} setSort={setSort}
              deadlineStatus={deadlineStatus} setDeadlineStatus={setDeadlineStatus}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin animation-delay-300"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Loading Projects</h3>
                <p className="text-gray-500 text-center max-w-md">Please wait while we fetch your project data...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase size={40} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Projects Found</h3>
                <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                  {search || phase || budget || deadlineStatus ? 
                    "No projects match your current filters. Try adjusting your search criteria." :
                    "Get started by creating your first project to track progress and manage your team."
                  }
                </p>
                <button
                  onClick={() => navigate("/add-project")}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Plus size={20} />
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phase</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deadline</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProjects.map((project, index) => (
                        <tr key={project?.id || `project-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Briefcase size={20} className="text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900 line-clamp-1">{project.projectName}</div>
                                <div className="text-sm text-gray-500">ID: {project.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">{project.clientName}</div>
                            <div className="text-sm text-gray-500">{project.clientEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              project.phase === 'Completed' ? 'bg-green-100 text-green-800' :
                              project.phase === 'Development' ? 'bg-blue-100 text-blue-800' :
                              project.phase === 'Testing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {project.phase}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              project.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {project.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">
                              {new Date(project.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className={`text-xs font-medium ${
                              Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) < 0
                                ? 'text-red-600'
                                : Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) <= 7
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}>
                              {Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-semibold">
                              ₹{project.totalPayment?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              ₹{project.paymentReceived?.toLocaleString() || '0'} received
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-1 mr-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${project.totalPayment > 0 ? Math.min((project.paymentReceived / project.totalPayment) * 100, 100) : 0}%`
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {project.totalPayment > 0 ? Math.round((project.paymentReceived / project.totalPayment) * 100) : 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {project.assignedPeople && project.assignedPeople.length > 0 ? (
                              <div className="flex items-center">
                                <div className="flex -space-x-2">
                                  {project.assignedPeople.slice(0, 3).map((person, idx) => (
                                    <div key={idx} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                                      {person.split(' ')[0][0]}{person.split(' ')[1]?.[0] || ''}
                                    </div>
                                  ))}
                                </div>
                                {project.assignedPeople.length > 3 && (
                                  <span className="ml-2 text-sm font-medium text-gray-500">
                                    +{project.assignedPeople.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No team assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => navigate(`/project-details/${project.id}`)}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => navigate(`/edit-project/${project.id}`)}
                                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
