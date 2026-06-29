/**
 * CRT 扫描线 + 噪点叠加层。
 * fixed 全屏，pointer-events: none，mix-blend overlay。
 */
export default function Scanlines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      {/* 扫描线 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)',
          opacity: 'var(--scan-opacity)',
          mixBlendMode: 'overlay',
        }}
      />
      {/* 移动扫描带 */}
      <div
        className="absolute inset-x-0 h-24 animate-scan-move"
        style={{
          background:
            'linear-gradient(180deg, transparent, rgba(0,240,255,0.06), transparent)',
        }}
      />
      {/* 噪点 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
          opacity: 'var(--noise-opacity)',
          mixBlendMode: 'overlay',
        }}
      />
      {/* 暗角 vignette */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 180px rgba(0,0,0,0.7)',
        }}
      />
    </div>
  )
}
