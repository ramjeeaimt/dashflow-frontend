import Header from 'components/ui/Header';
import Sidebar from 'components/ui/Sidebar';
import React, { useState, useEffect, useCallback } from 'react';
import { useLeaveStore } from 'store/useLeaveStore';
import { Calendar, Clock, CheckCircle, List, Send } from 'lucide-react';

const LeaveForm = ({ employeeId: propEmployeeId }) => {
  const { isLoading, submitLeave, error: storeError, leaves, fetchEmployeeLeaves } = useLeaveStore();
  const [localError, setLocalError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. DYNAMIC ID LOGIC: Refresh ke baad data bachane ke liye
  const [activeId, setActiveId] = useState(() => {
    return propEmployeeId || localStorage.getItem('lastEmployeeId') || "6c81096a-0b24-4341-a45d-9ba7297aa247";
  });

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'casual',
    reason: '',
  });

  // 2. ID SYNC: Jab prop badle toh update karein aur save karein
  useEffect(() => {
    if (propEmployeeId) {
      setActiveId(propEmployeeId);
      localStorage.setItem('lastEmployeeId', propEmployeeId);
    }
  }, [propEmployeeId]);

  // 3. AUTO-FETCH ON MOUNT: Page reload hote hi data layega
  useEffect(() => {
    if (activeId && fetchEmployeeLeaves) {
      console.log("Fetching dynamic data for:", activeId);
      fetchEmployeeLeaves(activeId);
    }
  }, [activeId, fetchEmployeeLeaves]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setIsSuccess(false);

    const payload = {
      employeeId: activeId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type,
      reason: formData.reason.trim(),
      status: 'PENDING' 
    };

    const success = await submitLeave(payload);

    if (success) {
      setIsSuccess(true);
      setFormData({ startDate: '', endDate: '', type: 'casual', reason: '' });
      // Instant Dynamic Refresh
      fetchEmployeeLeaves(activeId);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 ml-44 pt-20 pb-10 px-4 md:px-8 lg:px-40 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Leave Dashboard</h1>
              <p className="text-gray-500 text-sm italic">Session ID: {activeId}</p>
            </div>

            {/* Stats - Dynamic Calculation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
               <div className="bg-white p-6 border border-gray-100 flex items-center justify-between rounded-2xl shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Applied</p>
                  <h3 className="text-2xl font-black text-gray-800">{leaves?.length || 0}</h3>
                </div>
                <Calendar size={24} className="text-gray-300"/>
              </div>

              <div className="bg-white p-6 border border-gray-100 flex items-center justify-between rounded-2xl shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Approved</p>
                  <h3 className="text-2xl font-black text-emerald-600">
                    {leaves?.filter(l => (l.status || l.leaveStatus)?.toUpperCase() === 'APPROVED').length || 0}
                  </h3>
                </div>
                <CheckCircle size={24} className="text-emerald-500"/>
              </div>

              <div className="bg-white p-6 border border-gray-100 flex items-center justify-between rounded-2xl shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending</p>
                  <h3 className="text-2xl font-black text-amber-500">
                    {leaves?.filter(l => (l.status || l.leaveStatus)?.toUpperCase() === 'PENDING').length || 0}
                  </h3>
                </div>
                <Clock size={24} className="text-amber-500"/>
              </div>
            </div>

            <div className="flex flex-col gap-10">
              {/* Form Card */}
              <div className="w-full bg-white p-8 border border-gray-100 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Send size={20}/>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Apply New Leave</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 ml-1">Leave Type</label>
                      <select name="type" value={formData.type} onChange={handleChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all">
                        <option value="sick">Sick Leave</option>
                        <option value="casual">Casual Leave</option>
                        <option value="earned">Earned Leave</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 ml-1">From</label>
                      <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 ml-1">To</label>
                      <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 ml-1">Reason</label>
                    <textarea name="reason" required value={formData.reason} onChange={handleChange} className="w-full h-28 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none resize-none focus:ring-2 focus:ring-black" placeholder="Reason for leave..."></textarea>
                  </div>

                  {isSuccess && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold border border-emerald-100">✓ Successfully Submitted!</div>}
                  {(localError || storeError) && <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold border border-rose-100">⚠ {localError || storeError}</div>}

                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold shadow-xl transition-all">
                    {isLoading ? 'Processing...' : 'Submit Request'}
                  </button>
                </form>
              </div>

              {/* Activity Section */}
              <div className="divide-y divide-gray-50">
  {leaves && leaves.length > 0 ? (
    [...leaves]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .map((leave, idx) => {
        const rawStatus = (leave.status || leave.leaveStatus || 'PENDING').toUpperCase();
        
        // Dynamic Status Theme
        const theme = {
          APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'text-emerald-500' },
          REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: 'text-rose-500' },
          PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: 'text-amber-500' }
        }[rawStatus] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', icon: 'text-gray-400' };

        return (
          <div key={leave.id || idx} className="p-6 hover:bg-white transition-all duration-300 group">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Left Side: Status Column */}
              <div className="md:w-40 flex-shrink-0">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${theme.bg} ${theme.border} ${theme.text} mb-2`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${rawStatus === 'PENDING' ? 'bg-amber-500' : rawStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{rawStatus}</span>
                </div>
                <p className="text-[11px] text-gray-400 font-bold ml-1">{leave.startDate}</p>
              </div>

              {/* Right Side: Content */}
              <div className="flex-1 space-y-4">
                {/* Leave Type & Date Range */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-gray-900 leading-none mb-1 capitalize">
                      {leave.type} Leave
                    </h4>
                    <p className="text-xs text-gray-400 font-medium italic">Duration: {leave.startDate} to {leave.endDate}</p>
                  </div>
                  <span className="text-[10px] text-gray-300 font-bold hidden md:block">
                    REF: #{leave.id?.slice(0, 8) || idx}
                  </span>
                </div>

                {/* 1. EMPLOYEE REASON - Styled as a Speech Bubble */}
                <div className="relative pl-4 border-l-2 border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">My Application Reason</p>
                  <p className="text-sm text-gray-700 font-semibold leading-relaxed">
                    "{leave.reason || "I didn't specify a reason for this request."}"
                  </p>
                </div>

                {/* 2. ADMIN DECISION - Real User Experience Logic */}
               {/* Admin Decision Section */}
{rawStatus !== 'PENDING' && (
  <div className={`mt-4 p-5 rounded-3xl border-2 border-dashed ${theme.border} ${theme.bg} relative overflow-hidden`}>
    <div className="flex items-center gap-2 mb-3 relative z-10">
      <div className={`p-1.5 rounded-xl bg-white shadow-sm ${theme.icon}`}>
        {rawStatus === 'APPROVED' ? <CheckCircle size={14}/> : <Clock size={14}/>}
      </div>
      <p className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>
        Official HR Remark
      </p>
    </div>
    
    <div className="relative z-10">
      {/* 🛠️ Debug Check: Agar adminComment nahi mil raha toh check karo leave object ko */}
      {leave.adminComment && leave.adminComment.trim() !== "" ? (
        <div className="space-y-1">
          <p className="text-sm text-gray-800 font-bold leading-relaxed italic">
            "{leave.adminComment}"
          </p>
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">
            — Authenticated Response
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 font-medium italic">
          {rawStatus === 'APPROVED' 
            ? "Your application was reviewed and approved. Enjoy your leave!" 
            : "This request was declined. Please check with your manager for details."}
        </p>
      )}
    </div>
  </div>
)}
              </div>
            </div>
          </div>
        );
      })
  ) : (
    <div className="py-24 text-center">
      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
        <Send size={30} className="text-gray-200" />
      </div>
      <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No Leave Records Found</p>
    </div>
  )}
</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeaveForm;