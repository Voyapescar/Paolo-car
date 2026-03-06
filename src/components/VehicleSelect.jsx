import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Car, Check } from 'lucide-react';

/**
 * VehicleSelect — custom dropdown for selecting a vehicle.
 * Emits onChange({ target: { name, value } }) — compatible with existing handleChange.
 *
 * Props:
 *   name        string   form field name
 *   value       string   currently selected vehicle name
 *   vehicles    array    [{id, name, model, price, available, image}]
 *   loading     bool     show loading skeleton
 *   onChange    fn       handleChange(e)
 *   onBlur      fn       handleBlur(fieldName)
 *   hasError    bool     show red border
 *   variant     "light" | "dark"   default "light"
 */
export default function VehicleSelect({
  name,
  value,
  vehicles = [],
  loading = false,
  onChange,
  onBlur,
  hasError = false,
  variant = 'light',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const isDark = variant === 'dark';

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = vehicles.find((v) => v.name === value) || null;

  const handleSelect = (vehicle) => {
    onChange({ target: { name, value: vehicle.name } });
    setOpen(false);
    if (onBlur) onBlur();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
    if (onBlur) onBlur();
  };

  /* ── Styles per variant ── */
  const triggerBase = isDark
    ? `w-full flex items-center gap-3 border-b pb-3 pt-2 text-left transition-colors duration-200 ${
        hasError
          ? 'border-red-400'
          : open
          ? 'border-yellow-500'
          : 'border-stone-700 hover:border-stone-500'
      } bg-transparent`
    : `w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors duration-200 shadow-sm ${
        hasError
          ? 'border-red-400 bg-red-50'
          : open
          ? 'border-yellow-400 bg-white'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`;

  const panelBase = isDark
    ? 'absolute z-50 left-0 right-0 top-full mt-2 bg-stone-900 border border-stone-700 shadow-2xl overflow-hidden'
    : 'absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden';

  const cardBase = (isSelected) =>
    isDark
      ? `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
          isSelected
            ? 'bg-yellow-500/10 border-l-2 border-yellow-500'
            : 'border-l-2 border-transparent hover:bg-stone-800'
        }`
      : `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
          isSelected
            ? 'bg-yellow-50 border-l-2 border-yellow-500'
            : 'border-l-2 border-transparent hover:bg-stone-50'
        }`;

  const placeholderText = loading ? 'Cargando vehículos...' : 'Selecciona un vehículo';
  const available = vehicles.filter((v) => v.available !== false);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !loading && setOpen((o) => !o)}
        disabled={loading}
        className={`${triggerBase} ${loading ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
      >
        {/* Left icon / thumbnail */}
        {selected?.image ? (
          <span className={`flex-shrink-0 overflow-hidden flex items-center justify-center ${isDark ? 'w-10 h-8 rounded bg-stone-800' : 'w-12 h-9 rounded-lg bg-stone-100'}`}>
            <img
              src={selected.image}
              alt={selected.name}
              className="w-full h-full object-contain p-1"
            />
          </span>
        ) : (
          <span className={`flex-shrink-0 flex items-center justify-center rounded-xl ${isDark ? 'w-10 h-8 bg-stone-800' : 'w-12 h-9 bg-stone-100 rounded-lg'}`}>
            <Car className={`w-4 h-4 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
          </span>
        )}

        {/* Text */}
        <span className="flex-1 min-w-0">
          {selected ? (
            <>
              <span className={`block font-medium truncate text-sm ${isDark ? 'text-white' : 'text-stone-800'}`}>
                {selected.name}
              </span>
              <span className={`block text-xs truncate mt-0.5 ${isDark ? 'text-white/70' : 'text-stone-400'}`}>
                {selected.model} · {selected.price}/día
              </span>
            </>
          ) : (
            <span className={`text-sm ${isDark ? 'text-white/50' : 'text-stone-400'}`}>
              {placeholderText}
            </span>
          )}
        </span>

        {/* Right: clear + chevron */}
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <span
              onClick={handleClear}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-stone-300 hover:text-stone-500'}`}
              title="Quitar selección"
            >
              ✕
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isDark ? 'text-white' : 'text-yellow-500'}`}
          />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={panelBase}>
          {available.length === 0 ? (
            <p className={`px-4 py-6 text-center text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
              No hay vehículos disponibles
            </p>
          ) : (
            <ul className={`max-h-64 overflow-y-auto divide-y ${isDark ? 'divide-stone-800' : 'divide-stone-100'}`}>
              {available.map((v) => {
                const isSelected = v.name === value;
                return (
                  <li key={v.id} onClick={() => handleSelect(v)} className={cardBase(isSelected)}>
                    {/* Thumbnail */}
                    {v.image ? (
                      <span className={`flex-shrink-0 overflow-hidden flex items-center justify-center ${isDark ? 'w-14 h-10 rounded bg-stone-800' : 'w-16 h-11 rounded-lg bg-stone-100'}`}>
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-full h-full object-contain p-1.5"
                        />
                      </span>
                    ) : (
                      <span className={`flex-shrink-0 flex items-center justify-center ${isDark ? 'w-14 h-10 rounded bg-stone-800' : 'w-16 h-11 rounded-lg bg-stone-100'}`}>
                        <Car className={`w-5 h-5 ${isDark ? 'text-stone-600' : 'text-stone-300'}`} />
                      </span>
                    )}

                    {/* Info */}
                    <span className="flex-1 min-w-0">
                      <span className={`block font-medium text-sm truncate ${isDark ? 'text-white' : 'text-stone-800'}`}>
                        {v.name}
                      </span>
                      {v.model && (
                        <span className={`block text-xs truncate mt-0.5 ${isDark ? 'text-white/60' : 'text-stone-400'}`}>
                          {v.model}
                        </span>
                      )}
                    </span>

                    {/* Price + check */}
                    <span className="flex flex-col items-end flex-shrink-0 gap-1">
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-yellow-600'}`}>
                        {v.price}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-white/50' : 'text-stone-400'}`}>/día</span>
                    </span>

                    {isSelected && (
                      <Check className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
