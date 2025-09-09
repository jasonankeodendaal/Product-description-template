import React, { useState, useEffect, useCallback } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PlusIcon } from './icons/PlusIcon';
import { QueuedItem } from '../App';

// Define GroundingChunk locally to remove dependency on @google/genai types on the client
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ParsedProductData {
  brand: string;
  sku: string;
  name: string;
  fullText: string;
  csvText: string;
}

export interface GenerationResult {
    text: string;
    sources?: GroundingChunk[];
}

interface OutputPanelProps {
  output: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
  onAddToQueue: (item: ParsedProductData) => void;
  queue: QueuedItem[];
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


export const OutputPanel: React.FC<OutputPanelProps> = React.memo(({ output, isLoading, error, onAddToQueue, queue }) => {
    const [isCopied, setIsCopied] = useState(false);
    const outputText = output?.text || '';

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
    
    const handleAddToQueue = useCallback(() => {
        if (!outputText) return;
        const structuredData = parseOutputToStructuredData(outputText);
        const csvText = convertToRequiredCSV(structuredData);
        
        const item: ParsedProductData = {
            brand: structuredData['Brand'] || 'Unbranded',
            sku: structuredData['SKU'] || `product-${Date.now()}`,
            name: structuredData['Name'] || 'Unnamed Product',
            fullText: outputText,
            csvText: csvText,
        };
        onAddToQueue(item);
    }, [outputText, onAddToQueue]);

    const isAlreadyInQueue = queue.some(item => item.fullText === outputText);

  return (
    <div className="bg-[var(--theme-card-bg)] p-6 rounded-lg shadow-lg border border-[var(--theme-border)] relative flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[var(--theme-green)]">Generated Description</h2>
        {outputText && !isLoading && (
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
                    onClick={handleAddToQueue}
                    disabled={isAlreadyInQueue}
                    style={{ backgroundColor: 'var(--theme-blue)'}}
                    className="flex items-center gap-2 hover:opacity-90 disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-secondary)]/50 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm"
                    aria-label="Add to Download Queue"
                >
                    {isAlreadyInQueue ? <CheckIcon /> : <PlusIcon />}
                    {isAlreadyInQueue ? 'Added' : 'Add to Queue'}
                </button>
            </div>
        )}
      </div>

      <div className="bg-[var(--theme-bg)]/80 border border-[var(--theme-border)] rounded-md p-4 flex-grow min-h-[300px] text-[var(--theme-text-primary)] overflow-y-auto flex flex-col">
        <div className="flex-grow">
            {isLoading && <SkeletonLoader />}
            {error && <div className="text-[var(--theme-red)] p-4 rounded-md bg-[var(--theme-red)]/10 border border-[var(--theme-red)]/30" role="alert">{error}</div>}
            {!isLoading && !error && !outputText && (
                <div className="h-full flex items-center justify-center text-[var(--theme-text-secondary)]/70">
                    Your generated product description will appear here.
                </div>
            )}
            {outputText && (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{outputText}</pre>
            )}
        </div>
      </div>
    </div>
  );
});