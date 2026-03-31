import { memo, useState } from 'react'
import { ZoomIn } from 'lucide-react'

const CompareView = memo(function CompareView({
  before,
  after,
  beforeLabel = '整改前',
  afterLabel = '整改后',
}) {
  const [active, setActive] = useState('before')
  const [zoomed, setZoomed] = useState(false)

  const src = active === 'before' ? before : after
  const label = active === 'before' ? beforeLabel : afterLabel

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {['before', 'after'].map(side => (
          <button
            key={side}
            onClick={() => setActive(side)}
            style={{
              flex: 1,
              padding: '8px 0',
              background:
                active === side
                  ? side === 'before'
                    ? 'oklch(65% 0.2 25 / 0.15)'
                    : 'oklch(70% 0.18 145 / 0.15)'
                  : 'oklch(22% 0.01 250)',
              border: `1.5px solid ${
                active === side
                  ? side === 'before'
                    ? 'oklch(65% 0.2 25)'
                    : 'oklch(70% 0.18 145)'
                  : 'oklch(28% 0.01 250 / 0.3)'
              }`,
              borderRadius: 10,
              color:
                active === side
                  ? side === 'before'
                    ? 'oklch(65% 0.2 25)'
                    : 'oklch(70% 0.18 145)'
                  : 'oklch(65% 0.01 250)',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              fontSize: 13,
              fontWeight: active === side ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {side === 'before' ? beforeLabel : afterLabel}
          </button>
        ))}
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          background: 'oklch(18% 0.01 250)',
          border: '1px solid oklch(28% 0.01 250 / 0.3)',
        }}
      >
        {src ? (
          <img
            src={src}
            alt={label}
            onClick={() => setZoomed(z => !z)}
            style={{
              width: '100%',
              display: 'block',
              maxHeight: 320,
              objectFit: 'cover',
              cursor: 'zoom-in',
              transform: zoomed ? 'scale(1.5)' : 'scale(1)',
              transition: 'transform 0.25s ease',
            }}
          />
        ) : (
          <div
            style={{
              padding: '48px 0',
              textAlign: 'center',
              color: 'oklch(42% 0.01 250)',
              fontSize: 13,
            }}
          >
            暂无图片
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            background:
              active === 'before' ? 'oklch(65% 0.2 25 / 0.85)' : 'oklch(70% 0.18 145 / 0.85)',
            color: '#fff',
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          }}
        >
          {label}
        </div>

        {src && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'oklch(18% 0.01 250 / 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setZoomed(z => !z)}
          >
            <ZoomIn size={14} color="oklch(92% 0.01 250)" />
          </div>
        )}
      </div>
    </div>
  )
})

export default CompareView
