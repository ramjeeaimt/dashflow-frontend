import React, { useEffect, useState, useMemo } from "react";
import Header from "../../../components/ui/Header";
import Sidebar from "../../../components/ui/Sidebar";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "features/projects";
import useAuthStore from "../../../store/useAuthStore";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import { ImCross } from "react-icons/im";
import { IoMdAddCircle } from "react-icons/io";

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

  // Unique clients logic for Autocomplete
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

  // --- DYNAMIC FIELDS LOGIC (Wapas Add Kar Diya) ---
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

  return (
    <div className="min-h-screen bg-background text-foreground text-sm">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
        <div className="p-6 max-w-4xl mx-auto">
          <BreadcrumbNavigation items={[{ label: "Dashboard", path: "/dashboard" }, { label: "Projects", path: "/projects" }, { label: "Add Project" }]} />
          
          {/* Progress Bar Logic Same as before */}
          <div className="mb-10 relative">
            <div className="flex justify-between items-center relative z-10">
              {[1, 2, 3, 4].map((s) => (
                <button key={s} type="button" onClick={() => setStep(s)} className={`flex flex-col items-center gap-2 transition-all ${step === s ? "scale-110" : "opacity-60"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= s ? "bg-primary border-primary text-white" : "bg-background border-muted text-muted-foreground"}`}>{s}</div>
                  <span className="text-[10px] font-bold uppercase">{s === 1 ? "Info" : s === 2 ? "Client" : s === 3 ? "Finance" : "Notes"}</span>
                </button>
              ))}
            </div>
            <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-0">
               <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Step {step}</div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <SectionHeader title="Project Information" />
                <Grid2>
                  <InputField label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} />
                  <SelectField label="Phase" name="phase" value={formData.phase} onChange={handleChange} options={["Planning", "Development", "Testing", "Deployment", "Completed"]} />
                  <InputField label="Assigning Date" type="date" name="assigningDate" value={formData.assigningDate} onChange={handleChange} />
                  <InputField label="Deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
                </Grid2>
                <DynamicInputsArea step={1} fields={dynamicFields[1]} onAdd={() => addDynamicInput(1)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {/* STEP 2: CLIENT WITH AUTO-SUGGEST & AUTO-FILL */}
            {step === 2 && (
              <div className="space-y-6">
                <SectionHeader title="Client Details" />
                <Grid3>
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[12px] font-semibold text-foreground/70">Client Name</label>
                    <input
                      name="clientName"
                      value={formData.clientName}
                      autoComplete="off"
                      onChange={(e) => { handleChange(e); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm focus:border-primary outline-none transition-all"
                    />
                    {showSuggestions && formData.clientName && (
                      <div className="absolute top-[100%] left-0 w-full bg-white border border-border mt-1 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
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
                            className="px-4 py-2 hover:bg-primary/5 cursor-pointer border-b last:border-none flex flex-col"
                          >
                            <span className="font-bold text-sm">{client.name}</span>
                            <span className="text-[10px] text-muted-foreground">{client.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <InputField label="Client Email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} />
                  <InputField label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
                </Grid3>

                <SectionHeader title="Company Info" />
                <Grid2>
                  <InputField label="Company Name" value={formData.clientDetails.companyName} onChange={(e) => handleNestedChange("clientDetails", "companyName", e.target.value)} />
                  <InputField label="Website" value={formData.clientDetails.clientWebsite} onChange={(e) => handleNestedChange("clientDetails", "clientWebsite", e.target.value)} />
                </Grid2>
                <DynamicInputsArea step={2} fields={dynamicFields[2]} onAdd={() => addDynamicInput(2)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {/* STEP 3 & 4 (Finance & Notes) remain similar but with DynamicInputsArea included */}
            {step === 3 && (
              <div className="space-y-6">
                <SectionHeader title="Project Links & Finance" />
                <Grid2>
                  <InputField label="GitHub" value={formData.links.github} onChange={(e) => handleNestedChange("links", "github", e.target.value)} />
                  <InputField label="Deployment" value={formData.links.deployment} onChange={(e) => handleNestedChange("links", "deployment", e.target.value)} />
                  <InputField label="Total Budget" type="number" name="totalPayment" value={formData.totalPayment} onChange={handleChange} />
                  <InputField label="Received" type="number" name="paymentReceived" value={formData.paymentReceived} onChange={handleChange} />
                </Grid2>
                <DynamicInputsArea step={3} fields={dynamicFields[3]} onAdd={() => addDynamicInput(3)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <SectionHeader title="Final Notes" />
                <textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                  className="w-full border border-input rounded-md p-4 bg-background min-h-[150px] outline-none" 
                  placeholder="Additional instructions..." 
                />
                <DynamicInputsArea step={4} fields={dynamicFields[4]} onAdd={() => addDynamicInput(4)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
              </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t">
              <button type="button" onClick={step === 1 ? () => navigate("/projects") : () => setStep(step - 1)} className="px-6 py-2 border rounded-lg hover:bg-accent transition-colors">
                {step === 1 ? "Cancel" : "Back"}
              </button>
              <button type="button" onClick={step === 4 ? handleSubmit : () => setStep(step + 1)} className={`${step === 4 ? 'bg-green-600' : 'bg-primary'} text-white px-8 py-2 rounded-lg hover:opacity-90`}>
                {step === 4 ? (loading ? "Creating..." : "Finish & Create") : "Next Step"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---
const SectionHeader = ({ title }) => <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{title}</h2>;
const Grid2 = ({ children }) => <div className="grid md:grid-cols-2 gap-6">{children}</div>;
const Grid3 = ({ children }) => <div className="grid md:grid-cols-3 gap-6">{children}</div>;
const InputField = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-semibold text-foreground/70">{label}</label>
    <input {...props} className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm focus:border-primary outline-none transition-all" />
  </div>
);
const SelectField = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-semibold text-foreground/70">{label}</label>
    <select {...props} className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm focus:border-primary outline-none">
      {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
  </div>
);

const DynamicInputsArea = ({ step, fields, onAdd, onChange, onRemove }) => (
  <div className="pt-4 mt-4">
    {fields.length > 0 && (
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        {fields.map((field) => (
          <div key={field.id} className="flex items-end gap-2 group animate-in fade-in slide-in-from-top-1">
            <div className="flex-1">
              <InputField label={field.label} type={field.type} value={field.value} onChange={(e) => onChange(step, field.id, e.target.value)} />
            </div>
            <button type="button" onClick={() => onRemove(step, field.id)} className="p-2 mb-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <ImCross size={10} />
            </button>
          </div>
        ))}
      </div>
    )}
    <div className="flex justify-center">
      <button type="button" onClick={onAdd} className="p-2 text-primary/80 hover:text-primary hover:scale-110 transition-all">
        <IoMdAddCircle size={28} />
      </button>
    </div>
  </div>
);

export default AddProject;