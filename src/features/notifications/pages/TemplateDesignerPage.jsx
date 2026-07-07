import React, { useState, useEffect, useRef } from 'react';
import './TemplateDesigner.css';
import { Save, Eye, Layout, Type, Palette, ChevronLeft, Trash2, Send, CheckCircle2, Maximize2, Minimize2, Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, X, PanelLeftClose, PanelLeftOpen, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';

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
    title: 'Your Salary Slip for May 2026',
    message: 'Dear Employee,<br/><br/>Your salary slip for May 2026 has been successfully generated.<br/><br/>Net Salary: <strong>₹20,000.00</strong><br/><br/>Please review the attached PDF payslip for detailed allowances and deductions. If you have any queries, reach out to corporate support.',
    type: 'email',
    signatureTeam: 'Team DIFMO',
    signatureDept: 'Corporate Support',
    signatureRole: 'Communications & Experience',
    signatureCompany: 'DIFMO Pvt Ltd',
    signatureMeetText: "Let's meet",
    signatureMeetLink: 'https://www.difmo.com/contact',
    signatureEmail: 'info@difmo.com',
    signatureAddress: '4/37 Vibhav Khand, Gomtinagr Lucknow, Uttar Pradesh 226016, India',
    signatureWebsite: 'difmo.com',
    signatureWebsiteLink: 'https://www.difmo.com'
  });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        try {
          const res = await api.get(`/email-templates/${id}`);
          if (res.data) {
            // Robustly unwrap data in case it's wrapped in a { data, statusCode, message } object
            const templateData = (res.data.data && res.data.statusCode) ? res.data.data : res.data;
            setTemplate(prev => ({ ...prev, ...templateData }));
          }
        } catch (err) {
          console.error('Failed to load template', err);
        }
      }
    };
    loadTemplate();
  }, [id]);

  useEffect(() => {
    if (editorRef.current && template.message !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = template.message || '';
    }
  }, [template.message, id]);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && template.message) {
      editorRef.current.innerHTML = template.message;
    }
  }, [template.message]);

  const handleSave = async () => {
    if (!template.name || !template.title || !template.message) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      if (id) {
        await api.patch(`/email-templates/${id}`, template);
      } else {
        await api.post('/email-templates', template);
      }
      setFeedback({ type: 'success', message: 'Template saved successfully!' });

      setTimeout(() => {
        navigate('/notifications/templates');
      }, 1500);
    } catch (err) {
      console.error('Failed to save template', err);
      setFeedback({ type: 'error', message: 'Failed to save template.' });
    }
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
    const bannerUrl = 'https://res.cloudinary.com/dxju8ikk4/image/upload/v1777468072/difmo_banner_final.png';

    const sigTeam = template.signatureTeam || 'Team DIFMO';
    const sigDept = template.signatureDept || 'Corporate Support';
    const sigRole = template.signatureRole || 'Communications & Experience';
    const sigCompany = template.signatureCompany || 'DIFMO Pvt Ltd';
    const sigMeetText = template.signatureMeetText || "Let's meet";
    const sigMeetLink = template.signatureMeetLink || 'https://www.difmo.com/contact';
    const sigEmail = template.signatureEmail || 'info@difmo.com';
    const sigAddress = template.signatureAddress || '4/37 Vibhav Khand, Gomtinagr Lucknow, Uttar Pradesh 226016, India';
    const sigWebsite = template.signatureWebsite || 'difmo.com';
    const sigWebsiteLink = template.signatureWebsiteLink || 'https://www.difmo.com';

    return `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background: #fff; color: #1e293b; margin: 0; padding: 20px; box-sizing: border-box; min-height: 100%;">
        <div style="max-width: 700px; margin: 0 auto; background: #fff; box-sizing: border-box;">

          <!-- Body -->
          <div style="font-size: 16px; line-height: 1.6; color: #334155;">
            ${template.message || 'The notification message content will appear here...'}
          </div>

          <!-- Signature -->
          <div style="margin-top: 48px; padding-top: 28px; border-top: 1px solid #f1f5f9;">
            <img src="https://res.cloudinary.com/dxju8ikk4/image/upload/v1777469595/difmo_vector_icon.png"
                 width="100" height="100"
                 style="border-radius: 50%; object-fit: cover; display: block; margin-bottom: 20px;">

            <div style="border-top: 1px solid #1e293b; padding-top: 22px; max-width: 650px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Left: Identity -->
                  <td width="55%" valign="top">
                    <p style="margin: 0 0 2px; font-size: 20px; font-weight: 800; color: #000; letter-spacing: -0.4px;">${sigTeam}</p>
                    <p style="margin: 0 0 1px; font-size: 15px; color: #1e293b; font-weight: 500;">${sigDept}</p>
                    <p style="margin: 0 0 12px; font-size: 14px; color: #475569; font-style: italic;">${sigRole}</p>
                    <p style="margin: 0 0 14px; font-size: 15px; font-weight: 800; color: #000;">${sigCompany}</p>
                    <a href="${sigMeetLink}" style="color: #d03f13ff; font-size: 14px; font-weight: 700; text-decoration: none;">
                      ${sigMeetText}
                    </a>
                  </td>

                  <!-- Right: Contact -->
                  <td width="45%" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="padding-bottom: 14px;">
                          <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: #fff; font-size: 11px; font-weight: 800;">E</span>
                          </div>
                        </td>
                        <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                          <a href="mailto:${sigEmail}" style="color: #000; text-decoration: none;">${sigEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td width="32" valign="top" style="padding-bottom: 14px;">
                          <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: #fff; font-size: 11px; font-weight: 800;">A</span>
                          </div>
                        </td>
                        <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                          ${sigAddress}
                        </td>
                      </tr>
                      <tr>
                        <td width="32" valign="top" style="padding-bottom: 14px;">
                          <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: #fff; font-size: 11px; font-weight: 800;">W</span>
                          </div>
                        </td>
                        <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                          <a href="${sigWebsiteLink}" style="color: #d03f13ff; text-decoration: none;">${sigWebsite}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
            <div style="border-top: 1px solid #1e293b; margin-top: 22px; max-width: 650px;"></div>
          </div>

          <!-- Banner -->
          <div style="margin-top: 36px; border-radius: 10px; overflow: hidden; line-height: 0;">
            <img src="${bannerUrl}" alt="Our Services" style="width: 100%; height: auto; display: block;">
          </div>

          <!-- Social Links -->
          <div style="margin-top: 28px;">
            <a href="#" style="display: inline-block; margin-right: 14px;">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" width="22" style="opacity: 0.75; vertical-align: middle;">
            </a>
            <a href="#" style="display: inline-block; margin-right: 14px;">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" width="22" style="opacity: 0.75; vertical-align: middle;">
            </a>
            <a href="#" style="display: inline-block; margin-right: 14px;">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145812.png" width="22" style="opacity: 0.75; vertical-align: middle;">
            </a>
          </div>

          <!-- Legal -->
          <div style="margin-top: 36px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            <p style="margin: 0;">
              This email, along with any attachments, documents, project files, source code, designs, business strategies, client information, and other transmitted materials, contains confidential and proprietary information belonging to <b>DIFMO</b>. It is intended solely for the use of the individual, organization, or entity to whom it is addressed.
              <br/><br/>
              Any unauthorized access, review, copying, disclosure, distribution, modification, or use of this information is strictly prohibited and may be unlawful.
              <br/><br/>
              If you have received this communication in error, please notify us immediately by replying to this email or contacting our support team at <b>${sigEmail}, mailto:${sigEmail}</b>, and permanently delete all copies of this message and its attachments from your system.
              <br/><br/>
              Difmo Private Limited is committed to protecting client data, intellectual property, and business confidentiality across all services including AI solutions, web development, mobile applications, cloud services, cybersecurity, and smart technology solutions.
              <br/><br/>
              <b>© ${year} Difmo Private Limited. All rights reserved.</b>
            </p>
            <p style="margin: 8px 0 0;">&copy; ${year} DIFMO PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
          </div>

        </div>
      </div>
    `;
  };

  return (
    <div className="min-h-screen bg-muted/60">
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
                className="p-2 bg-card rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                  Email Templates
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-foreground">
                  {id ? 'Edit Template' : 'Design Template'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md ${showForm ? 'bg-card border border-border text-muted-foreground hover:bg-muted/60' : 'bg-primary text-white hover:bg-primary/90'}`}
              >
                {showForm ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                {showForm ? 'Hide Editor' : 'Show Editor'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all "
              >
                <Save size={18} /> Save Template
              </button>
            </div>
          </div>

          {feedback && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
          )}

          <div className={`flex gap-8 items-start transition-all duration-500 relative`}>
            {/* Floating Restore Button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className={`fixed ${sidebarCollapsed ? 'left-16' : 'left-60'} top-1/2 -translate-y-1/2 z-50 bg-primary text-white p-3 rounded-r-2xl shadow-sm hover:bg-primary/90 transition-all animate-in slide-in-from-left duration-300`}
                title="Show Editor"
              >
                <PanelLeftOpen size={24} />
              </button>
            )}

            {/* Editor Side */}
            {showForm && (
              <div className="w-full lg:w-1/2 space-y-6 animate-in slide-in-from-left duration-500">
                <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                  <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Type size={16} className="text-primary" /> Content Editor
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-1.5 text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted rounded-md transition-all"
                      title="Hide Editor"
                    >
                      <PanelLeftClose size={18} />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Template Name</label>
                      <input
                        value={template.name}
                        onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                        placeholder="e.g., Monthly Salary Release"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-4 focus:ring-ring transition-all outline-none text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Subject Title</label>
                      <input
                        value={template.title}
                        onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                        placeholder="Subject of the email"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-4 focus:ring-ring transition-all outline-none text-foreground font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Message Body (Rich Text)</label>

                      <div className="flex flex-wrap items-center gap-1 mb-2 p-1 bg-muted/60 border border-border rounded-t-xl">
                        <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-card hover:shadow-sm rounded transition-all text-muted-foreground" title="Bold">
                          <Bold size={16} />
                        </button>
                        <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-card hover:shadow-sm rounded transition-all text-muted-foreground" title="Italic">
                          <Italic size={16} />
                        </button>
                        <div className="w-[1px] h-6 bg-border mx-1" />
                        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-card hover:shadow-sm rounded transition-all text-muted-foreground" title="Bullet List">
                          <List size={16} />
                        </button>
                        <div className="w-[1px] h-6 bg-border mx-1" />
                        <button type="button" onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-card hover:shadow-sm rounded transition-all text-muted-foreground" title="Align Left">
                          <AlignLeft size={16} />
                        </button>
                        <button type="button" onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-card hover:shadow-sm rounded transition-all text-muted-foreground" title="Align Center">
                          <AlignCenter size={16} />
                        </button>
                        <button type="button" onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-card hover:shadow-sm rounded transition-all text-muted-foreground" title="Align Right">
                          <AlignRight size={16} />
                        </button>
                      </div>

                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorChange}
                        className="w-full min-h-[400px] px-4 py-3 rounded-b-xl border border-t-0 border-border focus:border-primary focus:ring-4 focus:ring-ring transition-all outline-none text-foreground bg-card overflow-auto rich-editor"
                        data-placeholder="Type your message here..."
                      />
                    </div>

                    {/* Signature Settings Section */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        ✍️ Edit Signature Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Signature Team</label>
                          <input
                            value={template.signatureTeam || 'Team DIFMO'}
                            onChange={(e) => setTemplate({ ...template, signatureTeam: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Corporate Role / Dept</label>
                          <input
                            value={template.signatureDept || 'Corporate Support'}
                            onChange={(e) => setTemplate({ ...template, signatureDept: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Tagline / Subtitle</label>
                          <input
                            value={template.signatureRole || 'Communications & Experience'}
                            onChange={(e) => setTemplate({ ...template, signatureRole: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Company Name</label>
                          <input
                            value={template.signatureCompany || 'DIFMO Pvt Ltd'}
                            onChange={(e) => setTemplate({ ...template, signatureCompany: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Meet Button Text</label>
                          <input
                            value={template.signatureMeetText || "Let's meet"}
                            onChange={(e) => setTemplate({ ...template, signatureMeetText: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Meet Button Link</label>
                          <input
                            value={template.signatureMeetLink || 'https://www.difmo.com/contact'}
                            onChange={(e) => setTemplate({ ...template, signatureMeetLink: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Contact Email</label>
                          <input
                            value={template.signatureEmail || 'info@difmo.com'}
                            onChange={(e) => setTemplate({ ...template, signatureEmail: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Website Address</label>
                          <input
                            value={template.signatureWebsite || 'difmo.com'}
                            onChange={(e) => setTemplate({ ...template, signatureWebsite: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Website Link</label>
                          <input
                            value={template.signatureWebsiteLink || 'https://www.difmo.com'}
                            onChange={(e) => setTemplate({ ...template, signatureWebsiteLink: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm animate-all"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Office Address</label>
                        <textarea
                          value={template.signatureAddress || '4/37 Vibhav Khand, Gomtinagr Lucknow, Uttar Pradesh 226016, India'}
                          onChange={(e) => setTemplate({ ...template, signatureAddress: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all outline-none text-foreground text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Side */}
            <div className={`transition-all duration-500 ${showForm ? 'w-full lg:w-1/2' : 'w-full'}`}>
              <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden min-h-[800px] flex flex-col relative">
                <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Palette size={16} className="text-purple-500" /> Live Preview
                  </h2>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
                  </div>
                </div>
                <div className="flex-1 bg-muted/50 overflow-auto flex justify-center">
                  <div
                    className="w-full shadow-sm h-fit border border-black/5"
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
