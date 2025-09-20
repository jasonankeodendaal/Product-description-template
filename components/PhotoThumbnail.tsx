import React, { useState, useEffect } from 'react';
import { Photo } from '../App';
import { XIcon } from './icons/XIcon';

interface PhotoThumbnailProps {
    photo: Photo;
    onSelect: (photo: Photo) => void;
    onDelete: (photo: Photo) => void;
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = React.memo(({ photo, onSelect, onDelete }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (photo.imageBlob) {
            const url = URL.createObjectURL(photo.imageBlob);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [photo.imageBlob]);

    if (!imageUrl) {
        return (
            <div className="aspect-square bg-black/20 rounded-md animate-pulse"></div>
        );
    }
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(photo);
    };

    return (
        <div className="group relative aspect-square">
            <button 
                onClick={() => onSelect(photo)} 
                className="w-full h-full bg-black/20 rounded-md overflow-hidden relative focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--theme-card-bg)] ring-[var(--theme-green)]"
            >
                <img src={imageUrl} alt={photo.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <p className="text-white text-xs truncate font-medium">{photo.name}</p>
                </div>
            </button>
            <button
                onClick={handleDelete}
                className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full text-white/80 hover:bg-red-600 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all z-10"
                aria-label={`Delete photo ${photo.name}`}
            >
                <XIcon />
            </button>
        </div>
    );
});