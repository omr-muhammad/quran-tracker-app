'use client';

import { useEffect, useCallback } from 'react';
import './Popup.css';

export default function Popup({ isOpen, onClose, title, children, className = '' }) {
    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div
                className={`popup-content ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="popup-header">
                    <h2 className="popup-title">{title}</h2>
                    <button className="popup-close" onClick={onClose} aria-label="إغلاق">
                        ✕
                    </button>
                </div>
                <div className="popup-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
