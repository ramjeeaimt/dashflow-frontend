import * as XLSX from 'xlsx';
import { generateStandardPayslipId } from './payrollInterpolate';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Filter transactions based on export criteria
 */
export const filterTransactionsForExport = (transactions = [], options = {}) => {
    const {
        mode = 'all', // 'single_month' | 'multiple_months' | 'year' | 'all' | 'custom_range' | 'current'
        selectedYear = new Date().getFullYear(),
        selectedMonth = new Date().getMonth(), // 0 - 11
        startYear = new Date().getFullYear(),
        startMonth = 0,
        endYear = new Date().getFullYear(),
        endMonth = 11,
        selectedMonthsList = [], // Array of "YYYY-M" strings
        includeIncome = true,
        includeExpenses = true,
        includePayroll = true,
        selectedCategory = 'All'
    } = options;

    return transactions.filter(t => {
        // 1. Transaction Type filter
        if (t.rawType === 'credit' && !includeIncome) return false;
        if (t.rawType === 'debit' && t._type === 'expense' && !includeExpenses) return false;
        if (t._type === 'payroll' && !includePayroll) return false;

        // 2. Category filter
        if (selectedCategory && selectedCategory !== 'All' && t.category !== selectedCategory) {
            return false;
        }

        // 3. Date / Month / Year filter
        const d = t.date instanceof Date ? t.date : new Date(t.date || t.createdAt);
        const tYear = d.getFullYear();
        const tMonth = d.getMonth(); // 0 - 11

        if (mode === 'single_month') {
            return tYear === Number(selectedYear) && tMonth === Number(selectedMonth);
        }

        if (mode === 'year') {
            return tYear === Number(selectedYear);
        }

        if (mode === 'multiple_months') {
            if (selectedMonthsList && selectedMonthsList.length > 0) {
                const key = `${tYear}-${tMonth}`;
                return selectedMonthsList.includes(key);
            }
            // Fallback to range
            const startDate = new Date(startYear, startMonth, 1);
            const endDate = new Date(endYear, endMonth + 1, 0, 23, 59, 59);
            return d >= startDate && d <= endDate;
        }

        if (mode === 'custom_range') {
            const startDate = new Date(startYear, startMonth, 1);
            const endDate = new Date(endYear, endMonth + 1, 0, 23, 59, 59);
            return d >= startDate && d <= endDate;
        }

        // 'all' or 'current'
        return true;
    });
};

/**
 * Generate Excel (.xlsx) file with multiple comprehensive sheets
 */
