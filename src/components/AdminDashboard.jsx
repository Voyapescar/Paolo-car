import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import ConfigPanel from './ConfigPanel';
import { uploadImage } from '../utils/imageStorage';
import { LayoutGrid, Settings, LogOut, ExternalLink, Plus, Pencil, Trash2, X, Upload, Loader2, Car, CheckCircle, XCircle } from 'lucide-react';
import logoImg from '../assets/images/Paolocar__2_-removebg-preview.png';

function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();

  const [activeSection, setActiveSection] = useState('vehicles');
  const [isEditing, setIsEditing] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', model: '', price: '', image: '',
    features: ['', '', '', '', ''],
    available: true
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => { logout(); navigate('/admin'); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setIsUploading(true);
    try {
      const { url } = await uploadImage(file, 'fleet');
      setFormData(prev => ({ ...prev, image: url }));
    } catch (err) {
      setUploadError(err.message || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

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
    if (window.confirm(`¿Eliminar "${name}"?`)) {
      try {
        await deleteVehicle(id);
        showToast(`"${name}" eliminado`);
      } catch {
        showToast('Error al eliminar el vehículo', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanFeatures = formData.features.filter(f => f.trim() !== '');
    if (cleanFeatures.length === 0) { showToast('Agrega al menos una característica', 'error'); return; }
    const vehicleData = { ...formData, features: cleanFeatures };
    setSaving(true);
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
        showToast('Vehículo actualizado correctamente');
      } else {
        await addVehicle(vehicleData);
        showToast('Vehículo agregado correctamente');
      }
      resetForm();
    } catch (err) {
      showToast('Error al guardar: ' + (err.message || 'Error desconocido'), 'error');
    } finally {
      setSaving(false);
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

  const inputClass = "w-full bg-[#0d0d0d] border border-stone-700 focus:border-gold-500/70 px-4 py-3 text-white placeholder-stone-600 outline-none transition-colors duration-200 text-sm";

  const navItems = [
    { id: 'vehicles', label: 'Vehículos', Icon: LayoutGrid },
    { id: 'config', label: 'Configuración', Icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 border text-sm shadow-xl transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-[#1a0a0a] border-red-500/30 text-red-400'
            : 'bg-[#0a1a0a] border-green-500/30 text-green-400'
        }`}>
          {toast.type === 'error'
            ? <XCircle className="w-4 h-4 flex-shrink-0" />
            : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="w-60 bg-[#111111] border-r border-stone-800/60 flex flex-col fixed top-0 left-0 h-full z-30">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-stone-800/60">
          <a href="/" className="flex items-center gap-3">
            <img src={logoImg} alt="Paolo" className="h-10 w-auto object-contain" />
          </a>
          <p className="text-stone-600 text-[9px] tracking-[0.4em] uppercase mt-3">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs tracking-[0.12em] uppercase transition-all duration-200 ${
                activeSection === id
                  ? 'text-gold-400 bg-gold-500/8 border-l-2 border-gold-500 pl-[14px]'
                  : 'text-stone-500 hover:text-stone-300 hover:bg-white/3 border-l-2 border-transparent pl-[14px]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-stone-800/60 space-y-0.5">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-stone-600 hover:text-stone-400 text-[10px] tracking-widest uppercase transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Ver Sitio
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-stone-600 hover:text-red-400 text-[10px] tracking-widest uppercase transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────── */}
      <main className="flex-1 ml-60 min-h-screen">
        {/* Header */}
        <div className="border-b border-stone-800/60 bg-[#0d0d0d] px-8 py-5 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold text-white tracking-wide">
                {activeSection === 'vehicles' ? 'Gestión de Vehículos' : 'Configuración del Sitio'}
              </h1>
              <p className="text-stone-500 text-xs mt-0.5 tracking-wide">
                {activeSection === 'vehicles'
                  ? `${vehicles.length} vehículo${vehicles.length !== 1 ? 's' : ''} registrado${vehicles.length !== 1 ? 's' : ''}`
                  : 'Edita los textos e información del sitio'}
              </p>
            </div>
            {activeSection === 'vehicles' && !isEditing && (
              <button
                onClick={() => { resetForm(); window.scrollTo({ top: 0 }); }}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs tracking-widest uppercase transition-colors duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo Vehículo
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {activeSection === 'config' ? (
            <ConfigPanel />
          ) : (
            <div className="grid xl:grid-cols-[420px_1fr] gap-8 items-start">

              {/* ── FORMULARIO ── */}
              <div className="bg-[#111111] border border-stone-800/60 p-7 sticky top-28">
                <div className="flex items-center justify-between mb-7 pb-5 border-b border-stone-800/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center border ${isEditing ? 'border-gold-500/40 bg-gold-500/8' : 'border-stone-700'}`}>
                      {isEditing ? <Pencil className="w-3.5 h-3.5 text-gold-400" /> : <Plus className="w-3.5 h-3.5 text-stone-400" />}
                    </div>
                    <h2 className="text-white text-sm font-medium tracking-[0.08em]">
                      {isEditing ? `Editando: ${editingVehicle?.name}` : 'Nuevo Vehículo'}
                    </h2>
                  </div>
                  {isEditing && (
                    <button onClick={resetForm} className="text-stone-600 hover:text-stone-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <FormField label="Nombre / Categoría">
                    <input type="text" value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: SUV, Económico, Premium" required className={inputClass} />
                  </FormField>

                  <FormField label="Modelo">
                    <input type="text" value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Ej: Hyundai Tucson 2024" required className={inputClass} />
                  </FormField>

                  <FormField label="Precio por Día">
                    <input type="text" value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Ej: $35.000" required className={inputClass} />
                  </FormField>

                  <FormField label="Imagen del Vehículo">
                    {/* Preview */}
                    <div className="w-full h-44 bg-[#0a0a0a] border border-stone-800 flex items-center justify-center mb-3 overflow-hidden">
                      {formData.image ? (
                        <img src={formData.image} alt="preview"
                          className="w-full h-full object-contain p-3"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-stone-700">
                          <Car className="w-10 h-10" />
                          <span className="text-xs tracking-wider">Sin imagen</span>
                        </div>
                      )}
                    </div>

                    <input ref={fileInputRef} type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload} className="hidden" />

                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-stone-700 hover:border-gold-500/50 py-3 text-stone-500 hover:text-gold-400 text-xs tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-wait mb-3">
                      {isUploading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...</>
                        : <><Upload className="w-3.5 h-3.5" /> Subir imagen</>}
                    </button>
                    {uploadError && <p className="text-red-400 text-xs mb-2">{uploadError}</p>}
                    <input type="url" value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      placeholder="O pega una URL de imagen..."
                      className={inputClass} />
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
                              onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })}
                              className="px-3 border border-stone-800 text-stone-600 hover:border-red-500/40 hover:text-red-400 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button"
                      onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                      className="mt-2 text-stone-600 hover:text-gold-400 text-xs tracking-wider transition-colors">
                      + Agregar característica
                    </button>
                  </FormField>

                  <label className="flex items-center gap-3 cursor-pointer py-1">
                    <div
                      onClick={() => setFormData({ ...formData, available: !formData.available })}
                      className={`w-10 h-5 relative transition-colors duration-200 cursor-pointer flex-shrink-0 ${formData.available ? 'bg-gold-500' : 'bg-stone-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white transition-transform duration-200 ${formData.available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-stone-400 text-xs tracking-wide">
                      {formData.available ? 'Vehículo disponible' : 'No disponible'}
                    </span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white text-xs tracking-[0.2em] uppercase font-medium transition-all duration-200">
                      {saving
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
                        : isEditing ? 'Actualizar Vehículo' : 'Agregar Vehículo'}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={resetForm}
                        className="px-5 border border-stone-700 text-stone-500 hover:text-stone-300 hover:border-stone-600 text-xs tracking-widest uppercase transition-colors">
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* ── LISTA DE VEHÍCULOS ── */}
              <div className="space-y-3">
                {vehicles.length === 0 && (
                  <div className="bg-[#111111] border border-stone-800/60 p-16 text-center">
                    <Car className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                    <p className="text-stone-600 text-sm tracking-wider">No hay vehículos registrados</p>
                    <p className="text-stone-700 text-xs mt-1">Agrega el primero usando el formulario</p>
                  </div>
                )}
                {vehicles.map(v => (
                  <div key={v.id}
                    className={`bg-[#111111] border transition-all duration-300 group ${
                      editingVehicle?.id === v.id
                        ? 'border-gold-500/40 shadow-[0_0_20px_rgba(220,38,38,0.08)]'
                        : 'border-stone-800/60 hover:border-stone-700'
                    }`}>
                    <div className="flex gap-0">
                      {/* Imagen */}
                      <div className="w-48 h-36 bg-[#0a0a0a] flex-shrink-0 flex items-center justify-center overflow-hidden border-r border-stone-800/60">
                        {v.image ? (
                          <img src={v.image} alt={v.name}
                            className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                            onError={e => { e.target.src = ''; e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Car className="w-10 h-10 text-stone-700" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div>
                              <h3 className="font-display text-lg font-semibold text-white leading-tight">{v.name}</h3>
                              <p className="text-stone-500 text-xs tracking-wider mt-0.5">{v.model}</p>
                            </div>
                            <span className={`text-[9px] tracking-widest uppercase px-2.5 py-1 border flex-shrink-0 ${
                              v.available
                                ? 'border-green-500/30 text-green-500/80 bg-green-500/5'
                                : 'border-stone-700 text-stone-600'
                            }`}>
                              {v.available ? 'Disponible' : 'No disponible'}
                            </span>
                          </div>
                          <p className="font-display text-2xl font-bold text-gold-400 mt-2">{v.price}<span className="text-stone-600 text-sm font-normal ml-1">/día</span></p>
                          {v.features?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {v.features.slice(0, 3).map((f, i) => (
                                <span key={i} className="text-[9px] tracking-wider text-stone-500 border border-stone-800 px-2 py-0.5 uppercase">{f}</span>
                              ))}
                              {v.features.length > 3 && (
                                <span className="text-[9px] tracking-wider text-stone-700 border border-stone-800/50 px-2 py-0.5 uppercase">+{v.features.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => handleEdit(v)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-stone-700 text-stone-400 hover:border-gold-500/40 hover:text-gold-400 text-[10px] uppercase tracking-widest transition-all duration-200">
                            <Pencil className="w-3 h-3" /> Editar
                          </button>
                          <button onClick={() => handleDelete(v.id, v.name)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-stone-700 text-stone-500 hover:border-red-500/40 hover:text-red-400 text-[10px] uppercase tracking-widest transition-all duration-200">
                            <Trash2 className="w-3 h-3" /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      {label && (
        <label className="block text-stone-500 text-[10px] tracking-[0.25em] uppercase mb-2">{label}</label>
      )}
      {children}
    </div>
  );
}

export default AdminDashboard;
