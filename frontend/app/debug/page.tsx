"use client"

export default function DebugPage() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh', fontFamily: 'monospace' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Debug Information</h1>
        
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ color: '#1976d2', marginBottom: '10px' }}>Environment Variables:</h2>
          <ul style={{ color: '#555', lineHeight: '1.8' }}>
            <li>NEXTAUTH_URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</li>
            <li>API URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ color: '#856404', marginBottom: '10px' }}>Browser Info:</h2>
          <ul style={{ color: '#555', lineHeight: '1.8' }}>
            <li>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</li>
            <li>Window Width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</li>
            <li>Window Height: {typeof window !== 'undefined' ? window.innerHeight : 'N/A'}</li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#d4edda', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ color: '#155724', marginBottom: '10px' }}>Status:</h2>
          <ul style={{ color: '#555', lineHeight: '1.8' }}>
            <li>✅ Next.js is running</li>
            <li>✅ React is rendering</li>
            <li>✅ Client-side JavaScript works</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <a 
            href="/" 
            style={{ 
              display: 'inline-block', 
              padding: '12px 24px', 
              backgroundColor: '#0ea5e9', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '6px',
              marginRight: '10px'
            }}
          >
            Go to Home
          </a>
          <a 
            href="/test" 
            style={{ 
              display: 'inline-block', 
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '6px'
            }}
          >
            Go to Test
          </a>
        </div>
      </div>
    </div>
  )
}

