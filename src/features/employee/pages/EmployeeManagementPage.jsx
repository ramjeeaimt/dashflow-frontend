import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import {
  EmployeeTable,
  EmployeeFilters,
  EmployeeActions,
  EmployeeModal,
  useEmployeeStore
} from 'features/employee';
import { useAttendanceStore } from 'features/attendance';
import useAuthStore from '../../../store/useAuthStore';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';

const EmployeeManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filters, setFilters] = useState({
    department: '',
    branch: '',
    employmentType: '',
    status: ''
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'view', // 'view', 'edit', 'add'
    employee: null
  });

  const { user, isAuthenticated } = useAuthStore();
  const {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    setEmployees
  } = useEmployeeStore();
  const { bulkCheckIn } = useAttendanceStore();

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employee Management', path: '/employee-management' }
  ];

  useEffect(() => {
    if (isAuthenticated && user?.company?.id) {
      fetchEmployees(user.company.id, filters);
    }
  }, [filters, user, isAuthenticated, fetchEmployees]);

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter((employee) => {
      const matchesSearch = searchTerm === '' ||
        employee?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        employee?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        employee?.id?.toString()?.includes(searchTerm);
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];
      if (sortConfig?.key === 'hireDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [employees, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev?.includes(employeeId) ?
        prev?.filter((id) => id !== employeeId) :
        [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEmployees((prev) =>
      prev?.length === filteredAndSortedEmployees?.length ?
        [] :
        filteredAndSortedEmployees?.map((emp) => emp?.id)
    );
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: '',
      branch: '',
      employmentType: '',
      status: ''
    });
    setSearchTerm('');
  };

  const handleAddEmployee = () => {
    setModalState({ isOpen: true, mode: 'add', employee: null });
  };

  const handleEditEmployee = (employee) => {
    setModalState({ isOpen: true, mode: 'edit', employee });
  };

  const handleViewEmployee = (employee) => {
    setModalState({ isOpen: true, mode: 'view', employee });
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(employeeId, user.company.id);
        alert('Employee deleted successfully');
      } catch (err) {
        alert(`Failed to delete employee: ${err.message}`);
      }
    }
  };

  const handleImportEmployees = () => {
    console.log('Import employees triggered');
    alert('Import feature coming soon!');
  };

  const handleExportEmployees = () => {
    console.log('Export employees triggered');
    alert('Export feature coming soon!');
  };

  const handleBulkAction = async (action, employeeIds) => {
    if (action === 'bulk-check-in') {
      try {
        const notes = prompt('Enter notes for bulk check-in (optional):');
        await bulkCheckIn(employeeIds, user.company.id, notes);
        alert('Bulk check-in successful!');
        setSelectedEmployees([]);
      } catch (error) {
        alert('Failed to process bulk check-in.');
      }
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      const payload = {
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        password: 'welcome123',
        companyId: user?.company?.id || '',
        departmentId: employeeData.department || '',
        role: employeeData.roleIds?.[0] || '',
        roleIds: employeeData.roleIds || [],
        hireDate: employeeData.hireDate || new Date().toISOString(),
        salary: employeeData.salary || '',
        manager: employeeData.manager || '',
        branch: employeeData.branch || '',
        employmentType: employeeData.employmentType || '',
        status: employeeData.status || 'active',
        address: employeeData.address || '',
        emergencyContact: employeeData.emergencyContact || '',
        emergencyPhone: employeeData.emergencyPhone || '',
        skills: employeeData.skills || [],
        permissionIds: employeeData.permissionIds || [],
        avatar: employeeData.avatar || '',
        documents: employeeData.documents || []
      };

      if (modalState.mode === 'add') {
        await createEmployee(payload, user.company.id);
      } else if (modalState.mode === 'edit') {
        await updateEmployee(modalState.employee.id, payload, user.company.id);
      }
      handleCloseModal();
    } catch (err) {
      throw new Error('Failed to save employee. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'view', employee: null });
  };

  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading employees...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6 bg-slate-50 min-h-screen`}>
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <BreadcrumbNavigation items={breadcrumbItems} />
              <div className="mt-4">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Employee Management</h1>
                <p className="text-slate-500 max-w-2xl text-sm font-medium">
                  Efficiently manage your workforce, departments, and employee details in one place.
                </p>
              </div>
            </div>
            {/* Optional: Add a quick stat or a primary action button here if needed */}
          </div>

          {error && (
            <div className="my-6 p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-500 p-1.5 rounded-lg text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <p className="text-sm font-semibold">{error}</p>
              </div>
              <button
                onClick={() => fetchEmployees(user?.company?.id, filters)}
                className="bg-white px-4 py-1.5 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="mt-4 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
            <EmployeeActions
              employees={filteredAndSortedEmployees}
              selectedEmployees={selectedEmployees}
              onAddEmployee={handleAddEmployee}
              onBulkAction={handleBulkAction}
              onImportEmployees={handleImportEmployees}
              onExportEmployees={handleExportEmployees}
            />

            <EmployeeFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              resultCount={filteredAndSortedEmployees?.length}
            />

            <EmployeeTable
              employees={filteredAndSortedEmployees}
              setEmployees={setEmployees}
              selectedEmployees={selectedEmployees}
              onSelectEmployee={handleSelectEmployee}
              onSelectAll={handleSelectAll}
              onEditEmployee={handleEditEmployee}
              onViewEmployee={handleViewEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              sortConfig={sortConfig}
              onSort={handleSort}
              loading={loading}
            />
          </div>

          <EmployeeModal
            isOpen={modalState?.isOpen}
            onClose={handleCloseModal}
            employee={modalState?.employee}
            mode={modalState?.mode}
            onSave={handleSaveEmployee}
          />
        </div>
      </main>
    </div>
  );
};

export default EmployeeManagement;