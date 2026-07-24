import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  ChevronRight,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";
import Header from "../../../components/ui/Header";
import Sidebar from "../../../components/ui/Sidebar";
import { ProjectFilter, useProjectStore } from "features/projects";
import useAuthStore from "../../../store/useAuthStore";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import ProjectAnalyticsGraph from "./ProjectAnalyticsGraph";
import ProjectEditModal from "../components/ProjectEditModal";
import {
  decorateProject,
  HEALTH_META,
  PHASE_STYLES,
  formatCurrency,
  formatDate,
  deadlineLabel,
  initials,
} from "../projectUtils";

const VIEWS = [
  { key: "active", label: "Active" },
  { key: "attention", label: "Needs attention" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

const Projects = () => {
  const [view, setView] = useState("active");
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState("");
  const [budget, setBudget] = useState("");
  const [deadlineStatus, setDeadlineStatus] = useState("");
  const [projectType, setProjectType] = useState("");
  const [sort, setSort] = useState("Priority");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const { user, isAuthenticated } = useAuthStore();
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
  const navigate = useNavigate();

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This will permanently delete the project and all its tasks.")) return;
    try {
      await deleteProject(projectId, user.company.id);
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.company?.id) {
      fetchProjects(user.company.id);
    }
  }, [isAuthenticated, user?.company?.id]);

  // The API already returns these derived fields, but older cached payloads and
  // the create/update round-trips may not, so we normalise defensively.
  const allProjects = useMemo(
    () => projects.map(decorateProject),
    [projects]
  );

  const summary = useMemo(() => {
    const active = allProjects.filter((p) => p.health !== "completed");
    return {
      active: active.length,
      attention: allProjects.filter(
        (p) => p.health === "overdue" || p.health === "at-risk"
      ).length,
      completed: allProjects.filter((p) => p.health === "completed").length,
      outstanding: active.reduce((sum, p) => sum + p.outstandingPayment, 0),
    };
  }, [allProjects]);

  const visibleProjects = useMemo(() => {
    const byView = allProjects.filter((p) => {
      if (view === "active") return p.health !== "completed";
      if (view === "completed") return p.health === "completed";
      if (view === "attention")
        return p.health === "overdue" || p.health === "at-risk";
      return true;
    });

    const filtered = byView.filter((p) => {
      const haystack = `${p.projectName || ""} ${p.clientName || ""}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) return false;
      if (phase && p.phase !== phase) return false;

      if (projectType === "company" && !p.isCompanyProject) return false;
      if (projectType === "client" && p.isCompanyProject) return false;

      if (deadlineStatus === "Overdue" && !p.isOverdue) return false;
      if (
        deadlineStatus === "Due this week" &&
        !(p.daysRemaining !== null && p.daysRemaining >= 0 && p.daysRemaining <= 7)
      )
        return false;
      if (
        deadlineStatus === "Upcoming" &&
        !(p.daysRemaining !== null && p.daysRemaining > 7)
      )
        return false;

      if (budget === "Low Budget" && !(p.totalPayment < 50000)) return false;
      if (
        budget === "Medium Budget" &&
        !(p.totalPayment >= 50000 && p.totalPayment <= 150000)
      )
        return false;
      if (budget === "High Budget" && !(p.totalPayment > 150000)) return false;

      return true;
    });

    if (sort === "Recently Added")
      return [...filtered].sort(
        (a, b) =>
          new Date(b.assigningDate || b.createdAt || 0) -
          new Date(a.assigningDate || a.createdAt || 0)
      );
    if (sort === "Closest Deadline")
      return [...filtered].sort(
        (a, b) => (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity)
      );
    if (sort === "Highest Value")
      return [...filtered].sort((a, b) => b.totalPayment - a.totalPayment);

    return filtered; // "Priority" — server order: overdue, at-risk, on-track, completed
  }, [allProjects, view, search, phase, deadlineStatus, budget, sort, projectType]);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsMobileSidebarOpen((v) => !v)} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"
        } pt-16 pb-12`}
      >
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
          <BreadcrumbNavigation items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Projects
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {summary.active} in flight
                {summary.attention > 0 && (
                  <>
                    {" · "}
                    <span className="text-error font-medium">
                      {summary.attention} need attention
                    </span>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate("/add-project")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              New project
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<Briefcase size={18} />}
              label="Active"
              value={summary.active}
            />
            <SummaryCard
              icon={<AlertTriangle size={18} />}
              label="Needs attention"
              value={summary.attention}
              tone={summary.attention > 0 ? "error" : "muted"}
            />
            <SummaryCard
              icon={<CheckCircle2 size={18} />}
              label="Completed"
              value={summary.completed}
              tone="success"
            />
            <SummaryCard
              icon={<Wallet size={18} />}
              label="Outstanding"
              value={formatCurrency(summary.outstanding)}
            />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 sm:px-6 pt-4 flex flex-wrap items-center gap-1 border-b border-border">
              {VIEWS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    view === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <ProjectFilter
              search={search}
              setSearch={setSearch}
              phase={phase}
              setPhase={setPhase}
              budget={budget}
              setBudget={setBudget}
              sort={sort}
              setSort={setSort}
              deadlineStatus={deadlineStatus}
              setDeadlineStatus={setDeadlineStatus}
              projectType={projectType}
              setProjectType={setProjectType}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mb-4" />
                <span className="text-sm text-muted-foreground">
                  Loading projects…
                </span>
              </div>
            ) : visibleProjects.length === 0 ? (
              <EmptyState
                view={view}
                filtered={Boolean(search || phase || budget || deadlineStatus)}
                onCreate={() => navigate("/add-project")}
              />
            ) : (
              <ProjectTable
                projects={visibleProjects}
                onOpen={(id) => navigate(`/project-details/${id}`)}
                onEdit={(id) => {
                  setSelectedProjectId(id);
                  setIsEditModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            )}
          </div>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Performance analytics
            </h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <ProjectAnalyticsGraph />
            </div>
          </section>
        </div>

        {isEditModalOpen && (
          <ProjectEditModal
            projectId={selectedProjectId}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProjectId(null);
            }}
            onSaveSuccess={() => {
              if (user?.company?.id) fetchProjects(user.company.id, true);
            }}
          />
        )}
      </main>
    </div>
  );
};

const TONES = {
  muted: "bg-muted text-muted-foreground",
  error: "bg-error/10 text-error",
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
};

const SummaryCard = ({ icon, label, value, tone = "primary" }) => (
  <div className="bg-card p-5 rounded-xl border border-border">
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${TONES[tone]}`}
      >
        {icon}
      </span>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
    <p className="text-2xl font-semibold text-foreground tracking-tight">
      {value}
    </p>
  </div>
);

const ProjectTable = ({ projects, onOpen, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[900px]">
      <thead>
        <tr className="border-b border-border">
          {["Project", "Client", "Status", "Deadline", "Payment", "Team", ""].map(
            (heading, i) => (
              <th
                key={heading || i}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground"
              >
                {heading}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {projects.map((project) => {
          const health = HEALTH_META[project.health];
          return (
            <tr
              key={project.id}
              onClick={() => onOpen(project.id)}
              className="group hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-1 h-9 rounded-full ${health.bar}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                      {project.projectName || "Untitled project"}
                      {project.isCompanyProject && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                          <Building2 size={10} />
                          Internal
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {health.label}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="text-sm text-foreground truncate max-w-[180px]">
                  {project.clientName || "—"}
                </div>
                {project.clientEmail && (
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {project.clientEmail}
                  </div>
                )}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                    PHASE_STYLES[project.phase] || PHASE_STYLES.default
                  }`}
                >
                  {project.phase || "Planning"}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="text-sm text-foreground">
                  {formatDate(project.deadline)}
                </div>
                <div className={`text-xs ${health.text}`}>
                  {deadlineLabel(project)}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="text-sm font-medium text-foreground">
                  {formatCurrency(project.totalPayment)}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${project.paymentProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {project.paymentProgress}%
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                <TeamAvatars members={project.assignedEmployees} />
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(project.id);
                    }}
                    aria-label={`Edit ${project.projectName}`}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project.id);
                    }}
                    aria-label={`Delete ${project.projectName}`}
                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground/50 group-hover:text-foreground transition-colors"
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const TeamAvatars = ({ members = [] }) => {
  if (members.length === 0) {
    return <span className="text-xs text-muted-foreground">Unassigned</span>;
  }
  return (
    <div className="flex items-center -space-x-2">
      {members.slice(0, 3).map((member) => (
        <div
          key={member.id}
          title={member.name}
          className="w-7 h-7 rounded-full ring-2 ring-card bg-muted overflow-hidden flex items-center justify-center text-[10px] font-medium text-muted-foreground"
        >
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials(member.name)
          )}
        </div>
      ))}
      {members.length > 3 && (
        <div className="w-7 h-7 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
          +{members.length - 3}
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ view, filtered, onCreate }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
      <Briefcase size={22} className="text-muted-foreground" />
    </div>
    <h3 className="text-base font-medium text-foreground mb-1">
      {filtered
        ? "No matching projects"
        : view === "attention"
        ? "Nothing needs attention"
        : view === "completed"
        ? "No completed projects yet"
        : "No active projects"}
    </h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6">
      {filtered
        ? "Try clearing a filter or widening your search."
        : view === "attention"
        ? "Every project is on track against its deadline."
        : "Create a project to start tracking deadlines, budgets and team allocation."}
    </p>
    {!filtered && view !== "attention" && (
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus size={16} />
        New project
      </button>
    )}
  </div>
);

export default Projects;
