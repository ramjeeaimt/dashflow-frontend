import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Github,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  CalendarClock,
  Users,
  Wallet,
} from "lucide-react";
import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import Sidebar from "../../../components/ui/Sidebar";
import Header from "../../../components/ui/Header";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import {
  decorateProject,
  HEALTH_META,
  PHASE_STYLES,
  formatCurrency,
  formatDate,
  deadlineLabel,
  initials,
} from "../projectUtils";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`${API_ENDPOINTS.PROJECTS.BASE}/${id}`);
        const data = res.data?.data || res.data;
        if (!cancelled) setProject(data ? decorateProject(data) : null);
      } catch (err) {
        console.error("Error fetching project:", err);
        if (!cancelled) setProject(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProject();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    { label: project?.projectName || "Details", path: "#" },
  ];

  const health = project ? HEALTH_META[project.health] : null;

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
        } pt-16 pb-12 px-4 sm:px-8`}
      >
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading project…</p>
            </div>
          ) : !project ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h2 className="text-base font-medium text-foreground mb-1">
                Project not found
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                It may have been deleted or you don't have access to it.
              </p>
              <button
                onClick={() => navigate("/projects")}
                className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to projects
              </button>
            </div>
          ) : (
            <div className="space-y-6 pt-6">
              <BreadcrumbNavigation items={breadcrumbItems} />

              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                      {project.projectName || "Untitled project"}
                    </h1>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        PHASE_STYLES[project.phase] || PHASE_STYLES.default
                      }`}
                    >
                      {project.phase || "Planning"}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${health.badge}`}
                    >
                      {health.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {project.clientName || "No client"} · Started{" "}
                    {formatDate(project.assigningDate)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate("/projects")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ArrowLeft size={15} />
                    Back
                  </button>
                  <button
                    onClick={() => navigate(`/edit-project/${id}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                </div>
              </div>

              {/* Key figures */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat
                  icon={<Wallet size={16} />}
                  label="Contract value"
                  value={formatCurrency(project.totalPayment)}
                />
                <Stat
                  icon={<Wallet size={16} />}
                  label="Outstanding"
                  value={formatCurrency(project.outstandingPayment)}
                  emphasis={project.outstandingPayment > 0 ? "text-error" : undefined}
                />
                <Stat
                  icon={<CalendarClock size={16} />}
                  label="Deadline"
                  value={formatDate(project.deadline)}
                  hint={deadlineLabel(project)}
                  hintClass={health.text}
                />
                <Stat
                  icon={<Users size={16} />}
                  label="Team size"
                  value={project.assignedEmployees.length}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-6">
                  <Card title="Overview">
                    {project.description ? (
                      <p className="text-sm text-foreground leading-relaxed">
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No description added yet.
                      </p>
                    )}

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-6 pt-6 border-t border-border">
                      <Field
                        icon={<Calendar size={14} />}
                        label="Start date"
                        value={formatDate(project.assigningDate)}
                      />
                      <Field
                        icon={<CalendarClock size={14} />}
                        label="Deadline"
                        value={formatDate(project.deadline)}
                      />
                      <Field label="Phase" value={project.phase || "Planning"} />
                      <Field
                        label="Status"
                        value={project.derivedStatus || project.status || "active"}
                      />
                    </dl>
                  </Card>

                  <Card title="Team" count={project.assignedEmployees.length}>
                    {project.assignedEmployees.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Nobody assigned to this project yet.
                      </p>
                    ) : (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {project.assignedEmployees.map((member) => (
                          <li
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border"
                          >
                            <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
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
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {member.designation || member.email || "Team member"}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>

                  <Card title="Links">
                    <div className="space-y-2">
                      <LinkRow
                        icon={<Github size={15} />}
                        label="Repository"
                        url={project.githubLink}
                      />
                      <LinkRow
                        icon={<ExternalLink size={15} />}
                        label="Live deployment"
                        url={project.deploymentLink}
                      />
                    </div>
                  </Card>
                </div>

                {/* Side column */}
                <div className="space-y-6">
                  <Card title="Payment">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-2xl font-semibold text-foreground tracking-tight">
                        {formatCurrency(project.paymentReceived)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        of {formatCurrency(project.totalPayment)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all duration-500"
                        style={{ width: `${project.paymentProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="text-muted-foreground">
                        {project.paymentProgress}% collected
                      </span>
                      <span
                        className={
                          project.outstandingPayment > 0
                            ? "text-error font-medium"
                            : "text-success font-medium"
                        }
                      >
                        {project.outstandingPayment > 0
                          ? `${formatCurrency(project.outstandingPayment)} due`
                          : "Fully paid"}
                      </span>
                    </div>
                  </Card>

                  <Card title="Client">
                    <p className="text-base font-medium text-foreground">
                      {project.clientName || "Not specified"}
                    </p>
                    <div className="mt-4 space-y-3">
                      <ContactRow
                        icon={<Mail size={14} />}
                        value={project.clientEmail}
                        href={
                          project.clientEmail ? `mailto:${project.clientEmail}` : null
                        }
                      />
                      <ContactRow
                        icon={<Phone size={14} />}
                        value={project.contactInfo}
                        href={
                          project.contactInfo ? `tel:${project.contactInfo}` : null
                        }
                      />
                    </div>
                    {project.clientEmail && (
                      <a
                        href={`mailto:${project.clientEmail}`}
                        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-border transition-colors"
                      >
                        <Mail size={15} />
                        Email client
                      </a>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Card = ({ title, count, children }) => (
  <section className="bg-card rounded-xl border border-border">
    <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const Stat = ({ icon, label, value, hint, hintClass, emphasis }) => (
  <div className="bg-card p-5 rounded-xl border border-border">
    <div className="flex items-center gap-2 text-muted-foreground mb-2.5">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p
      className={`text-xl font-semibold tracking-tight ${
        emphasis || "text-foreground"
      }`}
    >
      {value}
    </p>
    {hint && <p className={`text-xs mt-1 ${hintClass || "text-muted-foreground"}`}>{hint}</p>}
  </div>
);

const Field = ({ icon, label, value }) => (
  <div>
    <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
      {icon}
      {label}
    </dt>
    <dd className="text-sm text-foreground capitalize">{value || "Not set"}</dd>
  </div>
);

const LinkRow = ({ icon, label, url }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
    <span className="flex items-center gap-2.5 text-sm text-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </span>
    {url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Open
        <ExternalLink size={13} />
      </a>
    ) : (
      <span className="text-sm text-muted-foreground">Not set</span>
    )}
  </div>
);

const ContactRow = ({ icon, value, href }) => (
  <div className="flex items-center gap-2.5 text-sm min-w-0">
    <span className="text-muted-foreground shrink-0">{icon}</span>
    {value ? (
      <a href={href} className="text-foreground hover:text-primary truncate transition-colors">
        {value}
      </a>
    ) : (
      <span className="text-muted-foreground">Not provided</span>
    )}
  </div>
);

export default ProjectDetails;
