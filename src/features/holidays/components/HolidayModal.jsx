import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Sparkles, AlertCircle, Save, CalendarRange, Clock } from 'lucide-react';
import { HOLIDAY_CATEGORIES } from '../data/holidayPresets';

const HolidayModal = ({
  isOpen,
  onClose,
  onSave,
  holidayToEdit = null,
  defaultDate = '',
  selectedYear = new Date().getFullYear(),
}) => {
  const [form, setForm] = useState({
    name: '',
    date: '',
    type: 'full',
    category: 'Festival',
    description: '',
  });

  // Date range state (for multi-day holidays like Diwali, Puja, or year-end shutdown)
  const [isRange, setIsRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [skipSundays, setSkipSundays] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (holidayToEdit) {
      setIsRange(false);
      setForm({
        name: holidayToEdit.name || '',
        date: holidayToEdit.date || '',
        type: holidayToEdit.type || 'full',
        category: holidayToEdit.category || 'Festival',
        description: holidayToEdit.description || '',
      });
      setStartDate(holidayToEdit.date || '');
      setEndDate(holidayToEdit.date || '');
    } else {
      const initial = defaultDate || `${selectedYear}-01-01`;
      setIsRange(false);
      setForm({
        name: '',
        date: initial,
        type: 'full',
        category: 'Festival',
        description: '',
      });
      setStartDate(initial);
      setEndDate(initial);
      setSkipSundays(false);
    }
    setError('');
  }, [holidayToEdit, defaultDate, selectedYear, isOpen]);

  // Compute all dates within range
  const rangeDates = useMemo(() => {
    if (!isRange || !startDate || !endDate) return [];
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

    const list = [];
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay(); // 0 = Sunday
      if (!skipSundays || dayOfWeek !== 0) {
        list.push(cur.toISOString().split('T')[0]);
      }
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  }, [isRange, startDate, endDate, skipSundays]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Please enter a holiday name');
      return;
    }

    if (isRange) {
      if (!startDate || !endDate) {
        setError('Please select both Start Date and End Date for the range');
        return;
      }
      if (startDate > endDate) {
        setError('Start Date cannot be after End Date');
        return;
      }
      if (rangeDates.length === 0) {
        setError('No valid dates in the selected range');
        return;
      }
    } else {
      if (!form.date) {
        setError('Please select a valid date');
        return;
      }
    }

    try {
      setSaving(true);
      setError('');

      if (isRange) {
        await onSave({
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
          isRange: true,
          dates: rangeDates,
          startDate,
          endDate,
        });
      } else {
        await onSave({
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
          isRange: false,
          date: form.date,
          id: holidayToEdit?.id,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save holiday:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to save holiday');
    } finally {
      setSaving(false);
    }
  };

  const commonSuggestions = [
    'Republic Day', 'Holi', 'Good Friday', 'Eid al-Fitr',
    'Independence Day', 'Gandhi Jayanti', 'Dussehra', 'Diwali', 'Christmas Day'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {holidayToEdit ? 'Edit Holiday' : 'Add Company Holiday'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Sets an official paid day off or festival celebration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick suggestions if new */}
          {!holidayToEdit && (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {commonSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        name,
                        category: name.includes('Day') ? 'National Holiday' : 'Festival',
                      }));
                    }}
                    className="text-[11px] font-medium px-2 py-1 rounded-lg bg-muted hover:bg-primary/15 hover:text-primary text-foreground transition-colors"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single Day vs Date Range Selector Toggle */}
          {!holidayToEdit && (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Schedule Type
              </label>
              <div className="grid grid-cols-2 gap-2 bg-muted/40 p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setIsRange(false)}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    !isRange
                      ? 'bg-card text-foreground shadow-xs border border-border/80'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Single Date</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRange(true)}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    isRange
                      ? 'bg-card text-foreground shadow-xs border border-border/80'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5 text-primary" />
                  <span>Date Range (Multi-Day)</span>
                </button>
              </div>
            </div>
          )}

          {/* Holiday Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Holiday / Festival Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Diwali Break, Independence Day, Winter Holidays"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Date Picker (Single Date vs Date Range) */}
          {!isRange ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {HOLIDAY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-xl bg-muted/30 border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Start Date <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    End Date <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={skipSundays}
                    onChange={(e) => setSkipSundays(e.target.checked)}
                    className="rounded border-border accent-primary"
                  />
                  <span>Skip Sundays (exclude weekly off)</span>
                </label>

                {rangeDates.length > 0 && (
                  <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 self-start sm:self-auto">
                    {rangeDates.length} consecutive {rangeDates.length === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>

              {/* Category for Range */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {HOLIDAY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Holiday Duration Type */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Holiday Duration & Compensation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                  form.type === 'full'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background hover:bg-muted/50 text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="holidayType"
                    value="full"
                    checked={form.type === 'full'}
                    onChange={() => setForm((prev) => ({ ...prev, type: 'full' }))}
                    className="accent-primary"
                  />
                  <span className="text-xs font-bold">Full Day Paid</span>
                </div>
                <span className="text-[11px] text-muted-foreground pl-5">
                  100% paid holiday; counts as full present in payroll
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                  form.type === 'half'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'border-border bg-background hover:bg-muted/50 text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="holidayType"
                    value="half"
                    checked={form.type === 'half'}
                    onChange={() => setForm((prev) => ({ ...prev, type: 'half' }))}
                    className="accent-amber-500"
                  />
                  <span className="text-xs font-bold">Half Day Festival</span>
                </div>
                <span className="text-[11px] text-muted-foreground pl-5">
                  Early release or half-day festive celebration
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Office remains closed. Operations resume next working day."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : holidayToEdit ? 'Update Holiday' : isRange ? `Add Range (${rangeDates.length} days)` : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayModal;
