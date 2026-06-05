'use strict';

'use client';

import { useState } from 'react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate contact form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16 font-body text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12 text-center border-b border-white/5 pb-8">
            <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest border border-[#C9A84C]/30 px-3 py-1 rounded-sm">
              Get In Touch
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-4">Contact Showroom</h1>
            <p className="text-white/40 text-sm mt-2">Connect with our private client advisors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Info list */}
            <div className="space-y-6 md:col-span-1">
              <div className="bg-[#111111] border border-white/5 p-6">
                <h3 className="font-display text-[#C9A84C] text-sm uppercase tracking-wider mb-2 font-bold">Showroom Address</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Chrono Craft Luxury Suites<br />
                  Level 4, Bandra Kurla Complex<br />
                  Mumbai, MH 400051
                </p>
              </div>

              <div className="bg-[#111111] border border-white/5 p-6">
                <h3 className="font-display text-[#C9A84C] text-sm uppercase tracking-wider mb-2 font-bold">Email Contacts</h3>
                <p className="text-white/60 text-sm hover:text-[#C9A84C] transition-colors">
                  <a href="mailto:concierge@chronosvault.com">concierge@chronosvault.com</a>
                </p>
                <p className="text-white/30 text-xs mt-1">Response time: &lt; 4 hours</p>
              </div>

              <div className="bg-[#111111] border border-white/5 p-6">
                <h3 className="font-display text-[#C9A84C] text-sm uppercase tracking-wider mb-2 font-bold">WhatsApp Concierge</h3>
                <p className="text-white/60 text-sm">
                  <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                    +91 99999 99999
                  </a>
                </p>
                <p className="text-white/30 text-xs mt-1">Available 24/7 for VIP advisors</p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <div className="bg-[#111111] border border-white/5 p-8">
                <h2 className="font-display text-xl font-semibold mb-6">Send A Message</h2>

                {submitted && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm py-4 px-4 rounded-sm mb-6 font-body">
                    Thank you! Your message has been sent. A private concierge representative will contact you shortly.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-sm font-body">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C]"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C]"
                      placeholder="e.g. Sourcing request for Rolex Daytona"
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C]"
                      placeholder="Specify watch SKU, references, or details..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Sending message...' : 'Submit Inquiry'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
