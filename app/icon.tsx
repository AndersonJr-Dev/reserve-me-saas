import { ImageResponse } from 'next/og'

export const size = {
  width: 128,
  height: 128,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f97316, #ef4444)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '24px',
          padding: '20px',
        }}
      >
        {/* Calendar shape */}
        <div
          style={{
            width: '70px',
            height: '70px',
            background: 'transparent',
            border: '4px solid white',
            borderRadius: '8px',
            position: 'relative',
          }}
        >
          {/* Top bar for calendar */}
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              left: '0',
              width: '70px',
              height: '8px',
              background: 'white',
              borderRadius: '4px',
            }}
          />
          {/* Calendar lines */}
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '4px',
            }}
          >
            <div style={{ width: '100%', height: '3px', background: 'white', borderRadius: '2px' }} />
            <div style={{ width: '20px', height: '3px', background: 'white', borderRadius: '2px' }} />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

