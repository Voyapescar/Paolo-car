import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Calendar, Car, User, Phone as PhoneIcon, AlertCircle, Clock, MapPin, Droplets, ParkingCircle, Hash } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { checkRateLimit, recordSubmission } from '../utils/rateLimiter';
import { validateBookingForm, sanitizeText } from '../utils/validation';
import { useConfig } from '../context/ConfigContext';
import { useVehicles } from '../context/VehicleContext';
import Notification from './Notification';
import BookingConfirmationModal from './BookingConfirmationModal';

function BookingForm() {
  const { config } = useConfig();
  const { vehicles, loading: vehiclesLoading } = useVehicles();

  const [serviceType, setServiceType] = useState('rentacar'); // 'rentacar' | 'lavado'

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
    message: '',
    // Lavado fields
    washDate: '',
    washTime: '09:00',
    washType: '',
    vehicleDescription: '',
    // Estacionamiento fields
    parkingEntryDate: '',
    parkingEntryTime: '09:00',
    parkingExitDate: '',
    parkingExitTime: '09:00',
    parkingVehicle: '',
    parkingPlate: ''
  });

  const [parkingHours, setParkingHours] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [rentalDays, setRentalDays] = useState(0);
  const [priceData, setPriceData] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

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
    if (formData.parkingEntryDate && formData.parkingExitDate) {
      const entry = new Date(`${formData.parkingEntryDate}T${formData.parkingEntryTime}`);
      const exit = new Date(`${formData.parkingExitDate}T${formData.parkingExitTime}`);
      const diffHours = Math.ceil(Math.abs(exit - entry) / (1000 * 60 * 60)) || 1;
      setParkingHours(diffHours);
    } else {
      setParkingHours(0);
    }
  }, [formData.parkingEntryDate, formData.parkingEntryTime, formData.parkingExitDate, formData.parkingExitTime]);

  const formatParkingDuration = (hours) => {
    if (hours < 24) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    const days = Math.floor(hours / 24);
    const rem = hours % 24;
    return rem > 0 ? `${days} ${days === 1 ? 'día' : 'días'} y ${rem}h` : `${days} ${days === 1 ? 'día' : 'días'}`;
  };

  useEffect(() => {
    if (formData.pickupDate && formData.returnDate && formData.pickupTime && formData.returnTime) {
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
    if (field === 'dates') {
      if (formData.pickupDate && formData.returnDate) {
        const validation = validateBookingForm(formData);
        if (validation.errors.dates) setErrors({ ...errors, dates: validation.errors.dates });
        else { const e2 = { ...errors }; delete e2.dates; setErrors(e2); }
      }
    } else {
      const validation = validateBookingForm(formData);
      if (validation.errors[field]) setErrors({ ...errors, [field]: validation.errors[field] });
      else { const e2 = { ...errors }; delete e2[field]; setErrors(e2); }
    }
  };

  // Validación para el formulario de estacionamiento
  const validateParkingForm = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().split(/\s+/).length < 2) errs.name = 'Ingresa tu nombre completo';
    if (!formData.phone.trim()) errs.phone = 'El teléfono es requerido';
    if (!formData.parkingEntryDate) errs.parkingEntryDate = 'La fecha de ingreso es requerida';
    if (!formData.parkingExitDate) errs.parkingExitDate = 'La fecha de salida es requerida';
    if (!formData.parkingVehicle.trim()) errs.parkingVehicle = 'Describe tu vehículo';
    return { isValid: Object.keys(errs).length === 0, errors: errs };
  };

  // Validación simple para el formulario de lavado
  const validateWashForm = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().split(/\s+/).length < 2) errs.name = 'Ingresa tu nombre completo';
    if (!formData.phone.trim()) errs.phone = 'El teléfono es requerido';
    if (!formData.washDate) errs.washDate = 'La fecha es requerida';
    if (!formData.washType) errs.washType = 'Selecciona un tipo de lavado';
    if (!formData.vehicleDescription.trim()) errs.vehicleDescription = 'Describe tu vehículo';
    return { isValid: Object.keys(errs).length === 0, errors: errs };
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (serviceType === 'estacionamiento') {
      const v = validateParkingForm();
      if (!v.isValid) {
        setErrors(v.errors);
        setTouched({ name: true, phone: true, parkingEntryDate: true, parkingExitDate: true, parkingVehicle: true });
        setNotification({ show: true, type: 'warning', title: 'Faltan datos', message: 'Por favor completa los campos requeridos.' });
        return;
      }
      const limitCheck = checkRateLimit();
      if (!limitCheck.allowed) {
        setNotification({ show: true, type: 'warning', title: 'Límite alcanzado', message: `Espera ${limitCheck.remainingTime} minutos antes de intentar nuevamente.` });
        setRateLimitInfo(limitCheck);
        return;
      }
      setIsSubmitting(true);
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      const templateParams = {
        from_name: sanitizeText(formData.name),
        from_email: sanitizeText(formData.email),
        phone: sanitizeText(formData.phone),
        service_type: 'Estacionamiento',
        wash_date: formData.parkingEntryDate,
        wash_time: formData.parkingEntryTime,
        wash_type: `Hasta: ${formData.parkingExitDate} ${formData.parkingExitTime} (${formatParkingDuration(parkingHours)})`,
        vehicle_description: `${sanitizeText(formData.parkingVehicle)}${formData.parkingPlate ? ` — Patente: ${sanitizeText(formData.parkingPlate)}` : ''}`,
        message: sanitizeText(formData.message),
        pickup_location: '', pickup_date: '', return_date: '', car_type: '',
        rental_days: '', daily_price: '', subtotal: '', iva: '', total: ''
      };
      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        recordSubmission();
        setNotification({ show: true, type: 'success', title: '¡Reserva de Estacionamiento Enviada!', message: 'Tu solicitud fue enviada. Te contactaremos para confirmar.' });
        setFormData(prev => ({ ...prev, name: '', email: '', phone: '', parkingEntryDate: '', parkingEntryTime: '09:00', parkingExitDate: '', parkingExitTime: '09:00', parkingVehicle: '', parkingPlate: '', message: '' }));
        setErrors({}); setTouched({});
      } catch (error) {
        setNotification({ show: true, type: 'error', title: 'Error al enviar', message: 'Ocurrió un error. Por favor intenta por WhatsApp.' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (serviceType === 'lavado') {
      const v = validateWashForm();
      if (!v.isValid) {
        setErrors(v.errors);
        setTouched({ name: true, phone: true, washDate: true, washType: true, vehicleDescription: true });
        setNotification({ show: true, type: 'warning', title: 'Faltan datos', message: 'Por favor completa los campos requeridos.' });
        return;
      }
      const limitCheck = checkRateLimit();
      if (!limitCheck.allowed) {
        setNotification({ show: true, type: 'warning', title: 'Límite alcanzado', message: `Espera ${limitCheck.remainingTime} minutos antes de intentar nuevamente.` });
        setRateLimitInfo(limitCheck);
        return;
      }
      setIsSubmitting(true);
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      const templateParams = {
        from_name: sanitizeText(formData.name),
        from_email: sanitizeText(formData.email),
        phone: sanitizeText(formData.phone),
        service_type: 'Lavado',
        wash_date: formData.washDate,
        wash_time: formData.washTime,
        wash_type: sanitizeText(formData.washType),
        vehicle_description: sanitizeText(formData.vehicleDescription),
        message: sanitizeText(formData.message),
        // Campos de rent-a-car vacíos para compatibilidad de plantilla
        pickup_location: '', pickup_date: '', return_date: '', car_type: '',
        rental_days: '', daily_price: '', subtotal: '', iva: '', total: ''
      };
      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        recordSubmission();
        setNotification({ show: true, type: 'success', title: '¡Lavado Agendado!', message: 'Tu solicitud fue enviada. Te contactaremos para confirmar.' });
        setFormData(prev => ({ ...prev, name: '', email: '', phone: '', washDate: '', washTime: '09:00', washType: '', vehicleDescription: '', message: '' }));
        setErrors({}); setTouched({});
      } catch (error) {
        setNotification({ show: true, type: 'error', title: 'Error al enviar', message: 'Ocurrió un error. Por favor intenta por WhatsApp.' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({ name: true, email: true, phone: true, dates: true, carType: true, message: true });
      setNotification({ show: true, type: 'warning', title: 'Faltan datos', message: 'Por favor corrige los errores en el formulario antes de continuar.' });
      return;
    }
    const limitCheck = checkRateLimit();
    if (!limitCheck.allowed) {
      setNotification({ show: true, type: 'warning', title: 'Límite alcanzado', message: `Espera ${limitCheck.remainingTime} minutos antes de intentar nuevamente.` });
      setRateLimitInfo(limitCheck);
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
      pickup_date: formData.pickupDate,
      pickup_time: formData.pickupTime,
      return_date: formData.returnDate,
      return_time: formData.returnTime,
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
      const newLimit = checkRateLimit();
      setRateLimitInfo(newLimit.allowed ? null : newLimit);
      setConfirmationData({ ...formData });
      setShowConfirmationModal(true);
      setNotification({ show: true, type: 'success', title: '¡Reserva Confirmada!', message: 'Tu solicitud ha sido enviada. Recibirás un correo de confirmación con todos los detalles.' });
      setFormData({ name: '', email: '', phone: '', pickupLocation: 'Iquique', pickupDate: '', pickupTime: '09:00', returnDate: '', returnTime: '09:00', carType: '', message: '', washDate: '', washTime: '09:00', washType: '', vehicleDescription: '', parkingEntryDate: '', parkingEntryTime: '09:00', parkingExitDate: '', parkingExitTime: '09:00', parkingVehicle: '', parkingPlate: '' });
      setErrors({}); setTouched({});
    } catch (error) {
      console.error('Error EmailJS:', error);
      setNotification({ show: true, type: 'error', title: 'Error al enviar', message: `${error.text || 'Ocurrió un error'}. Por favor, intenta por WhatsApp.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const phone = config.whatsappNumber || '56900000000';

    if (serviceType === 'estacionamiento') {
      const v = validateParkingForm();
      if (!v.isValid) {
        setErrors(v.errors);
        setTouched({ name: true, phone: true, parkingEntryDate: true, parkingExitDate: true, parkingVehicle: true });
        setNotification({ show: true, type: 'warning', title: 'Faltan datos', message: 'Por favor completa los campos requeridos.' });
        return;
      }
      const msg = `¡Hola! Quiero reservar un estacionamiento:%0A%0A` +
        `👤 Nombre: ${formData.name}%0A` +
        `📱 Teléfono: ${formData.phone}%0A` +
        (formData.email ? `📧 Email: ${formData.email}%0A` : '') +
        `🅿️ Ingreso: ${formData.parkingEntryDate} a las ${formData.parkingEntryTime}%0A` +
        `🏁 Salida: ${formData.parkingExitDate} a las ${formData.parkingExitTime}%0A` +
        `⏱️ Duración: ${formatParkingDuration(parkingHours)}%0A` +
        `🚗 Vehículo: ${formData.parkingVehicle}%0A` +
        (formData.parkingPlate ? `🔢 Patente: ${formData.parkingPlate}%0A` : '') +
        (formData.message ? `💬 Notas: ${formData.message}` : '');
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      return;
    }

    if (serviceType === 'lavado') {
      const v = validateWashForm();
      if (!v.isValid) {
        setErrors(v.errors);
        setTouched({ name: true, phone: true, washDate: true, washType: true, vehicleDescription: true });
        setNotification({ show: true, type: 'warning', title: 'Faltan datos', message: 'Por favor completa los campos requeridos.' });
        return;
      }
      const msg = `¡Hola! Quiero agendar un lavado:%0A%0A` +
        `👤 Nombre: ${formData.name}%0A` +
        `📱 Teléfono: ${formData.phone}%0A` +
        (formData.email ? `📧 Email: ${formData.email}%0A` : '') +
        `📅 Fecha: ${formData.washDate} a las ${formData.washTime}%0A` +
        `🚿 Tipo de lavado: ${formData.washType}%0A` +
        `🚗 Vehículo: ${formData.vehicleDescription}%0A` +
        (formData.message ? `💬 Notas: ${formData.message}` : '');
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      return;
    }

    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({ name: true, email: true, phone: true, dates: true, carType: true, message: true });
      setNotification({ show: true, type: 'warning', title: 'Faltan datos', message: 'Por favor corrige los errores en el formulario antes de continuar.' });
      return;
    }
    const msg = `¡Hola! Quiero hacer una reserva:%0A%0A` +
      `👤 Nombre: ${formData.name}%0A` +
      `📧 Email: ${formData.email}%0A` +
      `📱 Teléfono: ${formData.phone}%0A` +
      `📍 Lugar de Recogida: ${formData.pickupLocation}%0A` +
      `📅 Fecha de Recogida: ${formData.pickupDate} a las ${formData.pickupTime}%0A` +
      `📅 Fecha de Devolución: ${formData.returnDate} a las ${formData.returnTime}%0A` +
      `⏰ Días de arriendo: ${rentalDays} ${rentalDays === 1 ? 'día' : 'días'}%0A` +
      `🚗 Tipo de Vehículo: ${formData.carType}%0A` +
      `💬 Mensaje: ${formData.message}`;
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  // Input class helper
  const inputCls = (field) =>
    `w-full px-4 py-3.5 rounded-2xl border-2 bg-white/5 text-cream-200 placeholder-white/30 outline-none transition-all shadow-sm ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-400'
        : 'border-white/10 focus:border-gold-500 hover:border-white/20'
    } focus:ring-4 focus:ring-gold-500/10`;

  return (
    <section id="reserva" className="bg-obsidian-900 py-24 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold-500/3 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Cabecera */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/25 rounded-full px-5 py-2.5 mb-6"
          >
            <Calendar className="w-4 h-4 text-gold-500" />
            <span className="text-sm font-medium text-gold-400 tracking-wide">Reserva Online</span>
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream-200 mb-4">
            {serviceType === 'lavado' ? 'Agenda tu Lavado' : serviceType === 'estacionamiento' ? 'Reserva tu Estacionamiento' : (config.bookingTitle || 'Reserva')}
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-light">
            {serviceType === 'lavado'
              ? 'Elige fecha, tipo de lavado y te confirmamos a la brevedad.'
              : serviceType === 'estacionamiento'
              ? 'Reserva tu espacio de estacionamiento seguro. Te contactaremos para confirmar.'
              : (config.bookingDescription || 'Completa tu solicitud y nos pondremos en contacto a la brevedad.')}
          </p>

          {rateLimitInfo && !rateLimitInfo.allowed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl max-w-2xl mx-auto flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Has alcanzado el límite de envíos. Espera {rateLimitInfo.remainingTime} minutos o contáctanos por WhatsApp.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Card del formulario */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="bg-obsidian-800 border border-white/8 rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-dark"
        >
          <form className="space-y-7">

            {/* Selector de servicio */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => { setServiceType('rentacar'); setErrors({}); setTouched({}); }}
                className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 ${
                  serviceType === 'rentacar'
                    ? 'bg-gold-500 text-black shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Car className="w-4 h-4 flex-shrink-0" />
                Rent a Car
              </button>
              <button
                type="button"
                onClick={() => { setServiceType('estacionamiento'); setErrors({}); setTouched({}); }}
                className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 ${
                  serviceType === 'estacionamiento'
                    ? 'bg-gold-500 text-black shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <ParkingCircle className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Estacionamiento</span>
                <span className="sm:hidden">Parking</span>
              </button>
              <button
                type="button"
                onClick={() => { setServiceType('lavado'); setErrors({}); setTouched({}); }}
                className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 ${
                  serviceType === 'lavado'
                    ? 'bg-gold-500 text-black shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Droplets className="w-4 h-4 flex-shrink-0" />
                Car Wash
              </button>
            </div>

            {/* Nombre + Email */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                  <User className="w-4 h-4 text-gold-500" />
                  Nombre Completo <span className="text-gold-500">*</span>
                </label>
                <input
                  type="text" name="name" value={formData.name}
                  onChange={handleChange} onBlur={() => handleBlur('name')}
                  placeholder="Juan Pérez González"
                  className={inputCls('name')}
                />
                {touched.name && errors.name && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                  <Mail className="w-4 h-4 text-gold-500" />
                  Email <span className="text-gold-500">*</span>
                </label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} onBlur={() => handleBlur('email')}
                  placeholder="tu@email.com"
                  className={inputCls('email')}
                />
                {touched.email && errors.email && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Teléfono */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                <PhoneIcon className="w-4 h-4 text-gold-500" />
                Teléfono <span className="text-gold-500">*</span>
              </label>
              <input
                type="tel" name="phone" value={formData.phone}
                onChange={handleChange} onBlur={() => handleBlur('phone')}
                placeholder="+56 9 1234 5678"
                className={inputCls('phone')}
              />
              {touched.phone && errors.phone && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                </motion.p>
              )}
            </motion.div>

            {/* ── CAMPOS RENT A CAR ── */}
            {serviceType === 'rentacar' && (<>

            {/* Lugar de recogida */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.22 }}>
              <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                <MapPin className="w-4 h-4 text-gold-500" />
                Lugar de Recogida <span className="text-gold-500">*</span>
              </label>
              <select
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                className={`${inputCls('pickupLocation')} bg-obsidian-800`}
                style={{ colorScheme: 'dark' }}
              >
                <option value="Iquique">Iquique</option>
                <option value="Aeropuerto Iquique">Aeropuerto Iquique</option>
              </select>
            </motion.div>

            {/* Fechas y Horas */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="space-y-3">
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  Fecha de Recogida <span className="text-gold-500">*</span>
                </label>
                <input
                  type="date" name="pickupDate" value={formData.pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  onBlur={() => { if (formData.pickupDate && formData.returnDate) handleBlur('dates'); }}
                  className={`${inputCls('dates')} text-sm`}
                  style={{ colorScheme: 'dark' }}
                />
                <div>
                  <label className="flex items-center gap-2 text-white/40 text-xs font-medium mb-2">
                    <Clock className="w-3.5 h-3.5 text-gold-500/60" />
                    Hora de Recogida
                  </label>
                  <input
                    type="time" name="pickupTime" value={formData.pickupTime}
                    onChange={handleChange}
                    className={`${inputCls('pickupTime')} text-sm`}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="space-y-3">
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  Fecha de Devolución <span className="text-gold-500">*</span>
                </label>
                <input
                  type="date" name="returnDate" value={formData.returnDate}
                  min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  onBlur={() => { if (formData.pickupDate && formData.returnDate) handleBlur('dates'); }}
                  className={`${inputCls('dates')} text-sm`}
                  style={{ colorScheme: 'dark' }}
                />
                <div>
                  <label className="flex items-center gap-2 text-white/40 text-xs font-medium mb-2">
                    <Clock className="w-3.5 h-3.5 text-gold-500/60" />
                    Hora de Devolución
                  </label>
                  <input
                    type="time" name="returnTime" value={formData.returnTime}
                    readOnly
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-white/5 bg-white/3 text-white/30 cursor-not-allowed outline-none shadow-sm text-sm"
                    title="La hora de devolución es igual a la de recogida (bloques de 24h)"
                  />
                  <p className="text-xs text-white/25 mt-1">Misma hora de recogida</p>
                </div>
              </motion.div>
            </div>

            {touched.dates && errors.dates && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm -mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.dates}
              </motion.p>
            )}

            {/* Resumen de precio */}
            {rentalDays > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gold-500/5 border border-gold-500/20 rounded-2xl px-5 py-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gold-400" />
                  </div>
                  <p className="text-sm text-gold-300 font-semibold">
                    {rentalDays} {rentalDays === 1 ? 'día' : 'días'} de arriendo
                  </p>
                </div>
                {priceData && (
                  <div className="bg-white/3 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Precio/día</span>
                      <span className="text-cream-200 font-medium">{priceData.dailyPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Subtotal</span>
                      <span className="text-cream-200 font-medium">{priceData.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">IVA (19%)</span>
                      <span className="text-cream-200 font-medium">{priceData.iva}</span>
                    </div>
                    <div className="flex justify-between text-base border-t border-white/8 pt-2">
                      <span className="font-bold text-gold-400">Total</span>
                      <span className="font-bold text-gold-400 text-lg">{priceData.total}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Vehículo */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}>
              <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                <Car className="w-4 h-4 text-gold-500" />
                Tipo de Vehículo <span className="text-gold-500">*</span>
              </label>
              <select
                name="carType" value={formData.carType}
                onChange={handleChange} onBlur={() => handleBlur('carType')}
                disabled={vehiclesLoading}
                className={`${inputCls('carType')} bg-obsidian-800 ${vehiclesLoading ? 'cursor-wait opacity-60' : ''}`}
                style={{ colorScheme: 'dark' }}
              >
                <option value="">{vehiclesLoading ? 'Cargando vehículos...' : 'Selecciona un vehículo'}</option>
                {!vehiclesLoading && vehicles.filter(v => v.available !== false).map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} — {v.model} ({v.price}/día)
                  </option>
                ))}
              </select>
              {touched.carType && errors.carType && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.carType}
                </motion.p>
              )}
            </motion.div>

            </>)} {/* fin rentacar */}

            {/* ── CAMPOS CAR WASH ── */}
            {serviceType === 'lavado' && (<>

            {/* Tipo de lavado */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                <Droplets className="w-4 h-4 text-gold-500" />
                Tipo de Lavado <span className="text-gold-500">*</span>
              </label>
              <select
                name="washType" value={formData.washType}
                onChange={handleChange} onBlur={() => handleBlur('washType')}
                className={`${inputCls('washType')} bg-obsidian-800`}
                style={{ colorScheme: 'dark' }}
              >
                <option value="">Selecciona un tipo de lavado</option>
                <option value="Lavado Básico">Lavado Básico — Exterior</option>
                <option value="Lavado Completo">Lavado Completo — Exterior + Interior</option>
                <option value="Lavado Premium">Lavado Premium — Completo + Encerado</option>
                <option value="Detailing">Detailing — Tratamiento completo profesional</option>
              </select>
              {touched.washType && errors.washType && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.washType}
                </motion.p>
              )}
            </motion.div>

            {/* Descripción del vehículo */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                <Car className="w-4 h-4 text-gold-500" />
                Vehículo <span className="text-gold-500">*</span>
              </label>
              <input
                type="text" name="vehicleDescription" value={formData.vehicleDescription}
                onChange={handleChange} onBlur={() => handleBlur('vehicleDescription')}
                placeholder="Ej: Toyota Corolla Blanco 2022"
                className={inputCls('vehicleDescription')}
              />
              {touched.vehicleDescription && errors.vehicleDescription && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.vehicleDescription}
                </motion.p>
              )}
            </motion.div>

            {/* Fecha y hora del lavado */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  Fecha del Lavado <span className="text-gold-500">*</span>
                </label>
                <input
                  type="date" name="washDate" value={formData.washDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleChange} onBlur={() => handleBlur('washDate')}
                  className={`${inputCls('washDate')} text-sm`}
                  style={{ colorScheme: 'dark' }}
                />
                {touched.washDate && errors.washDate && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.washDate}
                  </motion.p>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                  <Clock className="w-4 h-4 text-gold-500" />
                  Hora Preferida
                </label>
                <input
                  type="time" name="washTime" value={formData.washTime}
                  onChange={handleChange}
                  className={`${inputCls('washTime')} text-sm`}
                  style={{ colorScheme: 'dark' }}
                />
              </motion.div>
            </div>

            </>)} {/* fin lavado */}

            {/* ── CAMPOS ESTACIONAMIENTO ── */}
            {serviceType === 'estacionamiento' && (<>

            {/* Fechas ingreso / salida */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  Fecha de Ingreso <span className="text-gold-500">*</span>
                </label>
                <input
                  type="date" name="parkingEntryDate" value={formData.parkingEntryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleChange} onBlur={() => handleBlur('parkingEntryDate')}
                  className={`${inputCls('parkingEntryDate')} text-sm`}
                  style={{ colorScheme: 'dark' }}
                />
                {touched.parkingEntryDate && errors.parkingEntryDate && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.parkingEntryDate}
                  </motion.p>
                )}
                <div>
                  <label className="flex items-center gap-2 text-white/40 text-xs font-medium mb-2">
                    <Clock className="w-3.5 h-3.5 text-gold-500/60" />
                    Hora de Ingreso
                  </label>
                  <input
                    type="time" name="parkingEntryTime" value={formData.parkingEntryTime}
                    onChange={handleChange}
                    className={`${inputCls('parkingEntryTime')} text-sm`}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  Fecha de Salida <span className="text-gold-500">*</span>
                </label>
                <input
                  type="date" name="parkingExitDate" value={formData.parkingExitDate}
                  min={formData.parkingEntryDate || new Date().toISOString().split('T')[0]}
                  onChange={handleChange} onBlur={() => handleBlur('parkingExitDate')}
                  className={`${inputCls('parkingExitDate')} text-sm`}
                  style={{ colorScheme: 'dark' }}
                />
                {touched.parkingExitDate && errors.parkingExitDate && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.parkingExitDate}
                  </motion.p>
                )}
                <div>
                  <label className="flex items-center gap-2 text-white/40 text-xs font-medium mb-2">
                    <Clock className="w-3.5 h-3.5 text-gold-500/60" />
                    Hora de Salida
                  </label>
                  <input
                    type="time" name="parkingExitTime" value={formData.parkingExitTime}
                    onChange={handleChange}
                    className={`${inputCls('parkingExitTime')} text-sm`}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Resumen duración */}
            {parkingHours > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gold-500/5 border border-gold-500/20 rounded-2xl px-5 py-4 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-gold-400" />
                </div>
                <p className="text-sm text-gold-300 font-semibold">
                  Duración estimada: {formatParkingDuration(parkingHours)}
                </p>
              </motion.div>
            )}

            {/* Vehículo */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                  <Car className="w-4 h-4 text-gold-500" />
                  Vehículo <span className="text-gold-500">*</span>
                </label>
                <input
                  type="text" name="parkingVehicle" value={formData.parkingVehicle}
                  onChange={handleChange} onBlur={() => handleBlur('parkingVehicle')}
                  placeholder="Ej: Toyota Corolla Blanco 2022"
                  className={inputCls('parkingVehicle')}
                />
                {touched.parkingVehicle && errors.parkingVehicle && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.parkingVehicle}
                  </motion.p>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                  <Hash className="w-4 h-4 text-gold-500" />
                  Patente <span className="text-white/25 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text" name="parkingPlate" value={formData.parkingPlate}
                  onChange={handleChange}
                  placeholder="Ej: ABCD12"
                  className={inputCls('parkingPlate')}
                />
              </motion.div>
            </div>

            </>)} {/* fin estacionamiento */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <label className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
                <MessageCircle className="w-4 h-4 text-gold-500" />
                Mensaje Adicional <span className="text-white/25 font-normal">(Opcional)</span>
              </label>
              <textarea
                name="message" value={formData.message}
                onChange={handleChange} onBlur={() => handleBlur('message')}
                rows={4}
                placeholder="Cuéntanos cualquier detalle adicional sobre tu reserva..."
                maxLength={1000}
                className={`${inputCls('message')} resize-none`}
              />
              <p className="text-xs text-white/25 mt-1.5 text-right">{formData.message.length}/1000</p>
            </motion.div>

            {/* Botones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              className="grid md:grid-cols-2 gap-4 pt-2"
            >
              <motion.button
                type="button"
                onClick={handleEmailSubmit}
                disabled={isSubmitting || (rateLimitInfo && !rateLimitInfo.allowed)}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gold-500 hover:bg-gold-400 text-obsidian-900 font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-gold"
              >
                <Mail className="w-5 h-5" />
                {isSubmitting ? 'Enviando...' : (serviceType === 'lavado' ? 'Agendar por Email' : serviceType === 'estacionamiento' ? 'Reservar por Email' : 'Enviar por Email')}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleWhatsAppSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-green-600/40 text-green-400 font-bold text-sm tracking-wide hover:border-green-500 hover:bg-green-500/10 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {serviceType === 'lavado' ? 'Agendar por WhatsApp' : serviceType === 'estacionamiento' ? 'Reservar por WhatsApp' : 'Reservar por WhatsApp'}
              </motion.button>
            </motion.div>

            <p className="text-xs text-white/20 text-center pt-1">
              Al enviar este formulario aceptas nuestros términos y condiciones de servicio.
            </p>
          </form>
        </motion.div>
      </div>

      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, show: false })}
        duration={5000}
      />
      <BookingConfirmationModal
        show={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        bookingData={confirmationData}
        priceData={priceData}
      />
    </section>
  );
}

export default BookingForm;
