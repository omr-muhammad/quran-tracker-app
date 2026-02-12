const STORAGE_KEY = 'taahud_data';

const DEFAULT_DATA = {
    ranges: [],
    settings: {
        reviewDays: 7,
        startDay: 'saturday',
        notificationsEnabled: false,
        notificationTime: '08:00',
    },
    theme: 'dark',
    completionHistory: {},
    currentCycle: {
        startDate: null,
        cycleNumber: 1,
    },
};

export function loadData() {
    if (typeof window === 'undefined') return { ...DEFAULT_DATA };

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_DATA };

        const parsed = JSON.parse(raw);
        // Validate structure
        return {
            ranges: Array.isArray(parsed.ranges) ? parsed.ranges : [],
            settings: {
                ...DEFAULT_DATA.settings,
                ...(parsed.settings || {}),
            },
            theme: parsed.theme === 'light' ? 'light' : 'dark',
            completionHistory: parsed.completionHistory || {},
            currentCycle: {
                ...DEFAULT_DATA.currentCycle,
                ...(parsed.currentCycle || {}),
            },
        };
    } catch (e) {
        console.error('Corrupted localStorage data, resetting:', e);
        return { ...DEFAULT_DATA };
    }
}

export function saveData(data) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.error('localStorage quota exceeded');
            alert('مساحة التخزين ممتلئة. يرجى حذف بعض البيانات.');
        }
    }
}

export function getToday() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getYesterday() {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return now.toISOString().split('T')[0];
}

export { DEFAULT_DATA };
