/**
 * Rate Limiter basado en IP y LocalStorage
 * Previene spam y abuso del formulario de reservas
 */

const RATE_LIMIT_KEY = 'booking_submissions';
const MAX_SUBMISSIONS = 3; // Máximo de envíos permitidos
const TIME_WINDOW = 60 * 60 * 1000; // 1 hora en milisegundos

/**
 * Obtiene una "huella digital" del navegador
 * Combina múltiples factores para crear un identificador único
 */
const getBrowserFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('fingerprint', 2, 2);
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasFingerprint: canvas.toDataURL().slice(-50),
  };
  
  // Crear un hash simple del fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `fp_${Math.abs(hash)}`;
};

/**
 * Verifica si el usuario puede enviar el formulario
 * @returns {Object} { allowed: boolean, remainingTime: number, attemptsLeft: number }
 */
export const checkRateLimit = () => {
  try {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `${RATE_LIMIT_KEY}_${fingerprint}`;
    const stored = localStorage.getItem(storageKey);
    
    const now = Date.now();
    
    if (!stored) {
      return {
        allowed: true,
        remainingTime: 0,
        attemptsLeft: MAX_SUBMISSIONS - 1
      };
    }
    
    const data = JSON.parse(stored);
    
    // Limpiar intentos antiguos (fuera de la ventana de tiempo)
    data.attempts = data.attempts.filter(timestamp => 
      now - timestamp < TIME_WINDOW
    );
    
    if (data.attempts.length >= MAX_SUBMISSIONS) {
      const oldestAttempt = Math.min(...data.attempts);
      const remainingTime = TIME_WINDOW - (now - oldestAttempt);
      
      return {
        allowed: false,
        remainingTime: Math.ceil(remainingTime / 60000), // en minutos
        attemptsLeft: 0
      };
    }
    
    return {
      allowed: true,
      remainingTime: 0,
      attemptsLeft: MAX_SUBMISSIONS - data.attempts.length - 1
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // En caso de error, permitir el envío para no bloquear usuarios legítimos
    return { allowed: true, remainingTime: 0, attemptsLeft: MAX_SUBMISSIONS };
  }
};

/**
 * Registra un intento de envío
 */
export const recordSubmission = () => {
  try {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `${RATE_LIMIT_KEY}_${fingerprint}`;
    const stored = localStorage.getItem(storageKey);
    
    const now = Date.now();
    let data = { attempts: [] };
    
    if (stored) {
      data = JSON.parse(stored);
      // Limpiar intentos antiguos
      data.attempts = data.attempts.filter(timestamp => 
        now - timestamp < TIME_WINDOW
      );
    }
    
    data.attempts.push(now);
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.error('Error recording submission:', error);
    return false;
  }
};

/**
 * Resetea el rate limit (solo para desarrollo/testing)
 */
export const resetRateLimit = () => {
  try {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `${RATE_LIMIT_KEY}_${fingerprint}`;
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
};
