import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logoImg from '../assets/images/Paolocar__2_-removebg-preview.png';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (login(password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-gold-500/[0.03] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-gold-500/[0.05] rounded-full" />
        <div className="absolute top-1/2 left-0 w-64 h-px bg-gradient-to-r from-transparent to-gold-500/10" />
        <div className="absolute top-1/2 right-0 w-64 h-px bg-gradient-to-l from-transparent to-gold-500/10" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-block">
            <img src={logoImg} alt="Paolo Rent a Car" className="h-24 w-auto mx-auto object-contain opacity-95" />
          </a>
          <div className="flex items-center gap-3 justify-center mt-6">
            <div className="flex-1 h-px bg-stone-800" />
            <span className="text-stone-500 text-[10px] tracking-[0.4em] uppercase">Panel Admin</span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-stone-800 p-8">
          {/* Header card */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-800">
            <div className="w-9 h-9 border border-gold-500/30 bg-gold-500/5 flex items-center justify-center">
              <Lock className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <h1 className="text-white text-sm font-medium tracking-[0.1em]">Acceso Restringido</h1>
              <p className="text-stone-500 text-xs tracking-wider mt-0.5">Solo personal autorizado</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-stone-400 text-[10px] tracking-[0.25em] uppercase mb-3">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••"
                  autoFocus
                  className={`w-full bg-[#0a0a0a] border px-4 py-3.5 pr-12 text-white placeholder-stone-700 focus:outline-none transition-all duration-200 text-sm tracking-widest ${
                    error
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-stone-700 focus:border-gold-500/70'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-400 transition-colors"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  <p className="text-red-400 text-xs tracking-wide">{error}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full relative overflow-hidden py-4 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs tracking-[0.25em] uppercase font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Verificando...
                </>
              ) : (
                'Ingresar al Panel'
              )}
            </button>
          </form>
        </div>

        {/* Volver */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-400 text-xs tracking-[0.15em] uppercase transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al sitio
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
