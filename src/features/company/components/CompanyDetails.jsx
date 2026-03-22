import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

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
            const response = await api.get(`/company/id/${user.company.id}`);
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
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Company Information</h2>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} iconName="Edit">
                        Edit Profile
                    </Button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Company Name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />
                        <Input
                            label="Website"
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                        />
                        <Input
                            label="Industry"
                            value={formData.industry}
                            onChange={(e) => handleChange('industry', e.target.value)}
                        />
                        <Input
                            label="Company Size"
                            value={formData.size}
                            onChange={(e) => handleChange('size', e.target.value)}
                        />
                        <Input
                            label="Email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            disabled
                        />
                        <Input
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                        <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
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
                        <Input
                            label="Opening Time"
                            type="time"
                            value={formData.openingTime}
                            onChange={(e) => handleChange('openingTime', e.target.value)}
                        />
                        <Input
                            label="Closing Time"
                            type="time"
                            value={formData.closingTime}
                            onChange={(e) => handleChange('closingTime', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button variant="ghost" onClick={() => setIsEditing(false)} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving} iconName="Save">
                            Save Changes
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                            <p className="text-lg font-medium mt-1">{formData.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Website</label>
                            <p className="text-lg mt-1 text-primary hover:underline">
                                <a href={formData.website} target="_blank" rel="noopener noreferrer">{formData.website || '-'}</a>
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Industry</label>
                            <p className="text-lg mt-1">{formData.industry || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                            <p className="text-lg mt-1">{formData.size || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-lg mt-1">{formData.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                            <p className="text-lg mt-1">{formData.phone || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                            <p className="text-lg mt-1">
                                {[formData.address, formData.city, formData.country].filter(Boolean).join(', ') || '-'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Opening Time</label>
                            <p className="text-lg mt-1">{formData.openingTime || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Closing Time</label>
                            <p className="text-lg mt-1">{formData.closingTime || '-'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyDetails;
