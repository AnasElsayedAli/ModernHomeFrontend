'use client';

import React, { useState, useCallback } from 'react';
import Image, { ImageProps } from 'next/image';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined | null;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt = 'Tocco House design object',
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

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (fallbackSrc && effectiveSrc !== fallbackSrc) {
        setFallbackOverride(fallbackSrc);
      }

      if (onError) {
        onError(e);
      }
    },
    [effectiveSrc, fallbackSrc, onError]
  );

  if (!effectiveSrc) return null;

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
