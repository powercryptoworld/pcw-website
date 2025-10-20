'use client';
import React from 'react';

export default function EvmLogo({
  chainId,
  address,
  size = 18,
  className = '',
}: {
  chainId: number;
  address: string;
  size?: number;
  className?: string;
}) {
  const addr = (address || '').toLowerCase();
  const local = `/token-logos/${chainId}/${addr}.svg`;
  const api = `/api/evm-logo/${chainId}/${addr}`;

  const [src, setSrc] = React.useState(local);
  const onError = React.useCallback(() => {
    if (src !== api) setSrc(api);
  }, [src]);

  return (
    <img
      src={src}
      onError={onError}
      alt="token logo"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: 4,
        objectFit: 'cover',
        flex: '0 0 auto',
      }}
    />
  );
}
