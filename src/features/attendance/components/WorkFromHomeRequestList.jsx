import React, { useEffect, useState } from 'react';
import api from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { toast } from 'react-hot-toast';
import Icon from '../../../components/AppIcon';

const WorkFromHomeRequestList = ({ employeeId }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = employeeId ? { employeeId } : {};
            const res = await api.get(API_ENDPOINTS.WFH_REQUESTS.BASE, { params });
            setRequests(res.data?.data || res.data || []);
        } catch (error) {
            console.error('Failed to fetch Work From Home requests:', error);
            toast.error('Failed to load Work From Home requests history');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this historical request record?')) return;
        try {
            await api.delete(API_ENDPOINTS.WFH_REQUESTS.BY_ID(id));
            toast.success('Record deleted');
            fetchRequests();
        } catch (error) {
            console.error('Failed to delete request:', error);
            toast.error('Delete failed');
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [employeeId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'REJECTED': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-amber-600 bg-amber-50 border-amber-100';
        }
    };

    if (loading) return (
        <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
            Loading Work From Home history...
        </div>
    );

    if (requests.length === 0) return (
        <div className="p-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Work From Home requests found</p>
        </div>
    );

    return (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-8 py-4 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Icon name="History" size={14} className="text-indigo-400" /> Work From Home Request History
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/30 border-b border-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-4">Dates</th>
                            <th className="px-8 py-4">Reason</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Admin Remarks</th>
                            <th className="px-8 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {requests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="text-xs font-bold text-slate-900">{req.startDate}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">to {req.endDate}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="text-xs text-slate-600 max-w-xs truncate" title={req.reason}>
                                        {req.reason}
                                    </p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    {req.adminComment ? (
                                        <p className="text-xs text-slate-500 italic font-medium">
                                            "{req.adminComment}"
                                        </p>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">No remarks</span>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button 
                                        onClick={() => handleDelete(req.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        title="Delete Record"
                                    >
                                        <Icon name="Trash2" size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkFromHomeRequestList;
