import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import apiClient from 'api/client';
import { API_ENDPOINTS } from 'api/endpoints';

const TYPE_COLORS = {
  'Full-time': 'bg-blue-50 text-blue-700 border-blue-200',
  'Part-time': 'bg-amber-50 text-amber-700 border-amber-200',
  'Internship': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Contract': 'bg-purple-50 text-purple-700 border-purple-200',
};

const STATUS_CONFIG = {
  Active: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Paused: { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Closed: { cls: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
};

const EMPTY_FORM = { title: '', department: '', location: '', type: 'Full-time', experience: '', salary: '', description: '', responsibilities: '', requirements: '', applicationStartDate: '', applicationEndDate: '', isActive: true };

export default function JobsTab({ setActiveTab }) {
  const [jobs, setJobs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [editingJob, setEditingJob] = useState(null); // New: for edit mode
  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await apiClient.get(API_ENDPOINTS.JOBS.BASE);
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  }

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchQ = !q || j.title.toLowerCase().includes(q) || (j.department || j.dept || '').toLowerCase().includes(q);
    const matchS = filterStatus === 'All' || (j.isActive ? 'Active' : 'Paused') === filterStatus;
    const matchT = filterType === 'All' || j.type === filterType;
    return matchQ && matchS && matchT;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        department: form.department,
        location: form.location,
        type: form.type,
        experience: form.experience,
        salary: form.salary,
        description: form.description,
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        responsibilities: form.responsibilities ? (Array.isArray(form.responsibilities) ? form.responsibilities : form.responsibilities.split(',').map(s => s.trim())) : [],
        requirements: form.requirements ? (Array.isArray(form.requirements) ? form.requirements : form.requirements.split(',').map(s => s.trim())) : [],
        applicationStartDate: form.applicationStartDate || null,
        applicationEndDate: form.applicationEndDate || null,
        isActive: !!form.isActive,
      };

      if (editingJob) {
        await apiClient.patch(API_ENDPOINTS.JOBS.BY_ID(editingJob.id || editingJob._id), payload);
      } else {
        await apiClient.post(API_ENDPOINTS.JOBS.BASE, payload);
      }

      await fetchJobs();
      setIsOpen(false);
      setEditingJob(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('Job submission failed', err);
    }
  }

  function handleEdit(job) {
    setEditingJob(job);
    setForm({
      ...job,
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join(', ') : (job.responsibilities || ''),
      requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : (job.requirements || ''),
      applicationStartDate: job.applicationStartDate ? job.applicationStartDate.split('T')[0] : '',
      applicationEndDate: job.applicationEndDate ? job.applicationEndDate.split('T')[0] : '',
      isActive: job.isActive ?? true
    });
    setIsOpen(true);
  }

  async function toggleStatus(id) {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    try {
      await apiClient.patch(API_ENDPOINTS.JOBS.BY_ID(id), { isActive: !job.isActive });
      await fetchJobs();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  function confirmDelete(id) { setDeleteId(id); }
  async function doDelete() {
    try {
      await apiClient.delete(API_ENDPOINTS.JOBS.BY_ID(deleteId));
      await fetchJobs();
      setDeleteId(null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.isActive).length,
    paused: jobs.filter(j => !j.isActive).length,
    totalApplicants: jobs.reduce((s, j) => s + (j.applicants || 0), 0),
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Job Postings</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage and track all active job listings</p>
        </div>
        <button
          onClick={() => { setEditingJob(null); setForm(EMPTY_FORM); setIsOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Icon name="Plus" size="16" />
          Post New Job
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {[
          { label: 'Total Postings', value: stats.total, icon: 'Briefcase', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Jobs', value: stats.active, icon: 'CheckCircle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Paused Jobs', value: stats.paused, icon: 'PauseCircle', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Applicants', value: stats.totalApplicants, icon: 'Users', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={s.icon} size="18" className={s.color} />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-in fade-in duration-700">
        <div className="relative flex-1">
          <Icon name="Search" size="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search job title or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Paused</option>
          <option>Closed</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer"
        >
          <option>All Types</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Internship</option>
          <option>Contract</option>
        </select>
      </div>

      {/* Job Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-gray-200 rounded-lg animate-in fade-in duration-500">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
            <Icon name="Briefcase" size="24" className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No jobs match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in duration-500">
          {filtered.map((job, idx) => {
            const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG.Active;
            const tc = TYPE_COLORS[job.type] || TYPE_COLORS['Full-time'];
            return (
              <div
                key={job.id || job._id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Icon name="Briefcase" size="18" className="text-blue-600" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${job.isActive ? STATUS_CONFIG.Active.cls : STATUS_CONFIG.Paused.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${job.isActive ? STATUS_CONFIG.Active.dot : STATUS_CONFIG.Paused.dot}`} />
                    {job.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <h3 className="text-base font-medium text-gray-800 mb-0.5 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{job.department || job.dept}</p>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon name="MapPin" size="12" className="opacity-60" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon name="Clock" size="12" className="opacity-60" />
                    <span>{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon name="DollarSign" size="12" className="opacity-60" />
                    <span>{job.salary || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon name="CalendarDays" size={12} className="opacity-60" />
                    <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 border-t border-gray-100 pt-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tc}`}>{job.type}</span>
                  <div className="flex items-center gap-1">
                    <Icon name="Users" size="12" className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-700">{job.applicants || 0}</span>
                    <span className="text-xs text-gray-400">applicants</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(job.id || job._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-transparent hover:border-gray-200"
                    title={job.isActive ? 'Pause' : 'Activate'}
                  >
                    <Icon name={job.isActive ? 'PauseCircle' : 'PlayCircle'} size="12" />
                    {job.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                    title="Edit Job"
                  >
                    <Icon name="Edit" size="12" />
                    Edit
                  </button>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors border border-transparent hover:border-violet-200"
                    title="View Applications"
                  >
                    <Icon name="Users" size="12" />
                    Apps
                  </button>
                  <button
                    onClick={() => confirmDelete(job.id || job._id)}
                    className="p-1.5 text-xs font-medium rounded-md bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                    title="Delete Job"
                  >
                    <Icon name="Trash2" size="12" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Job Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{editingJob ? 'Update Job Posting' : 'Post New Job'}</h3>
                <p className="text-sm text-gray-500">{editingJob ? 'Correct the job details below' : 'Fill in the job details below'}</p>
              </div>
              <button type="button" onClick={() => { setIsOpen(false); setForm(EMPTY_FORM); setEditingJob(null); }} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                <Icon name="X" size="18" className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    required
                    placeholder="e.g. Senior React Developer"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    placeholder="e.g. Engineering"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    placeholder="e.g. Remote, Onsite · Pune"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
                  <input
                    placeholder="e.g. 2-4 years"
                    value={form.experience}
                    onChange={e => setForm({ ...form, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    placeholder="e.g. ₹8–12 LPA"
                    value={form.salary}
                    onChange={e => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities (comma separated)</label>
                  <input value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} placeholder="Develop frontend, Write APIs" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
                  <input value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} placeholder="MERN Stack, React" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Start</label>
                  <input type="date" value={form.applicationStartDate} onChange={e => setForm({ ...form, applicationStartDate: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application End</label>
                  <input type="date" value={form.applicationEndDate} onChange={e => setForm({ ...form, applicationEndDate: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} id="isActive" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Active / Visible</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 mt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsOpen(false); setForm(EMPTY_FORM); setEditingJob(null); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  {editingJob ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-sm p-6 text-center shadow-xl animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Icon name="Trash2" size="20" className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Remove Job Posting?</h3>
            <p className="text-sm text-gray-500 mb-6">This job and all its data will be permanently deleted.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="button" onClick={doDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
