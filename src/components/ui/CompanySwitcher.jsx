import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const CompanySwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user, switchCompany } = useAuthStore();

    const currentCompany = user?.company;
    // Merge primary company + extra companies from join table, deduplicate by ID
    const extraCompanies = user?.companies || [];
    const allCompanies = currentCompany
        ? [currentCompany, ...extraCompanies.filter(c => c.id !== currentCompany.id)]
        : extraCompanies;

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSwitch = async (companyId) => {
        if (companyId === currentCompany?.id) return;
        try {
            await switchCompany(companyId);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to switch company:', error);
            alert('Failed to switch company');
        }
    };

    const handleAddCompany = () => {
        setIsOpen(false);
        navigate('/company-registration'); // This takes them to the registration flow
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!currentCompany) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200"
            >
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {currentCompany.name?.[0]?.toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">{currentCompany.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">Active Workspace</p>
                </div>
                <Icon
                    name="ChevronDown"
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Workspace</p>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {allCompanies.map((comp) => (
                            <button
                                key={comp.id}
                                onClick={() => handleSwitch(comp.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${comp.id === currentCompany.id ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${comp.id === currentCompany.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {comp.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold truncate ${comp.id === currentCompany.id ? 'text-blue-600' : 'text-slate-700'}`}>
                                        {comp.name}
                                    </p>
                                    {comp.id === currentCompany.id && (
                                        <p className="text-[10px] text-blue-500 font-medium italic">Current</p>
                                    )}
                                </div>
                                {comp.id === currentCompany.id && (
                                    <Icon name="Check" size={14} className="text-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-2 border-t border-slate-100 flex flex-col gap-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/my-companies');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all duration-200"
                        >
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500">
                                <Icon name="Layers" size={16} />
                            </div>
                            <span className="text-xs font-bold">View All Workspaces</span>
                        </button>

                        <button
                            onClick={handleAddCompany}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all duration-200"
                        >
                            <div className="w-8 h-8 rounded border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500">
                                <Icon name="Plus" size={16} />
                            </div>
                            <span className="text-xs font-bold">Add Company</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanySwitcher;
