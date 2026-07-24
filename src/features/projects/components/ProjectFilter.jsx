import React from "react";
import Icon from "../../../components/AppIcon";

const Filter = ({ 
    search, setSearch, 
    phase, setPhase, 
    budget, setBudget, 
    sort, setSort,
    deadlineStatus, setDeadlineStatus,
    projectType, setProjectType
}) => {
    
    const budgetOptions = ["Low Budget", "Medium Budget", "High Budget"];
    const deadlineOptions = ["All Deadlines", "Overdue", "Due this week", "Upcoming"];
    const sortOptions = ["Priority", "Recently Added", "Closest Deadline", "Highest Value"];

    const hasFilters = Boolean(search || phase || budget || deadlineStatus || projectType) || sort !== "Priority";

    const selectClass =
        "px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-colors cursor-pointer";

    return (
        <div className="px-4 sm:px-6 py-4 border-b border-border flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
                <Icon
                    name="Search"
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                    type="text"
                    placeholder="Search project or client…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-colors"
                />
            </div>

            <select value={phase} onChange={(e) => setPhase(e.target.value)} className={selectClass}>
                <option value="">All phases</option>
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Deployment">Deployment</option>
                <option value="Completed">Completed</option>
            </select>

            <select
                value={deadlineStatus}
                onChange={(e) => setDeadlineStatus(e.target.value)}
                className={selectClass}
            >
                {deadlineOptions.map((opt) => (
                    <option key={opt} value={opt === "All Deadlines" ? "" : opt}>
                        {opt}
                    </option>
                ))}
            </select>

            <select value={budget} onChange={(e) => setBudget(e.target.value)} className={selectClass}>
                <option value="">All budgets</option>
                {budgetOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>

            <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className={selectClass}>
                <option value="">All project types</option>
                <option value="company">Internal Company Projects</option>
                <option value="client">Client Projects</option>
            </select>

            <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
                {sortOptions.map((opt) => (
                    <option key={opt} value={opt}>Sort: {opt}</option>
                ))}
            </select>

            {hasFilters && (
                <button
                    onClick={() => {
                        setSearch("");
                        setPhase("");
                        setBudget("");
                        setSort("Priority");
                        setDeadlineStatus("");
                        setProjectType("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Icon name="RotateCcw" size={14} />
                    Reset
                </button>
            )}
        </div>
    );
};

export default Filter;
