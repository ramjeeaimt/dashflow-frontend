import React, { useEffect, useState, useMemo } from 'react';
import { 
  Send, Search, Plus, X, Loader2, Trash2, Users, TrendingUp, 
  ChevronRight, Mail, Briefcase, PlusCircle, CheckCircle2,
  Globe, Phone, MapPin, Building2, DollarSign, ArrowRight, ArrowLeft,
  ShieldCheck, CreditCard, Layers, LayoutGrid, Calendar, Clock, FileText
} from 'lucide-react';
import { useClientStore } from '../store/useClientStore';
import Sidebar from './ui/Sidebar';
import Header from './ui/Header';
import useProjectStore from 'store/useProjectStore';
import useAuthStore from 'store/useAuthStore';
import { FaRupeeSign } from "react-icons/fa";

const ClientAdmin = () => {
  const { clients, fetchClients, processInvoice, addClient } = useClientStore();
  const { user, isAuthenticated } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();

  // --- UI CONTROLS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // --- FORM STATES ---
  const [newClient, setNewClient] = useState({
    name: '', email: '', phone: '', company: '',
    address: '', city: '', state: '', pincode: '', country: 'India',
    status: 'Lead', source: 'LinkedIn', priority: 'Medium',
    budget: '', currency: 'INR', notes: ''
  });

  const [invoiceItems, setInvoiceItems] = useState([
    { service: '', isCustom: false, phase: 'Phase 1', quantity: 1, price: 0 }
  ]);
  const [gstNumber, setGstNumber] = useState('');
  const [invoiceCurrency, setInvoiceCurrency] = useState({ code: 'INR', symbol: '₹' });

  useEffect(() => {
    if (isAuthenticated && user?.company?.id) {
      fetchClients();
      fetchProjects(user.company.id);
    }
  }, [isAuthenticated, user?.company?.id]);

  // --- SEARCH & MERGE LOGIC ---
  const combinedData = useMemo(() => {
    const safeClients = Array.isArray(clients) ? clients : [];
    const clientList = safeClients.map(c => ({ 
      ...c, 
      type: 'Client', 
      searchKey: (c.name + c.email + c.company).toLowerCase(),
      projectDetails: null
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
        assignedPeople: p.assignedPeople
      }
    }));
    return [...clientList, ...projectList].filter(item => item.searchKey.includes(searchTerm.toLowerCase()));
  }, [clients, projects, searchTerm]);

  // --- HANDLERS ---
  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addClient(newClient);
      setIsClientModalOpen(false);
      setStep(1);
      setNewClient({ 
        name: '', email: '', phone: '', company: '', 
        address: '', city: '', state: '', pincode: '', country: 'India', 
        status: 'Lead', source: 'LinkedIn', priority: 'Medium', 
        budget: '', currency: 'INR', notes: '' 
      });
      fetchClients();
    } catch (err) { 
      console.error(err); 
      alert("Error adding client");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      await processInvoice(selectedClient.id, {
        items: invoiceItems,
        total: subtotal,
        currency: invoiceCurrency.code,
        gstNumber: gstNumber,
        clientEmail: selectedClient.email
      });
      alert("Invoice sent successfully!");
      setIsInvoiceModalOpen(false);
      setInvoiceItems([{ service: '', isCustom: false, phase: 'Phase 1', quantity: 1, price: 0 }]);
      setGstNumber('');
    } catch (err) {
      console.error(err);
      alert("Failed to send invoice");
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

  // Stats values
  const totalEntities = combinedData.length;
  const estimatedRevenue = subtotal;
  const activeWorkflows = projects?.length || 0;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header />
        
        <main className="flex-1 mt-16 overflow-y-auto px-6 py-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Network Entities</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEntities}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{estimatedRevenue.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FaRupeeSign size={20} className="text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Workflows</p>
                  <p className="text-2xl font-bold text-gray-900">{activeWorkflows}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM Engine</h1>
              <p className="text-sm text-gray-500 mt-1">Managing all your clients and projects</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter entities..." 
                  className="pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => { setStep(1); setIsClientModalOpen(true); }}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} /> Register Entity
              </button>
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-1">
            {combinedData.map((item) => (
              <div 
                key={item.id}
                className={`bg-white border rounded-lg transition-all ${
                    expandedId === item.id ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base ${
                        item.type === 'Project' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {item.type === 'Project' ? <LayoutGrid size={20}/> : item.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'Project' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.company || 'Direct Organization'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden lg:block text-right">
                      <p className="text-xs text-gray-400">Active Since</p>
                      <p className="text-xs font-medium text-gray-600">
                        {item.assigningDate ? new Date(item.assigningDate).toLocaleDateString() : 'Mar 2026'}
                      </p>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${expandedId === item.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>

                {/* EXPANDED DETAILS SECTION */}
                {expandedId === item.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    {item.type === 'Project' && item.projectDetails ? (
                      // PROJECT DETAILS
                      <div className="space-y-4 mt-3">
                        <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Project Details</h4>
                        
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

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {item.projectDetails.assigningDate && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-blue-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Start Date</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(item.projectDetails.assigningDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {item.projectDetails.deadline && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-orange-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Deadline</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(item.projectDetails.deadline).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Financial Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {item.projectDetails.budget > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <p className="text-xs text-gray-500">Budget</p>
                              <p className="text-lg font-bold text-gray-900">₹{item.projectDetails.budget.toLocaleString()}</p>
                            </div>
                          )}
                          {item.projectDetails.totalPayment > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <p className="text-xs text-gray-500">Total Value</p>
                              <p className="text-lg font-bold text-gray-900">₹{item.projectDetails.totalPayment.toLocaleString()}</p>
                            </div>
                          )}
                          {item.projectDetails.paymentReceived > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <p className="text-xs text-gray-500">Received</p>
                              <p className="text-lg font-bold text-green-600">₹{item.projectDetails.paymentReceived.toLocaleString()}</p>
                            </div>
                          )}
                        </div>

                        {/* Status & Phase */}
                        <div className="flex flex-wrap gap-4">
                          {item.projectDetails.status && (
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                item.projectDetails.status === 'active' ? 'bg-green-100 text-green-700' :
                                item.projectDetails.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {item.projectDetails.status}
                              </span>
                            </div>
                          )}
                          {item.projectDetails.phase && (
                            <div>
                              <p className="text-xs text-gray-500">Phase</p>
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mt-1">
                                {item.projectDetails.phase}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Contact Info */}
                        {item.projectDetails.contactInfo && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">Contact Number</p>
                                <p className="text-sm font-medium text-gray-900">{item.projectDetails.contactInfo}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        {(item.projectDetails.githubLink || item.projectDetails.deploymentLink) && (
                          <div className="flex gap-3 pt-2">
                            {item.projectDetails.githubLink && (
                              <a href={item.projectDetails.githubLink} target="_blank" className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1">
                                <Github size={14} /> GitHub
                              </a>
                            )}
                            {item.projectDetails.deploymentLink && (
                              <a href={item.projectDetails.deploymentLink} target="_blank" className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1">
                                <ExternalLink size={14} /> Deployment
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // CLIENT DETAILS
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-3">
                        <div>
                          <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Contact Points</h4>
                          <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Mail size={12} className="text-blue-500" />
                              <span className="truncate">{item.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Phone size={12} className="text-blue-500" />
                              <span>{item.phone || '+91 XXXXX-XXXXX'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin size={12} className="text-blue-500" />
                              <span>{item.city || 'Remote'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="lg:col-span-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Operations</h4>
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => { setSelectedClient(item); setIsInvoiceModalOpen(true); }} 
                              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors"
                            >
                              <Send size={14}/> Initiate Billing
                            </button>
                            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
                              <Mail size={14}/> Send Briefing
                            </button>
                          </div>
                          <div className="mt-4 flex items-center gap-4 pt-3 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-400">Status</p>
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Priority</p>
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{item.priority || 'Medium'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* REGISTER CLIENT MODAL - Same as before */}
      {isClientModalOpen && (
        // ... (same modal code as previous)
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Register Client</h3>
                  <p className="text-xs text-gray-500 mt-0.5">3-step registration process</p>
                </div>
                <button onClick={() => setIsClientModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                  <X size={18}/>
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between mt-5">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step > s ? <CheckCircle2 size={14} /> : s}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {s === 1 ? 'Identity' : s === 2 ? 'Business' : 'Location'}
                      </span>
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateClient}>
              <div className="p-5">
                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                        value={newClient.name} 
                        onChange={e => setNewClient({...newClient, name: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                        value={newClient.email} 
                        onChange={e => setNewClient({...newClient, email: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                      <input 
                        type="tel" 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={newClient.phone} 
                        onChange={e => setNewClient({...newClient, phone: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
                      <select 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.source} 
                        onChange={e => setNewClient({...newClient, source: e.target.value})}
                      >
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                      </select>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={newClient.company} 
                        onChange={e => setNewClient({...newClient, company: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Budget</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={newClient.budget} 
                        onChange={e => setNewClient({...newClient, budget: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                      <select 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newClient.currency} 
                        onChange={e => setNewClient({...newClient, currency: e.target.value})}
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
                        onChange={e => setNewClient({...newClient, priority: e.target.value})}
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
                        onChange={e => setNewClient({...newClient, status: e.target.value})}
                      >
                        <option value="Lead">Lead</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Active">Active</option>
                      </select>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                      <textarea 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        rows="2"
                        value={newClient.address} 
                        onChange={e => setNewClient({...newClient, address: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={newClient.city} 
                          onChange={e => setNewClient({...newClient, city: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={newClient.state} 
                          onChange={e => setNewClient({...newClient, state: e.target.value})} 
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
                          onChange={e => setNewClient({...newClient, pincode: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={newClient.country} 
                          onChange={e => setNewClient({...newClient, country: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                {step > 1 && (
                  <button type="button" onClick={handlePrevStep} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={14} className="inline mr-1" /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={handleNextStep} className="ml-auto px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Next <ArrowRight size={14} className="inline ml-1" />
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting} className="ml-auto px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {isInvoiceModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create Invoice</h2>
                <p className="text-xs text-gray-500 mt-0.5">To: <span className="text-blue-600 font-medium">{selectedClient.name}</span></p>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                <X size={18}/>
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
                      <button 
                        onClick={addInvoiceItem} 
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <PlusCircle size={14}/> Add Item
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
                              <button onClick={() => removeInvoiceItem(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 size={14}/>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 h-fit sticky top-5">
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
                    {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
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