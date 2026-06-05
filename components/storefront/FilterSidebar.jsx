'use client';

const BRANDS = ['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'IWC', 'Breitling', 'Jaeger-LeCoultre', 'Hublot', 'TAG Heuer'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name A–Z' },
];
export default function FilterSidebar({ filters, onChange }) {
  const { brands = [], genders = [], minPrice = '', maxPrice = '', condition = '', sort = 'newest' } = filters;

  const toggleBrand = (brand) => {
    const next = brands.includes(brand)
      ? brands.filter((b) => b !== brand)
      : [...brands, brand];
    onChange({ ...filters, brands: next });
  };

  const toggleGender = (gender) => {
    const next = genders.includes(gender)
      ? genders.filter((g) => g !== gender)
      : [...genders, gender];
    onChange({ ...filters, genders: next });
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Scrollbar overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        .brand-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .brand-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .brand-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(201, 168, 76, 0.2);
          border-radius: 10px;
        }
        .brand-list-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 168, 76, 0.4);
        }
      ` }} />

      <div className="bg-[#111111]/90 backdrop-blur-[2px] border border-white/[0.05] p-6 space-y-8 sticky top-20 rounded-sm hover:shadow-[0_8px_30px_rgba(201,168,76,0.02)] transition-all duration-300">
        <div>
          <h2 className="font-display text-white text-lg font-medium uppercase tracking-wider">
            Filters
          </h2>
          <div className="w-8 h-[1px] bg-[#C9A84C]/40 mt-2" />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-white/40 text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-3">
            Sort By
          </label>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onChange({ ...filters, sort: e.target.value })}
              className="w-full bg-[#161616] border border-white/[0.08] text-white/80 font-body text-xs uppercase tracking-wider px-4 py-3 pr-10 focus:border-[#C9A84C] focus:outline-none appearance-none cursor-pointer rounded-sm transition-colors duration-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111111]">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-white/40 text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-3">
            Gender
          </label>
          <div className="space-y-2.5">
            {['Men', 'Women', 'Unisex'].map((gender) => (
              <label key={gender} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={genders.includes(gender)}
                  onChange={() => toggleGender(gender)}
                  className="w-4 h-4 border border-white/20 bg-[#161616] accent-[#C9A84C] rounded-sm focus:ring-0 focus:ring-offset-0 checked:bg-[#C9A84C] checked:border-[#C9A84C] cursor-pointer"
                />
                <span className="text-white/60 group-hover:text-[#C9A84C] font-body text-sm transition-colors duration-200">
                  {gender}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-white/40 text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-3">
            Brand
          </label>
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 brand-list-scroll">
            {BRANDS.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 border border-white/20 bg-[#161616] accent-[#C9A84C] rounded-sm focus:ring-0 focus:ring-offset-0 checked:bg-[#C9A84C] checked:border-[#C9A84C] cursor-pointer"
                />
                <span className="text-white/60 group-hover:text-[#C9A84C] font-body text-sm transition-colors duration-200">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-white/40 text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-3">
            Price Range (₹)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              className="w-full bg-[#161616] border border-white/[0.08] text-white font-body text-xs px-3.5 py-2.5 rounded-sm focus:border-[#C9A84C] focus:outline-none placeholder:text-white/25 transition-all duration-300"
            />
            <span className="text-white/20 font-body text-xs">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              className="w-full bg-[#161616] border border-white/[0.08] text-white font-body text-xs px-3.5 py-2.5 rounded-sm focus:border-[#C9A84C] focus:outline-none placeholder:text-white/25 transition-all duration-300"
            />
          </div>
        </div>

        {/* Clear */}
        <button
          onClick={() => onChange({ brands: [], genders: [], minPrice: '', maxPrice: '', condition: '', sort: 'newest' })}
          className="w-full text-[#C9A84C]/60 hover:text-[#C9A84C] font-body text-[10px] font-semibold uppercase tracking-wider underline transition-colors duration-300 pt-2"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
}
