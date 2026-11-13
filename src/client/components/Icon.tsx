// Simple line icons on a 16 x 16 grid.
const PATHS = {
  plus: <path d="M8 3v10M3 8h10" />,
  folder: <path d="M2 4.5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />,
  folderPlus: (
    <>
      <path d="M2 4.5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
      <path d="M8 7.5v3M6.5 9h3" />
    </>
  ),
  note: (
    <>
      <path d="M4 2h5l3 3v9H4z" />
      <path d="M9 2v3h3M6 8.5h4M6 11h4" />
    </>
  ),
  chevronRight: <path d="M6 4l4 4-4 4" />,
  chevronDown: <path d="M4 6l4 4 4-4" />,
  check: <path d="M3.5 8.5l3 3 6-6.5" />,
  code: <path d="M6 4L2.5 8 6 12M10 4l3.5 4L10 12" />,
  link: <path d="M7 9a3 3 0 0 0 4 0l2-2a3 3 0 0 0-4-4l-1 1M9 7a3 3 0 0 0-4 0L3 9a3 3 0 0 0 4 4l1-1" />,
  bulletList: (
    <>
      <circle cx="3.5" cy="4.5" r=".8" fill="currentColor" />
      <circle cx="3.5" cy="8" r=".8" fill="currentColor" />
      <circle cx="3.5" cy="11.5" r=".8" fill="currentColor" />
      <path d="M6.5 4.5h7M6.5 8h7M6.5 11.5h7" />
    </>
  ),
  numberedList: <path d="M6.5 4.5h7M6.5 8h7M6.5 11.5h7M3 3.5l1-.5v3M2.8 9.5h1.6L2.8 11.5h1.8" />,
  taskList: (
    <>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" />
      <path d="M5.5 8.2l1.8 1.8 3.2-3.6" />
    </>
  ),
  quote: <path d="M3 4v8M6.5 5h6.5M6.5 8h6.5M6.5 11h4" />,
  codeBlock: (
    <>
      <rect x="2" y="2.5" width="12" height="11" rx="2" />
      <path d="M6.5 6L5 8l1.5 2M9.5 6L11 8l-1.5 2" />
    </>
  ),
  rule: <path d="M2 8h12" />,
  table: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M2 6.5h12M2 10h12M6 3v10M10 3v10" />
    </>
  ),
  image: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <circle cx="5.5" cy="6.5" r="1" />
      <path d="M2.5 12l3.5-3.5 2.5 2.5 2-2 3 3" />
    </>
  ),
  dots: (
    <>
      <circle cx="3" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="13" cy="8" r="1" fill="currentColor" />
    </>
  ),
  pencil: <path d="M10.5 3l2.5 2.5L6 12.5 3 13l.5-3z" />,
  restore: <path d="M3 8a5 5 0 1 0 1.8-3.8M3 3v3h3" />,
  trash: <path d="M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.5 8.5h6l.5-8.5" />,
  move: (
    <>
      <path d="M2 4.5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
      <path d="M6 9h4M8.5 7.5L10 9l-1.5 1.5" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </>
  ),
  rowAbove: (
    <>
      <rect x="2.5" y="9.5" width="11" height="4" rx="1" />
      <path d="M8 2.5v5M5.5 5h5" />
    </>
  ),
  rowBelow: (
    <>
      <rect x="2.5" y="2.5" width="11" height="4" rx="1" />
      <path d="M8 9v5M5.5 11.5h5" />
    </>
  ),
  columnLeft: (
    <>
      <rect x="9.5" y="2.5" width="4" height="11" rx="1" />
      <path d="M5 5.5v5M2.5 8h5" />
    </>
  ),
  columnRight: (
    <>
      <rect x="2.5" y="2.5" width="4" height="11" rx="1" />
      <path d="M11 5.5v5M8.5 8h5" />
    </>
  ),
  alignLeft: <path d="M2.5 4h11M2.5 8h7M2.5 12h9" />,
  alignCenter: <path d="M2.5 4h11M4.5 8h7M3.5 12h9" />,
  alignRight: <path d="M2.5 4h11M6.5 8h7M4.5 12h9" />,
  globe: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" />
    </>
  ),
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  file: (
    <>
      <path d="M4 2h5l3 3v9H4z" />
      <path d="M9 2v3h3" />
    </>
  ),
  upload: <path d="M8 10V2.5M5 5l3-3 3 3M3 9v4h10V9" />,
  warning: (
    <>
      <path d="M8 2.5l6 10.5H2z" />
      <path d="M8 6.8v3M8 11.6v.01" />
    </>
  ),
  pin: (
    <>
      <path d="M10 2l4 4-1.5 1-2 2 .5 3-1 1-5.5-5.5 1-1 3 .5 2-2z" />
      <path d="M5.5 10.5L2.5 13.5" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}
