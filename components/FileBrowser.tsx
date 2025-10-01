import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Photo, Video, View } from '../App';
import { fileSystemService } from '../services/fileSystemService';
import { buildFileTree, FileTreeNode } from '../utils/fileTree';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { FolderIcon } from './icons/FolderIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { VideoIcon } from './icons/VideoIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { Spinner } from './icons/Spinner';
import { XIcon } from './icons/XIcon';
import { generateVideoThumbnail } from '../utils/videoUtils';
import { DownloadIcon } from './icons/DownloadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UploadIcon } from './icons/UploadIcon';
import { GridIcon } from './icons/GridIcon';
import { ListIcon } from './icons/ListIcon';
import { formatRelativeTime } from '../utils/formatters';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';

interface FileBrowserProps {
    photos: Photo[];
    videos: Video[];
    directoryHandle: FileSystemDirectoryHandle | null;
    // FIX: Add 'ftp' to syncMode to match the SiteSettings type.
    syncMode?: 'local' | 'folder' | 'api' | 'ftp';
    onNavigate: (view: View) => void;
}

interface DisplayItem {
    name: string;
    kind: 'directory' | 'file';
    type: string;
    date?: string;
    id?: string; // photo or video id
    itemKind?: 'directory' | 'photo' | 'video' | 'text' | 'json' | 'unknown';
}

