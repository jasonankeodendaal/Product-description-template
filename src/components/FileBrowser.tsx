
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Photo, Video, View, FileSystemItem } from '../types';
import { fileSystemService } from '../services/fileSystemService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { FolderIcon } from './icons/FolderIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { VideoIcon } from './icons/VideoIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { CodeIcon } from './icons/CodeIcon';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';
import { Spinner } from './icons/Spinner';
import { formatRelativeTime } from '../utils/formatters';
import { ViewGridIcon } from './icons/ViewGridIcon';
import { ViewListIcon } from './icons/ViewListIcon';
import { ViewDetailsIcon } from './icons/ViewDetailsIcon';
import { ViewContentIcon } from './icons/ViewContentIcon';
import { CheckboxCheckedIcon } from './icons/CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from './icons/CheckboxUncheckedIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';

// --- Type Definitions ---
type LayoutMode = 'tiles' | 'list' | 'details' | 'content';
type IconSize = 'small' | 'medium' | 'large' | 'extra-large';
type SortKey = 'name' | 'dateModified' | 'type' | 'size';
type SortDirection = 'asc' | 'desc';

interface FileBrowserProps {
    photos: Photo[];
    videos: Video[];
    directoryHandle: FileSystemDirectoryHandle | null;
    syncMode: 'local' | 'folder' | 'api' | 'ftp';
    onNavigate: (view: View) => void;
    onDeletePhoto: (photo: Photo) => Promise<void>;
    onDeleteVideo: (video: Video) => Promise<void>;
    onDeleteFolderVirtual: (folderPath: string) => Promise<void>;
    onRenameItem: (item: FileSystemItem, newName: string) => Promise<void>;
}

// --- Helper Functions ---
const formatBytes = (bytes?: number): string => {
    if (bytes === undefined) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getIconForItem = (item: FileSystemItem, className: string = "w-full h-full") => {
    if (item.type === 'directory') return <FolderOpenIcon className={className} />;
    if (item.kind === 'photo') return <PhotoIcon className={className} />;
    if (item.kind === 'video') return <VideoIcon className={className} />;
    if (item.kind === 'text') return <FileTextIcon className={className} />;
    if (item.kind === 'json') return <CodeIcon />;
    return <FileTextIcon className={className} />;
};


// --- Preview Modal Component ---
const PreviewModal: React.FC<{ item: FileSystemItem | null; content: string | null; mediaUrl: string | null; onClose: () => void }> = ({ item, content, mediaUrl, onClose }) => {
    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in-down" onClick={onClose}>
            <div className="bg-[var(--theme-card-bg)] max-w-4xl w-full max-h-[90vh] rounded-xl shadow-2xl p-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    {mediaUrl && item.kind === 'photo' && <img src={mediaUrl} alt={item.name} className="max-w-full max-h-full object-contain" />}
                    {mediaUrl && item.kind === 'video' && <video src={mediaUrl} controls autoPlay className="max-w-full max-h-full" />}
                    {content && typeof content === 'string' && <pre className="w-full h-full overflow-auto text-sm bg-black/30 p-4 rounded-md text-gray-300 whitespace-pre-wrap">{content}</pre>}
                </div>
                <div className="flex-shrink-0 flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                    <p className="text-white font-semibold truncate">{item.name}</p>
                    <button onClick={onClose} className="text-sm bg-orange-500 text-black font-bold py-1 px-3 rounded-md">Close</button>
                </div>
            </div>
        </div>
    );
};

