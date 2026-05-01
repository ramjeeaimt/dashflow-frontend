import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const CompanyDetails = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        industry: '',
        size: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        openingTime: '',
        closingTime: ''
    });

    const fetchCompany = async () => {
        if (!user?.company?.id) return;
        try {
            setLoading(true);

            // Fetch by ID
            const response = await api.get(`/system-company/id/${user.company.id}`);
            const data = response.data;
            const company = data?.data || data;

            if (!company || (data && data.data === null)) {
                console.warn('Company data not found or is null');
                return;
            }

            setFormData({
                name: company.name || '',
                website: company.website || '',
                industry: company.industry || '',
                size: company.size || '',
                email: company.email || '',
                phone: company.phone || '',
                address: company.address || '',
                city: company.city || '',
                country: company.country || '',
                openingTime: company.openingTime || '',
                closingTime: company.closingTime || ''
            });
        } catch (error) {
            console.error('Failed to fetch company details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompany();
    }, [user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.company?.id) {
            alert('User or company information is missing. Please try logging in again.');
            return;
        }
        try {
            setSaving(true);
            await api.patch(`/company/${user.company.id}`, formData);
            alert('Company details updated successfully');
            setIsEditing(false);
            fetchCompany(); // Refresh data
        } catch (error) {
            console.error('Failed to update company:', error);
            alert('Failed to update company details');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !formData.name) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Organization Identity</h3>
                    <p className="text-sm text-slate-500">Essential information about your company.</p>
                </div>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        <Icon name="Edit" size={16} className="mr-2" />
                        Edit Details
                    </Button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-slate-50/50 p-8 rounded-xl border border-slate-200">
                        <Input
                            label="Company Name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            placeholder="Acme Inc."
                        />
                        <Input
                            label="Official Website"
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            placeholder="https://example.com"
                        />
                        <Input
                            label="Industry Type"
                            value={formData.industry}
                            onChange={(e) => handleChange('industry', e.target.value)}
                            placeholder="Technology, Manufacturing, etc."
                        />
                        <Input
                            label="Estimated Size"
                            value={formData.size}
                            onChange={(e) => handleChange('size', e.target.value)}
                            placeholder="e.g. 50-100"
                        />
                        <Input
                            label="Primary Email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            disabled
                            className="bg-slate-100"
                        />
                        <Input
                            label="Support Phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+1 (555) 000-0000"
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="HQ Address"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Street address, Floor, Suite"
                            />
                        </div>
                        <Input
                            label="City"
                            value={formData.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                        />
                        <Input
                            label="Country"
                            value={formData.country}
                            onChange={(e) => handleChange('country', e.target.value)}
                        />
                        <div className="md:col-span-2 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
                            <Input
                                label="Business Opening Time"
                                type="time"
                                value={formData.openingTime}
                                onChange={(e) => handleChange('openingTime', e.target.value)}
                            />
                            <Input
                                label="Business Closing Time"
                                type="time"
                                value={formData.closingTime}
                                onChange={(e) => handleChange('closingTime', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditing(false)}
                            type="button"
                            className="text-slate-500 hover:text-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-8"
                        >
                            <Icon name="Save" size={16} className="mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="divide-y divide-slate-100">
                    <DetailRow label="Legal Name" value={formData.name} icon="Building" />
                    <DetailRow
                        label="Website"
                        value={formData.website}
                        icon="Globe"
                        isLink
                    />
                    <DetailRow label="Industry" value={formData.industry} icon="Briefcase" />
                    <DetailRow label="Organization Size" value={formData.size} icon="Users" />
                    <DetailRow label="Corporate Email" value={formData.email} icon="Mail" />
                    <DetailRow label="Phone Number" value={formData.phone} icon="Phone" />
                    <DetailRow
                        label="Headquarters"
                        value={[formData.address, formData.city, formData.country].filter(Boolean).join(', ') || 'Not provided'}
                        icon="MapPin"
                    />
                    <DetailRow
                        label="Operating Hours"
                        value={formData.openingTime && formData.closingTime ? `${formData.openingTime} - ${formData.closingTime}` : null}
                        icon="Clock"
                    />
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ label, value, icon, isLink }) => (
    <div className="py-6 flex flex-col sm:flex-row sm:items-center group">
        <div className="w-full sm:w-1/3 flex items-center gap-3 mb-1 sm:mb-0">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <Icon name={icon} size={16} />
            </div>
            <span className="text-sm font-medium text-slate-500">{label}</span>
        </div>
        <div className="w-full sm:w-2/3 pl-11 sm:pl-0">
            {isLink && value ? (
                <a
                    href={value.startsWith('http') ? value : `https://${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                    {value}
                    <Icon name="ExternalLink" size={12} />
                </a>
            ) : (
                <p className="text-sm font-semibold text-slate-900">{value || 'Not provided'}</p>
            )}
        </div>
    </div>
);

export default CompanyDetails;
