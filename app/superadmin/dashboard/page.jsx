'use strict';

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Tenant Creation Form
  const [form, setForm] = useState({
    subdomain: '',
    businessName: '',
    email: '',
    password: '',
    name: '',
    plan: 'trial',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchTenants = async () => {
    if (!session?.user?.accessToken) return;
    setLoading(true);
    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${apiUrl}/superadmin/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTenants(data || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || 'Failed to fetch tenants');
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setErrorMsg('Network error fetching tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchTenants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, authStatus]);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${apiUrl}/superadmin/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Tenant creation failed');
      }

      setSuccessMsg(`Tenant "${form.businessName}" created successfully!`);
      setModalOpen(false);
      setForm({
        subdomain: '',
        businessName: '',
        email: '',
        password: '',
        name: '',
        plan: 'trial',
      });
      fetchTenants();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change tenant status to ${nextStatus}?`)) return;

    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${apiUrl}/superadmin/tenants/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to toggle status');
      }

      fetchTenants();
    } catch (err) {
      alert(err.message);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    );
  }

  if (authStatus === 'unauthenticated' || session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8">
        <p className="text-white/40 mb-4">Access Denied. Admins Only.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3]"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-3 bg-[#111111] border border-white/10 text-white hover:bg-[#C9A84C] hover:text-black transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0
        w-64 bg-[#111111] border-r border-white/5 
        flex flex-col justify-between shrink-0
        transform transition-transform duration-300 ease-in-out
        z-30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-red-500 font-display text-xs tracking-widest uppercase border border-red-500/30 px-2 py-0.5 rounded-sm">
              Root SaaS
            </span>
          </div>
          <h1 className="font-display text-lg font-bold text-white tracking-wider uppercase mb-8">
            Vault SaaS Panel
          </h1>
          <nav className="space-y-2">
            <button
              className="w-full text-left font-body text-sm font-semibold uppercase tracking-wider py-3 px-4 border-l-2 border-[#C9A84C] bg-[#C9A84C]/5 text-[#C9A84C]"
            >
              Tenant Stores
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-white/30 text-xs font-body">Admin User</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs text-red-400 hover:underline font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto pt-16 md:pt-0">{/* Add top padding on mobile for menu button */}
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">Tenant Stores</h2>
              <p className="text-white/40 font-body text-sm mt-1">SaaS Instance Management & Domain Routing</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] transition-colors"
            >
              Provision Store
            </button>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm py-3 px-4 rounded-sm mb-6 font-body">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 rounded-sm mb-6 font-body">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-[#111111] border border-white/5 p-6">
              {tenants.length === 0 ? (
                <p className="text-white/30 text-center py-10 font-body">No tenant stores provisioned yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-body">
                    <thead>
                      <tr className="text-white/30 border-b border-white/5">
                        <th className="pb-3">Business Name</th>
                        <th className="pb-3">Subdomain</th>
                        <th className="pb-3">Admin Email</th>
                        <th className="pb-3">Plan</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((t) => (
                        <tr key={t._id} className="border-b border-white/5 text-white/80 hover:bg-white/2 transition-colors">
                          <td className="py-4 font-semibold text-white">{t.businessName}</td>
                          <td className="py-4 text-[#C9A84C] font-semibold">{t.subdomain}</td>
                          <td className="py-4 text-white/40">{t.adminEmail}</td>
                          <td className="py-4 uppercase text-xs font-semibold">{t.plan}</td>
                          <td className="py-4 text-center">
                            <span className={`text-xs px-2.5 py-1 uppercase tracking-wider font-semibold ${
                              t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(t._id, t.status)}
                              className={`text-xs font-semibold hover:underline ${
                                t.status === 'active' ? 'text-red-400' : 'text-[#C9A84C]'
                              }`}
                            >
                              {t.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL: Create Tenant Store Wizard ────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#C9A84C]">
                Provision SaaS Tenant Store
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/30 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 font-body text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Business Name</label>
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Grand Timepieces"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Subdomain Slug</label>
                  <input
                    type="text"
                    required
                    value={form.subdomain}
                    onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="grandtime"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Admin Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Albert Cole"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="admin@grandtime.com"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Admin Password</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Subscription Plan</label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                  >
                    {['trial', 'starter', 'professional', 'enterprise'].map((p) => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] disabled:opacity-50"
                >
                  {actionLoading ? 'Provisioning...' : 'Provision Store Instance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
