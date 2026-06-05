'use client';

import { useEffect, useRef, useState } from 'react';

const FALLBACK = [
  { _id: '1', reviewerName: 'Arjun Mehta', reviewerLocation: 'Mumbai', rating: 5, quote: 'Exceptional service. The Rolex Submariner I purchased was in perfect condition, exactly as described. The authentication process gave me complete confidence.' },
  { _id: '2', reviewerName: 'Priya Sharma', reviewerLocation: 'Delhi', rating: 5, quote: 'Chrono Craft made finding my dream Patek Philippe effortless. The team was professional, the communication via WhatsApp was instant, and delivery was seamless.' },
  { _id: '3', reviewerName: 'Vikram Nair', reviewerLocation: 'Bangalore', rating: 5, quote: 'I have purchased three watches from Chrono Craft. Every single one has been a flawless experience. This is the gold standard for luxury watch resellers in India.' },
];

export default function Testimonials() {
  const sectionRef = useRef(null);
  const [reviews, setReviews] = useState(FALLBACK);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/reviews`, {
      headers: { 'X-Tenant-ID': process.env.NEXT_PUBLIC_TENANT_ID || '' },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) setReviews(data.reviews);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap, revealWords } = await import('@/lib/gsap-helpers');
      ctx = gsap.context(() => {
        const heading = sectionRef.current?.querySelector('h2');
        if (heading) revealWords(heading, { scrollTrigger: { trigger: heading, start: 'top 88%' } });

        gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
          gsap.fromTo(card,
            { x: i % 2 === 0 ? -60 : 60, skewY: i % 2 === 0 ? 3 : -3, opacity: 0 },
            { x: 0, skewY: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%' } }
          );
        });
      }, sectionRef);
    })();
    return () => { if (ctx) ctx.revert(); };
  }, [reviews]);

  return (
    <section ref={sectionRef} className="bg-[#0A0A0A] border-t border-white/[0.03] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C9A84C] text-xs font-body font-semibold uppercase tracking-[0.4em] mb-4">Client Stories</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight overflow-hidden">
            What Our Clients Say
          </h2>
          <div className="mt-5 w-12 h-[1px] bg-[#C9A84C] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((t, i) => (
            <div
              key={t._id || i}
              className="testimonial-card group border border-white/[0.04] bg-[#111111]/45 p-10 relative hover:border-[#C9A84C]/35 hover:shadow-[0_8px_40px_rgba(201,168,76,0.06)] transition-all duration-500"
            >
              <span className="font-display text-7xl text-[#C9A84C]/15 absolute top-6 right-8 leading-none select-none">&ldquo;</span>
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} className="w-3.5 h-3.5 text-[#C9A84C]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-white/70 font-body text-[14px] leading-relaxed mb-8 italic relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-white/[0.06] pt-5 flex items-center justify-between">
                <div>
                  <p className="font-display text-white text-base font-medium tracking-wide group-hover:text-[#C9A84C] transition-colors duration-300">
                    {t.reviewerName}
                  </p>
                  <p className="text-white/40 text-xs font-body tracking-wider mt-0.5">{t.reviewerLocation}</p>
                </div>
                <div className="w-6 h-[1px] bg-[#C9A84C]/40 group-hover:w-10 group-hover:bg-[#C9A84C] transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
