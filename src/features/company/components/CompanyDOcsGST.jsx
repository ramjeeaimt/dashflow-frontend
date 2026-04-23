import React, { useEffect, useState } from 'react';
import { Building2, Landmark } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore'; // Adjusted path
import { useCompanyStore } from '../../../store/useCompanyGstStore'; // Adjusted path
import Input from '../../../components/ui/Input'; // Adjusted path
import Button from '../../../components/ui/Button'; // Adjusted path

const ComanyDocsGST = () => {
    const { user } = useAuthStore();

    // DEBUG FIX: Extract 'saveDocs' (NOT updateDocs) from the store
    const { company, fetchCompany, saveDocs, isUpdating } = useCompanyStore();

    const [formData, setFormData] = useState({
        companyName: '',
        gstNumber: '',
        panNumber: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
    });

    // Sync local form when Zustand company data changes
    useEffect(() => {
        if (user?.company?.id) {
            fetchCompany(user.company.id);
        }
    }, [user?.company?.id, fetchCompany]);

    useEffect(() => {
        if (company) {
            setFormData({
                companyName: company.name || '',
                gstNumber: company.gstNumber || '',
                panNumber: company.panNumber || '',
                accountName: company.accountName || '',
                accountNumber: company.accountNumber || '',
                ifscCode: company.ifscCode || '',
                bankName: company.bankName || '',
                branchName: company.branchName || ''
            });
        }
    }, [company]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!user?.company?.id) {
            alert("User company ID not found!");
            return;
        }

        // DEBUG FIX: saveDocs is now defined from the destructuring above
        const result = await saveDocs(user.company.id, formData);

        if (result.success) {
            alert('Company Profile saved successfully!');
        } else {
            alert(`Error: ${result.message}`);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500">
            {/* Section 1: Business Identity */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">Tax & Business Identity</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Registered Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                    />
                    <Input
                        label="GST Number"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        className="uppercase"
                    />
                    <Input
                        label="PAN Number"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        className="uppercase"
                    />
                </div>
            </div>

            {/* Section 2: Banking Details */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <Landmark className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">Settlement Account Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Account Holder" name="accountName" value={formData.accountName} onChange={handleChange} />
                    <Input label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
                    <Input label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="uppercase" />
                    <Input label="Bank & Branch" name="bankName" value={formData.bankName} onChange={handleChange} />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdating} className="min-w-[150px]">
                    {isUpdating ? 'Saving...' : 'Save Company Profile'}
                </Button>
            </div>
        </form>
    );
};

export default ComanyDocsGST;