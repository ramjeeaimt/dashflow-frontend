import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivityFeed = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="bg-card border border-border/60 rounded-[2rem] p-8 h-[500px] animate-pulse">
        <div className="h-6 w-40 bg-muted rounded-full mb-8"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center space-x-4 mb-6">
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

  const getIconConfig = (type) => {
    switch (type) {
      case 'checkin': return { name: 'LogIn', color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
      case 'checkout': return { name: 'LogOut', color: 'text-rose-600', bg: 'bg-rose-500/10' };
      case 'task': return { name: 'CheckCircle', color: 'text-primary', bg: 'bg-primary/10' };
      case 'leave': return { name: 'Calendar', color: 'text-amber-600', bg: 'bg-amber-500/10' };
      default: return { name: 'Info', color: 'text-muted-foreground', bg: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-sm group h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-foreground tracking-tight">Recent Activity</h3>
          <p className="text-sm text-muted-foreground font-medium">Live team updates</p>
        </div>
        <button
          onClick={() => window.location.href = '/activity-log'}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300"
          title="View All"
        >
          <Icon name="ArrowUpRight" size={20} />
        </button>
      </div>

      <div className="space-y-1 relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-2 bottom-2 w-px bg-muted"></div>

        {activities?.length > 0 ? (
          activities.map((activity, idx) => {
            const config = getIconConfig(activity.type);
            return (
              <div 
                key={activity.id} 
                className="relative flex items-start space-x-4 p-4 hover:bg-muted/80 rounded-lg transition-all duration-300 group/item animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${config.bg} ${config.color} border border-white shadow-sm transition-transform duration-500 group-hover/item:scale-110 group-hover/item:rotate-3`}>
                  <Icon name={config.name} size={20} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate tracking-tight">
                      {activity.message || activity.user}
                    </p>
                    <span className="text-[10px] font-semibold text-muted-foreground/70 ml-2 whitespace-nowrap uppercase tracking-wide bg-muted/60 px-2 py-0.5 rounded-full border border-border">
                      {activity.time || activity.timestamp}
                    </span>
                  </div>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-medium italic opacity-80">{activity.details}</p>
                  )}
                  {activity.location && (
                    <div className="flex items-center space-x-1.5 mt-2">
                      <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                        <Icon name="MapPin" size={10} className="text-muted-foreground/70" strokeWidth={3} />
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-tight">{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mb-4">
              <Icon name="Activity" size={40} className="text-muted-foreground/70 opacity-30" strokeWidth={3} />
            </div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">No recent pulses detected</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border/40">
        <button 
          className="w-full py-4 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all border border-primary/10 uppercase tracking-wide shadow-sm group/btn"
          onClick={() => window.location.href = '/activity-log'}
        >
          View Full Timeline
          <Icon name="ArrowRight" size={12} className="inline ml-1.5 transition-transform group-hover/btn:translate-x-1" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default RecentActivityFeed;