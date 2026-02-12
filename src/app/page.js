'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Banner from '../components/Banner/Banner';
import RangeCard from '../components/RangeCard/RangeCard';
import ScheduleTable from '../components/ScheduleTable/ScheduleTable';
import Settings from '../components/Settings/Settings';
import Popup from '../components/Popup/Popup';
import { getYesterday, getToday } from '../utils/storage';
import { getTotalPages } from '../utils/calculations';
import './page.css';

export default function Home() {
  const {
    data,
    isLoaded,
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
  } = useLocalStorage();

  const [showSchedule, setShowSchedule] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMissedPopup, setShowMissedPopup] = useState(false);
  const [draggedId, setDraggedId] = useState(null);

  // Check for missed yesterday on mount
  useEffect(() => {
    if (!isLoaded || !data) return;

    const yesterday = getYesterday();
    const yesterdayRecord = data.completionHistory[yesterday];
    const todayRecord = data.completionHistory[getToday()];

    // Show missed popup if yesterday wasn't completed and we haven't already handled it
    if (
      data.ranges.length > 0 &&
      yesterdayRecord === undefined &&
      todayRecord === undefined
    ) {
      // Check if yesterday was a review day (simplified — just check if there are ranges)
      setShowMissedPopup(true);
    }
  }, [isLoaded, data]);

  const handleMarkComplete = useCallback((date) => {
    markDayComplete(date);
  }, [markDayComplete]);

  const handleCarryForward = useCallback(() => {
    const yesterday = getYesterday();
    markDayCarriedOver(yesterday);
    setShowMissedPopup(false);
  }, [markDayCarriedOver]);

  const handleIgnoreMissed = useCallback(() => {
    const yesterday = getYesterday();
    ignoreMissedDay(yesterday);
    setShowMissedPopup(false);
  }, [ignoreMissedDay]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !data) return;

    const ranges = [...data.ranges];
    const dragIdx = ranges.findIndex(r => r.id === draggedId);
    const dropIdx = ranges.findIndex(r => r.id === targetId);

    if (dragIdx === -1 || dropIdx === -1) return;

    const [dragged] = ranges.splice(dragIdx, 1);
    ranges.splice(dropIdx, 0, dragged);
    reorderRanges(ranges);
    setDraggedId(null);
  }, [draggedId, data, reorderRanges]);

  // Service worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed:', err);
      });
    }
  }, []);

  if (!isLoaded || !data) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>جارٍ التحميل...</p>
      </div>
    );
  }

  const totalPages = getTotalPages(data.ranges);

  return (
    <div className="app">
      {/* Banner - fixed top */}
      <Banner
        ranges={data.ranges}
        settings={data.settings}
        currentCycle={data.currentCycle}
        completionHistory={data.completionHistory}
        onMarkComplete={handleMarkComplete}
        onShowMissedPopup={() => setShowMissedPopup(true)}
      />

      {/* Range cards - scrollable middle */}
      <main className="app-content">
        {data.ranges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <p className="empty-title">ابدأ بإضافة المحفوظ</p>
            <p className="empty-hint">اضغط على أيقونة الإعدادات لإضافة نطاقات الصفحات المحفوظة</p>
            <button className="empty-cta" onClick={() => setShowSettings(true)}>
              إضافة محفوظ
            </button>
          </div>
        ) : (
          <div className="ranges-container">
            <div className="ranges-header">
              <h2 className="ranges-title">المحفوظ</h2>
              <span className="ranges-total">{totalPages} صفحة</span>
            </div>
            <div className="ranges-list">
              {data.ranges.map((range) => (
                <RangeCard
                  key={range.id}
                  range={range}
                  allRanges={data.ranges}
                  onUpdate={updateRange}
                  onDelete={deleteRange}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom icons - fixed */}
      <div className="app-bottom-bar">
        <button
          className="bottom-icon-btn"
          onClick={() => setShowSettings(true)}
          aria-label="الإعدادات"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button
          className="bottom-icon-btn"
          onClick={() => setShowSchedule(true)}
          aria-label="جدول المراجعة"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {/* Schedule Table Popup */}
      <ScheduleTable
        isOpen={showSchedule}
        onClose={() => setShowSchedule(false)}
        ranges={data.ranges}
        settings={data.settings}
        currentCycle={data.currentCycle}
        completionHistory={data.completionHistory}
      />

      {/* Settings Popup */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={data.settings}
        ranges={data.ranges}
        theme={data.theme}
        onUpdateSettings={updateSettings}
        onAddRange={addRange}
        onToggleTheme={toggleTheme}
      />

      {/* Missed Day Popup */}
      <Popup
        isOpen={showMissedPopup}
        onClose={() => setShowMissedPopup(false)}
        title="ورد الأمس"
        className="confirm-dialog"
      >
        <div className="confirm-message">
          لم يتم ورد الأمس. هل تتجاهله أم ترحله لليوم؟
        </div>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={handleIgnoreMissed}>
            تجاهل
          </button>
          <button className="btn-confirm" onClick={handleCarryForward}>
            ترحيل 😔
          </button>
        </div>
      </Popup>
    </div>
  );
}
