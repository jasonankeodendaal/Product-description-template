import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Photo, Video, View } from '../App';
import { SiteSettings } from '../constants';
import { fileSystemService } from '../services/fileSystemService';
import { buildFileTree, FileTreeNode } from '../utils/fileTree';
// FIX: ChevronLeftIcon is in its own file.
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { FolderIcon } from './icons/FolderIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { VideoIcon } from './icons/VideoIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { Spinner } from './icons/Spinner';
import { XIcon } from './icons/XIcon';
import { dataURLtoBlob } from '../utils/dataUtils';
import { generateVideoThumbnail } from '../utils/videoUtils';

interface FileBrowserProps {
    photos: Photo[];
    videos: Video[];
    directoryHandle: FileSystemDirectoryHandle | null;
    syncMode?: SiteSettings['syncMode'];
    onNavigate: (view: View) => void;
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
            return <pre className="whitespace-pre-wrap text-sm">{isJson ? JSON.stringify(JSON.parse(content), null, 2) : content}</pre>;
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

const FileItem: React.FC<{ name: string; kind: string; onClick: () => void }> = ({ name, kind, onClick }) => {
    const getIcon = () => {
        if (kind === 'directory') return <FolderIcon className="w-8 h-8 text-amber-400" />;
        if (name.match(/\.(jpg|jpeg|png|webp)$/i)) return <PhotoIcon className="w-8 h-8 text-purple-400" />;
        if (name.match(/\.(mp4|webm|mov)$/i)) return <VideoIcon className="w-8 h-8 text-pink-400" />;
        if (name.endsWith('.txt') || name.endsWith('.json')) return <FileTextIcon className="w-8 h-8 text-sky-400" />;
        return <FileTextIcon className="w-8 h-8 text-gray-400" />;
    };
    return (
        <button onClick={onClick} className="w-full text-left p-3 rounded-lg flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
            {getIcon()}
            <p className="text-xs font-semibold text-center text-gray-300 break-all line-clamp-2">{name}</p>
        </button>
    );
};

export const FileBrowser: React.FC<FileBrowserProps> = ({ photos, videos, directoryHandle, syncMode, onNavigate }) => {
    const [currentPath, setCurrentPath] = useState<string[]>(['Generated_Content']);
    const [items, setItems] = useState<{ name: string; kind: 'file' | 'directory' }[]>([]);
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

    const handleItemClick = (item: { name: string; kind: 'file' | 'directory' }) => {
        const newPath = [...currentPath, item.name];
        if (item.kind === 'directory') {
            navigateTo(newPath);
        } else {
            handleFilePreview(newPath.join('/'));
        }
    };

    const handleFilePreview = async (fullPath: string) => {
        setIsLoading(true);
        try {
            let content;
            if (syncMode === 'folder' && directoryHandle) {
                // For folder mode, we need to read from the root.
                const relativePath = fullPath.split('/').slice(1).join('/'); // Remove 'Generated_Content' from path
                content = await fileSystemService.readFileContentByPath(directoryHandle, relativePath);
            } else {
                // For local mode, find the item and get its blob
                const pathParts = fullPath.split('/');
                const fileName = pathParts.pop();
                const parentPath = pathParts.join('/');
                const parentNode = findNodeByPath(virtualFileTree, parentPath);
                const fileNode = parentNode?.children?.find(c => c.name === fileName);

                if (fileNode?.kind === 'photo') {
                    content = photos.find(p => p.id === fileNode.id)?.imageBlob;
                } else if (fileNode?.kind === 'video') {
                    content = videos.find(v => v.id === fileNode.id)?.videoBlob;
                } else {
                    // For virtual .txt and .json files, we cannot fetch content
                    alert("Preview for virtual description/details files is not available in browser storage mode.");
                    setIsLoading(false);
                    return;
                }
            }
            if (content) {
                setPreviewFile({ name: fullPath.split('/').pop()!, content });
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
        for (const part of parts) {
            if (part === root.name && parts.length === 1 && currentNode.name === part) return currentNode;
            const nextNode = currentNode.children?.find(c => c.name === part);
            if (!nextNode) return null;
            currentNode = nextNode;
        }
        return currentNode;
    };


    useEffect(() => {
        const loadItems = async () => {
            setIsLoading(true);
            if (syncMode === 'folder' && directoryHandle) {
                const relativePath = currentPath.slice(1).join('/'); // Remove 'Generated_Content'
                const dirItems = await fileSystemService.listDirectoryContents(directoryHandle, relativePath);
                setItems(dirItems);
            } else if (virtualFileTree) {
                const node = findNodeByPath(virtualFileTree, currentPath.join('/'));
                const dirItems = node?.children?.map(child => ({
                    name: child.name,
                    kind: child.type as 'file' | 'directory',
                })) || [];
                setItems(dirItems);
            }
            setIsLoading(false);
        };
        loadItems();
    }, [currentPath, syncMode, directoryHandle, virtualFileTree]);

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
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-4">
                        {items.map(item => <FileItem key={item.name} name={item.name} kind={item.kind} onClick={() => handleItemClick(item)} />)}
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
