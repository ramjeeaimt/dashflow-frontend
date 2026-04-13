import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import apiClient from 'api/client';
import { API_ENDPOINTS } from 'api/endpoints';

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

export default function MessagesTab() {
  const [msgs, setMsgs] = useState([]);
  const [openId, setOpenId] = useState(null);
  useEffect(() => { fetchMsgs(); }, []);

  async function fetchMsgs() {
    try {
      const res = await apiClient.get(API_ENDPOINTS.CONTACT.BASE);
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.contacts || []);
      
      const list = rawList.map(c => ({
        id: c._id || c.id,
        from: c.name || 'Unknown',
        email: c.email || '',
        subject: c.subject || 'No Subject',
        body: c.message || '',
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
        time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
        read: true,
        label: 'Contact',
        avatar: (c.name || 'C')[0].toUpperCase(),
        raw: c
      }));
      if (list.length > 0) {
          setMsgs(list);
          setOpenId(list[0].id || list[0]._id);
      } else {
        setMsgs(SAMPLE_MSGS);
        setOpenId(SAMPLE_MSGS[0].id);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
      // fallback to sample for now
      setMsgs(SAMPLE_MSGS);
      setOpenId(SAMPLE_MSGS[0].id);
    }
  }
  const [search, setSearch] = useState('');

  const filteredMsgs = msgs.filter(m => 
    m.subject.toLowerCase().includes(search.toLowerCase()) || 
    m.from.toLowerCase().includes(search.toLowerCase())
  );

  const currentMsg = msgs.find(m => (m.id || m._id) === openId);

  const markAsRead = (id) => {
    setMsgs(prev => prev.map(m => (m.id || m._id) === id ? { ...m, read: true } : m));
  };

  return (
    <div className="w-full flex h-[calc(100vh-200px)] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Inbox List Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-lg font-semibold text-gray-800 mb-3">Messages</h1>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMsgs.length > 0 ? (
            filteredMsgs.map((m) => {
              const msgId = m.id || m._id;
              return (
              <button 
                key={msgId} 
                onClick={() => { setOpenId(msgId); markAsRead(msgId); }}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-100 transition-all flex items-start gap-3 relative ${openId === msgId ? 'bg-blue-50 hover:bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
              >
                {!m.read && <div className="absolute right-4 top-4 w-2 h-2 bg-blue-500 rounded-full" />}
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                  {m.avatar || m.from?.[0]?.toUpperCase() || 'M'}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">{m.from}</span>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{m.date}</span>
                  </div>
                  <p className={`text-xs truncate mb-1 ${!m.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{m.subject}</p>
                  <p className="text-[11px] text-gray-500 truncate">{m.body}</p>
                  {m.label && (
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${LABEL_COLORS[m.label] || 'bg-gray-200 text-gray-700'}`}>
                      {m.label}
                    </span>
                  )}
                </div>
              </button>
            )})
          ) : (
            <div className="p-8 text-center text-gray-400 mt-10">
              <Icon name="MessageSquareOff" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages found</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail View */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
        {currentMsg ? (
          <>
            {/* Detail Header */}
            <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {currentMsg.avatar || currentMsg.from?.[0]?.toUpperCase() || 'M'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{currentMsg.from}</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{currentMsg.email}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{currentMsg.date} at {currentMsg.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
                  <Icon name="Reply" size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100">
                  <Icon name="Trash2" size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200">
                  <Icon name="MoreVertical" size={18} />
                </button>
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${LABEL_COLORS[currentMsg.label] || 'bg-gray-200 text-gray-700'} mb-3 inline-block`}>
                    {currentMsg.label || 'General'}
                  </span>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{currentMsg.subject}</h1>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm whitespace-pre-wrap leading-relaxed text-gray-700 text-sm">
                  {currentMsg.body}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Reply</h3>
                  <div className="relative group">
                    <textarea 
                      placeholder="Type your reply here..."
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all min-h-[120px] resize-none shadow-sm pb-14"
                    />
                    <button className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium flex items-center gap-2">
                      <Icon name="Send" size={14} /> Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5 border border-gray-200">
              <Icon name="Mail" size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Select a message</h3>
            <p className="text-gray-500 text-sm max-w-xs">Select a conversation from the sidebar to view full details and respond.</p>
          </div>
        )}
      </div>
    </div>
  );
}
