import { ImageResponse } from 'next/og'

export const size = {
  width: 64,
  height: 64,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#f8fafc',
          border: '3px solid #475569',
          color: '#334155',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 900,
          height: '100%',
          justifyContent: 'center',
          letterSpacing: '-3px',
          lineHeight: 0.72,
          width: '100%',
        }}
      >
        <span style={{ fontSize: 36 }}>GY</span>
        <span style={{ color: '#d97706', fontSize: 13, letterSpacing: '0' }}>METAL</span>
      </div>
    ),
    size,
  )
}
