'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductCard from '@/components/storefront/ProductCard';
import FilterSidebar from '@/components/storefront/FilterSidebar';

const MOCK_PRODUCTS = [
  { _id: '1', name: 'Rolex Submariner Date', slug: 'rolex-submariner-date', brand: 'Rolex', price: 850000, condition: 'New', stock: 2, images: [], sku: 'ROL-001', movement: 'Automatic', caseSize: 41, gender: 'Men' },
  { _id: '2', name: 'Omega Seamaster 300M', slug: 'omega-seamaster-300m', brand: 'Omega', price: 420000, condition: 'New', stock: 1, images: [], sku: 'OMG-001', movement: 'Automatic', caseSize: 42, gender: 'Men' },
  { _id: '3', name: 'Patek Philippe Calatrava', slug: 'patek-philippe-calatrava', brand: 'Patek Philippe', price: 2500000, condition: 'New', stock: 1, images: [], sku: 'PAT-001', movement: 'Manual', caseSize: 38, gender: 'Men' },
  { _id: '4', name: 'Audemars Piguet Royal Oak', slug: 'ap-royal-oak', brand: 'Audemars Piguet', price: 3200000, condition: 'New', stock: 1, images: [], sku: 'AP-001', movement: 'Automatic', caseSize: 41, gender: 'Men' },
  { _id: '5', name: 'Cartier Santos', slug: 'cartier-santos', brand: 'Cartier', price: 550000, condition: 'New', stock: 3, images: [], sku: 'CAR-001', movement: 'Automatic', caseSize: 39, gender: 'Unisex' },
  { _id: '6', name: 'IWC Portugieser', slug: 'iwc-portugieser', brand: 'IWC', price: 780000, condition: 'New', stock: 2, images: [], sku: 'IWC-001', movement: 'Automatic', caseSize: 42, gender: 'Men' },
  { _id: '7', name: 'Rolex Datejust 31', slug: 'rolex-datejust-31', brand: 'Rolex', price: 680000, condition: 'New', stock: 1, images: [], sku: 'ROL-002', movement: 'Automatic', caseSize: 31, gender: 'Women' },
  { _id: '8', name: 'Cartier Ballon Bleu', slug: 'cartier-ballon-bleu', brand: 'Cartier', price: 480000, condition: 'New', stock: 2, images: [], sku: 'CAR-002', movement: 'Automatic', caseSize: 33, gender: 'Women' },
];

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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();

  // Parse filters from URL
  const getInitialFilters = () => ({
    brands: searchParams.get('brands') ? searchParams.get('brands').split(',') : [],
    genders: searchParams.get('genders') ? searchParams.get('genders').split(',') : [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const [filters, setFilters] = useState(getInitialFilters);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync filters to URL without triggering Next.js router navigation/suspense
  const updateUrl = useCallback((newFilters, newSearch) => {
    const params = new URLSearchParams();
    if (newFilters.brands.length) params.set('brands', newFilters.brands.join(','));
    if (newFilters.genders.length) params.set('genders', newFilters.genders.join(','));
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newSearch) params.set('q', newSearch);
    const queryString = params.toString();
    const url = queryString ? `/shop?${queryString}` : '/shop';
    window.history.replaceState(null, '', url);
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (pageNum, currentFilters, query, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const params = new URLSearchParams({
      page: pageNum,
      limit: 12,
      ...(currentFilters.brands.length && { brand: currentFilters.brands.join(',') }),
      ...(currentFilters.genders.length && { gender: currentFilters.genders.join(',') }),
      ...(currentFilters.minPrice && { minPrice: currentFilters.minPrice }),
      ...(currentFilters.maxPrice && { maxPrice: currentFilters.maxPrice }),
      ...(currentFilters.condition && { condition: currentFilters.condition }),
      ...(currentFilters.sort && { sort: currentFilters.sort }),
      ...(query && { q: query }),
    });

    try {
      const res = await fetch(`${apiUrl}/products?${params}`);
      const data = await res.json();
      const fetched = Array.isArray(data) ? data : (data?.products || []);
      if (append) {
        setProducts((prev) => [...prev, ...fetched]);
      } else {
        setProducts(fetched.length > 0 ? fetched : filterMockProducts(currentFilters, query));
      }
      setHasMore(fetched.length === 12);
    } catch {
      if (!append) {
        setProducts(filterMockProducts(currentFilters, query));
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Client-side filtering of mock data
  const filterMockProducts = (f, q) => {
    let results = [...MOCK_PRODUCTS];
    if (f.brands.length) results = results.filter((p) => f.brands.includes(p.brand));
    if (f.genders.length) results = results.filter((p) => f.genders.includes(p.gender));
    if (f.condition) results = results.filter((p) => p.condition === f.condition);
    if (f.minPrice) results = results.filter((p) => p.price >= Number(f.minPrice));
    if (f.maxPrice) results = results.filter((p) => p.price <= Number(f.maxPrice));
    if (q) results = results.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()));
    return results;
  };

  // Initial load and filter change
  useEffect(() => {
    setPage(1);
    fetchProducts(1, filters, search);
    updateUrl(filters, search);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(1, filters, val);
      updateUrl(filters, val);
    }, 400);
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
          fetchProducts(nextPage, filters, search, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, filters, search, fetchProducts]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16">
        {/* Page Header */}
        <div className="bg-[#111111] border-b border-white/5 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Watch Collection
            </h1>
            <p className="text-white/40 font-body">
              Authenticated brand-new luxury timepieces, delivered with care.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search watches, brands..."
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-[#111111] border border-white/10 text-white font-body text-sm pl-10 pr-4 py-3 focus:border-[#C9A84C]/50 focus:outline-none placeholder:text-white/30"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            <FilterSidebar filters={filters} onChange={setFilters} />

            {/* Product Grid */}
            <div className="flex-1 min-h-[400px] relative">
              {/* Premium Progress Bar at top of Grid */}
              {loading && products.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A84C]/10 overflow-hidden z-20">
                  <div className="h-full bg-[#C9A84C] w-1/3 animate-[loadingBar_1.5s_infinite_linear] rounded-full" />
                </div>
              )}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes loadingBar {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(300%); }
                }
              `}} />

              {loading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-white/30 font-body text-lg">No watches found matching your filters.</p>
                  <button
                    onClick={() => setFilters({ brands: [], genders: [], minPrice: '', maxPrice: '', condition: '', sort: 'newest' })}
                    className="mt-4 text-[#C9A84C] font-body text-sm underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className={`transition-opacity duration-300 ${loading ? 'opacity-35 pointer-events-none' : 'opacity-100'}`}>
                  <p className="text-white/30 font-body text-sm mb-4">
                    {products.length} watch{products.length !== 1 ? 'es' : ''} found
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-8 mt-6" />

              {loadingMore && (
                <div className="text-center py-6">
                  <div className="inline-block w-6 h-6 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
