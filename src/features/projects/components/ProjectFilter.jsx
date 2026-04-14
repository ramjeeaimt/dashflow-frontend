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
        <div className="bg-white p-8 border-b-2 border-slate-900 flex flex-col gap-8 transition-all">
            
            {/* Row 1: Search, Phase, and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 items-end">
                {/* Search */}
                <div className="flex flex-col">
                    <label className="text-[10px] text-blue-900 font-black uppercase tracking-[0.3em] mb-2 px-1">Search_Project</label>
                    <input
                        type="text"
                        placeholder="INPUT_IDENTITY..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-none focus:border-slate-900 outline-none transition-colors font-mono text-sm placeholder:text-slate-200 uppercase"
                    />
                </div>

                {/* Phase Filter */}
                <div className="flex flex-col">
                    <label className="text-[10px] text-blue-900 font-black uppercase tracking-[0.3em] mb-2 px-1">Phase_Vector</label>
                    <select
                        value={phase}
                        onChange={(e) => setPhase(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-none focus:border-slate-900 outline-none transition-colors font-mono text-xs uppercase appearance-none bg-white cursor-pointer"
                    >
                        <option value="">ALL_PHASES</option>
                        <option value="Planning">PLANNING</option>
                        <option value="Development">DEVELOPMENT</option>
                        <option value="Testing">TESTING</option>
                        <option value="Completed">COMPLETED</option>
                    </select>
                </div>

                {/* Deadline Filter */}
                <div className="flex flex-col">
                    <label className="text-[10px] text-blue-900 font-black uppercase tracking-[0.3em] mb-2 px-1">Timeline_Index</label>
                    <select
                        value={deadlineStatus}
                        onChange={(e) => setDeadlineStatus(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-none focus:border-slate-900 outline-none transition-colors font-mono text-xs uppercase appearance-none bg-white cursor-pointer"
                    >
                        {deadlineOptions.map(opt => (
                            <option key={opt} value={opt === "All Deadlines" ? "" : opt}>{opt.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                {/* Budget Filter */}
                <div className="flex flex-col">
                    <label className="text-[10px] text-blue-900 font-black uppercase tracking-[0.3em] mb-2 px-1">Budget_Allocation</label>
                    <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-none focus:border-slate-900 outline-none transition-colors font-mono text-xs uppercase appearance-none bg-white cursor-pointer"
                    >
                        <option value="">ALL_BUDGETS</option>
                        {budgetOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: Quick Sort Buttons & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-t border-slate-100 pt-6">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Sort_By::</span>
                    {["All", "Recently Added", "Closest Deadline", "Price: Low to High"].map((label) => (
                        <button
                            key={label}
                            onClick={() => setSort(label)}
                            className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-b-2 active:translate-y-0.5 ${
                                sort === label 
                                ? "bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_rgba(15,23,42,0.1)]" 
                                : "bg-white text-slate-400 border-slate-100 hover:border-slate-400"
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
                    className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-rose-600 transition-colors flex items-center gap-2 group"
                >
                    <div className="w-4 h-0.5 bg-slate-200 group-hover:bg-rose-600"></div>
                    Reset_Filters
                </button>
            </div>
        </div>
    );
};

export default Filter;