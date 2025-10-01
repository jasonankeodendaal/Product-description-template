
import React, { useState } from 'react';
import { SiteSettings, CREATOR_DETAILS, CreatorDetails, CREATOR_PIN } from '../constants';
import { BuildingIcon } from './icons/BuildingIcon';
import { UserIcon } from './icons/UserIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UserRole } from '../App';
import { ShieldIcon } from './icons/ShieldIcon';
import { SaveIcon } from './icons/SaveIcon';
import { Spinner } from './icons/Spinner';

interface SiteSettingsEditorProps {
    siteSettings: SiteSettings;
    creatorDetails: CreatorDetails;
    onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
    userRole: UserRole;
    onInitiatePinReset: () => void;
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className={`bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-[var(--theme-border)]/50 transition-opacity relative`}>
        <div className="flex items-center gap-3">
            <div className="text-[var(--theme-orange)]">{icon}</div>
            <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">{title}</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; fullWidth?: boolean; type?: string }> = 
    ({ label, id, value, onChange, placeholder, fullWidth, type="text" }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <label htmlFor={id} className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] transition-shadow duration-200"
        />
    </div>
);

const ImageUploader: React.FC<{ label: string; id: string; src: string | null; onImageChange: (dataUrl: string | null) => void; fullWidth?: boolean; description?: string; }> = 
    ({ label, id, src, onImageChange, fullWidth, description }) => {
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onImageChange(reader.result as string);
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    return (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">{label}</label>
            {description && <p className="text-xs text-[var(--theme-text-secondary)]/70 mb-2">{description}</p>}
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[var(--theme-bg)]/80 border border-[var(--theme-border)] rounded-md flex items-center justify-center">
                    {src ? <img src={src} alt={`${label} preview`} className="max-w-full max-h-full object-contain"/> : <span className="text-[var(--theme-text-secondary)]/50 text-xs">None</span>}
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor={id} className="cursor-pointer bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                        <UploadIcon /> Change
                    </label>
                    <input type="file" id={id} className="sr-only" onChange={handleFileChange} accept="image/*" />
                    {src && <button type="button" onClick={() => onImageChange(null)} className="text-xs text-[var(--theme-red)] hover:underline flex items-center gap-1"><TrashIcon /> Remove</button>}
                </div>
            </div>
        </div>
    );
};


