// Device icons for the view switcher. Tablet is drawn landscape and phone portrait so
// the two read differently at toolbar size (the stock lucide tablet and phone icons
// are both tall rounded rectangles).

type IconProps = { className?: string };

export function TabletViewIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="12" y1="16.5" x2="12" y2="16.5" />
    </svg>
  );
}

export function PhoneViewIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="6.5" y="2" width="11" height="20" rx="2.5" />
      <line x1="11" y1="18.5" x2="13" y2="18.5" />
    </svg>
  );
}
