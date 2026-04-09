import React, { useEffect, useState, useMemo } from "react";
import Header from "../../../components/ui/Header";
import Sidebar from "../../../components/ui/Sidebar";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "features/projects";
import useAuthStore from "../../../store/useAuthStore";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import {
  FolderPlus, User, CreditCard, FileText, ChevronRight, ChevronLeft,
  Check, X, Plus, Trash2, Link, Github, Globe, Palette, FileCode,
  Calendar, Clock, Users, Building2, Mail, Phone, ArrowRight, Sparkles
} from "lucide-react";

const AddProject = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createProject, projects, fetchProjects } = useProjectStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [dynamicFields, setDynamicFields] = useState({
    1: [], 2: [], 3: [], 4: []
  });

  const [formData, setFormData] = useState({
    projectName: "",
    phase: "Planning",
    assigningDate: "",
    deadline: "",
    assignedPeople: "",
    clientName: "",
    clientEmail: "",
    contactInfo: "",
    clientDetails: { companyName: "", clientAddress: "", clientWebsite: "" },
    links: { github: "", deployment: "", figma: "", drive: "", documentation: "" },
    totalPayment: "",
    paymentReceived: "",
    tasks: [{ taskName: "", assignedTo: "", status: "Pending" }],
    notes: ""
  });

  useEffect(() => {
    if (user?.company?.id && projects.length === 0) {
      fetchProjects(user.company.id);
    }
  }, [user, fetchProjects, projects.length]);

  const clientSuggestions = useMemo(() => {
    const seenEmails = new Set();
    const unique = [];
    projects.forEach(p => {
      if (p.clientEmail && !seenEmails.has(p.clientEmail)) {
        seenEmails.add(p.clientEmail);
        unique.push({
          name: p.clientName,
          email: p.clientEmail,
          contact: p.contactInfo || "",
          company: p.clientDetails?.companyName || ""
        });
      }
    });
    return unique;
  }, [projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const addDynamicInput = (stepNumber) => {
    const label = prompt("Enter field label:");
    if (!label) return;
    const type = prompt("Enter type (text, date, number, email):", "text");
    const newField = { id: Date.now(), label, type, value: "" };
    setDynamicFields(prev => ({ ...prev, [stepNumber]: [...prev[stepNumber], newField] }));
  };

  const handleDynamicInputChange = (stepNumber, id, value) => {
    setDynamicFields(prev => ({
      ...prev,
      [stepNumber]: prev[stepNumber].map(f => f.id === id ? { ...f, value } : f)
    }));
  };

  const removeDynamicInput = (stepNumber, id) => {
    setDynamicFields(prev => ({ ...prev, [stepNumber]: prev[stepNumber].filter(f => f.id !== id) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        companyId: user.company.id,
        totalPayment: Number(formData.totalPayment),
        paymentReceived: Number(formData.paymentReceived),
        assignedPeople: formData.assignedPeople ? formData.assignedPeople.split(",") : [],
        description: formData.notes
      };
      await createProject(payload);
      navigate("/projects");
    } catch (err) {
      alert("Error saving project");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Project Info", icon: FolderPlus, description: "Basic project details" },
    { num: 2, label: "Client", icon: User, description: "Client information" },
    { num: 3, label: "Finance & Links", icon: CreditCard, description: "Budget and resources" },
    { num: 4, label: "Notes", icon: FileText, description: "Additional details" },
  ];

  const completedFields = useMemo(() => {
    let count = 0;
    if (formData.projectName) count++;
    if (formData.phase) count++;
    if (formData.assigningDate) count++;
    if (formData.deadline) count++;
    if (formData.clientName) count++;
    if (formData.clientEmail) count++;
    if (formData.totalPayment) count++;
    return Math.round((count / 7) * 100);
  }, [formData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 text-sm">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
        <div className="p-6 max-w-5xl mx-auto">
          <BreadcrumbNavigation items={[{ label: "Dashboard", path: "/dashboard" }, { label: "Projects", path: "/projects" }, { label: "Add Project" }]} />

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <Sparkles size={14} /> New Project
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Project</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Fill in the details to set up a new project</p>
          </div>

          {/* Modern Stepper */}
          <div className="mb-10 bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => {
                const StepIcon = s.icon;
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <button
                      type="button"
                      onClick={() => setStep(s.num)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : isCompleted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-50 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isActive ? "bg-white/20" : isCompleted ? "bg-emerald-100" : "bg-slate-100"
                      }`}>
                        {isCompleted ? <Check size={16} className="text-emerald-600" /> : <StepIcon size={16} />}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className={`text-xs font-bold ${isActive ? "text-white/80" : ""}`}>Step {s.num}</p>
                        <p className={`text-sm font-bold ${isActive ? "text-white" : ""}`}>{s.label}</p>
                      </div>
                    </button>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full ${
                        step > s.num ? "bg-emerald-400" : "bg-slate-200"
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {/* Progress Bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${completedFields}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-400">{completedFields}%</span>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <SectionHeader title="Project Information" icon={<FolderPlus size={16} className="text-indigo-600" />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="Enter project name" icon={<FolderPlus size={14} />} required />
                  <SelectField label="Phase" name="phase" value={formData.phase} onChange={handleChange} options={["Planning", "Development", "Testing", "Deployment", "Completed"]} />
                  <InputField label="Start Date" type="date" name="assigningDate" value={formData.assigningDate} onChange={handleChange} icon={<Calendar size={14} />} />
                  <InputField label="Deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} icon={<Clock size={14} />} />
                  <div className="md:col-span-2">
                    <InputField label="Assigned People" name="assignedPeople" value={formData.assignedPeople} onChange={handleChange} placeholder="Comma separated names" icon={<Users size={14} />} />
                  </div>
                </div>
                <DynamicInputsArea step={1} fields={dynamicFields[1]} onAdd={() => addDynamicInput(1)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {/* STEP 2: CLIENT WITH AUTO-SUGGEST */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <SectionHeader title="Client Details" icon={<User size={16} className="text-indigo-600" />} />
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={12} /> Client Name
                    </label>
                    <input
                      name="clientName"
                      value={formData.clientName}
                      autoComplete="off"
                      onChange={(e) => { handleChange(e); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      placeholder="Start typing..."
                    />
                    {showSuggestions && formData.clientName && (
                      <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-1 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                        {clientSuggestions.filter(c => c.name.toLowerCase().includes(formData.clientName.toLowerCase())).map((client, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                clientName: client.name,
                                clientEmail: client.email,
                                contactInfo: client.contact,
                                clientDetails: { ...formData.clientDetails, companyName: client.company }
                              });
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-none flex flex-col transition-colors"
                          >
                            <span className="font-bold text-sm text-slate-800">{client.name}</span>
                            <span className="text-xs text-slate-400">{client.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <InputField label="Client Email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} type="email" placeholder="client@company.com" icon={<Mail size={14} />} />
                  <InputField label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} placeholder="+91 XXXXXXXXXX" icon={<Phone size={14} />} />
                </div>

                <SectionHeader title="Company Info" icon={<Building2 size={16} className="text-indigo-600" />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Company Name" value={formData.clientDetails.companyName} onChange={(e) => handleNestedChange("clientDetails", "companyName", e.target.value)} placeholder="Client's company name" icon={<Building2 size={14} />} />
                  <InputField label="Website" value={formData.clientDetails.clientWebsite} onChange={(e) => handleNestedChange("clientDetails", "clientWebsite", e.target.value)} placeholder="https://..." icon={<Globe size={14} />} />
                </div>
                <DynamicInputsArea step={2} fields={dynamicFields[2]} onAdd={() => addDynamicInput(2)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <SectionHeader title="Project Links" icon={<Link size={16} className="text-indigo-600" />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="GitHub Repository" value={formData.links.github} onChange={(e) => handleNestedChange("links", "github", e.target.value)} placeholder="https://github.com/..." icon={<Github size={14} />} />
                  <InputField label="Deployment URL" value={formData.links.deployment} onChange={(e) => handleNestedChange("links", "deployment", e.target.value)} placeholder="https://..." icon={<Globe size={14} />} />
                  <InputField label="Figma" value={formData.links.figma} onChange={(e) => handleNestedChange("links", "figma", e.target.value)} placeholder="https://figma.com/..." icon={<Palette size={14} />} />
                  <InputField label="Documentation" value={formData.links.documentation} onChange={(e) => handleNestedChange("links", "documentation", e.target.value)} placeholder="https://..." icon={<FileCode size={14} />} />
                </div>

                <SectionHeader title="Finance" icon={<CreditCard size={16} className="text-indigo-600" />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Total Budget (₹)" type="number" name="totalPayment" value={formData.totalPayment} onChange={handleChange} placeholder="0" icon={<CreditCard size={14} />} />
                  <InputField label="Received (₹)" type="number" name="paymentReceived" value={formData.paymentReceived} onChange={handleChange} placeholder="0" icon={<CreditCard size={14} />} />
                </div>

                {formData.totalPayment > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>Payment Progress</span>
                      <span>{Math.round((Number(formData.paymentReceived || 0) / Number(formData.totalPayment)) * 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((Number(formData.paymentReceived || 0) / Number(formData.totalPayment)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                <DynamicInputsArea step={3} fields={dynamicFields[3]} onAdd={() => addDynamicInput(3)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in">
                <SectionHeader title="Final Notes" icon={<FileText size={16} className="text-indigo-600" />} />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-4 bg-white min-h-[180px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm resize-none"
                  placeholder="Additional instructions, special requirements, or notes about this project..."
                />

                {/* Summary Preview */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles size={14} /> Project Summary
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <SummaryItem label="Project" value={formData.projectName || "—"} />
                    <SummaryItem label="Phase" value={formData.phase} />
                    <SummaryItem label="Client" value={formData.clientName || "—"} />
                    <SummaryItem label="Email" value={formData.clientEmail || "—"} />
                    <SummaryItem label="Budget" value={formData.totalPayment ? `₹${Number(formData.totalPayment).toLocaleString()}` : "—"} />
                    <SummaryItem label="Deadline" value={formData.deadline || "—"} />
                  </div>
                </div>

                <DynamicInputsArea step={4} fields={dynamicFields[4]} onAdd={() => addDynamicInput(4)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={step === 1 ? () => navigate("/projects") : () => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-sm"
              >
                <ChevronLeft size={16} />
                {step === 1 ? "Cancel" : "Back"}
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                Step {step} of 4
              </div>
              <button
                type="button"
                onClick={step === 4 ? handleSubmit : () => setStep(step + 1)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                  step === 4
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200 hover:shadow-emerald-300"
                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-indigo-200 hover:shadow-indigo-300"
                }`}
              >
                {step === 4 ? (loading ? "Creating..." : "Create Project") : "Next Step"}
                {step === 4 ? <Check size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

// ─── Sub-Components ──────────────────────────────────────────────

const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
    {icon}
    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h2>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}
    </label>
    <input
      {...props}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300"
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <select
      {...props}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none"
    >
      {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
  </div>
);

const DynamicInputsArea = ({ step, fields, onAdd, onChange, onRemove }) => (
  <div className="pt-4 mt-4">
    {fields.length > 0 && (
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        {fields.map((field) => (
          <div key={field.id} className="flex items-end gap-2 group">
            <div className="flex-1">
              <InputField label={field.label} type={field.type} value={field.value} onChange={(e) => onChange(step, field.id, e.target.value)} />
            </div>
            <button
              type="button"
              onClick={() => onRemove(step, field.id)}
              className="p-2.5 mb-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    )}
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all"
      >
        <Plus size={16} /> Add Custom Field
      </button>
    </div>
  </div>
);

export default AddProject;