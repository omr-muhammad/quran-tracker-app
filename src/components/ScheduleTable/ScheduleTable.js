'use client';

import { useMemo } from 'react';
import {
    generateSchedule,
    getCurrentDayIndex,
    getCycleStartDate,
    formatPageRange,
    getTodayDayKey,
    DAY_KEYS,
} from '../../utils/calculations';
import Popup from '../Popup/Popup';
import './ScheduleTable.css';

export default function ScheduleTable({
    isOpen,
    onClose,
    ranges,
    settings,
    currentCycle,
    completionHistory,
}) {
    const schedule = useMemo(
        () => generateSchedule(ranges, settings.reviewDays, settings.startDay),
        [ranges, settings.reviewDays, settings.startDay]
    );

    const cycleStartDate = useMemo(
        () => getCycleStartDate(settings, currentCycle),
        [settings, currentCycle]
    );

    const todayDayKey = getTodayDayKey();

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="جدول المراجعة" className="schedule-popup">
            {schedule.length === 0 ? (
                <div className="schedule-empty">
                    <p>لا يوجد جدول حالياً</p>
                    <p className="schedule-empty-hint">أضف نطاقات المحفوظ من الإعدادات</p>
                </div>
            ) : (
                <div className="schedule-table-wrapper">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>اليوم</th>
                                <th>الصفحات</th>
                                <th>العدد</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((day, index) => {
                                const isActive = day.dayKey === todayDayKey;
                                return (
                                    <tr key={index} className={isActive ? 'active-day' : ''}>
                                        <td className="schedule-day-name">
                                            {day.dayName}
                                            {isActive && <span className="active-indicator">●</span>}
                                        </td>
                                        <td className="schedule-pages">
                                            {formatPageRange(day.segments)}
                                        </td>
                                        <td className="schedule-count">{day.pageCount}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Popup>
    );
}
