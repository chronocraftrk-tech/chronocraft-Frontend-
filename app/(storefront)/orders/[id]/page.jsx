'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import OrderTimeline from '@/components/storefront/OrderTimeline';
import Image from 'next/image';

const MOCK_ORDER = {
  _id: 'mock-order-001',
  orderNumber: 'CVT-123456',
  status: 'shipped',
  paymentStatus: 'paid',
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  items: [
    {
      productId: '1',
      name: 'Rolex Submariner Date',
      sku: 'ROL-001',
      price: 850000,
      quantity: 1,
      image: '',
    },
  ],
  subtotal: 850000,
  discount: 0,
  total: 850000,
  shippingAddress: {
    name: 'Demo Customer',
    line1: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  statusHistory: [
    { status: 'pending', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { status: 'confirmed', timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() },
    { status: 'processing', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { status: 'shipped', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  ],
};

const STATUS_BADGE = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-[#C9A84C]/20 text-[#C9A84C]',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { data: session, status: authStatus } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authStatus === 'loading') return;

    if (!session) {
      // Show demo order for unauthenticated users
      setOrder(MOCK_ORDER);
      setLoading(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/orders/${id}`, {
      headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Order not found');
        return r.json();
      })
      .then((data) => setOrder(data))
      .catch((err) => {
        setError(err.message);
        setOrder(MOCK_ORDER); // fallback to mock
      })
      .finally(() => setLoading(false));
  }, [id, session, authStatus]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[#111111] rounded w-1/3" />
              <div className="h-64 bg-[#111111] rounded" />
            </div>
          ) : !session && !order ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-white mb-4">Please log in to track your order</p>
              <a href="/api/auth/signin" className="text-[#C9A84C] underline font-body">Sign In</a>
            </div>
          ) : order ? (
            <div>
              {/* Header */}
              <div className="mb-8">
                {!session && (
                  <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] font-body text-sm px-4 py-3 rounded-sm mb-6">
                    Showing demo order. <a href="/api/auth/signin" className="underline">Sign in</a> to view your real orders.
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-1">
                      Order #{order.orderNumber}
                    </h1>
                    <p className="text-white/40 font-body text-sm">
                      Placed on {order?.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-body font-semibold uppercase tracking-wider px-3 py-1.5 rounded-sm ${STATUS_BADGE[order.status] || 'bg-white/10 text-white/60'}`}>
                      {order.status}
                    </span>
                    <span className={`text-xs font-body font-semibold uppercase tracking-wider px-3 py-1.5 rounded-sm ${order.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline */}
                <div className="lg:col-span-1">
                  <div className="bg-[#111111] border border-white/5 p-6">
                    <h2 className="font-display text-white text-lg font-semibold mb-6">
                      Order Progress
                    </h2>
                    <OrderTimeline status={order.status} statusHistory={order.statusHistory} />
                  </div>
                </div>

                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Items */}
                  <div className="bg-[#111111] border border-white/5 p-6">
                    <h2 className="font-display text-white text-lg font-semibold mb-5">
                      Order Items
                    </h2>
                    <div className="space-y-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-[#1A1A1A] border border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} width={64} height={64} className="object-contain" />
                            ) : (
                              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#C9A84C]/20" fill="none" stroke="currentColor" strokeWidth="1">
                                <circle cx="12" cy="12" r="9" />
                                <circle cx="12" cy="12" r="6" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-white text-sm font-semibold truncate">{item.name}</p>
                            <p className="text-white/30 font-body text-xs">SKU: {item.sku} · Qty: {item.quantity}</p>
                          </div>
                          <p className="font-display text-[#C9A84C] font-semibold shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp Payment CTA */}
                  {order.paymentProvider === 'whatsapp' && (
                    <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 p-6 space-y-4">
                      <h2 className="font-display text-white text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-400 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.338 5.393 0 11.948 0c3.179.001 6.167 1.24 8.414 3.487 2.246 2.248 3.483 5.238 3.482 8.417-.003 6.554-5.337 11.892-11.893 11.892-1.997-.001-3.961-.504-5.7-1.466L0 24zm6.59-3.559c1.658.983 3.284 1.503 4.966 1.504 5.362 0 9.724-4.362 9.726-9.728a9.66 9.66 0 00-2.839-6.883 9.66 9.66 0 00-6.88-2.838c-5.366 0-9.73 4.364-9.732 9.73 0 1.83.498 3.518 1.442 4.981l-.995 3.633 3.717-.969zm10.222-7.02c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                        </svg>
                        Complete Payment
                      </h2>
                      <p className="text-white/60 text-sm font-body leading-relaxed">
                        To finalize transaction of this luxury watch, please send order confirmation to our private concierge desk.
                      </p>
                      <a
                        href={`https://wa.me/919999999999?text=Hello%21+I+would+like+to+discuss+payment+for+Order+%23${order.orderNumber}+(${order.items.map((i)=>i.name).join(', ')})+for+a+total+of+₹${order.total.toLocaleString('en-IN')}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 py-4 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        Talk & Pay on WhatsApp
                      </a>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-[#111111] border border-white/5 p-6">
                    <h2 className="font-display text-white text-lg font-semibold mb-5">
                      Order Summary
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between text-white/60 font-body text-sm">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-body text-sm">
                          <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                          <span>−₹{order.discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-3 flex justify-between font-display text-white text-lg font-bold">
                        <span>Total</span>
                        <span className="text-[#C9A84C]">₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="bg-[#111111] border border-white/5 p-6">
                      <h2 className="font-display text-white text-lg font-semibold mb-3">
                        Shipping Address
                      </h2>
                      <address className="not-italic text-white/50 font-body text-sm leading-relaxed">
                        {order.shippingAddress.name}<br />
                        {order.shippingAddress.street || order.shippingAddress.line1}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                      </address>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-white">Order not found</p>
              <a href="/account" className="mt-4 block text-[#C9A84C] underline font-body">View my orders</a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
