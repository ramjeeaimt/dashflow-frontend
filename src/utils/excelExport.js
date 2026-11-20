import * as XLSX from 'xlsx';

/**
 * Format and download an array of employee records as an Excel (.xlsx) spreadsheet
 * @param {Array} employees - Array of employee objects
 * @param {string} fileName - Output file name
 */
export const exportEmployeesToExcel = (employees = [], fileName = 'Employee_Directory.xlsx') => {
  if (!employees || employees.length === 0) {
    throw new Error('No employee records selected to export.');
  }

  const rows = employees.map((emp, index) => {
    const user = emp.user || {};
    const dept = typeof emp.department === 'string' ? emp.department : (emp.department?.name || 'General');
    const desig = typeof emp.designation === 'string' ? emp.designation : (emp.designation?.title || emp.designation?.name || 'Staff');
    const salary = emp.salary ? `₹${Number(emp.salary).toLocaleString('en-IN')}` : 'N/A';
    
    // Status formatting
    let statusText = (emp.status || 'Active').toUpperCase();
    
    // Work mode formatting
    const workMode = emp.workFromHome ? 'Work From Home' : 'Office Based';

    return {
      'S.No': index + 1,
      'Employee Code': emp.employeeCode || `EMP-${String(index + 1).padStart(3, '0')}`,
      'Full Name': `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Employee',
      'Email Address': user.email || emp.email || 'N/A',
      'Phone Number': user.phone || emp.phone || 'N/A',
      'Designation': desig,
      'Department': dept,
      'Employment Type': (emp.employmentType || 'Full-time').toUpperCase(),
      'Work Mode': workMode,
      'Current Status': statusText,
      'Date of Joining': emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
      'Monthly Salary': salary,
      'Date of Birth': emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
      'Shift Timings': emp.startTime && emp.endTime ? `${emp.startTime} - ${emp.endTime}` : 'Standard Hours',
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths for aesthetic Excel rendering
  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 16 }, // Employee Code
    { wch: 24 }, // Full Name
    { wch: 28 }, // Email
    { wch: 16 }, // Phone
    { wch: 22 }, // Designation
    { wch: 18 }, // Department
    { wch: 18 }, // Employment Type
    { wch: 18 }, // Work Mode
    { wch: 14 }, // Current Status
    { wch: 16 }, // Date of Joining
    { wch: 16 }, // Monthly Salary
    { wch: 16 }, // Date of Birth
    { wch: 20 }, // Shift Timings
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  // Trigger file download
  const cleanName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, cleanName);
  return cleanName;
};

/**
 * Export a single employee dossier / profile summary into an Excel workbook
 */
export const exportSingleEmployeeDossier = (employee, extraData = {}) => {
  if (!employee) return;

  const user = employee.user || {};
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Employee';
  const dept = typeof employee.department === 'string' ? employee.department : (employee.department?.name || 'General');
  const desig = typeof employee.designation === 'string' ? employee.designation : (employee.designation?.title || employee.designation?.name || 'Staff');

  // Sheet 1: Personal & Employment Details
  const profileRows = [
    { 'Profile Field': 'Employee Code', 'Details': employee.employeeCode || 'N/A' },
    { 'Profile Field': 'Full Name', 'Details': fullName },
    { 'Profile Field': 'Email', 'Details': user.email || 'N/A' },
    { 'Profile Field': 'Phone', 'Details': user.phone || 'N/A' },
    { 'Profile Field': 'Designation', 'Details': desig },
    { 'Profile Field': 'Department', 'Details': dept },
    { 'Profile Field': 'Employment Type', 'Details': (employee.employmentType || 'Full-time').toUpperCase() },
    { 'Profile Field': 'Work Mode', 'Details': employee.workFromHome ? 'Work From Home' : 'Office Based' },
    { 'Profile Field': 'Status', 'Details': (employee.status || 'Active').toUpperCase() },
    { 'Profile Field': 'Date of Joining', 'Details': employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('en-IN') : 'N/A' },
    { 'Profile Field': 'Monthly Salary', 'Details': employee.salary ? `₹${Number(employee.salary).toLocaleString('en-IN')}` : 'N/A' },
    { 'Profile Field': 'Date of Birth', 'Details': employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-IN') : 'N/A' },
    { 'Profile Field': 'Export Timestamp', 'Details': new Date().toLocaleString('en-IN') },
  ];

  const profileSheet = XLSX.utils.json_to_sheet(profileRows);
  profileSheet['!cols'] = [{ wch: 22 }, { wch: 35 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, profileSheet, 'Employee Profile');

  // Sheet 2: Tasks (if available)
  if (Array.isArray(extraData.tasks) && extraData.tasks.length > 0) {
    const taskRows = extraData.tasks.map((t, idx) => ({
      '#': idx + 1,
      'Task Title': t.title || 'Untitled Task',
      'Project': t.project?.name || 'General',
      'Status': (t.status || 'todo').toUpperCase(),
      'Priority': (t.priority || 'medium').toUpperCase(),
      'Due Date': t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN') : 'No Due Date',
    }));
    const taskSheet = XLSX.utils.json_to_sheet(taskRows);
    taskSheet['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tasks');
  }

  // Sheet 3: Leaves (if available)
  if (Array.isArray(extraData.leaves) && extraData.leaves.length > 0) {
    const leaveRows = extraData.leaves.map((lv, idx) => ({
      '#': idx + 1,
      'Leave Type': (lv.type || 'casual').toUpperCase(),
      'Start Date': lv.startDate ? new Date(lv.startDate).toLocaleDateString('en-IN') : 'N/A',
      'End Date': lv.endDate ? new Date(lv.endDate).toLocaleDateString('en-IN') : 'N/A',
      'Status': (lv.status || 'pending').toUpperCase(),
      'Reason': lv.reason || 'N/A',
    }));
    const leaveSheet = XLSX.utils.json_to_sheet(leaveRows);
    leaveSheet['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, leaveSheet, 'Leaves');
  }

  const safeName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${safeName}_Dossier.xlsx`;
  XLSX.writeFile(workbook, fileName);
  return fileName;
};
