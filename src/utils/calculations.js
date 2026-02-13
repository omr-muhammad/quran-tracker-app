const DAY_NAMES = [
    'السبت',    // Saturday
    'الأحد',    // Sunday
    'الاثنين',  // Monday
    'الثلاثاء', // Tuesday
    'الأربعاء', // Wednesday
    'الخميس',   // Thursday
    'الجمعة',   // Friday
];

const DAY_KEYS = [
    'saturday', 'sunday', 'monday', 'tuesday',
    'wednesday', 'thursday', 'friday',
];

/**
 * Get total memorized pages across all ranges (inclusive counting).
 * Range 1-200 = 200 pages (end - start + 1)
 */
export function getTotalPages(ranges) {
    if (!ranges || ranges.length === 0) return 0;
    return ranges.reduce((sum, r) => sum + (r.end - r.start + 1), 0);
}

/**
 * Sort ranges by page number (ascending start page).
 */
export function sortRangesByPage(ranges) {
    return [...ranges].sort((a, b) => a.start - b.start);
}

/**
 * Build a flat array of all memorized pages in order.
 * Processes ranges in numerical order regardless of user input order.
 */
function buildPageSequence(ranges) {
    const sorted = sortRangesByPage(ranges);
    const pages = [];
    for (const range of sorted) {
        for (let p = range.start; p <= range.end; p++) {
            pages.push(p);
        }
    }
    return pages;
}

/**
 * Generate the review schedule for a cycle.
 * 
 * @param {Array} ranges - User's memorized ranges
 * @param {number} days - Number of review days
 * @param {string} startDay - Start day key (e.g. 'saturday')
 * @returns {Array<{ dayName: string, dayKey: string, startPage: number, endPage: number, pageCount: number, segments: Array }>}
 */
export function generateSchedule(ranges, days, startDay) {
    if (!ranges || ranges.length === 0 || days <= 0) return [];

    const pages = buildPageSequence(ranges);
    const totalPages = pages.length;

    if (totalPages === 0) return [];

    const dailyAmount = Math.ceil(totalPages / days);
    const startDayIndex = DAY_KEYS.indexOf(startDay);
    const schedule = [];

    let pageIndex = 0;

    for (let d = 0; d < days; d++) {
        const dayIndex = (startDayIndex + d) % 7;
        const dayName = DAY_NAMES[dayIndex];
        const dayKey = DAY_KEYS[dayIndex];

        // Determine how many pages for this day
        let pagesForDay;
        if (d === days - 1) {
            // Last day gets the remainder
            pagesForDay = totalPages - pageIndex;
        } else {
            pagesForDay = Math.min(dailyAmount, totalPages - pageIndex);
        }

        if (pagesForDay <= 0) break;

        // Build segments (contiguous page runs with their actual page numbers)
        const segments = [];
        let segStart = pages[pageIndex];
        let segPrev = pages[pageIndex];

        for (let i = 1; i < pagesForDay; i++) {
            const current = pages[pageIndex + i];
            if (current !== segPrev + 1) {
                // Break in continuity — new segment
                segments.push({ start: segStart, end: segPrev });
                segStart = current;
            }
            segPrev = current;
        }
        segments.push({ start: segStart, end: segPrev });

        schedule.push({
            dayName,
            dayKey,
            startPage: pages[pageIndex],
            endPage: pages[pageIndex + pagesForDay - 1],
            pageCount: pagesForDay,
            segments,
        });

        pageIndex += pagesForDay;
    }

    return schedule;
}

/**
 * Get the index of today within the current cycle.
 * Returns -1 if today is outside the cycle.
 */
export function getCurrentDayIndex(startDay, days, cycleStartDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start;
    if (cycleStartDate) {
        start = new Date(cycleStartDate);
        start.setHours(0, 0, 0, 0);
    } else {
        // Calculate from startDay preference
        start = getMostRecentDay(startDay);
    }

    const diffMs = today - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays >= days) return -1;
    return diffDays;
}

/**
 * Get the most recent occurrence of a given day of the week.
 */
function getMostRecentDay(dayKey) {
    const targetDayJS = dayKeyToJSDay(dayKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDayJS = today.getDay();

    let diff = currentDayJS - targetDayJS;
    if (diff < 0) diff += 7;

    const result = new Date(today);
    result.setDate(result.getDate() - diff);
    return result;
}

/**
 * Convert our day key to JavaScript's Date.getDay() value.
 * JS: 0=Sunday, 1=Monday, ..., 6=Saturday
 */
function dayKeyToJSDay(dayKey) {
    const map = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
    };
    return map[dayKey] ?? 6;
}

/**
 * Get today's day key (e.g. 'saturday').
 */
export function getTodayDayKey() {
    const jsDay = new Date().getDay();
    const map = [
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday',
    ];
    return map[jsDay];
}

/**
 * Get today's Arabic day name.
 */
export function getTodayDayName() {
    const key = getTodayDayKey();
    const idx = DAY_KEYS.indexOf(key);
    return DAY_NAMES[idx];
}

/**
 * Format page range for display.
 */
export function formatPageRange(segments) {
    if (!segments || segments.length === 0) return '';
    return segments.map(s =>
        s.start === s.end ? `${s.start}` : `${s.start} - ${s.end}`
    ).join(' ، ');
}

/**
 * Determine cycle start date for the current cycle.
 * For 7-day cycles, uses most recent start day.
 * For custom cycles, uses stored cycle start date.
 */
export function getCycleStartDate(settings, currentCycle) {
    if (currentCycle && currentCycle.startDate) {
        return currentCycle.startDate;
    }

    // Default: most recent occurrence of start day
    const start = getMostRecentDay(settings.startDay);
    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, '0');
    const day = String(start.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Check if the current cycle has ended.
 */
export function isCycleEnded(cycleStartDate, days) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(cycleStartDate);
    start.setHours(0, 0, 0, 0);

    const diffMs = today - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays >= days;
}

export { DAY_NAMES, DAY_KEYS };
