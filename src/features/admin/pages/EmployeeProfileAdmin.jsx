import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import { attendanceService } from '../../../services/attendance.service';
import financeService from '../../../services/finance.service';
import employeeService from '../../../services/employee.service';

const EmployeeProfileAdmin = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [payslipRecords, setPayslipRecords] = useState([]);
  const [profileTab, setProfileTab] = useState('attendance');
  const [latestAttendance, setLatestAttendance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, attDataRaw, payData] = await Promise.all([
          employeeService.getById(id),
          attendanceService.getAll({ employeeId: id }),
          financeService.getEmployeePayrolls(id),
        ]);

        setEmployee(empData);

        // Normalize attendance data
        const attData = Array.isArray(attDataRaw)
          ? attDataRaw
          : attDataRaw && Array.isArray(attDataRaw.data)
          ? attDataRaw.data
          : [];

        console.log('Fetched attendance:', attData);
        setAttendanceRecords(attData);

        // Compute latest attendance
        if (attData.length > 0) {
          const latest = attData.reduce((a, b) =>
            new Date(b.checkInTime) > new Date(a.checkInTime) ? b : a
          );
          setLatestAttendance(latest);
        } else {
          setLatestAttendance(null);
        }

        setPayslipRecords(Array.isArray(payData) ? payData : []);
      } catch (err) {
        console.error('Failed to fetch admin employee data:', err);
      }
    };
    if (id) fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#FBFBFE]">
      <Header />
      <Sidebar />
      <main className="pt-16 pb-12 px-6">
        <div className="bg-card rounded-lg border border-border/60 shadow-sm overflow-hidden mt-8">
          <div className="px-8 py-5 border-b border-slate-50 bg-muted/20 flex items-center gap-4">
            <h3 className="text-sm font-bold text-foreground mr-auto">Employee Records (Admin)</h3>
            <button
              onClick={() => setProfileTab('attendance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileTab === 'attendance' ? 'bg-sidebar text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-border'}`}
            >
              <span className="flex items-center gap-1.5"><Icon name="Clock" size={13} /> Attendance</span>
            </button>            {employee && (
              <>
                {employee.status === 'active' && (
                  <button
                    onClick={async () => {
                      try {
                        await employeeService.setStatus(id, 'terminated');
                        setEmployee({ ...employee, status: 'terminated' });
                      } catch (e) {
                        console.error('Failed to terminate employee', e);
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-red-600 text-white shadow-sm mr-2"
                  >
                    Terminate
                  </button>
                )}
                {employee.status === 'terminated' && (
                  <button
                    onClick={async () => {
                      try {
                        await employeeService.setStatus(id, 'active');
                        setEmployee({ ...employee, status: 'active' });
                      } catch (e) {
                        console.error('Failed to activate employee', e);
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-green-600 text-white shadow-sm"
                  >
                    Activate
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setProfileTab('payslips')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileTab === 'payslips' ? 'bg-sidebar text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-border'}`}
            >
              <span className="flex items-center gap-1.5"><Icon name="FileText" size={13} /> Payslips</span>
            </button>
          </div>

          {/* Attendance Tab */}
          {profileTab === 'attendance' && (
            <div className="p-8">
              {latestAttendance && (
                <div className="mb-6 p-4 bg-muted/60 rounded-xl border border-border">
                  <p className="text-sm font-medium text-foreground">Latest Check‑in: {new Date(latestAttendance.checkInTime).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Status: {latestAttendance.late ? 'Late' : 'On Time'}</p>
                </div>
              )}
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Calendar" size={40} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-muted-foreground/70">No attendance records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase pb-3 pr-4">Date</th>
                        <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase pb-3 pr-4">Check‑in</th>
                        <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase pb-3 pr-4">Check‑out</th>
                        <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase pb-3 pr-4">Hours</th>
                        <th className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.slice(0, 30).map(record => {
                        const checkIn = record.checkInTime ? new Date(record.checkInTime) : null;
                        const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null;
                        const hours = checkIn && checkOut ? ((checkOut - checkIn) / 3600000).toFixed(1) : '--';
                        return (
                          <tr key={record.id} className="border-b border-slate-50 hover:bg-muted/30 transition-all">
                            <td className="py-3 pr-4 text-sm font-medium text-foreground">
                              {checkIn ? checkIn.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                            </td>
                            <td className="py-3 pr-4 text-sm text-muted-foreground">
                              {checkIn ? checkIn.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                            </td>
                            <td className="py-3 pr-4 text-sm text-muted-foreground">
                              {checkOut ? checkOut.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                            </td>
                            <td className="py-3 pr-4 text-sm text-muted-foreground">{hours} hrs</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${record.late ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {record.late ? 'Late' : 'On Time'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {attendanceRecords.length > 30 && (
                    <p className="text-[10px] text-muted-foreground/70 mt-4 text-center">Showing latest 30 records of {attendanceRecords.length} total</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payslips Tab */}
          {profileTab === 'payslips' && (
            <div className="p-8">
              {payslipRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="FileText" size={40} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-muted-foreground/70">No payslips available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payslipRecords.map(slip => (
                    <div key={slip.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/60 transition-all border border-transparent hover:border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon name="FileText" size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {new Date(0, (slip.month || 1) - 1).toLocaleString('default', { month: 'long' })} {slip.year}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">Net Salary: ₹{slip.netSalary?.toLocaleString('en-IN') || '0'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${slip.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : slip.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-muted/60 text-muted-foreground border-border'}`}>
                          {slip.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfileAdmin;
