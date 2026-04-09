import React, { useEffect, useState, useMemo } from 'react';
import {
  Send, Search, Plus, X, Loader2, Trash2, Users, TrendingUp,
  ChevronRight, Mail, Briefcase, PlusCircle, CheckCircle2,
  Globe, Phone, MapPin, Building2, DollarSign, ArrowRight, ArrowLeft,
  ShieldCheck, CreditCard, Layers, LayoutGrid, Calendar, Clock, FileText,
  Edit2, Save, Github, ExternalLink, Trash, Tag, FolderOpen, Link as LinkIcon, CheckSquare,
  UserPlus
} from 'lucide-react';
import { useClientStore } from '../store/useClientStore';
import Sidebar from './ui/Sidebar';
import Header from './ui/Header';
import { FaRupeeSign } from "react-icons/fa";
import useProjectStore from '../store/useProjectStore';
import useAuthStore from '../store/useAuthStore';
import InlineProjectForm from './InlineProjectForm';

const ClientAdmin = () => {
  const { clients, fetchClients, processInvoice, addClient, updateClient } = useClientStore();
  const { user, isAuthenticated } = useAuthStore();
  const { projects, fetchProjects, updateProject, createProject } = useProjectStore();

  // --- UI CONTROLS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false); // New state for inline project form
  const [selectedClientForProject, setSelectedClientForProject] = useState(null); // Selected client for new project
  const [expandedId, setExpandedId] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editData, setEditData] = useState({});
  const [editClientData, setEditClientData] = useState({});
  const [createBoth, setCreateBoth] = useState(false);

  // --- FORM STATES ---
  const [newClient, setNewClient] = useState({
    name: '', email: '', phone: '', company: '',
    address: '', city: '', state: '', pincode: '', country: 'India',
    status: 'Lead', source: 'LinkedIn', priority: 'Medium',
    budget: '', currency: 'INR', notes: ''
  });

  const [newProject, setNewProject] = useState({
    projectName: '',
    description: '',
    assigningDate: '',
    deadline: '',
    phase: 'Planning',
    status: 'active',
    totalPayment: '',
    paymentReceived: '',
    budget: '',
    githubLink: '',
    deploymentLink: '',
    contactInfo: '',
    clientEmail: '',
    clientName: ''
  });

  const [invoiceItems, setInvoiceItems] = useState([
    { service: '', isCustom: false, phase: 'Phase 1', quantity: 1, price: 0 }
  ]);
  const [gstNumber, setGstNumber] = useState('');
  const [invoiceCurrency, setInvoiceCurrency] = useState({ code: 'INR', symbol: '₹' });

  useEffect(() => {
    if (isAuthenticated && user?.company?.id) {
      fetchClients();
      if (fetchProjects) {
        fetchProjects(user.company.id);
      }
    }
  }, [isAuthenticated, user?.company?.id, fetchClients, fetchProjects]);

  // Group Projects by Client Email
  const getProjectsByClient = useMemo(() => {
    const projectMap = new Map();
    (projects || []).forEach(project => {
      const clientEmail = project.clientEmail;
      if (!projectMap.has(clientEmail)) {
        projectMap.set(clientEmail, []);
      }
      projectMap.get(clientEmail).push(project);
    });
    return projectMap;
  }, [projects]);

  // SEARCH & MERGE LOGIC
  const combinedData = useMemo(() => {
    const safeClients = Array.isArray(clients) ? clients : [];
    const clientList = safeClients.map(c => ({
      ...c,
      type: 'Client',
      searchKey: (c.name + c.email + c.company).toLowerCase(),
      projectDetails: null,
      clientProjects: getProjectsByClient.get(c.email) || [],
      clientDetails: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        address: c.address,
        city: c.city,
        state: c.state,
        pincode: c.pincode,
        country: c.country,
        status: c.status,
        source: c.source,
        priority: c.priority,
        budget: c.budget,
        currency: c.currency,
        notes: c.notes
      }
    }));

    const projectList = (projects || []).map(p => ({
      ...p,
      type: 'Project',
      name: p.projectName,
      email: p.clientEmail,
      company: p.clientDetails?.companyName || 'Contractual',
      searchKey: (p.projectName + p.clientEmail).toLowerCase(),
      projectDetails: {
        description: p.description,
        assigningDate: p.assigningDate,
        deadline: p.deadline,
        phase: p.phase,
        status: p.status,
        totalPayment: p.totalPayment,
        paymentReceived: p.paymentReceived,
        budget: p.budget,
        githubLink: p.githubLink,
        deploymentLink: p.deploymentLink,
        contactInfo: p.contactInfo,
        assignedPeople: p.assignedPeople,
        links: p.links,
        tasks: p.tasks,
        notes: p.notes
      }
    }));
    return [...clientList, ...projectList].filter(item => item.searchKey.includes(searchTerm.toLowerCase()));
  }, [clients, projects, searchTerm, getProjectsByClient]);

  const projectNamesList = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    return safeProjects.map(p => ({
      id: p.id,
      projectName: p.projectName,
      clientEmail: p.clientEmail,
      clientName: p.clientName,
      description: p.description,
      assigningDate: p.assigningDate,
      deadline: p.deadline,
      phase: p.phase,
      status: p.status,
      totalPayment: p.totalPayment,
      paymentReceived: p.paymentReceived,
      budget: p.budget,
      githubLink: p.githubLink,
      deploymentLink: p.deploymentLink,
      contactInfo: p.contactInfo,
      links: p.links,
      tasks: p.tasks,
      notes: p.notes
    }));
  }, [projects]);

  const clientNamesList = useMemo(() => {
    const safeClients = Array.isArray(clients) ? clients : [];
    return safeClients.map(c => ({ id: c.id, name: c.name, email: c.email }));
  }, [clients]);

  // Handle client selection from dropdown
  const handleClientSelect = (clientId) => {
    const selected = clientNamesList.find(c => c.id === clientId);
    if (selected) {
      setNewClient({
        ...newClient,
        name: selected.name,
        email: selected.email,
      });
      setNewProject({
        ...newProject,
        clientName: selected.name,
        clientEmail: selected.email
      });
    }
  };

  const handleProjectSelect = (projectId) => {
    const selected = projectNamesList.find(p => p.id === projectId);
    if (selected) {
      setEditData({
        id: selected.id,
        projectName: selected.projectName,
        description: selected.description || '',
        assigningDate: selected.assigningDate || '',
        deadline: selected.deadline || '',
        phase: selected.phase || 'Planning',
        status: selected.status || 'active',
        totalPayment: selected.totalPayment || 0,
        paymentReceived: selected.paymentReceived || 0,
        budget: selected.budget || 0,
        githubLink: selected.githubLink || '',
        deploymentLink: selected.deploymentLink || '',
        contactInfo: selected.contactInfo || '',
        clientEmail: selected.clientEmail || '',
        clientName: selected.clientName || '',
        links: selected.links || {},
        tasks: selected.tasks || [],
        notes: selected.notes || ''
      });
      setIsEditing(true);
    }
  };

  const handleClientEditSelect = (clientId) => {
    const selected = clientNamesList.find(c => c.id === clientId);
    if (selected) {
      const clientToEdit = clients.find(c => c.id === clientId);
      if (clientToEdit) {
        setEditClientData({
          id: clientToEdit.id,
          name: clientToEdit.name || '',
          email: clientToEdit.email || '',
          phone: clientToEdit.phone || '',
          company: clientToEdit.company || '',
          address: clientToEdit.address || '',
          city: clientToEdit.city || '',
          state: clientToEdit.state || '',
          pincode: clientToEdit.pincode || '',
          country: clientToEdit.country || 'India',
          status: clientToEdit.status || 'Lead',
          source: clientToEdit.source || 'LinkedIn',
          priority: clientToEdit.priority || 'Medium',
          budget: clientToEdit.budget || '',
          currency: clientToEdit.currency || 'INR',
          notes: clientToEdit.notes || ''
        });
        setIsEditingClient(true);
      }
    }
  };

  const handleUpdateProject = async () => {
    if (!updateProject || !user?.company?.id) {
      alert("Update project function is not available");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatePayload = {
        projectName: editData.projectName,
        description: editData.description,
        assigningDate: editData.assigningDate,
        deadline: editData.deadline,
        phase: editData.phase,
        status: editData.status,
        totalPayment: editData.totalPayment,
        paymentReceived: editData.paymentReceived,
        budget: editData.budget,
        githubLink: editData.githubLink,
        deploymentLink: editData.deploymentLink,
        contactInfo: editData.contactInfo,
        links: editData.links,
        tasks: editData.tasks,
        notes: editData.notes
      };

      await updateProject(editData.id, updatePayload, user.company.id);
      alert("Project updated successfully!");
      setIsEditing(false);
      setEditData({});
      if (fetchProjects && user?.company?.id) {
        fetchProjects(user.company.id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update project: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!updateClient) {
      alert("Update client function is not available");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatePayload = {
        name: editClientData.name,
        email: editClientData.email,
        phone: editClientData.phone,
        company: editClientData.company,
        address: editClientData.address,
        city: editClientData.city,
        state: editClientData.state,
        pincode: editClientData.pincode,
        country: editClientData.country,
        status: editClientData.status,
        source: editClientData.source,
        priority: editClientData.priority,
        budget: editClientData.budget,
        currency: editClientData.currency,
        notes: editClientData.notes
      };

      await updateClient(editClientData.id, updatePayload);
      alert("Client updated successfully!");
      setIsEditingClient(false);
      setEditClientData({});
      if (fetchClients) {
        fetchClients();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update client: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Handle inline project creation for specific client
  const handleInlineProjectCreate = async (projectData) => {
    if (!createProject || !user?.company?.id) {
      alert("Create project function is not available");
      return;
    }

    setIsSubmitting(true);
    try {
      const projectPayload = {
        ...projectData,
        companyId: user.company.id
      };

      console.log("Creating project for client:", projectPayload);
      await createProject(projectPayload, user.company.id);
      alert("Project created successfully!");

      // Close the form
      setIsProjectFormOpen(false);
      setSelectedClientForProject(null);

      // Refresh projects list
      if (fetchProjects && user?.company?.id) {
        await fetchProjects(user.company.id);
      }

    } catch (err) {
      console.error("Create project error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      alert(`Failed to create project: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async () => {
    if (!createProject || !user?.company?.id) {
      alert("Create project function is not available");
      return;
    }

    setIsSubmitting(true);
    try {
      const projectPayload = {
        projectName: newProject.projectName,
        description: newProject.description,
        assigningDate: newProject.assigningDate,
        deadline: newProject.deadline,
        phase: newProject.phase,
        status: newProject.status,
        totalPayment: Number(newProject.totalPayment) || 0,
        paymentReceived: Number(newProject.paymentReceived) || 0,
        budget: Number(newProject.budget) || 0,
        githubLink: newProject.githubLink,
        deploymentLink: newProject.deploymentLink,
        contactInfo: newProject.contactInfo,
        clientEmail: newProject.clientEmail || newClient.email,
        clientName: newProject.clientName || newClient.name,
        companyId: user.company.id
      };

      await createProject(projectPayload, user.company.id);
      alert("Project created successfully!");

      setNewProject({
        projectName: '',
        description: '',
        assigningDate: '',
        deadline: '',
        phase: 'Planning',
        status: 'active',
        totalPayment: '',
        paymentReceived: '',
        budget: '',
        githubLink: '',
        deploymentLink: '',
        contactInfo: '',
        clientEmail: '',
        clientName: ''
      });

      if (fetchProjects && user?.company?.id) {
        fetchProjects(user.company.id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create project: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBoth = async () => {
    if (!addClient || !createProject || !user?.company?.id) {
      alert("Required functions are not available");
      return;
    }

    setIsSubmitting(true);
    try {
      await addClient(newClient);
      await new Promise(resolve => setTimeout(resolve, 500));

      const projectPayload = {
        projectName: newProject.projectName,
        description: newProject.description,
        assigningDate: newProject.assigningDate,
        deadline: newProject.deadline,
        phase: newProject.phase,
        status: newProject.status,
        totalPayment: Number(newProject.totalPayment) || 0,
        paymentReceived: Number(newProject.paymentReceived) || 0,
        budget: Number(newProject.budget) || 0,
        githubLink: newProject.githubLink,
        deploymentLink: newProject.deploymentLink,
        contactInfo: newProject.contactInfo,
        clientEmail: newClient.email,
        clientName: newClient.name,
        companyId: user.company.id
      };

      await createProject(projectPayload, user.company.id);

      alert("Client and Project created successfully!");
      setIsClientModalOpen(false);
      setStep(1);
      setCreateBoth(false);
      setNewClient({
        name: '', email: '', phone: '', company: '',
        address: '', city: '', state: '', pincode: '', country: 'India',
        status: 'Lead', source: 'LinkedIn', priority: 'Medium',
        budget: '', currency: 'INR', notes: ''
      });
      setNewProject({
        projectName: '',
        description: '',
        assigningDate: '',
        deadline: '',
        phase: 'Planning',
        status: 'active',
        totalPayment: '',
        paymentReceived: '',
        budget: '',
        githubLink: '',
        deploymentLink: '',
        contactInfo: '',
        clientEmail: '',
        clientName: ''
      });
      if (fetchClients) fetchClients();
      if (fetchProjects && user?.company?.id) fetchProjects(user.company.id);
    } catch (err) {
      console.error(err);
      alert("Error creating client and project: " + (err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleClientEditChange = (field, value) => {
    setEditClientData({ ...editClientData, [field]: value });
  };

  const handleProjectChange = (field, value) => {
    setNewProject({ ...newProject, [field]: value });
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!addClient) {
      alert("Add client function is not available");
      return;
    }

    setIsSubmitting(true);
    try {
      await addClient(newClient);
      setIsClientModalOpen(false);
      setStep(1);
      setCreateBoth(false);
      setNewClient({
        name: '', email: '', phone: '', company: '',
        address: '', city: '', state: '', pincode: '', country: 'India',
        status: 'Lead', source: 'LinkedIn', priority: 'Medium',
        budget: '', currency: 'INR', notes: ''
      });
      if (fetchClients) fetchClients();
    } catch (err) {
      console.error(err);
      alert("Error adding client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedEntity || !processInvoice) {
      alert("Please select a client/project to invoice");
      return;
    }

    setIsSubmitting(true);
    try {
      let clientId, clientEmail, clientName;

      if (selectedEntity.type === 'Client') {
        clientId = selectedEntity.id;
        clientEmail = selectedEntity.email;
        clientName = selectedEntity.name;
      } else {
        clientEmail = selectedEntity.clientEmail || selectedEntity.email;
        clientName = selectedEntity.clientName || selectedEntity.name;
        const matchingClient = clients.find(c => c.email === clientEmail);
        clientId = matchingClient?.id || null;
      }

      const invoicePayload = {
        items: invoiceItems,
        total: subtotal,
        currency: invoiceCurrency.code,
        gstNumber: gstNumber,
        clientEmail: clientEmail,
        clientName: clientName,
        projectName: selectedEntity.type === 'Project' ? selectedEntity.name : null
      };

      if (clientId) {
        await processInvoice(clientId, invoicePayload);
      } else {
        await processInvoice(null, invoicePayload);
      }

      alert(`Invoice sent successfully to ${clientName || clientEmail}!`);
      setIsInvoiceModalOpen(false);
      setInvoiceItems([{ service: '', isCustom: false, phase: 'Phase 1', quantity: 1, price: 0 }]);
      setGstNumber('');
      setSelectedEntity(null);
    } catch (err) {
      console.error(err);
      alert("Failed to send invoice: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateInvItem = (idx, field, val) => {
    const updated = [...invoiceItems];
    if (field === 'service' && val === 'CUSTOM_ENTRY') {
      updated[idx].isCustom = true;
      updated[idx].service = '';
    } else {
      updated[idx][field] = val;
    }
    setInvoiceItems(updated);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { service: '', isCustom: false, phase: 'Phase 1', quantity: 1, price: 0 }]);
  };

  const removeInvoiceItem = (idx) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const subtotal = invoiceItems.reduce((acc, i) => acc + (i.quantity * i.price), 0);
  const taxAmount = subtotal * 0.18;
  const grandTotal = subtotal + taxAmount;

  const totalEntities = combinedData.length;
  const estimatedRevenue = subtotal;
  const activeWorkflows = projects?.length || 0;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header />

        <main className="flex-1 mt-16 overflow-y-auto px-6 py-8">
          {/* Stats Cards with Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Network Entities Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Network Entities</p>
                  <p className="text-3xl font-bold text-blue-900">{totalEntities}</p>
                  <p className="text-xs text-blue-600 mt-1">Clients & Projects</p>
                </div>
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Estimated Revenue Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wide">Revenue (MTD)</p>
                  <p className="text-3xl font-bold text-emerald-900">₹{estimatedRevenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-1">From Invoices</p>
                </div>
                <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FaRupeeSign size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Active Workflows Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wide">Active Workflows</p>
                  <p className="text-3xl font-bold text-purple-900">{activeWorkflows}</p>
                  <p className="text-xs text-purple-600 mt-1">Running Projects</p>
                </div>
                <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Header Section with Enhanced Styling */}
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-base text-gray-500 mt-2">Manage and track all your clients, projects, and business relationships in one place</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search clients, projects, emails..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => { setStep(1); setIsClientModalOpen(true); }}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus size={18} /> Add Client / Project
              </button>
            </div>
          </div>

          {/* List Section with Enhanced Cards */}
          {combinedData.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Entities Found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first client or project</p>
              <button
                onClick={() => { setStep(1); setIsClientModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} /> Add First Entity
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {combinedData.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${expandedId === item.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}
                >
                  <div className="p-5 flex items-center justify-between" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-md ${item.type === 'Project' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        }`}>
                        {item.type === 'Project' ? <Briefcase size={22} /> : item.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${item.type === 'Project' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{item.company || 'Direct Organization'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden lg:block text-right">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Projects</p>
                        <p className="text-lg font-bold text-gray-900">
                          {item.type === 'Client' ? (item.clientProjects?.length || 0) : '1'}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${expandedId === item.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <ChevronRight size={20} className={`transition-transform duration-300 ${expandedId === item.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </div>
                  {/* EXPANDED DETAILS SECTION */}
                  {expandedId === item.id && (
                    <div className="px-5 pb-5 pt-3 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
                      {item.type === 'Project' && item.projectDetails ? (
                        // PROJECT DETAILS SECTION
                        <div className="space-y-4 mt-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Complete Project Details</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedEntity(item);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-green-700 transition-colors"
                            >
                              <Send size={12} /> Send Invoice
                            </button>
                            <button
                              onClick={() => {
                                setEditData({
                                  id: item.id,
                                  projectName: item.name,
                                  description: item.projectDetails.description || '',
                                  assigningDate: item.projectDetails.assigningDate || '',
                                  deadline: item.projectDetails.deadline || '',
                                  phase: item.projectDetails.phase || 'Planning',
                                  status: item.projectDetails.status || 'active',
                                  totalPayment: item.projectDetails.totalPayment || 0,
                                  paymentReceived: item.projectDetails.paymentReceived || 0,
                                  budget: item.projectDetails.budget || 0,
                                  githubLink: item.projectDetails.githubLink || '',
                                  deploymentLink: item.projectDetails.deploymentLink || '',
                                  contactInfo: item.projectDetails.contactInfo || '',
                                  clientEmail: item.email || '',
                                  clientName: item.clientName || '',
                                  links: item.projectDetails.links || {},
                                  tasks: item.projectDetails.tasks || [],
                                  notes: item.projectDetails.notes || ''
                                });
                                setIsEditing(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                            >
                              <Edit2 size={12} /> Edit Project
                            </button>
                          </div>
                        </div>

                        {/* Basic Project Info */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                          <h5 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <FolderOpen size={16} className="text-blue-600" /> Project Information
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Project Name</p>
                              <p className="text-base font-bold text-blue-900">{item.name}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Phase</p>
                              <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                                {item.projectDetails.phase || 'Planning'}
                              </span>
                            </div>
                            {item.projectDetails.assigningDate && (
                              <div>
                                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Start Date</p>
                                <p className="text-base font-bold text-blue-900">
                                  {new Date(item.projectDetails.assigningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            )}
                            {item.projectDetails.deadline && (
                              <div>
                                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Deadline</p>
                                <p className="text-base font-bold text-red-600">
                                  {new Date(item.projectDetails.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {item.projectDetails.description && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-start gap-2">
                              <FileText size={14} className="text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-gray-700">Description</p>
                                <p className="text-sm text-gray-600 mt-1">{item.projectDetails.description}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Client Details */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Users size={12} /> Client Information
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500">Client Name</p>
                              <p className="text-sm font-medium text-gray-900">{item.clientName || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Client Email</p>
                              <p className="text-sm font-medium text-gray-900">{item.email || 'N/A'}</p>
                            </div>
                            {item.projectDetails.contactInfo && (
                              <div>
                                <p className="text-xs text-gray-500">Contact Info</p>
                                <p className="text-sm font-medium text-gray-900">{item.projectDetails.contactInfo}</p>
                              </div>
                            )}
                          </div>
                        </div>


                        

                        {/* Financial Details */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
                          <h5 className="text-sm font-bold text-emerald-900 mb-4 flex items-center gap-2">
                            <DollarSign size={16} className="text-emerald-600" /> Financial Summary
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {item.projectDetails.budget > 0 && (
                              <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Budget</p>
                                <p className="text-xl font-bold text-emerald-900">₹{item.projectDetails.budget.toLocaleString()}</p>
                              </div>
                            )}
                            {item.projectDetails.totalPayment > 0 && (
                              <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Total Payment</p>
                                <p className="text-xl font-bold text-emerald-900">₹{item.projectDetails.totalPayment.toLocaleString()}</p>
                              </div>
                            )}
                            {item.projectDetails.paymentReceived > 0 && (
                              <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                <p className="text-xs font-semibold text-green-600 uppercase mb-1">Payment Received</p>
                                <p className="text-xl font-bold text-green-700">₹{item.projectDetails.paymentReceived.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Assigned Employees Section */}
                        {editData.assignedEmployees && editData.assignedEmployees.length > 0 && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <h5 className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-1">
                              <Users size={12} /> Assigned Team Members
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {editData.assignedEmployees.map((employee, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-purple-200">
                                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-purple-600">
                                      {employee.name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-800">{employee.name}</p>
                                    <p className="text-xs text-gray-500">{employee.role || 'Team Member'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Assigned Employees in Edit Modal */}
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <label className="flex text-xs font-semibold text-purple-800 mb-2 items-center gap-1">
                            <Users size={12} /> Assigned Team Members
                          </label>
                          <div className="space-y-2">
                            {editData.assignedEmployees && editData.assignedEmployees.map((employee, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-purple-600">
                                      {employee.name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">{employee.name}</p>
                                    <p className="text-xs text-gray-500">{employee.role || 'Team Member'} • {employee.email}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedEmployees = editData.assignedEmployees.filter(e => e.id !== employee.id);
                                    handleEditChange('assignedEmployees', updatedEmployees);
                                  }}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                // Add logic to add new employee to edit form
                                const newEmployee = prompt("Enter employee name:");
                                if (newEmployee) {
                                  const updatedEmployees = [...(editData.assignedEmployees || []), { id: Date.now(), name: newEmployee, role: "Team Member" }];
                                  handleEditChange('assignedEmployees', updatedEmployees);
                                }
                              }}
                              className="text-purple-600 hover:text-purple-700 text-xs flex items-center gap-1"
                            >
                              <UserPlus size={12} /> Add Team Member
                            </button>
                          </div>
                        </div>

                        {/* Links Section */}
                        {(item.projectDetails.githubLink || item.projectDetails.deploymentLink) && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <LinkIcon size={12} /> Project Links
                            </h5>
                            <div className="flex gap-3">
                              {item.projectDetails.githubLink && (
                                <a href={item.projectDetails.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                                  <Github size={14} /> GitHub
                                </a>
                              )}
                              {item.projectDetails.deploymentLink && (
                                <a href={item.projectDetails.deploymentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                                  <ExternalLink size={14} /> Deployment
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="flex flex-wrap gap-4">
                          {item.projectDetails.status && (
                            <div>
                              <p className="text-xs text-gray-500">Project Status</p>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${item.projectDetails.status === 'active' ? 'bg-green-100 text-green-700' :
                                item.projectDetails.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                {item.projectDetails.status}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {item.projectDetails.notes && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            <div className="flex items-start gap-2">
                              <FileText size={14} className="text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-yellow-700">Additional Notes</p>
                                <p className="text-sm text-gray-700 mt-1">{item.projectDetails.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // CLIENT DETAILS SECTION with Multiple Projects and Add Project Button
                      <div className="space-y-4 mt-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Complete Client Details</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedClientForProject(item);
                                setIsProjectFormOpen(true);
                              }}
                              className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-indigo-700 transition-colors"
                              title="Add New Project"
                            >
                              <PlusCircle size={14} /> Add Project
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEntity(item);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-green-700 transition-colors"
                            >
                              <Send size={12} /> Send Invoice
                            </button>
                            <button
                              onClick={() => handleClientEditSelect(item.id)}
                              className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                            >
                              <Edit2 size={12} /> Edit Client
                            </button>
                          </div>
                        </div>

                        {/* Notes Section for Clients */}
                        {item.notes && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            <div className="flex items-start gap-2">
                              <FileText size={14} className="text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-yellow-700">Notes</p>
                                <p className="text-sm text-gray-700 mt-1">{item.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      </div>

      {/* INLINE PROJECT FORM MODAL */}
      {isProjectFormOpen && selectedClientForProject && (
        <InlineProjectForm
          client={selectedClientForProject}
          onClose={() => {
            setIsProjectFormOpen(false);
            setSelectedClientForProject(null);
          }}
          onSubmit={handleInlineProjectCreate}
          isSubmitting={isSubmitting}
        />
      )}

      {/* EDIT PROJECT MODAL */}
      {isEditing && editData.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Project</h3>
                <p className="text-xs text-gray-500 mt-0.5">Update complete project details</p>
              </div>
              <button onClick={() => { setIsEditing(false); setEditData({}); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Project</label>
                <select
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  value={editData.id || ""}
                >
                  <option value="">-- Select Project --</option>
                  {projectNamesList.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName} - {project.clientName || project.clientEmail}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-100 my-2"></div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.projectName || ''}
                  onChange={(e) => handleEditChange('projectName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={editData.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.assigningDate ? editData.assigningDate.split('T')[0] : ''}
                    onChange={(e) => handleEditChange('assigningDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.deadline ? editData.deadline.split('T')[0] : ''}
                    onChange={(e) => handleEditChange('deadline', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phase</label>
                  <select
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.phase || 'Planning'}
                    onChange={(e) => handleEditChange('phase', e.target.value)}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Deployment">Deployment</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.status || 'active'}
                    onChange={(e) => handleEditChange('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.budget || 0}
                    onChange={(e) => handleEditChange('budget', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Payment (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.totalPayment || 0}
                    onChange={(e) => handleEditChange('totalPayment', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Received (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.paymentReceived || 0}
                    onChange={(e) => handleEditChange('paymentReceived', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Info</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.contactInfo || ''}
                    onChange={(e) => handleEditChange('contactInfo', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GitHub Link</label>
                <input
                  type="url"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.githubLink || ''}
                  onChange={(e) => handleEditChange('githubLink', e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Deployment Link</label>
                <input
                  type="url"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.deploymentLink || ''}
                  onChange={(e) => handleEditChange('deploymentLink', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  value={editData.notes || ''}
                  onChange={(e) => handleEditChange('notes', e.target.value)}
                  placeholder="Additional project notes..."
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setIsEditing(false); setEditData({}); }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {isEditingClient && editClientData.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Client</h3>
                <p className="text-xs text-gray-500 mt-0.5">Update client details</p>
              </div>
              <button onClick={() => { setIsEditingClient(false); setEditClientData({}); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Client</label>
                <select
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleClientEditSelect(e.target.value)}
                  value={editClientData.id || ""}
                >
                  <option value="">-- Select Client --</option>
                  {clientNamesList.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-100 my-2"></div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editClientData.name || ''}
                  onChange={(e) => handleClientEditChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editClientData.email || ''}
                  onChange={(e) => handleClientEditChange('email', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editClientData.phone || ''}
                  onChange={(e) => handleClientEditChange('phone', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editClientData.company || ''}
                  onChange={(e) => handleClientEditChange('company', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  value={editClientData.address || ''}
                  onChange={(e) => handleClientEditChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editClientData.city || ''}
                    onChange={(e) => handleClientEditChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editClientData.state || ''}
                    onChange={(e) => handleClientEditChange('state', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editClientData.pincode || ''}
                    onChange={(e) => handleClientEditChange('pincode', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editClientData.country || 'India'}
                    onChange={(e) => handleClientEditChange('country', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editClientData.status || 'Lead'}
                    onChange={(e) => handleClientEditChange('status', e.target.value)}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editClientData.priority || 'Medium'}
                    onChange={(e) => handleClientEditChange('priority', e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editClientData.budget || ''}
                  onChange={(e) => handleClientEditChange('budget', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                <select
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editClientData.currency || 'INR'}
                  onChange={(e) => handleClientEditChange('currency', e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  value={editClientData.notes || ''}
                  onChange={(e) => handleClientEditChange('notes', e.target.value)}
                  placeholder="Additional notes about the client..."
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setIsEditingClient(false); setEditClientData({}); }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateClient}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER CLIENT MODAL */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Register Client & Project</h3>
                  <p className="text-xs text-gray-500 mt-0.5">4-step registration process</p>
                </div>
                <button onClick={() => setIsClientModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-5">
                {[1, 2, 3, 4].map((s) => (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                        {step > s ? <CheckCircle2 size={14} /> : s}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {s === 1 ? 'Identity' : s === 2 ? 'Business' : s === 3 ? 'Address' : 'Project'}
                      </span>
                    </div>
                    {s < 4 && (
                      <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateClient}>
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Select Existing Client</label>
                      <select
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => handleClientSelect(e.target.value)}
                        value=""
                      >
                        <option value="">-- Select Client (Optional) --</option>
                        {clientNamesList.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name} - {client.email}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Or fill details below for new client</p>
                    </div>

                    <div className="border-t border-gray-100 my-2"></div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        value={newClient.name}
                        onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        value={newClient.email}
                        onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.phone}
                        onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
                      <select
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.source}
                        onChange={e => setNewClient({ ...newClient, source: e.target.value })}
                      >
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 2: BUSINESS */}
                {step === 2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.company}
                        onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Budget</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.budget}
                        onChange={e => setNewClient({ ...newClient, budget: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.currency}
                        onChange={e => setNewClient({ ...newClient, currency: e.target.value })}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.priority}
                        onChange={e => setNewClient({ ...newClient, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.status}
                        onChange={e => setNewClient({ ...newClient, status: e.target.value })}
                      >
                        <option value="Lead">Lead</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Active">Active</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        value={newClient.notes}
                        onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: ADDRESS */}
                {step === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        value={newClient.address}
                        onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newClient.city}
                          onChange={e => setNewClient({ ...newClient, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newClient.state}
                          onChange={e => setNewClient({ ...newClient, state: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newClient.pincode}
                          onChange={e => setNewClient({ ...newClient, pincode: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newClient.country}
                          onChange={e => setNewClient({ ...newClient, country: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: PROJECT DETAILS */}
                {step === 4 && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg mb-2">
                      <p className="text-xs text-blue-700 font-medium">Project Information (Optional)</p>
                      <p className="text-xs text-blue-600 mt-1">Add project details for this client</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newProject.projectName}
                        onChange={e => handleProjectChange('projectName', e.target.value)}
                        placeholder="Enter project name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        value={newProject.description}
                        onChange={e => handleProjectChange('description', e.target.value)}
                        placeholder="Project description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newProject.assigningDate}
                          onChange={e => handleProjectChange('assigningDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Deadline</label>
                        <input
                          type="date"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newProject.deadline}
                          onChange={e => handleProjectChange('deadline', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Budget (₹)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newProject.budget}
                          onChange={e => handleProjectChange('budget', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Total Payment (₹)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newProject.totalPayment}
                          onChange={e => handleProjectChange('totalPayment', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Received (₹)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newProject.paymentReceived}
                          onChange={e => handleProjectChange('paymentReceived', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phase</label>
                        <select
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newProject.phase}
                          onChange={e => handleProjectChange('phase', e.target.value)}
                        >
                          <option value="Planning">Planning</option>
                          <option value="Development">Development</option>
                          <option value="Testing">Testing</option>
                          <option value="Deployment">Deployment</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newProject.status}
                          onChange={e => handleProjectChange('status', e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Contact Info</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newProject.contactInfo}
                          onChange={e => handleProjectChange('contactInfo', e.target.value)}
                          placeholder="Contact number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">GitHub Link</label>
                      <input
                        type="url"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newProject.githubLink}
                        onChange={e => handleProjectChange('githubLink', e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Deployment Link</label>
                      <input
                        type="url"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newProject.deploymentLink}
                        onChange={e => handleProjectChange('deploymentLink', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                {step > 1 && (
                  <button type="button" onClick={handlePrevStep} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                    <ArrowLeft size={14} className="inline mr-1" /> Back
                  </button>
                )}
                {step < 4 ? (
                  <button type="button" onClick={handleNextStep} className="ml-auto px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Next <ArrowRight size={14} className="inline ml-1" />
                  </button>
                ) : (
                  <div className="ml-auto flex gap-3">
                    <button
                      type="button"
                      onClick={handleCreateBoth}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                      {isSubmitting ? 'Creating...' : 'Create Both (Client & Project)'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Briefcase size={14} />}
                      {isSubmitting ? 'Creating...' : 'Create Project Only'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      {isSubmitting ? 'Saving...' : 'Save Client Only'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {isInvoiceModalOpen && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create Invoice</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  To: <span className="text-blue-600 font-medium">
                    {selectedEntity.type === 'Project' ? selectedEntity.clientName || selectedEntity.name : selectedEntity.name}
                  </span>
                  {selectedEntity.type === 'Project' && (
                    <span className="text-gray-400 ml-2">(Project: {selectedEntity.name})</span>
                  )}
                </p>
              </div>
              <button onClick={() => { setIsInvoiceModalOpen(false); setSelectedEntity(null); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="27XXXXXXXXXXXXZ1"
                      value={gstNumber}
                      onChange={e => setGstNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Invoice Items</h4>
                      <button onClick={addInvoiceItem} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <PlusCircle size={14} /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2">
                      {invoiceItems.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                              {item.isCustom ? (
                                <input
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg"
                                  placeholder="Describe service..."
                                  value={item.service}
                                  onChange={(e) => updateInvItem(idx, 'service', e.target.value)}
                                />
                              ) : (
                                <select
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg"
                                  value={item.service}
                                  onChange={(e) => updateInvItem(idx, 'service', e.target.value)}
                                >
                                  <option value="">Select Service</option>
                                  {projects?.map(p => <option key={p.id} value={p.projectName}>{p.projectName}</option>)}
                                  <option value="Consultancy">Consultancy</option>
                                  <option value="Development">Development</option>
                                  <option value="Maintenance">Maintenance</option>
                                  <option value="CUSTOM_ENTRY" className="text-blue-600">+ Custom Service</option>
                                </select>
                              )}
                              <input
                                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 rounded-lg"
                                placeholder="Phase/Milestone"
                                value={item.phase}
                                onChange={(e) => updateInvItem(idx, 'phase', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500">Qty</label>
                              <input
                                type="number"
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg mt-1"
                                value={item.quantity}
                                onChange={(e) => updateInvItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="text-xs text-gray-500">Price ({invoiceCurrency.symbol})</label>
                              <input
                                type="number"
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg mt-1"
                                value={item.price}
                                onChange={(e) => updateInvItem(idx, 'price', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-1 flex items-end justify-end pb-1">
                              <button onClick={() => removeInvoiceItem(idx)} className="p-1 text-gray-400 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-5 h-fit sticky top-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Summary</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-medium text-white">{invoiceCurrency.symbol}{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">GST (18%)</span>
                      <span className="font-medium text-white">{invoiceCurrency.symbol}{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-gray-700 flex justify-between items-end">
                      <span className="text-sm font-semibold text-gray-300">Grand Total</span>
                      <span className="text-xl font-bold text-white">{invoiceCurrency.symbol}{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Currency</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setInvoiceCurrency({ code: 'INR', symbol: '₹' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${invoiceCurrency.code === 'INR' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      >
                        INR
                      </button>
                      <button
                        onClick={() => setInvoiceCurrency({ code: 'USD', symbol: '$' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${invoiceCurrency.code === 'USD' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      >
                        USD
                      </button>
                      <button
                        onClick={() => setInvoiceCurrency({ code: 'EUR', symbol: '€' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${invoiceCurrency.code === 'EUR' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      >
                        EUR
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSendInvoice}
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSubmitting ? 'Sending...' : 'Send Invoice'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAdmin;