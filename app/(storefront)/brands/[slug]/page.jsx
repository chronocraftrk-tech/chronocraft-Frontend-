'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductCard from '@/components/storefront/ProductCard';

const MOCK_PRODUCTS = [
  { _id: '1', name: 'Rolex Submariner Date', slug: 'rolex-submariner-date', brand: 'Rolex', price: 850000, condition: 'Excellent', stock: 2, images: [], sku: 'ROL-001', movement: 'Automatic', caseSize: 41 },
  { _id: '2', name: 'Omega Seamaster 300M', slug: 'omega-seamaster-300m', brand: 'Omega', price: 420000, condition: 'Like New', stock: 1, images: [], sku: 'OMG-001', movement: 'Automatic', caseSize: 42 },
  { _id: '3', name: 'Patek Philippe Calatrava', slug: 'patek-philippe-calatrava', brand: 'Patek Philippe', price: 2500000, condition: 'New', stock: 1, images: [], sku: 'PAT-001', movement: 'Manual', caseSize: 38 },
  { _id: '4', name: 'Audemars Piguet Royal Oak', slug: 'ap-royal-oak', brand: 'Audemars Piguet', price: 3200000, condition: 'Excellent', stock: 1, images: [], sku: 'AP-001', movement: 'Automatic', caseSize: 41 },
  { _id: '5', name: 'Cartier Santos', slug: 'cartier-santos', brand: 'Cartier', price: 550000, condition: 'Good', stock: 3, images: [], sku: 'CAR-001', movement: 'Automatic', caseSize: 39 },
  { _id: '6', name: 'IWC Portugieser', slug: 'iwc-portugieser', brand: 'IWC', price: 780000, condition: 'Like New', stock: 2, images: [], sku: 'IWC-001', movement: 'Automatic', caseSize: 42 },
];

const BRANDS_META = {
  rolex: { name: 'Rolex', tagline: 'Crown of Excellence', founded: '1905', origin: 'Geneva, Switzerland' },
  omega: { name: 'Omega', tagline: 'Precision Since 1848', founded: '1848', origin: 'Biel, Switzerland' },
  'patek-philippe': { name: 'Patek Philippe', tagline: 'You Never Actually Own a Patek', founded: '1839', origin: 'Geneva, Switzerland' },
  'audemars-piguet': { name: 'Audemars Piguet', tagline: 'To Break the Rules, You Must First Master Them', founded: '1875', origin: 'Le Brassus, Switzerland' },
  cartier: { name: 'Cartier', tagline: 'Jeweller of Kings', founded: '1847', origin: 'Paris, France' },
  iwc: { name: 'IWC', tagline: 'Probus Scafusia', founded: '1868', origin: 'Schaffhausen, Switzerland' },
  breitling: { name: 'Breitling', tagline: 'Instruments for Professionals', founded: '1884', origin: 'Grenchen, Switzerland' },
  'jaeger-lecoultre': { name: 'Jaeger-LeCoultre', tagline: 'The Watchmaker of Watchmakers', founded: '1833', origin: 'Le Sentier, Switzerland' },
};

function slugToBrandName(slug) {
  return BRANDS_META[slug]?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function SkeletonCard() {
  return (
    <div className="bg-[#111111] border border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#1A1A1A]" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="h-5 bg-white/5 rounded w-1/2" />
        <div className="h-10 bg-white/5 rounded" />
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    }>
      <BrandContent />
    </Suspense>
  );
}

function BrandContent() {
  const params = useParams();
  const slug = params?.slug || '';
  const brandMeta = BRANDS_META[slug];
  const brandName = slugToBrandName(slug);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState('newest');
  const sentinelRef = useRef(null);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, sort, false);
  }, [slug, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async (pageNum, sortVal, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const queryParams = new URLSearchParams({ page: pageNum, limit: 12, brand: brandName, sort: sortVal });

    try {
      const res = await fetch(`${apiUrl}/products?${queryParams}`);
      const data = await res.json();
      const fetched = Array.isArray(data) ? data : (data?.products || []);
      if (append) {
        setProducts((prev) => [...prev, ...fetched]);
      } else {
        // Fallback to mock data if API returns empty
        setProducts(fetched.length > 0 ? fetched : MOCK_PRODUCTS.filter((p) => p.brand === brandName));
      }
      setHasMore(fetched.length === 12);
    } catch {
      if (!append) {
        setProducts(MOCK_PRODUCTS.filter((p) => p.brand === brandName));
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, sort, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16">
        {/* Brand Hero Header */}
        <div className="relative bg-[#111111] border-b border-white/5 overflow-hidden">
          {/* Decorative background accent */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A84C] rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-body text-white/30 mb-6 uppercase tracking-widest">
              <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/" className="hover:text-[#C9A84C] transition-colors">Brands</Link>
              <span>/</span>
              <span className="text-white/60">{brandName}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <p className="text-[#C9A84C] text-xs font-body uppercase tracking-[0.3em] mb-2">
                  Prestigious Collection
                </p>
                <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-3">
                  {brandName}
                </h1>
                {brandMeta && (
                  <p className="text-white/40 font-body italic text-base max-w-lg">
                    &ldquo;{brandMeta.tagline}&rdquo;
                  </p>
                )}
              </div>

              {brandMeta && (
                <div className="flex gap-8 shrink-0">
                  <div className="text-center">
                    <p className="text-[#C9A84C] font-display text-2xl font-bold">{brandMeta.founded}</p>
                    <p className="text-white/30 font-body text-xs uppercase tracking-wider mt-1">Founded</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-white font-display text-sm font-semibold leading-tight max-w-[120px]">{brandMeta.origin}</p>
                    <p className="text-white/30 font-body text-xs uppercase tracking-wider mt-1">Origin</p>
                  </div>
                </div>
              )}
            </div>

            {/* Gold divider */}
            <div className="mt-8 w-16 h-px bg-[#C9A84C]" />
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-white/30 font-body text-sm">
              {loading ? 'Loading…' : `${products.length} timepiece${products.length !== 1 ? 's' : ''} available`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#111111] border border-white/10 text-white font-body text-sm px-4 py-2 focus:border-[#C9A84C]/50 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white/20 font-display text-6xl mb-4">∅</p>
              <p className="text-white/40 font-body text-lg mb-2">No {brandName} watches available right now.</p>
              <p className="text-white/20 font-body text-sm mb-8">Check back soon or explore our full collection.</p>
              <Link
                href="/shop"
                className="inline-block border border-[#C9A84C]/50 text-[#C9A84C] font-body text-sm px-8 py-3 hover:bg-[#C9A84C] hover:text-black transition-all duration-300"
              >
                Browse All Watches
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-8 mt-6" />

          {loadingMore && (
            <div className="text-center py-6">
              <div className="inline-block w-6 h-6 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
