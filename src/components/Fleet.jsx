import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useConfig } from '../context/ConfigContext';

function Fleet() {
  const { vehicles } = useVehicles();
  const { config } = useConfig();

  return (
    <section id="flota" className="bg-obsidian-900 py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-24"
        >
          <p className="section-label mb-4">— Flota</p>
          <div className="flex items-end gap-8">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              {config.fleetTitle || 'Nuestra Flota'}
            </h2>
            <div className="hidden md:block mb-3 flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <p className="text-stone-500 mt-4 max-w-lg text-sm tracking-wide">
            {config.fleetSubtitle || 'Vehículos seleccionados para cada ocasión'}
          </p>
        </motion.div>

        {/* Lista de vehículos */}
        <div className="space-y-6">
          {vehicles.map((car, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={car.id || index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative grid md:grid-cols-2 overflow-hidden transition-all duration-700 ${
                  !car.available ? 'opacity-50' : ''
                }`}
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)' }}
              >
                {/* Borde superior con acento rojo */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
                {/* Borde izquierdo rojo */}
                <div className="absolute left-0 inset-y-0 w-[3px] bg-gradient-to-b from-gold-500 via-gold-600 to-transparent" />
                {/* Borde exterior sutil */}
                <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                {/* Glow en hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 60px rgba(220,38,38,0.04)' }} />

                {/* ── IMAGEN ── */}
                <div className={`relative h-[280px] md:h-[380px] overflow-hidden flex items-center justify-center ${isEven ? 'md:order-1' : 'md:order-2'}`}
                  style={{ background: 'radial-gradient(ellipse at center, #252525 0%, #111 100%)' }}
                >
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-contain object-center px-8 py-6 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  ) : (
                    <svg className="w-20 h-20 text-stone-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  )}

                  {/* Gradiente lateral para fusión con la info */}
                  <div className={`absolute inset-y-0 w-16 ${isEven ? 'right-0 bg-gradient-to-r from-transparent to-[#141414]' : 'left-0 bg-gradient-to-l from-transparent to-[#141414]'}`} />

                  {/* Badge no disponible */}
                  {!car.available && (
                    <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/80 border border-gold-500/20 px-3 py-1.5 backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-gold-500" />
                      <span className="text-gold-500 text-[10px] tracking-[0.2em] uppercase font-medium">No disponible</span>
                    </div>
                  )}
                </div>

                {/* ── INFO ── */}
                <div className={`relative p-8 md:p-12 flex flex-col justify-between ${isEven ? 'md:order-2' : 'md:order-1'}`}>

                  {/* Nombre y modelo */}
                  <div>
                    <div className="mb-6">
                      <h3 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight tracking-wide">
                        {car.name}
                      </h3>
                      <p className="text-stone-500 text-xs tracking-[0.3em] uppercase mt-2 font-medium">
                        {car.model}
                      </p>
                    </div>

                    {/* Precio */}
                    <div className="flex items-end gap-3 mb-2">
                      <span className="font-display text-4xl md:text-5xl font-bold text-gold-500 leading-none">
                        {car.price}
                      </span>
                      <span className="text-stone-500 text-sm mb-1">/día</span>
                    </div>
                    <p className="text-stone-600 text-[10px] tracking-[0.25em] uppercase mb-10">
                      Periodo de 24 horas · IVA incluido
                    </p>

                    {/* Divisor */}
                    <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent mb-8" />

                    {/* Features */}
                    <ul className="space-y-3 mb-10">
                      {car.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-4 text-sm group/feat">
                          <span className="w-1 h-1 rounded-full bg-gold-500 flex-shrink-0 group-hover/feat:scale-150 transition-transform duration-200" />
                          <span className="text-stone-400 group-hover/feat:text-stone-300 transition-colors duration-200">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div>
                    {car.available ? (
                      <a
                        href="#reserva"
                        className="group/btn inline-flex items-center gap-3 border border-gold-500/60 hover:border-gold-500 px-7 py-3.5 text-xs tracking-[0.2em] uppercase font-semibold text-gold-500 hover:bg-gold-500 hover:text-white transition-all duration-300"
                      >
                        <span>Reservar este vehículo</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </a>
                    ) : (
                      <span className="text-stone-600 text-[10px] tracking-[0.25em] uppercase border border-white/5 px-6 py-3 inline-block">
                        Actualmente no disponible
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
