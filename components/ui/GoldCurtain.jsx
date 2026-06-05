'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function GoldCurtain() {
  const curtainRef = useRef(null);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const curtain = curtainRef.current;
    if (!curtain) return;

    let tween;
    (async () => {
      const { gsap } = await import('@/lib/gsap-helpers');

      tween = gsap.fromTo(
        curtain,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 0.4,
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.to(curtain, {
              scaleX: 0,
              transformOrigin: 'right center',
              duration: 0.4,
              ease: 'power3.inOut',
            });
          },
        }
      );
    })();

    return () => {
      if (tween) tween.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 bg-[#C9A84C] z-[9999] pointer-events-none"
      style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
      aria-hidden="true"
    />
  );
}
