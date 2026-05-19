import React from 'react';
import Image from 'next/image';

const CDN_ASSETS = process.env.NEXT_PUBLIC_CDN_ASSETS ?? '';

export function TestImageComponent() {
  const imageUrl = `${CDN_ASSETS}img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg`;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h2>Image Blur Test</h2>

      {/* Test 1: Next.js Image component */}
      <div style={{ marginBottom: '20px' }}>
        <h3>1. Next.js Image component (optimized)</h3>
        <Image
          src={imageUrl}
          alt="Test image - Next.js Image"
          width={300}
          height={200}
          style={{
            objectFit: 'cover',
            filter: 'none',
            imageRendering: 'crisp-edges',
            border: '2px solid red',
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
            imageRendering: 'crisp-edges',
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

      {/* Test 4: Next.js Image with cache-busting parameter */}
      <div style={{ marginBottom: '20px' }}>
        <h3>4. Next.js Image with cache-busting parameter</h3>
        <Image
          src={`${imageUrl}?v=${Date.now()}`}
          alt="Test image - cache busted"
          width={300}
          height={200}
          style={{
            objectFit: 'cover',
            filter: 'none',
            imageRendering: 'crisp-edges',
            border: '2px solid green',
          }}
        />
      </div>
    </div>
  );
}
