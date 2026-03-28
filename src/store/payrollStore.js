import apiClient from "api/client";
import financeService from "services/finance.service"; // Service name fix kiya
import { create } from "zustand";

export const usePayrollStore = create((set) => ({
  payrolls: [],
  selectedPayroll: null,
  loading: false,
  error: null, // Error state add ki

  // usePayrollStore.js
  fetchEmployeePayrolls: async (employeeId) => {

  try {

    console.log("Sending employeeId:", employeeId);

    const res = await apiClient.get("/finance/payroll", {
      params: { employeeId }
    });

    console.log("FULL API RESPONSE:", res.data);

    set({
      payrolls: res.data?.data || [],
      loading: false
    });

  } catch (error) {

    console.error("Payroll API Error:", error);

    set({
      payrolls: [],
      loading: false
    });

  }

},

  fetchPayrollById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await financeService.getPayrollById(id);
      set({
        selectedPayroll: data,
        loading: false
      });
    } catch (error) {
      set({ error: "Failed to fetch details", loading: false });
    }
  },

  // State clear karne ke liye helper (Useful for logouts or tab switch)
  clearSelectedPayroll: () => set({ selectedPayroll: null })
}));