import type { ReactNode } from 'react';

export default function SectionDivider({ label }: { label: ReactNode }) {
  return (
    <div className="section-divider" aria-hidden="true">
      <div className="section-divider-line"></div>
      <div className="section-divider-label">{label}</div>
      <div className="section-divider-line"></div>
    </div>
  );
}
