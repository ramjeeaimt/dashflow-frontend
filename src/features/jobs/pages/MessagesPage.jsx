import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';

const SAMPLE_MSGS = [
  { 
    id: 1, 
    from: 'Alice Smith', 
    email: 'alice@example.com', 
    subject: 'Application for MERN Developer', 
    body: "Hello, please find my resume attached. I have 3 years of experience in React and Node.js.\n\nI am very interested in this role and would love to discuss further.", 
    date: '04/06/2026',
    time: '10:30 AM',
    read: false,
    label: 'Recruitment',
    avatar: 'AS'
  },
  { 
    id: 2, 
    from: 'Support Team', 
    email: 'inquiry@site.com', 
    subject: 'Job Posting Query', 
    body: "Is this role remote? We've had a few questions from candidates asking about the hybrid policy mentioned on the website.", 
    date: '04/05/2026',
    time: '02:15 PM',
    read: true,
    label: 'Query',
    avatar: 'ST'
  },
  { 
    id: 3, 
    from: 'John Doe', 
    email: 'john.doe@techcorp.io', 
    subject: 'Partnership Proposal', 
    body: "Hi Admin,\n\nI am John from TechCorp. We are interested in partnering with your company for the upcoming recruitment drive. Let us know if you have time for a brief call next week.", 
    date: '04/04/2026',
    time: '09:00 AM',
    read: true,
    label: 'Business',
    avatar: 'JD'
  },
];

const LABEL_COLORS = {
  'Recruitment': 'bg-blue-100 text-blue-700',
  'Query': 'bg-amber-100 text-amber-700',
  'Business': 'bg-purple-100 text-purple-700',
  'Urgent': 'bg-red-100 text-red-700',
};

export default function MessagesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [openId, setOpenId] = useState(null);
  useEffect(() => { fetchMsgs(); }, []);

  async function fetchMsgs() {
    try {
      const res = await apiClient.get(API_ENDPOINTS.JOBS.MESSAGES);
      const list = res.data || res || [];
      setMsgs(list);
      if (list.length > 0) setOpenId(list[0].id);
    } catch (err) {
      console.error('Failed to load messages', err);
      // fallback to sample for now
      setMsgs(SAMPLE_MSGS);
      setOpenId(SAMPLE_MSGS[0].id);
    }
  }
  const [search, setSearch] = useState('');

  const handleToggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const filteredMsgs = msgs.filter(m => 
    m.subject.toLowerCase().includes(search.toLowerCase()) || 
    m.from.toLowerCase().includes(search.toLowerCase())
  );

  const currentMsg = msgs.find(m => m.id === openId);

  const markAsRead = (id) => {
    setMsgs(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 h-screen flex flex-col`}>
        <div className="flex-1 flex overflow-hidden">
          
          {/* Inbox List Sidebar */}
          <div className="w-full md:w-80 lg:w-96 border-r border-border/50 bg-card flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="p-4 border-b border-border/50">
              <h1 className="text-xl font-bold text-foreground mb-4">Messages</h1>
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredMsgs.length > 0 ? (
                filteredMsgs.map((m) => (
                  <button 
                    key={m.id} 
                    onClick={() => { setOpenId(m.id); markAsRead(m.id); }}
                    className={`w-full text-left p-4 border-b border-border/30 hover:bg-muted/30 transition-all flex items-start gap-3 relative ${openId === m.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                  >
                    {!m.read && <div className="absolute right-4 top-4 w-2 h-2 bg-primary rounded-full" />}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {m.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">{m.from}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{m.date}</span>
                      </div>
                      <p className={`text-xs truncate ${!m.read ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{m.subject}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">{m.body}</p>
                      {m.label && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${LABEL_COLORS[m.label] || 'bg-muted text-muted-foreground'}`}>
                          {m.label}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground mt-10">
                  <Icon name="MessageSquareOff" size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No messages found</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Detail View */}
          <div className="flex-1 bg-background flex flex-col overflow-hidden relative">
            {currentMsg ? (
              <>
                {/* Detail Header */}
                <div className="p-6 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between animate-in fade-in duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">
                      {currentMsg.avatar}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{currentMsg.from}</h2>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{currentMsg.email}</span>
                        <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                        <span>{currentMsg.date} at {currentMsg.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-border/50">
                      <Icon name="Reply" size={18} />
                    </button>
                    <button className="p-2.5 text-muted-foreground hover:text-error hover:bg-error/10 rounded-xl transition-all border border-border/50">
                      <Icon name="Trash2" size={18} />
                    </button>
                    <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all border border-border/50">
                      <Icon name="MoreVertical" size={18} />
                    </button>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-background to-muted/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${LABEL_COLORS[currentMsg.label] || 'bg-muted text-muted-foreground'} mb-4 inline-block`}>
                        {currentMsg.label}
                      </span>
                      <h1 className="text-2xl font-bold text-foreground leading-tight">{currentMsg.subject}</h1>
                    </div>
                    
                    <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm white-space-pre-line leading-relaxed text-foreground/90">
                      {currentMsg.body.split('\n').map((line, i) => (
                        <p key={i} className="mb-4 last:mb-0">{line}</p>
                      ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-border/50">
                      <h3 className="text-sm font-bold text-foreground mb-4">Quick Reply</h3>
                      <div className="relative group">
                        <textarea 
                          placeholder="Type your message here..."
                          className="w-full p-4 bg-card border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px] resize-none shadow-sm group-hover:border-primary/30"
                        />
                        <button className="absolute bottom-4 right-4 bg-primary text-white p-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                          <Icon name="Send" size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
                <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                  <Icon name="Mail" size={48} className="text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Select a message</h3>
                <p className="text-muted-foreground max-w-xs">Select a conversation from the list to view the full details and respond.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
