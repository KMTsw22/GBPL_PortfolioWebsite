'use client';

import { Avatar } from './Avatar';
import { FileUploader } from './FileUploader';

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  name: string;
};

export function AvatarUploader({ value, onChange, userId, name }: Props) {
  return (
    <div className="flex items-center gap-5">
      <Avatar name={name || '?'} src={value} size={88} />
      <div className="flex-1">
        <FileUploader
          bucket="avatars"
          userId={userId}
          accept="image/png,image/jpeg,image/webp,image/gif"
          maxMB={100}
          onUploaded={(u) => onChange(u.url)}
        >
          <div className="flex flex-col items-center gap-1 text-sm text-ink-soft">
            <p>사진을 여기에 끌어다 놓거나 <span className="font-medium text-ink underline">클릭해서 선택</span></p>
            <p className="text-xs text-ink-muted">PNG / JPG / WEBP · 최대 100MB</p>
          </div>
        </FileUploader>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-2 text-xs text-ink-muted underline hover:text-rose-600"
          >
            사진 제거
          </button>
        ) : null}
      </div>
    </div>
  );
}
