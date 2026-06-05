'use strict';

'use client';

import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16 font-body text-white">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(199,168,76,0.05),transparent_70%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest border border-[#C9A84C]/30 px-3 py-1 rounded-sm">
              Our Heritage
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mt-6 mb-4 tracking-tight">
              Chrono Craft
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
              Preserving horological history. We are a premier platform dedicated to sourcing, authenticating, and delivering the world&apos;s most sought-after brand-new luxury timepieces.
            </p>
          </div>
        </section>

        {/* Content sections */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">
          
          {/* Section 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-6">
                Uncompromising Authentication
              </h2>
              <p className="text-white/50 leading-relaxed text-sm mb-4">
                In the luxury watch market, trust is paramount. Every watch that passes through Chrono Craft undergoes a rigorous multi-point inspection by certified master watchmakers.
              </p>
              <p className="text-white/50 leading-relaxed text-sm">
                From inspecting molecular structures of gold alloys to verifying movement beat frequencies, we guarantee 100% authenticity on every piece. No exceptions.
              </p>
            </div>
            <div className="aspect-video bg-[#111111] border border-white/5 relative overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600"
                alt="Watch inspection"
                className="object-cover w-full h-full opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="absolute bottom-4 left-4 text-xs font-semibold tracking-wider text-[#C9A84C] uppercase">
                Horology lab
              </span>
            </div>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
            <div className="md:order-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-6">
                The Luxury Experience
              </h2>
              <p className="text-white/50 leading-relaxed text-sm mb-4">
                We believe shopping for brand-new luxury should feel truly extraordinary. Each timepiece is meticulously inspected, verified, and shipped in premium presentation boxes with original factory packaging.
              </p>
              <p className="text-white/50 leading-relaxed text-sm">
                Each delivery includes our signature Chrono Craft Certificate of Authenticity and a comprehensive 2-year warranty coverage, ensuring peace of mind with your investment.
              </p>
            </div>
            <div className="aspect-video bg-[#111111] border border-white/5 relative overflow-hidden flex items-center justify-center md:order-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600"
                alt="Luxury packaging"
                className="object-cover w-full h-full opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="absolute bottom-4 left-4 text-xs font-semibold tracking-wider text-[#C9A84C] uppercase">
                Premium Delivery Box
              </span>
            </div>
          </div>

        </section>
      </main>
      <Footer />
    </>
  );
}
