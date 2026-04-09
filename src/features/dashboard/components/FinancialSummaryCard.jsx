import React from 'react';
import Icon from '../../../components/AppIcon';

const FinancialSummaryCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 h-[280px] animate-pulse">
        <div className="h-6 w-48 bg-slate-100 rounded-full mb-8"></div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="h-24 bg-slate-50 rounded-3xl"></div>
          <div className="h-24 bg-slate-50 rounded-3xl"></div>
        </div>
        <div className="h-3 w-full bg-slate-50 rounded-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const { totalPayroll, totalExpenses, currency, outgoingTotal } = data;
  
  const payrollPct = outgoingTotal > 0 ? (totalPayroll / outgoingTotal) * 100 : 0;
  const expensesPct = outgoingTotal > 0 ? (totalExpenses / outgoingTotal) * 100 : 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 group animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Health</h3>
          <p className="text-sm text-slate-500 font-medium">Monthly outgoing analytics</p>
        </div>
        <div className="w-14 h-14 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/5">
          <Icon name="Activity" size={28} strokeWidth={2.5} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-[1.5rem] bg-blue-50/50 border border-blue-100/50 transition-all hover:bg-blue-50 hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600/70">Payroll</span>
            </div>
            <Icon name="Users" size={16} className="text-blue-500/50" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalPayroll)}</p>
        </div>
        
        <div className="p-6 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100/50 transition-all hover:bg-emerald-50 hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]"></div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600/70">Expenses</span>
            </div>
            <Icon name="ShoppingBag" size={16} className="text-emerald-500/50" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Budget Distribution</span>
          <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-slate-900/20">
            <Icon name="TrendingUp" size={10} strokeWidth={3} />
            {formatCurrency(outgoingTotal)} TOTAL
          </div>
        </div>
        
        <div className="h-5 w-full bg-slate-100/80 rounded-full overflow-hidden flex p-1 border border-slate-200/50 shadow-inner">
          <div 
            style={{ width: `${payrollPct}%` }} 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(37,99,235,0.3)]"
            title={`Payroll: ${payrollPct.toFixed(1)}%`}
          ></div>
          <div 
            style={{ width: `${expensesPct}%` }} 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out ml-1 shadow-[0_0_12px_rgba(5,150,105,0.3)]"
            title={`Expenses: ${expensesPct.toFixed(1)}%`}
          ></div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/40">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{payrollPct.toFixed(0)}% Payroll</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{expensesPct.toFixed(0)}% Marketing/Ops</span>
                </div>
            </div>
            <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center group/link">
                Review Details
                <Icon name="ArrowRight" size={12} className="ml-1.5 transition-transform group-hover/link:translate-x-1" strokeWidth={3} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;
