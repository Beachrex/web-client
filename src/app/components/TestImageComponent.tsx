import React from 'react';

export function TestImageComponent() {
  const imageUrl = "https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg";
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h2>Image Blur Test</h2>
      
      {/* Test 1: Raw HTML img tag */}
      <div style={{ marginBottom: '20px' }}>
        <h3>1. Raw HTML img tag (no processing)</h3>
        <img 
          src={imageUrl}
          alt="Test image - raw HTML"
          style={{
            width: '300px',
            height: '200px',
            objectFit: 'cover',
            filter: 'none',
            imageRendering: 'crisp-edges',
            border: '2px solid red'
          }}
        />
      </div>

      {/* Test 2: Background image */}
      <div style={{ marginBottom: '20px' }}>
        <h3>2. Background image (no processing)</h3>
        <div
          style={{
            width: '300px',
            height: '200px',
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2px solid blue',
            filter: 'none',
            imageRendering: 'crisp-edges'
          }}
        />
      </div>

      {/* Test 3: Direct URL link */}
      <div style={{ marginBottom: '20px' }}>
        <h3>3. Direct URL (click to open in new tab)</h3>
        <a 
          href={imageUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          Open image directly: {imageUrl}
        </a>
      </div>

      {/* Test 4: Image with different URL parameters */}
      <div style={{ marginBottom: '20px' }}>
        <h3>4. Image with cache-busting parameter</h3>
        <img 
          src={`${imageUrl}?v=${Date.now()}`}
          alt="Test image - cache busted"
          style={{
            width: '300px',
            height: '200px',
            objectFit: 'cover',
            filter: 'none',
            imageRendering: 'crisp-edges',
            border: '2px solid green'
          }}
        />
      </div>
    </div>
  );
}
