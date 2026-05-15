'use client';

import { useState } from 'react';
import { createClassEvent } from '@/app/calendar/actions';

type Props = {
  defaultDate: string;     // 'YYYY-MM-DD'
};

export function EventForm({ defaultDate }: Props) {
  const [open, setOpen] = useState(false);
  const [allDay, setAllDay] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        + 일정 추가
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
    >
      <form
        action={createClassEvent}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-2xl border border-line bg-white p-5 shadow-pop"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">일정 추가</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-neutral-100 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="label" htmlFor="title">제목</label>
          <input id="title" name="title" required maxLength={200} className="input" placeholder="예: 팀 미팅" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="date">날짜</label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={defaultDate}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="color">색상</label>
            <input
              id="color"
              name="color"
              type="color"
              defaultValue="#c7d2fe"
              className="h-10 w-full cursor-pointer rounded-lg border border-line bg-white"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="all_day"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          종일
        </label>

        {!allDay ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="start_time">시작</label>
              <input id="start_time" name="start_time" type="time" defaultValue="09:00" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="end_time">종료</label>
              <input id="end_time" name="end_time" type="time" defaultValue="10:00" className="input" />
            </div>
          </div>
        ) : null}

        <div>
          <label className="label" htmlFor="location">장소 (선택)</label>
          <input id="location" name="location" maxLength={200} className="input" placeholder="예: 강의실 204" />
        </div>

        <div>
          <label className="label" htmlFor="description">메모 (선택)</label>
          <textarea id="description" name="description" rows={3} maxLength={2000} className="input resize-none" />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button type="button" onClick={() => setOpen(false)} className="btn">취소</button>
          <button type="submit" className="btn-primary">저장</button>
        </div>
      </form>
    </div>
  );
}
