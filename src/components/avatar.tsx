export function Avatar({
  name,
  avatarUrl,
  size = 44,
  rounded = "rounded-full",
  className = "",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={`shrink-0 object-cover ${rounded} ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-brand font-display font-semibold text-brand-ink ${rounded} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
