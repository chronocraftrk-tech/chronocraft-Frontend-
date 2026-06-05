'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

function SmartImage({ src, alt, fill, className, sizes, priority, style }) {
  const isDataUrl = src?.startsWith('data:');
  if (isDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}),
          ...style,
        }}
      />
    );
  }
  return <Image src={src} alt={alt} fill={fill} className={className} sizes={sizes} priority={priority} />;
}

// ── Lightbox rendered via portal directly on document.body ───────────────────
function Lightbox({ image, name, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      // Full-screen backdrop — rendered on body so nothing can sit above it
      style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.97)' }}
      onClick={onClose}
    >
      {/* Image container — click stops propagation so you can click the image without closing */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', maxHeight: '85vh', aspectRatio: '1/1' }}>
          <SmartImage
            src={image}
            alt={name}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 100000 }}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* "Click anywhere to close" hint */}
      <p
        style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
        className="text-white/30 font-body text-xs tracking-wider"
      >
        Press ESC or click anywhere to close
      </p>
    </div>,
    document.body
  );
}

// ── Main gallery component ────────────────────────────────────────────────────
export default function ProductGallery({ images = [], name }) {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted]           = useState(false);

  // Portals need the DOM to be available
  useEffect(() => { setMounted(true); }, []);

  const displayImages = images.length > 0 ? images : [null];
  const activeImage   = displayImages[activeIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square bg-[#1A1A1A] border border-white/5 cursor-zoom-in overflow-hidden group"
        onClick={() => activeImage && setLightboxOpen(true)}
      >
        {activeImage ? (
          <SmartImage
            src={activeImage}
            alt={`${name} — view ${activeIndex + 1}`}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-32 h-32 text-[#C9A84C]/20" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="50" cy="50" r="40" />
              <circle cx="50" cy="50" r="30" />
              <line x1="50" y1="18" x2="50" y2="28" />
              <line x1="50" y1="72" x2="50" y2="82" />
              <line x1="18" y1="50" x2="28" y2="50" />
              <line x1="72" y1="50" x2="82" y2="50" />
              <line x1="50" y1="50" x2="50" y2="32" strokeWidth="2" />
              <line x1="50" y1="50" x2="64" y2="50" strokeWidth="2" />
            </svg>
          </div>
        )}
        {/* Zoom hint */}
        {activeImage && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 text-white/50 text-xs font-body px-2.5 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Click to expand
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 relative w-20 h-20 bg-[#1A1A1A] border-2 transition-colors overflow-hidden ${
                i === activeIndex ? 'border-[#C9A84C]' : 'border-white/5 hover:border-[#C9A84C]/40'
              }`}
            >
              {img ? (
                <SmartImage src={img} alt={`Thumbnail ${i + 1}`} fill className="object-contain p-1" sizes="80px" />
              ) : (
                <div className="w-full h-full bg-[#1A1A1A]" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — mounted via portal so it covers Navbar and everything else */}
      {mounted && lightboxOpen && activeImage && (
        <Lightbox image={activeImage} name={name} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
