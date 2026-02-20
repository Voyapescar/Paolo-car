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
    <section id="contacto" className="bg-obsidian-800 py-24 overflow-hidden">
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
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream-200 leading-tight mb-6">
              Estamos aquí<br />
              <span className="italic text-gold-500">para ti</span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed mb-12 max-w-md">
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
                    <p className="text-white/30 text-xs tracking-[0.2em] uppercase mb-1">{label}</p>
                    <p className="text-cream-200 whitespace-pre-line group-hover:text-gold-400 transition-colors duration-300">
                      {value}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* CTA WhatsApp */}
            <motion.a
              href={`https://wa.me/${config.whatsappNumber || '56900000000'}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="inline-flex items-center gap-3 mt-10 px-8 py-4 border border-green-600/40 text-green-400 text-xs tracking-[0.2em] uppercase font-medium hover:border-green-500 hover:text-green-300 transition-colors duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Escribir por WhatsApp
            </motion.a>
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
                className="group border border-white/5 hover:border-gold-500/40 bg-obsidian-800 p-6 flex flex-col justify-between transition-colors duration-300 min-h-[140px]"
              >
                <p className="font-display text-3xl font-bold text-gold-500 leading-tight whitespace-pre-line group-hover:text-gold-400 transition-colors duration-300">{value}</p>
                <div>
                  <p className="text-cream-200 text-sm font-semibold tracking-wide">{label}</p>
                  <p className="text-white/30 text-xs tracking-wider mt-0.5">{sub}</p>
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
