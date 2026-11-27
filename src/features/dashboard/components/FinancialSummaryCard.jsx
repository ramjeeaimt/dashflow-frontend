import React from 'react';
import Icon from '../../../components/AppIcon';

const FinancialSummaryCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-card p-8 h-[280px] animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-lg mb-8"></div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="h-24 bg-muted/60 rounded-lg"></div>
          <div className="h-24 bg-muted/60 rounded-lg"></div>
        </div>
        <div className="h-3 w-full bg-muted/60 rounded-full"></div>
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
    <div className="bg-card h-full flex flex-col justify-between transition-all duration-300">
      <div className="border-b border-border/60">
        <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wide text-primary">
              <Icon name="Activity" size={14} />
              <span>FISCAL SUMMARY</span>
            </div>
            <div className="flex items-baseline gap-2.5">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Finance</h3>
              <p className="text-xs text-muted-foreground/70 font-medium tracking-tight">Real-time aggregate data stream</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-muted/30 pt-4">
          {/* TURNOVER */}
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-1.5 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 truncate">Turnover</p>
            <p className="text-base sm:text-lg xl:text-xl font-bold text-foreground tracking-tight tabular-nums whitespace-nowrap">{formatCurrency(turnover || 0)}</p>
          </div>

          {/* NET PROFIT */}
          <div className={`p-4 rounded-lg border shadow-sm space-y-1.5 min-w-0 ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wide truncate ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Net Profit</p>
            <p className={`text-base sm:text-lg xl:text-xl font-bold tracking-tight tabular-nums whitespace-nowrap ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(netProfit || 0)}
            </p>
          </div>

          {/* PAYROLL */}
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-1.5 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 truncate">Payroll</p>
            <p className="text-base sm:text-lg xl:text-xl font-bold text-foreground tracking-tight tabular-nums whitespace-nowrap">{formatCurrency(totalPayroll || 0)}</p>
          </div>

          {/* EXPENSES */}
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-1.5 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 truncate">Expenses</p>
            <p className="text-base sm:text-lg xl:text-xl font-bold text-foreground tracking-tight tabular-nums whitespace-nowrap">{formatCurrency(totalExpenses || 0)}</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Budget Distribution</span>
          <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap">
            <Icon name="TrendingUp" size={12} strokeWidth={3} />
            <span className="tabular-nums">{formatCurrency(outgoingTotal || 0)} OUTGOING</span>
          </div>
        </div>
        
        <div className="h-6 w-full bg-muted/60 rounded-full p-1 flex">
          <div 
            style={{ width: `${payrollPct}%` }} 
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out flex items-center justify-center overflow-hidden shadow-sm"
          >
             <span className="text-[8px] font-bold text-white px-2 truncate">PAYROLL</span>
          </div>
          <div 
            style={{ width: `${expensesPct}%` }} 
            className="h-full bg-slate-400 rounded-full transition-all duration-1000 ease-out ml-1 flex items-center justify-center overflow-hidden"
          >
             <span className="text-[8px] font-bold text-white px-2 truncate">MARKETING/OPS</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wide">{payrollPct.toFixed(0)}% Personnel</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                    <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wide">{expensesPct.toFixed(0)}% Resource</span>
                </div>
            </div>
            <button className="text-xs font-bold text-primary hover:text-primary transition-colors uppercase tracking-wide flex items-center group">
                Access Audit Logs
                <Icon name="ArrowRight" size={14} className="ml-2 transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;
