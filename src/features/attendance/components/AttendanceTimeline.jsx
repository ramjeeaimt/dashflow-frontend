import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { attendanceService } from '../../../services/attendance.service';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import { toast } from 'react-hot-toast';

/**
 * Day-by-day attendance for one employee.
 *
 * Every calendar date in the window gets a row — Sundays, leave and absences
 * included — because a table that only lists days with a punch hides exactly
 * the days a reviewer is looking for. Leave and WFH days carry their approval
 * details in a hover card.
 */

const RANGES = [
  { key: 30, label: '30 days' },
  { key: 60, label: '60 days' },
  { key: 90, label: '90 days' },
];

const STATUS_META = {
  present: { label: 'Present', className: 'bg-success/10 text-success border-success/20', icon: 'Check' },
  late: { label: 'Late', className: 'bg-warning/10 text-warning border-warning/25', icon: 'Clock' },
  early_checkin: { label: 'Early in', className: 'bg-primary/10 text-primary border-primary/20', icon: 'LogIn' },
  early_departure: { label: 'Early out', className: 'bg-warning/10 text-warning border-warning/25', icon: 'LogOut' },
  'half-day': { label: 'Half day', className: 'bg-warning/10 text-warning border-warning/25', icon: 'Clock' },
  wfh: { label: 'Work from home', className: 'bg-primary/10 text-primary border-primary/20', icon: 'Home' },
  leave: { label: 'On leave', className: 'bg-error/10 text-error border-error/20', icon: 'Palmtree' },
  holiday: { label: 'Holiday', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'Sparkles' },
  holiday_half: { label: 'Half-Day Holiday', className: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'Sparkles' },
  absent: { label: 'Absent', className: 'bg-error/10 text-error border-error/20', icon: 'X' },
  weekend: { label: 'Sunday', className: 'bg-muted text-muted-foreground border-border', icon: 'Calendar' },
  upcoming: { label: 'Upcoming', className: 'bg-muted text-muted-foreground border-border', icon: 'Calendar' },
};

const statusMeta = (type, day) => {
  if (day?.holiday || type === 'holiday') {
    return {
      label: day?.holiday?.name ? `Holiday: ${day.holiday.name}` : 'Holiday',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'Sparkles',
    };
  }
  if (type === 'holiday_half') {
    return {
      label: day?.holiday?.name ? `Half-Day: ${day.holiday.name}` : 'Half-Day Holiday',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: 'Sparkles',
    };
  }
  return STATUS_META[type] || STATUS_META.absent;
};

