import React, { useState } from "react";
import Header from "components/ui/Header";
import Sidebar from "components/ui/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    githubLink: "",
    clientName: "",
    contactInfo: "",
    clientEmail: "",
    deadline: "",
    phase: "",
    assigningDate: "",
    deploymentLink: "",
    totalPayment: "",
    paymentReceived: "",
    assignedPeople: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        totalPayment: Number(formData.totalPayment),
        paymentReceived: Number(formData.paymentReceived),
        assignedPeople: formData.assignedPeople
          .split(",")
          .map((person) => person.trim()),
      };

      await axios.post("https://difmo-crm-backend.onrender.com/add-projects", payload);

      alert("Project Added Successfully!");
      navigate("/projects");

      setFormData({
        projectName: "",
        githubLink: "",
        clientName: "",
        contactInfo: "",
        clientEmail: "",
        deadline: "",
        phase: "",
        assigningDate: "",
        deploymentLink: "",
        totalPayment: "",
        paymentReceived: "",
        assignedPeople: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error adding project");
    }
    setLoading(false);
  };

  return (
    <div className="flex  bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />

        <div className="max-w-5xl mx-auto py-12 px-6 mt-5">
          <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 mt-3">
            Add New Project
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg ml-28 w-full rounded-2xl p-8 space-y-6"
          >
            {/* Project Name & GitHub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Project Name"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
              />
              <InputField
                label="GitHub Link"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Client name"
              />
              <InputField
                label="Contact Info"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                placeholder="Phone"
              />
              <InputField
                label="Client Email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                placeholder="Email"
              />
            </div>

            {/* Deadline & Phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
              <SelectField
                label="Phase"
                name="phase"
                value={formData.phase}
                onChange={handleChange}
                options={["Planning", "Development", "Testing", "Deployment", "Completed"]}
              />
            </div>

            {/* Assigning Date & Deployment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Assigning Date"
                name="assigningDate"
                type="date"
                value={formData.assigningDate}
                onChange={handleChange}
              />
              <InputField
                label="Deployment Link"
                name="deploymentLink"
                value={formData.deploymentLink}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Total Payment"
                name="totalPayment"
                type="number"
                value={formData.totalPayment}
                onChange={handleChange}
                placeholder="Total payment"
              />
              <InputField
                label="Payment Received"
                name="paymentReceived"
                type="number"
                value={formData.paymentReceived}
                onChange={handleChange}
                placeholder="Amount received"
              />
            </div>

            {/* Assign People */}
            <div>
              <InputField
                label="Assign People"
                name="assignedPeople"
                value={formData.assignedPeople}
                onChange={handleChange}
                placeholder="Enter team members, comma separated"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-semibold shadow transition-colors"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Input Component
const InputField = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
      required
    />
  </div>
);

// Select Component
const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
      required
    >
      <option value="">Select {label}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default AddProject;
