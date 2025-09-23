import React, { useState, useEffect, useMemo } from 'react';
import { Photo } from '../../App';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

export const ImageCarouselWidget: React.FC<{ photos: Photo[] }> = ({ photos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const imageUrls = useMemo(() => photos.map(photo => URL.createObjectURL(photo.imageBlob)), [photos]);

    useEffect(() => {
        if (photos.length < 2) return;
        const intervalId = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % photos.length);
        }, 5000);
        return () => {
            clearInterval(intervalId);
            // Revoke URLs on cleanup
            imageUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [photos.length, imageUrls]);

    if (photos.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-800/50 text-gray-400 rounded-xl">
                <p>Upload photos to see them in the carousel.</p>
            </div>
        );
    }
    
    const goToPrevious = () => setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
    const goToNext = () => setCurrentIndex(prev => (prev + 1) % photos.length);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-xl group">
            <div className="relative w-full h-full">
                {imageUrls.map((url, index) => (
                    <img
                        key={photos[index].id}
                        src={url}
                        alt={photos[index].name}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            <button onClick={goToPrevious} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"><ChevronLeftIcon /></button>
            <button onClick={goToNext} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"><ChevronRightIcon /></button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2">
                {photos.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}></button>
                ))}
            </div>

            <div className="absolute bottom-8 left-4 right-4 text-white p-2">
                <p className="font-bold text-lg drop-shadow-md">{photos[currentIndex].name}</p>
                <p className="text-sm text-gray-200 drop-shadow-md truncate">{photos[currentIndex].notes}</p>
            </div>
        </div>
    );
};