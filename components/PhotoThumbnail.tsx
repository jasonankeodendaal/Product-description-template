import React, { useState, useEffect } from 'react';
import { Photo } from '../App';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';

interface PhotoThumbnailProps {
    photo: Photo;
    onSelect: (photo: Photo) => void;
    onDelete: (photo: Photo) => void;
    isSelected: boolean;
    isSelectionActive: boolean;
    onToggleSelection: (id: string) => void;
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = React.memo(({ photo, onSelect, onDelete, isSelected, isSelectionActive, onToggleSelection }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (photo.imageBlob) {
            const url = URL.createObjectURL(photo.imageBlob);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [photo.imageBlob]);

    if (!imageUrl) {
        return <div className="aspect-square bg-black/20 rounded-md animate-pulse"></div>;
    }
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(photo);
    };

    const handleClick = () => {
        if (isSelectionActive) {
            onToggleSelection(photo.id);
        } else {
            onSelect(photo);
        }
    };

    return (
        <div className="group relative aspect-square">
            <button 
                onClick={handleClick} 
                className="w-full h-full bg-black/20 rounded-md overflow-hidden relative focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--theme-card-bg)] ring-[var(--theme-green)]"
            >
                <img src={imageUrl} alt={photo.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <p className="text-white text-xs truncate font-medium">{photo.name}</p>
                </div>
                 {isSelectionActive && (
                    <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 transition-all duration-200 ${isSelected ? 'bg-green-500 border-green-400' : 'bg-black/40 border-white/50'}`}>
                        {isSelected && <CheckIcon className="w-full h-full p-0.5 text-black" />}
                    </div>
                 )}
            </button>
            {!isSelectionActive && (
                <button
                    onClick={handleDelete}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full text-white/80 hover:bg-red-600 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all z-10"
                    aria-label={`Delete photo ${photo.name}`}
                >
                    <XIcon />
                </button>
            )}
        </div>
    );
});