'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductGallery from '@/components/storefront/ProductGallery';
import WhatsAppCTA from '@/components/storefront/WhatsAppCTA';
import SpecsAccordion from '@/components/storefront/SpecsAccordion';
import ProductCard from '@/components/storefront/ProductCard';
import useCartStore from '@/lib/store/cartStore';
import useWishlistStore from '@/lib/store/wishlistStore';

const MOCK_PRODUCTS = [
  { _id: '1', name: 'Rolex Submariner Date', slug: 'rolex-submariner-date', brand: 'Rolex', price: 850000, condition: 'New', stock: 2, images: [], sku: 'ROL-001', movement: 'Automatic', caseSize: 41, dial: 'Black', caseMaterial: 'Oystersteel', yearOfManufacture: 2021, includedItems: ['Watch', 'Original Box', 'Papers'] },
  { _id: '2', name: 'Omega Seamaster 300M', slug: 'omega-seamaster-300m', brand: 'Omega', price: 420000, condition: 'New', stock: 1, images: [], sku: 'OMG-001', movement: 'Automatic', caseSize: 42, dial: 'Blue', caseMaterial: 'Stainless Steel', includedItems: ['Watch', 'Box'] },
  { _id: '3', name: 'Patek Philippe Calatrava', slug: 'patek-philippe-calatrava', brand: 'Patek Philippe', price: 2500000, condition: 'New', stock: 1, images: [], sku: 'PAT-001', movement: 'Manual', caseSize: 38, dial: 'White', caseMaterial: 'White Gold', includedItems: ['Watch', 'Original Box', 'Papers', 'Warranty Card'] },
  { _id: '4', name: 'Audemars Piguet Royal Oak', slug: 'ap-royal-oak', brand: 'Audemars Piguet', price: 3200000, condition: 'New', stock: 1, images: [], sku: 'AP-001', movement: 'Automatic', caseSize: 41, dial: 'Blue', caseMaterial: 'Stainless Steel', includedItems: ['Watch', 'Box', 'Papers'] },
  { _id: '5', name: 'Cartier Santos', slug: 'cartier-santos', brand: 'Cartier', price: 550000, condition: 'New', stock: 3, images: [], sku: 'CAR-001', movement: 'Automatic', caseSize: 39, dial: 'Silver', caseMaterial: 'Stainless Steel', includedItems: ['Watch'] },
  { _id: '6', name: 'IWC Portugieser', slug: 'iwc-portugieser', brand: 'IWC', price: 780000, condition: 'New', stock: 2, images: [], sku: 'IWC-001', movement: 'Automatic', caseSize: 42, dial: 'White', caseMaterial: 'Stainless Steel', includedItems: ['Watch', 'Box', 'Papers'] },
];

