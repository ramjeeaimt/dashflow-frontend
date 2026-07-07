import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePayrollStore } from "../store/payrollStore";

const PayrollSlipView = () => {

  const { id } = useParams();

  const { selectedPayroll, fetchPayrollById } = usePayrollStore();

  useEffect(() => {
    fetchPayrollById(id);
  }, [id]);

  if (!selectedPayroll) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card shadow rounded">

      <h2 className="text-xl font-semibold mb-4">
        Salary Slip
      </h2>

      <p>Employee: {selectedPayroll.employeeName}</p>
      <p>Month: {selectedPayroll.month}</p>

      <div className="mt-4">

        <p>Basic Salary: ₹{selectedPayroll.basic}</p>
        <p>Bonus: ₹{selectedPayroll.bonus}</p>
        <p>Deductions: ₹{selectedPayroll.deductions}</p>

      </div>

      <h3 className="mt-4 font-bold">
        Net Salary: ₹{selectedPayroll.netSalary}
      </h3>

    </div>
  );
};

export default PayrollSlipView;