import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Car, ParkingCircle, Sparkles } from 'lucide-react';
import logoImg from '../assets/images/Paolocar__2_-removebg-preview.png';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { href: '#reserva', label: 'Reservar' },
    { href: '#flota', label: 'Vehículos' },
    { href: '#contacto', label: 'Contacto' },
  ];

  const services = [
    { icon: Sparkles, label: 'Car Wash', description: 'Lavado profesional' },
    { icon: ParkingCircle, label: 'Estacionamiento', description: 'Espacios seguros' },
    { icon: Car, label: 'Rent a Car', description: 'Alquiler de vehículos' },
  ];

  // Colores adaptativos: blanco sobre foto oscura, oscuro sobre fondo claro
  const linkCls = scrolled
    ? 'text-stone-300 hover:text-gold-500'
    : 'text-white/80 hover:text-white';
  const logoCls   = scrolled ? 'text-white' : 'text-white';
  const sublogoCls = scrolled ? 'text-gold-500' : 'text-white/60';
  const mobileBtnCls = scrolled ? 'text-stone-300' : 'text-white';

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-stone-950/97 backdrop-blur-xl border-b border-white/5 shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center group mt-10">
            <img
              src={logoImg}
              alt="Paolo Rent a Car"
              className="h-64 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          </a>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-10">
            {menuItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`relative text-sm tracking-[0.1em] transition-colors duration-300 uppercase font-medium group py-1 ${linkCls}`}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gold-500 group-hover:w-full transition-all duration-400" />
              </motion.a>
            ))}

            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`relative flex items-center gap-1 text-sm tracking-[0.1em] transition-colors duration-300 uppercase font-medium group py-1 ${linkCls}`}
              >
                Servicios
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${servicesOpen ? 'rotate-180 text-gold-400' : ''}`}
                />
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gold-500 group-hover:w-full transition-all duration-400" />
              </motion.button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-stone-950 border border-white/10 shadow-xl overflow-hidden"
                  >
                    {services.map(({ icon: Icon, label, description }) => (
                      <button
                        key={label}
                        onClick={() => setServicesOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-colors duration-200 group/item border-b border-white/5 last:border-0"
                      >
                        <span className="flex-shrink-0 w-8 h-8 bg-white/5 flex items-center justify-center group-hover/item:bg-gold-500/10 transition-colors duration-200">
                          <Icon className="w-4 h-4 text-gold-500" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-xs font-semibold text-stone-200 tracking-wide uppercase">{label}</span>
                          <span className="text-[10px] text-stone-400">{description}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.a
              href="#reserva"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={scrolled ? 'btn-gold' : 'relative inline-flex items-center justify-center gap-2 px-8 py-3 border border-white text-white text-xs tracking-[0.2em] uppercase font-medium hover:bg-white hover:text-stone-900 transition-colors duration-300'}
            >
              <span>Reservar Ahora</span>
            </motion.a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 transition-colors ${mobileBtnCls}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-stone-950 border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-1">
              {menuItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-stone-400 hover:text-gold-500 text-sm tracking-[0.15em] uppercase border-b border-white/5 transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
              {/* Mobile Services */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: menuItems.length * 0.06 }}
                className="border-b border-white/5"
              >
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full flex items-center justify-between py-3 text-stone-400 hover:text-gold-500 text-sm tracking-[0.15em] uppercase transition-colors"
                >
                  Servicios
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180 text-gold-400' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-2 space-y-1">
                        {services.map(({ icon: Icon, label }) => (
                          <div
                            key={label}
                            className="flex items-center gap-3 py-2 pl-3 text-stone-500 text-xs tracking-widest uppercase"
                          >
                            <Icon className="w-3.5 h-3.5 text-gold-500" />
                            {label}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="pt-4">
                <a
                  href="#reserva"
                  onClick={() => setIsOpen(false)}
                  className="btn-gold w-full justify-center"
                >
                  <span>Reservar Ahora</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
