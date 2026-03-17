// TeamActivityTracker.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatDistanceToNow } from 'date-fns';

const TeamActivityTracker = ({ teamActivity, currentUser, onMessageUser }) => {
  const onlineMembers = teamActivity.filter(m => m.status === 'online');
  const offlineMembers = teamActivity.filter(m => m.status === 'offline');

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Team Activity</h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {onlineMembers.length} online
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Online Now</h4>
            <div className="space-y-2">
              {onlineMembers.slice(0, 5).map((member) => (
                <div key={member.userId} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={member.avatar || `https://i.pravatar.cc/32?u=${member.userId}`}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.name}
                        {member.userId === currentUser?.id && ' (You)'}
                      </p>
                      {member.currentTask && (
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          Working on: {member.currentTask}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onMessageUser(member.userId)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-accent rounded"
                  >
                    <Icon name="MessageSquare" size={16} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
              {onlineMembers.length > 5 && (
                <p className="text-xs text-primary mt-2">+{onlineMembers.length - 5} more online</p>
              )}
            </div>
          </div>
        )}

        {/* Recently Active */}
        {offlineMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Recently Active</h4>
            <div className="space-y-2">
              {offlineMembers.slice(0, 3).map((member) => (
                <div key={member.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={member.avatar || `https://i.pravatar.cc/32?u=${member.userId}`}
                        alt={member.name}
                        className="w-8 h-8 rounded-full opacity-60"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 border-2 border-card rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active {formatDistanceToNow(new Date(member.lastActive), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="border-t border-border p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{teamActivity.length}</p>
            <p className="text-xs text-muted-foreground">Total Team</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{onlineMembers.length}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {teamActivity.filter(m => m.currentTask).length}
            </p>
            <p className="text-xs text-muted-foreground">On Task</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamActivityTracker;