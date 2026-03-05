import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import logoImg from '../assets/images/Paolocar__2_-removebg-preview.png';

const WA_ICON = () => (
  <svg className="w-4 h-4 flex-shrink-0 text-green-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const PHONE = '+56 9 9394 4317';
const WA_NUMBER = '56993944317';
const EMAIL = 'contacto@paolocar.cl';

function Footer() {
  const { config } = useConfig();

  const links = [
    { href: '#reserva', label: 'Reservar' },
    { href: '#flota', label: 'Vehículos' },
    { href: '#contacto', label: 'Contacto' },
  ];

  return (
    <footer className="bg-stone-900 border-t border-stone-800">
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
          <a href="/" className="inline-flex flex-col items-center gap-3 group">
            <img
              src={logoImg}
              alt="Paolo Rent a Car"
              className="h-52 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          </a>
          <p className="text-stone-400 text-sm mt-4 max-w-xs mx-auto font-light">
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
              className="text-stone-400 hover:text-gold-500 text-xs tracking-[0.15em] uppercase transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

        {/* Contacto */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
        >
          {/* Teléfono + WhatsApp */}
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-stone-400" />
            <span className="text-stone-300 text-sm font-medium">{PHONE}</span>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, me gustaría información sobre el arriendo de vehículos Paolo Rent a Car')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              title="Escríbenos por WhatsApp"
              className="hover:scale-110 transition-transform duration-200"
            >
              <WA_ICON />
            </a>
          </div>

          <div className="w-px h-4 bg-stone-700 hidden sm:block" />

          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-stone-400" />
            <a
              href={`mailto:${EMAIL}`}
              className="text-stone-300 text-sm font-medium hover:text-gold-400 transition-colors duration-200"
            >
              {EMAIL}
            </a>
          </div>
        </motion.div>

        {/* Línea separadora */}
        <div className="border-t border-stone-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500 text-xs tracking-wider">
            <span>© {new Date().getFullYear()} Paolo Rent a Car. Todos los derechos reservados.</span>
            <span>Iquique, Chile</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
