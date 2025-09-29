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

interface FileBrowserProps {
    photos: Photo[];
    videos: Video[];
    directoryHandle: FileSystemDirectoryHandle | null;
    syncMode?: 'local' | 'folder' | 'api';
    onNavigate: (view: View) => void;
}

interface DisplayItem {
    name: string;
    kind: 'directory' | 'file';
    type: string;
    date?: string;
    id?: string; // photo or video id
    // FIX: Added 'directory' to itemKind to resolve type error in getFileTypeAndKind.
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

const VideoThumbnail: React.FC<{ video: Video }> = React.memo(({ video }) => {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    useEffect(() => {
        let isMounted = true;
        generateVideoThumbnail(video.videoBlob, 0.5)
            .then(url => { if (isMounted) setThumbUrl(url); })
            .catch(err => console.error("Could not generate thumbnail", err));
        return () => { isMounted = false; if (thumbUrl) URL.revokeObjectURL(thumbUrl); };
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

const GridItem: React.FC<{ item: DisplayItem; onClick: () => void; photos: Photo[]; videos: Video[]; currentPath: string[]; }> = React.memo(({ item, onClick, photos, videos, currentPath }) => {
    const itemPath = [...currentPath, item.name].join('/');

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
    
    const iconColor = item.kind === 'directory' ? 'text-amber-400' :
                      item.itemKind === 'photo' ? 'text-purple-400' :
                      item.itemKind === 'video' ? 'text-pink-400' : 'text-sky-400';

    return (
        <button onClick={onClick} className="group aspect-[4/5] flex flex-col bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-orange-500/50 hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 ring-offset-2 ring-offset-slate-900">
            <div className="flex-grow w-full bg-slate-900/50 relative overflow-hidden flex items-center justify-center">
                {previewMedia?.type === 'photo' && previewMedia.media && <img src={URL.createObjectURL((previewMedia.media as Photo).imageBlob)} alt="preview" className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${item.kind === 'directory' ? 'opacity-30 blur-sm' : ''}`} />}
                {previewMedia?.type === 'video' && previewMedia.media && <VideoThumbnail video={previewMedia.media as Video} />}
                
                {item.kind === 'directory' && <FolderIcon className="w-16 h-16 text-amber-400 opacity-80 drop-shadow-lg" />}
                {!previewMedia && item.kind === 'file' && (item.itemKind === 'text' || item.itemKind === 'json' ? <FileTextIcon className="w-12 h-12 text-sky-400 opacity-60" /> : <FileTextIcon className="w-12 h-12 text-gray-500 opacity-60" />)}
            </div>
            <div className="flex-shrink-0 p-2 text-left bg-slate-800/80 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className={iconColor + ' flex-shrink-0'}>
                        {item.kind === 'directory' ? <FolderIcon className="w-4 h-4" /> : item.itemKind === 'photo' ? <PhotoIcon className="w-4 h-4" /> : item.itemKind === 'video' ? <VideoIcon className="w-4 h-4" /> : <FileTextIcon className="w-4 h-4" />}
                    </div>
                    <p className="text-sm font-semibold text-white truncate group-hover:text-orange-300 transition-colors">{item.name}</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.type}</p>
            </div>
        </button>
    );
});

export const FileBrowser: React.FC<FileBrowserProps> = ({ photos, videos, directoryHandle, syncMode, onNavigate }) => {
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [items, setItems] = useState<DisplayItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewFile, setPreviewFile] = useState<{ name: string; content: string | Blob } | null>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const virtualFileTree = useMemo(() => {
        if (syncMode === 'local' || syncMode === 'api') return buildFileTree(photos, videos);
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
                return { ...item, type, itemKind };
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
                for (const file of Array.from(e.target.files)) {
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

            <div className="p-2 flex-shrink-0 border-b border-[var(--theme-border)]/50 text-sm font-semibold text-gray-400 flex items-center flex-wrap">
                {currentPath.map((part, index) => (
                    <React.Fragment key={index}>
                        <button onClick={() => navigateTo(currentPath.slice(0, index + 1))} className="hover:text-white p-1 rounded-md">{part.replace(/_/g, ' ')}</button>
                        {index < currentPath.length - 1 && <ChevronRightIcon className="w-5 h-5 flex-shrink-0" />}
                    </React.Fragment>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto p-4">
                {isLoading ? <div className="h-full flex items-center justify-center"><Spinner className="w-8 h-8 text-orange-400" /></div>
                : items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                        {/* FIX: Explicitly typed the 'item' parameter in the map function to resolve a TypeScript inference issue where it was being treated as 'unknown'. */}
                        {items.map((item: DisplayItem) => <GridItem key={item.name} item={item} onClick={() => handleItemClick(item)} photos={photos} videos={videos} currentPath={currentPath} />)}
                    </div>
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