// --- Details Pane Component ---
const DetailsPane: React.FC<{ item: FileSystemItem | null; content: string | null; mediaUrl: string | null; onClose: () => void }> = ({ item, content, mediaUrl, onClose }) => {
    if (!item) return null;

    return (
        <aside className="w-80 border-l border-[var(--theme-border)] p-4 flex-shrink-0 flex flex-col animate-fade-in-down relative">
            <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-white"><XIcon /></button>
            <div className="text-center">
                <div className="w-32 h-32 mx-auto text-orange-400 flex items-center justify-center">
                    {mediaUrl && (item.kind === 'photo' || item.kind === 'video') ? (
                        <img src={mediaUrl} alt={item.name} className="w-full h-full object-contain rounded-md" />
                    ) : (
                        getIconForItem(item)
                    )}
                </div>
                <h3 className="text-lg font-bold mt-2 break-words">{item.name}</h3>
                <p className="text-sm text-gray-400 capitalize">{item.kind || item.type}</p>
            </div>
            <div className="text-xs text-gray-500 space-y-1 mt-4 border-t border-[var(--theme-border)] pt-4">
                {item.dateModified && <p><strong>Modified:</strong> {formatRelativeTime(item.dateModified)}</p>}
                {item.size !== undefined && <p><strong>Size:</strong> {formatBytes(item.size)}</p>}
            </div>

            {(content || mediaUrl) && item.kind !== 'photo' && (
                 <div className="mt-4 flex-grow flex flex-col min-h-0">
                    <h4 className="font-bold text-sm text-gray-300 mb-2">Preview</h4>
                    <div className="flex-grow bg-black/30 rounded-md p-2 overflow-auto">
                        {content && typeof content === 'string' ? (
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap">{content}</pre>
                        ) : mediaUrl && item.kind === 'video' ? (
                            <video src={mediaUrl} controls className="w-full rounded" />
                        ) : null}
                    </div>
                </div>
            )}
        </aside>
    );
};


