import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const PendingApprovals = ({ approvals, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 h-[500px] animate-pulse">
        <div className="h-6 w-40 bg-slate-100 rounded-full mb-8"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-50/50 rounded-2xl p-5 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
              <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
            </div>
            <div className="h-3 w-content bg-slate-100 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const handleApprove = (approvalId) => {
    console.log('Approving request:', approvalId);
  };

  const handleReject = (approvalId) => {
    console.log('Rejecting request:', approvalId);
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Pending Approvals</h3>
            {approvals?.length > 0 && (
              <span className="px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-rose-500/20">
                {approvals.length}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium">Review pending requests</p>
        </div>
        <button
          onClick={() => window.location.href = '/approvals'}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-500/5 rounded-xl transition-all duration-300"
          title="View All"
        >
          <Icon name="ArrowUpRight" size={20} />
        </button>
      </div>

      <div className="space-y-5">
        {approvals?.length > 0 ? (
          approvals.map((approval) => (
            <div key={approval.id} className="relative bg-slate-50/30 border border-slate-200/40 rounded-2xl p-5 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-500 group/card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/10 overflow-hidden ring-4 ring-white group-hover/card:ring-blue-100 transition-all">
                    {approval.avatar ? <Image src={approval.avatar} className="w-full h-full object-cover" /> : <Icon name="User" size={24} strokeWidth={2.5} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">{approval.subtitle}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/70">{approval.title}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 text-xs text-slate-400 font-bold px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                <span>Submitted Oct 18, 2026</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-200/50">
                <button
                  onClick={() => handleReject(approval.id)}
                  className="flex-1 py-2 text-xs font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(approval.id)}
                  className="flex-1 py-2 text-xs font-black bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 uppercase tracking-widest"
                >
                  Approve
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <Icon name="CheckCircle" size={40} className="text-emerald-500 opacity-30" strokeWidth={3} />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-1 tracking-tight">Good as Gold!</h4>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No pending requests</p>
          </div>
        )}
      </div>

      {approvals?.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200/40">
          <button 
            className="w-full py-4 text-xs font-black text-blue-600 bg-blue-500/5 hover:bg-blue-500/10 rounded-2xl transition-all border border-blue-500/10 uppercase tracking-widest active:scale-95"
            onClick={() => window.location.href = '/approvals'}
          >
            Review All Requests
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;