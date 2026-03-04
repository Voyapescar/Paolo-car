import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

function Contact() {
  const { config } = useConfig();

  const contactItems = [
    { Icon: Phone, label: 'Teléfono', value: config.footerPhone || '+56 9 XXXX XXXX', href: `tel:${config.footerPhone}` },
    { Icon: Mail, label: 'Email', value: config.footerEmail || 'contacto@paolorentacar.cl', href: `mailto:${config.footerEmail}` },
    { Icon: MapPin, label: 'Ubicación', value: config.footerAddress || 'Iquique, Chile', href: '#' },
    { Icon: Clock, label: 'Horario', value: 'Lun–Vie 8:00–20:00\nSáb–Dom 9:00–18:00', href: '#' },
  ];

  return (
    <section id="contacto" className="bg-obsidian-900 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Columna izquierda: texto + datos */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="section-label mb-6">— Contacto</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-6">
              Estamos aquí<br />
              <span className="italic text-gold-500">para ti</span>
            </h2>
            <p className="text-stone-400 text-lg leading-relaxed mb-12 max-w-md">
              ¿Tienes alguna consulta o deseas una cotización personalizada? Contáctanos directamente y con gusto te ayudamos.
            </p>

            <div className="space-y-8">
              {contactItems.map(({ Icon, label, value, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="flex items-start gap-5 group cursor-pointer"
                >
                  <div className="w-10 h-10 border border-gold-500/30 flex items-center justify-center flex-shrink-0 group-hover:border-gold-500 group-hover:bg-gold-500/10 transition-all duration-300">
                    <Icon className="w-4 h-4 text-gold-500" />
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-1">{label}</p>
                    <p className="text-stone-900 whitespace-pre-line group-hover:text-gold-500 transition-colors duration-300">
                      {value}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>

          </motion.div>

          {/* Columna derecha: tarjetas de beneficios */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: '24/7', label: 'Disponible', sub: 'Siempre para ti' },
              { value: 'KM ∞', label: 'Ilimitados', sub: 'Sin restricciones' },
              { value: 'Car\nWash', label: 'Incluido', sub: 'Servicio completo' },
              { value: 'GPS', label: 'Incluido', sub: 'Navegación libre' },
            ].map(({ value, label, sub }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="group border border-stone-200 hover:border-gold-400/60 bg-white p-6 flex flex-col justify-between transition-colors duration-300 min-h-[140px]"
              >
                <p className="font-display text-3xl font-bold text-gold-500 leading-tight whitespace-pre-line group-hover:text-gold-400 transition-colors duration-300">{value}</p>
                <div>
                  <p className="text-stone-900 text-sm font-semibold tracking-wide">{label}</p>
                  <p className="text-stone-400 text-xs tracking-wider mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
