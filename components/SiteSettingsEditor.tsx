import React, { useState, useCallback } from 'react';
import { SiteSettings } from '../constants';
import { BuildingIcon } from './icons/BuildingIcon';
import { UserIcon } from './icons/UserIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SiteSettingsEditorProps {
    settings: SiteSettings;
    onSave: (newSettings: SiteSettings) => Promise<void>;
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-3">
            <div className="text-yellow-400">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; fullWidth?: boolean }> = 
    ({ label, id, value, onChange, placeholder, fullWidth }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-md p-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 transition-shadow duration-200"
        />
    </div>
);

const ImageUploader: React.FC<{ label: string; id: string; src: string | null; onImageChange: (dataUrl: string | null) => void; fullWidth?: boolean; description?: string; }> = 
    ({ label, id, src, onImageChange, fullWidth, description }) => {
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset file input
    };

    return (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            {description && <p className="text-xs text-slate-500 mb-2">{description}</p>}
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-900/80 border border-slate-700 rounded-md flex items-center justify-center">
                    {src ? <img src={src} alt={`${label} preview`} className="max-w-full max-h-full object-contain"/> : <span className="text-slate-500 text-xs">None</span>}
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor={id} className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                        <UploadIcon /> Change
                    </label>
                    <input type="file" id={id} className="sr-only" onChange={handleFileChange} accept="image/*" />
                    {src && <button type="button" onClick={() => onImageChange(null)} className="text-xs text-red-400 hover:underline flex items-center gap-1"><TrashIcon /> Remove</button>}
                </div>
            </div>
        </div>
    );
};


export const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({ settings, onSave }) => {
    const [formData, setFormData] = useState<SiteSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    };

    const handleCreatorFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const creatorField = id.replace('creator-', '');
        setFormData(prev => ({ ...prev, creator: { ...prev.creator, [creatorField]: value } }));
    };
    
    const handleImageChange = (field: keyof SiteSettings) => (dataUrl: string | null) => {
        setFormData(prev => ({...prev, [field]: dataUrl }));
    };
    
    const handleCreatorImageChange = (field: keyof SiteSettings['creator']) => (dataUrl: string | null) => {
        setFormData(prev => ({...prev, creator: { ...prev.creator, [field]: dataUrl } }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await onSave(formData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to save settings", err);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
       <form onSubmit={handleSubmit} className="h-full flex flex-col animate-fade-in-down">
            <div className="flex-grow space-y-6 pb-24">
                <SectionCard title="Company Details" icon={<BuildingIcon />}>
                    <InputField id="companyName" label="Company Name" value={formData.companyName} onChange={handleFormChange} fullWidth />
                    <InputField id="slogan" label="Slogan" value={formData.slogan} onChange={handleFormChange} fullWidth />
                    <ImageUploader id="logoSrc" label="Company Logo" src={formData.logoSrc} onImageChange={handleImageChange('logoSrc')} description="Recommended: Square aspect ratio (e.g., 256x256px)." />
                    <ImageUploader id="heroImageSrc" label="Hero Image" src={formData.heroImageSrc} onImageChange={handleImageChange('heroImageSrc')} description="Recommended: 1600x400px or similar wide aspect ratio." />
                    <InputField id="tel" label="Telephone" value={formData.tel} onChange={handleFormChange} />
                    <InputField id="email" label="Email" value={formData.email} onChange={handleFormChange} />
                    <InputField id="website" label="Website URL" value={formData.website} onChange={handleFormChange} fullWidth />
                </SectionCard>

                <SectionCard title="Creator Info" icon={<UserIcon />}>
                    <InputField id="creator-name" label="Creator Name" value={formData.creator.name} onChange={handleCreatorFormChange} fullWidth />
                    <InputField id="creator-slogan" label="Creator Slogan" value={formData.creator.slogan} onChange={handleCreatorFormChange} fullWidth />
                    <ImageUploader id="creator-logoSrc" label="Creator Logo" src={formData.creator.logoSrc} onImageChange={handleCreatorImageChange('logoSrc')} description="Recommended: Square aspect ratio (e.g., 256x256px)." />
                    <div></div>
                    <InputField id="creator-tel" label="Creator Telephone" value={formData.creator.tel} onChange={handleCreatorFormChange} />
                    <InputField id="creator-email" label="Creator Email" value={formData.creator.email} onChange={handleCreatorFormChange} />
                    <InputField id="creator-whatsapp" label="Creator WhatsApp" value={formData.creator.whatsapp} onChange={handleCreatorFormChange} placeholder="+15550123" />
                </SectionCard>
            </div>
            
            <footer className="sticky bottom-0 -mx-6 -mb-6 mt-6 bg-slate-900/80 backdrop-blur-sm p-4 border-t border-slate-700/50">
                <div className="flex justify-end items-center gap-4 max-w-6xl mx-auto pr-60">
                    {saveSuccess && <p className="text-sm text-emerald-400 animate-fade-in-down">Settings saved successfully!</p>}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-md transition-colors duration-200 flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : "Save All Changes" }
                    </button>
                </div>
            </footer>
       </form>
    );
};