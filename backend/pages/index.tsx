import React from 'react';

export default function Home() {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      lineHeight: '1.6',
      color: '#333'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
        color: '#2563eb'
      }}>
        AeroDash API
      </h1>
      
      <p style={{
        fontSize: '1.2rem',
        color: '#666',
        marginBottom: '2rem'
      }}>
        Welcome to the AeroDash backend API
      </p>

      <div style={{
        backgroundColor: '#f9fafb',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginTop: '0',
          marginBottom: '1rem'
        }}>
          Available Endpoints
        </h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Authentication</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>POST /api/auth/register</code></li>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>POST /api/auth/login</code></li>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>GET /api/auth/me</code></li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Senders</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>POST /api/senders/create</code></li>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>GET /api/senders/my-listings</code></li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Travelers</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>POST /api/travelers/create</code></li>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>GET /api/travelers/my-listings</code></li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Search & Matches</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>GET /api/search/listings</code></li>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>GET /api/matches</code></li>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>PUT /api/matches/[id]/update</code></li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Other</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>GET /api/airports/search</code></li>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>GET /api/flights/lookup</code></li>
            <li style={{ marginBottom: '0.5rem' }}>• <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>GET /api/health/db</code></li>
          </ul>
        </div>
      </div>

      <p style={{
        fontSize: '0.9rem',
        color: '#999',
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        AeroDash API v1.0
      </p>
    </div>
  );
}

