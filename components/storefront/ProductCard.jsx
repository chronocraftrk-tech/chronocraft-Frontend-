'use client';

import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '@/lib/store/cartStore';
import useWishlistStore from '@/lib/store/wishlistStore';

const BRAND_FALLBACK_IMAGES = {
  'rolex': '/images/rolex-submariner.png',
  'omega': '/images/omega-seamaster.png',
  'patek philippe': '/images/patek-calatrava.png',
  'audemars piguet': '/images/ap-royal-oak.png',
  'cartier': '/images/cartier-santos.png',
  'iwc': '/images/iwc-portugieser.png',
};

export default function ProductCard({ product }) {
  const addItem       = useCartStore((s) => s.addItem);
  const toggleItem    = useWishlistStore((s) => s.toggleItem);
  const isWishlisted  = useWishlistStore((s) => s.isWishlisted(product._id));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  // Only explicitly 0 means out of stock — undefined/null means stock info missing → treat as in stock
  const isOutOfStock = product.stock === 0;


  const fallbackUrl = BRAND_FALLBACK_IMAGES[product.brand?.toLowerCase()] || null;
  const imageUrl    = product.images?.length > 0 ? product.images[0] : fallbackUrl;

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="bg-[#111111]/90 backdrop-blur-[2px] border border-white/[0.05] group-hover:border-[#C9A84C]/40 group-hover:shadow-[0_8px_30px_rgba(201,168,76,0.06)] hover:-translate-y-1 transition-all duration-500 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square bg-[#171717] overflow-hidden">
          {imageUrl ? (
            imageUrl.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#C9A84C]/20" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="50" cy="50" r="35" />
                <circle cx="50" cy="50" r="26" />
                <line x1="50" y1="22" x2="50" y2="30" />
                <line x1="50" y1="70" x2="50" y2="78" />
                <line x1="22" y1="50" x2="30" y2="50" />
                <line x1="70" y1="50" x2="78" y2="50" />
                <line x1="50" y1="50" x2="50" y2="34" strokeWidth="2" />
                <line x1="50" y1="50" x2="60" y2="50" strokeWidth="2" />
              </svg>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* ── Wishlist heart button ── */}
          <button
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`
              absolute top-3 right-3 z-10
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isWishlisted
                ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] scale-110'
                : 'bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-black/70'
              }
            `}
          >
            <svg
              className={`w-4 h-4 transition-colors duration-200 ${isWishlisted ? 'text-white' : 'text-white/70'}`}
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 border-t border-white/[0.03]">
          {/* Brand */}
          <span className="inline-block text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#C9A84C] bg-[#C9A84C]/5 border border-[#C9A84C]/20 px-2 py-0.5 rounded-sm mb-3">
            {product.brand}
          </span>
          {/* Name */}
          <h3 className="font-display text-white text-base font-medium leading-snug mb-3 line-clamp-2 group-hover:text-[#C9A84C] transition-colors duration-300">
            {product.name}
          </h3>

          {/* Price Row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-display text-white font-bold text-lg">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-white/30 text-xs line-through ml-2">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] font-body text-white/40 uppercase tracking-wider">
              {product.movement}
            </span>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3 text-xs font-body font-semibold uppercase tracking-widest transition-all duration-300 border ${
              isOutOfStock
                ? 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                : 'border-[#C9A84C] text-[#C9A84C] bg-transparent hover:bg-[#C9A84C] hover:text-black hover:shadow-[0_4px_15px_rgba(201,168,76,0.25)]'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Enquire & Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
