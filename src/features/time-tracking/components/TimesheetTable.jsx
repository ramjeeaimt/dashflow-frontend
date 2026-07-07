import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const TimesheetTable = ({ entries, onEditEntry, onDeleteEntry }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const mockEntries = [
    {
      id: 1,
      date: '2025-10-19',
      task: 'Software Development',
      project: 'CRM System',
      startTime: '09:00 AM',
      endTime: '12:30 PM',
      duration: '3h 30m',
      breakTime: '15m',
      productivityScore: 92,
      status: 'approved',
      description: 'Implemented user authentication module with JWT tokens and role-based access control',
      screenshots: 12
    },
    {
      id: 2,
      date: '2025-10-19',
      task: 'Team Meeting',
      project: 'CRM System',
      startTime: '02:00 PM',
      endTime: '03:00 PM',
      duration: '1h 00m',
      breakTime: '0m',
      productivityScore: 85,
      status: 'pending',
      description: 'Weekly sprint planning and task assignment discussion',
      screenshots: 4
    },
    {
      id: 3,
      date: '2025-10-18',
      task: 'Code Review',
      project: 'HRM Module',
      startTime: '10:30 AM',
      endTime: '11:45 AM',
      duration: '1h 15m',
      breakTime: '5m',
      productivityScore: 88,
      status: 'approved',
      description: 'Reviewed employee management components and provided feedback',
      screenshots: 8
    },
    {
      id: 4,
      date: '2025-10-18',
      task: 'Documentation',
      project: 'API Documentation',
      startTime: '03:15 PM',
      endTime: '05:00 PM',
      duration: '1h 45m',
      breakTime: '10m',
      productivityScore: 76,
      status: 'rejected',
      description: 'Updated API documentation for authentication endpoints',
      screenshots: 6
    },
    {
      id: 5,
      date: '2025-10-17',
      task: 'Quality Testing',
      project: 'CRM System',
      startTime: '09:30 AM',
      endTime: '12:00 PM',
      duration: '2h 30m',
      breakTime: '20m',
      productivityScore: 94,
      status: 'approved',
      description: 'Comprehensive testing of user registration and login workflows',
      screenshots: 15
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'rejected': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getProductivityColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-destructive';
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredEntries = mockEntries?.filter(entry => {
    const matchesStatus = filterStatus === 'all' || entry?.status === filterStatus;
    const matchesSearch = entry?.task?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         entry?.project?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         entry?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedEntries = [...filteredEntries]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    
    if (sortField === 'productivityScore') {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const totalHours = mockEntries?.reduce((total, entry) => {
    const [hours, minutes] = entry?.duration?.replace('h', '')?.replace('m', '')?.split(' ');
    return total + parseInt(hours) + (parseInt(minutes) || 0) / 60;
  }, 0);

  const averageProductivity = mockEntries?.reduce((sum, entry) => sum + entry?.productivityScore, 0) / mockEntries?.length;

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Timesheet Entries</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your work hours and productivity
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Input
              type="search"
              placeholder="Search tasks, projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full sm:w-64"
            />
            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Filter by status"
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Total Hours</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalHours?.toFixed(1)}h
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <span className="text-sm font-medium text-foreground">Avg Productivity</span>
            </div>
            <p className="text-2xl font-bold text-success mt-1">
              {averageProductivity?.toFixed(0)}%
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm font-medium text-foreground">Approved</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">
              {mockEntries?.filter(e => e?.status === 'approved')?.length}
            </p>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Date</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Task & Project</th>
              <th className="text-left p-4 font-medium text-foreground">Time</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('productivityScore')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Productivity</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Status</th>
              <th className="text-left p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries?.map((entry) => (
              <tr key={entry?.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(entry.date)?.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry?.startTime} - {entry?.endTime}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry?.task}</p>
                    <p className="text-xs text-muted-foreground">{entry?.project}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {entry?.description}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry?.duration}</p>
                    <p className="text-xs text-muted-foreground">Break: {entry?.breakTime}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Icon name="Camera" size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{entry?.screenshots} shots</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getProductivityColor(entry?.productivityScore)?.replace('text-', 'bg-')}`}></div>
                    <span className={`text-sm font-medium ${getProductivityColor(entry?.productivityScore)}`}>
                      {entry?.productivityScore}%
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry?.status)}`}>
                    {entry?.status?.charAt(0)?.toUpperCase() + entry?.status?.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditEntry && onEditEntry(entry)}
                      iconName="Edit2"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEntry && onDeleteEntry(entry?.id)}
                      iconName="Trash2"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedEntries?.length} of {mockEntries?.length} entries
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="ChevronLeft">
              Previous
            </Button>
            <Button variant="outline" size="sm" iconName="ChevronRight">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetTable;