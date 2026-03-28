import React, { useEffect, useState, useCallback } from 'react';
import { Send, Search, Plus, X, Loader2 } from 'lucide-react';
import { useClientStore } from '../store/useClientStore';
import Sidebar from './ui/Sidebar';
import Header from './ui/Header';

const ClientAdmin = () => {
  const { clients, fetchClients, processInvoice, addClient, isLoading } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  
  // Naya State: Double click aur duplicate hits rokne ke liye
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const safeClients = Array.isArray(clients) ? clients : [];

  const filteredClients = safeClients.filter(client => 
    (client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (client?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Stats Calculations
  const totalRevenue = safeClients.reduce((acc, client) => {
    const clientTotal = client?.invoices?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0;
    return acc + clientTotal;
  }, 0);

  const activeInvoicesCount = safeClients.reduce((acc, client) => 
    acc + (client?.invoices?.filter(inv => inv.status === 'Pending').length || 0), 0
  );

  // Form Submission Logic with Guard Rails
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Block multiple clicks
    if (!newClient.name || !newClient.email) return;

    setIsSubmitting(true);
    try {
      await addClient(newClient);
      setIsModalOpen(false);
      setNewClient({ name: '', email: '' });
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const handleSendInvoice = async (clientId, clientName) => {
    const amount = prompt(`Invoice amount for ${clientName || 'Client'}:`, "500");
    if (amount && !isNaN(amount)) {
      try {
        await processInvoice(clientId, Number(amount));
        alert("Invoice sent!");
        fetchClients(); // Refresh list after invoice
      } catch (err) {
        alert("Failed to send invoice.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
        <Header/>
        <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 ml-52 mt-10 overflow-y-auto p-6 lg:p-10">
            <h1 className='font-bold text-black text-3xl ml-10'> Manage Your Client</h1>
          
          {/* STATS */}
          <div className="grid grid-cols-1 mt-8 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase">Total Clients</p>
              <h3 className="text-3xl font-black mt-1">{safeClients.length}</h3>
            </div>
            <div className="bg-white p-6  border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase">Pending Invoices</p>
              <h3 className="text-3xl font-black mt-1 text-orange-500">{activeInvoicesCount}</h3>
            </div>
            <div className="text-black p-6 rounded-2xl shadow-lg  bg-white">
              <p className="text-xs font-bold opacity-70 uppercase">Total Revenue</p>
              <h3 className="text-3xl font-black mt-1">${totalRevenue.toLocaleString()}</h3>
            </div>
          </div>

          {/* SEARCH & ADD */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-black text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-800 transition shadow-lg active:scale-95"
            >
              <Plus size={20} /> Add Client
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Client Details</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && safeClients.length === 0 ? (
                  <tr><td colSpan="3" className="py-20 text-center text-gray-400 animate-pulse">Syncing Database...</td></tr>
                ) : filteredClients.length === 0 ? (
                  <tr><td colSpan="3" className="py-20 text-center text-gray-500 font-medium">No clients found.</td></tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id || client._id} className="hover:bg-indigo-50/30 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-lg">
                            {(client.name || 'C')[0].toUpperCase()}
                          </div>
                          <div>
                            {/* Critical Fix: Check nested data if necessary */}
                            <p className="font-bold text-gray-900">{client.name || client.data?.name || 'Unnamed Client'}</p>
                            <p className="text-xs text-gray-500">{client.email || client.data?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {client.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleSendInvoice(client.id, client.name)}
                          className="p-3 text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-gray-100"
                        >
                          <Send size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900">New Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X/></button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-6">
              <input 
                required 
                placeholder="Full Name" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                value={newClient.name} 
                onChange={e => setNewClient({...newClient, name: e.target.value})} 
              />
              <input 
                required 
                type="email" 
                placeholder="Email Address" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                value={newClient.email} 
                onChange={e => setNewClient({...newClient, email: e.target.value})} 
              />
              <button 
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Client Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAdmin;