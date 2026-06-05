'use client';

// Premium SVG icon for each step
function StepIcon({ stepKey, state }) {
  const color =
    state === 'active' ? '#000'
    : state === 'completed' ? '#C9A84C'
    : state === 'cancelled' ? '#f87171'
    : '#ffffff33';

  const icons = {
    pending: (
      // Clipboard / order placed
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
    confirmed: (
      // Shield check / confirmed
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    processing: (
      // Gear / processing
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    shipped: (
      // Truck / shipped
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    delivered: (
      // Award / delivered
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    cancelled: (
      // X circle / cancelled
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  };

  return icons[stepKey] || null;
}

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed' },
  { key: 'confirmed',  label: 'Confirmed'    },
  { key: 'processing', label: 'Processing'   },
  { key: 'shipped',    label: 'Shipped'      },
  { key: 'delivered',  label: 'Delivered'    },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function getStepState(stepKey, currentStatus) {
  if (currentStatus === 'cancelled') return stepKey === 'cancelled' ? 'active' : 'cancelled';
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const stepIndex    = STATUS_ORDER.indexOf(stepKey);
  if (stepIndex < currentIndex)  return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'future';
}

export default function OrderTimeline({ status, statusHistory = [] }) {
  const getTimestamp = (stepKey) => {
    const entry = statusHistory.find((h) => h.status === stepKey);
    if (!entry) return null;
    const dateVal = entry.timestamp || entry.updatedAt;
    if (!dateVal) return null;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  const steps =
    status === 'cancelled'
      ? [...STATUS_STEPS, { key: 'cancelled', label: 'Cancelled' }]
      : STATUS_STEPS;

  return (
    <div className="relative">
      {/* Vertical connecting line */}
      <div className="absolute left-5 top-5 bottom-5 w-px bg-white/10" />

      <div className="space-y-7">
        {steps.map((step) => {
          const state     = getStepState(step.key, status);
          const timestamp = getTimestamp(step.key);
          const isActive  = state === 'active';
          const isCompleted = state === 'completed';
          const isCancelled = state === 'cancelled';
          const isFuture  = state === 'future';

          return (
            <div key={step.key} className="relative flex items-start gap-5 pl-[3.25rem]">
              {/* Icon circle */}
              <div
                className={`
                  absolute left-0 w-10 h-10 rounded-full
                  flex items-center justify-center shrink-0 z-10
                  transition-all duration-500
                  ${isActive
                    ? 'bg-[#C9A84C] shadow-[0_0_18px_rgba(201,168,76,0.6)]'
                    : isCompleted
                    ? 'bg-[#C9A84C]/20 border border-[#C9A84C]/30'
                    : isCancelled
                    ? 'bg-red-500/20 border border-red-500/30'
                    : 'bg-[#1A1A1A] border border-white/5'
                  }
                `}
              >
                {/* Animated pulse ring on active */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-[#C9A84C]/30 animate-ping" />
                )}
                <StepIcon stepKey={step.key} state={state} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1.5 pb-2">
                <p
                  className={`font-display text-sm font-semibold tracking-wide
                    ${isActive     ? 'text-[#C9A84C]'
                    : isCompleted  ? 'text-white/80'
                    : isCancelled  ? 'text-red-400'
                    : 'text-white/20'
                  }`}
                >
                  {step.label}
                </p>

                {timestamp && (
                  <p className="text-white/30 font-body text-xs mt-0.5">{timestamp}</p>
                )}

                {isActive && status !== 'cancelled' && (
                  <span className="inline-block mt-1 text-[10px] font-body uppercase tracking-widest text-[#C9A84C]/70 border border-[#C9A84C]/20 px-2 py-0.5">
                    Current Status
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
