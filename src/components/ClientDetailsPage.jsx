import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, Building2, MapPin, Plus, Edit2, FileText, ExternalLink,
  MessageSquare, Eye, Trash2, PlusCircle, ArrowLeft, Loader2
} from 'lucide-react';
import { useClientStore } from '../store/useClientStore';
import useProjectStore from '../store/useProjectStore';
import Sidebar from './ui/Sidebar';
import Header from './ui/Header';
import InlineProjectForm from './InlineProjectForm';
import uploadService from '../features/upload/uploadService';
import ProjectDetailsModal from '../features/projects/components/ProjectDetailsModal';
import ProjectEditModal from '../features/projects/components/ProjectEditModal';

import useAuthStore from '../store/useAuthStore';

const ClientDetailsPage = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, fetchClients, updateClient } = useClientStore();
  const { projects, fetchProjects, deleteProject, createProject } = useProjectStore();
  const { user, isAuthenticated } = useAuthStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingInvoiceMessage, setEditingInvoiceMessage] = useState(false);
  const [tempInvoiceMessage, setTempInvoiceMessage] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProjectId, setViewProjectId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const promises = [];
        if (clients.length === 0) promises.push(fetchClients());
        if (projects.length === 0 && user?.company?.id) promises.push(fetchProjects(user.company.id));

        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } catch (err) {
        console.error("Error loading client details data:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (user?.company?.id || !isAuthenticated) {
      loadInitialData();
    }
  }, [user?.company?.id, fetchClients, fetchProjects, clients.length, projects.length, isAuthenticated]);

  const client = useMemo(() => {
    // 1. Try to find a real client
    const realClient = clients.find(c => c.id === id || c.clientId === id);
    if (realClient) {
      return {
        ...realClient,
        clientProjects: projects.filter(p => (p.clientEmail || '').toLowerCase() === (realClient.email || '').toLowerCase())
      };
    }

    // 2. Try to find a project acting as a virtual client
    const projectAsClient = projects.find(p => p.id === id);
    if (projectAsClient) {
      return {
        id: projectAsClient.id,
        clientId: null,
        type: 'Virtual',
        name: projectAsClient.clientName || 'Unknown',
        email: projectAsClient.clientEmail,
        company: projectAsClient.clientDetails?.companyName || 'Contractual',
        phone: projectAsClient.contactInfo || '',
        status: 'Active',
        clientProjects: projects.filter(p => (p.clientEmail || '').toLowerCase() === (projectAsClient.clientEmail || '').toLowerCase())
      };
    }

    return null;
  }, [clients, projects, id]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-sm text-slate-500 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-slate-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Entity Not Found</h2>
          <p className="text-slate-500 mb-6 text-sm">We couldn't find the client or project details you're looking for. It may have been moved or deleted.</p>
          <button
            onClick={() => navigate('/client-management')}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateInvoiceMessage = async () => {
    setIsSubmitting(true);
    try {
      await updateClient(client.id, { invoiceMessage: tempInvoiceMessage });
      setEditingInvoiceMessage(false);
      fetchClients();
    } catch (err) {
      alert("Failed to update message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInlineProjectCreate = async (projectData) => {
    setIsSubmitting(true);
    try {
      await createProject({ ...projectData, clientId: client.id, clientEmail: client.email, clientName: client.name });
      setIsProjectFormOpen(false);
      fetchProjects();
    } catch (err) {
      alert("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(projId);
      fetchProjects();
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 pt-24 overflow-y-auto px-4 sm:px-6 md:px-8 py-8">
          <button
            onClick={() => navigate('/client-management')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Network</span>
          </button>

          <div className="bg-white border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm overflow-hidden bg-gray-100 border border-gray-200">
                {client.logo ? (
                  <img src={client.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-600">
                    {client.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-slate-500">
                  <span className="text-sm">{client.email}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm">{client.company}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column */}
            <div className="lg:w-1/3 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Details</h4>
                <div className="space-y-4">
                  {client.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-slate-600">{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 size={16} className="text-slate-400" />
                    <span className="text-slate-600">{client.company}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                    <span className="text-slate-600 leading-tight">
                      {client.address || 'Address not set'}<br />
                      {client.city}, {client.state} {client.pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documents</h4>
                  <label className="cursor-pointer p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <Plus size={14} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          setIsSubmitting(true);
                          const res = await uploadService.uploadDocument(file);
                          const updatedDocs = [...(client.documents || []), res.url];
                          await updateClient(client.id, { documents: updatedDocs });
                          fetchClients();
                        } catch (err) { alert("Upload failed"); }
                        finally { setIsSubmitting(false); }
                      }}
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  {client.documents && client.documents.length > 0 ? client.documents.map((doc, idx) => (
                    <a key={idx} href={doc} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 transition-all text-xs text-blue-600 font-semibold group">
                      <FileText size={16} />
                      <span className="truncate flex-1">Supporting Document {idx + 1}</span>
                      <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-400" />
                    </a>
                  )) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">No documents attached.</p>
                  )}
                </div>
              </div>

              {/* Invoice Message Card */}
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={14} /> Invoice Message
                  </h5>
                  {!editingInvoiceMessage ? (
                    <button onClick={() => { setEditingInvoiceMessage(true); setTempInvoiceMessage(client.invoiceMessage || ''); }} className="text-[10px] font-bold text-blue-600 hover:underline">EDIT</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleUpdateInvoiceMessage} className="text-[10px] font-bold text-emerald-600">SAVE</button>
                      <button onClick={() => setEditingInvoiceMessage(false)} className="text-[10px] font-bold text-slate-400">ESC</button>
                    </div>
                  )}
                </div>
                {editingInvoiceMessage ? (
                  <textarea
                    value={tempInvoiceMessage}
                    onChange={(e) => setTempInvoiceMessage(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-blue-200 rounded-lg h-24 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-xs text-blue-700 italic leading-relaxed">
                    "{client.invoiceMessage || 'No default message set.'}"
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Projects */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Inventory</h5>
                  <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <FileText size={12} /> BATCH INVOICE
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                      {client.clientProjects?.length > 0 ? client.clientProjects.map(proj => (
                        <tr key={proj.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{proj.projectName}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{proj.description}</p>
                          </td>
                          <td className="py-4 px-2">
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-[9px] font-bold uppercase">{proj.phase}</span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <p className="text-sm font-bold text-slate-900">₹{proj.budget?.toLocaleString()}</p>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setViewProjectId(proj.id); setIsViewModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => { setEditProjectId(proj.id); setIsEditModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td className="py-12 text-center text-sm text-slate-400 italic">No active projects found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                  <div
                    onClick={() => setIsProjectFormOpen(true)}
                    className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/10 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <Plus size={28} />
                    </div>
                    <h6 className="text-base font-bold text-slate-900 mb-1">Add New Project</h6>
                    <p className="text-xs text-slate-500 mb-6">Initiate a new workflow for {client.name}</p>
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md">
                      <PlusCircle size={16} /> Create Project
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {isProjectFormOpen && (
        <InlineProjectForm
          client={client}
          onClose={() => setIsProjectFormOpen(false)}
          onSubmit={handleInlineProjectCreate}
          isSubmitting={isSubmitting}
        />
      )}

      {isViewModalOpen && (
        <ProjectDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          projectId={viewProjectId}
        />
      )}

      {isEditModalOpen && (
        <ProjectEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          projectId={editProjectId}
          onUpdate={() => { fetchProjects(); setIsEditModalOpen(false); }}
        />
      )}
    </div>
  );
};

export default ClientDetailsPage;
