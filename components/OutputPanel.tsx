import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SaveIcon } from './icons/SaveIcon';
import { ParsedProductData, Photo } from '../App';
import { UploadIcon } from './icons/UploadIcon';
import { dataURLtoBlob } from '../utils/dataUtils';
import { resizeImage } from '../utils/imageUtils';

// Define GroundingChunk locally to remove dependency on @google/genai types on the client
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GenerationResult {
    text: string;
    sources?: GroundingChunk[];
}

interface OutputPanelProps {
  output: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
  onSaveToFolder: (item: ParsedProductData) => Promise<void>;
  syncMode?: 'local' | 'folder' | 'api';
  photos: Photo[];
  onSavePhoto: (photo: Photo) => Promise<void>;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4 font-sans text-sm leading-relaxed animate-pulse">
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Brand:</p>
            <div className="h-5 bg-[var(--theme-border)]/20 rounded w-1/3 mt-1"></div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">SKU:</p>
            <div className="h-5 bg-[var(--theme-border)]/20 rounded w-1/2 mt-1"></div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Name:</p>
            <div className="h-5 bg-[var(--theme-border)]/20 rounded w-3/4 mt-1"></div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Short Description:</p>
            <div className="h-5 bg-[var(--theme-border)]/20 rounded w-full mt-1"></div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Description:</p>
            <div className="space-y-2 mt-1">
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-full"></div>
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-full"></div>
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-5/6"></div>
            </div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Key Features:</p>
            <div className="space-y-2 mt-1">
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-4/5"></div>
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-4/5"></div>
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-4/5"></div>
            </div>
        </div>
    </div>
);

const SECTIONS = [
    'Brand', 'SKU', 'Name', 'Short Description', 'What’s in the Box',
    'Description', 'Key Features', 'Material Used',
    'Product Dimensions (CM) & Weight (KG)', 'Buying This Product Means',
    'Key Specifications', 'Terms & Conditions'
];

const parseOutputToStructuredData = (text: string): Record<string, string> => {
    const data: Record<string, string> = {};
    SECTIONS.forEach(s => data[s] = '');
    const lines = text.split('\n');
    let currentSection: string | null = null;
    let contentBuffer: string[] = [];
    const sectionHeaders = SECTIONS.map(s => s + ':');

    for (const line of lines) {
        if (sectionHeaders.includes(line.trim())) {
            if (currentSection) {
                data[currentSection] = contentBuffer.join('\n').trim();
            }
            currentSection = line.trim().slice(0, -1);
            contentBuffer = [];
        } else if (currentSection) {
            contentBuffer.push(line);
        }
    }

    if (currentSection) {
        data[currentSection] = contentBuffer.join('\n').trim();
    }
    
    return data;
};

