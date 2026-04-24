import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import TaskFilters from '../components/TaskFilters';
import TaskTable from '../components/TaskTable';
import TaskAnalytics from '../components/TaskAnalytics';
import TaskModal from '../components/TaskModal';
import TaskDetailPanel from '../components/TaskDetailPanel';

import { employeeService } from '../../../services/employee.service';
import { taskService } from '../../../services/project.service';
import useAuthStore from '../../../store/useAuthStore';

const TaskManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const { user } = useAuthStore();

  const fetchData = async () => {
    if (!user?.company?.id) return;
    setIsLoading(true);
    try {
      const [fetchedTasks, fetchedEmployees] = await Promise.all([
        taskService.getAllByCompany(user.company.id),
        employeeService.getAll(user.company.id)
      ]);
      const tasksArray = Array.isArray(fetchedTasks) ? fetchedTasks : (fetchedTasks?.data || []);
      setTasks(tasksArray);
      setFilteredTasks(tasksArray);
      const formattedEmployees = (fetchedEmployees || []).map(emp => ({
        id: emp.id,
        name: `${emp.user?.firstName} ${emp.user?.lastName}`,
        department: emp.department?.name || 'N/A',
        avatar: emp.user?.avatar
      }));
      setEmployees(formattedEmployees);

    } catch (error) {
      console.error('Failed to fetch tasks/employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Task Management', path: '/task-management' }];


  const handleFiltersChange = (filters) => {
    let filtered = [...tasks];

    // Search filter
    if (filters?.search) {
      filtered = filtered?.filter((task) =>
        task?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        task?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        task?.assignee?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    // Priority filter
    if (filters?.priority) {
      filtered = filtered?.filter((task) => task?.priority === filters?.priority);
    }

    // Status filter
    if (filters?.status) {
      filtered = filtered?.filter((task) => task?.status === filters?.status);
    }

    // Department filter
    if (filters?.department) {
      filtered = filtered?.filter((task) =>
        task?.assignee?.department?.toLowerCase() === filters?.department?.toLowerCase()
      );
    }

    // Date range filter
    if (filters?.dateRange) {
      const now = new Date();
      filtered = filtered?.filter((task) => {
        const dueDate = new Date(task.dueDate);
        switch (filters?.dateRange) {
          case 'today':
            return dueDate?.toDateString() === now?.toDateString();
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return dueDate >= now && dueDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            return dueDate >= now && dueDate <= monthFromNow;
          case 'overdue':
            return task?.status !== 'completed' && dueDate < now;
          default:
            return true;
        }
      });
    }

    setFilteredTasks(filtered);
  };

  const handleTaskSelect = (taskIds) => {
    setSelectedTasks(taskIds);
  };

  const handleBulkAction = (action, value) => {
    const updatedTasks = tasks?.map((task) => {
      if (selectedTasks?.includes(task?.id)) {
        switch (action) {
          case 'priority':
            return { ...task, priority: value };
          case 'status':
            return { ...task, status: value, progress: value === 'completed' ? 100 : task?.progress };
          case 'delete':
            return null;
          default:
            return task;
        }
      }
      return task;
    })?.filter(Boolean);

    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    setSelectedTasks([]);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskSave = async (taskData) => {
    setIsLoading(true);
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await taskService.update(editingTask.id, taskData);
        // Optimistically update local state or re-fetch
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setFilteredTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setEditingTask(null);
      } else {
        const payload = { ...taskData };
        if (user?.company?.id) {
          payload.companyId = user.company.id; // Just in case backend uses it
        }

        const newTask = await taskService.create(payload);
        setTasks(prev => [newTask, ...prev]);
        setFilteredTasks(prev => [newTask, ...prev]);
      }
      setIsTaskModalOpen(false);
      // Optionally refresh all data to be safe
      fetchData();
    } catch (error) {
      console.error("Failed to save task", error);
      // You might want to show an error notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    const updatedTasks = tasks?.map((task) =>
      task?.id === updatedTask?.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    setSelectedTask(updatedTask);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };


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
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center">
                <Icon name="Loader2" size={40} className="text-primary animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">Loading tasks...</p>
                <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
              </div>
            </div>
          ) : (
            <>
              <BreadcrumbNavigation items={breadcrumbItems} />

          {/* Industrial Header Block - Cleansed */}
          

        {/* Filters */}
        <TaskFilters
          onFiltersChange={handleFiltersChange}
          totalTasks={tasks?.length}
          filteredTasks={filteredTasks?.length} />


        {/* Main Content */}
        {showAnalytics ?
          <TaskAnalytics tasks={filteredTasks} /> :

          <TaskTable
            tasks={filteredTasks}
            onTaskSelect={handleTaskSelect}
            onBulkAction={handleBulkAction}
            selectedTasks={selectedTasks}
            onTaskClick={handleTaskClick} />

        }

        {/* Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleTaskSave}
          task={editingTask}
          employees={employees} />


        {/* Task Detail Panel */}
        {selectedTask &&
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            onDelete={(task) => {
              const updatedTasks = tasks?.filter((t) => t?.id !== task?.id);
              setTasks(updatedTasks);
              setFilteredTasks(updatedTasks);
              setSelectedTask(null);
            }} 
          />
        }
      </>
    )}
        </div>
      </main>
    </div>);

};

export default TaskManagement;