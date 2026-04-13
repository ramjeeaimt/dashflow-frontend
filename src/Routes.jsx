// import ErrorBoundary from "./components/ErrorBoundary";
// import ScrollToTop from "./components/ScrollToTop";
// import Dashboard from "./pages/dashboard";
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
// import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./features/misc/pages/NotFoundPage";
import CompanyRegistration from './features/company/pages/CompanyRegistrationPage';
import TaskManagement from './features/tasks/pages/TaskManagementPage';
import Dashboard from './features/dashboard/pages/DashboardPage';
import EmployeeManagement from './features/employee/pages/EmployeeManagementPage';
import TimeTrackingPage from './features/time-tracking/pages/TimeTrackingPage';
import MonitoringDashboard from './features/monitoring/pages/MonitoringPage';
import AttendanceManagement from './features/attendance/pages/AttendanceManagementPage';
import JobPostPage from './features/jobs/pages/JobPostPage';
import EmployeeCheckInCheckOut from './features/employee/pages/CheckInCheckOutPage';
import AttendanceAnalytics from './features/attendance/pages/AttendanceAnalyticsPage';
import ScrollToTop from "./components/ScrollToTop";
import Login from './features/auth/pages/LoginPage';
import EmployeeDashboard from './features/employee/pages/EmployeeDashboardPage';
import Profile from "./features/profile/pages/ProfilePage";
import LandingPage from './features/landing/pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import CompanyProfile from './features/company/pages/CompanyProfilePage';
import RolesManagement from './features/settings/pages/RolesManagementPage';
import PayrollPage from './features/payroll/pages/PayrollPage';
import AddProject from "./features/projects/pages/AddProjectPage";
import Project from "./features/projects/pages/ProjectListPage";
import ProjectDetails from "./features/projects/pages/ProjectDetailsPage";
import ProjectEdit from "./features/projects/pages/ProjectEditPage";
import PrivacyPolicy from "features/landing/pages/PrivacyPolicy";
import FinanceDashboard from './features/finance/pages/FinanceDashboardPage';

import Pricing from "features/landing/pages/Pricing";
import FeaturesPage from "features/landing/pages/FeaturesPage";
import { EmployeeModal } from "features/employee";
import LeaveForm from "features/employee/pages/LeaveForm";
// import EmployeePayroll from "features/employee/pages/EmployeePayroll";
import EmployeePayrollPage from "features/payroll/pages/EmployeePayrollPage";
import AdminLeaveManagement from "features/employee/pages/AdminLeaveManagement";
import ClientAdmin from "components/ClientAdmin";
import EmployeeAttendanceHistoryPage from "features/attendance/components/EmployeeAttandece";
import IndividualEmployeeAttendance from "features/attendance/components/EmployeeAttandece";
import NotificationsPage from "features/notifications/pages/NotificationsPage";


const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy/>}/>
          <Route path="/pricing" element={<Pricing/>}/>
          <Route path="/features" element={<FeaturesPage/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/company-registration" element={<CompanyRegistration />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee-dashboard" element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>

          } />
          <Route path="/employee/leaves" element={
            <ProtectedRoute>
              <LeaveForm/>
            </ProtectedRoute>
          }/>

           <Route path="/employee/payroll" element={
            <ProtectedRoute>
              <EmployeePayrollPage/>
            </ProtectedRoute>
          }/>

          <Route path="/task-management" element={
            <ProtectedRoute>
              <TaskManagement />
            </ProtectedRoute>
          } />
          <Route path="/employee-management" element={
            <ProtectedRoute>
              <EmployeeManagement />
            </ProtectedRoute>
          } />

           <Route path="/employee-leave" element={
            <ProtectedRoute>
              <AdminLeaveManagement />
            </ProtectedRoute>
          } />

          <Route path="/client-management" element={
            <ProtectedRoute>
              <ClientAdmin />
            </ProtectedRoute>
          } />

          


          <Route path="/add-new-employee" element={
            <ProtectedRoute>
              <EmployeeModal />
            </ProtectedRoute>
          } />
          <Route path="/time-tracking" element={
            <ProtectedRoute>
              <TimeTrackingPage />
            </ProtectedRoute>
          } />
          <Route path="/monitoring-dashboard" element={
            <ProtectedRoute>
              <MonitoringDashboard />
            </ProtectedRoute>
          } />
          <Route path="/attendance-management" element={
            <ProtectedRoute>
              <AttendanceManagement />
            </ProtectedRoute>
          } />

           <Route path="/employee-attendance" element={
            <ProtectedRoute>
              <IndividualEmployeeAttendance />
            </ProtectedRoute>
          } />

          <Route path="/employee-check-in-check-out" element={
            <ProtectedRoute>
              <EmployeeCheckInCheckOut />
            </ProtectedRoute>
          } />
          <Route path="/attendance-analytics" element={
            <ProtectedRoute>
              <AttendanceAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/company-profile" element={
            <ProtectedRoute>
              <CompanyProfile />
            </ProtectedRoute>
          } />

          
          <Route path="/payroll" element={
            <ProtectedRoute>
              <PayrollPage />
            </ProtectedRoute>
          } />
          <Route path="/settings/roles" element={
            <ProtectedRoute>
              <RolesManagement />
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <Project/>
            </ProtectedRoute>
          }
          />
          <Route path="/difmo-jobs" element={
            <ProtectedRoute>
              <JobPostPage />
            </ProtectedRoute>
          } />
          <Route path="/add-project" element={
            <ProtectedRoute>
              <AddProject/>
            </ProtectedRoute>
          }/>
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/project-details/:id" element={
            <ProtectedRoute>
              <ProjectDetails/>
            </ProtectedRoute>

          }/>

          <Route path="/edit-project/:id" element={
            <ProtectedRoute>
              <ProjectEdit/>
            </ProtectedRoute>
          }
          />
          <Route path="/finance" element={
            <ProtectedRoute>
              <FinanceDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
