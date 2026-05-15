import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { CalendarView } from '@/components/CalendarView';
import { EventForm } from '@/components/EventForm';
import { nameFromEmail } from '@/lib/roster';
import {
  addDays,
  formatDateISO,
  getWeekStart,
} from '@/lib/schedule';
import type { ClassEvent, Member, WeeklyClass } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ week?: string; error?: string }>;
};

export default async function CalendarPage({ searchParams }: Props) {
  const { week, error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const weekStart = getWeekStart(week);
  const weekEnd = addDays(weekStart, 7);

  // 매주 고정 수업표 + 이번 주 추가 이벤트 + 멤버 정보 (병렬)
  const [weeklyRes, eventsRes, membersRes] = await Promise.all([
    supabase
      .from('weekly_classes')
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('start_minutes', { ascending: true }),
    supabase
      .from('class_events')
      .select('*')
      .gte('starts_at', weekStart.toISOString())
      .lt('starts_at', weekEnd.toISOString())
      .order('starts_at', { ascending: true }),
    supabase
      .from('members')
      .select('id, email, name'),
  ]);

  const weeklyClasses = (weeklyRes.data ?? []) as WeeklyClass[];
  const rawEvents = (eventsRes.data ?? []) as ClassEvent[];
  const members = (membersRes.data ?? []) as Pick<Member, 'id' | 'email' | 'name'>[];
  const memberById = new Map(members.map((m) => [m.id, m]));

  const events: ClassEvent[] = rawEvents.map((e) => {
    const m = memberById.get(e.author_id);
    return {
      ...e,
      author_email: m?.email,
      author_name: m?.name ?? nameFromEmail(m?.email),
    };
  });

  const weekStartISO = formatDateISO(weekStart);

  return (
    <>
      <Header name={nameFromEmail(user?.email)} />

      <main className="container-page py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
            <p className="mt-1 text-sm text-ink-muted">
              주간 일정 확인하기
            </p>
          </div>
          {user ? (
            <div className="shrink-0">
              <EventForm defaultDate={weekStartISO} />
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {!user ? (
          <p className="mb-6 rounded-xl border border-line bg-neutral-50 p-4 text-center text-xs text-ink-muted">
            로그인하고 일정 추가하기
          </p>
        ) : null}

        <CalendarView
          weekStartISO={weekStartISO}
          weeklyClasses={weeklyClasses}
          events={events}
          currentUserId={user?.id ?? null}
        />
      </main>
    </>
  );
}
