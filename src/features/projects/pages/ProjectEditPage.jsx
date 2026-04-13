import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import Header from "../../../components/ui/Header";
import Sidebar from "../../../components/ui/Sidebar";
import BreadcrumbNavigation from "../../../components/ui/BreadcrumbNavigation";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

const ProjectEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [project, setProject] = useState({
        projectName: "",
        githubLink: "",
        clientName: "",
        clientEmail: "",
        contactInfo: "",
        deadline: "",
        phase: "",
        assigningDate: "",
        deploymentLink: "",
        totalPayment: "",
        paymentReceived: "",
        assignedPeople: "",
        assignedEmployeeIds: [],
    });
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

    const fetchEmployees = async () => {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.EMPLOYEES.BASE}`);
            const data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            setEmployees(data);
        } catch (err) {
            console.error("Error fetching employees:", err);
            toast.error("Failed to load employees");
        }
    };

    const fetchProject = async () => {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.PROJECTS.BASE}/${id}`);
            const data = res.data.data || res.data;

            const assignedPeople = data.assignedPeople
                ? (Array.isArray(data.assignedPeople) ? data.assignedPeople.join(", ") : data.assignedPeople.replace(/["{}]/g, "").split(",").join(", "))
                : "";

            const assignedEmployeeIds = data.assignedEmployees
                ? data.assignedEmployees.map(emp => emp.id)
                : (data.assignedEmployeeIds || []);

            setProject({ ...data, assignedPeople, assignedEmployeeIds });
            setSelectedEmployees(assignedEmployeeIds);
        } catch (err) {
            console.error("Error fetching project:", err);
            toast.error("Failed to load project");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchProject();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject({ ...project, [name]: value });
    };

    const handleEmployeeToggle = (employeeId) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleRemoveEmployee = (employeeId) => {
        setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    };

    const getSelectedEmployeesDetails = () => {
        return employees.filter(emp => selectedEmployees.includes(emp.id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...project,
                assignedEmployeeIds: selectedEmployees,
                assignedPeople: project.assignedPeople
                    .split(",")
                    .map((p) => p.trim()),
            };

            await apiClient.put(`${API_ENDPOINTS.PROJECTS.BASE}/${id}`, payload);
            toast.success("Project updated successfully!");
            navigate("/projects");
        } catch (err) {
            console.error("Error updating project:", err);
            toast.error("Failed to update project.");
        }
    };

    const breadcrumbItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Projects", path: "/projects" },
        { label: "Edit Project", path: `/edit-project/${id}` }
    ];

    if (loading) return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
                <div className="p-6 flex flex-col items-center justify-center h-[70vh]">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-muted-foreground font-medium">Loading project details...</p>
                </div>
            </main>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-6`}>
                <div className="p-6">
                    <BreadcrumbNavigation items={breadcrumbItems} />

                    <div className="max-w-4xl mx-auto mt-6">
                        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
                            <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Edit Project</h1>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Project Name"
                                        name="projectName"
                                        value={project.projectName}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="GitHub Link"
                                        name="githubLink"
                                        value={project.githubLink}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Client Name"
                                        name="clientName"
                                        value={project.clientName}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Contact Info"
                                        name="contactInfo"
                                        value={project.contactInfo}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Email"
                                        name="clientEmail"
                                        value={project.clientEmail}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Phase"
                                        name="phase"
                                        value={project.phase}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Deadline"
                                        name="deadline"
                                        type="date"
                                        value={project.deadline}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Assigning Date"
                                        name="assigningDate"
                                        type="date"
                                        value={project.assigningDate}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Deployment Link"
                                        name="deploymentLink"
                                        value={project.deploymentLink}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Total Payment"
                                        name="totalPayment"
                                        type="number"
                                        value={project.totalPayment}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Payment Received"
                                        name="paymentReceived"
                                        type="number"
                                        value={project.paymentReceived}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Assigned People (Legacy)"
                                        name="assignedPeople"
                                        value={project.assignedPeople}
                                        onChange={handleChange}
                                        placeholder="Comma separated team members"
                                    />
                                </div>

                                {/* Multi-Select Employees Section */}
                                <div className="mt-8 pt-6 border-t border-border">
                                    <h2 className="text-lg font-semibold mb-4">Assign Team Members</h2>

                                    {/* Selected Employees Display */}
                                    {getSelectedEmployeesDetails().length > 0 && (
                                        <div className="mb-4 p-4 bg-muted/30 border border-border rounded-lg">
                                            <p className="text-sm font-semibold mb-3 text-foreground">Selected Team Members ({selectedEmployees.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {getSelectedEmployeesDetails().map(emp => (
                                                    <div key={emp.id} className="bg-primary/20 border border-primary/50 rounded-full px-3 py-1 flex items-center gap-2 text-sm font-medium">
                                                        {emp.user?.firstName} {emp.user?.lastName}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveEmployee(emp.id)}
                                                            className="hover:bg-primary/30 rounded-full p-0.5 transition"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dropdown to Select Employees */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                                            className="w-full p-3 bg-background border border-input rounded-lg text-left font-medium text-foreground hover:bg-muted/50 transition flex justify-between items-center"
                                        >
                                            <span>{selectedEmployees.length > 0 ? `${selectedEmployees.length} selected` : 'Select employees...'}</span>
                                            <span className="text-xl">{showEmployeeDropdown ? '▲' : '▼'}</span>
                                        </button>

                                        {showEmployeeDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                                                {employees.length === 0 ? (
                                                    <div className="p-4 text-center text-muted-foreground text-sm">No employees found</div>
                                                ) : (
                                                    employees.map(emp => (
                                                        <label key={emp.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0 transition">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedEmployees.includes(emp.id)}
                                                                onChange={() => handleEmployeeToggle(emp.id)}
                                                                className="w-4 h-4 rounded cursor-pointer"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{emp.user?.firstName} {emp.user?.lastName}</p>
                                                                <p className="text-xs text-muted-foreground">{emp.designation || 'N/A'}</p>
                                                            </div>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center space-x-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/projects")}
                                        className="px-8 py-2 border border-border rounded-lg font-semibold hover:bg-muted transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-semibold hover:bg-primary/90 transition shadow"
                                    >
                                        Update Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ""}
            placeholder={placeholder}
            onChange={onChange}
            className="p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring text-foreground text-sm"
        />
    </div>
);

export default ProjectEdit;
