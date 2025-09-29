import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { formatIsoToReadableDateTime } from '../utils/formatters';
import { generateVideoThumbnail } from '../utils/videoUtils';

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
    date: string;
    id?: string;
    fileKind?: 'photo' | 'video' | 'text' | 'json';
}

const FilePreviewModal: React.FC<{
    content: string | Blob;
    fileName: string;
    onClose: () => void;
}> = ({ content, fileName, onClose }) => {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (content instanceof Blob) {
            const url = URL.createObjectURL(content);
            setObjectUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [content]);

    const renderContent = () => {
        if (typeof content === 'string') {
            const isJson = fileName.endsWith('.json');
            return <pre className="whitespace-pre-wrap text-sm p-4 bg-black/20 rounded-md">{isJson ? JSON.stringify(JSON.parse(content), null, 2) : content}</pre>;
        }
        if (objectUrl) {
            if (content.type.startsWith('image/')) {
                return <img src={objectUrl} alt={fileName} className="max-w-full max-h-full object-contain" />;
            }
            if (content.type.startsWith('video/')) {
                return <video src={objectUrl} controls autoPlay className="max-w-full max-h-full" />;
            }
        }
        return <p>Unsupported file type.</p>;
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-card-bg)] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--theme-text-primary)] truncate">{fileName}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-[var(--theme-text-secondary)] hover:text-white"><XIcon /></button>
                </header>
                <div className="flex-grow p-6 overflow-auto flex items-center justify-center">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

const getFileType = (name: string, kind: 'directory' | 'file'): string => {
    if (kind === 'directory') return 'Folder';
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jpg':
        case 'jpeg': return 'JPEG Image';
        case 'png': return 'PNG Image';
        case 'webp': return 'WebP Image';
        case 'mp4': return 'MP4 Video';
        case 'webm': return 'WebM Video';
        case 'mov': return 'QuickTime Video';
        case 'json': return 'JSON File';
        case 'txt': return 'Text Document';
        default: return 'File';
    }
};

const FileItemCard: React.FC<{ 
    item: DisplayItem; 
    onClick: () => void;
    syncMode?: 'local' | 'folder' | 'api';
    photos: Photo[];
    videos: Video[];
}> = ({ item, onClick, syncMode, photos, videos }) => {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const generateThumb = async () => {
            if (syncMode !== 'folder' && item.id) {
                if (item.fileKind === 'photo') {
                    const photo = photos.find(p => p.id === item.id);
                    if (photo && isMounted) setThumbUrl(URL.createObjectURL(photo.imageBlob));
                } else if (item.fileKind === 'video') {
                    const video = videos.find(v => v.id === item.id);
                    if (video) {
                        try {
                            const url = await generateVideoThumbnail(video.videoBlob);
                            if(isMounted) setThumbUrl(url);
                        } catch (e) {
                            console.warn("Could not generate video thumbnail for grid view:", e);
                        }
                    }
                }
            }
        };
        generateThumb();

        return () => { 
            isMounted = false;
            if (thumbUrl) URL.revokeObjectURL(thumbUrl);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id, item.fileKind, syncMode]);

    const Icon = useMemo(() => {
        const iconClass = "w-12 h-12 text-gray-400";
        if (item.kind === 'directory') return <FolderIcon className={`${iconClass} text-amber-400`} />;
        if (item.type.includes('Image')) return <PhotoIcon className={`${iconClass} text-purple-400`} />;
        if (item.type.includes('Video')) return <VideoIcon className={`${iconClass} text-pink-400`} />;
        if (item.type.includes('JSON') || item.type.includes('Text')) return <FileTextIcon className={`${iconClass} text-sky-400`} />;
        return <FileTextIcon className={iconClass} />;
    }, [item.kind, item.type]);

    return (
        <button 
            onClick={onClick} 
            className="group aspect-[4/5] bg-[var(--theme-card-bg)] rounded-lg overflow-hidden border border-[var(--theme-border)]/50 flex flex-col text-left transition-all duration-200 hover:border-[var(--theme-orange)]/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[var(--theme-orange)]"
        >
            <div className="flex-grow w-full bg-black/20 flex items-center justify-center overflow-hidden">
                {thumbUrl ? (
                     <img src={thumbUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                ) : (
                    <div className="transition-transform duration-300 group-hover:scale-110">{Icon}</div>
                )}
            </div>
            <div className="flex-shrink-0 p-3 bg-white/5">
                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{item.type}</p>
            </div>
        </button>
    );
};

