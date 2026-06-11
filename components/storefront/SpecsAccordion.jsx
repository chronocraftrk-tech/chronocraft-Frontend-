'use client';

import { useState } from 'react';

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-display text-white text-base font-semibold">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-[#C9A84C] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-5 text-white/60 font-body text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SpecsAccordion({ product }) {
  const specs = [
    { label: 'Movement', value: product.movement },
    { label: 'Case Size', value: product.caseSize ? `${product.caseSize}mm` : undefined },
    { label: 'Dial', value: product.dial },
    { label: 'Case Material', value: product.caseMaterial },
    { label: 'Year of Manufacture', value: product.yearOfManufacture },
    { label: 'Condition', value: product.condition },
    { label: 'SKU', value: product.sku },
  ].filter((s) => s.value);

  return (
    <div className="border-t border-white/10">
      <AccordionItem title="Technical Specifications" defaultOpen>
        <dl className="space-y-3">
          {specs.map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <dt className="text-white/40 uppercase tracking-wider text-xs">{label}</dt>
              <dd className="text-white">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </AccordionItem>

      <AccordionItem title="Included Items">
        {product.includedItems && product.includedItems.length > 0 ? (
          <ul className="space-y-1">
            {product.includedItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p>Watch only — no additional items included.</p>
        )}
      </AccordionItem>

      <AccordionItem title="About This Watch">
        <p>
          This {product.brand} {product.name} is part of our curated collection of authenticated brand-new luxury timepieces.
          Every watch undergoes a rigorous multi-point inspection before being listed on Chrono Craft.
        </p>
        {product.description && (
          <p className="mt-3">{product.description}</p>
        )}
      </AccordionItem>
    </div>
  );
}
