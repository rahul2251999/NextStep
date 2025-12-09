export default function TestPage() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Test Page</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          If you can see this, Next.js is working correctly!
        </p>
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ color: '#1976d2', marginBottom: '10px' }}>Status Check:</h2>
          <ul style={{ color: '#555', lineHeight: '1.8' }}>
            <li>✅ Next.js is running</li>
            <li>✅ React is rendering</li>
            <li>✅ Basic styling works</li>
          </ul>
        </div>
        <a 
          href="/" 
          style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            backgroundColor: '#0ea5e9', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '6px',
            marginTop: '20px'
          }}
        >
          Go to Home
        </a>
      </div>
    </div>
  )
}

