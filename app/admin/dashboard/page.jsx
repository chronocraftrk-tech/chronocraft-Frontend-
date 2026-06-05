'use strict';

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState('Overview');

  // API State
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [whatsappLogs, setWhatsappLogs] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    reviewerName: '',
    reviewerLocation: '',
    rating: 5,
    quote: '',
    isPublished: true,
    displayOrder: 0,
  });

  // Edit / Add product modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'Rolex',
    price: '',
    originalPrice: '',
    condition: 'New',
    stock: 1,
    sku: '',
    dial: '',
    caseMaterial: '',
    movement: 'Automatic',
    caseSize: '',
    images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600'],
    tags: '',
  });

  // Image upload state
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend
    setImageUploading(true);
    try {
      const token = session?.user?.accessToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${apiUrl}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
      setProductForm((prev) => ({ ...prev, images: [data.url] }));
    } catch (err) {
      setErrorMsg(`Image upload failed: ${err.message}`);
      setImagePreview('');
      setProductForm((prev) => ({ ...prev, images: [] }));
    } finally {
      setImageUploading(false);
    }
  };
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusForm, setOrderStatusForm] = useState({
    status: 'pending',
    paymentStatus: 'pending',
    note: '',
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch Dashboard Summary & Chart Data
  const fetchData = async () => {
    if (!session?.user?.accessToken) return;
    setLoading(true);
    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      // 1. Fetch Summary
      const summaryRes = await fetch(`${apiUrl}/admin/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.summary);
        setLowStock(summaryData.lowStockAlerts || []);
        setTopProducts(summaryData.topProducts || []);
      }

      // 2. Fetch Chart Data
      const chartRes = await fetch(`${apiUrl}/admin/analytics/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (chartRes.ok) {
        const cData = await chartRes.json();
        setSalesData(cData || []);
      }

      // 3. Fetch Products
      const prodRes = await fetch(`${apiUrl}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData || []);
      }

      // 4. Fetch Orders
      const orderRes = await fetch(`${apiUrl}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (orderRes.ok) {
        const oData = await orderRes.json();
        setOrders(oData || []);
      }

      // 5. Fetch Users
      const userRes = await fetch(`${apiUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const uData = await userRes.json();
        setUsers(uData || []);
      }

      // 6. Fetch WhatsApp Logs
      const waRes = await fetch(`${apiUrl}/admin/whatsapp/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (waRes.ok) {
        const waData = await waRes.json();
        setWhatsappLogs(waData || []);
      }

      // 7. Fetch Reviews
      const revRes = await fetch(`${apiUrl}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, authStatus]);

  // Product Add / Update
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      stock: Number(productForm.stock),
      caseSize: productForm.caseSize ? Number(productForm.caseSize) : undefined,
      tags: productForm.tags ? productForm.tags.split(',').map((t) => t.trim()) : [],
    };

    try {
      let res;
      if (editingProduct) {
        // Update
        res = await fetch(`${apiUrl}/admin/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch(`${apiUrl}/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Action failed');
      }

      setSuccessMsg(editingProduct ? 'Watch listing updated!' : 'Watch listing created!');
      setProductModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  // Product Archive
  const handleArchiveProduct = async (id) => {
    if (!confirm('Are you sure you want to archive this watch?')) return;
    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${apiUrl}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to archive');
      alert('Watch listing archived.');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Order Status Update
  const handleOrderStatusSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${apiUrl}/admin/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderStatusForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Update failed');
      }

      setSuccessMsg('Order updated successfully!');
      setOrderModalOpen(false);
      setSelectedOrder(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger editing a product
  const startEditProduct = (prod) => {
    setEditingProduct(prod);
    const existingImg = prod.images?.[0] || '';
    setImagePreview(existingImg);
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      condition: prod.condition,
      stock: prod.stock,
      sku: prod.sku,
      dial: prod.dial || '',
      caseMaterial: prod.caseMaterial || '',
      movement: prod.movement || 'Automatic',
      caseSize: prod.caseSize || '',
      images: prod.images,
      tags: prod.tags?.join(', ') || '',
    });
    setProductModalOpen(true);
  };

  // Open create product form
  const startCreateProduct = () => {
    setEditingProduct(null);
    setImagePreview('');
    setProductForm({
      name: '',
      brand: 'Rolex',
      price: '',
      originalPrice: '',
      condition: 'New',
      stock: 1,
      sku: '',
      dial: '',
      caseMaterial: '',
      movement: 'Automatic',
      caseSize: '',
      images: [],
      tags: '',
    });
    setProductModalOpen(true);
  };

  // Open order update form
  const startUpdateOrder = (order) => {
    setSelectedOrder(order);
    setOrderStatusForm({
      status: order.status,
      paymentStatus: order.paymentStatus,
      note: '',
    });
    setOrderModalOpen(true);
  };

  // ── Review handlers ────────────────────────────────────────────────────────
  const startCreateReview = () => {
    setEditingReview(null);
    setReviewForm({ reviewerName: '', reviewerLocation: '', rating: 5, quote: '', isPublished: true, displayOrder: 0 });
    setReviewModalOpen(true);
  };

  const startEditReview = (rev) => {
    setEditingReview(rev);
    setReviewForm({
      reviewerName: rev.reviewerName,
      reviewerLocation: rev.reviewerLocation || '',
      rating: rev.rating,
      quote: rev.quote,
      isPublished: rev.isPublished,
      displayOrder: rev.displayOrder || 0,
    });
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(
        editingReview ? `${apiUrl}/admin/reviews/${editingReview._id}` : `${apiUrl}/admin/reviews`,
        {
          method: editingReview ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(reviewForm),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed');
      setSuccessMsg(editingReview ? 'Review updated!' : 'Review created!');
      setReviewModalOpen(false);
      setEditingReview(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    const token = session.user.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${apiUrl}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      fetchData();
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
          onClick={() => router.push('/admin/login')}
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
          <h1 className="font-display text-lg font-bold text-[#C9A84C] tracking-wider uppercase mb-8">
            Vault CMS
          </h1>
          <nav className="space-y-2">
            {['Overview', 'Products', 'Orders', 'Users', 'Reviews', 'WhatsApp Logs'].map((tab) => (
              <button
                key={tab}
                onClick={() => { 
                  setActiveTab(tab); 
                  setErrorMsg(''); 
                  setSuccessMsg(''); 
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full text-left font-body text-sm font-semibold uppercase tracking-wider py-3 px-4 border-l-2 transition-all ${
                  activeTab === tab
                    ? 'border-[#C9A84C] bg-[#C9A84C]/5 text-[#C9A84C]'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-white/30 text-xs font-body">{session.user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
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
              <h2 className="font-display text-3xl font-bold tracking-tight">{activeTab}</h2>
              <p className="text-white/40 font-body text-sm mt-1">Manage your luxury watch reseller business.</p>
            </div>
            {activeTab === 'Products' && (
              <button
                onClick={startCreateProduct}
                className="px-5 py-3 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] transition-colors"
              >
                Add New Watch
              </button>
            )}
            {activeTab === 'Reviews' && (
              <button
                onClick={startCreateReview}
                className="px-5 py-3 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] transition-colors"
              >
                Add Review
              </button>
            )}
          </div>

          {/* Messages */}
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
            <>
              {/* ── Tab: Overview ────────────────────────────────────────────── */}
              {activeTab === 'Overview' && summary && (
                <div className="space-y-8">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Revenue', value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`, desc: 'Paid orders' },
                      { label: 'Registered Users', value: summary.totalUsers, desc: 'Registered customers' },
                      { label: 'Active Orders', value: summary.activeOrders, desc: 'Processing / shipped' },
                      { label: 'WhatsApp Enquiries', value: summary.whatsappEnquiries, desc: `${summary.whatsappConversionRate}% conversion` },
                    ].map((card, i) => (
                      <div key={i} className="bg-[#111111] border border-white/5 p-6">
                        <p className="text-white/40 text-xs font-body uppercase tracking-wider mb-2">{card.label}</p>
                        <p className="font-display text-2xl font-bold text-[#C9A84C]">{card.value}</p>
                        <p className="text-white/20 text-xs font-body mt-2">{card.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Products */}
                    <div className="lg:col-span-2 bg-[#111111] border border-white/5 p-6">
                      <h3 className="font-display text-lg font-semibold mb-4">Top Selling Watches</h3>
                      {topProducts.length === 0 ? (
                        <p className="text-white/30 text-sm">No sales logged yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm font-body">
                            <thead>
                              <tr className="text-white/30 border-b border-white/5">
                                <th className="pb-3">Watch Name</th>
                                <th className="pb-3">SKU</th>
                                <th className="pb-3 text-right">Units Sold</th>
                                <th className="pb-3 text-right">Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topProducts.map((p, idx) => (
                                <tr key={idx} className="border-b border-white/5 text-white/80">
                                  <td className="py-3 font-semibold">{p.name}</td>
                                  <td className="py-3 text-white/40">{p.sku}</td>
                                  <td className="py-3 text-right font-semibold">{p.sales}</td>
                                  <td className="py-3 text-right text-[#C9A84C]">₹{p.revenue.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Low Stock alerts */}
                    <div className="bg-[#111111] border border-white/5 p-6">
                      <h3 className="font-display text-lg font-semibold mb-4">Low Stock Alerts</h3>
                      {lowStock.length === 0 ? (
                        <p className="text-emerald-400 text-sm font-body">✓ All items well-stocked</p>
                      ) : (
                        <div className="space-y-4">
                          {lowStock.map((p) => (
                            <div key={p._id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                              <div>
                                <p className="font-semibold text-white/80">{p.name}</p>
                                <p className="text-white/30 text-xs">SKU: {p.sku}</p>
                              </div>
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold font-body">
                                {p.stock} left
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Products ────────────────────────────────────────────── */}
              {activeTab === 'Products' && (
                <div className="bg-[#111111] border border-white/5 p-6">
                  {products.length === 0 ? (
                    <p className="text-white/30 text-center py-10 font-body">No watch listings found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm font-body">
                        <thead>
                          <tr className="text-white/30 border-b border-white/5">
                            <th className="pb-3">Watch</th>
                            <th className="pb-3">Brand</th>
                            <th className="pb-3">SKU</th>
                            <th className="pb-3 text-right">Price</th>
                            <th className="pb-3 text-center">Stock</th>
                            <th className="pb-3 text-center">Status</th>
                            <th className="pb-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => (
                            <tr key={p._id} className="border-b border-white/5 text-white/80 hover:bg-white/2 transition-colors">
                              <td className="py-4 font-semibold text-white">{p.name}</td>
                              <td className="py-4 text-[#C9A84C] font-semibold">{p.brand}</td>
                              <td className="py-4 text-white/40">{p.sku}</td>
                              <td className="py-4 text-right">₹{p.price.toLocaleString('en-IN')}</td>
                              <td className="py-4 text-center font-semibold">{p.stock}</td>
                              <td className="py-4 text-center">
                                {p.isArchived ? (
                                  <span className="text-xs bg-white/10 text-white/50 px-2 py-1">Archived</span>
                                ) : p.stock === 0 ? (
                                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1">Out of Stock</span>
                                ) : (
                                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1">Active</span>
                                )}
                              </td>
                              <td className="py-4 text-center space-x-3">
                                <button
                                  onClick={() => startEditProduct(p)}
                                  className="text-xs text-[#C9A84C] hover:underline"
                                >
                                  Edit
                                </button>
                                {!p.isArchived && (
                                  <button
                                    onClick={() => handleArchiveProduct(p._id)}
                                    className="text-xs text-red-400 hover:underline"
                                  >
                                    Archive
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Orders ──────────────────────────────────────────────── */}
              {activeTab === 'Orders' && (
                <div className="space-y-4">
                  {/* Header bar with count + refresh */}
                  <div className="flex items-center justify-between">
                    <p className="text-white/40 font-body text-sm">
                      {orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length !== 1 ? 's' : ''} received`}
                    </p>
                    <button
                      onClick={fetchData}
                      className="flex items-center gap-2 text-xs text-[#C9A84C] border border-[#C9A84C]/20 px-3 py-1.5 hover:bg-[#C9A84C]/5 transition-colors font-body uppercase tracking-wider"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-[#111111] border border-white/5 p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <p className="text-white/30 font-body">No orders received yet.</p>
                      <p className="text-white/20 font-body text-xs mt-1">Orders placed by customers will appear here automatically.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div key={o._id} className="bg-[#111111] border border-white/5 hover:border-[#C9A84C]/20 transition-colors">
                          {/* Order header row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-white/5">
                            <div className="flex items-center gap-4">
                              <span className="font-display font-bold text-[#C9A84C] text-sm tracking-wider">{o.orderNumber}</span>
                              {/* Customer name */}
                              {o.userId && (
                                <span className="text-white/70 text-xs font-body font-semibold">
                                  👤 {o.userId.name || o.userId.email || 'Customer'}
                                </span>
                              )}
                              <span className="text-white/30 text-xs font-body">
                                {o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Payment badge */}
                              <span className={`text-xs px-2.5 py-1 font-semibold uppercase tracking-wider ${
                                o.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                                o.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                                o.paymentStatus === 'refunded' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {o.paymentStatus}
                              </span>
                              {/* Order status badge */}
                              <span className={`text-xs px-2.5 py-1 uppercase tracking-wider font-semibold ${
                                o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                                o.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                o.status === 'shipped' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' :
                                o.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                o.status === 'confirmed' ? 'bg-indigo-500/20 text-indigo-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {o.status}
                              </span>
                              <button
                                onClick={() => startUpdateOrder(o)}
                                className="text-xs bg-[#C9A84C] text-black px-3 py-1 font-semibold uppercase tracking-wider hover:bg-[#F5E6C3] transition-colors"
                              >
                                Update
                              </button>
                            </div>
                          </div>

                          {/* Order body: items + shipping */}
                          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Watch items */}
                            <div className="md:col-span-2 space-y-3">
                              {o.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  {/* Watch thumbnail */}
                                  <div className="w-12 h-12 shrink-0 bg-[#0A0A0A] border border-white/10 overflow-hidden">
                                    {item.image ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                                    <p className="text-white/40 text-xs font-body">SKU: {item.sku} · Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-[#C9A84C] font-semibold text-sm shrink-0">
                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Shipping + Total */}
                            <div className="space-y-3">
                              {o.shippingAddress && (
                                <div>
                                  <p className="text-white/30 text-xs font-body uppercase tracking-wider mb-1">Ship To</p>
                                  <p className="text-white/80 text-xs font-body leading-relaxed">
                                    <span className="font-semibold text-white">{o.shippingAddress.name}</span><br />
                                    {o.shippingAddress.street && <>{o.shippingAddress.street}<br /></>}
                                    {o.shippingAddress.city}{o.shippingAddress.state ? `, ${o.shippingAddress.state}` : ''} {o.shippingAddress.pincode}<br />
                                    {o.shippingAddress.phone && <span className="text-white/50">📞 {o.shippingAddress.phone}</span>}
                                  </p>
                                </div>
                              )}
                              <div className="border-t border-white/5 pt-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/40 text-xs font-body uppercase tracking-wider">Order Total</span>
                                  <span className="text-[#C9A84C] font-display font-bold text-base">₹{o.total.toLocaleString('en-IN')}</span>
                                </div>
                                {o.discount > 0 && (
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-white/30 text-xs font-body">Discount</span>
                                    <span className="text-emerald-400 text-xs font-body">-₹{o.discount.toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                {o.paymentProvider && (
                                  <p className="text-white/30 text-xs font-body mt-1 capitalize">via {o.paymentProvider}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Users ───────────────────────────────────────────────── */}
              {activeTab === 'Users' && (
                <div className="bg-[#111111] border border-white/5 p-6">
                  {users.length === 0 ? (
                    <p className="text-white/30 text-center py-10 font-body">No registered users yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm font-body">
                        <thead>
                          <tr className="text-white/30 border-b border-white/5">
                            <th className="pb-3">Customer</th>
                            <th className="pb-3">Email</th>
                            <th className="pb-3">Phone</th>
                            <th className="pb-3 text-center">Total Orders</th>
                            <th className="pb-3 text-right">Total Spent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u._id} className="border-b border-white/5 text-white/80">
                              <td className="py-4 font-semibold text-white">{u.name}</td>
                              <td className="py-4 text-white/60">{u.email}</td>
                              <td className="py-4 text-white/40">{u.phone || '—'}</td>
                              <td className="py-4 text-center font-bold">{u.orderCount}</td>
                              <td className="py-4 text-right text-[#C9A84C] font-semibold">₹{u.totalSpent.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Reviews ─────────────────────────────────────────────── */}
              {activeTab === 'Reviews' && (
                <div className="bg-[#111111] border border-white/5 p-6">
                  {reviews.length === 0 ? (
                    <p className="text-white/30 text-center py-10 font-body">No reviews yet. Add your first review.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm font-body">
                        <thead>
                          <tr className="text-white/30 border-b border-white/5">
                            <th className="pb-3">Reviewer</th>
                            <th className="pb-3">Location</th>
                            <th className="pb-3 text-center">Rating</th>
                            <th className="pb-3">Quote</th>
                            <th className="pb-3 text-center">Status</th>
                            <th className="pb-3 text-center">Order</th>
                            <th className="pb-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviews.map((rev) => (
                            <tr key={rev._id} className="border-b border-white/5 text-white/80 hover:bg-white/2 transition-colors">
                              <td className="py-4 font-semibold text-white">{rev.reviewerName}</td>
                              <td className="py-4 text-white/40">{rev.reviewerLocation || '—'}</td>
                              <td className="py-4 text-center">
                                <span className="text-[#C9A84C] font-bold">{'★'.repeat(rev.rating)}</span>
                              </td>
                              <td className="py-4 text-white/60 max-w-xs truncate italic">&ldquo;{rev.quote}&rdquo;</td>
                              <td className="py-4 text-center">
                                {rev.isPublished ? (
                                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1">Published</span>
                                ) : (
                                  <span className="text-xs bg-white/10 text-white/40 px-2 py-1">Hidden</span>
                                )}
                              </td>
                              <td className="py-4 text-center text-white/40">{rev.displayOrder}</td>
                              <td className="py-4 text-center space-x-3">
                                <button onClick={() => startEditReview(rev)} className="text-xs text-[#C9A84C] hover:underline">Edit</button>
                                <button onClick={() => handleDeleteReview(rev._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: WhatsApp Logs ───────────────────────────────────────── */}
              {activeTab === 'WhatsApp Logs' && (
                <div className="bg-[#111111] border border-white/5 p-6">
                  {whatsappLogs.length === 0 ? (
                    <p className="text-white/30 text-center py-10 font-body">No WhatsApp interactions logged.</p>
                  ) : (
                    <div className="space-y-4">
                      {whatsappLogs.map((log) => (
                        <div key={log._id} className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-sm">
                                {log.type}
                              </span>
                              <span className="text-white/30 text-xs font-body">
                                {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white mt-2 font-body">To: {log.phone}</p>
                            <p className="text-sm text-white/60 mt-1 italic font-body">&quot;{log.message}&quot;</p>
                            {log.productId && (
                              <p className="text-xs text-white/40 mt-1">Enquired Watch: {log.productId.name} (SKU: {log.productId.sku})</p>
                            )}
                          </div>
                          <div>
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-sm font-semibold uppercase">
                              {log.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── MODAL: Product Form ──────────────────────────────────────── */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
              <h3 className="font-display text-xl font-bold uppercase tracking-wider text-[#C9A84C]">
                {editingProduct ? 'Edit Watch listing' : 'Add Luxury Watch'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-white/30 hover:text-white font-body text-sm"
              >
                ✕ Close
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-body text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Watch Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Rolex Submariner Date"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Brand</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                  >
                    {['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'IWC', 'Breitling', 'Tag Heuer', 'Longines', 'Tissot', 'Other'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="850000"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Strikethrough Original Price (Optional)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="950000"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Stock Inventory</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">SKU Reference</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="ROL-116610"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Movement</label>
                  <input
                    type="text"
                    value={productForm.movement}
                    onChange={(e) => setProductForm({ ...productForm, movement: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Automatic"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Dial description</label>
                  <input
                    type="text"
                    value={productForm.dial}
                    onChange={(e) => setProductForm({ ...productForm, dial: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Black Sunburst"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Case Material</label>
                  <input
                    type="text"
                    value={productForm.caseMaterial}
                    onChange={(e) => setProductForm({ ...productForm, caseMaterial: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Oystersteel"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Case Size (mm)</label>
                  <input
                    type="number"
                    value={productForm.caseSize}
                    onChange={(e) => setProductForm({ ...productForm, caseSize: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="41"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Sport, Dive, Luxury"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Watch Photo</label>
                <div className="flex gap-4 items-start">
                  {/* Preview */}
                  <div className="w-24 h-24 shrink-0 border border-white/10 bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/20 text-xs text-center px-2">No image</span>
                    )}
                  </div>
                  {/* Upload button */}
                  <div className="flex-1">
                    <label className={`cursor-pointer flex flex-col items-center justify-center w-full h-24 border-2 border-dashed transition-colors group ${imageUploading ? 'border-[#C9A84C]/60 bg-[#C9A84C]/5 cursor-wait' : 'border-white/20 hover:border-[#C9A84C]/60 bg-[#0A0A0A]'}`}>
                      {imageUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin mb-1" />
                          <span className="text-xs text-[#C9A84C]">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/30 group-hover:text-[#C9A84C] mb-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-white/30 group-hover:text-[#C9A84C] transition-colors">
                            {imagePreview ? 'Change Photo' : 'Upload Photo'}
                          </span>
                          <span className="text-[10px] text-white/20 mt-0.5">JPG, PNG, WEBP · max 8MB</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imageUploading}
                        onChange={handleImageFile}
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => { setImagePreview(''); setProductForm((prev) => ({ ...prev, images: [] })); }}
                        className="mt-2 text-xs text-red-400 hover:underline"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={actionLoading || imageUploading}
                  className="w-full py-3 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
                >
                  {imageUploading ? 'Uploading image...' : actionLoading ? 'Saving watch...' : 'Save Watch listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Order Status Update ───────────────────────────────── */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 w-full max-w-lg my-4">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#C9A84C]">
                  Update Order
                </h3>
                <p className="text-white/30 font-body text-xs mt-0.5">#{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Ordered items quick view */}
            {selectedOrder.items?.length > 0 && (
              <div className="px-6 py-3 border-b border-white/5 flex flex-col gap-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-9 h-9 shrink-0 bg-[#0A0A0A] border border-white/10 overflow-hidden">
                      {item.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" strokeWidth={1} /><circle cx="12" cy="12" r="6" strokeWidth={1} />
                            </svg>
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-xs font-semibold font-body truncate">{item.name}</p>
                      <p className="text-white/30 text-[10px] font-body">Qty: {item.quantity} · ₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleOrderStatusSubmit} className="p-6 space-y-5 font-body text-sm">

              {/* Order Status with icons */}
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-3">Order Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'pending',    label: 'Pending',    desc: 'Awaiting admin review',           icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'text-yellow-400'   },
                    { value: 'confirmed',  label: 'Confirmed',  desc: 'Auto-progresses over 24 hours',   icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-indigo-400' },
                    { value: 'processing', label: 'Processing', desc: 'Order is being prepared',         icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-blue-400'   },
                    { value: 'shipped',    label: 'Shipped',    desc: 'Out for delivery',                icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2 5-1 5 1 2-2z',     color: 'text-[#C9A84C]' },
                    { value: 'delivered',  label: 'Delivered',  desc: 'Successfully delivered',          icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',                       color: 'text-emerald-400'},
                    { value: 'cancelled',  label: 'Cancelled',  desc: 'Order has been cancelled',        icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',                                                          color: 'text-red-400'   },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all ${
                        orderStatusForm.status === opt.value
                          ? 'border-[#C9A84C]/50 bg-[#C9A84C]/5'
                          : 'border-white/5 hover:border-white/15 bg-[#0A0A0A]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderStatus"
                        value={opt.value}
                        checked={orderStatusForm.status === opt.value}
                        onChange={(e) => setOrderStatusForm({ ...orderStatusForm, status: e.target.value })}
                        className="sr-only"
                      />
                      {/* Status icon */}
                      <svg className={`w-5 h-5 shrink-0 ${opt.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d={opt.icon} />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold capitalize ${orderStatusForm.status === opt.value ? 'text-[#C9A84C]' : 'text-white/80'}`}>
                          {opt.label}
                        </p>
                        <p className="text-white/30 text-[10px] font-body">{opt.desc}</p>
                      </div>
                      {orderStatusForm.status === opt.value && (
                        <svg className="w-4 h-4 text-[#C9A84C] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>

                {/* Auto-progression info banner — shows only when 'confirmed' is selected */}
                {orderStatusForm.status === 'confirmed' && (
                  <div className="mt-3 flex gap-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-3">
                    <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <p className="text-indigo-300 text-xs font-semibold font-body uppercase tracking-wider">Auto-Progression Active</p>
                      <p className="text-indigo-300/70 text-xs font-body mt-0.5 leading-relaxed">
                        Once confirmed, the system will automatically advance this order:
                        <br />· <span className="text-white/60">+4 h</span> → Processing
                        · <span className="text-white/60">+12 h</span> → Shipped
                        · <span className="text-white/60">+24 h</span> → Delivered
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Payment Status</label>
                <select
                  value={orderStatusForm.paymentStatus}
                  onChange={(e) => setOrderStatusForm({ ...orderStatusForm, paymentStatus: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-[#C9A84C]"
                >
                  {[
                    { value: 'pending',  label: '⏳ Pending'  },
                    { value: 'paid',     label: '✅ Paid'     },
                    { value: 'failed',   label: '❌ Failed'   },
                    { value: 'refunded', label: '↩️ Refunded' },
                  ].map((ps) => (
                    <option key={ps.value} value={ps.value}>{ps.label}</option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Internal Note (Optional)</label>
                <textarea
                  value={orderStatusForm.note}
                  onChange={(e) => setOrderStatusForm({ ...orderStatusForm, note: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C] resize-none text-sm"
                  placeholder="e.g. Courier tracking: AWB12837..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="flex-1 py-3 border border-white/10 text-white/50 font-semibold uppercase tracking-wider text-xs hover:border-white/20 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Updating...' : 'Update Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Review Form ───────────────────────────────────────── */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 w-full max-w-lg">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold uppercase tracking-wider text-[#C9A84C]">
                {editingReview ? 'Edit Review' : 'Add Review'}
              </h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-white/30 hover:text-white font-body text-sm">
                ✕ Close
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 font-body text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Reviewer Name *</label>
                  <input
                    type="text" required value={reviewForm.reviewerName}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Arjun Mehta"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text" value={reviewForm.reviewerLocation}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewerLocation: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="Mumbai"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Rating *</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                  >
                    {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Display Order</label>
                  <input
                    type="number" value={reviewForm.displayOrder}
                    onChange={(e) => setReviewForm({ ...reviewForm, displayOrder: Number(e.target.value) })}
                    className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Review Quote *</label>
                <textarea
                  required value={reviewForm.quote} rows={4}
                  onChange={(e) => setReviewForm({ ...reviewForm, quote: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#C9A84C] resize-none"
                  placeholder="Exceptional service. The watch was in perfect condition..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox" id="rev-published" checked={reviewForm.isPublished}
                  onChange={(e) => setReviewForm({ ...reviewForm, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-[#C9A84C]"
                />
                <label htmlFor="rev-published" className="text-white/60 text-xs uppercase tracking-wider cursor-pointer">
                  Publish on storefront
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit" disabled={actionLoading}
                  className="w-full py-3 bg-[#C9A84C] text-black font-semibold uppercase tracking-wider text-xs hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingReview ? 'Update Review' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
