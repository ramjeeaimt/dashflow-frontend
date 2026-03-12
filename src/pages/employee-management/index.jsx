import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import EmployeeTable from './components/EmployeeTable';
import EmployeeFilters from './components/EmployeeFilters';
import EmployeeActions from './components/EmployeeActions';
import EmployeeModal from './components/EmployeeModal';
import employeeService from '../../services/employeeService';
import attendanceService from '../../services/attendanceService';
import useAuthStore from '../../store/useAuthStore';

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
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuthStore();

  // Fetch employees on mount and when filters change
  useEffect(() => {
    // Only fetch if user is loaded and authenticated
    if (isAuthenticated && user && user.id) {
      fetchEmployees();
    }
  }, [filters, user, isAuthenticated]);

  const fetchEmployees = async () => {
    // Don't fetch if user not loaded yet
    if (!isAuthenticated || !user || !user.id) {
      console.log('[EmployeeManagement] Waiting for user data/auth...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[EmployeeManagement] Fetching employees for company:', user?.company?.id);

      const filterParams = {
        ...filters,
        companyId: user?.company?.id,
        search: searchTerm
      };
      const data = await employeeService.getAll(filterParams);

      console.log('[EmployeeManagement] Raw API response:', data);
      console.log('[EmployeeManagement] Is array?', Array.isArray(data));

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('[EmployeeManagement] API did not return an array:', data);
        setEmployees([]);
        setError('Invalid response from server. Please try again.');
        return;
      }

      // Transform data to match frontend format
      const transformedData = data.map(emp => ({
        id: emp.id,
        name: `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim() || emp.user?.email,
        email: emp.user?.email,
        phone: emp.user?.phone,
        department: emp.department?.name || emp.departmentId,
        role: emp.role,
        status: emp.status,
        hireDate: emp.hireDate,
        manager: emp.manager,
        branch: emp.branch,
        employmentType: emp.employmentType,
        salary: emp.salary,
        avatar: emp.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.user?.firstName + ' ' + emp.user?.lastName)}&background=random`,
        address: emp.address,
        emergencyContact: emp.emergencyContact,
        emergencyPhone: emp.emergencyPhone,
        skills: emp.skills || [],
        userId: emp.userId,
        companyId: emp.companyId,
        departmentId: emp.department?.id || emp.departmentId,
        roleIds: emp.user?.roles?.map(r => r.id) || []
      }));

      setEmployees(transformedData);
      console.log('[EmployeeManagement] Loaded', transformedData.length, 'employees');
    } catch (err) {
      console.error('Error fetching employees:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load employees. Please try again.');
      setEmployees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter((employee) => {
      const matchesSearch = searchTerm === '' ||
        employee?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        employee?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        employee?.id?.toString()?.includes(searchTerm);

      return matchesSearch;
    });

    // Sort employees
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

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employee Management', path: '/employee-management' }
  ];

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
    setModalState({
      isOpen: true,
      mode: 'add',
      employee: null
    });
  };

  const handleEditEmployee = (employee) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      employee
    });
  };

  const handleViewEmployee = (employee) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      employee
    });
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.delete(employeeId);
        await fetchEmployees(); // Refresh list
        alert('Employee deleted successfully');
      } catch (err) {
        console.error('Error deleting employee:', err);

        // Detailed message for frontend
        const message =
          err.response?.data?.message || // agar backend JSON me message bheje
          err.response?.data ||          // ya pura response object
          err.message ||                 // AxiosError ka message
          'Failed to delete employee.';

        alert(`Failed to delete employee: ${message}`);
      }
    }
  };
  const handleBulkAction = async (action, employeeIds) => {
    console.log('Bulk action:', action, 'for employees:', employeeIds);

    if (action === 'bulk-check-in') {
      try {
        const notes = prompt('Enter notes for bulk check-in (optional):');
        await attendanceService.bulkCheckIn(employeeIds, notes);
        alert('Bulk check-in successful!');
        setSelectedEmployees([]);
      } catch (error) {
        console.error('Bulk check-in failed:', error);
        alert('Failed to process bulk check-in. Please try again.');
      }
    } else {
      // Implement other bulk actions as needed
      setSelectedEmployees([]);
    }
  };

  const handleImportEmployees = (file) => {
    console.log('Importing employees from file:', file?.name);
    // Implement CSV import
  };

  const handleExportEmployees = () => {
    console.log('Exporting employees');
    // Implement CSV export
  };

  // const handleSaveEmployee = async (employeeData) => {
  //   try {
  //     console.log('Sending employee data:', employeeData);
  //     if (modalState.mode === 'add') {
  //       // await employeeService.create({

  //       //   email: employeeData.email,
  //       //   firstName: employeeData.firstName,
  //       //   lastName: employeeData.lastName,
  //       //   phone: employeeData.phone,
  //       //   password: 'Welcome123!',
  //       //   companyId: user?.company?.id,
  //       //   departmentId: employeeData.department,
  //       //   designationId: employeeData.designationId,
  //       //   roleIds: employeeData.roleIds,
  //       //   hireDate: employeeData.hireDate,
  //       //   salary: employeeData.salary,
  //       //   manager: employeeData.manager,
  //       //   branch: employeeData.branch,
  //       //   employmentType: employeeData.employmentType,
  //       //   status: employeeData.status || 'active',
  //       //   address: employeeData.address,
  //       //   emergencyContact: employeeData.emergencyContact,
  //       //   emergencyPhone: employeeData.emergencyPhone,
  //       //   skills: employeeData.skills
  //       // });
  //       await employeeService.create({
  //         firstName: employeeData.firstName,
  //         lastName: employeeData.lastName,
  //         email: employeeData.email,
  //         phone: employeeData.phone,
  //         password: 'Welcome123!',          // required
  //         companyId: user?.company?.id,    // ✅ ensure this exists
  //         departmentId: employeeData.department, // ✅ rename from department to departmentId
  //         roleIds: employeeData.roleIds || [],   // ✅ ensure array
  //         hireDate: employeeData.hireDate,
  //         salary: employeeData.salary || '',
  //         manager: employeeData.manager || '',
  //         branch: employeeData.branch || '',
  //         employmentType: employeeData.employmentType || '',
  //         status: employeeData.status || 'active',
  //         address: employeeData.address || '',
  //         emergencyContact: employeeData.emergencyContact || '',
  //         emergencyPhone: employeeData.emergencyPhone || '',
  //         skills: employeeData.skills || [],
  //       });
  //     } else if (modalState.mode === 'edit') {
  //       await employeeService.update(modalState.employee.id, {
  //         firstName: employeeData.firstName,
  //         lastName: employeeData.lastName,
  //         departmentId: employeeData.department,
  //         designationId: employeeData.designationId,
  //         roleIds: employeeData.roleIds,
  //         hireDate: employeeData.hireDate,
  //         salary: employeeData.salary,
  //         manager: employeeData.manager,
  //         branch: employeeData.branch,
  //         employmentType: employeeData.employmentType,
  //         status: employeeData.status,
  //         address: employeeData.address,
  //         emergencyContact: employeeData.emergencyContact,
  //         emergencyPhone: employeeData.emergencyPhone,
  //         skills: employeeData.skills
  //       });
  //     }

  //     await fetchEmployees(); // Refresh list
  //     handleCloseModal();
  //   } catch (err) {
  //     console.error('Error saving employee:', err);
  //     throw new Error('Failed to save employee. Please try again.');
  //   }
  // };

  const handleSaveEmployee = async (employeeData) => {
    console.log('Sending employee data:', employeeData);

    try {
      const payload = {
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        password: 'Welcome123!',
        companyId: user?.company?.id || '',
        departmentId: employeeData.department || '',
        role: employeeData.roleIds?.[0] || '', // take first role as string
        hireDate: employeeData.hireDate || new Date().toISOString(),
        salary: employeeData.salary || '',
        manager: employeeData.manager || '',
        branch: employeeData.branch || '',
        employmentType: employeeData.employmentType || '',
        status: employeeData.status || 'active',
        address: employeeData.address || '',
        emergencyContact: employeeData.emergencyContact || '',
        emergencyPhone: employeeData.emergencyPhone || '',
        skills: employeeData.skills || []
      };

      console.log('Payload sent to backend:', payload);

      if (modalState.mode === 'add') {
        await employeeService.create(payload);
      } else if (modalState.mode === 'edit') {
        await employeeService.update(modalState.employee.id, payload);
      }

      await fetchEmployees(); // Refresh list
      handleCloseModal();
    } catch (err) {
      console.error('Error saving employee:', err);
      throw new Error('Failed to save employee. Please try again.');
    }
  };
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'view',
      employee: null
    });
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

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
        <div className="p-6">
          <BreadcrumbNavigation items={breadcrumbItems} />

          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Employee Management</h1>
            <p className="text-muted-foreground">
              Manage your workforce, track employee information, and handle HR operations efficiently.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>{error}</p>
              <button onClick={fetchEmployees} className="mt-2 text-sm underline">
                Try again
              </button>
            </div>
          )}

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