/** '09:09:00' -> '9:09 AM'. The API sends a bare time, not a timestamp. */
const formatTime = (time) => {
  if (!time) return null;
  const [h, m] = String(time).split(':');
  const hour = Number(h);
  if (Number.isNaN(hour)) return null;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 === 0 ? 12 : hour % 12}:${m} ${suffix}`;
};

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });

const AttendanceTimeline = ({ employeeId }) => {
  const { user } = useAuthStore();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangeDays, setRangeDays] = useState(60);
  const [hideEmptyWeekends, setHideEmptyWeekends] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    type: 'full',
    description: '',
  });

  const isAdminOrManager =
    user?.roles?.some((r) => ['Super Admin', 'Admin', 'HR Manager', 'Manager'].includes(r.name)) ||
    ['admin@difmo.com', 'info@difmo.com', 'hello@system.com'].includes(user?.email?.toLowerCase()) ||
    Boolean(user?.isSuperAdmin);

  const load = async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - (rangeDays - 1));
      const data = await attendanceService.getTimeline(employeeId, {
        startDate: start.toLocaleDateString('en-CA'),
        endDate: end.toLocaleDateString('en-CA'),
      });
      setTimeline(data);
    } catch (err) {
      console.error('Failed to load attendance timeline:', err);
      setError('Could not load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [employeeId, rangeDays]);

  const handleOpenHolidayModal = (dateStr = '') => {
    const targetDate = dateStr || new Date().toISOString().slice(0, 10);
    let defaultName = '';
    if (targetDate.endsWith('-10-02')) defaultName = 'Gandhi Jayanti';
    else if (targetDate.endsWith('-08-15')) defaultName = 'Independence Day';
    else if (targetDate.endsWith('-01-26')) defaultName = 'Republic Day';
    else if (targetDate.endsWith('-12-25')) defaultName = 'Christmas';

    setHolidayForm({
      name: defaultName,
      date: targetDate,
      type: 'full',
      description: defaultName ? 'Official Public Holiday' : 'Company declared holiday',
    });
    setShowHolidayModal(true);
  };

  const handleSaveHoliday = async (e) => {
    e?.preventDefault();
    if (!holidayForm.name.trim() || !holidayForm.date) {
      toast.error('Please enter a holiday name and date.');
      return;
    }
    const companyId = user?.company?.id || user?.companyId;
    if (!companyId) {
      toast.error('Company ID not found.');
      return;
    }

    try {
      setSavingHoliday(true);
      const compRes = await api.get(`/system-company/id/${companyId}`);
      const compData = compRes.data?.data || compRes.data;
      const existingHolidays = Array.isArray(compData?.holidays) ? compData.holidays : [];

      const newHoliday = {
        id: `hol-${Date.now()}`,
        name: holidayForm.name.trim(),
        date: holidayForm.date,
        type: holidayForm.type || 'full',
        description: holidayForm.description?.trim() || '',
      };

      const updatedHolidays = [
        ...existingHolidays.filter((h) => h.date !== holidayForm.date),
        newHoliday,
      ].sort((a, b) => (a.date > b.date ? 1 : -1));

      await api.patch(`/system-company/${companyId}`, { holidays: updatedHolidays });

      const updatedUser = {
        ...user,
        company: {
          ...user.company,
          holidays: updatedHolidays,
        },
      };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success(`Holiday "${holidayForm.name}" set for ${holidayForm.date}!`);
      setShowHolidayModal(false);
      load();
    } catch (err) {
      console.error('Failed to set holiday:', err);
      toast.error('Failed to set holiday. Please try again.');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleRemoveHoliday = async (dateStr) => {
    const companyId = user?.company?.id || user?.companyId;
    if (!companyId) return;
    if (!window.confirm(`Are you sure you want to remove the holiday on ${dateStr}?`)) return;

    try {
      const compRes = await api.get(`/system-company/id/${companyId}`);
      const compData = compRes.data?.data || compRes.data;
      const existingHolidays = Array.isArray(compData?.holidays) ? compData.holidays : [];
      const updatedHolidays = existingHolidays.filter((h) => h.date !== dateStr);

      await api.patch(`/system-company/${companyId}`, { holidays: updatedHolidays });

      const updatedUser = {
        ...user,
        company: {
          ...user.company,
          holidays: updatedHolidays,
        },
      };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success(`Holiday on ${dateStr} removed!`);
      load();
    } catch (err) {
      console.error('Failed to remove holiday:', err);
      toast.error('Failed to remove holiday.');
    }
  };

  const days = useMemo(() => {
    const all = timeline?.days || [];
    if (!hideEmptyWeekends) return all;
    return all.filter((d) => !(d.isWeekend && !d.checkInTime));
  }, [timeline, hideEmptyWeekends]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading attendance…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Icon name="AlertCircle" size={28} className="text-error mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  const summary = timeline?.summary;

  return (
    <div className="space-y-5">
      <WorkModeSummary policy={timeline?.wfhPolicy} requests={timeline?.wfhRequests} />

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <SummaryTile label="Present" value={summary.present} tone="text-success" />
          <SummaryTile label="Late" value={summary.late} tone="text-warning" />
          <SummaryTile label="WFH" value={summary.wfh} tone="text-primary" />
          <SummaryTile label="Off-site" value={summary.offsite ?? 0} tone="text-warning" />
          <SummaryTile label="Leave" value={summary.leave} tone="text-error" />
          <SummaryTile label="Holiday" value={summary.holidays ?? 0} tone="text-amber-600" />
          <SummaryTile label="Absent" value={summary.absent} tone="text-error" />
          <SummaryTile label="Hours" value={`${summary.totalHours}h`} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {RANGES.map((range) => (
              <button
                key={range.key}
                onClick={() => setRangeDays(range.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  rangeDays === range.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {isAdminOrManager && (
            <button
              type="button"
              onClick={() => handleOpenHolidayModal()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Icon name="Sparkles" size={13} />
              <span>Declare Holiday</span>
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideEmptyWeekends}
            onChange={(e) => setHideEmptyWeekends(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Hide empty Sundays
        </label>
      </div>

      {days.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="Calendar" size={32} className="text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No days in this range.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Date', 'Check-in', 'Check-out', 'Hours', 'Status', 'Mode'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {days.map((day) => (
                <DayRow
                  key={day.date}
                  day={day}
                  isAdminOrManager={isAdminOrManager}
                  onOpenHolidayModal={handleOpenHolidayModal}
                  onRemoveHoliday={handleRemoveHoliday}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary && (
        <p className="text-xs text-muted-foreground text-center">
          Showing every day from {formatDate(summary.rangeStart)} to{' '}
          {formatDate(summary.rangeEnd)} — {summary.totalDays} days, nothing hidden.
        </p>
      )}

      {/* Declare Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Icon name="Sparkles" size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Set Company Holiday</h4>
                  <p className="text-xs text-muted-foreground">Marks this date as a paid holiday for the entire company</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHolidayModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Holiday Date</label>
                <input
                  type="date"
                  required
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Holiday / Festival Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gandhi Jayanti, Diwali, Eid al-Fitr"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder-slate-400 bg-background text-foreground"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'Gandhi Jayanti',
                    'Diwali',
                    'Dussehra',
                    'Independence Day',
                    'Republic Day',
                    'Eid al-Fitr',
                    'Christmas',
                    'Holi',
                  ].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setHolidayForm({ ...holidayForm, name: quick })}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-muted hover:bg-amber-100 hover:text-amber-800 text-muted-foreground border border-border transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Holiday Duration</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                    holidayForm.type === 'full' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
                  }`}>
                    <input
                      type="radio"
                      name="holidayType"
                      checked={holidayForm.type === 'full'}
                      onChange={() => setHolidayForm({ ...holidayForm, type: 'full' })}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Full Day (Paid)</span>
                  </label>
                  <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                    holidayForm.type === 'half' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
                  }`}>
                    <input
                      type="radio"
                      name="holidayType"
                      checked={holidayForm.type === 'half'}
                      onChange={() => setHolidayForm({ ...holidayForm, type: 'half' })}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Half Day Festival</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. National holiday celebration"
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder-slate-400 bg-background text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border mt-5">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHoliday}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Icon name="Sparkles" size={14} />
                  <span>{savingHoliday ? 'Saving...' : 'Set as Holiday'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DayRow = ({ day, isAdminOrManager, onOpenHolidayModal, onRemoveHoliday }) => {
  const meta = statusMeta(day.type, day);
  const checkIn = formatTime(day.checkInTime);
  const checkOut = formatTime(day.checkOutTime);

  // Sundays, holidays and leave get a tinted row
  const rowTone =
    day.type === 'leave'
      ? 'bg-error/[0.04]'
      : (day.type === 'holiday' || day.type === 'holiday_half' || day.holiday)
        ? 'bg-amber-50/40'
        : day.isWeekend
          ? 'bg-muted/40'
          : day.isWfh
            ? 'bg-primary/[0.04]'
            : '';

  const tooltip = buildTooltip(day);

  return (
    <tr
      className={`group relative hover:bg-muted/60 transition-colors ${rowTone}`}
      title={tooltip}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              day.isToday ? 'font-semibold text-primary' : 'font-medium text-foreground'
            }`}
          >
            {day.weekdayName.slice(0, 3)}, {formatDate(day.date)}
          </span>
          {day.isWeekend && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
              Sun
            </span>
          )}
          {day.isToday && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
              Today
            </span>
          )}
          {day.holiday && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              <Icon name="Sparkles" size={9} />
              {day.holiday.name || 'Holiday'}
            </span>
          )}
          {/* WFH is called out on the date itself, not just in the Mode column */}
          {day.isWfh && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
              <Icon name="Home" size={9} />
              WFH
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-foreground tabular-nums">
        {checkIn || <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-4 py-3 text-sm text-foreground tabular-nums">
        {checkOut || <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-4 py-3 text-sm text-foreground tabular-nums">
        {day.workHours != null ? (
          <>
            {day.workHours}h
            {day.overtime > 0 && (
              <span className="ml-1.5 text-xs text-warning">+{day.overtime}h OT</span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border ${meta.className}`}
          >
            <Icon name={meta.icon} size={11} />
            {meta.label}
          </span>
          {day.leave && (
            <span className="text-xs text-muted-foreground capitalize">
              {day.leave.type}
            </span>
          )}

          {/* Quick Admin Holiday Actions */}
          {isAdminOrManager && day.holiday && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHoliday(day.date);
              }}
              title={`Remove ${day.holiday.name || 'holiday'}`}
              className="p-1 rounded text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <Icon name="Trash2" size={12} />
            </button>
          )}

          {isAdminOrManager && !day.holiday && !day.checkInTime && !day.isWeekend && !day.isFuture && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenHolidayModal(day.date);
              }}
              title="Declare this day as an official Holiday"
              className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 shadow-2xs"
            >
              <Icon name="Sparkles" size={10} />
              <span>Set Holiday</span>
            </button>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <WorkModeCell mode={day.workMode} />
      </td>
    </tr>
  );
};

/**
 * Where the day was worked from. The server resolves this from the geofence and
 * the WFH evidence, so raw coordinates never reach the table.
 */
const MODE_STYLES = {
  wfh: { icon: 'Home', className: 'text-primary' },
  office: { icon: 'Building', className: 'text-muted-foreground' },
  offsite: { icon: 'MapPin', className: 'text-warning' },
  unknown: { icon: 'HelpCircle', className: 'text-muted-foreground' },
};

const WorkModeCell = ({ mode }) => {
  if (!mode || mode.type === 'none' || !mode.label) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const style = MODE_STYLES[mode.type] || MODE_STYLES.unknown;

  return (
    <span
      title={mode.detail || ''}
      className={`inline-flex items-center gap-1.5 text-xs font-medium max-w-[200px] ${style.className}`}
    >
      <Icon name={style.icon} size={12} className="shrink-0" />
      <span className="truncate">{mode.label}</span>
    </span>
  );
};

/** Native title tooltip — details on hover without pulling in a popover lib. */
const buildTooltip = (day) => {
  const lines = [`${day.weekdayName}, ${day.date}`];

  if (day.holiday) {
    lines.push(
      `Official Holiday: ${day.holiday.name} (${day.holiday.type === 'half' ? 'Half-Day' : 'Full Day Paid'})`
    );
    if (day.holiday.description) lines.push(`Details: ${day.holiday.description}`);
  }

  if (day.leave) {
    lines.push(
      `Leave: ${day.leave.type}`,
      `Reason: ${day.leave.reason || 'Not stated'}`,
      `Period: ${day.leave.startDate} to ${day.leave.endDate}`
    );
    if (day.leave.adminComment) lines.push(`Admin note: ${day.leave.adminComment}`);
  }

  if (day.wfh?.source === 'request') {
    lines.push(
      'Approved work from home',
      `Reason: ${day.wfh.reason || 'Not stated'}`,
      `Period: ${day.wfh.startDate} to ${day.wfh.endDate}`
    );
    if (day.wfh.adminComment) lines.push(`Admin note: ${day.wfh.adminComment}`);
  } else if (day.wfh?.source === 'contract') {
    lines.push('Fully remote employee — works from home by default.');
  } else if (day.wfh?.source === 'logged') {
    lines.push('Checked in as work from home.');
  }

  if (day.workMode?.detail) lines.push(day.workMode.detail);
  if (day.isWeekend && !day.checkInTime) lines.push('Sunday — weekly off.');
  if (day.type === 'absent') lines.push('No check-in recorded for this working day.');
  if (day.notes) lines.push(`Notes: ${day.notes}`);

  return lines.join('\n');
};

const SummaryTile = ({ label, value, tone = 'text-foreground' }) => (
  <div className="bg-muted/40 rounded-lg px-3 py-2.5 text-center">
    <p className={`text-lg font-semibold tabular-nums ${tone}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

/**
 * States plainly whether this person is always remote or was granted specific
 * days, and lists the approved windows.
 */
export const WorkModeSummary = ({ policy, requests = [] }) => {
  if (!policy) return null;

  const isRemote = policy.mode === 'permanent' || policy.mode === 'hybrid';

  return (
    <div
      className={`rounded-lg border p-4 ${
        isRemote ? 'border-primary/25 bg-primary/5' : 'border-border bg-muted/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isRemote ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon name={isRemote ? 'Home' : 'Building'} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">{policy.label}</h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-card border border-border text-muted-foreground capitalize">
              {policy.employeeType || 'office'}
            </span>
            {policy.wfhDaysLogged > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                {policy.wfhDaysLogged} WFH day{policy.wfhDaysLogged === 1 ? '' : 's'} logged
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{policy.description}</p>

          {requests.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="flex flex-wrap items-baseline gap-x-2 text-xs bg-card border border-border rounded-md px-3 py-2"
                >
                  <span className="font-medium text-foreground">
                    {formatDate(req.startDate)} – {formatDate(req.endDate)}
                  </span>
                  <span className="text-muted-foreground">
                    ({req.days} day{req.days === 1 ? '' : 's'})
                  </span>
                  <span className="text-muted-foreground truncate">
                    · {req.reason || 'No reason given'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTimeline;
