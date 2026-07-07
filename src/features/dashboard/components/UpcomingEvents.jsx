import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingEvents = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="bg-card border border-border/60 rounded-[2rem] p-8 h-[500px] animate-pulse">
        <div className="h-6 w-40 bg-muted rounded-full mb-8"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center space-x-4 mb-6 p-5 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded-full"></div>
              <div className="h-3 w-48 bg-muted/60 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Passed';
    return `In ${diffDays} days`;
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return { name: 'Users', color: 'text-primary', bg: 'bg-primary/10' };
      case 'deadline': return { name: 'Clock', color: 'text-rose-600', bg: 'bg-rose-500/10' };
      case 'payroll': return { name: 'DollarSign', color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
      default: return { name: 'Calendar', color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-sm group h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-foreground tracking-tight">Upcoming Events</h3>
          <p className="text-sm text-muted-foreground font-medium">Scheduler & Deadlines</p>
        </div>
        <button
          onClick={() => window.location.href = '/calendar'}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300 shadow-sm"
          title="Calendar View"
        >
          <Icon name="CalendarDays" size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {events?.length > 0 ? (
          events.map((event, idx) => {
            const iconData = getEventIcon(event.type);
            const daysUntil = getDaysUntil(event.date);
            const isUrgent = daysUntil === 'Today' || daysUntil === 'Tomorrow';
            
            return (
              <div 
                key={event.id}
                className="group/item w-full p-4 border border-border rounded-[1.5rem] bg-muted/30 hover:bg-card hover:border-border hover:shadow-sm transition-all duration-500 cursor-pointer animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover/item:scale-110 group-hover/item:rotate-6 shadow-sm ${iconData.bg} ${iconData.color}`}>
                    <Icon name={iconData.name} size={22} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-foreground truncate tracking-tight group-hover/item:text-primary transition-colors">{event.title}</h4>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm ${isUrgent ? 'bg-rose-500 text-white ' : 'bg-sidebar text-white '}`}>
                        {daysUntil}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-1 mb-3 group-hover/item:text-muted-foreground">
                      {event.description || "No additional notes provided."}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide bg-white/50 w-fit px-3 py-1 rounded-full border border-border shadow-sm group-hover/item:border-border transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Icon name="Clock" size={10} strokeWidth={3} className="text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <div className="flex items-center gap-1.5">
                        <Icon name="MapPin" size={10} strokeWidth={3} className="text-muted-foreground" />
                        <span>Room A</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon name="Calendar" size={40} className="text-primary-foreground/70" strokeWidth={2.5} />
            </div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Clear skies ahead</p>
            <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-tighter mt-1">No upcoming events</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border/40">
        <button 
          className="w-full py-4 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all border border-primary/10 uppercase tracking-wide shadow-sm group/btn"
          onClick={() => window.location.href = '/calendar'}
        >
          View Full Calendar
          <Icon name="ArrowRight" size={12} className="inline ml-1.5 transition-transform group-hover/btn:translate-x-1" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default UpcomingEvents;