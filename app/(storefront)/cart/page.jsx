'use strict';

'use client';

import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import useCartStore from '@/lib/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16 font-body text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Shopping Bag</h1>
            <p className="text-white/40 text-sm mt-2">Verify your luxury selections before checkout.</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-[#111111] border border-white/5 p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#C9A84C]/20 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-white/40 text-lg">Your shopping bag is empty.</p>
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center justify-center px-8 py-3 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] transition-colors"
              >
                Browse Watch Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Item List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-[#111111] border border-white/5 p-5 flex items-center gap-5 relative group">
                    {/* Image */}
                    <div className="w-20 h-20 bg-[#1A1A1A] border border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="object-contain w-full h-full" />
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#C9A84C]/20" fill="none" stroke="currentColor" strokeWidth="1">
                          <circle cx="12" cy="12" r="9" />
                          <circle cx="12" cy="12" r="6" />
                        </svg>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm sm:text-base truncate hover:text-[#C9A84C] transition-colors">
                        <Link href={`/shop/${item.slug}`}>{item.name}</Link>
                      </h3>
                      <p className="text-white/30 text-xs mt-1">SKU: {item.sku}</p>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-white/10 bg-[#1A1A1A]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-white/50 hover:text-white transition-colors"
                          >
                            −
                          </button>
                          <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-white/50 hover:text-white transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-400/70 hover:text-red-400 underline font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-[#C9A84C]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      <p className="text-white/20 text-xs mt-1">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={clearCart}
                    className="text-xs text-white/30 hover:text-white underline tracking-wider uppercase font-semibold transition-colors"
                  >
                    Clear All items
                  </button>
                  <Link href="/shop" className="text-xs text-[#C9A84C] hover:underline uppercase tracking-wider font-semibold">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#111111] border border-white/5 p-6 h-fit space-y-6">
                <h2 className="font-display text-lg font-semibold border-b border-white/5 pb-4">
                  Summary
                </h2>

                <div className="space-y-3 font-body text-sm text-white/60">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-emerald-400 font-semibold uppercase text-xs">Complimentary</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span className="text-emerald-400 font-semibold uppercase text-xs">Fully Insured</span>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex justify-between font-display text-white text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#C9A84C]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/checkout"
                    className="w-full py-4 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] flex items-center justify-center transition-colors"
                  >
                    Proceed to checkout
                  </Link>
                  <p className="text-[10px] text-white/20 text-center mt-3 font-body">
                    By proceeding, you agree to our terms of service. All watches are certified authentic.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
