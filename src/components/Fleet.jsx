import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useConfig } from '../context/ConfigContext';

function Fleet() {
  const { vehicles } = useVehicles();
  const { config } = useConfig();

  return (
    <section id="flota" className="bg-obsidian-900 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <p className="section-label mb-4">— Flota</p>
          <div className="flex items-end gap-8">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream-200">
              {config.fleetTitle || 'Nuestra Flota'}
            </h2>
            <div className="hidden md:block mb-3 flex-1 h-px bg-white/8" />
          </div>
          <p className="text-white/40 mt-4 max-w-lg">
            {config.fleetSubtitle || 'Vehículos seleccionados para cada ocasión'}
          </p>
        </motion.div>

        {/* Lista de vehículos — layout editorial alternado */}
        <div className="space-y-2">
          {vehicles.map((car, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={car.id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
                className={`group grid md:grid-cols-2 border border-white/5 hover:border-gold-500/30 transition-colors duration-500 overflow-hidden ${
                  !car.available ? 'opacity-60' : ''
                }`}
              >
                {/* Imagen — alterna posición */}
                <div className={`relative h-64 md:h-80 overflow-hidden ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                  {car.image ? (
                    <motion.img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-obsidian-800 flex items-center justify-center">
                      <svg className="w-24 h-24 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                      </svg>
                    </div>
                  )}
                  {/* Overlay de gradiente lateral */}
                  <div
                    className={`absolute inset-0 ${
                      isEven
                        ? 'bg-gradient-to-r from-transparent to-obsidian-800/80'
                        : 'bg-gradient-to-l from-transparent to-obsidian-800/80'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  {/* Badge no disponible */}
                  {!car.available && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-obsidian-900/90 border border-gold-500/30 px-3 py-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold-500" />
                      <span className="text-gold-400 text-xs tracking-widest uppercase">Próximamente</span>
                    </div>
                  )}
                </div>

                {/* Info del vehículo */}
                <div
                  className={`bg-obsidian-800 p-8 md:p-12 flex flex-col justify-between ${
                    isEven ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  <div>
                    <h3 className="font-display text-3xl md:text-4xl font-bold text-cream-200 mb-1">
                      {car.name}
                    </h3>
                    <p className="text-white/40 text-sm tracking-wider uppercase mb-8">
                      {car.model}
                    </p>

                    {/* Precio */}
                    <div className="mb-8 pb-8 border-b border-white/8">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-4xl font-bold text-gold-500">
                          {car.price}
                        </span>
                        <span className="text-white/30 text-sm">/día</span>
                      </div>
                      <p className="text-white/20 text-xs tracking-widest uppercase mt-1">
                        Periodo de 24 horas · IVA incluido
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-10">
                      {car.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/60 text-sm">
                          <span className="w-4 h-px bg-gold-500 flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div>
                    {car.available ? (
                      <a href="#reserva" className="btn-gold inline-flex">
                        <span>Reservar este vehículo</span>
                      </a>
                    ) : (
                      <span className="text-xs tracking-[0.2em] uppercase text-white/20 border border-white/10 px-6 py-3 inline-block">
                        Disponible pronto
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Fleet;
