import React, { useState, useEffect } from 'react';
import { Photo } from '../App';

interface PhotoThumbnailProps {
    photo: Photo;
    onSelect: (photo: Photo) => void;
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = React.memo(({ photo, onSelect }) => {
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
    
    return (
        <button 
            onClick={() => onSelect(photo)} 
            className="aspect-square bg-black/20 rounded-md overflow-hidden group relative focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--theme-card-bg)] ring-[var(--theme-blue)]"
        >
            <img src={imageUrl} alt={photo.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <p className="text-white text-xs truncate font-medium">{photo.name}</p>
            </div>
        </button>
    );
});
