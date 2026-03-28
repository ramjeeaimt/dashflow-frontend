import React, { useState } from "react";
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
  const { createProject } = useProjectStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Dynamic Extra Fields State ---
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

  // --- Clickable Progress Bar Component ---
  const ProgressBar = () => {
    const steps = [
      { id: 1, label: "Info" },
      { id: 2, label: "Client" },
      { id: 3, label: "Finance" },
      { id: 4, label: "Notes" },
    ];

    return (
      <div className="mb-10 relative">
        <div className="flex justify-between items-center relative z-10">
          {steps.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${step === s.id ? "scale-110" : "opacity-60 hover:opacity-100"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 shadow-sm ${step >= s.id
                    ? "bg-primary border-primary text-white"
                    : "bg-background border-muted text-muted-foreground"
                  }`}
              >
                {s.id}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${step === s.id ? "text-primary" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-0">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const addDynamicInput = (stepNumber) => {
    const label = prompt("Enter field label (e.g. Alternative Email,Name):");
    if (!label) return;
    const type = prompt("Enter input type (text, date, number, email):", "text");
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
    if (!user?.company?.id) return alert("Company ID missing! Please login again.");

    setLoading(true);
    try {
      const payload = {
        // --- Basic Fields ---
        projectName: formData.projectName,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        contactInfo: formData.contactInfo,
        phase: formData.phase || "Planning",
        assigningDate: formData.assigningDate,
        deadline: formData.deadline,
        companyId: user.company.id,

        // --- Backend expects these as FLAT columns (based on your null response) ---
        githubLink: formData.links.github || "",
        deploymentLink: formData.links.deployment || "",
        // Agar backend description dhoond raha hai toh notes ko wahan bhej do
        description: formData.notes || "",

        // --- Finance (Keep them same) ---
        totalPayment: Number(formData.totalPayment) || 0,
        paymentReceived: Number(formData.paymentReceived) || 0,

        // --- Extra Data (Backend might ignore these for now, but keeping structure) ---
        assignedPeople: formData.assignedPeople ? formData.assignedPeople.split(",").map(p => p.trim()) : [],
        notes: formData.notes || "",

        // JSON Objects (Inko bhi bhej do agar backend update ho gaya ho)
        links: {
          github: formData.links.github || "",
          deployment: formData.links.deployment || "",
          figma: formData.links.figma || "",
          drive: formData.links.drive || "",
          documentation: formData.links.documentation || ""
        },
        clientDetails: {
          companyName: formData.clientDetails.companyName || "",
          clientAddress: formData.clientDetails.clientAddress || "",
          clientWebsite: formData.clientDetails.clientWebsite || ""
        }
      };

      console.log("Sending Flattened Payload:", payload);
      await createProject(payload);
      alert("Project saved successfully!");
      navigate("/projects");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Backend Error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground text-sm">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
        <div className="p-6">
          <BreadcrumbNavigation items={[{ label: "Dashboard", path: "/dashboard" }, { label: "Projects", path: "/projects" }, { label: "Add Project" }]} />

          <div className="max-w-4xl mx-auto">
            {/* Clickable Progress Bar */}
            <ProgressBar />

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm relative">
              <div className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                Step {step}
              </div>

              {/* STEP 1: PROJECT INFO */}
              {step === 1 && (
                <div className="space-y-6">
                  <SectionHeader title="Project Information" />
                  <Grid2>
                    <InputField label="Project Name (Primary)" name="projectName" value={formData.projectName} onChange={handleChange} />
                    <SelectField label="Project Phase" name="phase" value={formData.phase} onChange={handleChange} options={["Planning", "Development", "Testing", "Deployment", "Completed"]} />
                    <InputField label="Assigning Date" type="date" name="assigningDate" value={formData.assigningDate} onChange={handleChange} />
                    <InputField label="Deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
                  </Grid2>
                  <DynamicInputsArea step={1} fields={dynamicFields[1]} onAdd={() => addDynamicInput(1)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
                </div>
              )}

              {/* STEP 2: CLIENT & TEAM */}
              {step === 2 && (
                <div className="space-y-6">
                  <SectionHeader title="Client Details" />
                  <Grid3>
                    <InputField label="Client Name" name="clientName" value={formData.clientName} onChange={handleChange} />
                    <InputField label="Client Email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} />
                    <InputField label="Phone/Contact" name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
                  </Grid3>
                  <SectionHeader title="Company Information" />
                  <Grid2>
                    <InputField label="Company Name" value={formData.clientDetails.companyName} onChange={(e) => handleNestedChange("clientDetails", "companyName", e.target.value)} />
                    <InputField label="Website" value={formData.clientDetails.clientWebsite} onChange={(e) => handleNestedChange("clientDetails", "clientWebsite", e.target.value)} />
                  </Grid2>
                  <InputField label="Address" value={formData.clientDetails.clientAddress} onChange={(e) => handleNestedChange("clientDetails", "clientAddress", e.target.value)} />
                  <SectionHeader title="Team Assignment" />
                  <InputField label="Assigned People (Comma separated)" name="assignedPeople" value={formData.assignedPeople} onChange={handleChange} />
                  <DynamicInputsArea step={2} fields={dynamicFields[2]} onAdd={() => addDynamicInput(2)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
                </div>
              )}

              {/* STEP 3: LINKS & FINANCE */}
              {step === 3 && (
                <div className="space-y-6">
                  <SectionHeader title="Project Links" />
                  <Grid2>
                    <InputField label="GitHub" value={formData.links.github} onChange={(e) => handleNestedChange("links", "github", e.target.value)} />
                    <InputField label="Live Site" value={formData.links.deployment} onChange={(e) => handleNestedChange("links", "deployment", e.target.value)} />
                    {/* <InputField label="Figma" value={formData.links.figma} onChange={(e) => handleNestedChange("links", "figma", e.target.value)} /> */}
                    {/* <InputField label="Google Drive" value={formData.links.drive} onChange={(e) => handleNestedChange("links", "drive", e.target.value)} /> */}
                    <InputField label="Documentation" value={formData.links.documentation} onChange={(e) => handleNestedChange("links", "documentation", e.target.value)} />
                  </Grid2>
                  <SectionHeader title="Finance" />
                  <Grid2>
                    <InputField label="Total Budget" type="number" name="totalPayment" value={formData.totalPayment} onChange={handleChange} />
                    <InputField label="Received Amount" type="number" name="paymentReceived" value={formData.paymentReceived} onChange={handleChange} />
                  </Grid2>
                  <DynamicInputsArea step={3} fields={dynamicFields[3]} onAdd={() => addDynamicInput(3)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
                </div>
              )}

              {/* STEP 4: NOTES */}
              {step === 4 && (
                <div className="space-y-6">
                  <SectionHeader title="Final Notes" />
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full border border-input rounded-md p-4 bg-background text-sm focus:ring-1 focus:ring-primary outline-none min-h-[150px]" placeholder="Add instructions here..." />
                  <DynamicInputsArea step={4} fields={dynamicFields[4]} onAdd={() => addDynamicInput(4)} onChange={handleDynamicInputChange} onRemove={removeDynamicInput} />
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
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
        </div>
      </main>
    </div>
  );
};

// --- HELPERS ---
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
      <option value="">Select</option>
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