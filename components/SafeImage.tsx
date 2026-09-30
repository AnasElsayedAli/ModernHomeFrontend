'use client';

import React, { useState, useCallback } from 'react';
import Image, { ImageProps } from 'next/image';
import { Sofa } from 'lucide-react';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined | null;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt = 'قطعة أثاث من مودرن هوم',
  fallbackSrc,
  referrerPolicy = 'no-referrer',
  onError,
  onContextMenu,
  onDragStart,
  className,
  ...rest
}: SafeImageProps) {
  const [prevSrc, setPrevSrc] = useState<string | undefined | null>(src);
  const [fallbackOverride, setFallbackOverride] = useState<string | null>(null);

  // Synchronize state during render when prop changes (React recommended pattern)
  if (src !== prevSrc) {
    setPrevSrc(src);
    setFallbackOverride(null);
  }

  const effectiveSrc = fallbackOverride || src || fallbackSrc;
  const resolvedFallbackSrc = fallbackSrc || '/images/hero_villa_clean.jpg';

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (effectiveSrc && effectiveSrc !== resolvedFallbackSrc) {
        setFallbackOverride(resolvedFallbackSrc);
      }

      if (onError) {
        onError(e);
      }
    },
    [effectiveSrc, onError, resolvedFallbackSrc]
  );

  if (!effectiveSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 grid place-items-center overflow-hidden bg-[#EDE4D7] text-[#17324A]"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="grid h-16 w-16 place-items-center border border-[#C8A77D] bg-[#F7F3EC]">
            <Sofa className="h-8 w-8" aria-hidden="true" />
          </span>
          <span dir="rtl" className="text-[10px] font-semibold">مودرن هوم</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      referrerPolicy={referrerPolicy}
      onError={handleError}
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu?.(event);
      }}
      onDragStart={(event) => {
        event.preventDefault();
        onDragStart?.(event);
      }}
      draggable={false}
      className={`${className || ''} select-none`}
      {...rest}
    />
  );
}

export { SafeImage };
