'use client';

import { useEffect, useRef } from 'react';

const STATS = [
  { value: 500, suffix: '+', label: 'Watches Sold' },
  { value: 2000, suffix: '+', label: 'Happy Customers' },
  { value: 20, suffix: '+', label: 'Brands' },
];

export default function StatsCounter() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap } = await import('@/lib/gsap-helpers');

      ctx = gsap.context(() => {
        // ── Section slide-up ─────────────────────────────────────────────
        gsap.fromTo(sectionRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
          }
        );

        // ── Counter roll-up ──────────────────────────────────────────────
        const counters = sectionRef.current.querySelectorAll('.stat-number');
        counters.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2.2,
            ease: 'power2.out',
            snap: { val: 1 },
            onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString('en-IN'); },
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
          });
        });

        // ── Stat items stagger-in ────────────────────────────────────────
        gsap.fromTo('.stat-item',
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, stagger: 0.2, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' },
          }
        );
      }, sectionRef);
    })();

    return () => { if (ctx) ctx.revert(); };
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0D0D0D] border-y border-white/[0.05] relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.04)_0%,transparent_70%)] pointer-events-none" />
      {/* Corner marks */}
      {[['top-4 left-4', 'w-4 h-[1px]', 'w-[1px] h-4'], ['top-4 right-4', 'w-4 h-[1px]', 'w-[1px] h-4'], ['bottom-4 left-4', 'w-4 h-[1px]', 'w-[1px] h-4'], ['bottom-4 right-4', 'w-4 h-[1px]', 'w-[1px] h-4']].map(([pos], i) => (
        <div key={i} className={`absolute ${pos} w-4 h-[1px] bg-[#C9A84C]/30`} />
      ))}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-4 items-center">
          {STATS.map(({ value, suffix, label }, index) => (
            <div key={label} className="stat-item flex flex-col items-center gap-3 relative px-8 py-4">
              {index > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-16 bg-white/[0.06]" />
              )}
              <div className="font-display text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] to-[#F5E6C3] flex items-baseline gap-1 select-none">
                <span className="stat-number font-light tracking-tight" data-target={value}>0</span>
                <span className="text-[#C9A84C] font-light">{suffix}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#C9A84C]/60 rounded-full" />
                <p className="text-white/40 font-body text-xs uppercase tracking-[0.3em] font-semibold">{label}</p>
                <span className="w-1.5 h-1.5 bg-[#C9A84C]/60 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
