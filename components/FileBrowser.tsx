import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Photo, Video, View } from '../App';
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
}

interface FileSystemItem {
    name: string;
    type: 'directory' | 'file';
    kind?: 'photo' | 'video' | 'text' | 'json' | string;
    id?: string;
    dateModified?: string;
    size?: number;
    path: string;
    mediaSrc?: string;
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

// --- Main Component ---
export const FileBrowser: React.FC<FileBrowserProps> = (props) => {
    const { syncMode, directoryHandle, photos, videos, onNavigate, onDeletePhoto, onDeleteVideo, onDeleteFolderVirtual } = props;

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
    const [previewContent, setPreviewContent] = useState<string | Blob | null>(null);
    const [renamingItem, setRenamingItem] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
    const viewMenuRef = useRef<HTMLDivElement>(null);
    
    // --- Data Loading and Processing ---
    const loadContents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSelectedItems(new Set());
        setDetailsPaneItem(null);
        setPreviewContent(null);
        
        try {
            let items: FileSystemItem[] = [];
            if (syncMode === 'folder' && directoryHandle) {
                // TODO: Enhance fileSystemService to return more metadata
                const fsContents = await fileSystemService.listDirectoryContents(directoryHandle, path.join('/'));
                items = fsContents.map(item => ({
                    ...item,
                    path: [...path, item.name].join('/'),
                    type: item.kind,
                    kind: item.kind === 'file' ? item.name.split('.').pop()?.toLowerCase() : 'folder',
                }));

            } else if (syncMode === 'local') {
                const fullPath = path.join('/');
                const subfolders = new Set<string>();
                const filesInPath: FileSystemItem[] = [];

                [...photos, ...videos].forEach(media => {
                    const mediaPath = media.folder;
                    if (mediaPath === fullPath) {
                        filesInPath.push({
                            name: media.name,
                            type: 'file',
                            kind: 'imageBlob' in media ? 'photo' : 'video',
                            id: media.id,
                            dateModified: media.date,
                            size: 'imageBlob' in media ? media.imageBlob.size : media.videoBlob.size,
                            path: `${mediaPath}/${media.name}`,
                            mediaSrc: URL.createObjectURL('imageBlob' in media ? media.imageBlob : media.videoBlob),
                        });
                    } else if (mediaPath.startsWith(fullPath) && mediaPath !== fullPath) {
                        const subPath = mediaPath.substring(fullPath.length).replace(/^\//, '');
                        const subfolderName = subPath.split('/')[0];
                        if(subfolderName) subfolders.add(subfolderName);
                    }
                });
                
                const folderItems: FileSystemItem[] = Array.from(subfolders).map(name => ({
                    name, type: 'directory', kind: 'folder', path: `${fullPath}/${name}`
                }));

                items = [...folderItems, ...filesInPath];
            }
            setContents(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load contents.");
        } finally {
            setIsLoading(false);
        }
    }, [directoryHandle, path, syncMode, photos, videos]);

    useEffect(() => { loadContents(); }, [loadContents]);

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

    const handleItemClick = (item: FileSystemItem, e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (viewOptions.itemCheckboxes) {
            toggleSelection(item.name);
        } else {
            setSelectedItems(new Set([item.name]));
            setDetailsPaneItem(item);
            setPreviewContent(null);
        }
    };
    
    const handleItemDoubleClick = (item: FileSystemItem) => {
        if (item.type === 'directory') {
            setPath(prev => [...prev, item.name]);
        } else {
             console.log("Opening file:", item.path);
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
                // TODO: Implement fileSystemService.deleteItem
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

    // --- Render logic ---
    const renderMainContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-full"><Spinner className="w-8 h-8" /></div>;
        if (error) return <div className="p-4 text-red-400">{error}</div>;
        if (filteredAndSortedContents.length === 0) return <div className="p-4 text-gray-500">This folder is empty.</div>;

        switch (viewOptions.layout) {
            case 'tiles': return <div className={`grid ${gridClasses} gap-4`}>{filteredAndSortedContents.map(renderItem)}</div>;
            // Add other layouts later
            default: return <div className={`grid ${gridClasses} gap-4`}>{filteredAndSortedContents.map(renderItem)}</div>;
        }
    };
    
    const renderItem = (item: FileSystemItem) => {
        const isSelected = selectedItems.has(item.name);
        const iconSizeClass = `w-16 h-16`; // Simplified for now
        return (
            <div
                key={item.name}
                onClick={(e) => handleItemClick(item, e)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                className={`group relative rounded-lg p-2 flex flex-col items-center text-center cursor-pointer transition-colors ${isSelected ? 'bg-orange-500/20' : 'hover:bg-white/10'}`}
            >
                {viewOptions.itemCheckboxes && (
                    <div className="absolute top-2 left-2 w-5 h-5 text-white">
                        {isSelected ? <CheckboxCheckedIcon /> : <CheckboxUncheckedIcon className="opacity-50 group-hover:opacity-100" />}
                    </div>
                )}
                <div className={`text-orange-400 mb-2 ${iconSizeClass}`}>{getIconForItem(item)}</div>
                <p className="text-sm text-gray-200 truncate w-full">{item.name}</p>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
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
                                <div className="p-1 font-bold text-xs text-slate-400">Layout</div>
                                <div className="grid grid-cols-4 gap-1">
                                    {(['tiles', 'list', 'details', 'content'] as LayoutMode[]).map(mode => (
                                        <button key={mode} onClick={() => handleUpdateOption('layout', mode)} className={`flex flex-col items-center p-2 rounded ${viewOptions.layout === mode ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/10'}`}>
                                            {mode==='tiles'?<ViewGridIcon/>:mode==='list'?<ViewListIcon/>:mode==='details'?<ViewDetailsIcon/>:<ViewContentIcon/>}
                                            <span className="text-xs capitalize mt-1">{mode}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-slate-600 my-1"/>
                                <label className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer"><span className="text-sm">Details pane</span><input type="checkbox" checked={viewOptions.showDetailsPane} onChange={e => handleUpdateOption('showDetailsPane', e.target.checked)} className="accent-orange-500"/></label>
                                <div className="border-t border-slate-600 my-1"/>
                                <label className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer"><span className="text-sm">Item check boxes</span><input type="checkbox" checked={viewOptions.itemCheckboxes} onChange={e => handleUpdateOption('itemCheckboxes', e.target.checked)} className="accent-orange-500"/></label>
                                <label className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer"><span className="text-sm">Compact view</span><input type="checkbox" checked={viewOptions.compactView} onChange={e => handleUpdateOption('compactView', e.target.checked)} className="accent-orange-500"/></label>
                                <label className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer"><span className="text-sm">Hidden items</span><input type="checkbox" checked={viewOptions.showHidden} onChange={e => handleUpdateOption('showHidden', e.target.checked)} className="accent-orange-500"/></label>
                                {viewOptions.layout === 'tiles' && <>
                                    <div className="border-t border-slate-600 my-1"/>
                                    <div className="p-1 font-bold text-xs text-slate-400">Icon Size</div>
                                    <div className="flex justify-around items-center p-1">
                                        {(['small', 'medium', 'large', 'extra-large'] as IconSize[]).map(size => (
                                             <button key={size} onClick={() => handleUpdateOption('iconSize', size)} className={`px-3 py-1 text-xs rounded-full capitalize ${viewOptions.iconSize === size ? 'bg-orange-500 text-black' : 'hover:bg-white/10'}`}>{size}</button>
                                        ))}
                                    </div>
                                </>}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                    {renderMainContent()}
                </div>
                {viewOptions.showDetailsPane && detailsPaneItem && (
                    <aside className="w-80 border-l border-[var(--theme-border)] p-4 flex-shrink-0 flex flex-col">
                        <div className="text-center">
                            <div className="w-32 h-32 mx-auto text-orange-400">{getIconForItem(detailsPaneItem)}</div>
                            <h3 className="text-lg font-bold mt-2 break-words">{detailsPaneItem.name}</h3>
                            <p className="text-sm text-gray-400">{detailsPaneItem.kind}</p>
                        </div>
                    </aside>
                )}
            </main>

            {selectedItems.size > 0 && (
                <footer className="absolute bottom-24 lg:bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-800/80 backdrop-blur-md p-2 rounded-full flex items-center gap-4 animate-fade-in-down border border-white/10">
                    <span className="text-sm font-semibold text-white pl-2">{selectedItems.size} selected</span>
                    <button onClick={handleDeleteSelected} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-full"><TrashIcon /> Delete</button>
                    <button onClick={() => setSelectedItems(new Set())} className="p-2 text-gray-400 hover:text-white"><XIcon/></button>
                </footer>
            )}
        </div>
    );
};