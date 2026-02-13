'use client';

import { useState } from 'react';
import './RangeCard.css';
import { validateRange } from '../../utils/validation';
import { countFormula } from '@/utils/formatter';

export default function RangeCard({
    range,
    allRanges,
    onUpdate,
    onDelete,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editStart, setEditStart] = useState(range.start);
    const [editEnd, setEditEnd] = useState(range.end);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const pageCount = range.end - range.start + 1;

    const handleEdit = () => {
        setEditStart(range.start);
        setEditEnd(range.end);
        setError('');
        setIsEditing(true);
    };

    const handleSave = () => {
        const result = validateRange(editStart, editEnd, allRanges, range.id);
        if (!result.valid) {
            setError(result.error);
            return;
        }
        onUpdate(range.id, editStart, editEnd);
        setIsEditing(false);
        setError('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(range.id);
        setShowDeleteConfirm(false);
    };

    if (showDeleteConfirm) {
        return (
            <div className="range-card delete-confirm-card">
                <p className="delete-confirm-text">
                    هل تريد حذف المحفوظ ({range.start} - {range.end})؟
                </p>
                <div className="delete-confirm-actions">
                    <button className="btn-delete-yes" onClick={confirmDelete}>نعم</button>
                    <button className="btn-delete-no" onClick={() => setShowDeleteConfirm(false)}>إلغاء</button>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="range-card editing">
                <div className="range-edit-form">
                    <div className="range-edit-inputs">
                        <div className="range-edit-field">
                            <label>من صفحة</label>
                            <input
                                type="number"
                                value={editStart}
                                onChange={(e) => setEditStart(e.target.value)}
                                min={1}
                                max={604}
                            />
                        </div>
                        <div className="range-edit-field">
                            <label>إلى صفحة</label>
                            <input
                                type="number"
                                value={editEnd}
                                onChange={(e) => setEditEnd(e.target.value)}
                                min={1}
                                max={604}
                            />
                        </div>
                    </div>
                    {error && <p className="range-error">{error}</p>}
                    <div className="range-edit-actions">
                        <button className="btn-save" onClick={handleSave}>حفظ</button>
                        <button className="btn-cancel" onClick={handleCancel}>إلغاء</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="range-card"
            draggable
            onDragStart={(e) => onDragStart && onDragStart(e, range.id)}
            onDragOver={(e) => onDragOver && onDragOver(e)}
            onDragEnd={() => onDragEnd && onDragEnd()}
            onDrop={(e) => onDrop && onDrop(e, range.id)}
        >
            <div className="range-card-actions">
                <button className="range-action-btn" onClick={handleEdit} aria-label="تعديل">
                    ✏️
                </button>
                <button className="range-action-btn" onClick={handleDelete} aria-label="حذف">
                    🗑️
                </button>
            </div>
            <div className="range-card-body">
                <div className="range-pages">
                    <span className="range-page">{range.start}</span>
                    <span className="range-dash">—</span>
                    <span className="range-page">{range.end}</span>
                </div>
                <div className="range-page-count">{countFormula(pageCount, "p")}</div>
            </div>
            <div className="range-drag-handle" aria-label="اسحب لإعادة الترتيب">
                ⋮⋮
            </div>
        </div>
    );
}
