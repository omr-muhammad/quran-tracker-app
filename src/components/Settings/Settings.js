'use client';

import { useState } from 'react';
import Popup from '../Popup/Popup';
import { validateRange, validateDays } from '../../utils/validation';
import { DAY_NAMES, DAY_KEYS } from '../../utils/calculations';
import './Settings.css';
import { countFormula } from '@/utils/formatter';

export default function Settings({
    isOpen,
    onClose,
    settings,
    ranges,
    theme,
    onUpdateSettings,
    onAddRange,
    onToggleTheme,
}) {
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');
    const [rangeError, setRangeError] = useState('');
    const [rangeSuccess, setRangeSuccess] = useState('');
    const [daysError, setDaysError] = useState('');

    const handleAddRange = () => {
        setRangeSuccess('');
        const result = validateRange(newStart, newEnd, ranges);
        if (!result.valid) {
            setRangeError(result.error);
            return;
        }
        onAddRange(Number(newStart), Number(newEnd));
        setNewStart('');
        setNewEnd('');
        setRangeError('');
        setRangeSuccess('تم إضافة المحفوظ بنجاح');
        setTimeout(() => setRangeSuccess(''), 2000);
    };

    const handleDaysChange = (value) => {
        const result = validateDays(value);
        if (!result.valid) {
            setDaysError(result.error);
            return;
        }
        setDaysError('');
        onUpdateSettings({ reviewDays: Number(value) });
    };

    const handleStartDayChange = (value) => {
        onUpdateSettings({ startDay: value });
    };

    const handleNotificationToggle = async () => {
        if (!settings.notificationsEnabled) {
            // Request permission
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    onUpdateSettings({ notificationsEnabled: true });
                } else {
                    alert('لم يتم منح إذن الإشعارات');
                }
            } else {
                alert('المتصفح لا يدعم الإشعارات');
            }
        } else {
            onUpdateSettings({ notificationsEnabled: false });
        }
    };

    const handleNotificationTimeChange = (value) => {
        onUpdateSettings({ notificationTime: value });
    };

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="الإعدادات" className="settings-popup">
            <div className="settings-sections">
                {/* Review Days */}
                <div className="settings-section">
                    <h3 className="settings-section-title">عدد أيام المراجعة</h3>
                    <div className="settings-row">
                        <input
                            type="number"
                            className="settings-input"
                            value={settings.reviewDays}
                            onChange={(e) => handleDaysChange(e.target.value)}
                            min={1}
                            max={30}
                        />
                        <span className="settings-label">{countFormula(settings.reviewDays, "d", false)}</span>
                    </div>
                    {daysError && <p className="settings-error">{daysError}</p>}
                </div>

                {/* Start Day */}
                <div className="settings-section">
                    <h3 className="settings-section-title">يوم بداية الدورة</h3>
                    <select
                        className="settings-select"
                        value={settings.startDay}
                        onChange={(e) => handleStartDayChange(e.target.value)}
                    >
                        {DAY_KEYS.map((key, i) => (
                            <option key={key} value={key}>{DAY_NAMES[i]}</option>
                        ))}
                    </select>
                </div>

                {/* Add Range */}
                <div className="settings-section">
                    <h3 className="settings-section-title">إضافة محفوظ</h3>
                    <div className="settings-range-form">
                        <div className="settings-range-inputs">
                            <div className="settings-field">
                                <label>من صفحة</label>
                                <input
                                    type="number"
                                    value={newStart}
                                    onChange={(e) => { setNewStart(e.target.value); setRangeError(''); }}
                                    min={1}
                                    max={604}
                                    placeholder="1"
                                />
                            </div>
                            <div className="settings-field">
                                <label>إلى صفحة</label>
                                <input
                                    type="number"
                                    value={newEnd}
                                    onChange={(e) => { setNewEnd(e.target.value); setRangeError(''); }}
                                    min={1}
                                    max={604}
                                    placeholder="604"
                                />
                            </div>
                        </div>
                        {rangeError && <p className="settings-error">{rangeError}</p>}
                        {rangeSuccess && <p className="settings-success">{rangeSuccess}</p>}
                        <button className="settings-add-btn" onClick={handleAddRange}>
                            إضافة المحفوظ
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-section">
                    <h3 className="settings-section-title">الإشعارات</h3>
                    <div className="settings-row">
                        <span className="settings-label">تفعيل الإشعارات</span>
                        <button
                            className={`settings-toggle ${settings.notificationsEnabled ? 'active' : ''}`}
                            onClick={handleNotificationToggle}
                            aria-label="تبديل الإشعارات"
                        >
                            <span className="toggle-knob" />
                        </button>
                    </div>
                    {settings.notificationsEnabled && (
                        <div className="settings-row" style={{ marginTop: '12px' }}>
                            <span className="settings-label">وقت التذكير</span>
                            <input
                                type="time"
                                className="settings-time"
                                value={settings.notificationTime}
                                onChange={(e) => handleNotificationTimeChange(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Theme */}
                <div className="settings-section">
                    <h3 className="settings-section-title">المظهر</h3>
                    <div className="settings-row">
                        <span className="settings-label">{theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>
                        <button
                            className={`settings-toggle ${theme === 'dark' ? 'active' : ''}`}
                            onClick={onToggleTheme}
                            aria-label="تبديل المظهر"
                        >
                            <span className="toggle-knob" />
                        </button>
                    </div>
                </div>
            </div>
        </Popup>
    );
}
