import React from 'react';
import Image from 'next/image';

interface ToccoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol-only' | 'wordmark-only' | 'circular';
  theme?: 'dark' | 'light' | 'terracotta' | 'contrast';
  showSubtitle?: boolean;
}

/** Circular Modern Home logo image. */
export function ToccoMark({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/modernhome_logo.jpeg"
      width={size}
      height={size}
      alt="شعار مودرن هوم"
      className={`inline-block rounded-full object-cover ${className}`}
    />
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
      ? 'text-[#F7F3EC]/70'
      : theme === 'terracotta'
      ? 'text-[#6D6A64]'
      : 'text-[#6D6A64]';

  if (variant === 'symbol-only') {
    return (
      <ToccoMark
        size={currentSize.markSize}
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
