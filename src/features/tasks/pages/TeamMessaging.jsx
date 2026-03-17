// TeamMessaging.jsx
import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

const TeamMessaging = ({
  messages,
  employees,
  currentUser,
  onSendMessage,
  onThreadSelect,
  selectedThread
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedThread]);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getThreadMessages = () => {
    if (!selectedThread) return [];
    return messages.filter(m => 
      (m.senderId === selectedThread.userId && m.recipientId === currentUser.id) ||
      (m.senderId === currentUser.id && m.recipientId === selectedThread.userId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    
    onSendMessage(selectedThread.userId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="bg-card rounded-lg border border-border h-[600px] flex">
      {/* Employee List */}
      <div className="w-1/3 border-r border-border overflow-y-auto">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        {filteredEmployees.map((employee) => {
          const unreadCount = messages.filter(m => 
            m.senderId === employee.id && 
            m.recipientId === currentUser.id && 
            !m.read
          ).length;

          return (
            <button
              key={employee.id}
              onClick={() => onThreadSelect({
                userId: employee.id,
                name: employee.name,
                avatar: employee.avatar
              })}
              className={`w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition border-b border-border ${
                selectedThread?.userId === employee.id ? 'bg-accent' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={employee.avatar || `https://i.pravatar.cc/40?u=${employee.id}`}
                  alt={employee.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-card rounded-full ${
                  employee.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{employee.name}</p>
                  {unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{employee.department}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="p-3 border-b border-border flex items-center gap-3">
              <img
                src={selectedThread.avatar || `https://i.pravatar.cc/32?u=${selectedThread.userId}`}
                alt={selectedThread.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium text-foreground">{selectedThread.name}</p>
                <p className="text-xs text-muted-foreground">
                  {employees.find(e => e.id === selectedThread.userId)?.department}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {getThreadMessages().map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${
                    message.senderId === currentUser.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  } rounded-lg px-4 py-2`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  iconName="Send"
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">Select a conversation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a team member to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMessaging;