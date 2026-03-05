import { useState } from 'react';
import { Save, RotateCcw, CheckCircle } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

function ConfigPanel() {
  const { config, updateConfig, resetConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState({ ...config });
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key, value) => setLocalConfig(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await updateConfig(localConfig);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm('¿Restaurar configuración por defecto?')) {
      resetConfig();
      setLocalConfig(config);
    }
  };

  const inputClass = "w-full bg-[#0d0d0d] border border-stone-700 focus:border-gold-500/70 px-4 py-3 text-white placeholder-stone-600 outline-none transition-colors duration-200 text-sm";

  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'booking', label: 'Reserva' },
    { id: 'fleet', label: 'Flota' },
    { id: 'footer', label: 'Contacto' },
  ];

  return (
    <div className="bg-[#111111] border border-stone-800/60 p-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-800/60">
        <div>
          <h2 className="font-display text-xl font-semibold text-white tracking-wide">Configuración del Sitio</h2>
          <p className="text-stone-500 text-xs mt-1 tracking-wide">Edita los textos e información que se muestran en el sitio</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-700 text-stone-500 hover:text-stone-300 hover:border-stone-600 text-[10px] tracking-widest uppercase transition-colors">
            <RotateCcw className="w-3 h-3" /> Restaurar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white text-[10px] tracking-widest uppercase transition-all duration-200">
            {saved
              ? <><CheckCircle className="w-3.5 h-3.5" /> Guardado</>
              : saving
                ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Guardando...</>
                : <><Save className="w-3.5 h-3.5" /> Guardar cambios</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-8 border-b border-stone-800/60">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-[10px] tracking-[0.2em] uppercase transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-gold-400 border-gold-500'
                : 'text-stone-600 border-transparent hover:text-stone-400'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 max-w-2xl">
        {activeTab === 'hero' && (
          <>
            <Field label="Título principal" value={localConfig.heroTitle} onChange={v => set('heroTitle', v)} inputClass={inputClass} />
            <Field label="Subtítulo (itálica en rojo)" value={localConfig.heroSubtitle} onChange={v => set('heroSubtitle', v)} inputClass={inputClass} />
            <Field label="Descripción" value={localConfig.heroDescription} onChange={v => set('heroDescription', v)} inputClass={inputClass} textarea />
            <Field label="Badge / Etiqueta" value={localConfig.heroBadge} onChange={v => set('heroBadge', v)} inputClass={inputClass} />
          </>
        )}
        {activeTab === 'booking' && (
          <>
            <Field label="Título de sección reserva" value={localConfig.bookingTitle} onChange={v => set('bookingTitle', v)} inputClass={inputClass} />
            <Field label="Descripción" value={localConfig.bookingDescription} onChange={v => set('bookingDescription', v)} inputClass={inputClass} textarea />
          </>
        )}
        {activeTab === 'fleet' && (
          <>
            <Field label="Título de sección flota" value={localConfig.fleetTitle} onChange={v => set('fleetTitle', v)} inputClass={inputClass} />
            <Field label="Subtítulo" value={localConfig.fleetSubtitle} onChange={v => set('fleetSubtitle', v)} inputClass={inputClass} />
          </>
        )}
        {activeTab === 'footer' && (
          <>
            <Field label="Descripción del footer" value={localConfig.footerDescription} onChange={v => set('footerDescription', v)} inputClass={inputClass} textarea />
            <Field label="Teléfono" value={localConfig.footerPhone} onChange={v => set('footerPhone', v)} inputClass={inputClass} />
            <Field label="Email" value={localConfig.footerEmail} onChange={v => set('footerEmail', v)} inputClass={inputClass} />
            <Field label="Dirección" value={localConfig.footerAddress} onChange={v => set('footerAddress', v)} inputClass={inputClass} />
            <Field label="Número WhatsApp (sin + ni espacios)" value={localConfig.whatsappNumber} onChange={v => set('whatsappNumber', v)} inputClass={inputClass} />
            <Field label="Mensaje predeterminado WhatsApp" value={localConfig.whatsappMessage} onChange={v => set('whatsappMessage', v)} inputClass={inputClass} textarea />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, inputClass, textarea }) {
  return (
    <div>
      <label className="block text-stone-500 text-[10px] tracking-[0.25em] uppercase mb-2">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      ) : (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

export default ConfigPanel;
