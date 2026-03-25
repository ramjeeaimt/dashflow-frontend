import React, { useState } from "react";
import Header from "../../../components/ui/Header";
import Sidebar from "../../../components/ui/Sidebar";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "features/projects";
import useAuthStore from "../../../store/useAuthStore";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import { ImCross } from "react-icons/im";
import { IoMdAddCircle } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

const AddProject = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createProject } = useProjectStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Dynamic fields for each section (row-wise)
  const [extraProjects, setExtraProjects] = useState([]);
  const [extraClients, setExtraClients] = useState([]);
  const [extraLinks, setExtraLinks] = useState([]);
  const [extraTeamMembers, setExtraTeamMembers] = useState([]);

  const [formData, setFormData] = useState({
    projectName: "",
    phase: "Planning",
    assigningDate: "",
    deadline: "",
    assignedPeople: "",
    clientName: "",
    clientEmail: "",
    contactInfo: "",
    clientDetails: {
      companyName: "",
      clientAddress: "",
      clientWebsite: ""
    },
    links: {
      github: "",
      deployment: "",
      figma: "",
      drive: "",
      documentation: ""
    },
    totalPayment: "",
    paymentReceived: "",
    notes: ""
  });

  const nextStep = () => {
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const prevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // --- Extra Projects Handlers ---
  const addExtraProject = () => {
    setExtraProjects([...extraProjects, ""]);
  };

  const handleExtraProjectChange = (index, value) => {
    const updated = [...extraProjects];
    updated[index] = value;
    setExtraProjects(updated);
  };

  const removeExtraProject = (index) => {
    setExtraProjects(extraProjects.filter((_, i) => i !== index));
  };

  // --- Extra Clients Handlers ---
  const addExtraClient = () => {
    setExtraClients([...extraClients, { name: "", email: "", phone: "" }]);
  };

  const handleExtraClientChange = (index, field, value) => {
    const updated = [...extraClients];
    updated[index][field] = value;
    setExtraClients(updated);
  };

  const removeExtraClient = (index) => {
    setExtraClients(extraClients.filter((_, i) => i !== index));
  };

  // --- Extra Links Handlers ---
  const addExtraLink = () => {
    setExtraLinks([...extraLinks, { type: "github", url: "" }]);
  };

  const handleExtraLinkChange = (index, field, value) => {
    const updated = [...extraLinks];
    updated[index][field] = value;
    setExtraLinks(updated);
  };

  const removeExtraLink = (index) => {
    setExtraLinks(extraLinks.filter((_, i) => i !== index));
  };

  // --- Extra Team Members Handlers ---
  const addExtraTeamMember = () => {
    setExtraTeamMembers([...extraTeamMembers, ""]);
  };

  const handleExtraTeamMemberChange = (index, value) => {
    const updated = [...extraTeamMembers];
    updated[index] = value;
    setExtraTeamMembers(updated);
  };

  const removeExtraTeamMember = (index) => {
    setExtraTeamMembers(extraTeamMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        additionalProjects: extraProjects,
        additionalClients: extraClients,
        additionalLinks: extraLinks,
        additionalTeamMembers: extraTeamMembers,
        companyId: user?.company?.id,
        totalPayment: Number(formData.totalPayment),
        paymentReceived: Number(formData.paymentReceived),
        assignedPeople: formData.assignedPeople.split(",").map((p) => p.trim()),
      };
      await createProject(payload, user?.company?.id);
      alert("Project Added Successfully!");
      navigate("/projects");
    } catch (error) {
      console.error(error);
      alert("Error adding project");
    }
    setLoading(false);
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    { label: "Add Project", path: "/add-project" }
  ];

  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground text-[13px]">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
        <div className="p-6">
          <BreadcrumbNavigation items={breadcrumbItems} />

          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold">Step {step}: {
                step === 1 ? "Basic Information" :
                step === 2 ? "Client & Team" :
                step === 3 ? "Links & Finance" : "Final & Notes"
              }</h1>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
              <AnimatePresence mode="wait">
                {/* STEP 1: PROJECT INFO & TIMELINE */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <SectionTitle title="Project Information" />
                    
                    <motion.div variants={itemVariants} className="space-y-2">
                      <InputField 
                        label="Project Name" 
                        name="projectName" 
                        value={formData.projectName} 
                        onChange={handleChange} 
                      />
                      <motion.button 
                        type="button" 
                        onClick={addExtraProject}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="flex items-center gap-1 text-primary text-xs font-medium transition-all hover:gap-2"
                      >
                        {/* <IoMdAddCircle size={14} /> Add Another Project */}
                      </motion.button>
                    </motion.div>

                    {/* Extra Projects List */}
                    <AnimatePresence>
                      {extraProjects.map((proj, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="flex gap-2 items-end"
                        >
                          <div className="flex-1">
                            <InputField 
                              label={`Extra Project ${index + 2}`} 
                              value={proj} 
                              onChange={(e) => handleExtraProjectChange(index, e.target.value)} 
                            />
                          </div>
                          <motion.button 
                            type="button" 
                            onClick={() => removeExtraProject(index)}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 mb-1 text-red-500 hover:bg-red-50 rounded-md transition-all"
                          >
                            <ImCross size={10} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <SelectField 
                      label="Project Phase" 
                      name="phase" 
                      value={formData.phase} 
                      onChange={handleChange} 
                      options={["Planning", "Development", "Testing", "Deployment", "Completed"]} 
                    />

                    <SectionTitle title="Timeline" />
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField label="Assigning Date" type="date" name="assigningDate" value={formData.assigningDate} onChange={handleChange} />
                      <InputField label="Deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: CLIENT & TEAM */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <SectionTitle title="Client Details" />
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <InputField label="Client Name" name="clientName" value={formData.clientName} onChange={handleChange} />
                      <InputField label="Client Email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} />
                      <InputField label="Phone/Contact" name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
                    </div>
                    
                    <motion.button 
                      type="button" 
                      onClick={addExtraClient}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex items-center gap-1 text-primary text-xs font-medium transition-all hover:gap-2"
                    >
                      {/* <IoMdAddCircle size={14} /> Add Another Client */}
                    </motion.button>

                    {/* Extra Clients List */}
                    <AnimatePresence>
                      {extraClients.map((client, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="p-3 border rounded-md space-y-3 relative"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-semibold text-muted-foreground">Extra Client {index + 2}</h4>
                            <motion.button 
                              type="button" 
                              onClick={() => removeExtraClient(index)}
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-red-500"
                            >
                              <ImCross size={10} />
                            </motion.button>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <InputField 
                              label="Client Name" 
                              value={client.name} 
                              onChange={(e) => handleExtraClientChange(index, "name", e.target.value)} 
                            />
                            <InputField 
                              label="Client Email" 
                              value={client.email} 
                              onChange={(e) => handleExtraClientChange(index, "email", e.target.value)} 
                            />
                            <InputField 
                              label="Phone/Contact" 
                              value={client.phone} 
                              onChange={(e) => handleExtraClientChange(index, "phone", e.target.value)} 
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField 
                        label="Company Name" 
                        value={formData.clientDetails.companyName} 
                        onChange={(e) => handleNestedChange("clientDetails", "companyName", e.target.value)} 
                      />
                      <InputField 
                        label="Client Website" 
                        value={formData.clientDetails.clientWebsite} 
                        onChange={(e) => handleNestedChange("clientDetails", "clientWebsite", e.target.value)} 
                      />
                    </div>
                    <InputField 
                      label="Client Address" 
                      value={formData.clientDetails.clientAddress} 
                      onChange={(e) => handleNestedChange("clientDetails", "clientAddress", e.target.value)} 
                    />

                    <SectionTitle title="Team Assignment" />
                    <div className="space-y-2">
                      <InputField 
                        label="Assigned People (comma separated)" 
                        name="assignedPeople" 
                        value={formData.assignedPeople} 
                        onChange={handleChange} 
                      />
                      <motion.button 
                        type="button" 
                        onClick={addExtraTeamMember}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="flex items-center gap-1 text-primary text-xs font-medium transition-all hover:gap-2"
                      >
                        {/* <IoMdAddCircle size={14} /> Add Team Member */}
                      </motion.button>
                    </div>

                    {/* Extra Team Members List */}
                    <AnimatePresence>
                      {extraTeamMembers.map((member, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="flex gap-2 items-end"
                        >
                          <div className="flex-1">
                            <InputField 
                              label={`Team Member ${index + 2}`} 
                              value={member} 
                              onChange={(e) => handleExtraTeamMemberChange(index, e.target.value)} 
                            />
                          </div>
                          <motion.button 
                            type="button" 
                            onClick={() => removeExtraTeamMember(index)}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 mb-1 text-red-500 hover:bg-red-50 rounded-md transition-all"
                          >
                            <ImCross size={10} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* STEP 3: LINKS & FINANCE */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <SectionTitle title="Project Links" />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField label="GitHub Repo" value={formData.links.github} onChange={(e) => handleNestedChange("links", "github", e.target.value)} />
                      <InputField label="Deployment" value={formData.links.deployment} onChange={(e) => handleNestedChange("links", "deployment", e.target.value)} />
                      <InputField label="Figma Design" value={formData.links.figma} onChange={(e) => handleNestedChange("links", "figma", e.target.value)} />
                      <InputField label="Google Drive" value={formData.links.drive} onChange={(e) => handleNestedChange("links", "drive", e.target.value)} />
                    </div>
                    
                    <motion.button 
                      type="button" 
                      onClick={addExtraLink}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex items-center gap-1 text-primary text-xs font-medium transition-all hover:gap-2"
                    >
                      {/* <IoMdAddCircle size={14} /> Add Another Link */}
                    </motion.button>

                    {/* Extra Links List */}
                    <AnimatePresence>
                      {extraLinks.map((link, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="flex gap-2 items-end"
                        >
                          <div className="flex-1 space-y-2">
                            <select
                              value={link.type}
                              onChange={(e) => handleExtraLinkChange(index, "type", e.target.value)}
                              className="w-full border border-input rounded-md px-3 py-1.5 bg-background text-sm"
                            >
                              <option value="github">GitHub</option>
                              <option value="deployment">Deployment</option>
                              <option value="figma">Figma</option>
                              <option value="drive">Drive</option>
                              <option value="documentation">Documentation</option>
                            </select>
                            <InputField 
                              label={`Link URL ${index + 2}`} 
                              value={link.url} 
                              onChange={(e) => handleExtraLinkChange(index, "url", e.target.value)} 
                            />
                          </div>
                          <motion.button 
                            type="button" 
                            onClick={() => removeExtraLink(index)}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 mb-1 text-red-500 hover:bg-red-50 rounded-md transition-all"
                          >
                            <ImCross size={10} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <SectionTitle title="Finance" />
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField label="Total Budget" type="number" name="totalPayment" value={formData.totalPayment} onChange={handleChange} />
                      <InputField label="Initial Received" type="number" name="paymentReceived" value={formData.paymentReceived} onChange={handleChange} />
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: NOTES */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <SectionTitle title="Final Notes" />
                    <motion.textarea 
                      variants={itemVariants}
                      value={formData.notes} 
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                      className="w-full border rounded-md p-3 min-h-[150px] outline-none focus:ring-1 focus:ring-primary transition-all" 
                      placeholder="Instructions..." 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div 
                className="flex justify-between pt-6 border-t"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button 
                  type="button" 
                  onClick={step === 1 ? () => navigate("/projects") : prevStep}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="px-5 py-1.5 border rounded-lg transition-all hover:bg-muted"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </motion.button>
                <motion.button 
                  type="button" 
                  onClick={step < 4 ? nextStep : handleSubmit}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-primary text-white px-8 py-1.5 rounded-lg transition-all hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Creating..." : step < 4 ? "Next Step" : "Finish"}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Components with Animations
const SectionTitle = ({ title }) => (
  <motion.h2 
    className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-1"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    {title}
  </motion.h2>
);

const InputField = ({ label, onAdd, ...props }) => (
  <motion.div 
    className="flex flex-col gap-1"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex justify-between items-center">
      <label className="text-[11px] font-semibold text-foreground/70">{label}</label>
      {onAdd && (
        <motion.button 
          type="button" 
          onClick={onAdd}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="text-primary hover:scale-110 transition-all"
        >
          <IoMdAddCircle size={16} />
        </motion.button>
      )}
    </div>
    <input {...props} className="w-full border border-input rounded-md px-3 py-1.5 bg-background text-sm focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary" />
  </motion.div>
);

const SelectField = ({ label, options, onAdd, ...props }) => (
  <motion.div 
    className="flex flex-col gap-1"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex justify-between items-center">
      <label className="text-[11px] font-semibold text-foreground/70">{label}</label>
      {onAdd && (
        <motion.button 
          type="button" 
          onClick={onAdd}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="text-primary hover:scale-110 transition-all"
        >
          <IoMdAddCircle size={16} />
        </motion.button>
      )}
    </div>
    <select {...props} className="w-full border border-input rounded-md px-3 py-1.5 bg-background text-sm focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary">
      <option value="">Select</option>
      {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
  </motion.div>
);

export default AddProject;