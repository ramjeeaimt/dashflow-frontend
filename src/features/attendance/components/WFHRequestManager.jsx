import React, { useEffect, useState } from 'react';
import api from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { toast } from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import WorkFromHomeRequestList from './WorkFromHomeRequestList';

const WorkFromHomeRequestManager = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get(API_ENDPOINTS.WFH_REQUESTS.BASE, { params: { status: 'PENDING' } });
            setRequests(res.data?.data || res.data || []);
        } catch (error) {
            console.error('Failed to fetch Work From Home requests:', error);
            toast.error('Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingRequests();
        }
    }, [activeTab]);

    const handleAction = async (id, status) => {
        const adminComment = window.prompt(`Enter comment for ${status.toLowerCase()} (optional):`);
        if (adminComment === null) return;

        try {
            await api.patch(API_ENDPOINTS.WFH_REQUESTS.UPDATE_STATUS(id), { status, adminComment });
            toast.success(`Request ${status.toLowerCase()}ed`);
            fetchPendingRequests();
        } catch (error) {
            console.error('Failed to update request:', error);
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this request permanently?')) return;
        try {
            await api.delete(API_ENDPOINTS.WFH_REQUESTS.BY_ID(id));
            toast.success('Request deleted');
            fetchPendingRequests();
        } catch (error) {
            console.error('Failed to delete request:', error);
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'pending' 
                            ? 'bg-white text-indigo-600 shadow-md' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Pending Requests
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'history' 
                            ? 'bg-white text-indigo-600 shadow-md' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        All History
                    </button>
                </div>
            </div>

            {activeTab === 'pending' ? (
                loading ? (
                    <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                        Scanning for new requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100 shadow-sm">
                            <Icon name="Wind" size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No pending Work From Home requests</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Icon name="Home" size={16} className="text-indigo-500" /> Pending Work From Home Approvals
                            </h3>
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg">
                                {requests.length} NEW
                            </span>
                        </div>
                        
                        <div className="divide-y divide-slate-50">
                            {requests.map(req => (
                                <div key={req.id} className="p-6 hover:bg-slate-50/30 transition-all flex items-center justify-between group">
                                    <div className="flex items-center space-x-5">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:scale-110 transition-transform">
                                            {req.employee?.user?.firstName?.[0] || 'E'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-none">
                                                {req.employee?.user?.firstName} {req.employee?.user?.lastName}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter flex items-center gap-1.5">
                                                <Icon name="Calendar" size={10} /> {req.startDate} → {req.endDate}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-3 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-block italic">
                                                "{req.reason}"
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handleDelete(req.id)}
                                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Delete permanently"
                                        >
                                            <Icon name="Trash2" size={18} />
                                        </button>
                                        <div className="h-6 w-[1px] bg-slate-100 mx-1" />
                                        <button 
                                            onClick={() => handleAction(req.id, 'REJECTED')}
                                            className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all"
                                            title="Reject"
                                        >
                                            <Icon name="X" size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleAction(req.id, 'APPROVED')}
                                            className="px-6 py-2.5 bg-indigo-600 text-white text-[11px] font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                                        >
                                            <Icon name="Check" size={14} />
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <WorkFromHomeRequestList />
            )}
        </div>
    );
};

export default WorkFromHomeRequestManager;
