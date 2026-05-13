import type { Member } from '@/lib/types';

type Props = {
  initial?: Partial<Member>;
  lockName?: boolean;
};

export function MemberFormFields({ initial, lockName }: Props) {
  const m = initial ?? {};
  return (
    <>
      <Field label="이름" name="name" defaultValue={m.name ?? ''} required readOnly={lockName} />
      <Field label="역할 / 한 줄 소개" name="role" defaultValue={m.role ?? ''} placeholder="예: Frontend Engineer" />
      <Field
        label="자기소개"
        name="bio"
        defaultValue={m.bio ?? ''}
        placeholder="간단한 소개를 적어주세요."
        textarea
      />
      <Field label="아바타 이미지 URL" name="avatar_url" defaultValue={m.avatar_url ?? ''} placeholder="https://..." />
      <Field label="이력서 URL" name="resume_url" defaultValue={m.resume_url ?? ''} placeholder="https://..." />
      <Field label="포트폴리오 URL" name="portfolio_url" defaultValue={m.portfolio_url ?? ''} placeholder="https://..." />
      <Field label="LinkedIn URL" name="linkedin_url" defaultValue={m.linkedin_url ?? ''} placeholder="https://linkedin.com/in/..." />
      <Field label="GitHub URL" name="github_url" defaultValue={m.github_url ?? ''} placeholder="https://github.com/..." />
      <Field label="개인 사이트 URL" name="website_url" defaultValue={m.website_url ?? ''} placeholder="https://..." />
      <Field
        label="태그 (쉼표로 구분)"
        name="tags"
        defaultValue={(m.tags ?? []).join(', ')}
        placeholder="React, TypeScript, Design"
      />
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  textarea,
  readOnly,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          rows={4}
          className="input resize-y"
        />
      ) : (
        <input
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          className="input"
        />
      )}
    </div>
  );
}
