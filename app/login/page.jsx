'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useCartStore from '@/lib/store/cartStore';

const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '6a1e8ec2a16ad059eb1c64ae';

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// tabs: 'signin' | 'register'
// mode (inside signin): 'customer' | 'admin'
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems } = useCartStore();

  const [tab, setTab] = useState('signin');

  const isFromCheckout = searchParams.get('redirect') === 'checkout' || cartItems.length > 0;

  useEffect(() => {
    if (isFromCheckout) setTab('register');
  }, [isFromCheckout]);

  // Shared fields
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [loading, setLoading]         = useState(false);

  // Register-only
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setPhone('');
    setError(''); setSuccess(''); setShowPassword(false);
  };

  const switchTab = (t) => { setTab(t); resetForm(); };

  // ── Smart Sign In: tries customer first, then admin ────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Try customer login first
      const customerRes = await signIn('customer', {
        email, password, tenantId: DEFAULT_TENANT_ID, redirect: false,
      });
      if (!customerRes?.error) {
        router.push('/');
        router.refresh();
        return;
      }
      // Fallback: try admin login
      const adminRes = await signIn('admin', { email, password, redirect: false });
      if (!adminRes?.error) {
        router.push('/admin/dashboard');
        router.refresh();
        return;
      }
      setError('Invalid email or password.');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ── Customer Register ──────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${apiUrl}/auth/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': DEFAULT_TENANT_ID },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed.');
      } else {
        const loginRes = await signIn('customer', {
          email, password, tenantId: DEFAULT_TENANT_ID, redirect: false,
        });
        if (loginRes?.error) {
          setSuccess('Account created! Please sign in.');
          switchTab('signin');
        } else {
          router.push('/');
          router.refresh();
        }
      }
    } catch {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-white/20';
  const labelCls = 'block text-[10px] font-body uppercase tracking-widest text-white/40 mb-2';

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <p className="text-[#C9A84C] text-[10px] font-body uppercase tracking-[0.4em] mb-3">
            Chrono Craft
          </p>
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-white/10 text-xs">◆</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-white/5 p-8 sm:p-10">

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-extrabold text-white tracking-wider uppercase">
              {tab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-1.5 text-white/30 text-xs font-body">
              {tab === 'signin' ? 'Access your Chrono Craft account' : 'Join the Chrono Craft membership'}
            </p>
          </div>

          {/* Tab pills */}
          <div className="flex mb-6 border-b border-white/10">
            {[{ id: 'signin', label: 'Sign In' }, { id: 'register', label: 'Create Account' }].map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`flex-1 py-2.5 text-center font-body text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  tab === t.id
                    ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] -mb-px'
                    : 'text-white/25 hover:text-white/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-3 px-4 font-body">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3 px-4 font-body">
              {success}
            </div>
          )}

          {/* ── Sign In Form ── */}
          {tab === 'signin' && (
            <form className="space-y-5" onSubmit={handleLogin}>
              {isFromCheckout && (
                <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-white/80 text-xs py-3 px-4 font-body text-center space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-semibold">Checkout Tip</p>
                  <p>New to Chrono Craft? Please create an account first.</p>
                  <button type="button" onClick={() => switchTab('register')}
                    className="text-[#C9A84C] hover:text-[#F5E6C3] underline transition-colors text-xs uppercase tracking-wider font-semibold">
                    Create an Account →
                  </button>
                </div>
              )}
              <div>
                <label className={labelCls}>Email Address</label>
                <input id="signin-email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls} placeholder="name@example.com" />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input id="signin-password" type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-11`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-[#C9A84C] transition-colors" tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-[11px] font-body text-white/25 hover:text-[#C9A84C] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <button id="signin-submit" type="submit" disabled={loading}
                className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-widest text-xs hover:bg-[#F5E6C3] transition-colors disabled:opacity-50">
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── Register Form ── */}
          {tab === 'register' && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className={labelCls}>Full Name</label>
                <input id="register-name" type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls} placeholder="John Doe" />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input id="register-email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls} placeholder="name@example.com" />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input id="register-phone" type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls} placeholder="9999999999" />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input id="register-password" type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-11`} placeholder="Minimum 8 characters" minLength={8} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-[#C9A84C] transition-colors" tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
              <button id="register-submit" type="submit" disabled={loading}
                className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-widest text-xs hover:bg-[#F5E6C3] transition-colors disabled:opacity-50 mt-2">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}


        </div>

        {/* Footer link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/20 hover:text-white/50 font-body text-[11px] transition-colors uppercase tracking-widest">
            ← Return to Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
