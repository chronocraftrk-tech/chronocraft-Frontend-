'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import useWishlistStore from '@/lib/store/wishlistStore';
import useCartStore from '@/lib/store/cartStore';

const STATUS_BADGE = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  confirmed:  'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped:    'bg-[#C9A84C]/20 text-[#C9A84C]',
  delivered:  'bg-emerald-500/20 text-emerald-400',
  cancelled:  'bg-red-500/20 text-red-400',
};

const NAV_ITEMS = [
  {
    key: 'Profile',
    label: 'Profile',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: 'Orders',
    label: 'My Orders',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    key: 'Wishlist',
    label: 'Wishlist',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    key: 'Security',
    label: 'Security',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    key: 'Home',
    label: 'Back to Home',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];

function AccountPageInner() {
  const { data: session, status: authStatus } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('Profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock scroll on body when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Profile states
  const [editing, setEditing]           = useState(false);
  const [profileName, setProfileName]   = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savedProfile, setSavedProfile] = useState({ name: '', email: '', phone: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError]     = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [saving, setSaving]                 = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError]     = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Orders
  const [orders, setOrders]             = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Wishlist / Cart
  const wishlistItems  = useWishlistStore((s) => s.items);
  const removeWishlist = useWishlistStore((s) => s.removeItem);
  const clearWishlist  = useWishlistStore((s) => s.clearWishlist);
  const addToCart      = useCartStore((s) => s.addItem);
  const clearCart      = useCartStore((s) => s.clearCart);

  const handleSignOut = () => {
    clearWishlist();
    clearCart();
    signOut({ callbackUrl: '/' });
  };

  // URL query param → section
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && NAV_ITEMS.find((n) => n.key === tab)) setActiveSection(tab);
  }, [searchParams]);

  // Reset on user change
  useEffect(() => {
    setOrders(null);
    setProfileName('');
    setProfileEmail('');
    setProfilePhone('');
    setSavedProfile({ name: '', email: '', phone: '' });
    setLoadingProfile(true);
  }, [session?.user?.id]);

  // Fetch profile + orders
  useEffect(() => {
    if (!session?.user?.accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token  = session.user.accessToken;

    setOrdersLoading(true);
    fetch(`${apiUrl}/customers/me/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));

    fetch(`${apiUrl}/auth/customer/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          const d = { name: data.user.name || '', email: data.user.email || '', phone: data.user.phone || '' };
          setProfileName(d.name); setProfileEmail(d.email); setProfilePhone(d.phone);
          setSavedProfile(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [session]);

  const handleToggleEdit = () => {
    if (editing) {
      setProfileName(savedProfile.name);
      setProfileEmail(savedProfile.email);
      setProfilePhone(savedProfile.phone);
    }
    setEditing(!editing);
    setProfileError(''); setProfileSuccess('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError(''); setProfileSuccess('');
    setSaving(true);
    const token = session?.user?.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${apiUrl}/auth/customer/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profileName, email: profileEmail, phone: profilePhone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setProfileError(data.message || 'Failed to update profile.');
      } else {
        setProfileSuccess('Profile updated successfully.');
        setEditing(false);
        const u = { name: data.user?.name || profileName, email: data.user?.email || profileEmail, phone: data.user?.phone || profilePhone };
        setProfileName(u.name); setProfileEmail(u.email); setProfilePhone(u.phone);
        setSavedProfile(u);
      }
    } catch { setProfileError('An error occurred while updating profile.'); }
    finally { setSaving(false); }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError(''); setPasswordSuccess('');
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match.'); return; }
    setUpdatingPassword(true);
    const token = session?.user?.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${apiUrl}/auth/customer/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPasswordError(data.message || 'Failed to update password.');
      } else {
        setPasswordSuccess('Password updated successfully.');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      }
    } catch { setPasswordError('An error occurred while updating password.'); }
    finally { setUpdatingPassword(false); }
  };

  const navigate = (key) => {
    if (key === 'Home') {
      router.push('/');
      return;
    }
    setActiveSection(key);
    setSidebarOpen(false);
  };

  // ── Loading / unauthed states ──────────────────────────────────────────────
  if (authStatus === 'loading') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0A0A0A] pt-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0A0A0A] pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-white mb-4">My Account</h1>
            <p className="text-white/40 font-body mb-6">Please sign in to access your account.</p>
            <a href="/api/auth/signin"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors">
              Sign In
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const user = session.user;
  const initials = (user.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <Navbar hideMobileMenu={true} />
      <main className="min-h-screen bg-[#0A0A0A] pt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">

          {/* ── Mobile header bar ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8 md:hidden">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex items-center gap-2 border border-white/10 px-4 py-2.5 text-white/60 hover:text-white hover:border-[#C9A84C]/40 transition-colors font-body text-xs uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menu
            </button>
            <div className="text-right">
              <h1 className="font-display text-2xl font-bold text-white tracking-wide">My Account</h1>
              <p className="text-white/40 font-body text-xs mt-1">{user.name || 'Customer'}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-10 lg:gap-12 items-start">

            {/* ── Sidebar ───────────────────────────────────────────────────── */}
            <aside className={`
              fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none md:block shrink-0 md:z-auto
              transition-all duration-300
              ${sidebarOpen ? 'block' : 'hidden md:block'}
            `}
              onClick={(e) => { if (e.target === e.currentTarget) setSidebarOpen(false); }}
            >
              <div className="w-72 md:w-64 h-full md:h-auto bg-[#111111] border-r border-white/5 md:border md:border-white/5 mr-auto md:ml-0 flex flex-col md:sticky md:top-28 shadow-xl shadow-black/30">

                {/* Avatar block */}
                <div className="p-6 border-b border-white/5 relative">
                  {/* Close button for mobile */}
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="absolute right-4 top-4 text-white/40 hover:text-white md:hidden transition-colors"
                    aria-label="Close menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center shrink-0 shadow-lg shadow-[#C9A84C]/10">
                      <span className="text-black font-display font-bold text-base">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-display font-semibold text-sm truncate">{user.name || 'Customer'}</p>
                      <p className="text-white/40 font-body text-xs truncate mt-0.5">{user.email || ''}</p>
                      <span className="inline-block mt-1.5 text-[9px] font-body uppercase tracking-[0.2em] text-[#C9A84C] border border-[#C9A84C]/30 px-2 py-0.5">
                        Member
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 p-3 space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const active = activeSection === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => navigate(item.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group relative
                          ${active
                            ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25'
                            : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C9A84C] rounded-r" />
                        )}
                        <span className={`transition-colors ${active ? 'text-[#C9A84C]' : 'text-white/20 group-hover:text-white/60'}`}>
                          {item.icon}
                        </span>
                        <span className="font-body text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                        {item.key === 'Wishlist' && wishlistItems.length > 0 && (
                          <span className="ml-auto text-[10px] bg-[#C9A84C] text-black font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {wishlistItems.length}
                          </span>
                        )}
                        {item.key === 'Orders' && orders && orders.length > 0 && (
                          <span className="ml-auto text-[10px] bg-white/10 text-white/60 font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {orders.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Sign out */}
                <div className="p-4 border-t border-white/5">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 border border-transparent hover:border-red-500/10 font-body text-xs uppercase tracking-wider font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </aside>

            {/* ── Main content panel ────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Section heading */}
              <div className="mb-8 hidden md:block">
                <p className="text-[#C9A84C] text-[10px] font-body uppercase tracking-[0.3em] mb-2">My Account</p>
                <h1 className="font-display text-3xl font-bold text-white uppercase tracking-wider">
                  {NAV_ITEMS.find((n) => n.key === activeSection)?.label}
                </h1>
                <div className="mt-4 w-10 h-px bg-[#C9A84C]" />
              </div>

              {/* ── PROFILE ──────────────────────────────────────────────── */}
              {activeSection === 'Profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Personal info */}
                  <div className="bg-[#111111] border border-white/5 p-8 lg:col-span-7">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-white">Personal Information</h2>
                      <button onClick={handleToggleEdit} className="text-[#C9A84C] font-body text-xs uppercase tracking-wider font-semibold hover:text-[#F5E6C3] transition-colors">
                        {editing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    {loadingProfile ? (
                      <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        {profileError && (
                          <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs py-3.5 px-4 font-body mb-6 text-center">{profileError}</div>
                        )}
                        {profileSuccess && (
                          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs py-3.5 px-4 font-body mb-6 text-center">{profileSuccess}</div>
                        )}
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                          {[
                            { label: 'Full Name', type: 'text', value: profileName, setter: setProfileName, placeholder: '' },
                            { label: 'Email Address', type: 'email', value: profileEmail, setter: setProfileEmail, placeholder: '' },
                            { label: 'Phone Number', type: 'tel', value: profilePhone, setter: setProfilePhone, placeholder: '+91 99999 99999' },
                          ].map(({ label, type, value, setter, placeholder }) => (
                            <div key={label}>
                              <label className="block text-white/30 text-[10px] font-body uppercase tracking-[0.2em] mb-2">{label}</label>
                              <input
                                type={type}
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                                readOnly={!editing}
                                placeholder={placeholder}
                                className={`w-full bg-[#0A0A0A] border font-body text-sm px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none transition-all duration-300 rounded-none ${
                                  editing ? 'border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]' : 'border-white/5 cursor-default'
                                }`}
                              />
                            </div>
                          ))}
                          {editing && (
                            <button type="submit" disabled={saving}
                              className="w-full bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-widest text-xs py-4 hover:bg-[#F5E6C3] transition-colors disabled:opacity-50">
                              {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                          )}
                        </form>
                      </>
                    )}
                  </div>

                  {/* Account summary & Quick links */}
                  <div className="lg:col-span-5 space-y-8">
                    <div className="bg-[#111111] border border-white/5 p-8">
                      <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-white mb-6">Account Summary</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3.5 border-b border-white/5">
                          <span className="text-white/30 font-body text-xs uppercase tracking-wider">Total Orders</span>
                          <span className="font-display text-[#C9A84C] font-semibold text-lg">{orders ? orders.length : '0'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3.5 border-b border-white/5">
                          <span className="text-white/30 font-body text-xs uppercase tracking-wider">Wishlist Items</span>
                          <span className="font-display text-[#C9A84C] font-semibold text-lg">{wishlistItems.length}</span>
                        </div>
                        <div className="flex items-center justify-between py-3.5">
                          <span className="text-white/30 font-body text-xs uppercase tracking-wider">Member Status</span>
                          <span className="text-[10px] font-body uppercase tracking-widest text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1">
                            Active Member
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#111111] border border-white/5 p-8">
                      <h2 className="font-display text-xs font-semibold text-white mb-5 uppercase tracking-widest">Quick Links</h2>
                      <div className="space-y-2">
                        {[
                          { label: 'Browse Watches', href: '/shop' },
                          { label: 'View My Orders', action: () => setActiveSection('Orders') },
                          { label: 'My Wishlist', action: () => setActiveSection('Wishlist') },
                        ].map((link) => (
                          link.href ? (
                            <a key={link.label} href={link.href}
                              className="flex items-center justify-between py-3 text-white/40 hover:text-[#C9A84C] transition-colors group font-body text-sm border-b border-white/5 last:border-0">
                              {link.label}
                              <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-4px] group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </a>
                          ) : (
                            <button key={link.label} onClick={link.action}
                              className="w-full flex items-center justify-between py-3 text-white/40 hover:text-[#C9A84C] transition-colors group font-body text-sm border-b border-white/5 last:border-0 text-left">
                              {link.label}
                              <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-4px] group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ORDERS ───────────────────────────────────────────────── */}
              {activeSection === 'Orders' && (
                <div>
                  {(orders === null || ordersLoading) ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-7 h-7 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
                      <p className="text-white/30 font-body text-sm">Loading your orders…</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-[#111111] border border-white/5 flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 mb-5 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <p className="text-white/40 font-body mb-1">No orders placed yet</p>
                      <p className="text-white/20 font-body text-xs mb-5">Discover our curated collection of luxury timepieces</p>
                      <a href="/shop" className="px-6 py-2.5 bg-[#C9A84C] text-black font-body font-semibold text-xs uppercase tracking-wider hover:bg-[#F5E6C3] transition-colors">
                        Browse Watches
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-white/30 font-body text-xs uppercase tracking-wider mb-4">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                      {orders.map((order) => (
                        <a key={order._id} href={`/orders/${order._id}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] border border-white/5 hover:border-[#C9A84C]/30 p-5 transition-all duration-200 group">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-display text-white font-semibold group-hover:text-[#C9A84C] transition-colors">{order.orderNumber}</p>
                              <span className={`text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 ${STATUS_BADGE[order.status] || 'bg-white/10 text-white/60'}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-white/30 font-body text-xs">
                              {order?.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                : 'N/A'}
                              {order?.items ? ` · ${order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-display text-[#C9A84C] font-semibold">₹{order.total.toLocaleString('en-IN')}</span>
                            <svg className="w-4 h-4 text-white/20 group-hover:text-[#C9A84C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── WISHLIST ─────────────────────────────────────────────── */}
              {activeSection === 'Wishlist' && (
                <div>
                  {wishlistItems.length === 0 ? (
                    <div className="bg-[#111111] border border-white/5 flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 mb-5 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <p className="text-white/40 font-body mb-1">Your wishlist is empty</p>
                      <p className="text-white/20 font-body text-xs mb-5">Tap the ♥ on any watch to save it here</p>
                      <a href="/shop" className="px-6 py-2.5 bg-[#C9A84C] text-black font-body font-semibold text-xs uppercase tracking-wider hover:bg-[#F5E6C3] transition-colors">
                        Explore Watches
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-white/30 font-body text-xs uppercase tracking-wider mb-4">
                        {wishlistItems.length} saved {wishlistItems.length === 1 ? 'watch' : 'watches'}
                      </p>
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="bg-[#111111] border border-white/5 hover:border-[#C9A84C]/20 transition-all duration-200 flex items-center gap-4 p-4">
                          <a href={`/shop/${item.slug}`} className="shrink-0">
                            <div className="w-18 h-18 w-[72px] h-[72px] bg-[#0A0A0A] border border-white/8 overflow-hidden">
                              {item.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="9" strokeWidth={1} /><circle cx="12" cy="12" r="6" strokeWidth={1} />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </a>
                          <div className="flex-1 min-w-0">
                            <a href={`/shop/${item.slug}`}>
                              <p className="font-display text-white font-semibold text-sm hover:text-[#C9A84C] transition-colors truncate">{item.name}</p>
                            </a>
                            <p className="text-white/30 text-xs font-body mt-0.5">{item.brand} · {item.condition}</p>
                            <p className="text-[#C9A84C] font-display font-bold text-base mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button onClick={() => addToCart({ _id: item.id, ...item })}
                              className="text-xs font-body font-semibold uppercase tracking-wider px-3 py-2 bg-[#C9A84C] text-black hover:bg-[#F5E6C3] transition-colors">
                              Add to Cart
                            </button>
                            <button onClick={() => removeWishlist(item.id)}
                              className="text-xs font-body text-red-400/50 hover:text-red-400 transition-colors text-center">
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── SECURITY ─────────────────────────────────────────────── */}
              {activeSection === 'Security' && (
                <div className="max-w-lg">
                  <div className="bg-[#111111] border border-white/5 p-7">
                    <h2 className="font-display text-lg font-semibold text-white mb-6">Change Password</h2>

                    {passwordError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 font-body mb-5">{passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm py-3 px-4 font-body mb-5">{passwordSuccess}</div>
                    )}

                    <form onSubmit={handleSavePassword} className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-white/40 text-xs font-body uppercase tracking-wider">Current Password</label>
                          <a href="/forgot-password" className="text-[#C9A84C] text-xs font-body hover:text-[#F5E6C3] transition-colors">
                            Forgot password?
                          </a>
                        </div>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••" required
                          className="w-full bg-[#0A0A0A] border border-white/8 font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs font-body uppercase tracking-wider mb-2">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 8 characters" required minLength={8}
                          className="w-full bg-[#0A0A0A] border border-white/8 font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs font-body uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password" required minLength={8}
                          className="w-full bg-[#0A0A0A] border border-white/8 font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C] transition-colors" />
                      </div>
                      <button type="submit" disabled={updatingPassword}
                        className="w-full bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm py-3 hover:bg-[#F5E6C3] transition-colors disabled:opacity-50">
                        {updatingPassword ? 'Updating…' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>{/* end content panel */}
          </div>{/* end flex */}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    }>
      <AccountPageInner />
    </Suspense>
  );
}
