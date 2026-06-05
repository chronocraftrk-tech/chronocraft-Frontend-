'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import useWishlistStore from '@/lib/store/wishlistStore';
import useCartStore from '@/lib/store/cartStore';

const MOCK_ORDERS = [
  {
    _id: 'ord-1',
    orderNumber: 'CVT-123456',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'shipped',
    total: 850000,
    items: [{ name: 'Rolex Submariner Date', quantity: 1 }],
  },
  {
    _id: 'ord-2',
    orderNumber: 'CVT-789012',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    total: 420000,
    items: [{ name: 'Omega Seamaster 300M', quantity: 1 }],
  },
];

const MOCK_WISHLIST = [];


const STATUS_BADGE = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-[#C9A84C]/20 text-[#C9A84C]',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const TABS = ['Profile', 'Orders', 'Wishlist'];

function AccountPageInner() {
  const { data: session, status: authStatus } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('Profile');
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState(null);  // null = loading, [] = no orders
  const [ordersLoading, setOrdersLoading] = useState(false);
  const wishlistItems  = useWishlistStore((s) => s.items);
  const removeWishlist = useWishlistStore((s) => s.removeItem);
  const addToCart      = useCartStore((s) => s.addItem);

  // Auto-select tab from URL query param e.g. /account?tab=Wishlist
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TABS.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Profile states
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savedProfile, setSavedProfile] = useState({ name: '', email: '', phone: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Separate password form states
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Clear data immediately when the logged-in user changes
  useEffect(() => {
    setOrders(null);
    setProfileName('');
    setProfileEmail('');
    setProfilePhone('');
    setSavedProfile({ name: '', email: '', phone: '' });
    setLoadingProfile(true);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token  = session.user.accessToken;

    // ── Fetch orders (always replace, even if empty array) ──────────────────
    setOrdersLoading(true);
    fetch(`${apiUrl}/customers/me/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        // Always set orders from the authenticated user — never fall back to stale data
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));

    // ── Fetch profile ────────────────────────────────────────────────────────
    fetch(`${apiUrl}/auth/customer/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          const userDetails = {
            name:  data.user.name  || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
          };
          setProfileName(userDetails.name);
          setProfileEmail(userDetails.email);
          setProfilePhone(userDetails.phone);
          setSavedProfile(userDetails);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [session]);

  const handleToggleEdit = () => {
    if (editing) {
      // Revert changes on cancel
      setProfileName(savedProfile.name);
      setProfileEmail(savedProfile.email);
      setProfilePhone(savedProfile.phone);
    }
    setEditing(!editing);
    setProfileError('');
    setProfileSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    setSaving(true);
    const token = session?.user?.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${apiUrl}/auth/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setProfileError(data.message || 'Failed to update profile.');
      } else {
        setProfileSuccess('Profile updated successfully.');
        setEditing(false);
        const updatedDetails = {
          name: data.user?.name || profileName,
          email: data.user?.email || profileEmail,
          phone: data.user?.phone || profilePhone,
        };
        setProfileName(updatedDetails.name);
        setProfileEmail(updatedDetails.email);
        setProfilePhone(updatedDetails.phone);
        setSavedProfile(updatedDetails);
      }
    } catch {
      setProfileError('An error occurred while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    const token = session?.user?.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${apiUrl}/auth/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPasswordError(data.message || 'Failed to update password.');
      } else {
        setPasswordSuccess('Password updated successfully.');
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordError('An error occurred while updating password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

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
            <a
              href="/api/auth/signin"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors"
            >
              Sign In
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const user = session.user;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">My Account</h1>
              <p className="text-white/40 font-body text-sm mt-1">Welcome back, {user.name || 'Customer'}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-white/30 hover:text-red-400 font-body text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-[#C9A84C] text-[#C9A84C]'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'Profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Personal Information Card */}
              <div className="bg-[#111111] border border-white/5 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold text-white">Personal Information</h2>
                  <button
                    onClick={handleToggleEdit}
                    className="text-[#C9A84C] font-body text-sm underline"
                  >
                    {editing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {loadingProfile ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {profileError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 rounded-sm font-body mb-6">
                        {profileError}
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm py-3 px-4 rounded-sm font-body mb-6">
                        {profileSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div>
                        <label className="block text-white/40 text-xs font-body uppercase tracking-wider mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          readOnly={!editing}
                          required
                          className={`w-full bg-[#1A1A1A] border font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                            editing
                              ? 'border-[#C9A84C]/50 focus:border-[#C9A84C]'
                              : 'border-white/10 cursor-default'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-white/40 text-xs font-body uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          readOnly={!editing}
                          required
                          className={`w-full bg-[#1A1A1A] border font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                            editing
                              ? 'border-[#C9A84C]/50 focus:border-[#C9A84C]'
                              : 'border-white/10 cursor-default'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-white/40 text-xs font-body uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          readOnly={!editing}
                          placeholder="+91 99999 99999"
                          className={`w-full bg-[#1A1A1A] border font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                            editing
                              ? 'border-[#C9A84C]/50 focus:border-[#C9A84C]'
                              : 'border-white/10 cursor-default'
                          }`}
                        />
                      </div>

                      {editing && (
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm py-3 hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      )}
                    </form>
                  </>
                )}
              </div>

              {/* Change Password Card */}
              <div className="bg-[#111111] border border-white/5 p-8">
                <h2 className="font-display text-xl font-semibold text-white mb-6">Change Password</h2>

                {passwordError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 rounded-sm font-body mb-6">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm py-3 px-4 rounded-sm font-body mb-6">
                    {passwordSuccess}
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="space-y-5">
                  <div>
                    <label className="block text-white/40 text-xs font-body uppercase tracking-wider mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-body uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-body uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="w-full bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm py-3 hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
                  >
                    {updatingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'Orders' && (
            <div>
              {/* Loading state */}
              {(orders === null || ordersLoading) ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-7 h-7 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
                  <p className="text-white/30 font-body text-sm">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-white/30 font-body">No orders placed yet.</p>
                  <a href="/shop" className="mt-3 inline-block text-[#C9A84C] text-sm underline font-body">Browse watches</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <a
                      key={order._id}
                      href={`/orders/${order._id}`}
                      className="block bg-[#111111] border border-white/5 hover:border-[#C9A84C]/30 p-5 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-display text-white font-semibold">{order.orderNumber}</p>
                          <p className="text-white/30 font-body text-xs mt-1">
                            {order?.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                              : 'N/A'}
                            {' · '}
                            {order?.items ? order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ') : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-body font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm ${STATUS_BADGE[order.status] || 'bg-white/10 text-white/60'}`}>
                            {order.status}
                          </span>
                          <span className="font-display text-[#C9A84C] font-semibold">
                            ₹{order.total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'Wishlist' && (
            <div>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="text-white/30 font-body">Your wishlist is empty.</p>
                  <p className="text-white/20 font-body text-xs mt-1">Tap the ♥ on any watch to save it here.</p>
                  <a href="/shop" className="mt-4 inline-block text-[#C9A84C] text-sm underline font-body">Explore watches</a>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-white/30 font-body text-sm">{wishlistItems.length} saved {wishlistItems.length === 1 ? 'watch' : 'watches'}</p>
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-[#111111] border border-white/5 hover:border-[#C9A84C]/20 transition-colors flex items-center gap-4 p-4">
                      {/* Thumbnail */}
                      <a href={`/shop/${item.slug}`} className="shrink-0">
                        <div className="w-16 h-16 bg-[#0A0A0A] border border-white/10 overflow-hidden">
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

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <a href={`/shop/${item.slug}`}>
                          <p className="font-display text-white font-semibold text-sm hover:text-[#C9A84C] transition-colors truncate">{item.name}</p>
                        </a>
                        <p className="text-white/30 text-xs font-body mt-0.5">{item.brand} · {item.condition}</p>
                        <p className="text-[#C9A84C] font-display font-bold text-base mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => addToCart({ _id: item.id, ...item })}
                          className="text-xs font-body font-semibold uppercase tracking-wider px-3 py-2 bg-[#C9A84C] text-black hover:bg-[#F5E6C3] transition-colors"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeWishlist(item.id)}
                          className="text-xs font-body text-red-400/60 hover:text-red-400 transition-colors text-center"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

