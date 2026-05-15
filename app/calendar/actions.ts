'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function clean(value: FormDataEntryValue | null, max = 2000): string | null {
  const v = String(value ?? '').trim();
  if (!v) return null;
  return v.slice(0, max);
}

// "YYYY-MM-DD" + "HH:MM" → ISO (로컬 시간대 → UTC)
function combine(dateStr: string, timeStr: string): string | null {
  if (!dateStr) return null;
  const t = timeStr || '00:00';
  const d = new Date(`${dateStr}T${t}:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function createClassEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/calendar');

  const title = clean(formData.get('title'), 200);
  const date = String(formData.get('date') ?? '').trim();
  const start_time = String(formData.get('start_time') ?? '').trim();
  const end_time = String(formData.get('end_time') ?? '').trim();
  const all_day = formData.get('all_day') === 'on';
  const location = clean(formData.get('location'), 200);
  const description = clean(formData.get('description'));
  const color = clean(formData.get('color'), 16);

  if (!title || !date) {
    return redirect('/calendar?error=' + encodeURIComponent('제목과 날짜는 필수입니다.'));
  }

  const starts_at = all_day
    ? combine(date, '00:00')
    : combine(date, start_time || '09:00');
  const ends_at = all_day
    ? null
    : (end_time ? combine(date, end_time) : null);

  if (!starts_at) {
    return redirect('/calendar?error=' + encodeURIComponent('날짜/시간 형식이 올바르지 않습니다.'));
  }

  const { error } = await supabase.from('class_events').insert({
    author_id: user.id,
    title,
    location,
    description,
    starts_at,
    ends_at,
    all_day,
    color,
  });
  if (error) {
    return redirect('/calendar?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/calendar');
  redirect('/calendar?week=' + encodeURIComponent(date));
}

export async function deleteClassEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/calendar');

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return redirect('/calendar');

  const { error } = await supabase
    .from('class_events')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    return redirect('/calendar?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/calendar');
  redirect('/calendar');
}