const FilePreviewModal: React.FC<{ content: string | Blob; fileName: string; onClose: () => void; }> = ({ content, fileName, onClose }) => {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (content instanceof Blob) {
            const url = URL.createObjectURL(content);
            setObjectUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [content]);

    const handleDownload = () => {
        if (!objectUrl) return;
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopy = () => {
        if (typeof content === 'string') {
            navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const renderContent = () => {
        if (typeof content === 'string') {
            const isJson = fileName.endsWith('.json');
            try {
                const formattedContent = isJson ? JSON.stringify(JSON.parse(content), null, 2) : content;
                return <pre className="whitespace-pre-wrap text-sm p-4 bg-black/20 rounded-md">{formattedContent}</pre>;
            } catch {
                return <pre className="whitespace-pre-wrap text-sm p-4 bg-black/20 rounded-md">{content}</pre>;
            }
        }
        if (objectUrl) {
            if (content.type.startsWith('image/')) return <img src={objectUrl} alt={fileName} className="max-w-full max-h-full object-contain" />;
            if (content.type.startsWith('video/')) return <video src={objectUrl} controls autoPlay className="max-w-full max-h-full" />;
        }
        return <p>Unsupported file type for preview.</p>;
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-card-bg)] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--theme-text-primary)] truncate">{fileName}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-[var(--theme-text-secondary)] hover:text-white"><XIcon /></button>
                </header>
                <div className="flex-grow p-6 overflow-auto flex items-center justify-center">
                    {renderContent()}
                </div>
                <footer className="p-3 bg-black/20 border-t border-[var(--theme-border)]/50 flex justify-end gap-3">
                    {typeof content === 'string' ? (
                        <button onClick={handleCopy} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm">
                            {isCopied ? <CheckIcon /> : <CopyIcon />} {isCopied ? 'Copied!' : 'Copy Content'}
                        </button>
                    ) : (
                        <button onClick={handleDownload} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md text-sm">
                            <DownloadIcon /> Download File
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

const getFileTypeAndKind = (name: string, kind: 'directory' | 'file'): { type: string, itemKind: DisplayItem['itemKind']} => {
    if (kind === 'directory') return { type: 'Folder', itemKind: 'directory' };
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jpg': case 'jpeg': return { type: 'JPEG Image', itemKind: 'photo' };
        case 'png': return { type: 'PNG Image', itemKind: 'photo' };
        case 'webp': return { type: 'WebP Image', itemKind: 'photo' };
        case 'mp4': return { type: 'MP4 Video', itemKind: 'video' };
        case 'webm': return { type: 'WebM Video', itemKind: 'video' };
        case 'mov': return { type: 'QuickTime Video', itemKind: 'video' };
        case 'json': return { type: 'JSON File', itemKind: 'json' };
        case 'txt': return { type: 'Text Document', itemKind: 'text' };
        default: return { type: 'File', itemKind: 'unknown' };
    }
};

const BrowserPhotoThumbnail: React.FC<{ photo: Photo; className?: string }> = React.memo(({ photo, className }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (photo.imageBlob) {
            const url = URL.createObjectURL(photo.imageBlob);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [photo.imageBlob]);

    if (!imageUrl) {
        return <div className={`w-full h-full bg-slate-700 animate-pulse ${className || ''}`}></div>;
    }

    return (
        <img src={imageUrl} alt={photo.name} className={`w-full h-full object-cover ${className || ''}`} />
    );
});

const VideoThumbnail: React.FC<{ video: Video }> = React.memo(({ video }) => {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    useEffect(() => {
        let isMounted = true;
        generateVideoThumbnail(video.videoBlob, 0.5)
            .then(url => { if (isMounted) setThumbUrl(url); })
            .catch(err => console.error("Could not generate thumbnail", err));
        return () => { isMounted = false; };
    }, [video.videoBlob]);

    return (
        <div className="w-full h-full bg-black flex items-center justify-center">
            {thumbUrl && <img src={thumbUrl} alt={video.name} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <VideoIcon className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
        </div>
    );
});

export const FileBrowser: React.FC<FileBrowserProps> = ({ photos, videos, directoryHandle, syncMode, onNavigate }) => {
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [items, setItems] = useState<DisplayItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewFile, setPreviewFile] = useState<{ name: string; content: string | Blob } | null>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: DisplayItem } | null>(null);
    const [renamingItem, setRenamingItem] = useState<DisplayItem | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const contextMenuRef = useRef<HTMLDivElement>(null);


    const virtualFileTree = useMemo(() => {
        if (syncMode === 'local' || syncMode === 'api' || syncMode === 'ftp') return buildFileTree(photos, videos);
        return null;
    }, [syncMode, photos, videos]);

    const navigateTo = (path: string[]) => setCurrentPath(path);
    
    const loadItems = useCallback(async () => {
        setIsLoading(true);
        let displayItems: DisplayItem[] = [];
        
        if (syncMode === 'folder' && directoryHandle) {
            const dirItems = await fileSystemService.listDirectoryContents(directoryHandle, currentPath.join('/'));
            displayItems = dirItems.map(item => {
                const { type, itemKind } = getFileTypeAndKind(item.name, item.kind);
                let id: string | undefined = undefined;
                if (item.kind === 'file' && (itemKind === 'photo' || itemKind === 'video')) {
                    id = item.name.split('.').slice(0, -1).join('.');
                }
                return { ...item, type, itemKind, id };
            });
        } else if (virtualFileTree) {
            const findNode = (root: FileTreeNode, pathParts: string[]): FileTreeNode | null => {
                if (!pathParts.length) return root;
                let currentNode = root;
                for (const part of pathParts) {
                    const nextNode = currentNode.children?.find(c => c.name === part);
                    if (!nextNode) return null;
                    currentNode = nextNode;
                }
                return currentNode;
            };
            const node = findNode(virtualFileTree, currentPath);
            displayItems = node?.children?.map(child => ({
                name: child.name,
                kind: child.type === 'directory' ? 'directory' : 'file',
                type: getFileTypeAndKind(child.name, child.type).type,
                itemKind: getFileTypeAndKind(child.name, child.type).itemKind,
                date: child.date,
                id: child.id,
            })) || [];
        }
        
        setItems(displayItems);
        setIsLoading(false);
    }, [currentPath, syncMode, directoryHandle, virtualFileTree]);

    useEffect(() => { loadItems(); }, [loadItems]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setContextMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortedItems = useMemo(() => {
        return [...items].sort((a: DisplayItem, b: DisplayItem) => {
            if (a.kind === 'directory' && b.kind !== 'directory') return -1;
            if (a.kind !== 'directory' && b.kind === 'directory') return 1;

            if (sortBy === 'date' && a.date && b.date) {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
            return a.name.localeCompare(b.name);
        });
    }, [items, sortBy]);

    const handleItemClick = (item: DisplayItem) => {
        if (item.kind === 'directory') navigateTo([...currentPath, item.name]);
        else handleFilePreview([...currentPath, item.name].join('/'));
    };

    const handleFilePreview = async (fullPath: string) => {
        setIsLoading(true);
        try {
            let content: string | Blob | undefined;
            const fileName = fullPath.split('/').pop()!;
            if (syncMode === 'folder' && directoryHandle) {
                content = await fileSystemService.readFileContentByPath(directoryHandle, fullPath);
            } else {
                const fileId = fileName.split('.')[0];
                const photo = photos.find(p => p.id === fileId);
                if (photo) content = photo.imageBlob;
                else {
                    const video = videos.find(v => v.id === fileId);
                    if (video) content = video.videoBlob;
                    else alert("Preview for this file type is only available in Local Folder Sync mode.");
                }
            }
            if (content) setPreviewFile({ name: fileName, content });
        } catch (error) { alert(`Could not load file: ${error instanceof Error ? error.message : "Unknown error"}`); }
        setIsLoading(false);
    };

    const handleMoreClick = (e: React.MouseEvent, item: DisplayItem) => {
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };
    
    const handleRename = async () => {
        if (!renamingItem || !renameValue || renameValue === renamingItem.name) {
            setRenamingItem(null);
            return;
        }
        if (syncMode !== 'folder' || !directoryHandle) return;

        try {
            await fileSystemService.renameItem(directoryHandle, currentPath, renamingItem.name, renameValue);
            await loadItems();
        } catch (e) {
            alert(`Failed to rename: ${e instanceof Error ? e.message : "Unknown error"}`);
        } finally {
            setRenamingItem(null);
        }
    };
    
    const handleCreateFolder = async () => {
        const folderName = prompt("Enter new folder name:");
        if (folderName && directoryHandle) {
            setIsLoading(true);
            try {
                let currentDir = directoryHandle;
                for (const part of currentPath) { currentDir = await currentDir.getDirectoryHandle(part); }
                await currentDir.getDirectoryHandle(folderName, { create: true });
                await loadItems();
            } catch (e) { alert("Failed to create folder."); }
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && directoryHandle) {
            setIsLoading(true);
            try {
                let currentDir = directoryHandle;
                for (const part of currentPath) { currentDir = await currentDir.getDirectoryHandle(part); }
                for (const file of e.target.files) {
                    const fileHandle = await currentDir.getFileHandle(file.name, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(file);
                    await writable.close();
                }
                await loadItems();
            } catch (err) { alert("Failed to upload files."); }
            setIsLoading(false);
        }
        if (e.target) e.target.value = '';
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-900 text-[var(--theme-text-primary)] font-inter">
            {previewFile && <FilePreviewModal content={previewFile.content} fileName={previewFile.name} onClose={() => setPreviewFile(null)} />}
            
            {contextMenu && (
                <div ref={contextMenuRef} style={{ top: contextMenu.y, left: contextMenu.x }} className="fixed z-50 bg-slate-800 border border-slate-600 rounded-md shadow-lg p-1 animate-fade-in-down">
                    <button onClick={() => {
                        setRenamingItem(contextMenu.item);
                        setRenameValue(contextMenu.item.name);
                        setContextMenu(null);
                    }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-700 rounded-md">
                        Rename
                    </button>
                </div>
            )}

            <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)]/50 flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] font-semibold transition-colors -ml-2 p-2"><ChevronLeftIcon /><span className="hidden sm:inline">Back</span></button>
                    <div>
                        <h1 className="text-2xl font-bold">File Browser</h1>
                        <p className="text-sm text-[var(--theme-text-secondary)]">Navigate your generated content.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input type="file" ref={uploadInputRef} onChange={handleUpload} multiple className="hidden" />
                    <button onClick={() => uploadInputRef.current?.click()} disabled={syncMode !== 'folder'} title={syncMode !== 'folder' ? 'Enable Local Folder Sync to upload' : 'Upload Files'} className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"><UploadIcon/> <span className="hidden md:inline">Upload</span></button>
                    <button onClick={handleCreateFolder} disabled={syncMode !== 'folder'} title={syncMode !== 'folder' ? 'Enable Local Folder Sync to create folders' : 'New Folder'} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-black font-bold py-2 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"><PlusIcon/> <span className="hidden md:inline">New Folder</span></button>
                </div>
            </header>

            <div className="p-2 flex-shrink-0 border-b border-[var(--theme-border)]/50 flex justify-between items-center gap-2">
                <div className="text-sm font-semibold text-gray-400 flex items-center flex-wrap">
                    <button onClick={() => navigateTo([])} className="hover:text-white p-1 rounded-md">Root</button>
                    {currentPath.map((part, index) => (
                        <React.Fragment key={index}>
                            <ChevronRightIcon className="w-5 h-5 flex-shrink-0" />
                            <button onClick={() => navigateTo(currentPath.slice(0, index + 1))} className="hover:text-white p-1 rounded-md">{part.replace(/_/g, ' ')}</button>
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'date')} className="bg-slate-700 text-sm rounded-md p-1.5 focus:ring-orange-500 border-none">
                        <option value="name">Sort by Name</option>
                        {syncMode !== 'folder' && <option value="date">Sort by Date</option>}
                    </select>
                    <div className="flex items-center bg-slate-700 rounded-md p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'bg-orange-500 text-black' : 'text-gray-300'}`}><GridIcon/></button>
                        <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-orange-500 text-black' : 'text-gray-300'}`}><ListIcon/></button>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4">
                {isLoading ? <div className="h-full flex items-center justify-center"><Spinner className="w-8 h-8 text-orange-400" /></div>
                : sortedItems.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                            {sortedItems.map((item: DisplayItem) => (
                                <GridItem key={item.name} item={item} photos={photos} videos={videos} currentPath={currentPath}
                                    syncMode={syncMode}
                                    renamingItem={renamingItem}
                                    renameValue={renameValue}
                                    setRenameValue={setRenameValue}
                                    handleRename={handleRename}
                                    setRenamingItem={setRenamingItem}
                                    onItemClick={() => renamingItem?.name !== item.name && handleItemClick(item)}
                                    onMoreClick={(e) => handleMoreClick(e, item)}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="space-y-1">
                             {sortedItems.map((item: DisplayItem) => (
                                <ListItem key={item.name} item={item} 
                                    syncMode={syncMode}
                                    renamingItem={renamingItem}
                                    renameValue={renameValue}
                                    setRenameValue={setRenameValue}
                                    handleRename={handleRename}
                                    setRenamingItem={setRenamingItem}
                                    onItemClick={() => renamingItem?.name !== item.name && handleItemClick(item)}
                                    onMoreClick={(e) => handleMoreClick(e, item)}
                                />
                             ))}
                        </div>
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
                        <FolderIcon className="w-16 h-16 mb-4" />
                        <p className="font-semibold text-lg">This folder is empty</p>
                    </div>
                )}
            </main>
        </div>
    );
};

// --- Sub-components for Grid and List Items ---

const GridItem: React.FC<{ 
    item: DisplayItem; onItemClick: () => void; onMoreClick: (e: React.MouseEvent) => void; photos: Photo[]; videos: Video[]; currentPath: string[]; syncMode?: FileBrowserProps['syncMode'];
    renamingItem: DisplayItem | null; renameValue: string; setRenameValue: (val: string) => void; handleRename: () => void; setRenamingItem: (item: DisplayItem | null) => void;
}> = React.memo(({ item, onItemClick, onMoreClick, photos, videos, currentPath, syncMode, renamingItem, renameValue, setRenameValue, handleRename, setRenamingItem }) => {
    const itemPath = [...currentPath, item.name].join('/');
    const isRenaming = renamingItem?.name === item.name;

    const previewMedia = useMemo(() => {
        if (item.kind === 'directory') {
            const firstPhoto = photos.find(p => p.folder.startsWith(itemPath));
            if (firstPhoto) return { type: 'photo', media: firstPhoto };
            const firstVideo = videos.find(v => v.folder.startsWith(itemPath));
            if (firstVideo) return { type: 'video', media: firstVideo };
        }
        if (item.itemKind === 'photo') return { type: 'photo', media: photos.find(p => p.id === item.id) };
        if (item.itemKind === 'video') return { type: 'video', media: videos.find(v => v.id === item.id) };
        return null;
    }, [item, photos, videos, itemPath]);
    
    const iconColor = item.kind === 'directory' ? 'text-amber-400' : item.itemKind === 'photo' ? 'text-purple-400' : item.itemKind === 'video' ? 'text-pink-400' : 'text-sky-400';

    return (
        <div className="group aspect-[4/5] flex flex-col bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-orange-500/50 hover:bg-slate-800 transition-all duration-200 focus-within:ring-2 focus-within:ring-orange-500 ring-offset-2 ring-offset-slate-900 relative" onClick={onItemClick}>
            <div className="flex-grow w-full bg-slate-900/50 relative overflow-hidden flex items-center justify-center">
                {previewMedia?.type === 'photo' && previewMedia.media && <BrowserPhotoThumbnail photo={previewMedia.media as Photo} className={`transition-transform duration-300 group-hover:scale-105 ${item.kind === 'directory' ? 'opacity-30 blur-sm' : ''}`} />}
                {previewMedia?.type === 'video' && previewMedia.media && <div className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${item.kind === 'directory' ? 'opacity-30 blur-sm' : ''}`}><VideoThumbnail video={previewMedia.media as Video} /></div>}
                {!previewMedia && item.kind === 'directory' && <FolderIcon className="w-16 h-16 text-amber-400 opacity-80 drop-shadow-lg" />}
                {!previewMedia && (item.itemKind === 'text' || item.itemKind === 'json') && <FileTextIcon className="w-12 h-12 text-sky-400 opacity-60" />}
                {item.kind === 'directory' && previewMedia && <FolderIcon className="w-16 h-16 text-amber-400 opacity-90 drop-shadow-lg absolute" />}
                {!previewMedia && item.kind === 'file' && item.itemKind === 'photo' && <PhotoIcon className="w-12 h-12 text-purple-400" />}
                {!previewMedia && item.kind === 'file' && item.itemKind === 'video' && <VideoIcon className="w-12 h-12 text-pink-400" />}
            </div>
            <div className="flex-shrink-0 p-2 text-left bg-slate-800/80 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className={iconColor + ' flex-shrink-0'}>{item.kind === 'directory' ? <FolderIcon className="w-4 h-4" /> : item.itemKind === 'photo' ? <PhotoIcon className="w-4 h-4" /> : item.itemKind === 'video' ? <VideoIcon className="w-4 h-4" /> : <FileTextIcon className="w-4 h-4" />}</div>
                    {isRenaming ? (
                        <input type="text" value={renameValue} autoFocus onFocus={(e) => e.target.select()} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => {if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenamingItem(null);}} onBlur={handleRename} onClick={e => e.stopPropagation()} className="w-full bg-slate-600 text-white text-sm font-semibold rounded p-0.5 -m-0.5" />
                    ) : (
                        <p className="text-sm font-semibold text-white truncate group-hover:text-orange-300 transition-colors">{item.name}</p>
                    )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.type}</p>
            </div>
            {syncMode === 'folder' && !isRenaming && (
                <button onClick={onMoreClick} className="absolute top-1 right-1 p-1.5 bg-black/40 rounded-full text-white/70 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"><MoreVerticalIcon /></button>
            )}
        </div>
    );
});

const ListItem: React.FC<{ 
    item: DisplayItem; onItemClick: () => void; onMoreClick: (e: React.MouseEvent) => void; syncMode?: FileBrowserProps['syncMode'];
    renamingItem: DisplayItem | null; renameValue: string; setRenameValue: (val: string) => void; handleRename: () => void; setRenamingItem: (item: DisplayItem | null) => void;
}> = ({ item, onItemClick, onMoreClick, syncMode, renamingItem, renameValue, setRenameValue, handleRename, setRenamingItem }) => {
    const iconColor = item.kind === 'directory' ? 'text-amber-400' : item.itemKind === 'photo' ? 'text-purple-400' : item.itemKind === 'video' ? 'text-pink-400' : 'text-sky-400';
    const isRenaming = renamingItem?.name === item.name;
    return (
        <div onClick={onItemClick} className="w-full flex items-center gap-4 p-2 rounded-md hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${iconColor}`}>{item.kind === 'directory' ? <FolderIcon /> : item.itemKind === 'photo' ? <PhotoIcon /> : item.itemKind === 'video' ? <VideoIcon /> : <FileTextIcon/>}</div>
            {isRenaming ? (
                <input type="text" value={renameValue} autoFocus onFocus={(e) => e.target.select()} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => {if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenamingItem(null);}} onBlur={handleRename} onClick={e => e.stopPropagation()} className="w-full bg-slate-600 text-white font-semibold rounded p-1" />
            ) : (
                <span className="font-semibold flex-grow text-left truncate">{item.name}</span>
            )}
            <span className="text-sm text-slate-400 flex-shrink-0 w-32 hidden md:block">{item.date ? formatRelativeTime(item.date) : '--'}</span>
            <span className="text-sm text-slate-400 flex-shrink-0 w-32 hidden sm:block">{item.type}</span>
            {syncMode === 'folder' && !isRenaming && (
                <button onClick={onMoreClick} className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 opacity-0 group-hover:opacity-100"><MoreVerticalIcon /></button>
            )}
        </div>
    );
};