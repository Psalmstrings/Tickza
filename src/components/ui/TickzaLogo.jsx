import React from 'react';

/**
 * Tickza Official Brand Logo Component
 * Matches the official Tickza vector brand identity with the folding ticket icon and bold wordmark.
 */
export default function TickzaLogo({
  height = 36,
  color = '#FFFFFF',
  accentColor = '#22D3EE',
  iconOnly = false,
  className = '',
  style = {},
}) {
  // If icon-only
  if (iconOnly) {
    return (
      <svg
        width={height}
        height={height}
        viewBox="0 0 1035 1035"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      >
        <defs>
          <mask id="tickza-icon-inner-mask">
            <rect x="-100" y="-100" width="1300" height="1300" fill="white" />
            <path
              d="M 1133.9 1114.7 C 1082.1 1166.6 998.0 1166.6 946.1 1114.7 L 465.6 634.2 C 413.7 582.3 413.7 498.2 465.6 446.4 C 517.4 394.5 601.5 394.5 653.4 446.4 L 1133.9 926.9 C 1185.8 978.8 1185.8 1062.8 1133.9 1114.7 Z"
              fill="black"
            />
            <path
              d="M 96.6 814.1 C 43.2 760.8 43.2 674.3 96.6 621.0 L 767.9 -50.3 C 821.2 -103.7 907.7 -103.7 961.0 -50.3 C 1014.4 3.0 1014.4 89.5 961.0 142.8 L 289.7 814.1 C 236.4 867.5 149.9 867.5 96.6 814.1 Z"
              fill="black"
            />
          </mask>
        </defs>
        <path
          d="M 187.5 0.0 L 846.7 0.0 C 896.4 0.0 944.1 19.8 979.3 54.9 C 1014.4 90.1 1034.2 137.8 1034.2 187.5 L 1034.2 846.7 C 1034.2 896.4 1014.4 944.1 979.3 979.3 C 944.1 1014.5 896.4 1034.2 846.7 1034.2 L 187.5 1034.2 C 83.9 1034.2 -0.0 950.3 -0.0 846.7 L -0.0 187.5 C -0.0 83.9 83.9 0.0 187.5 0.0 Z"
          fill={color}
          mask="url(#tickza-icon-inner-mask)"
        />
      </svg>
    );
  }

  // Full Wordmark + Icon
  // Native aspect ratio is approx 3550 / 1100 = 3.22
  const calcWidth = typeof height === 'number' ? height * 3.22 : 'auto';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <svg
        width={height}
        height={height}
        viewBox="0 0 1035 1035"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <mask id="tickza-logo-mask">
            <rect x="-100" y="-100" width="1300" height="1300" fill="white" />
            <path
              d="M 1133.9 1114.7 C 1082.1 1166.6 998.0 1166.6 946.1 1114.7 L 465.6 634.2 C 413.7 582.3 413.7 498.2 465.6 446.4 C 517.4 394.5 601.5 394.5 653.4 446.4 L 1133.9 926.9 C 1185.8 978.8 1185.8 1062.8 1133.9 1114.7 Z"
              fill="black"
            />
            <path
              d="M 96.6 814.1 C 43.2 760.8 43.2 674.3 96.6 621.0 L 767.9 -50.3 C 821.2 -103.7 907.7 -103.7 961.0 -50.3 C 1014.4 3.0 1014.4 89.5 961.0 142.8 L 289.7 814.1 C 236.4 867.5 149.9 867.5 96.6 814.1 Z"
              fill="black"
            />
          </mask>
        </defs>
        <path
          d="M 187.5 0.0 L 846.7 0.0 C 896.4 0.0 944.1 19.8 979.3 54.9 C 1014.4 90.1 1034.2 137.8 1034.2 187.5 L 1034.2 846.7 C 1034.2 896.4 1014.4 944.1 979.3 979.3 C 944.1 1014.5 896.4 1034.2 846.7 1034.2 L 187.5 1034.2 C 83.9 1034.2 -0.0 950.3 -0.0 846.7 L -0.0 187.5 C -0.0 83.9 83.9 0.0 187.5 0.0 Z"
          fill={color}
          mask="url(#tickza-logo-mask)"
        />
      </svg>

      <span
        style={{
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: `${typeof height === 'number' ? height * 0.76 : 28}px`,
          fontWeight: 900,
          color: color,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          display: 'inline-block',
        }}
      >
        Tickza
      </span>
    </div>
  );
}