const CONDITION_COLORS = {
  'New': 'bg-emerald-500/20 text-emerald-400',
  'Like New': 'bg-blue-500/20 text-blue-400',
  'Excellent': 'bg-[#C9A84C]/20 text-[#C9A84C]',
  'Good': 'bg-white/10 text-white/60',
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem       = useCartStore((s) => s.addItem);
  const toggleItem    = useWishlistStore((s) => s.toggleItem);
  const isWishlisted  = useWishlistStore((s) => product ? s.isWishlisted(product._id) : false);
  const titleRef = useRef(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Fetch product
    fetch(`${apiUrl}/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data._id) {
          setProduct(data);
          // Fetch related
          return fetch(`${apiUrl}/brands/${data.brand}/products?limit=4`);
        }
        throw new Error('Not found');
      })
      .then((r) => r?.json())
      .then((data) => {
        if (Array.isArray(data)) setRelatedProducts(data.filter((p) => p.slug !== slug).slice(0, 4));
      })
      .catch(() => {
        const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
        if (found) {
          setProduct(found);
          setRelatedProducts(MOCK_PRODUCTS.filter((p) => p.brand === found.brand && p.slug !== slug).slice(0, 4));
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // GSAP title reveal
  useEffect(() => {
    if (!product || !titleRef.current) return;
    let ctx;
    (async () => {
      const { gsap } = await import('@/lib/gsap-helpers');
      ctx = gsap.context(() => {
        gsap.from('.product-title-word', {
          y: 30,
          opacity: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power3.out',
        });
      }, titleRef);
    })();
    return () => { if (ctx) ctx.revert(); };
  }, [product]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0A0A0A] pt-16">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
              <div className="aspect-square bg-[#111111]" />
              <div className="space-y-4">
                <div className="h-4 bg-[#111111] rounded w-1/4" />
                <div className="h-10 bg-[#111111] rounded w-3/4" />
                <div className="h-8 bg-[#111111] rounded w-1/3" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0A0A0A] pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl text-white mb-4">Watch Not Found</h1>
            <a href="/shop" className="text-[#C9A84C] underline font-body">Browse all watches</a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const conditionClass = CONDITION_COLORS[product.condition] || 'bg-white/10 text-white/60';
  const isOutOfStock = product.stock === 0;
  const titleWords = product.name.split(' ');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16">
        {/* Breadcrumb */}
        <div className="border-b border-white/5 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <nav className="text-white/30 font-body text-sm flex items-center gap-2">
              <a href="/" className="hover:text-[#C9A84C] transition-colors">Home</a>
              <span>/</span>
              <a href="/shop" className="hover:text-[#C9A84C] transition-colors">Shop</a>
              <span>/</span>
              <span className="text-white/60">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Gallery */}
            <ProductGallery images={product.images} name={product.name} />

            {/* Details */}
            <div className="flex flex-col">
              {/* Brand */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-body font-semibold uppercase tracking-widest text-[#C9A84C] bg-[#C9A84C]/10 px-2.5 py-1 rounded-sm">
                  {product.brand}
                </span>
              </div>

              {/* Title */}
              <h1 ref={titleRef} className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                {titleWords.map((word, i) => (
                  <span key={i} className="product-title-word inline-block mr-2">
                    {word}
                  </span>
                ))}
              </h1>

              {/* SKU */}
              <p className="text-white/30 font-body text-sm mb-6">SKU: {product.sku}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-display text-4xl font-bold text-[#C9A84C]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-white/30 text-xl line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-emerald-400 text-sm font-body font-semibold">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { label: 'Movement', value: product.movement },
                  { label: 'Case Size', value: product.caseSize ? `${product.caseSize}mm` : '—' },
                  { label: 'Dial', value: product.dial || '—' },
                  { label: 'Material', value: product.caseMaterial || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#111111] border border-white/5 p-3">
                    <p className="text-white/30 text-xs font-body uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-white font-body text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>

              {/* Stock */}
              {!isOutOfStock && (
                <p className="text-emerald-400 text-sm font-body mb-4 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {product.stock} in stock — ready to ship
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                {/* Add to Cart + Wishlist row */}
                <div className="flex gap-3">
                  <button
                    onClick={() => addItem(product)}
                    disabled={isOutOfStock}
                    className={`flex-1 py-4 font-body font-semibold uppercase tracking-wider text-sm transition-colors ${
                      isOutOfStock
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : 'bg-[#C9A84C] text-black hover:bg-[#F5E6C3]'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  {/* Wishlist heart button */}
                  <button
                    onClick={() => toggleItem(product)}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    className={`
                      shrink-0 w-14 flex items-center justify-center border transition-all duration-300
                      ${
                        isWishlisted
                          ? 'bg-red-500/15 border-red-500/50 text-red-400 shadow-[0_0_16px_rgba(239,68,68,0.2)]'
                          : 'border-white/10 text-white/30 hover:border-red-400/50 hover:text-red-400 hover:bg-red-500/10'
                      }
                    `}
                  >
                    <svg
                      className="w-5 h-5 transition-transform duration-300 hover:scale-110"
                      fill={isWishlisted ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Wishlist status label */}
                {isWishlisted && (
                  <p className="text-red-400/70 font-body text-xs text-center flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Saved to your wishlist
                  </p>
                )}

                <WhatsAppCTA product={product} />
              </div>
            </div>
          </div>

          {/* Specs Accordion */}
          <div className="max-w-2xl mb-16">
            <SpecsAccordion product={product} />
          </div>

          {/* Related Watches */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-8">
                More from {product.brand}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
