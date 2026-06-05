'use client';

import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

const BRANDS = [
  { name: 'Rolex', slug: 'rolex', tagline: 'Crown of Excellence', founded: '1905', origin: 'Geneva, Switzerland' },
  { name: 'Omega', slug: 'omega', tagline: 'Precision Since 1848', founded: '1848', origin: 'Biel, Switzerland' },
  { name: 'Patek Philippe', slug: 'patek-philippe', tagline: 'You Never Actually Own a Patek', founded: '1839', origin: 'Geneva, Switzerland' },
  { name: 'Audemars Piguet', slug: 'audemars-piguet', tagline: 'To Break the Rules, You Must First Master Them', founded: '1875', origin: 'Le Brassus, Switzerland' },
  { name: 'Cartier', slug: 'cartier', tagline: 'Jeweller of Kings', founded: '1847', origin: 'Paris, France' },
  { name: 'IWC', slug: 'iwc', tagline: 'Probus Scafusia', founded: '1868', origin: 'Schaffhausen, Switzerland' },
  { name: 'Breitling', slug: 'breitling', tagline: 'Instruments for Professionals', founded: '1884', origin: 'Grenchen, Switzerland' },
  { name: 'Jaeger-LeCoultre', slug: 'jaeger-lecoultre', tagline: 'The Watchmaker of Watchmakers', founded: '1833', origin: 'Le Sentier, Switzerland' },
];

export default function BrandsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16">
        {/* Hero */}
        <div className="relative bg-[#111111] border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A84C] rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-body text-white/30 mb-6 uppercase tracking-widest">
              <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/60">Brands</span>
            </nav>
            <p className="text-[#C9A84C] text-xs font-body uppercase tracking-[0.3em] mb-2">Our Collection</p>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-3">Prestigious Brands</h1>
            <p className="text-white/40 font-body text-base max-w-xl">
              Explore authenticated timepieces from the world&apos;s most revered watchmakers.
            </p>
            <div className="mt-8 w-16 h-px bg-[#C9A84C]" />
          </div>
        </div>

        {/* Brands Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group block bg-[#111111] border border-white/5 hover:border-[#C9A84C]/50 p-8 transition-all duration-300 hover:bg-[#151515]"
              >
                {/* Gold accent bar */}
                <div className="w-8 h-px bg-[#C9A84C]/40 group-hover:w-16 group-hover:bg-[#C9A84C] transition-all duration-500 mb-6" />

                <h2 className="font-display text-white text-xl font-semibold mb-2 group-hover:text-[#C9A84C] transition-colors">
                  {brand.name}
                </h2>
                <p className="text-white/30 text-xs font-body italic mb-6 line-clamp-2">
                  &ldquo;{brand.tagline}&rdquo;
                </p>

                <div className="flex items-center justify-between text-xs font-body text-white/20">
                  <span>Est. {brand.founded}</span>
                  <span className="text-[#C9A84C]/60 group-hover:text-[#C9A84C] transition-colors">
                    View Collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
