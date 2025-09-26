import React, { useState } from 'react';
import { LockIcon } from './icons/LockIcon';

interface NoteLockScreenProps {
    noteTitle: string;
    userPin: string;
    onUnlock: () => void;
    onClose: () => void;
}

export const NoteLockScreen: React.FC<NoteLockScreenProps> = ({ noteTitle, userPin, onUnlock, onClose }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handlePinChange = (value: string) => {
        if (error) setError('');
        if (pin.length < 4) {
            const newPin = pin + value;
            setPin(newPin);
            if (newPin.length === 4) {
                validatePin(newPin);
            }
        }
    };
    
    const handleDelete = () => {
        setError('');
        setPin(prev => prev.slice(0, -1));
    };

    const validatePin = (finalPin: string) => {
        if (finalPin === userPin) {
            onUnlock();
        } else {
            setError('Incorrect PIN');
            setTimeout(() => setPin(''), 500);
        }
    };

    const pinDots = Array(4).fill(0).map((_, i) => (
        <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? 'bg-orange-400 border-orange-400' : 'border-gray-500'}`}></div>
    ));

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true">
            <div onClick={e => e.stopPropagation()} className="bg-[#1C1C1E] w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-modal-scale-in">
                <div className="w-12 h-12 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/30">
                    <LockIcon className="w-6 h-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">Unlock Note</h2>
                <p className="text-gray-400 text-sm truncate">Enter PIN for "{noteTitle}"</p>

                <div className={`flex justify-center items-center gap-4 my-6 ${error ? 'animate-shake' : ''}`}>
                    {pinDots}
                </div>
                {error && <p className="text-red-500 text-sm -mt-2 mb-4">{error}</p>}

                <div className="grid grid-cols-3 gap-4">
                    {[...Array(9)].map((_, i) => (
                        <NumberButton key={i+1} value={String(i+1)} onClick={handlePinChange} />
                    ))}
                    <div />
                    <NumberButton value="0" onClick={handlePinChange} />
                    <button onClick={handleDelete} className="text-2xl font-light text-gray-300 flex items-center justify-center h-16 rounded-full hover:bg-white/10 transition-colors">
                        ⌫
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
                .animate-shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );
};

const NumberButton: React.FC<{ value: string, onClick: (val: string) => void }> = ({ value, onClick }) => (
    <button onClick={() => onClick(value)} className="text-3xl font-light text-white flex items-center justify-center h-16 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
        {value}
    </button>
);
