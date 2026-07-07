import React, { useEffect, useState } from 'react';
import api from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { toast } from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import WorkFromHomeRequestList from './WorkFromHomeRequestList';

const WorkFromHomeRequestManager = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');

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

        setActionLoadingId(id);
        try {
            await api.patch(API_ENDPOINTS.WFH_REQUESTS.UPDATE_STATUS(id), { status, adminComment });
            toast.success(`Request ${status.toLowerCase()}ed`);
            fetchPendingRequests();
        } catch (error) {
            console.error('Failed to update request:', error);
            toast.error('Operation failed');
        } finally {
            setActionLoadingId(null);
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
                <div className="flex bg-muted p-1 rounded-lg w-fit border border-border shadow-inner">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide transition-all ${
 activeTab === 'pending' 
 ? 'bg-card text-primary shadow-md' 
 : 'text-muted-foreground hover:text-foreground'
 }`}
                    >
                        Pending Requests
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide transition-all ${
 activeTab === 'history' 
 ? 'bg-card text-primary shadow-md' 
 : 'text-muted-foreground hover:text-foreground'
 }`}
                    >
                        All History
                    </button>
                </div>
            </div>

            {activeTab === 'pending' ? (
                loading ? (
                    <div className="p-8 text-center text-muted-foreground/70 font-bold uppercase tracking-wide text-xs animate-pulse">
                        Scanning for new requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center bg-muted/50 border border-dashed border-border rounded-lg">
                        <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center text-muted-foreground/70 mx-auto mb-4 border border-border shadow-sm">
                            <Icon name="Wind" size={24} />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground/70">No pending Work From Home requests</p>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-slate-50 bg-muted/50 flex justify-between items-center">
                            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <Icon name="Home" size={16} className="text-primary" /> Pending Work From Home Approvals
                            </h3>
                            <span className="bg-primary text-white text-[9px] font-semibold px-2.5 py-1 rounded-lg">
                                {requests.length} NEW
                            </span>
                        </div>
                        
                        <div className="divide-y divide-slate-50">
                            {requests.map(req => (
                                <div key={req.id} className="p-6 hover:bg-muted/30 transition-all flex items-center justify-between group">
                                    <div className="flex items-center space-x-5">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-border flex items-center justify-center text-primary font-semibold shadow-sm transition-transform">
                                            {req.employee?.user?.firstName?.[0] || 'E'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground leading-none">
                                                {req.employee?.user?.firstName} {req.employee?.user?.lastName}
                                            </p>
                                            <p className="text-[10px] font-bold text-muted-foreground/70 mt-2 uppercase tracking-tighter flex items-center gap-1.5">
                                                <Icon name="Calendar" size={10} /> {req.startDate} → {req.endDate}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-3 font-medium bg-muted/60 px-3 py-2 rounded-xl border border-border inline-block italic">
                                                "{req.reason}"
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handleDelete(req.id)}
                                            className="p-3 text-muted-foreground/70 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Delete permanently"
                                        >
                                            <Icon name="Trash2" size={18} />
                                        </button>
                                        <div className="h-6 w-[1px] bg-muted mx-1" />
                                        <button 
                                            onClick={() => handleAction(req.id, 'REJECTED')}
                                            className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all"
                                            title="Reject"
                                        >
                                            <Icon name="X" size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleAction(req.id, 'APPROVED')}
                                            className={`px-6 py-2.5 bg-primary text-white text-[11px] font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 ${actionLoadingId === req.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            disabled={actionLoadingId === req.id}
                                        >
                                            {actionLoadingId === req.id ? (
                                                <Icon name="Loader2" size={14} className="animate-spin mr-1" />
                                            ) : (
                                                <Icon name="Check" size={14} />
                                            )}
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
