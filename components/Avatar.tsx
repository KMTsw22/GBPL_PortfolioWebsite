type Props = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 64, className = '' }: Props) {
  const dim = `${size}px`;
  return (
    <div
      className={`grid place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-fuchsia-100 font-semibold text-accent ${className}`}
      style={{ width: dim, height: dim, fontSize: Math.round(size * 0.32) }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials(name || '?')}</span>
      )}
    </div>
  );
}
