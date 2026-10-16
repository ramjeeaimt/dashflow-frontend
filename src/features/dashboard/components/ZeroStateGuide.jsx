import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import LottiePlayer from '../../../components/ui/LottiePlayer';

/**
 * Shown when the dashboard is essentially empty — guides the admin to add
 * employees, projects, and attendance instead of staring at zeros.
 */
const ZeroStateGuide = ({ onAddEmployee, onStartTour }) => {
  const items = [
    {
      icon: 'UserPlus',
      title: 'Add employees',
      text: 'Invite your team so headcount and attendance can populate.',
      action: onAddEmployee,
      label: 'Add employee',
    },
    {
      icon: 'Briefcase',
      title: 'Create a project',
      text: 'Open delivery so Active projects leaves zero.',
      to: '/project-management',
      label: 'New project',
    },
    {
      icon: 'UserCheck',
      title: 'Track attendance',
      text: 'Once people are in, check-ins show up in Present today.',
      to: '/attendance-management',
      label: 'Open attendance',
    },
  ];

  return (
    <div
      id="tour-zero-guide"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-white to-[#f7f6fb] p-5 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0">
          <LottiePlayer src="/lottie/empty-guide.json" className="w-full h-full" />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">
            Get started
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Your workspace is ready — fill in the zeros.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
            Nothing is wrong. Add a few people and projects and this dashboard will come alive.
          </p>

          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-white/90 p-3.5 flex flex-col"
              >
                <span className="w-8 h-8 rounded-lg bg-accent text-primary flex items-center justify-center mb-2.5">
                  <Icon name={item.icon} size={16} />
                </span>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed flex-1">{item.text}</p>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {item.label} <Icon name="ArrowRight" size={12} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.action}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline text-left"
                  >
                    {item.label} <Icon name="ArrowRight" size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Replay product tour →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZeroStateGuide;
