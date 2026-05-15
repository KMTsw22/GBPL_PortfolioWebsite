// 캘린더 시간/주차 계산 헬퍼.
// 매주 고정 수업표는 이제 DB(public.weekly_classes) 에 있음 — 시드는 schema.sql.

const hm = (h: number, m: number) => h * 60 + m;

// 캘린더 표시 범위 (시간 축)
export const CAL_DAY_START_MIN = hm(9, 0);    // 오전 9시
export const CAL_DAY_END_MIN   = hm(22, 0);   // 오후 10시

// "주의 시작일(일요일 00:00)" 을 로컬 기준으로 구한다.
// dateISO 는 'YYYY-MM-DD' 또는 ISO timestamp. 비우면 오늘.
export function getWeekStart(dateISO?: string): Date {
  const d = dateISO ? new Date(dateISO) : new Date();
  // 로컬 자정으로 정규화
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = local.getDay();  // 0=일
  local.setDate(local.getDate() - day);
  return local;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatHM(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ISO 시간 → "자정 이후 분"
export function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

// 같은 로컬 날짜인지
export function sameLocalDay(iso: string, d: Date): boolean {
  const x = new Date(iso);
  return (
    x.getFullYear() === d.getFullYear() &&
    x.getMonth() === d.getMonth() &&
    x.getDate() === d.getDate()
  );
}

export const DAY_LABELS_KR = ['일', '월', '화', '수', '목', '금', '토'];
