import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { attendanceService } from '../../../services/attendance.service';

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
  absent: { label: 'Absent', className: 'bg-error/10 text-error border-error/20', icon: 'X' },
  weekend: { label: 'Sunday', className: 'bg-muted text-muted-foreground border-border', icon: 'Calendar' },
  upcoming: { label: 'Upcoming', className: 'bg-muted text-muted-foreground border-border', icon: 'Calendar' },
};

const statusMeta = (type) => STATUS_META[type] || STATUS_META.absent;

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
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangeDays, setRangeDays] = useState(60);
  const [hideEmptyWeekends, setHideEmptyWeekends] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;

    const load = async () => {
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
        if (!cancelled) setTimeline(data);
      } catch (err) {
        console.error('Failed to load attendance timeline:', err);
        if (!cancelled) setError('Could not load attendance records.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [employeeId, rangeDays]);

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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <SummaryTile label="Present" value={summary.present} tone="text-success" />
          <SummaryTile label="Late" value={summary.late} tone="text-warning" />
          <SummaryTile label="WFH" value={summary.wfh} tone="text-primary" />
          <SummaryTile label="Off-site" value={summary.offsite ?? 0} tone="text-warning" />
          <SummaryTile label="Leave" value={summary.leave} tone="text-error" />
          <SummaryTile label="Absent" value={summary.absent} tone="text-error" />
          <SummaryTile label="Hours" value={`${summary.totalHours}h`} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
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
                <DayRow key={day.date} day={day} />
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
    </div>
  );
};

const DayRow = ({ day }) => {
  const meta = statusMeta(day.type);
  const checkIn = formatTime(day.checkInTime);
  const checkOut = formatTime(day.checkOutTime);

  // Sundays and leave get a tinted row so they read as non-working at a glance.
  // Leave wins over the Sunday tint when a leave range spans a weekend — the
  // "Sun" chip still marks the day, so no signal is lost.
  const rowTone =
    day.type === 'leave'
      ? 'bg-error/[0.04]'
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
          {/* WFH is called out on the date itself, not just in the Mode column,
              so it survives a horizontal scroll on narrow screens. */}
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
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${meta.className}`}
        >
          <Icon name={meta.icon} size={11} />
          {meta.label}
        </span>
        {day.leave && (
          <span className="ml-1.5 text-xs text-muted-foreground capitalize">
            {day.leave.type}
          </span>
        )}
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
