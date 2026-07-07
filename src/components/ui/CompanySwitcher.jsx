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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border transition-all duration-200"
            >
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {currentCompany.name?.[0]?.toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-foreground leading-none">{currentCompany.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Active Workspace</p>
                </div>
                <Icon
                    name="ChevronDown"
                    size={14}
                    className={`text-muted-foreground/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-sm z-50 overflow-hidden">
                    <div className="p-3 border-b border-border bg-muted/50">
                        <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Switch Workspace</p>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {allCompanies.map((comp) => (
                            <button
                                key={comp.id}
                                onClick={() => handleSwitch(comp.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left ${comp.id === currentCompany.id ? 'bg-primary/30' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${comp.id === currentCompany.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                    {comp.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold truncate ${comp.id === currentCompany.id ? 'text-primary' : 'text-foreground'}`}>
                                        {comp.name}
                                    </p>
                                    {comp.id === currentCompany.id && (
                                        <p className="text-[10px] text-primary font-medium italic">Current</p>
                                    )}
                                </div>
                                {comp.id === currentCompany.id && (
                                    <Icon name="Check" size={14} className="text-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-2 border-t border-border flex flex-col gap-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/my-companies');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-primary transition-all duration-200"
                        >
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground/70 group-hover:bg-primary/10 group-hover:text-primary">
                                <Icon name="Layers" size={16} />
                            </div>
                            <span className="text-xs font-bold">View All Workspaces</span>
                        </button>

                        <button
                            onClick={handleAddCompany}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-primary transition-all duration-200"
                        >
                            <div className="w-8 h-8 rounded border-2 border-dashed border-border flex items-center justify-center text-muted-foreground/70 group-hover:border-border group-hover:text-primary">
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
