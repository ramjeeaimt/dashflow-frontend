import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';

const PayrollReviewModal = ({ isOpen, onClose, payroll, onSend, onSave, mode = 'send' }) => {
    const { user } = useAuthStore();
    const payslipRef = useRef(null);
    const emailBodyRef = useRef(null);
    const [isSending, setIsSending] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('payslip');

    // We will store the evaluated HTML string here before rendering it
    const [evaluatedPayslipHtml, setEvaluatedPayslipHtml] = useState('');
    const [evaluatedEmailBodyHtml, setEvaluatedEmailBodyHtml] = useState('');

    useEffect(() => {
        setEvaluatedPayslipHtml('');
        setEvaluatedEmailBodyHtml('');

        const loadTemplates = async () => {
            const activeCompanyId = user?.company?.id || user?.companyId;
            if (isOpen && payroll && activeCompanyId) {
                try {
                    const res = await api.get(`/system-company/id/${activeCompanyId}`);
                    const latestCompany = res.data?.data || res.data;

                    let payslipHtml = payroll.customPayslipHtml || latestCompany.payslipEmailTemplate || '<div>No Payslip Template Configured.</div>';
                    let emailBodyHtml = payroll.customEmailBodyHtml || latestCompany.salaryEmailBodyTemplate || '<div>No Email Body Template Configured.</div>';

                    // Only replace placeholders if we are generating from the template (not if we already have custom HTML)
                    const isNewHtml = !payroll.customPayslipHtml && !payroll.customEmailBodyHtml;

                    const empName = `${payroll.employee?.user?.firstName || ''} ${payroll.employee?.user?.lastName || ''}`.trim() || 'Employee';
                    const empEmail = payroll.employee?.user?.email || '';
                    const month = payroll.month || new Date().getMonth() + 1;
                    const year = payroll.year || new Date().getFullYear();
                    const basicSalary = Math.round(payroll.basicSalary || 0);
                    const netSalary = Math.round(payroll.netSalary || basicSalary);
                    const allowances = Math.round(payroll.allowances || 0);
                    const overtime = Math.round(payroll.overtime || 0);
                    const deductions = Math.round(payroll.deductions || 0);
                    const companyName = latestCompany.name || 'Company';

                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const monthName = monthNames[month - 1] || month.toString();

                    const replaceInput = (html, id, value) => {
                        const regex = new RegExp(`(<input[^>]*id=["']${id}["'][^>]*>)`, 'gi');
                        return html.replace(regex, (match) => {
                            if (/value=/i.test(match)) {
                                return match.replace(/value=["'][^"']*["']/i, `value="${value}"`);
                            } else {
                                return match.replace(/\s*\/?>$/, ` value="${value}">`);
                            }
                        });
                    };

                    const replacePlaceholders = (html) => {
                        let res = html;
                        res = res.replace(/\$\{empName\}/g, empName);
                        res = res.replace(/\$\{name\}/g, empName);
                        res = res.replace(/\$\{employeeName\}/g, empName);
                        res = res.replace(/\$\{email\}/g, empEmail);
                        res = res.replace(/\$\{month\}/g, monthName);
                        res = res.replace(/\$\{year\}/g, year.toString());
                        res = res.replace(/\$\{salary\}/g, basicSalary.toString());
                        res = res.replace(/\$\{netSalary\}/g, netSalary.toString());
                        res = res.replace(/\$\{companyName\}/g, companyName);

                        // New Template Placeholders for advanced users
                        const leavesTakenVal = Math.max(0, (payroll.totalWorkingDays || 0) - (payroll.workDays || 0));

                        res = res.replace(/\$\{totalWorkingDays\}/gi, (payroll.totalWorkingDays || 0).toString());
                        res = res.replace(/\$\{leavesTaken\}/gi, leavesTakenVal.toString());
                        res = res.replace(/\$\{actualDaysWorked\}/gi, (payroll.workDays || 0).toString());
                        res = res.replace(/\$\{grossSalary\}/gi, basicSalary.toString());
                        res = res.replace(/\$\{allowances\}/gi, allowances.toString());
                        res = res.replace(/\$\{overtime\}/gi, overtime.toString());
                        res = res.replace(/\$\{deductions\}/gi, deductions.toString());
                        res = res.replace(/\$\{netPayableSalary\}/gi, netSalary.toString());

                        // Smart Input Replacement by ID (handling inputs from their pasted HTML template)
                        res = replaceInput(res, 'empName', empName);
                        res = replaceInput(res, 'empId', payroll.employee?.employeeCode || payroll.employee?.id || 'N/A');
                        res = replaceInput(res, 'designation', payroll.employee?.designation?.name || 'N/A');
                        res = replaceInput(res, 'department', payroll.employee?.department?.name || 'N/A');

                        const lastDayOfMonth = new Date(year, month, 0).getDate();
                        const payPeriod = `01-${monthName}-${year} to ${lastDayOfMonth}-${monthName}-${year}`;
                        res = replaceInput(res, 'payPeriod', payPeriod);
                        res = replaceInput(res, 'payMonth', `${monthName} -- ${year}`);

                        res = replaceInput(res, 'totalWorkingDays', payroll.totalWorkingDays || 0);
                        res = replaceInput(res, 'leavesTaken', leavesTakenVal);
                        res = replaceInput(res, 'actualDaysWorked', payroll.workDays || 0);

                        const totalCl = payroll.employee?.company?.casualLeavesPerYear || 12;
                        const yearlyLeavesTaken = payroll.yearlyLeavesTaken || 0;
                        const remainingCl = Math.max(0, totalCl - yearlyLeavesTaken);
                        res = replaceInput(res, 'availableCL', `${remainingCl} / ${totalCl}`);

                        res = replaceInput(res, 'grossSalary', basicSalary);
                        res = replaceInput(res, 'allowances', allowances);
                        res = replaceInput(res, 'overtime', overtime);
                        res = replaceInput(res, 'deductions', deductions);
                        res = replaceInput(res, 'netPayable', netSalary);

                        // Use the pre-calculated leaveDeduction from backend which includes both Unpaid Leaves and Absences
                        const lwpVal = payroll.leaveDeduction || 0;
                        res = replaceInput(res, 'lwp', lwpVal);

                        // Smart Replacement for standard table cells (non-inputs) just in case
                        res = res.replace(/(Total Working Days.*?<td[^>]*>)\s*0\s*(<\/td>)/gis, `$1${payroll.totalWorkingDays || 0}$2`);
                        res = res.replace(/(Leaves Taken.*?<td[^>]*>)\s*0\s*(<\/td>)/gis, `$1${leavesTakenVal}$2`);
                        res = res.replace(/(Actual Days Worked.*?<td[^>]*>)\s*0\s*(<\/td>)/gis, `$1${payroll.workDays || 0}$2`);
                        res = res.replace(/(Gross Salary.*?<td[^>]*>)\s*0\s*(<\/td>)/gis, `$1${basicSalary}$2`);
                        res = res.replace(/(Allowances.*?<td[^>]*>)\s*0\s*(<\/td>)/gis, `$1${allowances}$2`);
                        res = res.replace(/(Overtime.*?<td[^>]*>)\s*0\s*(<\/td>)/gis, `$1${overtime}$2`);
                        res = res.replace(/(Deductions.*?<td[^>]*>)\s*0\s*(<\/td>)/gis, `$1${deductions}$2`);
                        res = res.replace(/(Net Payable Salary.*?<td[^>]*>)\s*0\s*(<\/td>)/gis, `$1${netSalary}$2`);
                        res = res.replace(/(Available CL.*?<td[^>]*>)\s*e\.g\.\s*11\/12\s*(<\/td>)/gis, `$1${remainingCl} / ${totalCl}$2`);

                        // Also replace the literal text from their pasted template intelligently
                        res = res.replace(/placeholder="Enter employee name"/gi, `value="${empName}" placeholder="Employee Name"`);
                        res = res.replace(/placeholder="Enter employee ID"/gi, `value="${payroll.employee?.employeeCode || payroll.employee?.id || 'N/A'}" placeholder="Employee ID"`);
                        res = res.replace(/placeholder="Enter designation"/gi, `value="${payroll.employee?.designation?.name || 'N/A'}" placeholder="Designation"`);
                        res = res.replace(/placeholder="Enter department"/gi, `value="${payroll.employee?.department?.name || 'N/A'}" placeholder="Department"`);
                        res = res.replace(/placeholder="e\.g\.\s*01-[A-Za-z]+-[0-9]{4}\s*to\s*[0-9]{2}-[A-Za-z]+-[0-9]{4}"/gi, `value="${payPeriod}" placeholder="Pay Period"`);

                        // Fallback in case it's just raw text inside a tag
                        res = res.replace(/>Enter employee name</gi, `>${empName}<`);
                        res = res.replace(/>Enter employee ID</gi, `>${payroll.employee?.employeeCode || payroll.employee?.id || 'N/A'}<`);
                        res = res.replace(/>Enter designation</gi, `>${payroll.employee?.designation?.name || 'N/A'}<`);
                        res = res.replace(/>Enter department</gi, `>${payroll.employee?.department?.name || 'N/A'}<`);
                        res = res.replace(/>e\.g\.\s*01-[A-Za-z]+-[0-9]{4}\s*to\s*[0-9]{2}-[A-Za-z]+-[0-9]{4}</gi, `>${payPeriod}<`);

                        return res;
                    };

                    if (isNewHtml) {
                        setEvaluatedPayslipHtml(replacePlaceholders(payslipHtml));
                        setEvaluatedEmailBodyHtml(replacePlaceholders(emailBodyHtml));
                    } else {
                        setEvaluatedPayslipHtml(payslipHtml);
                        setEvaluatedEmailBodyHtml(emailBodyHtml);
                    }
                } catch (error) {
                    console.error("Error fetching company templates:", error);
                    setEvaluatedPayslipHtml('<div>Error loading templates.</div>');
                    setEvaluatedEmailBodyHtml('<div>Error loading templates.</div>');
                }
            }
        };

        loadTemplates();
    }, [isOpen, payroll, user]);

    if (!isOpen || !payroll) return null;

    const handleSend = async () => {
        if (!payslipRef.current || !emailBodyRef.current) return;
        setIsSending(true);

        try {
            // To capture live input changes into the HTML, we must sync input values to their attributes.
            const payslipInputs = payslipRef.current.querySelectorAll('input, textarea');
            payslipInputs.forEach(input => {
                if (input.tagName.toLowerCase() === 'textarea') {
                    input.textContent = input.value;
                } else {
                    input.setAttribute('value', input.value);
                }
            });
            const emailInputs = emailBodyRef.current.querySelectorAll('input, textarea');
            emailInputs.forEach(input => {
                if (input.tagName.toLowerCase() === 'textarea') {
                    input.textContent = input.value;
                } else {
                    input.setAttribute('value', input.value);
                }
            });

            const finalPayslipHtml = payslipRef.current.innerHTML;
            const finalEmailBodyHtml = emailBodyRef.current.innerHTML;
            await onSend(payroll.id, finalPayslipHtml, finalEmailBodyHtml);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleSaveCustom = async () => {
        if (!payslipRef.current || !emailBodyRef.current || !onSave) return;
        setIsSaving(true);

        try {
            const payslipInputs = payslipRef.current.querySelectorAll('input, textarea');
            payslipInputs.forEach(input => {
                if (input.tagName.toLowerCase() === 'textarea') {
                    input.textContent = input.value;
                } else {
                    input.setAttribute('value', input.value);
                }
            });
            const emailInputs = emailBodyRef.current.querySelectorAll('input, textarea');
            emailInputs.forEach(input => {
                if (input.tagName.toLowerCase() === 'textarea') {
                    input.textContent = input.value;
                } else {
                    input.setAttribute('value', input.value);
                }
            });

            const finalPayslipHtml = payslipRef.current.innerHTML;
            const finalEmailBodyHtml = emailBodyRef.current.innerHTML;
            await onSave(payroll.id, finalPayslipHtml, finalEmailBodyHtml);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-sm w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/60 dark:bg-sidebar rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {mode === 'send' ? 'Review & Finalize Payslip' : mode === 'edit' ? 'Edit Custom Payslip' : 'View Payslip'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {mode === 'send' ? 'Review the document and edit fields directly before sending.' : mode === 'edit' ? 'Edit the HTML document and save for later.' : 'Read-only preview of the document.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <Icon name="X" size={24} />
                    </button>
                </div>

                <div className="flex border-b border-border bg-card px-6">
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payslip' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('payslip')}
                    >
                        Payslip (PDF Attachment)
                    </button>
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'email' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('email')}
                    >
                        Email Body
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    <div className={`bg-card shadow-sm p-4 rounded-lg mx-auto overflow-hidden ${activeTab === 'payslip' ? 'block' : 'hidden'} ${mode === 'view' ? 'pointer-events-none' : ''}`} style={{ minHeight: '600px' }}>
                        {/* We render the HTML and let users click into any inputs or contenteditable fields it contains */}
                        <div
                            ref={payslipRef}
                            dangerouslySetInnerHTML={{ __html: evaluatedPayslipHtml }}
                            className="payslip-preview-container"
                        />
                    </div>
                    <div className={`bg-card shadow-sm p-4 rounded-lg mx-auto overflow-hidden ${activeTab === 'email' ? 'block' : 'hidden'} ${mode === 'view' ? 'pointer-events-none' : ''}`} style={{ minHeight: '600px', maxWidth: '800px' }}>
                        <div
                            ref={emailBodyRef}
                            dangerouslySetInnerHTML={{ __html: evaluatedEmailBodyHtml }}
                            className="email-preview-container"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-border flex justify-between items-center bg-muted/60 dark:bg-sidebar rounded-b-xl">
                    <div className="text-sm text-muted-foreground">
                        Status: <span className={`font-semibold uppercase ${payroll.status === 'sent' ? 'text-green-600' : 'text-yellow-600'}`}>{payroll.status}</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>{mode === 'view' ? 'Close' : 'Cancel'}</Button>

                        {mode === 'edit' && (
                            <Button onClick={handleSaveCustom} disabled={isSaving} className="bg-primary text-white hover:bg-primary/90">
                                {isSaving ? (
                                    <><Icon name="Loader2" className="animate-spin mr-2" size={16} /> Saving...</>
                                ) : (
                                    <><Icon name="Save" className="mr-2" size={16} /> Update & Save</>
                                )}
                            </Button>
                        )}

                        {mode === 'send' && (
                            <Button onClick={handleSend} disabled={isSending}>
                                {isSending ? (
                                    <><Icon name="Loader2" className="animate-spin mr-2" size={16} /> Sending...</>
                                ) : (
                                    <><Icon name="Send" className="mr-2" size={16} /> Send PDF to Employee</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollReviewModal;
