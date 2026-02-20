import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

function BookingConfirmationModal({ show, onClose, bookingData, priceData }) {
  if (!show || !bookingData || !priceData) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-obsidian-800 border border-gold-500/20 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gold-500/40 flex items-center justify-center">
                  <Check className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-cream-200">¡Reserva Enviada!</h2>
                  <p className="text-white/30 text-xs tracking-wider">Tu solicitud fue enviada exitosamente</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">
              {/* Cliente */}
              <div className="border border-white/5 p-5">
                <p className="section-label mb-4">Cliente</p>
                <div className="space-y-3">
                  {[
                    ['Nombre', bookingData.name],
                    ['Email', bookingData.email],
                    ['Teléfono', bookingData.phone],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-white/30 text-sm">{label}</span>
                      <span className="text-cream-200 text-sm font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reserva */}
              <div className="border border-white/5 p-5">
                <p className="section-label mb-4">Reserva</p>
                <div className="space-y-3">
                  {[
                    ['Vehículo', bookingData.carType],
                    ['Recogida', `${bookingData.pickupDate} ${bookingData.pickupTime}`],
                    ['Devolución', `${bookingData.returnDate} ${bookingData.returnTime}`],
                    ['Lugar', bookingData.pickupLocation],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-white/30 text-sm">{label}</span>
                      <span className="text-cream-200 text-sm font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Precio */}
              <div className="border border-gold-500/20 bg-gold-500/5 p-5">
                <p className="section-label mb-4">Resumen de Precio</p>
                <div className="space-y-2">
                  {[
                    ['Precio diario', priceData.dailyPrice],
                    ['Días', priceData.days],
                    ['Subtotal', priceData.subtotal],
                    ['IVA (19%)', priceData.iva],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-white/30 text-sm">{label}</span>
                      <span className="text-cream-200 text-sm">{val}</span>
                    </div>
                  ))}
                  <div className="border-t border-gold-500/20 pt-3 mt-3 flex justify-between">
                    <span className="text-gold-400 font-semibold">Total</span>
                    <span className="font-display text-xl font-bold text-gold-400">{priceData.total}</span>
                  </div>
                </div>
              </div>

              <p className="text-white/25 text-xs text-center">
                Recibirás un correo con los detalles de tu reserva. Nos pondremos en contacto a la brevedad.
              </p>

              <button onClick={onClose} className="btn-gold w-full justify-center py-4">
                <span>Cerrar</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BookingConfirmationModal;
