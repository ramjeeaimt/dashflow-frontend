import React, { useState, useMemo } from 'react';
import { X, Sparkles, Check, CheckSquare, Square, Download, AlertCircle } from 'lucide-react';
import { getHolidayPresetsForYear } from '../data/holidayPresets';

const ImportPresetsModal = ({
  isOpen,
  onClose,
  existingHolidays = [],
  selectedYear = new Date().getFullYear(),
  onImport,
}) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const presets = useMemo(() => {
    return getHolidayPresetsForYear(selectedYear);
  }, [selectedYear]);

  // Existing dates set
  const existingDateMap = useMemo(() => {
    const map = new Map();
    existingHolidays.forEach((h) => {
      if (h.date) map.set(h.date, h.name);
    });
    return map;
  }, [existingHolidays]);

  // Selected state: default to all non-existing presets checked
  const [selectedDates, setSelectedDates] = useState(() => {
    const set = new Set();
    presets.forEach((p) => {
      if (!existingDateMap.has(p.date)) {
        set.add(p.date);
      }
    });
    return set;
  });

  if (!isOpen) return null;

  const toggleSelect = (date) => {
    const next = new Set(selectedDates);
    if (next.has(date)) {
      next.delete(date);
    } else {
      next.add(date);
    }
    setSelectedDates(next);
  };

  const handleSelectAll = () => {
    const next = new Set();
    presets.forEach((p) => {
      if (!existingDateMap.has(p.date)) {
        next.add(p.date);
      }
    });
    setSelectedDates(next);
  };

  const handleDeselectAll = () => {
    setSelectedDates(new Set());
  };

  const handleConfirmImport = async () => {
    if (selectedDates.size === 0) {
      setError('Please select at least one holiday to import');
      return;
    }

    try {
      setImporting(true);
      setError('');
      const itemsToImport = presets.filter((p) => selectedDates.has(p.date));
      await onImport(itemsToImport);
      onClose();
    } catch (err) {
      console.error('Failed to import presets:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to import holidays');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Import Standard Holidays ({selectedYear})
              </h3>
              <p className="text-xs text-muted-foreground">
                One-click import of official public holidays and major festivals
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selectedDates.size} of {presets.length} holidays selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-primary hover:underline font-medium"
              >
                Select available
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="border border-border rounded-xl divide-y divide-border/60 overflow-hidden">
            {presets.map((preset) => {
              const alreadyExists = existingDateMap.has(preset.date);
              const isSelected = selectedDates.has(preset.date);
              const dateObj = new Date(preset.date + 'T00:00:00');
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={preset.date}
                  onClick={() => !alreadyExists && toggleSelect(preset.date)}
                  className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                    alreadyExists
                      ? 'bg-muted/30 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-primary/5 hover:bg-primary/10 cursor-pointer'
                      : 'hover:bg-muted/40 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {alreadyExists ? (
                        <div className="w-5 h-5 rounded border border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : isSelected ? (
                        <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded border border-border" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{preset.name}</span>
                        {preset.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            {preset.category}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            preset.type === 'half'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {preset.type === 'half' ? 'Half Day' : 'Full Day'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formattedDate} • {preset.description}
                      </p>
                    </div>
                  </div>

                  {alreadyExists && (
                    <span className="shrink-0 text-[11px] font-semibold text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                      Already in calendar
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Imports {selectedDates.size} holidays into your company settings
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={importing || selectedDates.size === 0}
              className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {importing ? 'Importing...' : `Import (${selectedDates.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPresetsModal;

