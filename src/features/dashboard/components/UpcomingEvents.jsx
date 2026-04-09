import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingEvents = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 h-[500px] animate-pulse">
        <div className="h-6 w-40 bg-slate-100 rounded-full mb-8"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center space-x-4 mb-6 p-5 bg-slate-50/50 rounded-2xl">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
              <div className="h-3 w-48 bg-slate-50 rounded-full"></div>
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
      case 'meeting': return { name: 'Users', color: 'text-violet-600', bg: 'bg-violet-500/10' };
      case 'deadline': return { name: 'Clock', color: 'text-rose-600', bg: 'bg-rose-500/10' };
      case 'payroll': return { name: 'DollarSign', color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
      default: return { name: 'Calendar', color: 'text-blue-600', bg: 'bg-blue-500/10' };
    }
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 group h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Upcoming Events</h3>
          <p className="text-sm text-slate-500 font-medium">Scheduler & Deadlines</p>
        </div>
        <button
          onClick={() => window.location.href = '/calendar'}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-500/5 rounded-xl transition-all duration-300 shadow-sm"
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
                className="group/item w-full p-4 border border-slate-100 rounded-[1.5rem] bg-slate-50/30 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-500 cursor-pointer animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover/item:scale-110 group-hover/item:rotate-6 shadow-sm ${iconData.bg} ${iconData.color}`}>
                    <Icon name={iconData.name} size={22} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-black text-slate-900 truncate tracking-tight group-hover/item:text-blue-600 transition-colors">{event.title}</h4>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm ${isUrgent ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-900 text-white shadow-slate-900/10'}`}>
                        {daysUntil}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3 group-hover/item:text-slate-600">
                      {event.description || "No additional notes provided."}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/50 w-fit px-3 py-1 rounded-full border border-slate-100 shadow-sm group-hover/item:border-slate-200 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Icon name="Clock" size={10} strokeWidth={3} className="text-slate-500" />
                        <span>{event.time}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <div className="flex items-center gap-1.5">
                        <Icon name="MapPin" size={10} strokeWidth={3} className="text-slate-500" />
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
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Icon name="Calendar" size={40} className="text-blue-200" strokeWidth={2.5} />
            </div>
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Clear skies ahead</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">No upcoming events</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200/40">
        <button 
          className="w-full py-4 text-xs font-black text-blue-600 bg-blue-500/5 hover:bg-blue-500/10 rounded-2xl transition-all border border-blue-500/10 uppercase tracking-widest active:scale-95 shadow-sm shadow-blue-500/5 group/btn"
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