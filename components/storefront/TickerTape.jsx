'use client';

import { useEffect, useRef } from 'react';

const BRANDS = [
  'Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet',
  'Cartier', 'IWC', 'Breitling', 'Jaeger-LeCoultre',
  'Hublot', 'TAG Heuer', 'Vacheron Constantin', 'A. Lange & Söhne',
];

export default function TickerTape() {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    let tween;
    (async () => {
      const { gsap } = await import('@/lib/gsap-helpers');
      const track = trackRef.current;
      if (!track) return;

      // Duplicate the items for seamless loop
      const items = track.querySelectorAll('.ticker-item');
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
      });

      tween = gsap.to(track, {
        x: '-50%',
        duration: 20,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % (track.scrollWidth / 2)),
        },
      });
      tweenRef.current = tween;
    })();

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, []);

  return (
    <div className="bg-[#111111] border-y border-[#C9A84C]/20 py-4 overflow-hidden">
      <div ref={trackRef} className="flex gap-0 whitespace-nowrap will-change-transform">
        {BRANDS.map((brand, i) => (
          <span key={i} className="ticker-item inline-flex items-center">
            <span className="text-[#C9A84C] font-display text-sm uppercase tracking-[0.2em] px-6">
              {brand}
            </span>
            <span className="text-[#C9A84C]/40 text-lg">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
