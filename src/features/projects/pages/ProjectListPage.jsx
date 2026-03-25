import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  }, [user, isAuthenticated, fetchProjects]);

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

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Projects</h1>
              <p className="text-muted-foreground">Manage and track your company projects and milestones.</p>
            </div>
            <button
              onClick={() => navigate("/add-project")}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg shadow hover:bg-primary/90 transition"
            >
              + Add Project
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
              <div className="p-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-semibold text-xl">
                No Projects Found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-3 border-b">Project</th>
                      <th className="px-4 py-3 border-b">Client</th>
                      <th className="px-4 py-3 border-b">Deadline</th>
                      <th className="px-4 py-3 border-b">Phase</th>
                      <th className="px-4 py-3 border-b">Assigning Date</th>
                      <th className="px-4 py-3 border-b">Payment</th>
                      <th className="px-4 py-3 border-b">Team</th>
                      <th className="px-4 py-3 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProjects.map((project, index) => (
                      <tr key={project?.id || `project-${index}`} className="hover:bg-muted/30 transition-colors text-sm">
                        <td className="px-4 py-3 font-medium text-foreground">{project.projectName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{project.clientName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{project.deadline}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.phase === 'Completed' ? 'bg-green-100 text-green-700' :
                            project.phase === 'Development' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {project.phase}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{project.assigningDate}</td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          ₹{project.paymentReceived} / ₹{project.totalPayment}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {project.assignedPeople.slice(0, 2).join(", ")}
                          {project.assignedPeople.length > 2 && ` +${project.assignedPeople.length - 2}`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ActionDropdown
                            project={project}
                            onDelete={handleDelete}
                            onEdit={(id) => navigate(`/edit-project/${id}`)}
                            onStatusChange={handleStatusChange}
                            onView={(id) => navigate(`/project-details/${id}`)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;