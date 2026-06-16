import { toast } from 'react-hot-toast';
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import useAuthStore from '../../../store/useAuthStore';
import financeService from '../../../services/finance.service';
import { employeeService } from '../../../services/employee.service';
import api from '../../../api/client';
import PayrollDetailsModal from '../components/PayrollDetailsModal';
import PayrollReviewModal from '../components/PayrollReviewModal';
const PayrollPage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const saved = localStorage.getItem('payableMonth');
        return saved ? parseInt(saved, 10) : new Date().getMonth() + 1;
    });
    const [selectedYear, setSelectedYear] = useState(() => {
        const saved = localStorage.getItem('payableYear');
        return saved ? parseInt(saved, 10) : new Date().getFullYear();
    });

    useEffect(() => {
        localStorage.setItem('payableMonth', selectedMonth.toString());
        localStorage.setItem('payableYear', selectedYear.toString());
    }, [selectedMonth, selectedYear]);

    const { user } = useAuthStore();

    // ========== NEW: Email template states ==========
    const [selectedTemplateId, setSelectedTemplateId] = useState('default');
    const [pendingTemplateId, setPendingTemplateId] = useState('default'); // holds selection until applied
    const [templates, setTemplates] = useState([]);

    // ========== NEW: Search filter state ==========
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPayrollId, setCurrentPayrollId] = useState(null);
    const [sendingEmails, setSendingEmails] = useState({});
    const [regeneratingIds, setRegeneratingIds] = useState({});
    const [creatingManualIds, setCreatingManualIds] = useState({});

    // ========== NEW: Review Modal state ==========
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewPayroll, setReviewPayroll] = useState(null);
    const [reviewModalMode, setReviewModalMode] = useState('send');

    // ========== NEW: Manual payroll modal state ==========
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isBulkConfirmModalOpen, setIsBulkConfirmModalOpen] = useState(false);
    const [employeesList, setEmployeesList] = useState([]);
    const [manualFormData, setManualFormData] = useState({
        employeeId: '',
        basicSalary: '',
        allowances: '',
        deductions: '',
        overtime: '',
        netSalary: '',
        month: selectedMonth,
        year: selectedYear,
        status: 'draft',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    // ========== NEW: Auto‑calculate net salary ==========
    useEffect(() => {
        const basic = parseFloat(manualFormData.basicSalary) || 0;
        const allowances = parseFloat(manualFormData.allowances) || 0;
        const deductions = parseFloat(manualFormData.deductions) || 0;
        const overtime = parseFloat(manualFormData.overtime) || 0;
        const net = basic + allowances + overtime - deductions;
        setManualFormData(prev => ({ ...prev, netSalary: net.toFixed(2) }));
    }, [manualFormData.basicSalary, manualFormData.allowances, manualFormData.deductions, manualFormData.overtime]);

    // ========== NEW: Fetch employees when modal opens ==========
    useEffect(() => {
        if (isManualModalOpen && user?.company?.id) {
            const fetchEmployees = async () => {
                try {
                    const employees = await employeeService.getAll({ companyId: user.company.id });
                    setEmployeesList(employees);
                } catch (error) {
                    console.error('Failed to fetch employees:', error);
                }
            };
            fetchEmployees();
        }
    }, [isManualModalOpen, user]);

    const generatePayroll = async () => {
        try {
            setIsLoading(true);

            // 🔹 Generate payroll via Backend
            // The backend is smart enough to skip existing drafts and finalized records
            await financeService.bulkGenerateRealPayroll(selectedMonth, selectedYear, user.company.id);

            toast.success("Bulk payroll generation completed successfully");
            setIsBulkConfirmModalOpen(false);

            // Refresh
            fetchPayroll();

        } catch (error) {
            console.error("Payroll generation failed:", error);
            toast.error("Error generating payroll ");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPayroll = async () => {
        // ... (your existing fetchPayroll logic, unchanged)
        setIsLoading(true);
        try {
            const data = await financeService.getPayroll(user?.company?.id, selectedMonth, selectedYear);
            setPayrollData(data);
        } catch (error) {
            console.error('Failed to fetch payroll:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.company?.id) {
            fetchPayroll();
            fetchAllEmployees();
        }
        // Load persisted template or global active template on mount / when user changes
    }, [user, selectedMonth, selectedYear]);

    useEffect(() => {
        // Determine global active template ID (from user or localStorage)
        const globalActive = localStorage.getItem('global_active_template_id') || (user?.company?.activeEmailTemplateId ? user.company.activeEmailTemplateId.toString() : null);
        const saved = localStorage.getItem('selected_email_template_id');
        const initial = saved ?? (globalActive && globalActive !== 'default' ? globalActive : 'default');
        setSelectedTemplateId(initial);
        setPendingTemplateId(initial);

        // Load custom email templates from backend (fallback to localStorage)
        const loadTemplates = async () => {
            try {
                const resp = await api.get('/email-templates');
                let fetched = resp.data;
                // Unwrap if needed
                if (fetched && fetched.data && Array.isArray(fetched.data)) {
                    fetched = fetched.data;
                } else if (fetched && fetched.templates && Array.isArray(fetched.templates)) {
                    fetched = fetched.templates;
                }
                setTemplates(Array.isArray(fetched) ? fetched : []);
                localStorage.setItem('notification_templates', JSON.stringify(fetched));
            } catch (err) {
                console.error('Failed to fetch templates from backend, using localStorage', err);
                const saved = localStorage.getItem('notification_templates');
                if (saved) setTemplates(JSON.parse(saved));
            }
        };
        loadTemplates();
    }, [user]);

    const fetchAllEmployees = async () => {
        setIsEmployeesLoading(true);
        try {
            const employees = await employeeService.getAll({ companyId: user.company.id });
            setEmployeesList(employees.filter(e => e.status === 'active'));
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setIsEmployeesLoading(false);
        }
    };

    // ========== NEW: Filtered data based on search term ==========
    const combinedPayrollData = useMemo(() => {
        // Map of existing payrolls by employeeId
        const payrollMap = new Map();
        (payrollData || []).forEach(p => payrollMap.set(p.employeeId, p));

        // Create a list including all employees
        const allRows = employeesList.map(emp => {
            const existingPayroll = payrollMap.get(emp.id);
            return {
                id: existingPayroll?.id || `temp-${emp.id}`,
                isGenerated: !!existingPayroll,
                employee: emp,
                employeeId: emp.id,
                basicSalary: existingPayroll ? Math.round(existingPayroll.basicSalary ?? (emp.salary || 0)) : Math.round(emp.salary || 0),
                allowances: existingPayroll ? Math.round(existingPayroll.allowances ?? 0) : 0,
                deductions: existingPayroll ? Math.round(existingPayroll.deductions ?? 0) : 0,
                leaveDeduction: existingPayroll ? Math.round(existingPayroll.leaveDeduction ?? 0) : 0,
                halfDeduction: existingPayroll ? Math.round(existingPayroll.halfDeduction ?? 0) : 0,
                netSalary: existingPayroll ? Math.round(existingPayroll.netSalary ?? 0) : Math.round(emp.salary || 0),
                status: (existingPayroll?.status === 'pending' ? 'draft' : existingPayroll?.status === 'paid' ? 'sent' : existingPayroll?.status) || 'not-generated',
                month: existingPayroll?.month || selectedMonth,
                year: existingPayroll?.year || selectedYear,
                record: existingPayroll
            };
        });

        if (!searchTerm.trim()) return allRows;

        const term = searchTerm.toLowerCase();
        return allRows.filter(row => {
            const fullName = `${row.employee.user?.firstName || ''} ${row.employee.user?.lastName || ''}`.toLowerCase();
            const email = (row.employee.user?.email || '').toLowerCase();
            const phone = (row.employee.user?.phone || row.employee.phone || '').toLowerCase();
            const code = (row.employee.employeeCode || '').toLowerCase();

            return fullName.includes(term) || email.includes(term) || phone.includes(term) || code.includes(term);
        });
    }, [payrollData, employeesList, searchTerm, selectedMonth, selectedYear]);

    const renderCustomPayrollHtml = (templateText, employeeName, month, year, salary, activeTpl = {}) => {
        let finalMessage = templateText || '';
        finalMessage = finalMessage.replace(/\${employeeName}/g, employeeName);
        finalMessage = finalMessage.replace(/\${name}/g, employeeName);
        finalMessage = finalMessage.replace(/\${month}/g, month.toString());
        finalMessage = finalMessage.replace(/\${year}/g, year.toString());
        finalMessage = finalMessage.replace(/\${salary}/g, salary);
        finalMessage = finalMessage.replace(/\${netSalary}/g, salary);

        const currentYear = new Date().getFullYear();
        const bannerUrl = 'https://res.cloudinary.com/dxju8ikk4/image/upload/v1777468072/difmo_banner_final.png';

        const sigTeam = activeTpl?.signatureTeam || 'Team DIFMO';
        const sigDept = activeTpl?.signatureDept || 'Corporate Support';
        const sigRole = activeTpl?.signatureRole || 'Communications & Experience';
        const sigCompany = activeTpl?.signatureCompany || 'DIFMO Pvt Ltd';
        const sigMeetText = activeTpl?.signatureMeetText || "Let's meet";
        const sigMeetLink = activeTpl?.signatureMeetLink || 'https://www.difmo.com/contact';
        const sigEmail = activeTpl?.signatureEmail || 'info@difmo.com';
        const sigAddress = activeTpl?.signatureAddress || '4/37 Vibhav Khand, Gomtinagr Lucknow, Uttar Pradesh 226016, India';
        const sigWebsite = activeTpl?.signatureWebsite || 'difmo.com';
        const sigWebsiteLink = activeTpl?.signatureWebsiteLink || 'https://www.difmo.com';

        return `
            <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background: #fff; color: #1e293b; margin: 0; padding: 0;">
                <div style="max-width: 700px; margin: 0;">

                    <!-- Body -->
                    <div style="font-size: 16px; line-height: 1.6; color: #334155;">
                        ${finalMessage}
                    </div>

                    <!-- Signature -->
                    <div style="margin-top: 48px; padding-top: 28px; border-top: 1px solid #f1f5f9;">
                        <img src="https://res.cloudinary.com/dxju8ikk4/image/upload/v1777469595/difmo_vector_icon.png"
                             width="100" height="100"
                             style="border-radius: 50%; object-fit: cover; display: block; margin-bottom: 20px;">

                        <div style="border-top: 1px solid #1e293b; padding-top: 22px; max-width: 650px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <!-- Left: Identity -->
                                    <td width="55%" valign="top">
                                        <p style="margin: 0 0 2px; font-size: 20px; font-weight: 800; color: #000; letter-spacing: -0.4px;">${sigTeam}</p>
                                        <p style="margin: 0 0 1px; font-size: 15px; color: #1e293b; font-weight: 500;">${sigDept}</p>
                                        <p style="margin: 0 0 12px; font-size: 14px; color: #475569; font-style: italic;">${sigRole}</p>
                                        <p style="margin: 0 0 14px; font-size: 15px; font-weight: 800; color: #000;">${sigCompany}</p>
                                        <a href="${sigMeetLink}" style="color: #d03f13ff; font-size: 14px; font-weight: 700; text-decoration: none;">
                                            ${sigMeetText}
                                        </a>
                                    </td>

                                    <!-- Right: Contact -->
                                    <td width="45%" valign="top">
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="32" valign="top" style="padding-bottom: 14px;">
                                                    <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                                                        <span style="color: #fff; font-size: 11px; font-weight: 800;">E</span>
                                                    </div>
                                                </td>
                                                <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                                                    <a href="mailto:${sigEmail}" style="color: #000; text-decoration: none;">${sigEmail}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="32" valign="top" style="padding-bottom: 14px;">
                                                    <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                                                        <span style="color: #fff; font-size: 11px; font-weight: 800;">A</span>
                                                    </div>
                                                </td>
                                                <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                                                    ${sigAddress}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="32" valign="top" style="padding-bottom: 14px;">
                                                    <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                                                        <span style="color: #fff; font-size: 11px; font-weight: 800;">W</span>
                                                    </div>
                                                </td>
                                                <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                                                    <a href="${sigWebsiteLink}" style="color: #d03f13ff; text-decoration: none;">${sigWebsite}</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div style="border-top: 1px solid #1e293b; margin-top: 22px; max-width: 650px;"></div>
                    </div>

                    <!-- Banner -->
                    <div style="margin-top: 36px; border-radius: 10px; overflow: hidden; line-height: 0;">
                        <img src="${bannerUrl}" alt="Our Services" style="width: 100%; height: auto; display: block;">
                    </div>

                    <!-- Social Links -->
                    <div style="margin-top: 28px;">
                        <a href="#" style="display: inline-block; margin-right: 14px;">
                            <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" width="22" style="opacity: 0.75; vertical-align: middle;">
                        </a>
                        <a href="#" style="display: inline-block; margin-right: 14px;">
                            <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" width="22" style="opacity: 0.75; vertical-align: middle;">
                        </a>
                        <a href="#" style="display: inline-block; margin-right: 14px;">
                            <img src="https://cdn-icons-png.flaticon.com/512/145/145812.png" width="22" style="opacity: 0.75; vertical-align: middle;">
                        </a>
                    </div>

                    <!-- Legal -->
                    <div style="margin-top: 36px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                        <p style="margin: 0;">
                            This email, along with any attachments, documents, project files, source code, designs, business strategies, client information, and other transmitted materials, contains confidential and proprietary information belonging to <b>DIFMO</b>. It is intended solely for the use of the individual, organization, or entity to whom it is addressed.
                            <br/><br/>
                            Any unauthorized access, review, copying, disclosure, distribution, modification, or use of this information is strictly prohibited and may be unlawful.
                            <br/><br/>
                            If you have received this communication in error, please notify us immediately by replying to this email or contacting our support team at <b>info@difmo.com, mailto:info@difmo.com</b>, and permanently delete all copies of this message and its attachments from your system.
                            <br/><br/>
                            Difmo Private Limited is committed to protecting client data, intellectual property, and business confidentiality across all services including AI solutions, web development, mobile applications, cloud services, cybersecurity, and smart technology solutions.
                            <br/><br/>
                            <b>© ${currentYear} Difmo Private Limited. All rights reserved.</b>
                        </p>
                        <p style="margin: 8px 0 0;">&copy; ${currentYear} DIFMO PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
                    </div>

                </div>
            </div>
        `;
    };

    const handleSendIndividualEmail = async (id, customNotes = null) => {
        if (sendingEmails[id]) return;

        setSendingEmails(prev => ({ ...prev, [id]: true }));
        try {
            const row = combinedPayrollData.find(r => r.id === id);
            let customHtml;

            // Determine template layout choice
            let targetTemplateId = selectedTemplateId;
            if (targetTemplateId === 'default') {
                const globalActiveId = localStorage.getItem('global_active_template_id');
                if (globalActiveId) {
                    targetTemplateId = globalActiveId;
                }
            }

            if (targetTemplateId !== 'default' && row) {
                const activeTpl = templates.find(t => t.id.toString() === targetTemplateId.toString());
                if (activeTpl) {
                    const empName = `${row.employee?.user?.firstName || ''} ${row.employee?.user?.lastName || ''}`.trim() || 'Employee';
                    const netSalaryFormatted = Number(row.netPayable || row.netSalary || row.basicSalary || 0).toFixed(2);
                    customHtml = renderCustomPayrollHtml(activeTpl.message, empName, selectedMonth, selectedYear, netSalaryFormatted, activeTpl);

                    if (customNotes && customNotes.trim() !== '') {
                        customHtml = customHtml.replace(
                            '<!-- Signature -->',
                            `<!-- Notes -->\n                    <div style="margin-top: 15px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">\n                        <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px; text-transform: uppercase;">Manager Reminders & Notes</h4>\n                        <p style="margin: 0; color: #475569; font-size: 14px; white-space: pre-wrap;">${customNotes}</p>\n                    </div>\n\n                    <!-- Signature -->`
                        );
                    }
                }
            }

            const payload = { customHtml };
            if (customNotes && customNotes.trim() !== '') {
                payload.notes = customNotes;
            }

            await financeService.sendPayrollEmail(id, payload);
            toast.success('Email sent successfully');
        } catch (error) {
            console.error('Failed to send email:', error);
            toast.error('Error sending email');
        } finally {
            setSendingEmails(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleFinalizeAndSend = async (payrollId, payslipHtml, emailBodyHtml) => {
        try {
            await api.post(`/finance/payroll/${payrollId}/send`, {
                payslipHtml,
                emailBodyHtml
            });
            toast.success('Payslip generated as PDF and sent to employee successfully.');
            fetchPayroll();
        } catch (error) {
            console.error('Failed to finalize payroll:', error);
            toast.error('Error sending payroll PDF.');
            throw error;
        }
    };

    const handleSaveCustomHtml = async (payrollId, payslipHtml, emailBodyHtml) => {
        try {
            await financeService.saveCustomHtml(payrollId, payslipHtml, emailBodyHtml);
            toast.success("Customizations saved successfully.");
            fetchPayroll();
        } catch (error) {
            console.error("Error saving custom HTML:", error);
            toast.error("Failed to save customizations.");
        }
    };

    const handleGenerateIndividual = async (row) => {
        try {
            setIsLoading(true);
            await financeService.bulkGenerateRealPayroll(
                selectedMonth,
                selectedYear,
                user.company.id,
                row.employeeId
            );
            toast.success("Payroll generated for " + row.employee.user?.firstName);
            fetchPayroll();
        } catch (error) {
            console.error("Individual generation failed:", error);
            toast.error("Error generating payroll");
        } finally {
            setIsLoading(false);
        }
    };

    // ========== NEW: Manual payroll handlers ==========
    const handleManuallyPayroll = () => {
        setIsEditing(false);
        setCurrentPayrollId(null);
        // Reset form with current month/year
        setManualFormData({
            employeeId: '',
            basicSalary: '',
            allowances: '',
            deductions: '',
            overtime: '',
            netSalary: '',
            month: selectedMonth,
            year: selectedYear,
            status: 'draft',
            notes: ''
        });
        setIsManualModalOpen(true);
    };

    // Apply selected template from pending state
    const applyTemplate = async (templateId = pendingTemplateId) => {
        // Use provided templateId (or fallback to pending)
        setSelectedTemplateId(templateId);
        setPendingTemplateId(templateId);
        localStorage.setItem('selected_email_template_id', templateId);
        // Persist globally for the company
        try {
            await api.patch(`/system-company/${user?.company?.id}`, {
                activeEmailTemplateId: templateId === 'default' ? null : templateId,
            });
            if (templateId === 'default') {
                localStorage.removeItem('global_active_template_id');
            } else {
                localStorage.setItem('global_active_template_id', templateId);
            }
        } catch (err) {
            console.error('Failed to persist active email template:', err);
        }
    };

    const handleEditPayroll = (record) => {
        setIsEditing(true);
        setCurrentPayrollId(record.id);
        setManualFormData({
            employeeId: record.employeeId,
            basicSalary: record.basicSalary || 0,
            allowances: record.allowances || 0,
            deductions: record.deductions || 0,
            overtime: record.overtime || 0,
            netSalary: record.netSalary || 0,
            month: record.month,
            year: record.year,
            status: record.status,
            notes: record.notes || ''
        });
        setIsManualModalOpen(true);
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll record?')) return;

        try {
            await financeService.deletePayroll(id);
            toast.success('Payroll record deleted successfully');
            fetchPayroll();
        } catch (error) {
            console.error('Failed to delete payroll:', error);
            toast.error('Error deleting payroll');
        }
    };

    const handleManualInputChange = (e) => {
        const { name, value } = e.target;
        setManualFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate Net Salary if a financial component changes
            if (['basicSalary', 'allowances', 'deductions', 'overtime'].includes(name)) {
                const basic = parseFloat(updated.basicSalary) || 0;
                const allowances = parseFloat(updated.allowances) || 0;
                const deductions = parseFloat(updated.deductions) || 0;
                const overtime = parseFloat(updated.overtime) || 0;
                updated.netSalary = basic + allowances + overtime - deductions;
            }

            return updated;
        });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualFormData.employeeId) {
            toast.error('Please select an employee');
            return;
        }
        setIsSubmitting(true);
        try {
            const basic = parseFloat(manualFormData.basicSalary) || 0;
            const allowances = parseFloat(manualFormData.allowances) || 0;
            const deductions = parseFloat(manualFormData.deductions) || 0;
            const overtime = parseFloat(manualFormData.overtime) || 0;
            const calculatedNetSalary = basic + allowances + overtime - deductions;

            const payload = {
                ...manualFormData,
                basicSalary: basic,
                allowances: allowances,
                deductions: deductions,
                overtime: overtime,
                netSalary: calculatedNetSalary,
                companyId: user.company.id,
                month: parseInt(manualFormData.month),
                year: parseInt(manualFormData.year)
            };
            if (isEditing) {
                await financeService.updatePayroll(currentPayrollId, payload);
                toast.success('Payroll record updated successfully');
            } else {
                await financeService.createPayroll(payload);
                toast.success('Payroll record created successfully');
            }
            setIsManualModalOpen(false);
            fetchPayroll(); // Refresh list
        } catch (error) {
            console.error('Failed to create manual payroll:', error);
            toast.error('Error creating payroll');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Payroll', path: '/payroll' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header onToggleSidebar={toggleMobileSidebar} />
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleSidebar}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />
            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8 flex flex-col min-h-screen`}>
                <div className="p-4 sm:p-6">
                    <BreadcrumbNavigation items={breadcrumbItems} />

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
                            <p className="text-muted-foreground mt-1">Manage employee salaries and disbursements</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="flex-1 sm:flex-none bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="flex-1 sm:flex-none bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button onClick={() => setIsBulkConfirmModalOpen(true)} iconName="Plus" className="w-full sm:w-auto">Generate Bulk Payroll</Button>
                            </div>
                        </div>
                    </div>

                    {/* ========== NEW: Search input ========== */}
                    <div className="mb-4">
                        <div className="relative">
                            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none "
                            />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border">
                            <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Employee</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Basic Salary</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Allowances</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Deductions</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground whitespace-nowrap">Net Payable</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(isLoading || isEmployeesLoading) ? (
                                        <tr>
                                            <td colSpan="7" className="px-3 sm:px-6 py-12 text-center">
                                                <Icon name="Loader2" size={24} className="animate-spin text-primary mx-auto mb-2" />
                                                <p className="text-muted-foreground">Loading payroll records...</p>
                                            </td>
                                        </tr>
                                    ) : (!combinedPayrollData || combinedPayrollData.length === 0) ? (
                                        <tr>
                                            <td colSpan="7" className="px-3 sm:px-6 py-12 text-center">
                                                <Icon name="DollarSign" size={48} className="text-muted-foreground/20 mx-auto mb-4" />
                                                <p className="text-foreground font-medium">
                                                    {searchTerm ? 'No matching records found' : 'No employees found'}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    {searchTerm
                                                        ? 'Try adjusting your search term.'
                                                        : `Active employees for ${months.find(m => m.value === selectedMonth).label} ${selectedYear} will appear here.`}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        combinedPayrollData.map((row) => (
                                            <React.Fragment key={row.id}>
                                                <tr className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-3 sm:px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                {row.employee?.user?.firstName?.[0]}{row.employee?.user?.lastName?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">{row.employee?.user?.firstName} {row.employee?.user?.lastName}</p>
                                                                <p className="text-xs text-muted-foreground">{row.employee?.employeeCode}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 text-sm">₹{row.basicSalary}</td>
                                                    <td className="px-3 sm:px-6 py-4 text-sm text-green-600">
                                                        {row.isGenerated ? `+₹${row.allowances}` : '-'}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 text-sm text-red-600 relative group cursor-pointer">
                                                        {row.isGenerated ? (
                                                            <>
                                                                <span className="border-b border-dashed border-red-300">-₹{row.deductions}</span>
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-slate-800 text-white text-xs rounded shadow-xl p-3 z-50 min-w-[200px]">
                                                                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2 border-b border-slate-600 pb-1">Deduction Breakdown</div>
                                                                    <div className="flex justify-between mb-1">
                                                                        <span className="text-slate-300">Leaves & Absences:</span>
                                                                        <span className="font-semibold text-red-300">₹{row.leaveDeduction || 0}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-300">Half-Days:</span>
                                                                        <span className="font-semibold text-red-300">₹{row.halfDeduction || 0}</span>
                                                                    </div>
                                                                    <div className="border-t border-slate-600 mt-2 pt-1 flex justify-between font-bold">
                                                                        <span>Total:</span>
                                                                        <span className="text-red-400">₹{row.deductions || 0}</span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 text-sm font-bold text-foreground whitespace-nowrap">
                                                        {row.isGenerated ? `₹${row.netSalary}` : `₹${row.basicSalary}`}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.status === 'sent' ? 'bg-green-100 text-green-800' :
                                                            row.status === 'not-generated' ? 'bg-slate-100 text-slate-500' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {row.status.replace('-', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {!row.isGenerated ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleGenerateIndividual(row)}
                                                                        className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all uppercase tracking-wider"
                                                                    >
                                                                        Generate
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (creatingManualIds[row.employeeId]) return;
                                                                            try {
                                                                                setCreatingManualIds(prev => ({ ...prev, [row.employeeId]: true }));
                                                                                // 1. Generate the calculated draft using backend logic
                                                                                await financeService.bulkGenerateRealPayroll(
                                                                                    selectedMonth, 
                                                                                    selectedYear, 
                                                                                    user.company.id, 
                                                                                    row.employeeId
                                                                                );
                                                                                
                                                                                // 2. Fetch fresh data to get the generated record
                                                                                const freshPayrolls = await financeService.getPayroll(user.company.id, selectedMonth, selectedYear);
                                                                                const newRecord = freshPayrolls.find(p => p.employeeId === row.employeeId);
                                                                                
                                                                                if (newRecord) {
                                                                                    // 3. Immediately open the HTML/PDF editor for the new draft
                                                                                    setReviewPayroll(newRecord);
                                                                                    setReviewModalMode('edit');
                                                                                    setIsReviewModalOpen(true);
                                                                                    fetchPayroll(); // update table in background
                                                                                } else {
                                                                                    toast.error('Draft created, but failed to open PDF editor.');
                                                                                    fetchPayroll();
                                                                                }
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                                toast.error('Failed to initialize manual payroll');
                                                                            } finally {
                                                                                setCreatingManualIds(prev => ({ ...prev, [row.employeeId]: false }));
                                                                            }
                                                                        }}
                                                                        disabled={creatingManualIds[row.employeeId]}
                                                                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {creatingManualIds[row.employeeId] ? (
                                                                            <>
                                                                                <Icon name="Loader2" size={12} className="animate-spin" />
                                                                                Creating...
                                                                            </>
                                                                        ) : (
                                                                            "Create Manual"
                                                                        )}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {row.status === 'draft' ? (
                                                                        <>
                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (regeneratingIds[row.id]) return;
                                                                                    try {
                                                                                        setRegeneratingIds(prev => ({ ...prev, [row.id]: true }));
                                                                                        await financeService.bulkGenerateRealPayroll(selectedMonth, selectedYear, user.company.id, row.employeeId);
                                                                                        await fetchPayroll();
                                                                                        toast.success('Payroll recalculated successfully!');
                                                                                    } catch(err) {
                                                                                        console.error(err);
                                                                                        toast.error('Failed to regenerate payroll.');
                                                                                    } finally {
                                                                                        setRegeneratingIds(prev => ({ ...prev, [row.id]: false }));
                                                                                    }
                                                                                }}
                                                                                disabled={regeneratingIds[row.id]}
                                                                                className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-all uppercase tracking-wider whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                {regeneratingIds[row.id] ? (
                                                                                    <>
                                                                                        <Icon name="Loader2" size={12} className="animate-spin" />
                                                                                        Regenerating...
                                                                                    </>
                                                                                ) : (
                                                                                    "Regenerate"
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setReviewPayroll(row.record);
                                                                                    setReviewModalMode('send');
                                                                                    setIsReviewModalOpen(true);
                                                                                }}
                                                                                className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-all uppercase tracking-wider whitespace-nowrap"
                                                                            >
                                                                                Review & Send
                                                                            </button>
                                                                        </>
                                                                    ) : row.status === 'sent' ? (
                                                                        <button
                                                                            onClick={() => {
                                                                                setReviewPayroll(row.record);
                                                                                setReviewModalMode('send');
                                                                                setIsReviewModalOpen(true);
                                                                            }}
                                                                            className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-all uppercase tracking-wider whitespace-nowrap"
                                                                        >
                                                                            Update & Resend
                                                                        </button>
                                                                    ) : null}
                                                                    <button
                                                                        onClick={() => {
                                                                            setReviewPayroll(row.record);
                                                                            setReviewModalMode('view');
                                                                            setIsReviewModalOpen(true);
                                                                        }}
                                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                        title="View"
                                                                    >
                                                                        <Icon name="Eye" size={18} />
                                                                    </button>
                                                                    {row.status === 'draft' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setReviewPayroll(row.record);
                                                                                setReviewModalMode('edit');
                                                                                setIsReviewModalOpen(true);
                                                                            }}
                                                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                            title="Edit Customizations"
                                                                        >
                                                                            <Icon name="Pencil" size={18} />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* NEW: Manual Payroll Modal*/}
            {isManualModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold text-foreground">
                                {isEditing ? 'Edit Payroll Entry' : 'Manual Payroll Entry'}
                            </h2>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <Icon name="X" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Employee Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1">Employee *</label>
                                    <select
                                        name="employeeId"
                                        value={manualFormData.employeeId}
                                        onChange={handleManualInputChange}
                                        required
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select Employee</option>
                                        {employeesList.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.user?.firstName} {emp.user?.lastName} ({emp.employeeCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Month and Year */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Month</label>
                                    <select
                                        name="month"
                                        value={manualFormData.month}
                                        disabled
                                        className="w-full bg-slate-100 text-slate-500 border border-border rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                                    >
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Year</label>
                                    <select
                                        name="year"
                                        value={manualFormData.year}
                                        disabled
                                        className="w-full bg-slate-100 text-slate-500 border border-border rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                                    >
                                        {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                {/* Salary Components */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Basic Salary</label>
                                    <input
                                        type="number"
                                        name="basicSalary"
                                        value={manualFormData.basicSalary}
                                        onChange={handleManualInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Allowances</label>
                                    <input
                                        type="number"
                                        name="allowances"
                                        value={manualFormData.allowances}
                                        onChange={handleManualInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Deductions</label>
                                    <input
                                        type="number"
                                        name="deductions"
                                        value={manualFormData.deductions}
                                        onChange={handleManualInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Overtime</label>
                                    <input
                                        type="number"
                                        name="overtime"
                                        value={manualFormData.overtime}
                                        onChange={handleManualInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                {/* Net Salary (auto-calculated, read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Net Salary</label>
                                    <input
                                        type="number"
                                        name="netSalary"
                                        value={manualFormData.netSalary}
                                        readOnly
                                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={manualFormData.status}
                                        onChange={handleManualInputChange}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                    </select>
                                </div>

                                {/* Notes */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={manualFormData.notes}
                                        onChange={handleManualInputChange}
                                        rows="3"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setIsManualModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? (isEditing ? 'Updating...' : 'Creating...')
                                        : (isEditing ? 'Update Payroll' : 'Create Payroll')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <PayrollDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                payroll={selectedPayroll}
                onSendEmail={handleSendIndividualEmail}
            />

            <PayrollReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => {
                    setIsReviewModalOpen(false);
                    setReviewPayroll(null);
                }}
                payroll={reviewPayroll}
                onSend={handleFinalizeAndSend}
                onSave={handleSaveCustomHtml}
                mode={reviewModalMode}
            />

            {/* Bulk Confirm Modal */}
            {isBulkConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-foreground mb-2">Confirm Bulk Generation</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Are you sure you want to generate payroll for all active employees for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}? This will calculate their salary based on actual attendance records.
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsBulkConfirmModalOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsBulkConfirmModalOpen(false);
                                        generatePayroll();
                                    }}
                                    disabled={isLoading}
                                    className="bg-primary text-white"
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollPage;