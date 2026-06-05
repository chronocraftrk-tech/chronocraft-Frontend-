import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export const EASE = 'power3.out';
export const EASE_ELASTIC = 'elastic.out(1, 0.6)';
export const DURATION = 0.8;
export const STAGGER = 0.1;

/**
 * Wrap each character of a text node in a <span> for char-level animation.
 * Returns array of span elements.
 */
export function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  return text.split('').map((char) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.willChange = 'transform, opacity';
    el.appendChild(span);
    return span;
  });
}

/**
 * Wrap each word of a text node in a <span> for word-level animation.
 */
export function splitWords(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  return text.split(' ').map((word, i, arr) => {
    const span = document.createElement('span');
    span.textContent = i < arr.length - 1 ? word + '\u00A0' : word;
    span.style.display = 'inline-block';
    span.style.overflow = 'hidden';
    span.style.verticalAlign = 'bottom';
    el.appendChild(span);
    return span;
  });
}

/**
 * Mask-reveal: words slide up from clip mask (luxury editorial style)
 */
export function revealWords(el, opts = {}) {
  const words = splitWords(el);
  const inners = words.map((w) => {
    const inner = document.createElement('span');
    inner.style.display = 'inline-block';
    inner.textContent = w.textContent;
    w.textContent = '';
    w.appendChild(inner);
    return inner;
  });

  return gsap.fromTo(
    inners,
    { yPercent: 110, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: opts.duration ?? 0.9,
      stagger: opts.stagger ?? 0.07,
      ease: opts.ease ?? 'power4.out',
      delay: opts.delay ?? 0,
      ...opts,
    }
  );
}

/**
 * Create a ScrollTrigger-powered reveal tween
 */
export function scrollReveal(target, fromVars, toVars, triggerEl, opts = {}) {
  return gsap.fromTo(target, fromVars, {
    ...toVars,
    scrollTrigger: {
      trigger: triggerEl || target,
      start: opts.start ?? 'top 85%',
      end: opts.end ?? 'bottom 20%',
      toggleActions: 'play none none none',
      once: true,
      ...opts.scrollTrigger,
    },
  });
}
