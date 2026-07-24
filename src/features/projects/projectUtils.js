/**
 * Presentation helpers shared by the project list and detail screens.
 *
 * The API returns the derived fields below (health, daysRemaining, …) already
 * computed, so `decorateProject` is a fallback that keeps the UI working with
 * older payloads and with records echoed back from create/update calls.
 */

export const HEALTH_META = {
  overdue: {
    label: "Overdue",
    bar: "bg-error",
    text: "text-error",
    badge: "bg-error/10 text-error",
  },
  "at-risk": {
    label: "Due soon",
    bar: "bg-warning",
    text: "text-warning",
    badge: "bg-warning/10 text-warning",
  },
  "on-track": {
    label: "On track",
    bar: "bg-primary",
    text: "text-muted-foreground",
    badge: "bg-primary/10 text-primary",
  },
  completed: {
    label: "Completed",
    bar: "bg-success",
    text: "text-muted-foreground",
    badge: "bg-success/10 text-success",
  },
};

export const PHASE_STYLES = {
  Planning: "bg-muted text-muted-foreground",
  Development: "bg-primary/10 text-primary",
  Testing: "bg-warning/10 text-warning",
  Deployment: "bg-primary/10 text-primary",
  Completed: "bg-success/10 text-success",
  default: "bg-muted text-muted-foreground",
};

/** assignedPeople has been stored as an array, a csv string and a `{a,b}` literal. */
export const parseAssigned = (value) => {
  if (!value) return [];
  const raw = Array.isArray(value)
    ? value
    : String(value).replace(/[{}"]/g, "").split(",");
  return raw.map((v) => String(v).trim()).filter(Boolean);
};

export const daysUntil = (deadline) => {
  if (!deadline) return null;
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

export const decorateProject = (project) => {
  const assignedPeople = parseAssigned(project.assignedPeople);
  const assignedEmployees =
    project.assignedEmployees ||
    assignedPeople.map((id) => ({ id, name: id, avatar: null }));

  const totalPayment = Number(project.totalPayment) || 0;
  const paymentReceived = Number(project.paymentReceived) || 0;
  const daysRemaining =
    project.daysRemaining !== undefined
      ? project.daysRemaining
      : daysUntil(project.deadline);

  const isCompleted =
    project.phase === "Completed" || project.status === "completed";
  const isOverdue = !isCompleted && daysRemaining !== null && daysRemaining < 0;

  let health = "on-track";
  if (isCompleted) health = "completed";
  else if (isOverdue) health = "overdue";
  else if (daysRemaining !== null && daysRemaining <= 7) health = "at-risk";

  return {
    ...project,
    assignedPeople,
    assignedEmployees,
    totalPayment,
    paymentReceived,
    outstandingPayment: Math.max(totalPayment - paymentReceived, 0),
    paymentProgress:
      totalPayment > 0
        ? Math.min(Math.round((paymentReceived / totalPayment) * 100), 100)
        : 0,
    daysRemaining,
    isOverdue,
    health: project.health || health,
  };
};

export const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const formatDate = (value) => {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const deadlineLabel = ({ health, daysRemaining }) => {
  if (health === "completed") return "Delivered";
  if (daysRemaining === null || daysRemaining === undefined) return "Not set";
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)} days overdue`;
  if (daysRemaining === 0) return "Due today";
  if (daysRemaining === 1) return "Due tomorrow";
  return `${daysRemaining} days left`;
};

export const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};
