'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import useCartStore from '@/lib/store/cartStore';
import useWishlistStore from '@/lib/store/wishlistStore';

export default function Navbar({ hideMobileMenu = false }) {
  const { data: session } = useSession();
  const cartItems      = useCartStore((s) => s.items);
  const wishlistItems  = useWishlistStore((s) => s.items);
  const cartCount      = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistCount  = wishlistItems.length;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Home',    href: '/' },
    { label: 'Shop',    href: '/shop' },
    { label: 'Brands',  href: '/brands' },
    { label: 'About',   href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* ── Desktop + Mobile top bar ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-[#C9A84C]/15 transition-all duration-300"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">

            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger */}
              {!hideMobileMenu && (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden text-white/70 hover:text-[#C9A84C] focus:outline-none p-1 transition-colors duration-300"
                  aria-label="Open navigation menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {/* Logo */}
              <Link
                href="/"
                className="flex items-center hover:scale-105 transition-transform duration-300"
              >
                <Image 
                  src="/images/image.png" 
                  alt="Chrono Craft Logo" 
                  width={200} 
                  height={200} 
                  className="w-auto h-14 md:h-16 lg:h-20 object-contain py-1" 
                  priority
                />
              </Link>
            </div>

            {/* Centre: desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ label, href, isWishlist }) => (
                <Link
                  key={label}
                  href={href}
                  className="group relative flex items-center gap-1.5 text-sm text-white/80 hover:text-[#C9A84C] transition-colors uppercase tracking-wider py-1.5"
                >
                  {isWishlist && (
                    <svg className="w-3.5 h-3.5" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                  {label}
                  {isWishlist && wishlistCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center -mt-2 -ml-1">
                      {wishlistCount}
                    </span>
                  )}
                  {/* Underline hover */}
                  <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#C9A84C] group-hover:w-full group-hover:left-0 transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-4 sm:gap-6">

              {/* Wishlist icon */}
              <Link
                href="/account?tab=Wishlist"
                className="relative text-white/70 hover:text-[#C9A84C] hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label="Wishlist"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-white/70 hover:text-[#C9A84C] hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label="Cart"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:block text-white/70 hover:text-[#25D366] hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label="Chat on WhatsApp"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>

              {/* Account avatar */}
              <Link
                href={session ? '/account' : '/login'}
                className="group relative flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label={session ? 'My Account' : 'Login'}
              >
                {session?.user?.name ? (
                  <>
                    <span className="absolute inset-0 rounded-full bg-[#C9A84C]/20 scale-0 group-hover:scale-125 transition-transform duration-300" />
                    <span className="relative w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-lg shadow-[#C9A84C]/20 border border-[#C9A84C]/60">
                      <span className="font-display text-black font-bold text-sm leading-none select-none uppercase">
                        {session.user.name.charAt(0)}
                      </span>
                    </span>
                  </>
                ) : (
                  <svg className="h-6 w-6 text-white/70 group-hover:text-[#C9A84C] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-500 md:hidden ${
          isMobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 z-[110] bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />

        {/* Sidebar panel */}
        <div
          className={`absolute top-0 left-0 bottom-0 z-[120] w-72 max-w-[85vw] border-r border-[#C9A84C]/20 flex flex-col shadow-2xl transition-transform duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: '#080808', isolation: 'isolate' }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#C9A84C]/10">
            <Image 
              src="/images/image.png" 
              alt="Chrono Craft Logo" 
              width={500} 
              height={500} 
              className="w-auto h-[50px] object-contain" 
            />
            <button
              onClick={closeMenu}
              className="text-white/50 hover:text-[#C9A84C] focus:outline-none transition-all duration-300 hover:rotate-90"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-6 py-8 space-y-1">
            {navLinks.map(({ label, href, isWishlist }) => (
              <Link
                key={label}
                href={href}
                onClick={closeMenu}
                className="flex items-center justify-between group py-3 px-4 rounded-sm hover:bg-[#C9A84C]/5 border border-transparent hover:border-[#C9A84C]/10 transition-all duration-200"
              >
                <span className="flex items-center gap-3 font-display text-base text-white/80 group-hover:text-[#C9A84C] uppercase tracking-widest transition-colors duration-200">
                  {/* Icon per link */}
                  {label === 'Home' && (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {label === 'Shop' && (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                  {label === 'Brands' && (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )}
                  {label === 'About' && (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {label === 'Contact' && (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {isWishlist && (
                    <svg className="w-4 h-4 shrink-0" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                  {label}
                </span>
                {/* Wishlist count badge */}
                {isWishlist && wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
                {/* Arrow */}
                <svg className="w-4 h-4 text-white/20 group-hover:text-[#C9A84C]/50 transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </nav>

          {/* Drawer footer */}
          <div className="px-6 py-5 border-t border-[#C9A84C]/10">
            <p className="font-display text-[10px] text-[#C9A84C] tracking-widest uppercase mb-1">Premium Luxury Watches</p>
            <p className="text-white/30 font-body text-[10px] leading-relaxed">
              India&apos;s premier luxury watch destination.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
