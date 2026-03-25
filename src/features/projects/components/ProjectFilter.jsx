import React from "react";

const Filter = ({ 
    search, setSearch, 
    phase, setPhase, 
    budget, setBudget, 
    sort, setSort,
    deadlineStatus, setDeadlineStatus 
}) => {
    
    const budgetOptions = ["Low Budget", "Medium Budget", "High Budget"];
    const deadlineOptions = ["All Deadlines", "Overdue", "Due this week", "Upcoming"];

    return (
        <div className="bg-white rounded-xl p-6 mb-10 shadow-sm border border-gray-100 flex flex-col gap-6">
            
            {/* Row 1: Search, Phase, and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="flex flex-col">
                    <label className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Search Project</label>
                    <input
                        type="text"
                        placeholder="Project name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Phase Filter */}
                <div className="flex flex-col">
                    <label className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Phase</label>
                    <select
                        value={phase}
                        onChange={(e) => setPhase(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">All Phases</option>
                        <option value="Planning">Planning</option>
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {/* Deadline Filter */}
                <div className="flex flex-col">
                    <label className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Timeline/Deadline</label>
                    <select
                        value={deadlineStatus}
                        onChange={(e) => setDeadlineStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
                    >
                        {deadlineOptions.map(opt => (
                            <option key={opt} value={opt === "All Deadlines" ? "" : opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* Budget Filter */}
                <div className="flex flex-col">
                    <label className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Budget</label>
                    <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">All Budgets</option>
                        {budgetOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: Quick Sort Buttons & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Sort By:</span>
                    {["All", "Recently Added", "Closest Deadline", "Price: Low to High"].map((label) => (
                        <button
                            key={label}
                            onClick={() => setSort(label)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                                sort === label 
                                ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => {
                        setSearch("");
                        setPhase("");
                        setBudget("");
                        setSort("All");
                        setDeadlineStatus("");
                    }}
                    className="text-sm font-semibold text-red-500 hover:underline px-2"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};

export default Filter;