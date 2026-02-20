import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';

function Footer() {
  const { config } = useConfig();

  const links = [
    { href: '#reserva', label: 'Reservar' },
    { href: '#flota', label: 'Vehículos' },
    { href: '#contacto', label: 'Contacto' },
    { href: '#', label: 'Términos y Condiciones' },
    { href: '#', label: 'Política de Privacidad' },
  ];

  return (
    <footer className="bg-obsidian-900 border-t border-white/5">
      {/* Línea dorada superior */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {/* Logo central */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <a href="/" className="inline-flex flex-col items-center gap-1">
            <span className="font-display text-4xl font-bold text-cream-200 tracking-wide">
              PAOLO
            </span>
            <span className="text-[10px] tracking-[0.5em] text-gold-500 uppercase">
              Rent a Car
            </span>
          </a>
          <p className="text-white/25 text-sm mt-4 max-w-xs mx-auto font-light">
            {config.footerDescription}
          </p>
        </motion.div>

        {/* Links */}
        <motion.nav
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12"
        >
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="text-white/30 hover:text-gold-400 text-xs tracking-[0.15em] uppercase transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

        {/* Línea separadora */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/20 text-xs tracking-wider">
            <span>© {new Date().getFullYear()} Paolo Rent a Car. Todos los derechos reservados.</span>
            <span>Iquique, Chile</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
