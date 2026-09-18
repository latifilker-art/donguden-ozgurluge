export function InstructorBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 font-mono text-[10.5px] font-bold tracking-wide text-gold " +
        className
      }
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-3 w-3"
      >
        <path d="M12 2 14.5 8.5 21 9.2 16 13.5 17.5 20 12 16.7 6.5 20 8 13.5 3 9.2 9.5 8.5Z" />
      </svg>
      VIP
    </span>
  );
}
