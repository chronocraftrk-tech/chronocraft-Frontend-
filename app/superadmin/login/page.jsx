'use strict';

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('superadmin', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid SuperAdmin credentials.');
      } else {
        router.push('/superadmin/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#C9A84C]/5 rounded-full filter blur-[150px]" />
      
      <div className="max-w-md w-full space-y-8 bg-[#111111] border border-red-500/20 p-8 sm:p-10 relative z-10">
        <div>
          <div className="flex justify-center mb-4">
            <span className="text-red-400 font-display text-xs tracking-widest uppercase border border-red-500/30 px-3 py-1 rounded-sm">
              SaaS ROOT
            </span>
          </div>
          <h2 className="text-center font-display text-3xl font-extrabold text-white tracking-wider uppercase">
            Super Admin
          </h2>
          <p className="mt-2 text-center text-sm text-white/40 font-body">
            Chrono Craft SaaS Management Core
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 rounded-sm font-body">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">
                SuperAdmin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="superadmin@chronosvault.com"
              />
            </div>

            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-body font-semibold uppercase tracking-wider text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Decrypting Vault...' : 'Root Access'}
            </button>
          </div>
        </form>

        <div className="text-center pt-4">
          <Link href="/" className="text-white/30 hover:text-white font-body text-xs transition-colors uppercase tracking-wider">
            ← Return to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
