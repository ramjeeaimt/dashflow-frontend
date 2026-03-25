import { create } from 'zustand';
import { projectService, taskService } from '../services/project.service';

const useProjectStore = create((set, get) => ({
    projects: [],
    tasks: [],
    growthData: [], 
    statusData: [], // <-- Added for Pie Chart
    loading: false,
    error: null,

    // Internal helper for Line Chart
    computeGrowth: (projectsArray) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyCounts = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

        projectsArray.forEach(project => {
            const dateStr = project.assigningDate || project.createdAt;
            if (dateStr) {
                const date = new Date(dateStr);
                const monthName = months[date.getMonth()];
                if (monthlyCounts[monthName] !== undefined) {
                    monthlyCounts[monthName]++;
                }
            }
        });

        return months.map(month => ({
            month,
            projects: monthlyCounts[month]
        }));
    },

    // --- ADDED PIE CHART LOGIC HERE ---
    computeStatus: (projectsArray) => {
        const counts = {
            "Completed": 0,
            "Progress": 0,
            "Pending": 0
        };

        projectsArray.forEach(p => {
            const status = p.status || "Pending"; 
            if (counts.hasOwnProperty(status)) {
                counts[status]++;
            } else {
                counts["Pending"]++;
            }
        });

        return [
            { name: "Completed", value: counts["Completed"], color: "#22c55e" },
            { name: " Progress", value: counts[" Progress"], color: "#3b82f6" },
            { name: "Pending", value: counts["Pending"], color: "#f59e0b" },
        ];
    },
    // ----------------------------------

    fetchProjects: async (companyId) => {
        set({ loading: true, error: null });
        try {
            const response = await projectService.getAll(companyId);
            const data = response.data || response || [];
            const projectsArray = Array.isArray(data) ? data : [];
            
            // Calculate BOTH datasets once to maintain stable references
            const newGrowthData = get().computeGrowth(projectsArray);
            const newStatusData = get().computeStatus(projectsArray); // <-- Added

            set({ 
                projects: projectsArray, 
                growthData: newGrowthData,
                statusData: newStatusData, // <-- Added
                loading: false 
            });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchTasks: async (projectId) => {
        set({ loading: true });
        try {
            const data = await taskService.getAll(projectId);
            set({ tasks: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createProject: async (projectData, companyId) => {
        try {
            await projectService.create(projectData);
            await get().fetchProjects(companyId);
        } catch (error) { throw error; }
    },

    updateProject: async (id, projectData, companyId) => {
        try {
            await projectService.update(id, projectData);
            await get().fetchProjects(companyId);
        } catch (error) { throw error; }
    },

    deleteProject: async (id, companyId) => {
        try {
            await projectService.delete(id);
            await get().fetchProjects(companyId);
        } catch (error) { throw error; }
    },

    createTask: async (taskData, projectId) => {
        try {
            await taskService.create(taskData);
            await get().fetchTasks(projectId);
        } catch (error) { throw error; }
    }
}));

export default useProjectStore;