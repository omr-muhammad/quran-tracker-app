/**
 * 
 * @param {number} count - count of the things
 * @param {string} label - p for pages and d for days
 * @param {boolean} include - whether to include the count or not
 * @returns {string} - the count in correct Arabic format
 */
export function countFormula(count, label = "p", include = true) {
    const format = {
        p: {
            default: count > 99 ? "صفحةٍ" : "صفحةً",
            many: "صفحاتٍ",
            double: "صفحتين",
        },
        d: {
            default: count > 99 ? "يومٍ" : "يومًا",
            many: "أيامٍ",
            double: "يومين",
        }
    }
    if (include) {
        if (count === 2) return format[label].double;
        else if (count >= 3 && count <= 10) return `${count} ${format[label].many}`;
        else return `${count} ${format[label].default}`;
    }
    else {
        if (count === 2) return format[label].double;
        else if (count >= 3 && count <= 10) return format[label].many;
        else return format[label].default;
    }
}