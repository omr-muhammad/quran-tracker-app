'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData } from '../utils/storage';

export function useLocalStorage() {
    const [data, setData] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data on mount
    useEffect(() => {
        const loaded = loadData();
        setData(loaded);
        setIsLoaded(true);

        // Apply theme
        document.documentElement.setAttribute('data-theme', loaded.theme);
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (data && isLoaded) {
            saveData(data);
        }
    }, [data, isLoaded]);

    const updateData = useCallback((updater) => {
        setData(prev => {
            const newData = typeof updater === 'function' ? updater(prev) : updater;
            return { ...newData };
        });
    }, []);

    // === Range Operations ===

    const addRange = useCallback((start, end) => {
        setData(prev => {
            const newRange = {
                id: Date.now().toString(),
                start: Number(start),
                end: Number(end),
                order: prev.ranges.length,
            };
            return { ...prev, ranges: [...prev.ranges, newRange] };
        });
    }, []);

    const updateRange = useCallback((id, start, end) => {
        setData(prev => ({
            ...prev,
            ranges: prev.ranges.map(r =>
                r.id === id ? { ...r, start: Number(start), end: Number(end) } : r
            ),
        }));
    }, []);

    const deleteRange = useCallback((id) => {
        setData(prev => ({
            ...prev,
            ranges: prev.ranges.filter(r => r.id !== id),
        }));
    }, []);

    const reorderRanges = useCallback((newRanges) => {
        setData(prev => ({
            ...prev,
            ranges: newRanges.map((r, i) => ({ ...r, order: i })),
        }));
    }, []);

    // === Settings Operations ===

    const updateSettings = useCallback((updates) => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, ...updates },
        }));
    }, []);

    // === Theme Operations ===

    const toggleTheme = useCallback(() => {
        setData(prev => {
            const newTheme = prev.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            return { ...prev, theme: newTheme };
        });
    }, []);

    // === Completion Operations ===

    const markDayComplete = useCallback((date) => {
        setData(prev => ({
            ...prev,
            completionHistory: {
                ...prev.completionHistory,
                [date]: { completed: true, carriedOver: false },
            },
        }));
    }, []);

    const markDayCarriedOver = useCallback((date) => {
        setData(prev => ({
            ...prev,
            completionHistory: {
                ...prev.completionHistory,
                [date]: {
                    ...prev.completionHistory[date],
                    carriedOver: true,
                },
            },
        }));
    }, []);

    const ignoreMissedDay = useCallback((date) => {
        setData(prev => ({
            ...prev,
            completionHistory: {
                ...prev.completionHistory,
                [date]: { completed: false, carriedOver: false },
            },
        }));
    }, []);

    // === Cycle Operations ===

    const updateCycle = useCallback((updates) => {
        setData(prev => ({
            ...prev,
            currentCycle: { ...prev.currentCycle, ...updates },
        }));
    }, []);

    return {
        data,
        isLoaded,
        updateData,
        addRange,
        updateRange,
        deleteRange,
        reorderRanges,
        updateSettings,
        toggleTheme,
        markDayComplete,
        markDayCarriedOver,
        ignoreMissedDay,
        updateCycle,
    };
}
