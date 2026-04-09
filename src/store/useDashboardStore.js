import { create } from 'zustand';
import dashboardService from '../services/dashboard.service';

const useDashboardStore = create((set, get) => ({
    metrics: {
        totalEmployees: 0,
        presentToday: 0,
        tasksCompleted: 0,
        avgProductivity: 0,
    },
    charts: {
        attendance: [],
        productivity: [],
    },
    feed: {
        recentActivity: [],
        pendingApprovals: [],
        upcomingEvents: [],
    },
    financials: null,
    loading: false,
    error: null,

    fetchDashboardData: async (companyId, isAdmin = false, userId = null) => {
        if (!companyId) return;
        set({ loading: true, error: null });
        try {
            const promises = [
                dashboardService.getMetrics(companyId, userId),
                dashboardService.getCharts(companyId),
                dashboardService.getFeed(companyId, userId),
            ];

            if (isAdmin) {
                promises.push(dashboardService.getFinancials(companyId));
            }

            const results = await Promise.all(promises);
            console.log('[useDashboardStore] Raw fetch results:', results);
            
            const [metrics, charts, feed, financials] = results;
            console.log('[useDashboardStore] Metrics data:', metrics);

            set({ 
                metrics: metrics || get().metrics, 
                charts: charts,
                feed: feed,
                financials: isAdmin ? financials : null,
                loading: false 
            });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    refreshDashboard: async (companyId, isAdmin = false, userId = null) => {
        await get().fetchDashboardData(companyId, isAdmin, userId);
    }
}));

export default useDashboardStore;
