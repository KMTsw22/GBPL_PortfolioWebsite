'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CAL_DAY_START_MIN,
  CAL_DAY_END_MIN,
  getWeekStart,
  addDays,
  formatDateISO,
  formatHM,
  minutesOfDay,
  sameLocalDay,
  DAY_LABELS_KR,
} from '@/lib/schedule';
import { deleteClassEvent } from '@/app/calendar/actions';
import type { ClassEvent, WeeklyClass } from '@/lib/types';

type Props = {
  weekStartISO: string;        // 'YYYY-MM-DD'
  weeklyClasses: WeeklyClass[];   // DB: weekly_classes — 매주 고정 (UI 편집 불가)
  events: ClassEvent[];        // 이번 주에 걸려있는 사용자 추가 이벤트
  currentUserId: string | null;
};

// 하루 그리드 1픽셀 당 분 수
const PX_PER_MIN = 0.9;     // → 1시간 = 54px
const dayHeight = (CAL_DAY_END_MIN - CAL_DAY_START_MIN) * PX_PER_MIN;

type AnyEvent =
  | { kind: 'fixed'; data: WeeklyClass }
  | { kind: 'added'; data: ClassEvent };

export function CalendarView({ weekStartISO, weeklyClasses, events, currentUserId }: Props) {
  const router = useRouter();
  const weekStart = useMemo(() => getWeekStart(weekStartISO), [weekStartISO]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [selected, setSelected] = useState<AnyEvent | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const goPrev = () => {
    const d = addDays(weekStart, -7);
    router.push(`/calendar?week=${formatDateISO(d)}`);
  };
  const goNext = () => {
    const d = addDays(weekStart, 7);
    router.push(`/calendar?week=${formatDateISO(d)}`);
  };
  const goThis = () => {
    const d = getWeekStart();
    router.push(`/calendar?week=${formatDateISO(d)}`);
  };

  // 시간 축 눈금 (1시간 간격)
  const hourMarks: number[] = [];
  for (let m = CAL_DAY_START_MIN; m <= CAL_DAY_END_MIN; m += 60) hourMarks.push(m);

  const weekLabel = `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 주`;

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{weekLabel}</h2>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={goPrev} className="btn px-3 py-1.5 text-xs">← 이전 주</button>
          <button type="button" onClick={goThis} className="btn px-3 py-1.5 text-xs">이번 주</button>
          <button type="button" onClick={goNext} className="btn px-3 py-1.5 text-xs">다음 주 →</button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <div className="min-w-[760px]">
          {/* Header row: 요일 + 날짜 */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-line bg-neutral-50">
            <div />
            {days.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                    isToday ? 'text-accent' : 'text-ink-soft'
                  }`}
                >
                  <span className="font-medium">{DAY_LABELS_KR[i]}</span>
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-sm font-semibold ${
                      isToday ? 'bg-accent text-white' : 'text-ink'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Body: 시간축 + 7일 컬럼 */}
          <div className="relative grid grid-cols-[56px_repeat(7,1fr)]">
            {/* 시간 축 */}
            <div className="relative border-r border-line" style={{ height: dayHeight }}>
              {hourMarks.map((m) => (
                <div
                  key={m}
                  className="absolute right-1.5 -translate-y-1/2 text-[10px] text-ink-muted"
                  style={{ top: (m - CAL_DAY_START_MIN) * PX_PER_MIN }}
                >
                  {formatHM(m)}
                </div>
              ))}
            </div>

            {days.map((d, dayIdx) => {
              const dow = d.getDay();
              const dayFixed = weeklyClasses.filter((c) => c.day_of_week === dow);
              const dayAdded = events.filter((e) => sameLocalDay(e.starts_at, d));

              return (
                <div
                  key={dayIdx}
                  className="relative border-r border-line last:border-r-0"
                  style={{ height: dayHeight }}
                >
                  {/* 시간 가로선 */}
                  {hourMarks.map((m) => (
                    <div
                      key={m}
                      className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line/70"
                      style={{ top: (m - CAL_DAY_START_MIN) * PX_PER_MIN }}
                    />
                  ))}

                  {/* 고정 수업 블록 */}
                  {dayFixed.map((c) => {
                    const top = (c.start_minutes - CAL_DAY_START_MIN) * PX_PER_MIN;
                    const height = (c.end_minutes - c.start_minutes) * PX_PER_MIN;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelected({ kind: 'fixed', data: c })}
                        className="absolute inset-x-1 overflow-hidden rounded-md border border-amber-300/70 bg-amber-200/80 px-1.5 py-1 text-left text-[11px] font-medium text-amber-900 shadow-sm transition hover:bg-amber-200"
                        style={{ top, height: Math.max(height, 18), backgroundColor: c.color ?? undefined }}
                        title={`${c.title} · ${formatHM(c.start_minutes)}–${formatHM(c.end_minutes)} (고정)`}
                      >
                        <span className="block truncate">{c.title}</span>
                        <span className="block truncate text-[10px] opacity-80">
                          {formatHM(c.start_minutes)}–{formatHM(c.end_minutes)}
                        </span>
                      </button>
                    );
                  })}

                  {/* 추가된 이벤트 블록 */}
                  {dayAdded.map((e) => {
                    if (e.all_day) {
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setSelected({ kind: 'added', data: e })}
                          className="absolute inset-x-1 top-1 overflow-hidden rounded-md border border-indigo-300/70 bg-indigo-100 px-1.5 py-0.5 text-left text-[11px] font-medium text-indigo-900 shadow-sm hover:bg-indigo-200"
                          style={{ backgroundColor: e.color ?? undefined }}
                          title={`${e.title} (종일)`}
                        >
                          <span className="block truncate">{e.title}</span>
                        </button>
                      );
                    }
                    const sm = minutesOfDay(e.starts_at);
                    const em = e.ends_at ? minutesOfDay(e.ends_at) : sm + 60;
                    if (em <= CAL_DAY_START_MIN || sm >= CAL_DAY_END_MIN) return null;
                    const top = (Math.max(sm, CAL_DAY_START_MIN) - CAL_DAY_START_MIN) * PX_PER_MIN;
                    const height = (Math.min(em, CAL_DAY_END_MIN) - Math.max(sm, CAL_DAY_START_MIN)) * PX_PER_MIN;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setSelected({ kind: 'added', data: e })}
                        className="absolute inset-x-1 overflow-hidden rounded-md border border-indigo-300/70 bg-indigo-100 px-1.5 py-1 text-left text-[11px] font-medium text-indigo-900 shadow-sm hover:bg-indigo-200"
                        style={{ top, height: Math.max(height, 18), backgroundColor: e.color ?? undefined }}
                        title={`${e.title} · ${formatHM(sm)}–${formatHM(em)}`}
                      >
                        <span className="block truncate">{e.title}</span>
                        <span className="block truncate text-[10px] opacity-80">
                          {formatHM(sm)}–{formatHM(em)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-amber-300/70 bg-amber-200/80" />
          매주 고정 수업
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-indigo-300/70 bg-indigo-100" />
          추가된 일정
        </span>
      </div>

      {/* Selected detail modal */}
      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-pop"
          >
            {selected.kind === 'fixed' ? (
              <>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                  매주 고정
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{selected.data.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  매주 {DAY_LABELS_KR[selected.data.day_of_week]}요일 ·{' '}
                  {formatHM(selected.data.start_minutes)}–{formatHM(selected.data.end_minutes)}
                </p>
                {selected.data.location ? (
                  <p className="mt-1 text-sm text-ink-soft">장소 · {selected.data.location}</p>
                ) : null}
                <p className="mt-4 text-[11px] text-ink-muted">
                  이 일정은 고정이라 사이트에서 편집할 수 없어요.
                  (변경하려면 Supabase Dashboard → weekly_classes)
                </p>
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={() => setSelected(null)} className="btn">닫기</button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-800">
                  추가된 일정
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{selected.data.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {selected.data.all_day
                    ? `${new Date(selected.data.starts_at).toLocaleDateString('ko-KR')} · 종일`
                    : `${new Date(selected.data.starts_at).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })}${
                        selected.data.ends_at
                          ? ` – ${new Date(selected.data.ends_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
                          : ''
                      }`}
                </p>
                {selected.data.location ? (
                  <p className="mt-1 text-sm text-ink-soft">장소 · {selected.data.location}</p>
                ) : null}
                {selected.data.description ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{selected.data.description}</p>
                ) : null}
                <p className="mt-3 text-[11px] text-ink-muted">
                  올린 사람 · {selected.data.author_name ?? selected.data.author_email ?? '익명'}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  {currentUserId && currentUserId === selected.data.author_id ? (
                    <form action={deleteClassEvent}>
                      <input type="hidden" name="id" value={selected.data.id} />
                      <button
                        type="submit"
                        onClick={(e) => { if (!confirm('이 일정을 삭제할까요?')) e.preventDefault(); }}
                        className="btn text-rose-600 hover:bg-rose-50"
                      >
                        삭제
                      </button>
                    </form>
                  ) : null}
                  <button type="button" onClick={() => setSelected(null)} className="btn">닫기</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
