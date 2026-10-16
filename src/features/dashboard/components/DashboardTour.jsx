import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_KEY = 'dashflow_dashboard_tour_v1';

/**
 * Animated product tour for first-time / empty dashboards.
 * Highlights greeting → metrics → attendance → quick actions.
 */
export function useDashboardTour({ enabled, onAddEmployee }) {
  const tourRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(TOUR_KEY) === 'done') return;

    const timer = setTimeout(() => {
      if (tourRef.current) {
        try {
          tourRef.current.destroy();
        } catch {
          /* ignore */
        }
      }

      const tour = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayOpacity: 0.55,
        stagePadding: 10,
        stageRadius: 12,
        popoverClass: 'dashflow-tour-popover',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Add employee',
        onDestroyStarted: () => {
          if (!tour.isLastStep?.() && !tour.isActive?.()) {
            localStorage.setItem(TOUR_KEY, 'done');
            tour.destroy();
            return;
          }
          localStorage.setItem(TOUR_KEY, 'done');
          tour.destroy();
        },
        onDestroyed: () => {
          localStorage.setItem(TOUR_KEY, 'done');
        },
        steps: [
          {
            element: '#tour-greeting',
            popover: {
              title: 'Welcome to your workspace',
              description:
                'This is your home base. Metrics fill in as you add people, attendance, and projects.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-metrics',
            popover: {
              title: 'Your pulse at a glance',
              description:
                'Right now most numbers are zero — normal for a new company. Add employees to light these up.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-attendance',
            popover: {
              title: 'Attendance over the week',
              description:
                'Once the team checks in, this chart shows who was present. Start by adding people.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-quick-actions',
            popover: {
              title: 'Start here',
              description:
                'Use Quick actions to add an employee, post a job, or review applications — the fastest way out of zero.',
              side: 'left',
              align: 'start',
              onNextClick: () => {
                localStorage.setItem(TOUR_KEY, 'done');
                tour.destroy();
                if (typeof onAddEmployee === 'function') onAddEmployee();
              },
            },
          },
        ],
      });

      tourRef.current = tour;
      tour.drive();
    }, 700);

    return () => {
      clearTimeout(timer);
      if (tourRef.current) {
        try {
          tourRef.current.destroy();
        } catch {
          /* ignore */
        }
        tourRef.current = null;
      }
    };
  }, [enabled, onAddEmployee]);
}

export function resetDashboardTour() {
  localStorage.removeItem(TOUR_KEY);
}

export default useDashboardTour;
