'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '6a1e8ec2a16ad059eb1c64ae';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STEPS = { EMAIL: 'email', OTP: 'otp', RESET: 'reset', DONE: 'done' };

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': TENANT_ID },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────

  const handleOtpChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': TENANT_ID },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Invalid OTP');
      setStep(STEPS.RESET);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': TENANT_ID },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Reset failed');
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Stepper indicator ─────────────────────────────────────────────────────

  const steps = [
    { key: STEPS.EMAIL, label: 'Email' },
    { key: STEPS.OTP, label: 'OTP' },
    { key: STEPS.RESET, label: 'Reset' },
  ];
  const stepIndex = { [STEPS.EMAIL]: 0, [STEPS.OTP]: 1, [STEPS.RESET]: 2, [STEPS.DONE]: 3 };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-[100px]" />

      <div className="max-w-md w-full bg-[#111111] border border-white/5 p-8 sm:p-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#C9A84C] text-xs font-body uppercase tracking-[0.3em] mb-2">Chrono Craft</p>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-wider uppercase">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-white/40 font-body">
            Secure your vault access
          </p>
          <div className="mt-4 w-10 h-px bg-[#C9A84C] mx-auto" />
        </div>

        {/* Step indicator */}
        {step !== STEPS.DONE && (
          <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((s, i) => {
              const current = stepIndex[step];
              const done = i < current;
              const active = i === current;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        done ? 'bg-[#C9A84C] text-black' :
                        active ? 'bg-[#C9A84C]/20 border border-[#C9A84C] text-[#C9A84C]' :
                        'bg-white/5 border border-white/10 text-white/30'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-body uppercase tracking-wider mt-1 ${active ? 'text-[#C9A84C]' : 'text-white/20'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-16 h-px mx-2 mb-4 transition-all duration-300 ${i < current ? 'bg-[#C9A84C]' : 'bg-white/10'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 px-4 mb-6 font-body">
            {error}
          </div>
        )}

        {/* ── STEP 1: Email ── */}
        {step === STEPS.EMAIL && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <p className="text-white/40 font-body text-sm text-center">
              Enter your registered email and we&apos;ll send you a 6-digit OTP.
            </p>
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <p className="text-white/40 font-body text-sm text-center">
              Enter the 6-digit OTP sent to <span className="text-white">{email}</span>.<br/>
              Valid for 10 minutes.
            </p>
            {/* OTP boxes */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-14 bg-[#1A1A1A] border border-white/10 text-white text-xl font-bold text-center focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(STEPS.EMAIL); setOtp(['','','','','','']); setError(''); }}
              className="w-full text-white/30 hover:text-white font-body text-xs transition-colors"
            >
              ← Change email
            </button>
          </form>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === STEPS.RESET && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <p className="text-white/40 font-body text-sm text-center">
              Choose a strong new password for your account.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 pr-11 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#C9A84C] transition-colors"
                    tabIndex={-1}
                    aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  >
                    <EyeIcon open={showPasswords} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-white/40 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full bg-[#1A1A1A] border border-white/10 font-body text-sm px-4 py-3 pr-11 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#C9A84C] transition-colors"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPasswords} />
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* ── DONE ── */}
        {step === STEPS.DONE && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <span className="text-emerald-400 text-2xl">✓</span>
            </div>
            <div>
              <h2 className="text-white font-display text-xl font-bold mb-2">Password Reset!</h2>
              <p className="text-white/40 font-body text-sm">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-4 bg-[#C9A84C] text-black font-body font-semibold uppercase tracking-wider text-sm hover:bg-[#F5E6C3] transition-colors"
            >
              Sign In Now
            </button>
          </div>
        )}

        {step !== STEPS.DONE && (
          <div className="text-center pt-6">
            <Link href="/login" className="text-white/30 hover:text-white font-body text-xs transition-colors uppercase tracking-wider">
              ← Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