export const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({ siteSettings, creatorDetails: initialCreatorDetails, onUpdateSettings, userRole, onInitiatePinReset }) => {
    const [formData, setFormData] = useState<SiteSettings>(siteSettings);
    const [creatorDetails, setCreatorDetails] = useState<CreatorDetails>(initialCreatorDetails);
    const [isSaving, setIsSaving] = useState(false);
    const [isGlobalSaving, setIsGlobalSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [globalSaveSuccess, setGlobalSaveSuccess] = useState(false);

    const isCreator = userRole === 'creator';

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    };

    const handleImageChange = (field: keyof SiteSettings) => (dataUrl: string | null) => {
        setFormData(prev => ({...prev, [field]: dataUrl }));
    };
    
    const handleCreatorFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCreatorDetails(prev => ({...prev, [id]: value }));
    };
    
    const handleCreatorImageChange = (field: keyof CreatorDetails) => (dataUrl: string | null) => {
        setCreatorDetails(prev => ({...prev, [field]: dataUrl }));
    };

    const handleSaveGlobalDetails = async () => {
        if (!window.confirm("This will update the creator details for ALL users of this application immediately. Are you sure you want to proceed?")) return;
        
        const pin = prompt("Please enter the Creator PIN to authorize this global change:");
        if (pin !== CREATOR_PIN) {
            alert("Incorrect PIN. Global update cancelled.");
            return;
        }

        setIsGlobalSaving(true);
        setGlobalSaveSuccess(false);
        try {
            const response = await fetch('/api/update-creator-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ details: creatorDetails, pin }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred.');
            }
            setGlobalSaveSuccess(true);
            setTimeout(() => setGlobalSaveSuccess(false), 4000);
            alert("Global details updated successfully! The changes will be visible on next app reload.");
        } catch (error) {
            console.error("Failed to save global details:", error);
            alert(`Failed to save global details: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsGlobalSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await onUpdateSettings(formData);
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
                <SectionCard title="User Profile" icon={<UserIcon />}>
                    <InputField 
                        id="userName" 
                        label="Your Name" 
                        value={formData.userName || ''} 
                        onChange={handleFormChange} 
                        fullWidth 
                        placeholder="How the app should greet you"
                    />
                </SectionCard>
                
                {isCreator && (
                    <SectionCard title="Creator Details (Global)" icon={<UserIcon />}>
                        <InputField id="name" label="Creator Name" value={creatorDetails.name} onChange={handleCreatorFormChange} />
                        <InputField id="slogan" label="Creator Slogan" value={creatorDetails.slogan} onChange={handleCreatorFormChange} />
                        <ImageUploader id="creatorLogoSrc" label="Creator Logo" src={creatorDetails.logoSrc} onImageChange={handleCreatorImageChange('logoSrc')} />
                        <InputField id="tel" label="Telephone" value={creatorDetails.tel} onChange={handleCreatorFormChange} />
                        <InputField id="email" label="Email" value={creatorDetails.email} onChange={handleCreatorFormChange} />
                        <InputField id="whatsapp" label="WhatsApp Link 1" value={creatorDetails.whatsapp} onChange={handleCreatorFormChange} />
                        <InputField id="whatsapp2" label="WhatsApp Link 2 (Optional)" value={creatorDetails.whatsapp2 || ''} onChange={handleCreatorFormChange} />
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-[var(--theme-border)]/50 flex items-center justify-between">
                             <p className="text-sm text-[var(--theme-text-secondary)]">These details are shown globally. Saving will update them for everyone, instantly.</p>
                             <div className="flex items-center gap-4">
                                {globalSaveSuccess && <p className="text-sm text-green-400">Updated!</p>}
                                <button type="button" onClick={handleSaveGlobalDetails} disabled={isGlobalSaving} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center gap-2 disabled:bg-gray-500">
                                    {isGlobalSaving ? <Spinner /> : <SaveIcon />}
                                    {isGlobalSaving ? "Saving..." : "Save Global Details"}
                                </button>
                            </div>
                        </div>
                    </SectionCard>
                )}

                <SectionCard title="Company Details (Local)" icon={<BuildingIcon />}>
                    <InputField id="companyName" label="Company Name" value={formData.companyName} onChange={handleFormChange} fullWidth />
                    <InputField id="slogan" label="Slogan" value={formData.slogan} onChange={handleFormChange} fullWidth />
                    <ImageUploader id="logoSrc" label="Company Logo" src={formData.logoSrc} onImageChange={handleImageChange('logoSrc')} description="Recommended: Square (e.g., 256x256px)." />
                    <ImageUploader id="heroImageSrc" label="Hero Image" src={formData.heroImageSrc} onImageChange={handleImageChange('heroImageSrc')} description="Recommended: Wide (e.g., 1600x400px)." />
                    <ImageUploader 
                        id="backgroundImageSrc" 
                        label="App Background Image" 
                        src={formData.backgroundImageSrc || null} 
                        onImageChange={handleImageChange('backgroundImageSrc')} 
                        description="High-res, abstract, or textured images work best."
                        fullWidth
                    />
                    <InputField id="tel" label="Telephone" value={formData.tel} onChange={handleFormChange} />
                    <InputField id="email" label="Email" value={formData.email} onChange={handleFormChange} />
                    <InputField id="website" label="Website URL" value={formData.website} onChange={handleFormChange} fullWidth />
                </SectionCard>

                <SectionCard title="Security" icon={<ShieldIcon />}>
                    <div className="md:col-span-2">
                        <p className="text-sm text-[var(--theme-text-secondary)]">Reset the 4-digit PIN used to access the application.</p>
                        <button 
                            type="button" 
                            onClick={onInitiatePinReset} 
                            className="mt-3 bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center gap-2 border border-[var(--theme-border)]"
                        >
                            Reset Application PIN...
                        </button>
                    </div>
                </SectionCard>
            </div>
            
            <footer className="sticky bottom-0 -mx-6 -mb-6 mt-6 bg-[var(--theme-dark-bg)]/80 backdrop-blur-sm p-4 border-t border-[var(--theme-border)]/50">
                <div className="flex justify-end items-center gap-4">
                    {saveSuccess && <p className="text-sm text-[var(--theme-green)] animate-fade-in-down">Local settings saved!</p>}
                    <button type="submit" disabled={isSaving} className="bg-[var(--theme-orange)] hover:opacity-90 text-black font-bold py-2 px-6 rounded-md transition-colors duration-200 flex items-center gap-2 disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed">
                        {isSaving ? (
                            <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                        ) : "Save Local Settings" }
                    </button>
                </div>
            </footer>
       </form>
    );
};
      