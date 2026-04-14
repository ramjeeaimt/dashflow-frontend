import React from 'react';
import Icon from '../../../components/AppIcon';

const FinancialSummaryCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-900 rounded-none p-8 h-[280px] animate-pulse">
        <div className="h-6 w-48 bg-slate-100 rounded-none mb-8"></div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="h-24 bg-slate-50 rounded-none"></div>
          <div className="h-24 bg-slate-50 rounded-none"></div>
        </div>
        <div className="h-3 w-full bg-slate-50 rounded-none"></div>
      </div>
    );
  }

  if (!data) return null;

  const { totalPayroll, totalExpenses, outgoingTotal, turnover, netProfit } = data;
  
  const payrollPct = outgoingTotal > 0 ? (totalPayroll / outgoingTotal) * 100 : 0;
  const expensesPct = outgoingTotal > 0 ? (totalExpenses / outgoingTotal) * 100 : 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white p-0 transition-all duration-300">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-900 border-b border-slate-900">
        <div className="p-8 lg:w-1/3 space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <span className="w-4 h-px bg-slate-300"></span>
                <Icon name="Activity" size={14} />
                <span>FISCAL_INTEGRITY_INDEX</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Financial Health</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time aggregate data stream</p>
        </div>

        <div className="p-8 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/30">
            {/* TURNOVER */}
            <div className="p-4 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Est_Turnover</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{formatCurrency(turnover || 0)}</p>
            </div>

            {/* NET PROFIT */}
            <div className={`p-4 space-y-3 ${netProfit >= 0 ? '' : 'bg-rose-50'}`}>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Net_Profit_Margin</p>
                <p className={`text-2xl font-black tracking-tighter font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatCurrency(netProfit || 0)}
                </p>
            </div>

            {/* PAYROLL */}
            <div className="p-4 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Aggregate_Payroll</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{formatCurrency(totalPayroll || 0)}</p>
            </div>

            {/* EXPENSES */}
            <div className="p-4 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Operational_Exp</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{formatCurrency(totalExpenses || 0)}</p>
            </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Budget_Distribution_Architecture</span>
          <div className="bg-slate-900 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(15,23,42,0.15)] flex items-center space-x-2">
            <Icon name="TrendingUp" size={12} strokeWidth={3} />
            <span>{formatCurrency(outgoingTotal)} OUTGOING</span>
          </div>
        </div>
        
        <div className="h-8 w-full bg-slate-50 border border-slate-900 p-1 flex">
          <div 
            style={{ width: `${payrollPct}%` }} 
            className="h-full bg-slate-900 transition-all duration-1000 ease-out flex items-center justify-center overflow-hidden"
          >
             <span className="text-[8px] font-black text-white px-2">PAYROLL</span>
          </div>
          <div 
            style={{ width: `${expensesPct}%` }} 
            className="h-full bg-slate-400 transition-all duration-1000 ease-out ml-1 flex items-center justify-center overflow-hidden"
          >
             <span className="text-[8px] font-black text-white px-2">MARKETING/OPS</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-slate-900"></div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{payrollPct.toFixed(0)}% Personnel Distribution</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-slate-400"></div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{expensesPct.toFixed(0)}% Resource Allocation</span>
                </div>
            </div>
            <button className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-0.5 hover:opacity-70 transition-opacity flex items-center group">
                Access Audit Logs
                <Icon name="ArrowRight" size={12} className="ml-2 transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;
