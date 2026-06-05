'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';

const MOCK_PRODUCTS = [
  { _id: '1', name: 'Rolex Submariner Date', slug: 'rolex-submariner-date', brand: 'Rolex', price: 850000, condition: 'Excellent', stock: 2, images: ['/images/rolex-submariner.png'], sku: 'ROL-001', movement: 'Automatic', caseSize: 41 },
  { _id: '2', name: 'Omega Seamaster 300M', slug: 'omega-seamaster-300m', brand: 'Omega', price: 420000, condition: 'Like New', stock: 1, images: ['/images/omega-seamaster.png'], sku: 'OMG-001', movement: 'Automatic', caseSize: 42 },
  { _id: '3', name: 'Patek Philippe Calatrava', slug: 'patek-philippe-calatrava', brand: 'Patek Philippe', price: 2500000, condition: 'New', stock: 1, images: ['/images/patek-calatrava.png'], sku: 'PAT-001', movement: 'Manual', caseSize: 38 },
  { _id: '4', name: 'Audemars Piguet Royal Oak', slug: 'ap-royal-oak', brand: 'Audemars Piguet', price: 3200000, condition: 'Excellent', stock: 1, images: ['/images/ap-royal-oak.png'], sku: 'AP-001', movement: 'Automatic', caseSize: 41 },
  { _id: '5', name: 'Cartier Santos', slug: 'cartier-santos', brand: 'Cartier', price: 550000, condition: 'Good', stock: 3, images: ['/images/cartier-santos.png'], sku: 'CAR-001', movement: 'Automatic', caseSize: 39 },
  { _id: '6', name: 'IWC Portugieser', slug: 'iwc-portugieser', brand: 'IWC', price: 780000, condition: 'Like New', stock: 2, images: ['/images/iwc-portugieser.png'], sku: 'IWC-001', movement: 'Automatic', caseSize: 42 },
];

export default function FeaturedGrid() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/products/featured`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data);
        else if (data?.products?.length > 0) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap, ScrollTrigger, revealWords } = await import('@/lib/gsap-helpers');

      ctx = gsap.context(() => {
        // ── Heading word-mask reveal ─────────────────────────────────────
        const heading = headingRef.current?.querySelector('h2');
        if (heading) {
          revealWords(heading, {
            scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
          });
        }

        // ── Decorative line expand ───────────────────────────────────────
        gsap.fromTo('.featured-divider',
          { scaleX: 0 },
          {
            scaleX: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: headingRef.current, start: 'top 80%' },
          }
        );

        // ── Cards: clip-path iris reveal + stagger ───────────────────────
        gsap.fromTo('.featured-card',
          { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0, y: 20 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: { amount: 0.9, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
          }
        );

        // ── CTA button bounce in ─────────────────────────────────────────
        gsap.fromTo('.featured-cta',
          { scale: 0.85, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: '.featured-cta', start: 'top 90%' },
          }
        );
      }, sectionRef);
    })();

    return () => { if (ctx) ctx.revert(); };
  }, [products]);

  return (
    <section ref={sectionRef} className="bg-[#0A0A0A] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <p className="text-[#C9A84C] text-xs font-body uppercase tracking-[0.4em] mb-4">
            Handpicked Timepieces
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white overflow-hidden">
            Featured Watches
          </h2>
          <div className="featured-divider mt-5 w-16 h-px bg-[#C9A84C] mx-auto origin-left" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="featured-card">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-14">
          <a
            href="/shop"
            className="featured-cta inline-flex items-center gap-2 text-[#C9A84C] font-body font-semibold uppercase tracking-wider text-sm border border-[#C9A84C]/50 px-8 py-3 hover:bg-[#C9A84C]/10 hover:shadow-[0_0_20px_rgba(201,168,76,0.15)] transition-all duration-300"
          >
            View All Watches
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
