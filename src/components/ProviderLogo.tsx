import React from 'react';
import { getProviderInitials, getProviderLogoUrl } from '../lib/providerLogos';

type ProviderLogoProps = {
  name: string | null | undefined;
  sizeClassName?: string;
  textClassName?: string;
  roundedClassName?: string;
};

export function ProviderLogo({
  name,
  sizeClassName = 'w-8 h-8',
  textClassName = 'text-[11px] font-semibold',
  roundedClassName = 'rounded-lg',
}: ProviderLogoProps) {
  const logoUrl = getProviderLogoUrl(name);
  const [failed, setFailed] = React.useState(false);
  const frameClassName = `${sizeClassName} ${roundedClassName} bg-white border border-slate-300 shadow-sm overflow-hidden flex items-center justify-center`;

  if (logoUrl && !failed) {
    return (
      <div className={`${frameClassName} p-1.5`}>
        <img
          src={logoUrl}
          alt={`${name ?? 'provider'} logo`}
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`${frameClassName} text-slate-700 ${textClassName}`}>
      {getProviderInitials(name)}
    </div>
  );
}