// --- Main Component ---
export const FileBrowser: React.FC<FileBrowserProps> = (props) => {
    const { syncMode, directoryHandle, photos, videos, onNavigate, onDeletePhoto, onDeleteVideo, onDeleteFolderVirtual, onRenameItem } = props;

    // Core State
    const [path, setPath] = useState<string[]>([]);
    const [contents, setContents] = useState<FileSystemItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // View Options State
    const [viewOptions, setViewOptions] = useState({
        layout: 'tiles' as LayoutMode,
        iconSize: 'medium' as IconSize,
        showDetailsPane: true,
        compactView: false,
        itemCheckboxes: false,
        showHidden: false,
    });
    
    // UI Interaction State
    const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [detailsPaneItem, setDetailsPaneItem] = useState<FileSystemItem | null>(null);
    const [detailsPaneMediaUrl, setDetailsPaneMediaUrl] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [previewItem, setPreviewItem] = useState<FileSystemItem | null>(null);
    const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
    const [renamingItem, setRenamingItem] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
    const viewMenuRef = useRef<HTMLDivElement>(null);
    
    // --- Data Loading and Processing ---
    const loadContents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSelectedItems(new Set());
        setDetailsPaneItem(null);
        setPreviewContent(null);
        
        // Revoke old object URLs from previous directory listing
        contents.forEach(item => { if (item.mediaSrc) URL.revokeObjectURL(item.mediaSrc); });

        try {
            const fullPath = path.join('/');

            if (syncMode === 'folder' && directoryHandle) {
                // FOLDER SYNC MODE: Read directly from the file system handle
                const dirContents = await fileSystemService.listDirectoryContents(directoryHandle, fullPath);

                const items: FileSystemItem[] = dirContents.map((entry) => {
                    const itemPath = path.length > 0 ? `${fullPath}/${entry.name}` : entry.name;
                    const isPhoto = /\.(jpe?g|png|gif|webp|bmp)$/i.test(entry.name);
                    const isVideo = /\.(mp4|mov|webm|avi|mkv)$/i.test(entry.name);
                    const isText = /\.(txt|md|csv)$/i.test(entry.name);
                    const isJson = /\.json$/i.test(entry.name);

                    let kind: FileSystemItem['kind'] = 'file';
                    if (isPhoto) kind = 'photo';
                    else if (isVideo) kind = 'video';
                    else if (isText) kind = 'text';
                    else if (isJson) kind = 'json';

                    // Find a match in the loaded data to get an ID for deletion purposes
                    const photoMatch = photos.find(p => p.folder === fullPath && p.name === entry.name);
                    const videoMatch = videos.find(v => v.folder === fullPath && v.name === entry.name);

                    return {
                        name: entry.name,
                        type: entry.kind,
                        kind: entry.kind === 'directory' ? 'folder' : kind,
                        dateModified: entry.lastModified ? new Date(entry.lastModified).toISOString() : undefined,
                        size: entry.size,
                        path: itemPath,
                        id: photoMatch?.id || videoMatch?.id,
                        mediaSrc: undefined,
                    };
                });
                setContents(items);
            } else {
                // LOCAL (VIRTUAL) MODE: Build from photos and videos arrays
                const subfolders = new Set<string>();
                const filesInPath: FileSystemItem[] = [];

                const allMedia = [
                    ...photos.map(p => ({ ...p, itemType: 'photo' as const })),
                    ...videos.map(v => ({ ...v, itemType: 'video' as const }))
                ];

                allMedia.forEach(media => {
                    const mediaPath = media.folder || '_uncategorized';
                    if (mediaPath === fullPath) {
                        filesInPath.push({
                            name: media.name,
                            type: 'file',
                            kind: media.itemType,
                            id: media.id,
                            dateModified: media.date,
                            size: 'imageBlob' in media ? media.imageBlob.size : media.videoBlob.size,
                            path: `${mediaPath}/${media.name}`,
                            mediaSrc: URL.createObjectURL('imageBlob' in media ? media.imageBlob : media.videoBlob),
                        });
                    } else {
                        let relativePath = '';
                        if (fullPath === '') {
                            relativePath = mediaPath;
                        } else if (mediaPath.startsWith(fullPath + '/')) {
                            relativePath = mediaPath.substring(fullPath.length + 1);
                        }
                        if (relativePath) {
                            const subfolderName = relativePath.split('/')[0];
                            if (subfolderName) subfolders.add(subfolderName);
                        }
                    }
                });

                const folderItems: FileSystemItem[] = Array.from(subfolders).map(name => ({
                    name, type: 'directory', kind: 'folder', path: path.length > 0 ? `${fullPath}/${name}` : name
                }));
                
                setContents([...folderItems, ...filesInPath]);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load contents.");
        } finally {
            setIsLoading(false);
        }
    }, [directoryHandle, path, syncMode, photos, videos]);

    useEffect(() => { loadContents(); }, [loadContents]);
    
    useEffect(() => {
        // On unmount, revoke any active object URLs
        return () => {
            if (detailsPaneMediaUrl) URL.revokeObjectURL(detailsPaneMediaUrl);
            if (previewMediaUrl) URL.revokeObjectURL(previewMediaUrl);
            contents.forEach(item => { if (item.mediaSrc) URL.revokeObjectURL(item.mediaSrc); });
        };
    }, [detailsPaneMediaUrl, previewMediaUrl, contents]);


    const filteredAndSortedContents = useMemo(() => {
        return contents
            .filter(item => viewOptions.showHidden || !item.name.startsWith('.'))
            .sort((a, b) => {
                const dirCompare = (b.type === 'directory' ? 1 : 0) - (a.type === 'directory' ? 1 : 0);
                if (dirCompare !== 0) return dirCompare;
                
                const key = sortConfig.key;
                const direction = sortConfig.direction === 'asc' ? 1 : -1;
                
                const valA = a[key as keyof typeof a] || '';
                const valB = b[key as keyof typeof b] || '';

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return (valA - valB) * direction;
                }
                return String(valA).localeCompare(String(valB)) * direction;
            });
    }, [contents, viewOptions.showHidden, sortConfig]);

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // --- UI Handlers ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) setIsViewMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = async (item: FileSystemItem, e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (detailsPaneMediaUrl) URL.revokeObjectURL(detailsPaneMediaUrl);
        setDetailsPaneMediaUrl(null);
        setPreviewContent(null);

        if (viewOptions.itemCheckboxes) {
            toggleSelection(item.name);
        } else {
            setSelectedItems(new Set([item.name]));
            setDetailsPaneItem(item);

            if (syncMode === 'folder' && directoryHandle && item.type === 'file') {
                try {
                    const content = await fileSystemService.readFileContentByPath(directoryHandle, item.path);
                    if (content instanceof Blob) {
                        setDetailsPaneMediaUrl(URL.createObjectURL(content));
                    } else {
                        setPreviewContent(content);
                    }
                } catch (err) {
                    console.error("Failed to read file for details pane:", err);
                    setPreviewContent("Error: Could not load file content.");
                }
            } else if (item.mediaSrc) { // Local mode
                setDetailsPaneMediaUrl(item.mediaSrc);
            }
        }
    };
    
    const handleItemDoubleClick = async (item: FileSystemItem) => {
        if (item.type === 'directory') {
            setPath(prev => [...prev, item.name]);
        } else {
            setPreviewItem(item);
            
            if (previewMediaUrl) URL.revokeObjectURL(previewMediaUrl);
            setPreviewMediaUrl(null);
            setPreviewContent(null);
            
            if (syncMode === 'folder' && directoryHandle) {
                try {
                    const content = await fileSystemService.readFileContentByPath(directoryHandle, item.path);
                    if (content instanceof Blob) {
                        setPreviewMediaUrl(URL.createObjectURL(content));
                    } else {
                        setPreviewContent(content);
                    }
                } catch (err) {
                    setPreviewContent("Error loading content.");
                }
            } else if (item.mediaSrc) { // Local mode
                setPreviewMediaUrl(item.mediaSrc);
            }
        }
    };
    
    const toggleSelection = (itemName: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemName)) newSet.delete(itemName);
            else newSet.add(itemName);
            return newSet;
        });
    };

    const handleUpdateOption = (option: keyof typeof viewOptions, value: any) => {
        setViewOptions(prev => ({ ...prev, [option]: value }));
    };

    const gridClasses = useMemo(() => {
        switch (viewOptions.iconSize) {
            case 'small': return 'grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12';
            case 'large': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
            case 'extra-large': return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
            case 'medium':
            default:
                return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9';
        }
    }, [viewOptions.iconSize]);


    // --- File Operation Handlers ---
    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0 || !window.confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) return;

        for (const itemName of selectedItems) {
            const item = contents.find(c => c.name === itemName);
            if (!item) continue;

            if (syncMode === 'folder' && directoryHandle) {
                await fileSystemService.deleteItemFromDirectory(directoryHandle, path, item.name, item.type === 'directory');
            } else if (syncMode === 'local') {
                if (item.type === 'directory') {
                    await onDeleteFolderVirtual(item.path);
                } else if (item.kind === 'photo') {
                    const photo = photos.find(p => p.id === item.id);
                    if (photo) await onDeletePhoto(photo);
                } else if (item.kind === 'video') {
                    const video = videos.find(v => v.id === item.id);
                    if (video) await onDeleteVideo(video);
                }
            }
        }
        loadContents(); // Refresh
    };

    const canRename = useMemo(() => {
        if (syncMode === 'folder') return false;
        if (selectedItems.size !== 1) return false;
        const selectedName = Array.from(selectedItems)[0];
        const item = contents.find(c => c.name === selectedName);
        return item ? item.name !== '_uncategorized' : false;
    }, [selectedItems, contents, syncMode]);
    
    const handleStartRename = () => {
        if (!canRename) return;
        const selectedName = Array.from(selectedItems)[0];
        setRenamingItem(selectedName);
        setRenameValue(selectedName);
    };

    const handleRenameConfirm = async (originalName: string) => {
        const trimmedNewName = renameValue.trim();
        setRenamingItem(null);
    
        if (trimmedNewName && trimmedNewName !== originalName) {
            try {
                const originalItem = contents.find(c => c.name === originalName);
                if (originalItem) {
                    await onRenameItem(originalItem, trimmedNewName);
                }
            } catch (e) {
                // Error is alerted in App.tsx
            } finally {
                // Let the state update from App.tsx trigger a re-render
                // A full reload is simpler to handle failures and state sync
                loadContents();
            }
        }
    };


    // --- Render logic ---
    const renderMainContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-full"><Spinner className="w-8 h-8" /></div>;
        if (error) return <div className="p-4 text-red-400">{error}</div>;
        if (filteredAndSortedContents.length === 0) return <div className="p-4 text-gray-500">This folder is empty.</div>;

        switch (viewOptions.layout) {
            case 'tiles': return <div className={`grid ${gridClasses} gap-4`}>{filteredAndSortedContents.map(renderItem)}</div>;
            default: return <div className={`grid ${gridClasses} gap-4`}>{filteredAndSortedContents.map(renderItem)}</div>;
        }
    };
    
    const renderItem = (item: FileSystemItem) => {
        const isSelected = selectedItems.has(item.name);
        const isRenaming = renamingItem === item.name;
        
        return (
            <div
                key={item.name}
                onClick={(e) => handleItemClick(item, e)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                className={`group relative rounded-lg p-2 flex flex-col items-center text-center cursor-pointer transition-colors ${isSelected ? 'bg-orange-500/20' : 'hover:bg-white/10'}`}
            >
                {viewOptions.itemCheckboxes && (
                    <div className="absolute top-2 left-2 w-5 h-5 text-white z-10">
                        {isSelected ? <CheckboxCheckedIcon /> : <CheckboxUncheckedIcon className="opacity-50 group-hover:opacity-100" />}
                    </div>
                )}
                <div className={`text-orange-400 mb-2 w-full h-24 flex items-center justify-center`}>
                    {item.mediaSrc ? (
                        <img src={item.mediaSrc} alt={item.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                        getIconForItem(item, 'w-16 h-16')
                    )}
                </div>
                 {isRenaming ? (
                    <input
                        type="text"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameConfirm(item.name)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                            if (e.key === 'Escape') setRenamingItem(null);
                        }}
                        className="text-sm text-gray-900 bg-gray-200 rounded p-1 w-full text-center -mb-1 z-10"
                        autoFocus
                        onClick={e => e.stopPropagation()}
                        onDoubleClick={e => e.stopPropagation()}
                    />
                ) : (
                    <p className="text-sm text-gray-200 truncate w-full">{item.name}</p>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
             {previewItem && <PreviewModal item={previewItem} content={previewContent} mediaUrl={previewMediaUrl} onClose={() => setPreviewItem(null)} />}
             <header className="p-4 border-b border-[var(--theme-border)] flex-shrink-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={() => path.length > 0 ? setPath(p => p.slice(0, -1)) : onNavigate('home')} className="p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white flex-shrink-0"><ChevronLeftIcon /></button>
                    <div className="flex items-center gap-1 text-sm text-gray-400 truncate">
                        <button onClick={() => setPath([])} className="hover:text-white flex-shrink-0">Root</button>
                        {path.map((part, i) => (
                            <React.Fragment key={i}>
                                <span className="flex-shrink-0">/</span>
                                <button onClick={() => setPath(path.slice(0, i + 1))} className="truncate hover:text-white">{part}</button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {syncMode === 'folder' && <button className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-sm font-semibold text-white rounded-lg px-3 py-1.5"><PlusIcon/> New Folder</button>}
                    <div className="relative" ref={viewMenuRef}>
                        <button onClick={() => setIsViewMenuOpen(p => !p)} className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-sm font-semibold text-white rounded-lg px-3 py-1.5">View <MoreVerticalIcon /></button>
                        {isViewMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-slate-800 rounded-lg shadow-2xl border border-slate-600 z-20 p-2 space-y-1">
                                <label className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer"><span className="text-sm">Details pane</span><input type="checkbox" checked={viewOptions.showDetailsPane} onChange={e => handleUpdateOption('showDetailsPane', e.target.checked)} className="accent-orange-500"/></label>
                                <div className="border-t border-slate-600 my-1"/>
                                <label className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer"><span className="text-sm">Item check boxes</span><input type="checkbox" checked={viewOptions.itemCheckboxes} onChange={e => handleUpdateOption('itemCheckboxes', e.target.checked)} className="accent-orange-500"/></label>
                                <label className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer"><span className="text-sm">Show hidden items</span><input type="checkbox" checked={viewOptions.showHidden} onChange={e => handleUpdateOption('showHidden', e.target.checked)} className="accent-orange-500"/></label>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                    {renderMainContent()}
                </div>
                {viewOptions.showDetailsPane && (
                    <DetailsPane item={detailsPaneItem} content={previewContent} mediaUrl={detailsPaneMediaUrl} onClose={() => setDetailsPaneItem(null)} />
                )}
            </main>

            {selectedItems.size > 0 && !renamingItem && (
                <footer className="absolute bottom-24 lg:bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-800/80 backdrop-blur-md p-2 rounded-full flex items-center gap-4 animate-fade-in-down border border-white/10">
                    <span className="text-sm font-semibold text-white pl-2">{selectedItems.size} selected</span>
                    <button 
                        onClick={handleStartRename} 
                        disabled={!canRename} 
                        title={syncMode === 'folder' ? 'Renaming is not available in Folder Sync mode' : !canRename ? 'Select a single item to rename' : 'Rename'} 
                        className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PencilIcon /> Rename
                    </button>
                    <button onClick={handleDeleteSelected} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-full"><TrashIcon /> Delete</button>
                    <button onClick={() => setSelectedItems(new Set())} className="p-2 text-gray-400 hover:text-white"><XIcon/></button>
                </footer>
            )}
        </div>
    );
};
