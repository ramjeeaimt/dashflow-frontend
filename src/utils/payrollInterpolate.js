/**
 * Universal Payroll Template Interpolator & Standard Payslip ID Engine
 * Generates unique, enterprise-standard, long Payslip IDs and
 * replaces all placeholders ([Employee Name], [Payslip ID], {employeeName}, ${employeeName}, [DIF00XX], [Pay Period], etc.)
 * with real, dynamic employee and payroll data.
 */

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Generates an authoritative, standard long corporate Payslip ID:
 * Format: {COMPANY}-PAY-{YYYY}{MM}-{EMP_CODE}-{SUFFIX}
 * Example: DIFMO-PAY-202611-DIF0012-279057
 */
export function generateStandardPayslipId(payroll, selectedMonth, selectedYear) {
    if (!payroll) return 'DIFMO-PAY-STANDARD-REF';
    const employee = payroll.employee || {};
    const company = employee.company || payroll.company || {};
    const companyName = company.name || 'DIFMO';
    const companyPrefix = companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'DIFMO';

    const monthNum = Number(payroll.month || selectedMonth || new Date().getMonth() + 1);
    const yearNum = Number(payroll.year || selectedYear || new Date().getFullYear());
    const monthPadded = String(monthNum).padStart(2, '0');
    const yearStr = String(yearNum);

    const empCode = (employee.employeeCode || payroll.employeeCode || 'EMP').toUpperCase();

    // Deterministic 6-char hex/alphanumeric suffix from payroll ID or unique hash
    let rawId = String(payroll.id || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (rawId.startsWith('PAYROLL')) {
        rawId = rawId.replace('PAYROLL', '');
    }
    const suffix = rawId && rawId.length >= 6
        ? rawId.slice(-6)
        : ((Math.abs((yearNum * 100 + monthNum) * 31 + empCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) * 7919) % 16777215).toString(16).padStart(6, '0').toUpperCase();

    return `${companyPrefix}-PAY-${yearStr}${monthPadded}-${empCode}-${suffix}`;
}

/**
 * Extracts structured placeholder values from a payroll row and date context.
 */
export function getPayrollPlaceholderData(row, selectedMonth, selectedYear) {
    const employee = row?.employee || {};
    const user = employee.user || {};

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const employeeName = (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : (row?.employeeName || 'Valued Employee');

    const employeeCode = employee.employeeCode || row?.employeeCode || 'DIF0001';

    const monthNum = Number(row?.month || selectedMonth || new Date().getMonth() + 1);
    const yearNum = Number(row?.year || selectedYear || new Date().getFullYear());

    const monthName = MONTH_NAMES[monthNum - 1] || 'Current Month';
    const shortMonth = monthName.slice(0, 3);
    const yearStr = yearNum.toString();
    const monthYear = `${monthName} ${yearStr}`;

    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const lastDayPadded = String(lastDay).padStart(2, '0');
    const payPeriod = `01-${shortMonth}-${yearStr} to ${lastDayPadded}-${shortMonth}-${yearStr}`;

    const netAmountNum = Number(row?.netPayable ?? row?.netSalary ?? row?.basicSalary ?? 0);
    const netAmountFormatted = netAmountNum.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const netAmountRaw = netAmountNum.toFixed(2);

    const basicSalaryNum = Number(row?.basicSalary ?? 0);
    const basicSalaryFormatted = basicSalaryNum.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const allowancesNum = Number(row?.allowances ?? 0);
    const allowancesFormatted = allowancesNum.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const totalDeductionsNum = Number(
        (row?.deductions || 0) +
        (row?.leaveDeduction || 0) +
        (row?.halfDeduction || 0) +
        (row?.lateDeductionAmount || 0)
    );
    const deductionsFormatted = totalDeductionsNum.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const bankName = employee.bankName ||
        employee.bankDetails?.bankName ||
        employee.bank ||
        row?.bankName ||
        'Registered Bank';

    const rawAccount = String(
        employee.accountNumber ||
        employee.bankDetails?.accountNumber ||
        row?.accountNumber ||
        ''
    ).trim();

    const accountEnding = rawAccount.length >= 4
        ? rawAccount.slice(-4)
        : (rawAccount || 'XXXX');

    const designation = employee.designation?.name || employee.role || 'Team Member';
    const department = employee.department?.name || 'Operations';

    // Long & Standard Payslip ID
    const payslipId = generateStandardPayslipId(row, monthNum, yearNum);

    return {
        payslipId,
        employeeName,
        employeeCode,
        monthNum,
        monthName,
        shortMonth,
        year: yearStr,
        monthYear,
        payPeriod,
        netAmount: netAmountFormatted,
        netAmountRaw,
        basicSalary: basicSalaryFormatted,
        allowances: allowancesFormatted,
        deductions: deductionsFormatted,
        bankName,
        accountNumber: accountEnding,
        rawAccount,
        designation,
        department
    };
}

/**
 * Interpolates template text with dynamic data.
 * Supports:
 * - Square brackets: [Payslip ID], [Employee Name], [Month Year], [DIF00XX], [Pay Period], [Net Amount], [Bank Name], [XXXX]
 * - Curly braces: {payslipId}, {employeeName}, {monthYear}, {netSalary}, {bankName}, etc.
 * - Template literals: ${payslipId}, ${employeeName}, ${name}, ${month}, ${year}, ${salary}, ${netSalary}
 */
export function interpolatePayrollTemplate(templateText, data) {
    if (!templateText) return '';
    let res = String(templateText);

    // 0. Payslip ID / Reference (Long & Standard: e.g. DIFMO-PAY-202611-DIF0012-279057)
    res = res.replace(/\[(payslip\s*id|payslip\s*no|payslip\s*number|slip\s*id|payslip-id|payslip_id|payslip)\]/gi, data.payslipId);
    res = res.replace(/\{(\s*payslipId|\s*payslip_id|\s*payslipNo|\s*payslipNumber\s*)\}/gi, data.payslipId);
    res = res.replace(/\$\{(\s*payslipId|\s*payslip_id|\s*payslipNo|\s*payslipNumber|\s*slipId\s*)\}/gi, data.payslipId);

    // 1. Employee Name
    res = res.replace(/\[(employee\s*name|name|emp\s*name)\]/gi, data.employeeName);
    res = res.replace(/\{(\s*employeeName|\s*empName|\s*name\s*)\}/gi, data.employeeName);
    res = res.replace(/\$\{(\s*employeeName|\s*empName|\s*name\s*)\}/gi, data.employeeName);

    // 2. Month Year (e.g. November 2026)
    res = res.replace(/\[(month\s*year|month\s*-\s*year|monthyear)\]/gi, data.monthYear);
    res = res.replace(/\{(\s*monthYear|\s*month_year\s*)\}/gi, data.monthYear);
    res = res.replace(/\$\{(\s*monthYear|\s*month_year\s*)\}/gi, data.monthYear);

    // 3. Month (e.g. November)
    res = res.replace(/\[(month|pay\s*month)\]/gi, data.monthName);
    res = res.replace(/\{(\s*month\s*)\}/gi, data.monthName);
    res = res.replace(/\$\{(\s*month\s*)\}/gi, data.monthName);

    // 4. Year (e.g. 2026)
    res = res.replace(/\[(year|pay\s*year)\]/gi, data.year);
    res = res.replace(/\{(\s*year\s*)\}/gi, data.year);
    res = res.replace(/\$\{(\s*year\s*)\}/gi, data.year);

    // 5. Employee ID / Code (e.g. DIF0012, [DIF00XX])
    res = res.replace(/\[(employee\s*id|emp\s*id|employee\s*code|emp\s*code|dif\s*0+x*|dif00xx)\]/gi, data.employeeCode);
    res = res.replace(/\{(\s*employeeId|\s*employeeCode|\s*empId|\s*empCode\s*)\}/gi, data.employeeCode);
    res = res.replace(/\$\{(\s*employeeId|\s*employeeCode|\s*empId|\s*empCode|\s*code\s*)\}/gi, data.employeeCode);

    // 6. Pay Period (e.g. 01-Nov-2026 to 30-Nov-2026, [01-Month-Year to End-Month-Year])
    res = res.replace(/\[(pay\s*period|01-month-year\s+to\s+end-month-year|01-month-year\s+to\s+end\s+month-year)\]/gi, data.payPeriod);
    res = res.replace(/\[01-[a-z0-9_-]+\s+to\s+[a-z0-9_-]+\]/gi, data.payPeriod);
    res = res.replace(/\{(\s*payPeriod|\s*pay_period\s*)\}/gi, data.payPeriod);
    res = res.replace(/\$\{(\s*payPeriod|\s*pay_period\s*)\}/gi, data.payPeriod);

    // 7. Net Amount with optional currency sign handling
    res = res.replace(/₹\s*\[(net\s*amount|net\s*credited|net\s*salary|salary|amount)\]/gi, `₹${data.netAmount}`);
    res = res.replace(/INR\s*\[(net\s*amount|net\s*credited|net\s*salary|salary|amount)\]/gi, `INR ${data.netAmount}`);
    res = res.replace(/\[(net\s*amount|net\s*credited|net\s*salary|net\s*payable|salary)\]/gi, data.netAmount);
    res = res.replace(/\{(\s*netSalary|\s*netAmount|\s*netCredited|\s*salary\s*)\}/gi, data.netAmount);
    res = res.replace(/\$\{(\s*netSalary|\s*netAmount|\s*netCredited|\s*salary|\s*amount\s*)\}/gi, data.netAmount);

    // 8. Bank Name (e.g. HDFC Bank)
    res = res.replace(/\[(bank\s*name|bank)\]/gi, data.bankName);
    res = res.replace(/\{(\s*bankName|\s*bank\s*)\}/gi, data.bankName);
    res = res.replace(/\$\{(\s*bankName|\s*bank\s*)\}/gi, data.bankName);

    // 9. Account ending / [XXXX]
    res = res.replace(/\[(xxxx|account\s*number|acc\s*no|ac\s*no)\]/gi, data.accountNumber);
    res = res.replace(/\{(\s*accountNumber|\s*account_number\s*)\}/gi, data.accountNumber);
    res = res.replace(/\$\{(\s*accountNumber|\s*account_number\s*)\}/gi, data.accountNumber);

    // 10. Designation & Department
    res = res.replace(/\[(designation|role|job\s*title)\]/gi, data.designation);
    res = res.replace(/\{(\s*designation|\s*role\s*)\}/gi, data.designation);
    res = res.replace(/\$\{(\s*designation|\s*role\s*)\}/gi, data.designation);

    res = res.replace(/\[(department|dept)\]/gi, data.department);
    res = res.replace(/\{(\s*department|\s*dept\s*)\}/gi, data.department);
    res = res.replace(/\$\{(\s*department|\s*dept\s*)\}/gi, data.department);

    // 11. Gross & Basic Salary
    res = res.replace(/₹\s*\[(gross\s*salary|basic\s*salary)\]/gi, `₹${data.basicSalary}`);
    res = res.replace(/\[(gross\s*salary|basic\s*salary)\]/gi, data.basicSalary);
    res = res.replace(/\{(\s*grossSalary|\s*basicSalary\s*)\}/gi, data.basicSalary);
    res = res.replace(/\$\{(\s*grossSalary|\s*basicSalary\s*)\}/gi, data.basicSalary);

    // 12. Deductions
    res = res.replace(/₹\s*\[(deductions|total\s*deductions)\]/gi, `₹${data.deductions}`);
    res = res.replace(/\[(deductions|total\s*deductions)\]/gi, data.deductions);
    res = res.replace(/\{(\s*deductions\s*)\}/gi, data.deductions);
    res = res.replace(/\$\{(\s*deductions\s*)\}/gi, data.deductions);

    // If template has plain linebreaks and no HTML block tags, preserve linebreaks with <br/>
    if (!/<(p|div|table|ul|ol|h[1-6]|br)[^>]*>/i.test(res)) {
        res = res.replace(/\r?\n/g, '<br/>');
    }

    return res;
}
