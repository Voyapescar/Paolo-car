import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Car, User, Phone as PhoneIcon, Mail, AlertCircle, ChevronDown } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { checkRateLimit, recordSubmission } from '../utils/rateLimiter';
import { validateBookingForm, sanitizeText } from '../utils/validation';
import { useConfig } from '../context/ConfigContext';
import { useVehicles } from '../context/VehicleContext';
import Notification from './Notification';
import BookingConfirmationModal from './BookingConfirmationModal';

// Imagen hero por defecto (coche en carretera oscura)
const HERO_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&fit=crop&q=80';

function Hero() {
  const { config } = useConfig();
  const { vehicles } = useVehicles();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupLocation: 'Iquique',
    pickupDate: '',
    pickupTime: '09:00',
    returnDate: '',
    returnTime: '09:00',
    carType: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rentalDays, setRentalDays] = useState(0);
  const [priceData, setPriceData] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  const cyclingServices = ['Rent a car', 'Parking', 'Car wash'];
  const [cyclingIndex, setCyclingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCyclingIndex(prev => (prev + 1) % cyclingServices.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const calculatePriceData = (carType, days) => {
    const selectedVehicle = vehicles.find(v => v.name === carType);
    if (!selectedVehicle) return null;
    const priceString = selectedVehicle.price.replace(/[$.]/g, '');
    const dailyPriceNumber = parseInt(priceString);
    const subtotalNumber = dailyPriceNumber * days;
    const ivaNumber = Math.round(subtotalNumber * 0.19);
    const totalNumber = subtotalNumber + ivaNumber;
    return {
      dailyPrice: selectedVehicle.price, dailyPriceNumber, days,
      subtotal: `$${subtotalNumber.toLocaleString('es-CL')}`, subtotalNumber,
      iva: `$${ivaNumber.toLocaleString('es-CL')}`, ivaNumber,
      total: `$${totalNumber.toLocaleString('es-CL')}`, totalNumber
    };
  };

  useEffect(() => {
    if (formData.pickupDate && formData.returnDate) {
      const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
      const ret = new Date(`${formData.returnDate}T${formData.returnTime}`);
      const diff = Math.ceil(Math.abs(ret - pickup) / (1000 * 60 * 60 * 24)) || 1;
      setRentalDays(diff);
      if (formData.carType && diff > 0) setPriceData(calculatePriceData(formData.carType, diff));
    }
  }, [formData.pickupDate, formData.returnDate, formData.pickupTime, formData.returnTime, formData.carType, vehicles]);

  useEffect(() => {
    const check = checkRateLimit();
    if (!check.allowed) setRateLimitInfo(check);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pickupTime') {
      setFormData({ ...formData, [name]: value, returnTime: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if ((name === 'pickupDate' || name === 'returnDate') && errors.dates) {
      const e2 = { ...errors }; delete e2.dates; setErrors(e2);
    } else if (errors[name]) {
      const e2 = { ...errors }; delete e2[name]; setErrors(e2);
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const validation = validateBookingForm(formData);
    if (validation.errors[field]) setErrors({ ...errors, [field]: validation.errors[field] });
    else { const e2 = { ...errors }; delete e2[field]; setErrors(e2); }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({ name: true, email: true, phone: true, dates: true, carType: true, message: true });
      setNotification({ show: true, type: 'warning', title: 'Faltan datos', message: 'Por favor corrige los errores antes de continuar.' });
      return;
    }
    const limitCheck = checkRateLimit();
    if (!limitCheck.allowed) {
      setNotification({ show: true, type: 'warning', title: 'Límite alcanzado', message: `Espera ${limitCheck.remainingTime} minutos antes de intentar nuevamente.` });
      return;
    }
    setIsSubmitting(true);
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const CLIENT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CLIENT_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const templateParams = {
      from_name: sanitizeText(formData.name),
      from_email: sanitizeText(formData.email),
      phone: sanitizeText(formData.phone),
      pickup_location: sanitizeText(formData.pickupLocation),
      pickup_date: formData.pickupDate, pickup_time: formData.pickupTime,
      return_date: formData.returnDate, return_time: formData.returnTime,
      car_type: sanitizeText(formData.carType),
      message: sanitizeText(formData.message),
      rental_days: rentalDays,
      daily_price: priceData?.dailyPrice ?? 'N/A',
      subtotal: priceData?.subtotal ?? 'N/A',
      iva: priceData?.iva ?? 'N/A',
      total: priceData?.total ?? 'N/A'
    };
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      if (CLIENT_TEMPLATE_ID) {
        try { await emailjs.send(SERVICE_ID, CLIENT_TEMPLATE_ID, templateParams, PUBLIC_KEY); }
        catch (err) { console.error('Error correo cliente:', err); }
      }
      recordSubmission();
      setConfirmationData({ ...formData });
      setShowConfirmationModal(true);
      setNotification({ show: true, type: 'success', title: '¡Reserva Enviada!', message: 'Tu solicitud ha sido enviada. Recibirás un correo de confirmación.' });
      setFormData({ name: '', email: '', phone: '', pickupLocation: 'Iquique', pickupDate: '', pickupTime: '09:00', returnDate: '', returnTime: '09:00', carType: '', message: '' });
      setErrors({}); setTouched({});
    } catch (error) {
      setNotification({ show: true, type: 'error', title: 'Error al enviar', message: 'Ocurrió un error. Por favor intenta por WhatsApp.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({ name: true, email: true, phone: true, dates: true, carType: true, message: true });
      setNotification({ show: true, type: 'warning', title: 'Faltan datos', message: 'Por favor corrige los errores antes de continuar.' });
      return;
    }
    const msg = `¡Hola! Quiero hacer una reserva:%0A%0A` +
      `👤 ${formData.name}%0A📧 ${formData.email}%0A📱 ${formData.phone}%0A` +
      `📍 Recogida: ${formData.pickupLocation}%0A` +
      `📅 ${formData.pickupDate} ${formData.pickupTime} → ${formData.returnDate} ${formData.returnTime}%0A` +
      `🚗 Vehículo: ${formData.carType}%0A⏰ ${rentalDays} día(s)%0A💬 ${formData.message}`;
    const phone = config.whatsappNumber || '56900000000';
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const inputBase = (field) =>
    `w-full bg-transparent border-b pb-3 pt-2 text-cream-200 placeholder-white/30 focus:outline-none transition-colors duration-300 ${
      touched[field] && errors[field] ? 'border-red-500 focus:border-red-400' : 'border-white/20 focus:border-gold-500'
    }`;

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* ─── HERO VISUAL ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Paolo Rent a Car"
            className="w-full h-full object-cover"
          />
          {/* Gradiente oscuro editorial */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-obsidian-900/70 to-obsidian-900/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-900/60 via-transparent to-transparent" />
        </div>

        {/* Contenido central */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-32 pt-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="section-label mb-6"
            >
             
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-cream-200 leading-[0.9] mb-4"
            >
              Servicios
            </motion.h1>

            <div
              style={{ clipPath: 'inset(4px -50vw -12px 0)' }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold italic text-gold-500 leading-none mb-10 relative h-[1.3em] flex items-center w-full"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={cyclingIndex}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-110%', opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute whitespace-nowrap"
                >
                  {cyclingServices[cyclingIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="max-w-lg text-white/60 text-lg font-light leading-relaxed mb-10"
            >
              {config.heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex items-center gap-6"
            >
              <a href="#reserva" className="btn-gold">
                <span>Reservar Ahora</span>
              </a>
              <a
                href="#flota"
                className="text-white/50 hover:text-gold-400 text-sm tracking-[0.15em] uppercase transition-colors duration-300 flex items-center gap-2"
              >
                Ver flota <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Flecha de scroll */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* ─── SECCIÓN FORMULARIO ──────────────────────────────────── */}
      <section id="reserva" className="bg-obsidian-900 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Cabecera */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <p className="section-label mb-4">{config.bookingTitle || 'Reserva Tu Vehículo'}</p>
            <div className="flex items-end gap-6">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-cream-200">
                Solicita tu <span className="italic text-gold-500">Reserva</span>
              </h2>
              <div className="hidden md:block mb-2 flex-1 h-px bg-white/8" />
            </div>
            <p className="text-white/40 mt-4 max-w-xl">
              {config.bookingDescription}
            </p>
          </motion.div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-obsidian-800 border border-white/5 p-8 md:p-12"
          >
            <form className="space-y-10">
              {/* Fila 1: Datos personales */}
              <div>
                <p className="section-label mb-6">Datos Personales</p>
                <div className="grid md:grid-cols-3 gap-x-8 gap-y-8">
                  {/* Nombre */}
                  <div>
                    <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-3">
                      Nombre Completo *
                    </label>
                    <input
                      type="text" name="name" value={formData.name}
                      onChange={handleChange} onBlur={() => handleBlur('name')}
                      placeholder="Juan Pérez González"
                      className={inputBase('name')}
                    />
                    {touched.name && errors.name && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-3">
                      Email *
                    </label>
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleChange} onBlur={() => handleBlur('email')}
                      placeholder="correo@ejemplo.com"
                      className={inputBase('email')}
                    />
                    {touched.email && errors.email && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                  {/* Teléfono */}
                  <div>
                    <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-3">
                      Teléfono *
                    </label>
                    <input
                      type="tel" name="phone" value={formData.phone}
                      onChange={handleChange} onBlur={() => handleBlur('phone')}
                      placeholder="+56 9 XXXX XXXX"
                      className={inputBase('phone')}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Línea divisoria */}
              <div className="border-t border-white/5" />

              {/* Fila 2: Detalles de reserva */}
              <div>
                <p className="section-label mb-6">Detalles de la Reserva</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
                  {/* Lugar de recogida */}
                  <div>
                    <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-3">
                      Lugar de Recogida
                    </label>
                    <input
                      type="text" name="pickupLocation" value={formData.pickupLocation}
                      onChange={handleChange}
                      className={inputBase('pickupLocation')}
                    />
                  </div>

                  {/* Vehículo */}
                  <div>
                    <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-3">
                      Vehículo *
                    </label>
                    <select
                      name="carType" value={formData.carType}
                      onChange={handleChange} onBlur={() => handleBlur('carType')}
                      className={`${inputBase('carType')} bg-transparent`}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className="bg-obsidian-800">Seleccionar vehículo</option>
                      {vehicles.filter(v => v.available).map((v, i) => (
                        <option key={i} value={v.name} className="bg-obsidian-800">
                          {v.name} — {v.price}/día
                        </option>
                      ))}
                    </select>
                    {touched.carType && errors.carType && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.carType}
                      </p>
                    )}
                  </div>

                  {/* Fecha recogida */}
                  <div>
                    <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-3">
                      Fecha de Recogida *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date" name="pickupDate" value={formData.pickupDate}
                        min={today} onChange={handleChange}
                        onBlur={() => handleBlur('dates')}
                        className={`${inputBase('dates')} text-sm`}
                        style={{ colorScheme: 'dark' }}
                      />
                      <input
                        type="time" name="pickupTime" value={formData.pickupTime}
                        onChange={handleChange}
                        className={`${inputBase('dates')} text-sm`}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  {/* Fecha devolución */}
                  <div>
                    <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-3">
                      Fecha de Devolución *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date" name="returnDate" value={formData.returnDate}
                        min={formData.pickupDate || today} onChange={handleChange}
                        onBlur={() => handleBlur('dates')}
                        className={`${inputBase('dates')} text-sm`}
                        style={{ colorScheme: 'dark' }}
                      />
                      <input
                        type="time" name="returnTime" value={formData.returnTime}
                        onChange={handleChange}
                        className={`${inputBase('dates')} text-sm`}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    {touched.dates && errors.dates && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.dates}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen de precio */}
              {priceData && rentalDays > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gold-500/20 bg-gold-500/5 p-6 grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  <div>
                    <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Precio/día</p>
                    <p className="text-gold-400 font-display text-xl font-semibold">{priceData.dailyPrice}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Días</p>
                    <p className="text-cream-200 font-display text-xl font-semibold">{rentalDays}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Subtotal + IVA</p>
                    <p className="text-cream-200 font-display text-xl font-semibold">{priceData.subtotal}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Total</p>
                    <p className="text-gold-400 font-display text-2xl font-bold">{priceData.total}</p>
                  </div>
                </motion.div>
              )}

              {/* Mensaje adicional */}
              <div>
                <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-3">
                  Mensaje adicional
                </label>
                <textarea
                  name="message" value={formData.message}
                  onChange={handleChange} rows={3}
                  placeholder="¿Alguna solicitud especial o consulta?"
                  className="w-full bg-transparent border-b border-white/20 focus:border-gold-500 pb-3 pt-2 text-cream-200 placeholder-white/30 focus:outline-none transition-colors duration-300 resize-none"
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={isSubmitting || (rateLimitInfo && !rateLimitInfo.allowed)}
                  className="btn-gold flex-1 justify-center py-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitud por Email'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppSubmit}
                  className="relative flex-1 flex items-center justify-center gap-2 py-4 border border-green-600/40 text-green-400 text-xs tracking-[0.2em] uppercase font-medium overflow-hidden transition-colors duration-300 hover:border-green-500 hover:text-green-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <Notification
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
      <BookingConfirmationModal
        show={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        bookingData={confirmationData}
        priceData={priceData}
      />
    </>
  );
}

export default Hero;
