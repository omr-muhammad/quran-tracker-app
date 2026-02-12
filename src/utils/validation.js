const MAX_PAGE = 604;
const MIN_PAGE = 1;

/**
 * Validate a memorized range.
 * @param {number} start - Start page number
 * @param {number} end - End page number
 * @param {Array} existingRanges - Current ranges (to check overlaps)
 * @param {string|null} editingId - ID of range being edited (excluded from overlap check)
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateRange(start, end, existingRanges = [], editingId = null) {
    start = Number(start);
    end = Number(end);

    if (isNaN(start) || isNaN(end)) {
        return { valid: false, error: 'يرجى إدخال أرقام صحيحة' };
    }

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return { valid: false, error: 'يرجى إدخال أرقام صحيحة (بدون كسور)' };
    }

    if (start < MIN_PAGE || start > MAX_PAGE) {
        return { valid: false, error: `رقم صفحة البداية يجب أن يكون بين ${MIN_PAGE} و ${MAX_PAGE}` };
    }

    if (end < MIN_PAGE || end > MAX_PAGE) {
        return { valid: false, error: `رقم صفحة النهاية يجب أن يكون بين ${MIN_PAGE} و ${MAX_PAGE}` };
    }

    if (start > end) {
        return { valid: false, error: 'صفحة البداية يجب أن تكون أقل من أو تساوي صفحة النهاية' };
    }

    // Check overlaps with existing ranges
    for (const range of existingRanges) {
        if (editingId && range.id === editingId) continue;

        // Two ranges overlap if: start1 <= end2 AND start2 <= end1
        if (start <= range.end && range.start <= end) {
            return {
                valid: false,
                error: `هذا النطاق يتقاطع مع النطاق الموجود (${range.start} - ${range.end})`,
            };
        }
    }

    return { valid: true, error: null };
}

/**
 * Validate review days count.
 * @param {number} days 
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateDays(days) {
    days = Number(days);

    if (isNaN(days) || !Number.isInteger(days)) {
        return { valid: false, error: 'يرجى إدخال عدد صحيح' };
    }

    if (days < 1) {
        return { valid: false, error: 'عدد الأيام يجب أن يكون 1 على الأقل' };
    }

    if (days > 30) {
        return { valid: false, error: 'عدد الأيام يجب أن لا يتجاوز 30' };
    }

    return { valid: true, error: null };
}
