// Ikon garis ringan, memakai currentColor agar mudah diwarnai lewat Tailwind.
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const PinIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const StarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 3.2l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.9l-5.2 2.31.99-5.79-4.21-4.1 5.82-.85L12 3.2Z" />
  </svg>
);

export const ShieldIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const ArrowIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ChatIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.4A8 8 0 1 1 21 12Z" />
  </svg>
);

export const WalletIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const MapIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="m9 4 6 2 5-2v14l-5 2-6-2-5 2V6l5-2Z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);

export const SendIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M4 12 20 4l-4 16-4-6-8-2Z" />
  </svg>
);

export const PlusIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const PhoneIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M4 5c0 8 7 15 15 15l1-4-4-2-2 2a11 11 0 0 1-6-6l2-2-2-4-4 1Z" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="m5 13 4 4 10-11" />
  </svg>
);

export const ClockIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const BellIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const PowerIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M12 4v8" />
    <path d="M7 6a8 8 0 1 0 10 0" />
  </svg>
);

export const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
