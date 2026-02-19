"use client";

import { useMemo } from "react";
import {
  generateSchedule,
  getCurrentDayIndex,
  getCycleStartDate,
  formatPageRange,
  getTotalPages,
} from "../../utils/calculations";
import { getToday as getTodayDate, getYesterday } from "../../utils/storage";
import "./Banner.css";
import { countFormula, displayTextByWordNumber } from "@/utils/formatter";
import dic from "@/data/dic";

export default function Banner({
  ranges,
  settings,
  currentCycle,
  completionHistory,
  onMarkComplete,
  onShowMissedPopup,
}) {
  const schedule = useMemo(
    () => generateSchedule(ranges, settings.reviewDays, settings.startDay),
    [ranges, settings.reviewDays, settings.startDay],
  );

  const cycleStartDate = useMemo(
    () => getCycleStartDate(settings, currentCycle),
    [settings, currentCycle],
  );

  const todayIndex = useMemo(
    () =>
      getCurrentDayIndex(
        settings.startDay,
        settings.reviewDays,
        cycleStartDate,
      ),
    [settings.startDay, settings.reviewDays, cycleStartDate],
  );

  const todayDate = getTodayDate();
  const todayCompletion = completionHistory[todayDate];
  const isCompleted = todayCompletion?.completed;

  // Check for carryover
  const carriedOverDays = useMemo(() => {
    const carried = [];
    if (!schedule.length) return carried;

    // Check previous days in this cycle for incomplete ones marked as carry-forward
    const yesterday = getYesterday();
    if (
      completionHistory[yesterday]?.carriedOver &&
      !completionHistory[yesterday]?.completed
    ) {
      // Find yesterday's assignment
      const yesterdayIdx = todayIndex - 1;
      if (yesterdayIdx >= 0 && schedule[yesterdayIdx]) {
        carried.push(schedule[yesterdayIdx]);
      }
    }
    return carried;
  }, [schedule, completionHistory, todayIndex]);

  const totalPages = getTotalPages(ranges);
  const todaySchedule =
    todayIndex >= 0 && todayIndex < schedule.length
      ? schedule[todayIndex]
      : null;

  if (!ranges.length || !schedule.length || !todaySchedule) {
    return (
      <div className="banner">
        <div className="banner-verse">
          تَعاهَدُوا القُرْآنَ، فَوالذي نَفْسِي بيَدِهِ لَهو أشَدُّ تَفَصِّيًا
          مِنَ الإبِلِ في عُقُلِها.
        </div>
        <div className="banner-empty">
          <p>لم يتم إضافة محفوظ بعد</p>
          <p className="banner-empty-hint">
            افتح الإعدادات لإضافة نطاقات المحفوظ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`banner ${isCompleted ? "banner-completed" : ""}`}>
      <div className="banner-verse">
        تَعاهَدُوا القُرْآنَ، فَوالذي نَفْسِي بيَدِهِ لَهو أشَدُّ تَفَصِّيًا
        مِنَ الإبِلِ في عُقُلِها.
      </div>

      <div className="banner-content">
        <div className="banner-label">
          ورد {todaySchedule.dayName} -{" "}
          {countFormula(todaySchedule.pageCount, "p")}
        </div>
        {/* <div className="banner-day"></div> */}

        <div className="banner-range">
          {todaySchedule.segments.map((seg, i) => (
            <div key={i} className="banner-segment">
              <div className="banner-page-group">
                <span className="banner-page-label">من صفحة {seg.start}</span>
                {/* <span className="banner-page-number"></span> */}
                <span className="banner-ayah-placeholder">
                  {displayTextByWordNumber(dic[seg.start].start)}...
                </span>
              </div>
              <span className="banner-separator">|</span>
              <div className="banner-page-group">
                <span className="banner-page-label">إلى صفحة {seg.end}</span>
                {/* <span className="banner-page-number">{seg.end}</span> */}
                <span className="banner-ayah-placeholder">
                  {displayTextByWordNumber(dic[seg.end].end)}...
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="banner-page-count">
                    {todaySchedule.pageCount} صفحة
                </div> */}
      </div>

      {/* Carryover section */}
      {carriedOverDays.length > 0 && (
        <div className="banner-carryover">
          {/* <div className="carryover-icon">😔</div> */}
          <div className="carryover-label">ورد مُرحَّل 😔</div>
          {carriedOverDays.map((day, i) => (
            <div key={i} className="carryover-range">
              {formatPageRange(day.segments)} (
              {countFormula(day.pageCount, "p")})
            </div>
          ))}
        </div>
      )}

      {/* Completion button */}
      <button
        className={`banner-complete-btn ${isCompleted ? "completed" : ""}`}
        onClick={() => onMarkComplete(todayDate)}
        disabled={isCompleted}
        aria-label={isCompleted ? "تم الإنهاء" : "تم"}
      >
        {isCompleted ? "✓ تم الحمد لله" : "✓ تم"}
      </button>
    </div>
  );
}
