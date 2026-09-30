import React from 'react';

interface ToccoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol-only' | 'wordmark-only' | 'circular';
  theme?: 'dark' | 'light' | 'terracotta' | 'contrast';
  showSubtitle?: boolean;
}

/** Modern Home wordmark and architectural emblem. */
export function ToccoMark({
  size = 40,
  fillColor = '#FFFFFF',
  circleBg = '#5E3B26',
  hasCircle = true,
  className = '',
}: {
  size?: number;
  fillColor?: string;
  circleBg?: string;
  hasCircle?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform duration-300 ${className}`}
      aria-label="Modern Home mark"
    >
      {hasCircle && (
        <circle cx="50" cy="50" r="50" fill={circleBg} />
      )}
      <path
        d="M20 46 50 22 80 46v32H20V46Z"
        fill="none"
        stroke={fillColor}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M39 53v11h22V53M35 64h30M42 64v12M58 64v12"
        fill="none"
        stroke={fillColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ToccoLogo({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'dark',
  showSubtitle = false,
}: ToccoLogoProps) {
  const sizeMap = {
    sm: { markSize: 30, textClass: 'text-[8px] tracking-[0.18em]', subTextClass: 'text-[8px]' },
    md: { markSize: 40, textClass: 'text-[9px] tracking-[0.2em]', subTextClass: 'text-[9px]' },
    lg: { markSize: 52, textClass: 'text-[10px] tracking-[0.22em]', subTextClass: 'text-[10px]' },
    xl: { markSize: 68, textClass: 'text-xs tracking-[0.24em]', subTextClass: 'text-[11px]' },
  };

  const currentSize = sizeMap[size];

  // Colors
  const textColor =
    theme === 'light'
      ? 'text-white'
      : theme === 'terracotta'
      ? 'text-[#A36046]'
      : 'text-[#17324A]';

  const subTextColor =
    theme === 'light'
      ? 'text-[#F5F2EB]/70'
      : theme === 'terracotta'
      ? 'text-[#6D6A64]'
      : 'text-[#6D6A64]';

  const markFill = theme === 'light' ? '#FFFFFF' : '#FFFFFF';
  const circleBg =
    theme === 'light'
      ? '#17324A'
      : theme === 'terracotta'
      ? '#A36046'
      : '#17324A';

  if (variant === 'symbol-only') {
    return (
      <ToccoMark
        size={currentSize.markSize}
        circleBg={circleBg}
        fillColor={markFill}
        className={className}
      />
    );
  }

  if (variant === 'wordmark-only') {
    return (
      <div className={`flex flex-col items-start gap-0.5 leading-none ${className}`}>
        <span dir="rtl" className={`font-semibold select-none ${textColor}`}>
          مودرن هوم
        </span>
        <span dir="ltr" className={`font-[family-name:var(--font-brand)] font-semibold uppercase select-none ${currentSize.textClass} ${textColor}`}>
          MODERN HOME
        </span>
        {showSubtitle && (
          <span dir="rtl" className={`font-normal mt-1 select-none ${currentSize.subTextClass} ${subTextColor}`}>
            للأثاث والديكور العصري
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 select-none ${className}`}>
      <ToccoMark
        size={currentSize.markSize}
        circleBg={circleBg}
        fillColor={markFill}
      />
      <div className="flex flex-col items-start gap-0.5 leading-none">
        <span dir="rtl" className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm sm:text-base'} ${textColor}`}>
          مودرن هوم
        </span>
        <span dir="ltr" className={`font-[family-name:var(--font-brand)] font-semibold uppercase ${currentSize.textClass} ${textColor}`}>
          MODERN HOME
        </span>
        {showSubtitle && (
          <span dir="rtl" className={`font-normal mt-1 ${currentSize.subTextClass} ${subTextColor}`}>
            للأثاث والديكور العصري
          </span>
        )}
      </div>
    </div>
  );
}
