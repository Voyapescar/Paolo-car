import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import ConfigPanel from './ConfigPanel';
import { LayoutGrid, Settings, LogOut, ExternalLink, Plus, Pencil, Trash2, X } from 'lucide-react';

function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();

  const [activeSection, setActiveSection] = useState('vehicles');
  const [isEditing, setIsEditing] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showImageHelper, setShowImageHelper] = useState(false);

  const [formData, setFormData] = useState({
    name: '', model: '', price: '', image: '',
    features: ['', '', '', '', ''],
    available: true
  });

  const handleLogout = () => { logout(); navigate('/admin'); };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name, model: vehicle.model,
      price: vehicle.price, image: vehicle.image,
      features: [...vehicle.features, '', '', '', '', ''].slice(0, 5),
      available: vehicle.available
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Eliminar ${name}?`)) {
      try { await deleteVehicle(id); }
      catch (e) { alert('Error al eliminar el vehículo'); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanFeatures = formData.features.filter(f => f.trim() !== '');
    if (cleanFeatures.length === 0) { alert('Agrega al menos una característica'); return; }
    const vehicleData = { ...formData, features: cleanFeatures };
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
        alert('Vehículo actualizado');
      } else {
        await addVehicle(vehicleData);
        alert('Vehículo agregado');
      }
      resetForm();
    } catch (err) {
      alert('Error al guardar: ' + (err.message || 'Error desconocido'));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', model: '', price: '', image: '', features: ['', '', '', '', ''], available: true });
    setIsEditing(false);
    setEditingVehicle(null);
  };

  const handleFeatureChange = (i, v) => {
    const f = [...formData.features]; f[i] = v;
    setFormData({ ...formData, features: f });
  };

  const inputClass = "w-full bg-obsidian-900 border border-white/10 focus:border-gold-500 px-4 py-3 text-cream-200 placeholder-white/20 outline-none transition-colors duration-200 text-sm";

  const navItems = [
    { id: 'vehicles', label: 'Vehículos', Icon: LayoutGrid },
    { id: 'config',   label: 'Configuración', Icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-obsidian-900 flex">
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="w-64 bg-obsidian-800 border-r border-white/5 flex flex-col fixed top-0 left-0 h-full z-30">
        {/* Logo */}
        <div className="px-8 py-8 border-b border-white/5">
          <a href="/" className="flex flex-col gap-0.5">
            <span className="font-display text-2xl font-bold text-cream-200">PAOLO</span>
            <span className="text-[9px] tracking-[0.5em] text-gold-500 uppercase">Rent a Car</span>
          </a>
          <p className="text-white/20 text-[10px] tracking-wider uppercase mt-3">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm tracking-[0.1em] uppercase transition-all duration-200 ${
                activeSection === id
                  ? 'text-gold-400 border-l border-gold-500 bg-gold-500/5'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/3'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="px-4 py-6 border-t border-white/5 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-white/25 hover:text-white/50 text-xs tracking-widest uppercase transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver Sitio
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400/50 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────── */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Header */}
        <div className="border-b border-white/5 px-10 py-6">
          <h1 className="font-display text-2xl font-semibold text-cream-200">
            {activeSection === 'vehicles' ? 'Gestión de Vehículos' : 'Configuración del Sitio'}
          </h1>
          <p className="text-white/25 text-sm mt-1">
            {activeSection === 'vehicles'
              ? `${vehicles.length} vehículo${vehicles.length !== 1 ? 's' : ''} registrado${vehicles.length !== 1 ? 's' : ''}`
              : 'Edita los textos e información del sitio'}
          </p>
        </div>

        <div className="p-10">
          {activeSection === 'config' ? (
            <ConfigPanel />
          ) : (
            <div className="grid xl:grid-cols-2 gap-8">
              {/* ── FORMULARIO ── */}
              <div className="bg-obsidian-800 border border-white/5 p-8">
                <h2 className="font-display text-xl font-semibold text-cream-200 mb-8 flex items-center gap-3">
                  <Plus className="w-4 h-4 text-gold-500" />
                  {isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <FormField label="Nombre" inputClass={inputClass}>
                    <input type="text" value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Económico, SUV, Sedan" required className={inputClass} />
                  </FormField>

                  <FormField label="Modelo" inputClass={inputClass}>
                    <input type="text" value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Ej: Hyundai i10 2024" required className={inputClass} />
                  </FormField>

                  <FormField label="Precio por Día" inputClass={inputClass}>
                    <input type="text" value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Ej: $35.000" required className={inputClass} />
                  </FormField>

                  <FormField label="URL de Imagen" inputClass={inputClass}>
                    {formData.image && (
                      <img src={formData.image} alt="preview"
                        className="w-full h-36 object-cover mb-3 grayscale"
                        onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=Sin+imagen'; }}
                      />
                    )}
                    <input type="url" value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..." required className={inputClass} />
                    <button type="button" onClick={() => setShowImageHelper(true)}
                      className="mt-2 text-gold-500/60 hover:text-gold-400 text-xs tracking-wider transition-colors">
                      ¿Cómo subir imágenes? →
                    </button>
                  </FormField>

                  <FormField label="Características">
                    <div className="space-y-2">
                      {formData.features.map((feat, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={feat}
                            onChange={e => handleFeatureChange(i, e.target.value)}
                            placeholder={`Característica ${i + 1}`}
                            className={inputClass} />
                          {formData.features.length > 1 && (
                            <button type="button"
                              onClick={() => {
                                const f = formData.features.filter((_, idx) => idx !== i);
                                setFormData({ ...formData, features: f });
                              }}
                              className="px-3 border border-red-500/30 text-red-400 hover:border-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button"
                      onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                      className="mt-2 text-white/25 hover:text-gold-400 text-xs tracking-wider transition-colors">
                      + Agregar característica
                    </button>
                  </FormField>

                  <FormField label="">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.available}
                        onChange={e => setFormData({ ...formData, available: e.target.checked })}
                        className="w-4 h-4 accent-gold-500" />
                      <span className="text-white/50 text-sm">Vehículo disponible</span>
                    </label>
                  </FormField>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-gold flex-1 justify-center py-4">
                      <span>{isEditing ? 'Actualizar' : 'Agregar Vehículo'}</span>
                    </button>
                    {isEditing && (
                      <button type="button" onClick={resetForm}
                        className="px-6 border border-white/10 text-white/30 hover:text-white/60 text-xs tracking-widest uppercase transition-colors">
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* ── LISTA ── */}
              <div className="space-y-3 max-h-[800px] overflow-y-auto">
                {vehicles.length === 0 && (
                  <div className="bg-obsidian-800 border border-white/5 p-12 text-center">
                    <p className="text-white/20 text-sm tracking-wider">No hay vehículos registrados</p>
                  </div>
                )}
                {vehicles.map(v => (
                  <div key={v.id}
                    className="bg-obsidian-800 border border-white/5 hover:border-gold-500/30 p-5 flex gap-4 transition-colors duration-300 group">
                    <div className="relative w-28 h-20 flex-shrink-0 overflow-hidden">
                      <img src={v.image} alt={v.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-filter duration-500"
                        onError={e => { e.target.src = 'https://via.placeholder.com/200x150?text=Sin+imagen'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-cream-200">{v.name}</h3>
                          <p className="text-white/30 text-xs tracking-wider">{v.model}</p>
                        </div>
                        <span className={`text-[10px] tracking-widest uppercase px-2 py-1 border flex-shrink-0 ${
                          v.available
                            ? 'border-gold-500/30 text-gold-500/70'
                            : 'border-white/10 text-white/20'
                        }`}>
                          {v.available ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                      <p className="font-display text-xl font-bold text-gold-400 mt-2">{v.price}/día</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleEdit(v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-white/40 hover:border-gold-500/40 hover:text-gold-400 text-xs uppercase tracking-widest transition-all duration-200">
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        <button onClick={() => handleDelete(v.id, v.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-white/30 hover:border-red-500/40 hover:text-red-400 text-xs uppercase tracking-widest transition-all duration-200">
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal ayuda imágenes */}
      {showImageHelper && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-obsidian-800 border border-white/10 max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-semibold text-cream-200">Cómo subir imágenes</h3>
              <button onClick={() => setShowImageHelper(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-white/50 text-sm leading-relaxed">
              <p><span className="text-gold-400 font-medium">Opción 1 - Vercel Blob:</span> Ve a vercel.com/dashboard/stores → sube tu imagen → copia la URL pública.</p>
              <p><span className="text-gold-400 font-medium">Opción 2 - Imgur:</span> Sube en imgur.com y copia el enlace directo (.jpg/.png).</p>
              <p><span className="text-gold-400 font-medium">Opción 3 - Cloudinary:</span> Servicio profesional de imágenes gratuito.</p>
              <p className="text-white/25 text-xs">La URL debe ser pública y terminar en .jpg, .png, .webp o .gif.</p>
            </div>
            <button onClick={() => setShowImageHelper(false)} className="btn-gold w-full justify-center py-3 mt-6">
              <span>Entendido</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      {label && (
        <label className="block text-white/30 text-xs tracking-[0.2em] uppercase mb-2">{label}</label>
      )}
      {children}
    </div>
  );
}

export default AdminDashboard;
