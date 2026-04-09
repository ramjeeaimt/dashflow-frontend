import React, { useState } from 'react';
import { X, Mail, User, Building2 } from 'lucide-react';

const AddClientModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      onAdd(formData);
      setFormData({ name: '', email: '', company: '' });
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
            <p className="text-sm text-gray-500 mt-1">Enter client details to get started</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value});
                  if(errors.name) setErrors({...errors, name: ''});
                }}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email"
                placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({...formData, email: e.target.value});
                  if(errors.email) setErrors({...errors, email: ''});
                }}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company (Optional)</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Company Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-2"
          >
            Create Client
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">You can add more details after creating the client</p>
      </div>
    </div>
  );
};

export default AddClientModal;