import React, { useState } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';

// FIX: Define QueuedItem locally to resolve import error from App.tsx
export interface QueuedItem {
  id: string;
  name: string;
  brand: string;
  sku: string;
  fullText: string;
  csvText: string;
}

interface DownloadManagerProps {
  queue: QueuedItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const DownloadManager: React.FC<DownloadManagerProps> = React.memo(({ queue, onRemove, onClear }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    if (queue.length === 0) return;
    
    const JSZip = (window as any).JSZip;
    if (typeof JSZip === 'undefined') {
      setError("Error: JSZip library is not loaded. Cannot create .zip file.");
      return;
    }
    
    setIsZipping(true);
    setError(null);

    try {
      const zip = new JSZip();

      queue.forEach(item => {
        const brandFolder = item.brand.replace(/[^a-zA-Z0-9-_\.]/g, '_').trim() || 'Unbranded';
        const skuFile = item.sku.replace(/[^a-zA-Z0-9-_\.]/g, '_').trim() || `product_${item.id}`;

        const folder = zip.folder(brandFolder);
        if (folder) {
            folder.file(`${skuFile}.txt`, item.fullText);
            folder.file(`${skuFile}.csv`, item.csvText);
        }
      });
      
      const content = await zip.generateAsync({ type: "blob" });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `product_descriptions_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      onClear();
      setIsModalOpen(false);

    } catch (err) {
      console.error("Failed to generate zip file:", err);
      setError("Could not generate the zip file. Please check the console for details.");
    } finally {
      setIsZipping(false);
    }
  };

  if (queue.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ backgroundColor: 'var(--theme-orange)' }}
        className="relative hover:opacity-90 text-black rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
        aria-label={`Open download queue with ${queue.length} items`}
      >
        <DownloadIcon />
        <span className="absolute -top-1 -right-1 bg-[var(--theme-orange)] text-black text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-[var(--theme-bg)]">
            {queue.length}
        </span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-lg shadow-xl border border-[var(--theme-border)] flex flex-col max-h-[90vh]">
            <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-[var(--theme-orange)]">Download Queue ({queue.length})</h2>
                    <p className="text-sm text-[var(--theme-text-secondary)]">Review items before downloading.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
                    <XIcon />
                </button>
            </header>

            <div className="p-4 flex-grow overflow-y-auto">
                {queue.length > 0 ? (
                    <ul className="space-y-2">
                        {queue.map(item => (
                            <li key={item.id} className="bg-[var(--theme-bg)]/50 p-3 rounded-md flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-[var(--theme-text-primary)]">{item.name}</p>
                                    <p className="text-[var(--theme-text-secondary)]">Brand: {item.brand} | SKU: {item.sku}</p>
                                </div>
                                <button onClick={() => onRemove(item.id)} className="p-2 text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-red)]" aria-label={`Remove ${item.name}`}>
                                    <TrashIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-[var(--theme-text-secondary)]/70 text-center py-8">The queue is empty.</p>
                )}
            </div>
            
            {error && <p className="text-[var(--theme-red)] text-sm px-4">{error}</p>}

            <footer className="p-4 border-t border-[var(--theme-border)] bg-black/20 flex justify-between items-center">
                 <button onClick={onClear} className="text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)] transition-colors">Clear Queue</button>
                 <button 
                    onClick={handleDownloadZip} 
                    disabled={isZipping}
                    style={{ backgroundColor: 'var(--theme-orange)' }}
                    className="text-black font-bold py-2 px-6 rounded-md hover:opacity-90 transition-colors duration-200 flex items-center gap-2 disabled:bg-[var(--theme-border)]"
                >
                     {isZipping ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Zipping...
                        </>
                     ) : "Download All as ZIP" }
                </button>
            </footer>

          </div>
        </div>
      )}
    </>
  );
});