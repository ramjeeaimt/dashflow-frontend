import React from 'react';
import Icon from '../../../components/AppIcon';

/**
 * Compact work-from-home indicator for profile headers and employee lists.
 *
 * The distinction it carries is the one people actually ask about: is this
 * person remote by contract, or was WFH approved for particular days?
 */

const MODES = {
  permanent: {
    label: 'Fully remote',
    hint: 'Works from home permanently',
    icon: 'Home',
    className: 'bg-primary/10 text-primary border-primary/25',
  },
  hybrid: {
    label: 'WFH enabled',
    hint: 'Hybrid — may check in from home',
    icon: 'Home',
    className: 'bg-primary/10 text-primary border-primary/25',
  },
  occasional: {
    label: 'Occasional WFH',
    hint: 'Office based, with approved WFH days',
    icon: 'Laptop',
    className: 'bg-warning/10 text-warning border-warning/25',
  },
  office: {
    label: 'Office based',
    hint: 'No work-from-home arrangement',
    icon: 'Building',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

/**
 * Derives the same shape the timeline endpoint returns as `wfhPolicy`, from an
 * employee record alone. Lists use this so a row can show WFH without one API
 * call per employee — the trade-off is that it can't see approved one-off WFH
 * requests, so it reports the standing arrangement only.
 */
export const policyFromEmployee = (employee) => {
  if (!employee) return null;

  if (employee.employeeType === 'remote') {
    return {
      mode: 'permanent',
      label: 'Fully remote',
      description: 'Works from home permanently.',
    };
  }
  if (employee.workFromHome) {
    return {
      mode: 'hybrid',
      label: 'WFH enabled',
      description: 'Work from home is enabled — may check in from home.',
    };
  }
  return {
    mode: 'office',
    label: 'Office based',
    description: 'No standing work-from-home arrangement.',
  };
};

const WorkModeBadge = ({ policy, size = 'sm', showHint = false, hideOffice = false }) => {
  if (!policy) return null;
  // In dense lists only the exception is worth the pixels.
  if (hideOffice && policy.mode === 'office') return null;
  const mode = MODES[policy.mode] || MODES.office;

  return (
    <span
      title={policy.description || mode.hint}
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${mode.className} ${
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'
      }`}
    >
      <Icon name={mode.icon} size={size === 'sm' ? 12 : 14} />
      {policy.label || mode.label}
      {showHint && policy.wfhDaysLogged > 0 && (
        <span className="opacity-70">· {policy.wfhDaysLogged}d</span>
      )}
    </span>
  );
};

export default WorkModeBadge;
