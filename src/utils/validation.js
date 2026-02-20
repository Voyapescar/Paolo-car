/**
 * Utilidades de validación para formularios
 * Proporciona validaciones profesionales y consistentes
 */

/**
 * Valida un nombre completo
 * @param {string} name - Nombre a validar
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'El nombre es requerido' };
  }
  
  if (name.trim().length < 3) {
    return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: 'El nombre es demasiado largo' };
  }
  
  // Verificar que contenga al menos dos palabras (nombre y apellido)
  const words = name.trim().split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, error: 'Por favor ingresa tu nombre completo' };
  }
  
  // Verificar que solo contenga letras, espacios y algunos caracteres especiales comunes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'El nombre contiene caracteres no válidos' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'El email es requerido' };
  }
  
  // Regex más estricto para emails
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Por favor ingresa un email válido' };
  }
  
  // Verificar longitud razonable
  if (email.length > 254) {
    return { isValid: false, error: 'El email es demasiado largo' };
  }
  
  // Verificar dominios comunes sospechosos
  const suspiciousDomains = ['test.com', 'example.com', 'temp.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (suspiciousDomains.includes(domain)) {
    return { isValid: false, error: 'Por favor usa un email válido' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Valida un teléfono chileno
 * @param {string} phone - Teléfono a validar
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'El teléfono es requerido' };
  }
  
  // Remover caracteres no numéricos para validar
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Validar teléfono chileno (+56 9 XXXX XXXX o variantes)
  // Debe tener 9 dígitos (móvil) o 8-9 dígitos (fijo)
  if (cleanPhone.length < 8 || cleanPhone.length > 12) {
    return { isValid: false, error: 'Número de teléfono inválido' };
  }
  
  // Si empieza con 56 (código de Chile), verificar formato móvil
  if (cleanPhone.startsWith('56')) {
    const withoutCountryCode = cleanPhone.slice(2);
    if (withoutCountryCode.length !== 9 || !withoutCountryCode.startsWith('9')) {
      return { isValid: false, error: 'Formato: +56 9 XXXX XXXX' };
    }
  }
  
  return { isValid: true, error: '' };
};

/**
 * Valida fechas de reserva
 * @param {string} pickupDate - Fecha de recogida
 * @param {string} returnDate - Fecha de devolución
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateDates = (pickupDate, returnDate) => {
  if (!pickupDate) {
    return { isValid: false, error: 'La fecha de recogida es requerida' };
  }
  
  if (!returnDate) {
    return { isValid: false, error: 'La fecha de devolución es requerida' };
  }
  
  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Verificar que la fecha de recogida no sea en el pasado
  if (pickup < today) {
    return { isValid: false, error: 'La fecha de recogida no puede ser en el pasado' };
  }
  
  // Verificar que la fecha de devolución sea igual o posterior a la de recogida
  // (Permitir mismo día ya que tenemos horarios de 24 horas)
  if (returnD < pickup) {
    return { isValid: false, error: 'La fecha de devolución no puede ser anterior a la de recogida' };
  }
  
  // Verificar que el periodo no sea mayor a 30 días
  const diffTime = Math.abs(returnD - pickup);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 30) {
    return { isValid: false, error: 'El periodo de arriendo no puede superar 30 días. Contáctanos para reservas más largas.' };
  }
  
  // Verificar que la reserva no sea muy lejana (más de 6 meses)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  
  if (pickup > maxDate) {
    return { isValid: false, error: 'No se pueden hacer reservas con más de 6 meses de anticipación' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Valida el tipo de vehículo seleccionado
 * @param {string} carType - Tipo de vehículo
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateCarType = (carType) => {
  if (!carType || carType.trim().length === 0) {
    return { isValid: false, error: 'Debes seleccionar un tipo de vehículo' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Valida el mensaje adicional (opcional)
 * @param {string} message - Mensaje
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateMessage = (message) => {
  // El mensaje es opcional, pero si se proporciona, validar longitud
  if (message && message.length > 1000) {
    return { isValid: false, error: 'El mensaje es demasiado largo (máximo 1000 caracteres)' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Valida todo el formulario de reserva
 * @param {Object} formData - Datos del formulario
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateBookingForm = (formData) => {
  const errors = {};
  
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
  }
  
  const datesValidation = validateDates(formData.pickupDate, formData.returnDate);
  if (!datesValidation.isValid) {
    errors.dates = datesValidation.error;
  }
  
  const carTypeValidation = validateCarType(formData.carType);
  if (!carTypeValidation.isValid) {
    errors.carType = carTypeValidation.error;
  }
  
  const messageValidation = validateMessage(formData.message);
  if (!messageValidation.isValid) {
    errors.message = messageValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};
