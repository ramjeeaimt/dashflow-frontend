import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteHolidayModal = ({
  isOpen,
  onClose,
  holiday,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !holiday) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onConfirm(holiday);
      onClose();
    } catch (err) {
      console.error('Failed to delete holiday:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Remove Holiday</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to remove this holiday?
            </p>
          </div>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border/80 text-xs space-y-1">
          <div className="font-bold text-foreground">{holiday.name}</div>
          <div className="text-muted-foreground">
            {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' • '}
            <span>{holiday.type === 'half' ? 'Half-Day Festival' : 'Full Day Paid Holiday'}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Employees will no longer see this day marked as a company holiday in attendance or payroll.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Removing...' : 'Remove Holiday'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHolidayModal;

