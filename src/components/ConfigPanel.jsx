import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

function ConfigPanel() {
  const { config, updateConfig, resetConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState({ ...config });
  const [activeTab, setActiveTab] = useState('hero');

  const set = (key, value) => setLocalConfig(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateConfig(localConfig);
    alert('Configuración guardada exitosamente');
  };

  const handleReset = () => {
    if (confirm('¿Restaurar configuración por defecto?')) {
      resetConfig();
      setLocalConfig(config);
    }
  };

  const inputClass = "w-full bg-obsidian-900 border border-white/10 focus:border-gold-500 px-4 py-3 text-cream-200 placeholder-white/20 outline-none transition-colors duration-200 text-sm";

  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'booking', label: 'Reserva' },
    { id: 'fleet', label: 'Flota' },
    { id: 'footer', label: 'Footer / Contacto' },
  ];

  return (
    <div className="bg-obsidian-800 border border-white/5 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-cream-200">Configuración del Sitio</h2>
        <div className="flex gap-3">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/40 hover:text-white/70 text-xs tracking-widest uppercase transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar
          </button>
          <button onClick={handleSave} className="btn-gold">
            <Save className="w-3.5 h-3.5 relative z-10" />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-xs tracking-[0.15em] uppercase transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-gold-400 border-b border-gold-500'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6 max-w-2xl">
        {activeTab === 'hero' && (
          <>
            <Field label="Título principal" value={localConfig.heroTitle} onChange={v => set('heroTitle', v)} inputClass={inputClass} />
            <Field label="Subtítulo (itálica dorada)" value={localConfig.heroSubtitle} onChange={v => set('heroSubtitle', v)} inputClass={inputClass} />
            <Field label="Descripción" value={localConfig.heroDescription} onChange={v => set('heroDescription', v)} inputClass={inputClass} textarea />
            <Field label="Badge/etiqueta" value={localConfig.heroBadge} onChange={v => set('heroBadge', v)} inputClass={inputClass} />
          </>
        )}
        {activeTab === 'booking' && (
          <>
            <Field label="Título de sección" value={localConfig.bookingTitle} onChange={v => set('bookingTitle', v)} inputClass={inputClass} />
            <Field label="Descripción" value={localConfig.bookingDescription} onChange={v => set('bookingDescription', v)} inputClass={inputClass} textarea />
          </>
        )}
        {activeTab === 'fleet' && (
          <>
            <Field label="Título de sección" value={localConfig.fleetTitle} onChange={v => set('fleetTitle', v)} inputClass={inputClass} />
            <Field label="Subtítulo" value={localConfig.fleetSubtitle} onChange={v => set('fleetSubtitle', v)} inputClass={inputClass} />
          </>
        )}
        {activeTab === 'footer' && (
          <>
            <Field label="Descripción del footer" value={localConfig.footerDescription} onChange={v => set('footerDescription', v)} inputClass={inputClass} textarea />
            <Field label="Teléfono" value={localConfig.footerPhone} onChange={v => set('footerPhone', v)} inputClass={inputClass} />
            <Field label="Email" value={localConfig.footerEmail} onChange={v => set('footerEmail', v)} inputClass={inputClass} />
            <Field label="Dirección" value={localConfig.footerAddress} onChange={v => set('footerAddress', v)} inputClass={inputClass} />
            <Field label="Número WhatsApp (sin +)" value={localConfig.whatsappNumber} onChange={v => set('whatsappNumber', v)} inputClass={inputClass} />
            <Field label="Mensaje WhatsApp" value={localConfig.whatsappMessage} onChange={v => set('whatsappMessage', v)} inputClass={inputClass} textarea />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, inputClass, textarea }) {
  return (
    <div>
      <label className="block text-white/30 text-xs tracking-[0.2em] uppercase mb-2">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      ) : (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

export default ConfigPanel;
