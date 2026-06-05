'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const containerRef = useRef(null);
  const watchRef = useRef(null);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap, ScrollTrigger, splitChars } = await import('@/lib/gsap-helpers');

      ctx = gsap.context(() => {
        // ── 1. Tagline fade-up ────────────────────────────────────────────
        gsap.fromTo('.hero-tag',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
        );

        // ── 2. Char-by-char title reveal ─────────────────────────────────
        const line1 = document.querySelector('.hero-line1');
        const line2 = document.querySelector('.hero-line2');
        if (line1) {
          const chars1 = splitChars(line1);
          gsap.fromTo(chars1,
            { y: 60, opacity: 0, rotateX: -40 },
            { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.03, ease: 'power4.out', delay: 0.4 }
          );
        }
        if (line2) {
          const chars2 = splitChars(line2);
          gsap.fromTo(chars2,
            { y: 60, opacity: 0, rotateX: -40 },
            { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.03, ease: 'power4.out', delay: 0.65 }
          );
        }

        // ── 3. Subtitle + CTA slide-up ───────────────────────────────────
        gsap.fromTo('.hero-subtitle',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1.0 }
        );
        gsap.fromTo('.hero-cta',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1.2 }
        );

        // ── 4. Watch entrance — scale + rotation ─────────────────────────
        gsap.fromTo('.hero-watch',
          { scale: 0.8, opacity: 0, rotation: -8 },
          { scale: 1, opacity: 1, rotation: 0, duration: 1.4, ease: 'expo.out', delay: 0.5 }
        );

        // ── 5. Ambient glow parallax on scroll ───────────────────────────
        gsap.to('.hero-glow-1', {
          y: -60,
          scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
        });
        gsap.to('.hero-glow-2', {
          y: -30,
          scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 2 },
        });

        // ── 6. Rotating rings counter-animations ─────────────────────────
        gsap.to('.ring-outer', { rotation: 360, duration: 80, repeat: -1, ease: 'none' });
        gsap.to('.ring-inner', { rotation: -360, duration: 50, repeat: -1, ease: 'none' });

        // ── 7. Scroll indicator infinite pulse ───────────────────────────
        gsap.fromTo('.scroll-dot',
          { y: 0, opacity: 1 },
          { y: 40, opacity: 0, duration: 1.4, ease: 'power1.inOut', repeat: -1, delay: 1.5 }
        );

      }, containerRef);
    })();

    // ── Magnetic hover on watch ───────────────────────────────────────────
    const el = watchRef.current;
    if (!el) return;

    const onMove = (e) => {
      const box = el.getBoundingClientRect();
      const x = e.clientX - box.left - box.width / 2;
      const y = e.clientY - box.top - box.height / 2;
      el.style.transform = `perspective(1200px) rotateY(${x * 0.03}deg) rotateX(${-y * 0.03}deg) translateZ(20px)`;
    };
    const onLeave = () => {
      el.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      if (ctx) ctx.revert();
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-[#0A0A0A] flex items-center overflow-hidden pt-20"
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Ambient glows */}
      <div className="hero-glow-1 absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#C9A84C]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="hero-glow-2 absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#C9A84C]/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-5rem)] py-12">

          {/* ── Left Content ─────────────────────────────────────────────── */}
          <div className="flex flex-col justify-center">
            <p className="hero-tag text-[#C9A84C] text-xs font-body font-semibold uppercase tracking-[0.4em] mb-5">
              Luxury Brand-New Timepieces
            </p>

            <h1 className="font-display font-bold leading-none mb-6" style={{ perspective: '600px' }}>
              <span className="hero-line1 block text-white text-6xl sm:text-7xl lg:text-8xl tracking-tight">Timeless</span>
              <span className="hero-line2 block text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] via-[#F5E6C3] to-[#C9A84C] text-6xl sm:text-7xl lg:text-8xl tracking-tight">Precision</span>
            </h1>

            <p className="hero-subtitle text-white/50 text-base sm:text-lg font-body max-w-md mb-10 leading-relaxed">
              Discover authenticated luxury watches from the world&apos;s most prestigious brands.
              Every timepiece curated, verified, and delivered with care.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-xs overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative">Explore Collection</span>
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border border-[#C9A84C]/45 text-[#C9A84C] font-body font-semibold uppercase tracking-wider text-xs hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all duration-300"
              >
                WhatsApp Enquiry
              </a>
            </div>
          </div>

          {/* ── Right — Watch ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-center">
            <div
              ref={watchRef}
              className="hero-watch relative cursor-pointer"
              style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}
            >
              {/* Ambient backlight */}
              <div className="absolute inset-0 bg-[#C9A84C]/12 rounded-full blur-[90px] -z-10 scale-110" />

              {/* Outer ring */}
              <div className="w-80 h-80 sm:w-[460px] sm:h-[460px] border border-[#C9A84C]/20 rounded-full flex items-center justify-center relative">
                {/* Rotating outer dashed ring */}
                <div className="ring-outer absolute inset-4 border border-dashed border-[#C9A84C]/20 rounded-full" />
                {/* Counter-rotating inner ring */}
                <div className="ring-inner absolute inset-12 border border-dotted border-[#C9A84C]/10 rounded-full" />
                <div className="absolute inset-20 border border-[#C9A84C]/5 rounded-full" />

                {/* Cardinal markers */}
                {[0, 90, 180, 270].map((deg) => (
                  <div
                    key={deg}
                    className="absolute w-[2px] h-4 bg-[#C9A84C]/70"
                    style={{ transformOrigin: '50% 190px', transform: `rotate(${deg}deg)` }}
                  />
                ))}

                {/* Pulse dots */}
                <div className="absolute top-6 right-14 w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-ping opacity-60" />
                <div className="absolute bottom-10 left-10 w-1 h-1 bg-[#C9A84C] rounded-full animate-pulse opacity-40" />

                {/* Watch image */}
                <div
                  className="w-64 h-64 sm:w-[380px] sm:h-[380px] rounded-full overflow-hidden relative shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-[#C9A84C]/25 bg-[#0F0F0F]"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <Image
                    src="/images/hero-watch.png"
                    alt="Chrono Craft — Premium Luxury Watch"
                    fill
                    className="object-cover scale-105 hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 256px, 380px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 group cursor-pointer">
        <span className="text-[10px] uppercase tracking-[0.3em] font-body group-hover:text-[#C9A84C] transition-colors">Scroll</span>
        <div className="w-[1px] h-14 bg-white/10 relative overflow-hidden">
          <div className="scroll-dot absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-[#C9A84C] to-transparent" />
        </div>
      </div>
    </section>
  );
}