export const FileBrowser: React.FC<FileBrowserProps> = ({ photos, videos, directoryHandle, syncMode, onNavigate }) => {
    const [currentPath, setCurrentPath] = useState<string[]>(['Generated_Content']);
    const [items, setItems] = useState<DisplayItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ name: string; content: string | Blob } | null>(null);

    const virtualFileTree = useMemo(() => {
        if (syncMode === 'local' || syncMode === 'api') {
            return buildFileTree(photos, videos);
        }
        return null;
    }, [syncMode, photos, videos]);

    const navigateTo = (path: string[]) => {
        setCurrentPath(path);
    };

    const handleItemClick = (item: DisplayItem) => {
        const newPath = [...currentPath, item.name];
        if (item.kind === 'directory') {
            navigateTo(newPath);
        } else {
            handleFilePreview(newPath.join('/'), item);
        }
    };

    const handleFilePreview = async (fullPath: string, item: DisplayItem) => {
        setIsLoading(true);
        try {
            let content: string | Blob | undefined;
            const fileName = fullPath.split('/').pop()!;
            if (syncMode === 'folder' && directoryHandle) {
                const relativePath = fullPath.split('/').slice(1).join('/');
                content = await fileSystemService.readFileContentByPath(directoryHandle, relativePath);
            } else if (item.id) {
                if (item.fileKind === 'photo') content = photos.find(p => p.id === item.id)?.imageBlob;
                else if (item.fileKind === 'video') content = videos.find(v => v.id === item.id)?.videoBlob;
            }
            if(content) setPreviewFile({ name: fileName, content });
            else if (item.fileKind === 'text' || item.fileKind === 'json') {
                alert("Preview for virtual description/details files is not yet supported in this mode.");
            }
        } catch (error) {
            alert(`Could not load file: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        setIsLoading(false);
    };

    const findNodeByPath = (root: FileTreeNode | null, path: string): FileTreeNode | null => {
        if (!root) return null;
        const parts = path.split('/').filter(p => p);
        let currentNode = root;
        if (parts[0] !== root.name) return null;
        for (const part of parts.slice(1)) {
            const nextNode = currentNode.children?.find(c => c.name === part);
            if (!nextNode) return null;
            currentNode = nextNode;
        }
        return currentNode;
    };

    useEffect(() => {
        const loadItems = async () => {
            setIsLoading(true);
            let displayItems: DisplayItem[] = [];
            
            if (syncMode === 'folder' && directoryHandle) {
                const relativePath = currentPath.slice(1).join('/');
                const dirItems = await fileSystemService.listDirectoryContents(directoryHandle, relativePath);
                
                // Filter out the internal metadata JSON files
                const isUuidJson = (name: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.json$/.test(name);
                
                displayItems = dirItems
                    .filter(item => !isUuidJson(item.name))
                    .map(item => ({
                        ...item,
                        type: getFileType(item.name, item.kind),
                        date: '--' // Date is not available from File System Access API listing
                    }));
            } else if (virtualFileTree) {
                const node = findNodeByPath(virtualFileTree, currentPath.join('/'));
                displayItems = node?.children?.map(child => ({
                    name: child.name,
                    kind: child.type === 'directory' ? 'directory' : 'file',
                    type: getFileType(child.name, child.type === 'directory' ? 'directory' : 'file'),
                    date: formatIsoToReadableDateTime(child.date),
                    id: child.id,
                    fileKind: child.kind
                })) || [];
            }

            displayItems.sort((a,b) => {
                if (a.kind === 'directory' && b.kind !== 'directory') return -1;
                if (a.kind !== 'directory' && b.kind === 'directory') return 1;
                return a.name.localeCompare(b.name);
            });
            
            setItems(displayItems);
            setIsLoading(false);
        };
        loadItems();
    }, [currentPath, syncMode, directoryHandle, virtualFileTree, photos, videos]);

    return (
        <div className="flex-1 flex flex-col bg-[var(--theme-bg)] backdrop-blur-2xl text-[var(--theme-text-primary)] font-inter">
            {previewFile && <FilePreviewModal content={previewFile.content} fileName={previewFile.name} onClose={() => setPreviewFile(null)} />}
            <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)]/50 flex items-center gap-4">
                 <button 
                    onClick={() => onNavigate('home')}
                    className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] font-semibold transition-colors -ml-2 p-2"
                >
                    <ChevronLeftIcon />
                    <span className="hidden sm:inline">Back to Home</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold">File Browser</h1>
                    <p className="text-sm text-[var(--theme-text-secondary)]">Navigate your generated content.</p>
                </div>
            </header>

            <div className="p-4 flex-shrink-0 border-b border-[var(--theme-border)]/50 text-sm font-semibold text-gray-400 flex items-center flex-wrap">
                {currentPath.map((part, index) => (
                    <React.Fragment key={index}>
                        <button onClick={() => navigateTo(currentPath.slice(0, index + 1))} className="hover:text-white p-1 rounded-md">
                            {part.replace(/_/g, ' ')}
                        </button>
                        {index < currentPath.length - 1 && <ChevronRightIcon className="w-5 h-5 flex-shrink-0" />}
                    </React.Fragment>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto p-4">
                 {isLoading ? (
                    <div className="h-full flex items-center justify-center"><Spinner className="w-8 h-8 text-orange-400" /></div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                        {items.map(item => (
                            <FileItemCard 
                                key={item.name} 
                                item={item} 
                                onClick={() => handleItemClick(item)} 
                                syncMode={syncMode}
                                photos={photos}
                                videos={videos}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <FolderIcon className="w-16 h-16 mb-4" />
                        <p className="font-semibold">This folder is empty</p>
                    </div>
                )}
            </main>
        </div>
    );
};