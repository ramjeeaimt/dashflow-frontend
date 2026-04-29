import React, { useState, useEffect, useRef } from 'react';
import './TemplateDesigner.css';
import { Save, Eye, Layout, Type, Palette, ChevronLeft, Trash2, Send, CheckCircle2, Maximize2, Minimize2, Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import useAuthStore from '../../../store/useAuthStore';

const TemplateDesignerPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const editorRef = useRef(null);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(true);
  
  const [template, setTemplate] = useState({
    name: '',
    title: '',
    message: '',
    type: 'email'
  });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (id) {
      const savedTemplates = JSON.parse(localStorage.getItem('notification_templates') || '[]');
      const found = savedTemplates.find(t => t.id.toString() === id);
      if (found) {
        setTemplate(found);
      }
    }
  }, [id]);

  useEffect(() => {
    if (editorRef.current && template.message !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = template.message || '';
    }
  }, [id]);

  const handleSave = () => {
    if (!template.name || !template.title || !template.message) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const savedTemplates = JSON.parse(localStorage.getItem('notification_templates') || '[]');
    let updated;
    
    if (id) {
      updated = savedTemplates.map(t => t.id.toString() === id ? { ...template } : t);
    } else {
      const newTemplate = {
        ...template,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      updated = [newTemplate, ...savedTemplates];
    }

    localStorage.setItem('notification_templates', JSON.stringify(updated));
    setFeedback({ type: 'success', message: 'Template saved successfully!' });
    
    setTimeout(() => {
      navigate('/notifications/templates');
    }, 1500);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setTemplate(prev => ({ ...prev, message: editorRef.current.innerHTML }));
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setTemplate(prev => ({ ...prev, message: editorRef.current.innerHTML }));
    }
  };

  const getPreviewHtml = () => {
    const year = new Date().getFullYear();
    const footerImageUrl = 'https://res.cloudinary.com/dxju8ikk4/image/upload/v1777462000/difmo_footer_services.png';
    
    return `
      <div style="font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 0; color: #1e293b; width: 100%; min-height: 100%;">
        <div style="width: 100%; max-width: 1000px; margin: 0 auto; background-color: #ffffff; overflow: hidden; border-bottom: 1px solid #e2e8f0;">
          <div style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
            <div style="margin-bottom: 25px;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #ffffff; text-transform: uppercase;">
                <span style="color: #f59e0b;">DIFMO</span>
              </span>
            </div>
            <h1 style="margin: 0; font-size: 36px; font-weight: 800; color: #ffffff; line-height: 1.2;">${template.title || 'Notification Subject'}</h1>
          </div>
          
          <div style="padding: 60px 40px; min-height: 400px;">
            <div style="font-size: 18px; color: #334155; line-height: 1.8; margin-bottom: 40px;">
              ${template.message || 'The notification message content will appear here...'}
            </div>
            
            <div style="margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 40px; text-align: left;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">If you have any questions, feel free to reply to this email.</p>
              <p style="margin: 10px 0 0 0; font-weight: 700; color: #0f172a; font-size: 18px;">Team DIFMO</p>
            </div>
          </div>
          
          <div style="line-height: 0;">
            <img src="${footerImageUrl}" alt="DIFMO" style="width: 100%; height: auto; display: block;">
          </div>

          <div style="padding: 40px 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
              <tr>
                <td align="center">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 0 20px; text-align: center;">
                        <a href="mailto:info@difmo.com" style="text-decoration: none; color: #0f172a; font-size: 14px; font-weight: 700;">
                          <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" width="18" style="display: block; margin: 0 auto 8px auto;">
                          info@difmo.com
                        </a>
                      </td>
                      <td style="padding: 0 20px; text-align: center;">
                        <a href="https://www.difmo.com" style="text-decoration: none; color: #0f172a; font-size: 14px; font-weight: 700;">
                          <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="18" style="display: block; margin: 0 auto 8px auto;">
                          www.difmo.com
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="#" style="display: inline-block; margin: 0 12px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" width="28" height="28" alt="LinkedIn">
              </a>
              <a href="#" style="display: inline-block; margin: 0 12px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" width="28" height="28" alt="Facebook">
              </a>
              <a href="#" style="display: inline-block; margin: 0 12px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/145/145812.png" width="28" height="28" alt="Twitter">
              </a>
            </div>
          </div>
          
          <div style="padding: 40px; text-align: center; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8; letter-spacing: 1px;">&copy; ${year} DIFMO PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          {/* Top Bar */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/notifications/templates')}
                className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Email Templates
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                  {id ? 'Edit Template' : 'Design Template'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md ${showForm ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {showForm ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                {showForm ? 'Hide Editor' : 'Show Editor'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                <Save size={18} /> Save Template
              </button>
            </div>
          </div>

          {feedback && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <CircleAlert size={20} />}
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
          )}

          <div className={`flex gap-8 items-start transition-all duration-500 relative`}>
            {/* Floating Restore Button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className={`fixed ${sidebarCollapsed ? 'left-16' : 'left-60'} top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white p-3 rounded-r-2xl shadow-2xl hover:bg-blue-700 transition-all animate-in slide-in-from-left duration-300`}
                title="Show Editor"
              >
                <PanelLeftOpen size={24} />
              </button>
            )}

            {/* Editor Side */}
            {showForm && (
              <div className="w-full lg:w-1/2 space-y-6 animate-in slide-in-from-left duration-500">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Type size={16} className="text-blue-500" /> Content Editor
                    </h2>
                    <button 
                      onClick={() => setShowForm(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all"
                      title="Hide Editor"
                    >
                      <PanelLeftClose size={18} />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Template Name</label>
                      <input
                        value={template.name}
                        onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                        placeholder="e.g., Monthly Salary Release"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subject Title</label>
                      <input
                        value={template.title}
                        onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                        placeholder="Subject of the email"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message Body (Rich Text)</label>
                      
                      <div className="flex flex-wrap items-center gap-1 mb-2 p-1 bg-slate-50 border border-slate-200 rounded-t-xl">
                        <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600" title="Bold">
                          <Bold size={16} />
                        </button>
                        <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600" title="Italic">
                          <Italic size={16} />
                        </button>
                        <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600" title="Bullet List">
                          <List size={16} />
                        </button>
                        <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                        <button type="button" onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600" title="Align Left">
                          <AlignLeft size={16} />
                        </button>
                        <button type="button" onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600" title="Align Center">
                          <AlignCenter size={16} />
                        </button>
                        <button type="button" onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600" title="Align Right">
                          <AlignRight size={16} />
                        </button>
                      </div>

                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorChange}
                        className="w-full min-h-[400px] px-4 py-3 rounded-b-xl border border-t-0 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 bg-white overflow-auto rich-editor"
                        data-placeholder="Type your message here..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Side */}
            <div className={`transition-all duration-500 ${showForm ? 'w-full lg:w-1/2' : 'w-full'}`}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[800px] flex flex-col relative">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Palette size={16} className="text-purple-500" /> Live Preview
                  </h2>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                  </div>
                </div>
                <div className="flex-1 bg-slate-100/50 overflow-auto flex justify-center">
                  <div 
                    className="w-full shadow-2xl h-fit border border-black/5"
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplateDesignerPage;
