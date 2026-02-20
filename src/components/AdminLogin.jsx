import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-900 flex items-center justify-center px-6">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold-500/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold-500/8 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-gold-500/10 rounded-full" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <a href="/" className="inline-flex flex-col items-center gap-1">
            <span className="font-display text-3xl font-bold text-cream-200">PAOLO</span>
            <span className="text-[10px] tracking-[0.5em] text-gold-500 uppercase">Rent a Car</span>
          </a>
          <p className="text-white/30 text-xs tracking-[0.2em] uppercase mt-6">Panel de Administración</p>
        </div>

        {/* Card */}
        <div className="bg-obsidian-800 border border-white/5 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 border border-gold-500/30 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-gold-500" />
            </div>
            <h1 className="text-cream-200 text-sm tracking-[0.15em] uppercase">Acceso Restringido</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-white/30 text-xs tracking-[0.2em] uppercase mb-3">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className={`w-full bg-transparent border-b pb-3 pt-2 text-cream-200 placeholder-white/20 focus:outline-none transition-colors duration-300 ${
                  error ? 'border-red-500' : 'border-white/20 focus:border-gold-500'
                }`}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-xs mt-2 tracking-wide">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-gold w-full justify-center py-4"
            >
              <span>Ingresar</span>
            </button>
          </form>
        </div>

        {/* Volver */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/25 hover:text-gold-400 text-xs tracking-[0.15em] uppercase transition-colors duration-300"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