export const exportFinanceToExcel = (transactions = [], options = {}) => {
    const {
        fileName = 'Financial_Report',
        periodLabel = 'All Time',
        companyName = 'Difmo'
    } = options;

    const workbook = XLSX.utils.book_new();

    // 1. Compute summary stats
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalPayroll = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
        const amt = Number(t.amount || 0);
        const d = t.date instanceof Date ? t.date : new Date(t.date || t.createdAt);
        const yr = d.getFullYear();
        const m = d.getMonth();
        const mKey = `${yr}-${String(m + 1).padStart(2, '0')}`;
        const mLabel = `${SHORT_MONTHS[m]} ${yr}`;

        if (!monthlyMap[mKey]) {
            monthlyMap[mKey] = {
                'Month': mLabel,
                'Year': yr,
                'MonthNum': m,
                'Income (₹)': 0,
                'Expenses (₹)': 0,
                'Payroll (₹)': 0,
                'Net Flow (₹)': 0,
                'Transaction Count': 0
            };
        }
        monthlyMap[mKey]['Transaction Count'] += 1;

        if (t.rawType === 'credit') {
            totalIncome += amt;
            monthlyMap[mKey]['Income (₹)'] += amt;
            monthlyMap[mKey]['Net Flow (₹)'] += amt;
        } else if (t._type === 'payroll') {
            totalPayroll += amt;
            monthlyMap[mKey]['Payroll (₹)'] += amt;
            monthlyMap[mKey]['Net Flow (₹)'] -= amt;
            categoryMap['Payroll'] = (categoryMap['Payroll'] || 0) + amt;
        } else {
            totalExpenses += amt;
            monthlyMap[mKey]['Expenses (₹)'] += amt;
            monthlyMap[mKey]['Net Flow (₹)'] -= amt;
            const cat = t.category || 'Misc';
            categoryMap[cat] = (categoryMap[cat] || 0) + amt;
        }
    });

    const netProfit = totalIncome - totalExpenses - totalPayroll;

    // --- SHEET 1: EXECUTIVE SUMMARY ---
    const summaryData = [
        { 'Metric': 'Organization / Workspace', 'Details': companyName },
        { 'Metric': 'Reporting Period', 'Details': periodLabel },
        { 'Metric': 'Export Date & Time', 'Details': new Date().toLocaleString('en-IN') },
        { 'Metric': 'Total Transactions Recorded', 'Details': transactions.length },
        { 'Metric': '--------------------------------', 'Details': '--------------------------------' },
        { 'Metric': 'Total Income (Credits Received)', 'Details': totalIncome },
        { 'Metric': 'Total Operational Expenses', 'Details': totalExpenses },
        { 'Metric': 'Total Payroll Disbursements', 'Details': totalPayroll },
        { 'Metric': 'Net Operating Profit / (Deficit)', 'Details': netProfit },
        { 'Metric': 'Financial Health Status', 'Details': netProfit >= 0 ? 'HEALTHY (Surplus)' : 'DEFICIT (Loss)' },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 35 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

    // --- SHEET 2: MONTHLY BREAKDOWN ---
    const monthlyList = Object.values(monthlyMap)
        .sort((a, b) => (b.Year !== a.Year ? b.Year - a.Year : b.MonthNum - a.MonthNum))
        .map(({ Month, Year, 'Income (₹)': inc, 'Expenses (₹)': exp, 'Payroll (₹)': pay, 'Net Flow (₹)': net, 'Transaction Count': cnt }) => ({
            'Month & Year': Month,
            'Year': Year,
            'Income (₹)': inc,
            'Expenses (₹)': exp,
            'Payroll (₹)': pay,
            'Net Cash Flow (₹)': net,
            'Transactions': cnt
        }));

    if (monthlyList.length > 0) {
        const monthlySheet = XLSX.utils.json_to_sheet(monthlyList);
        monthlySheet['!cols'] = [
            { wch: 18 }, { wch: 8 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 14 }
        ];
        XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Summary');
    }

    // --- SHEET 3: FULL TRANSACTIONS LEDGER ---
    const ledgerRows = transactions.map((t, index) => {
        const d = t.date instanceof Date ? t.date : new Date(t.date || t.createdAt);
        const isCredit = t.rawType === 'credit';
        const isPayroll = t._type === 'payroll';
        const amt = Number(t.amount || 0);

        let partyName = '—';
        if (isPayroll) {
            partyName = `${t.employee?.user?.firstName || ''} ${t.employee?.user?.lastName || ''}`.trim() || 'Employee';
        } else if (t.employee?.user) {
            partyName = `${t.employee.user.firstName || ''} ${t.employee.user.lastName || ''}`.trim();
        }

        return {
            'S.No': index + 1,
            'Date': d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            'Month': SHORT_MONTHS[d.getMonth()],
            'Year': d.getFullYear(),
            'Transaction Title': t.title || 'Untitled',
            'Category': t.category || 'General',
            'Type': isCredit ? 'CREDIT (Income)' : (isPayroll ? 'PAYROLL (Salary)' : 'DEBIT (Expense)'),
            'Credit Amount (₹)': isCredit ? amt : 0,
            'Debit Amount (₹)': !isCredit ? amt : 0,
            'Net Impact (₹)': isCredit ? amt : -amt,
            'Status': (t.status || 'Approved').toUpperCase(),
            'Party / Employee': partyName,
            'Notes / Description': t.description || '—',
            'Reference ID': t.id || '—'
        };
    });

    const ledgerSheet = XLSX.utils.json_to_sheet(ledgerRows);
    ledgerSheet['!cols'] = [
        { wch: 6 },  // S.No
        { wch: 14 }, // Date
        { wch: 8 },  // Month
        { wch: 8 },  // Year
        { wch: 32 }, // Title
        { wch: 20 }, // Category
        { wch: 18 }, // Type
        { wch: 16 }, // Credit
        { wch: 16 }, // Debit
        { wch: 16 }, // Net Impact
        { wch: 14 }, // Status
        { wch: 22 }, // Party
        { wch: 35 }, // Description
        { wch: 24 }  // Reference ID
    ];
    XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'Transactions Ledger');

    // --- SHEET 4: PAYROLL DISBURSEMENTS (If any) ---
    const payrollRows = transactions.filter(t => t._type === 'payroll').map((p, idx) => {
        const d = p.date instanceof Date ? p.date : new Date(p.date || p.createdAt);
        const emp = p.employee || {};
        const u = emp.user || {};
        const raw = p._raw || {};

        return {
            'S.No': idx + 1,
            'Disbursement Date': d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            'Pay Period': `${SHORT_MONTHS[raw.month ? raw.month - 1 : d.getMonth()]} ${raw.year || d.getFullYear()}`,
            'Employee Code': emp.employeeCode || '—',
            'Employee Name': `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Employee',
            'Department': typeof emp.department === 'string' ? emp.department : (emp.department?.name || 'General'),
            'Designation': typeof emp.designation === 'string' ? emp.designation : (emp.designation?.title || 'Staff'),
            'Net Salary (₹)': Number(p.amount || 0),
            'Gross Salary (₹)': Number(raw.grossSalary || raw.salary || p.amount || 0),
            'Total Deductions (₹)': Number(raw.deductions || 0),
            'Status': (p.status || 'Approved').toUpperCase(),
            'Payslip ID': generateStandardPayslipId(raw, raw.month, raw.year),
            'Payroll ID': p.id || '—'
        };
    });

    if (payrollRows.length > 0) {
        const payrollSheet = XLSX.utils.json_to_sheet(payrollRows);
        payrollSheet['!cols'] = [
            { wch: 6 },  // S.No
            { wch: 18 }, // Date
            { wch: 14 }, // Pay Period
            { wch: 16 }, // Emp Code
            { wch: 24 }, // Name
            { wch: 18 }, // Dept
            { wch: 20 }, // Desig
            { wch: 16 }, // Net Salary
            { wch: 16 }, // Gross
            { wch: 18 }, // Deductions
            { wch: 14 }, // Status
            { wch: 32 }, // Payslip ID
            { wch: 20 }  // ID
        ];
        XLSX.utils.book_append_sheet(workbook, payrollSheet, 'Payroll Register');
    }

    // --- SHEET 5: EXPENSE CATEGORY BREAKDOWN ---
    const categoryRows = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => ({
            'Category Name': category,
            'Total Amount (₹)': amount,
            'Share of Expenses (%)': totalExpenses + totalPayroll > 0 
                ? Number(((amount / (totalExpenses + totalPayroll)) * 100).toFixed(2)) 
                : 0
        }));

    if (categoryRows.length > 0) {
        const categorySheet = XLSX.utils.json_to_sheet(categoryRows);
        categorySheet['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown');
    }

    // Trigger file download
    const cleanName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(workbook, cleanName);
    return cleanName;
};

/**
 * Generate CSV file for flat accounting ledger
 */
export const exportFinanceToCsv = (transactions = [], options = {}) => {
    const { fileName = 'Financial_Ledger.csv' } = options;

    const rows = transactions.map((t, index) => {
        const d = t.date instanceof Date ? t.date : new Date(t.date || t.createdAt);
        const isCredit = t.rawType === 'credit';
        const isPayroll = t._type === 'payroll';
        const amt = Number(t.amount || 0);

        let partyName = '—';
        if (isPayroll) {
            partyName = `${t.employee?.user?.firstName || ''} ${t.employee?.user?.lastName || ''}`.trim() || 'Employee';
        } else if (t.employee?.user) {
            partyName = `${t.employee.user.firstName || ''} ${t.employee.user.lastName || ''}`.trim();
        }

        return {
            'S.No': index + 1,
            'Date': d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            'Month': SHORT_MONTHS[d.getMonth()],
            'Year': d.getFullYear(),
            'Transaction Title': t.title || 'Untitled',
            'Category': t.category || 'General',
            'Type': isCredit ? 'CREDIT' : (isPayroll ? 'PAYROLL' : 'DEBIT'),
            'Credit Amount (INR)': isCredit ? amt : 0,
            'Debit Amount (INR)': !isCredit ? amt : 0,
            'Net Impact (INR)': isCredit ? amt : -amt,
            'Status': (t.status || 'Approved').toUpperCase(),
            'Party / Employee': partyName,
            'Notes': t.description || '—'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const cleanName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    XLSX.writeFile({ SheetNames: ['Transactions'], Sheets: { 'Transactions': worksheet } }, cleanName, { bookType: 'csv' });
    return cleanName;
};
