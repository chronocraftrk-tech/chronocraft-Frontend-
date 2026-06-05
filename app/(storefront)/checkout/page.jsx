'use strict';

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import useCartStore from '@/lib/store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentProvider, setPaymentProvider] = useState('whatsapp');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?redirect=checkout');
    }
  }, [authStatus, router]);

  // Pre-fill user data if available
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const token = session?.user?.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const orderPayload = {
      items,
      subtotal,
      discount: 0,
      total: subtotal,
      shippingAddress: {
        name,
        street,
        city,
        state,
        pincode,
        phone,
      },
      paymentProvider,
    };

    try {
      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order.');
      }

      // Success: Clear cart & trigger direct WhatsApp redirect with details
      clearCart();
      
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
      const itemsList = items.map((i) => `• ${i.name} (Qty: ${i.quantity}) - ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
      const waText = encodeURIComponent(`Hello! I would like to finalize my purchase from Chrono Craft:

📦 *Order Number:* ${data.order.orderNumber}
💰 *Total Value:* ₹${subtotal.toLocaleString('en-IN')}

🛒 *Items:*
${itemsList}

📍 *Shipping Address:*
Name: ${name}
Street: ${street}
City: ${city}, ${state} - ${pincode}
Phone: ${phone}

Please guide me with the payment options. Thank you!`);

      // Open WhatsApp chat in a new tab
      window.open(`https://wa.me/${whatsappNumber}?text=${waText}`, '_blank');

      // Navigate to order page
      router.push(`/orders/${data.order._id}`);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Navbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .checkout-item-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .checkout-item-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .checkout-item-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(201, 168, 76, 0.2);
          border-radius: 10px;
        }
        .checkout-item-list-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 168, 76, 0.4);
        }
      ` }} />
      <main className="min-h-screen bg-[#0A0A0A] pt-16 font-body text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left border-b border-white/5 pb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-white/40 text-sm mt-1">Please provide your shipping and payment preferences.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 rounded-sm mb-6">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              <div className="bg-[#111111] border border-white/5 p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold text-[#C9A84C] mb-4">
                  1. Shipping Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C] text-sm"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Street Address</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C] text-sm"
                      placeholder="Apartment, suite, unit, building, street..."
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C] text-sm"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C] text-sm"
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C] text-sm"
                      placeholder="400001"
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Contact Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C] text-sm"
                      placeholder="9999999999"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#111111] border border-white/5 p-6">
                <h2 className="font-display text-lg font-semibold text-[#C9A84C] mb-4">
                  2. Payment Process
                </h2>
                <p className="text-sm text-white/60 font-body leading-relaxed">
                  Due to the high value of luxury timepieces, payments are finalized directly with our private client advisor on WhatsApp. 
                  Once you confirm the order, you will be redirected to verify details and complete the transaction.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing Order...' : 'Confirm Order & Pay on WhatsApp'}
                </button>
              </div>
            </form>

            {/* Sidebar Review */}
            <div className="space-y-6">
              <div className="bg-[#111111] border border-white/5 p-6">
                <h2 className="font-display text-lg font-semibold border-b border-white/5 pb-4">
                  Review Selections
                </h2>

                {items.length === 0 ? (
                  <p className="text-white/30 text-sm py-4">No watches selected.</p>
                ) : (
                  <div className="divide-y divide-white/5 max-h-60 overflow-y-auto mb-4 pr-3 checkout-item-list-scroll">
                    {items.map((item) => (
                      <div key={item.id} className="py-3 flex justify-between gap-3 text-sm font-body">
                        <div>
                          <p className="font-semibold text-white/80">{item.name}</p>
                          <p className="text-white/30 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-[#C9A84C]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-white/10 pt-4 space-y-2 text-sm text-white/40 font-body">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-emerald-400 font-semibold uppercase text-xs">Complimentary</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-display text-white text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#C9A84C]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
