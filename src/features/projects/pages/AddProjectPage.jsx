import React, { useEffect, useState, useMemo } from "react";
import Header from "../../../components/ui/Header";
import Sidebar from "../../../components/ui/Sidebar";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "features/projects";
import useAuthStore from "../../../store/useAuthStore";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import apiClient from "../../../api/client";
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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [clientMode, setClientMode] = useState("existing");

  const [dynamicFields, setDynamicFields] = useState({
    1: [], 2: [], 3: [], 4: []
  });

  const [formData, setFormData] = useState({
    projectName: "",
    phase: "Planning",
    assigningDate: "",
    deadline: "",
    assignedPeople: "",
    assignedEmployeeIds: [],
    isCompanyProject: false,
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

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get('/employees');
        // apiClient unwraps data.data, but let's be double sure
        const data = response.data;
        setEmployees(Array.isArray(data) ? data : (data?.data || []));
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };
    fetchEmployees();
  }, []);

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
        assignedPeople: selectedEmployeeIds.length > 0
          ? selectedEmployeeIds
          : (formData.assignedPeople ? formData.assignedPeople.split(",") : []),
        assignedEmployeeIds: selectedEmployeeIds,
        description: formData.notes,
        githubLink: formData.links?.github,
        deploymentLink: formData.links?.deployment
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

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-muted/60 text-foreground text-sm">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="p-4 sm:p-6 md:p-8">
          <BreadcrumbNavigation items={[{ label: "Dashboard", path: "/dashboard" }, { label: "Projects", path: "/projects" }, { label: "Add Project" }]} />

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1 text-primary font-bold text-xs uppercase tracking-wide">
              <Sparkles size={14} /> New Project
            </div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Create Project</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">Fill in the details to set up a new project</p>
          </div>

          {/* Modern Stepper */}
          <div className="mb-10 bg-card border border-border rounded-lg p-6">
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
 ? "bg-primary text-white shadow-sm "
 : isCompleted
 ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
 : "bg-muted/60 text-muted-foreground/70 border border-border"
 }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? "bg-white/20" : isCompleted ? "bg-emerald-100" : "bg-muted"
 }`}>
                        {isCompleted ? <Check size={16} className="text-emerald-600" /> : <StepIcon size={16} />}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className={`text-xs font-bold ${isActive ? "text-white/80" : ""}`}>Step {s.num}</p>
                        <p className={`text-sm font-bold ${isActive ? "text-white" : ""}`}>{s.label}</p>
                      </div>
                    </button>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full ${step > s.num ? "bg-emerald-400" : "bg-border"
 }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {/* Progress Bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completedFields}%` }}
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground/70">{completedFields}%</span>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <SectionHeader title="Project Information" icon={<FolderPlus size={16} className="text-primary" />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="Enter project name" icon={<FolderPlus size={14} />} required />
                  <SelectField label="Phase" name="phase" value={formData.phase} onChange={handleChange} options={["Planning", "Development", "Testing", "Deployment", "Completed"]} />
                  <div className="flex items-center space-x-3 mt-1.5 md:col-span-2">
                    <input
                      type="checkbox"
                      id="isCompanyProject"
                      name="isCompanyProject"
                      checked={formData.isCompanyProject || false}
                      onChange={(e) => setFormData({ ...formData, isCompanyProject: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="isCompanyProject" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Internal Company Project (No Client)
                    </label>
                  </div>
                  <InputField label="Start Date" type="date" name="assigningDate" value={formData.assigningDate} onChange={handleChange} icon={<Calendar size={14} />} />
                  <InputField label="Deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} icon={<Clock size={14} />} />
                  <div className="md:col-span-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={14} /> Assigned People
                      </label>
                      <div className="relative">
                        <div
                          onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                          className="w-full border border-border rounded-xl px-4 py-3 bg-card text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all cursor-pointer hover:border-border"
                        >
                          {selectedEmployeeIds.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedEmployeeIds.map(empId => {
                                const emp = employees.find(e => e.id === empId);
                                return (
                                  <span key={empId} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2">
                                    {emp?.user?.name || `${emp?.user?.firstName || ''} ${emp?.user?.lastName || ''}`.trim() || emp?.name || 'Unknown'}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== empId));
                                        setFormData(prev => ({
                                          ...prev,
                                          assignedEmployeeIds: prev.assignedEmployeeIds.filter(id => id !== empId)
                                        }));
                                      }}
                                      className="hover:text-indigo-900"
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/70">Select employees...</span>
                          )}
                        </div>
                        {showEmployeeDropdown && (
                          <div className="absolute top-full left-0 w-full bg-card border border-border mt-1 rounded-xl shadow-sm z-50 max-h-48 overflow-y-auto">
                            {Array.isArray(employees) && employees.map(emp => (
                              <label key={emp.id} className="px-4 py-3 hover:bg-primary/10 cursor-pointer border-b last:border-none flex items-center gap-3 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedEmployeeIds.includes(emp.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const newIds = [...selectedEmployeeIds, emp.id];
                                      setSelectedEmployeeIds(newIds);
                                      setFormData(prev => ({
                                        ...prev,
                                        assignedEmployeeIds: newIds
                                      }));
                                      setShowEmployeeDropdown(false);
                                    } else {
                                      const newIds = selectedEmployeeIds.filter(id => id !== emp.id);
                                      setSelectedEmployeeIds(newIds);
                                      setFormData(prev => ({
                                        ...prev,
                                        assignedEmployeeIds: newIds
                                      }));
                                      setShowEmployeeDropdown(false);
                                    }
                                  }}
                                  className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-foreground">{emp.user?.name || `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim() || emp.name || 'Unknown'}</p>
                                  <p className="text-xs text-muted-foreground">{emp.department?.name || (typeof emp.department === 'string' ? emp.department : 'N/A')}</p>
                                </div>
                              </label>
                            ))}
                            {(!Array.isArray(employees) || employees.length === 0) && (
                              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                                No employees available
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <DynamicInputsArea step={1} fields={dynamicFields[1]} onAdd={() => addDynamicInput(1)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {/* STEP 2: CLIENT WITH AUTO-SUGGEST */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <SectionHeader title="Client Details" icon={<User size={16} className="text-primary" />} />
                
                <div className="flex items-center gap-6 mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input 
                      type="radio" 
                      name="clientMode" 
                      value="existing" 
                      checked={clientMode === 'existing'} 
                      onChange={() => setClientMode('existing')} 
                      className="accent-indigo-600 w-4 h-4"
                    />
                    Select Existing Client
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input 
                      type="radio" 
                      name="clientMode" 
                      value="new" 
                      checked={clientMode === 'new'} 
                      onChange={() => {
                        setClientMode('new');
                        setFormData({
                          ...formData,
                          clientName: "",
                          clientEmail: "",
                          contactInfo: "",
                          clientDetails: { ...formData.clientDetails, companyName: "", clientWebsite: "" }
                        });
                      }} 
                      className="accent-indigo-600 w-4 h-4"
                    />
                    Add New Client
                  </label>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {clientMode === 'existing' ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <User size={14} /> Client Name
                      </label>
                      <select
                        value={formData.clientName}
                        onChange={(e) => {
                          const selected = clientSuggestions.find(c => c.name === e.target.value);
                          if (selected) {
                            setFormData({
                              ...formData,
                              clientName: selected.name,
                              clientEmail: selected.email,
                              contactInfo: selected.contact,
                              clientDetails: { ...formData.clientDetails, companyName: selected.company }
                            });
                          } else {
                            setFormData({
                              ...formData,
                              clientName: "",
                              clientEmail: "",
                              contactInfo: "",
                              clientDetails: { ...formData.clientDetails, companyName: "" }
                            });
                          }
                        }}
                        className="w-full border border-border rounded-xl px-4 py-3 bg-card text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all cursor-pointer"
                      >
                        <option value="">-- Select a Client --</option>
                        {clientSuggestions.map((client, i) => (
                          <option key={i} value={client.name}>
                            {client.name} {client.email ? `(${client.email})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <InputField label="Client Name" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Enter client name" icon={<User size={14} />} />
                  )}
                  <InputField label="Client Email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} type="email" placeholder="client@company.com" icon={<Mail size={14} />} disabled={clientMode === 'existing'} />
                  <InputField label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} placeholder="+91 XXXXXXXXXX" icon={<Phone size={14} />} disabled={clientMode === 'existing'} />
                </div>

                <SectionHeader title="Company Info" icon={<Building2 size={16} className="text-primary" />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Company Name" value={formData.clientDetails.companyName} onChange={(e) => handleNestedChange("clientDetails", "companyName", e.target.value)} placeholder="Client's company name" icon={<Building2 size={14} />} disabled={clientMode === 'existing'} />
                  <InputField label="Website" value={formData.clientDetails.clientWebsite} onChange={(e) => handleNestedChange("clientDetails", "clientWebsite", e.target.value)} placeholder="https://..." icon={<Globe size={14} />} disabled={clientMode === 'existing'} />
                </div>
                <DynamicInputsArea step={2} fields={dynamicFields[2]} onAdd={() => addDynamicInput(2)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <SectionHeader title="Project Links" icon={<Link size={16} className="text-primary" />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="GitHub Repository" value={formData.links.github} onChange={(e) => handleNestedChange("links", "github", e.target.value)} placeholder="https://github.com/..." icon={<Github size={14} />} />
                  <InputField label="Deployment URL" value={formData.links.deployment} onChange={(e) => handleNestedChange("links", "deployment", e.target.value)} placeholder="https://..." icon={<Globe size={14} />} />
                  <InputField label="Figma" value={formData.links.figma} onChange={(e) => handleNestedChange("links", "figma", e.target.value)} placeholder="https://figma.com/..." icon={<Palette size={14} />} />
                  <InputField label="Documentation" value={formData.links.documentation} onChange={(e) => handleNestedChange("links", "documentation", e.target.value)} placeholder="https://..." icon={<FileCode size={14} />} />
                </div>

                <SectionHeader title="Finance" icon={<CreditCard size={16} className="text-primary" />} />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Total Budget (₹)" type="number" name="totalPayment" value={formData.totalPayment} onChange={handleChange} placeholder="0" icon={<CreditCard size={14} />} />
                  <InputField label="Received (₹)" type="number" name="paymentReceived" value={formData.paymentReceived} onChange={handleChange} placeholder="0" icon={<CreditCard size={14} />} />
                </div>

                {formData.totalPayment > 0 && (
                  <div className="bg-muted/60 border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
                      <span>Payment Progress</span>
                      <span>{Math.round((Number(formData.paymentReceived || 0) / Number(formData.totalPayment)) * 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
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
                <SectionHeader title="Final Notes" icon={<FileText size={16} className="text-primary" />} />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-border rounded-xl p-4 bg-card min-h-[180px] outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 transition-all text-sm resize-none"
                  placeholder="Additional instructions, special requirements, or notes about this project..."
                />

                {/* Summary Preview */}
                <div className="bg-primary/10 border border-border rounded-xl p-6">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
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
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-border">
              <button
                type="button"
                onClick={step === 1 ? () => navigate("/projects") : () => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted/60 hover:border-border transition-all font-bold text-sm"
              >
                <ChevronLeft size={16} />
                {step === 1 ? "Cancel" : "Back"}
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70 font-bold">
                Step {step} of 4
              </div>
              <button
                type="button"
                onClick={step === 4 ? handleSubmit : () => setStep(step + 1)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${step === 4
 ? "bg-emerald-500 text-white "
 : "bg-primary text-white "
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
  <div className="flex items-center gap-2 pb-2 border-b border-border">
    {icon}
    <h2 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wide">{title}</h2>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
      {icon && <span className="text-muted-foreground/70">{icon}</span>}
      {label}
    </label>
    <input
      {...props}
      className="w-full border border-border rounded-xl px-4 py-3 bg-card text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all placeholder:text-muted-foreground/70"
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
    <select
      {...props}
      className="w-full border border-border rounded-xl px-4 py-3 bg-card text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none appearance-none"
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
        className="flex items-center gap-2 px-4 py-2 text-primary hover:text-primary hover:bg-primary/10 rounded-xl text-xs font-bold transition-all"
      >
        <Plus size={16} /> Add Custom Field
      </button>
    </div>
  </div>
);

export default AddProject;