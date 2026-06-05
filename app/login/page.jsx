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

// tabs: 'signin' | 'register' | 'admin' | 'superadmin'
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems } = useCartStore();
  const [tab, setTab] = useState('signin');

  const isFromCheckout = searchParams.get('redirect') === 'checkout' || cartItems.length > 0;

  useEffect(() => {
    if (isFromCheckout) {
      setTab('register');
    }
  }, [isFromCheckout]);

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Register-only fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const switchTab = (t) => {
    setTab(t);
    resetForm();
  };

  // ── Customer Sign In ──────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('customer', {
        email,
        password,
        tenantId: DEFAULT_TENANT_ID,
        redirect: false,
      });
      if (res?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/account');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ── Customer Register ─────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${apiUrl}/auth/customer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': DEFAULT_TENANT_ID,
        },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed.');
      } else {
        const loginRes = await signIn('customer', {
          email,
          password,
          tenantId: DEFAULT_TENANT_ID,
          redirect: false,
        });
        if (loginRes?.error) {
          setSuccess('Registration successful! Please sign in.');
          switchTab('signin');
        } else {
          router.push('/account');
          router.refresh();
        }
      }
    } catch {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // ── Admin Sign In ─────────────────────────────────────────────────────────
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('admin', { email, password, redirect: false });
      if (res?.error) {
        setError('Invalid administrative credentials.');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ── Tab config ────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'signin',   label: 'Sign In' },
    { id: 'register', label: 'Register' },
    { id: 'admin',    label: 'Admin' },
  ];

  const isAdmin = tab === 'admin';

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full filter blur-[100px]" />

      <div className="max-w-md w-full space-y-8 bg-[#111111] border border-white/5 p-8 sm:p-10 relative z-10"
        style={{ borderColor: isAdmin ? 'rgba(201,168,76,0.2)' : undefined }}
      >
        {/* Header */}
        <div>
          {isAdmin && (
            <div className="flex justify-center mb-3">
              <span className="text-[#C9A84C] font-display text-xs tracking-widest uppercase border border-[#C9A84C]/30 px-3 py-1">
                Vault CMS
              </span>
            </div>
          )}
          {!isAdmin && (
            <p className="text-center text-[#C9A84C] text-xs font-body uppercase tracking-[0.3em] mb-2">
              Chrono Craft
            </p>
          )}
          <h2 className="text-center font-display text-3xl font-extrabold text-white tracking-wider uppercase">
            {tab === 'signin'   && 'Sign In'}
            {tab === 'register' && 'Register'}
            {tab === 'admin'    && 'Store Admin'}
          </h2>
          <p className="mt-2 text-center text-sm text-white/40 font-body">
            {tab === 'signin'   && 'Access your luxury vault account'}
            {tab === 'register' && 'Join Chrono Craft membership'}
            {tab === 'admin'    && 'Manage your luxury reseller platform'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex-1 py-2 text-center font-body text-xs font-semibold uppercase tracking-wider transition-colors
                ${tab === t.id
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                  : 'text-white/30 hover:text-white/60'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 rounded-sm font-body">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm py-3 px-4 rounded-sm font-body">
            {success}
          </div>
        )}

        {/* ── Sign In Form ── */}
        {tab === 'signin' && (
          <form className="mt-4 space-y-6" onSubmit={handleLogin}>
            {isFromCheckout && (
              <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-white/90 text-xs py-3.5 px-4 rounded-sm font-body text-center space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-semibold">Checkout Recommendation</p>
                <p>New to Chrono Craft? Please register your account first to proceed to checkout.</p>
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="mt-1 text-xs text-[#C9A84C] hover:text-[#F5E6C3] underline transition-colors uppercase tracking-wider font-semibold block w-full text-center"
                >
                  Create an Account
                </button>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  placeholder="name@example.com" />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 pr-11 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#C9A84C] transition-colors" tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs font-body text-white/30 hover:text-[#C9A84C] transition-colors">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── Register Form ── */}
        {tab === 'register' && (
          <form className="mt-4 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  placeholder="name@example.com" />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">Phone Number</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  placeholder="9999999999" />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 pr-11 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                    placeholder="Minimum 8 characters" minLength={8} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#C9A84C] transition-colors" tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        {/* ── Admin Form ── */}
        {tab === 'admin' && (
          <form className="mt-4 space-y-6" onSubmit={handleAdminLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">Admin Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  placeholder="admin@chronosvault.com" />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 pr-11 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#C9A84C] transition-colors" tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors disabled:opacity-50">
              {loading ? 'Entering Vault...' : 'Access Console'}
            </button>
          </form>
        )}

        <div className="text-center pt-4">
          <Link href="/" className="text-white/30 hover:text-white font-body text-xs transition-colors uppercase tracking-wider">
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
