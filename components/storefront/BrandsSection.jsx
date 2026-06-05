'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

const BRANDS = [
  { name: 'Rolex', tagline: 'Crown of Excellence' },
  { name: 'Omega', tagline: 'Precision Since 1848' },
  { name: 'Patek Philippe', tagline: 'You Never Actually Own a Patek' },
  { name: 'Audemars Piguet', tagline: 'To Break the Rules, You Must First Master Them' },
  { name: 'Cartier', tagline: 'Jeweller of Kings' },
  { name: 'IWC', tagline: 'Probus Scafusia' },
  { name: 'Breitling', tagline: 'Instruments for Professionals' },
  { name: 'Jaeger-LeCoultre', tagline: 'The Watchmaker of Watchmakers' },
];

export default function BrandsSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap, revealWords } = await import('@/lib/gsap-helpers');

      ctx = gsap.context(() => {
        // ── Heading reveal ───────────────────────────────────────────────
        const heading = sectionRef.current?.querySelector('h2');
        if (heading) {
          revealWords(heading, {
            scrollTrigger: { trigger: heading, start: 'top 88%' },
          });
        }

        // ── Brand cards: 3D rotateY flip in ─────────────────────────────
        gsap.fromTo('.brand-card',
          { rotateY: -90, opacity: 0, transformOrigin: 'left center' },
          {
            rotateY: 0,
            opacity: 1,
            duration: 0.65,
            stagger: { amount: 0.8, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
          }
        );
      }, sectionRef);
    })();

    return () => { if (ctx) ctx.revert(); };
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0A0A0A] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#C9A84C] text-xs font-body uppercase tracking-[0.4em] mb-4">
            Our Collection
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white overflow-hidden">
            Prestigious Brands
          </h2>
          <div className="mt-5 w-16 h-px bg-[#C9A84C] mx-auto" />
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5" style={{ perspective: '800px' }}>
          {BRANDS.map((brand) => (
            <Link
              key={brand.name}
              href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="brand-card group block bg-[#111111]/70 border border-white/[0.05] p-8 text-center hover:bg-[#111111] hover:border-[#C9A84C]/45 hover:shadow-[0_8px_40px_rgba(201,168,76,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out"
            >
              <h3 className="font-display text-white text-xl font-medium tracking-wide group-hover:text-[#C9A84C] transition-colors duration-300">
                {brand.name}
              </h3>
              <div className="w-8 h-[1px] bg-[#C9A84C]/30 mx-auto my-4 group-hover:w-16 group-hover:bg-[#C9A84C] transition-all duration-500" />
              <p className="text-white/45 text-xs font-body italic leading-relaxed group-hover:text-white/70 transition-colors duration-300 line-clamp-2">
                {brand.tagline}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