const convertToRequiredCSV = (data: Record<string, string>): string => {
    const escapeCSV = (field: string = ''): string => {
        const strField = String(field);
        if (strField === 'No info.') return '""';
        const escaped = strField.replace(/"/g, '""');
        return `"${escaped}"`;
    };

    const requiredHeaders = ['name', 'sku', 'brandName', 'description'];
    const name = data['Name'] || '';
    const sku = data['SKU'] || '';
    const brandName = data['Brand'] || '';
    const description = data['Short Description'] || '';
    
    const dataRowValues = [name, sku, brandName, description];
    const headerRow = requiredHeaders.join(',');
    const dataRow = dataRowValues.map(v => escapeCSV(v)).join(',');
    return `${headerRow}\n${dataRow}`;
};

const LinkedPhotoThumbnail: React.FC<{ photo: Photo }> = ({ photo }) => {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        const objectUrl = URL.createObjectURL(photo.imageBlob);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [photo.imageBlob]);

    return (
        <div className="w-full aspect-square bg-black/20 rounded-md overflow-hidden group relative">
            {url ? <img src={url} alt={photo.name} className="w-full h-full object-cover" /> : <div className="animate-pulse bg-white/10 w-full h-full"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <p className="text-white text-xs truncate font-medium">{photo.name}</p>
            </div>
        </div>
    );
};


export const OutputPanel: React.FC<OutputPanelProps> = React.memo(({ output, isLoading, error, onSaveToFolder, syncMode, photos, onSavePhoto }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const outputText = output?.text || '';
    const hasOutput = outputText.trim().length > 0;

    const structuredData = useMemo(() => {
        if (!outputText) return null;
        return parseOutputToStructuredData(outputText);
    }, [outputText]);

    const linkedPhotos = useMemo(() => {
        if (!structuredData || !structuredData['Brand'] || !structuredData['SKU']) return [];
        const folderPath = `${structuredData['Brand']}/${structuredData['SKU']}`;
        return photos.filter(p => p.folder === folderPath);
    }, [photos, structuredData]);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopy = useCallback(() => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText);
        setIsCopied(true);
    }, [outputText]);
    
    const handleSave = useCallback(async () => {
        if (!outputText || !structuredData) return;
        setSaveState('saving');
        const csvText = convertToRequiredCSV(structuredData);
        
        const item: ParsedProductData = {
            brand: structuredData['Brand'] || 'Unbranded',
            sku: structuredData['SKU'] || `product-${Date.now()}`,
            name: structuredData['Name'] || 'Unnamed Product',
            fullText: outputText,
            csvText: csvText,
        };

        try {
            await onSaveToFolder(item);
            setSaveState('saved');
            setTimeout(() => setSaveState('idle'), 2500);
        } catch (e) {
            setSaveState('idle'); // Error is alerted in App.tsx, just reset button state
        }
    }, [outputText, structuredData, onSaveToFolder]);

    const handleImageUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0 || !structuredData) return;
        setIsUploading(true);
        const brand = structuredData['Brand'] || 'Unbranded';
        const sku = structuredData['SKU'] || 'Uncategorized';

        for (const file of Array.from(files)) {
            try {
                const resizedDataUrl = await resizeImage(file);
                const imageBlob = dataURLtoBlob(resizedDataUrl);
                const newPhoto: Photo = {
                    id: crypto.randomUUID(),
                    name: file.name.split('.').slice(0, -1).join('.'),
                    notes: `Linked to product: ${brand} - ${sku}`,
                    date: new Date().toISOString(),
                    folder: `${brand}/${sku}`,
                    imageBlob,
                    imageMimeType: imageBlob.type,
                    tags: [brand, sku].filter(Boolean) as string[],
                };
                await onSavePhoto(newPhoto);
            } catch (error) {
                console.error("Failed to process image:", error);
                alert(`Failed to process ${file.name}. It might be corrupted or an unsupported format.`);
            }
        }
        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = '';

    }, [structuredData, onSavePhoto]);

    const isFolderMode = syncMode === 'folder';

    const getSaveButtonContent = () => {
        switch(saveState) {
            case 'saving':
                return (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                );
            case 'saved':
                return <><CheckIcon /> Saved!</>;
            default:
                return <><SaveIcon /> Add to Folder</>;
        }
    };

  return (
    <div className="bg-[var(--theme-card-bg)] p-6 rounded-lg shadow-lg border border-[var(--theme-border)] relative flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[var(--theme-green)]">Generated Description</h2>
        {hasOutput && !isLoading && (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-dark-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm"
                    aria-label="Copy Description"
                >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    {isCopied ? 'Copied!' : 'Copy Text'}
                </button>
                 <button
                    onClick={handleSave}
                    disabled={!isFolderMode || saveState !== 'idle'}
                    title={!isFolderMode ? "Connect a local folder to enable saving" : ""}
                    style={{ backgroundColor: 'var(--theme-blue)'}}
                    className="flex items-center gap-2 hover:opacity-90 disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-secondary)]/50 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm min-w-[140px] justify-center"
                    aria-label="Add to Folder"
                >
                    {getSaveButtonContent()}
                </button>
            </div>
        )}
      </div>

      <div className="bg-[var(--theme-bg)]/80 border border-[var(--theme-border)] rounded-md p-4 flex-grow min-h-[300px] text-[var(--theme-text-primary)] overflow-y-auto flex flex-col">
        <div className="flex-grow">
            {isLoading && !hasOutput && <SkeletonLoader />}
            {error && <div className="text-[var(--theme-red)] p-4 rounded-md bg-[var(--theme-red)]/10 border border-[var(--theme-red)]/30" role="alert">{error}</div>}
            {!isLoading && !error && !hasOutput && (
                <div className="h-full flex items-center justify-center text-[var(--theme-text-secondary)]/70">
                    Your generated product description will appear here.
                </div>
            )}
            {hasOutput && (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{outputText}</pre>
            )}
        </div>
      </div>

      {structuredData && (
        <div className="mt-4 pt-4 border-t border-[var(--theme-border)]/50">
            <h3 className="text-lg font-semibold text-[var(--theme-yellow)] mb-3">Linked Images</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {linkedPhotos.map(photo => <LinkedPhotoThumbnail key={photo.id} photo={photo} />)}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="sr-only"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square border-2 border-dashed border-[var(--theme-border)] rounded-md flex flex-col items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg)]/50 hover:border-solid hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <>
                            <UploadIcon />
                            <span className="text-xs mt-1 text-center">Add Photos</span>
                        </>
                    )}
                </button>
            </div>
        </div>
      )}
    </div>
  );
});
