/**
 * Gestión de imágenes con Vercel Blob Storage
 * Storage: marmut-fotos
 */

import { put, del, list } from '@vercel/blob';

const STORAGE_NAME = 'marmut-fotos';

/**
 * Sube una imagen a Vercel Blob Storage
 * @param {File} file - Archivo de imagen a subir
 * @param {string} folder - Carpeta dentro del storage (ej: 'fleet', 'booking')
 * @returns {Promise<Object>} { url: string, pathname: string }
 */
export const uploadImage = async (file, folder = 'general') => {
  try {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, WEBP y GIF');
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Tamaño máximo: 5MB');
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Subir a Vercel Blob
    const { url, pathname } = await put(filename, file, {
      access: 'public',
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
    });

    return {
      url,
      pathname,
      filename,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

/**
 * Elimina una imagen de Vercel Blob Storage
 * @param {string} url - URL de la imagen a eliminar
 * @returns {Promise<boolean>}
 */
export const deleteImage = async (url) => {
  try {
    if (!url) {
      throw new Error('No se proporcionó la URL de la imagen');
    }

    await del(url, {
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
    });

    return true;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
};

/**
 * Lista todas las imágenes de una carpeta
 * @param {string} folder - Carpeta a listar (opcional)
 * @returns {Promise<Array>} Array de objetos con información de las imágenes
 */
export const listImages = async (folder = '') => {
  try {
    const { blobs } = await list({
      prefix: folder,
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
    });

    return blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));
  } catch (error) {
    console.error('Error al listar imágenes:', error);
    throw new Error(`Error al listar imágenes: ${error.message}`);
  }
};

/**
 * Obtiene la URL optimizada de una imagen
 * @param {string} url - URL base de la imagen
 * @param {Object} options - Opciones de optimización
 * @returns {string} URL optimizada
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
  } = options;

  // Vercel Blob automáticamente optimiza las imágenes
  // Aquí puedes agregar parámetros de query si Vercel lo soporta en el futuro
  let optimizedUrl = url;

  // Por ahora, Vercel Blob sirve las imágenes tal cual
  // pero puedes integrar con Vercel Image Optimization si lo necesitas
  
  return optimizedUrl;
};

/**
 * Valida una imagen antes de subirla
 * @param {File} file - Archivo a validar
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateImage = (file) => {
  if (!file) {
    return { isValid: false, error: 'No se proporcionó ningún archivo' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, WEBP y GIF' };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'El archivo es demasiado grande. Tamaño máximo: 5MB' };
  }

  // Validar dimensiones mínimas
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        resolve({ isValid: false, error: 'La imagen es demasiado pequeña. Dimensiones mínimas: 100x100px' });
      } else {
        resolve({ isValid: true, error: '' });
      }
    };
    img.onerror = () => {
      resolve({ isValid: false, error: 'No se pudo cargar la imagen' });
    };
    img.src = URL.createObjectURL(file);
  });
};

// URLs de las imágenes actuales (actualizar después de subir a Vercel Blob)
export const IMAGE_URLS = {
  // Hero
  hero: {
    background: 'https://marmut-fotos.vercel-storage.com/hero/iquique-background.jpg',
  },
  
  // Fleet (Flota)
  fleet: {
    economico: 'https://marmut-fotos.vercel-storage.com/fleet/economico.jpg',
    sedan: 'https://marmut-fotos.vercel-storage.com/fleet/sedan.jpg',
    suv: 'https://marmut-fotos.vercel-storage.com/fleet/suv.jpg',
    pickup: 'https://marmut-fotos.vercel-storage.com/fleet/pickup.jpg',
    van: 'https://marmut-fotos.vercel-storage.com/fleet/van.jpg',
  },
  
  // Booking
  booking: {
    iquique: 'https://marmut-fotos.vercel-storage.com/booking/iquique.jpg',
  },
};

export default {
  uploadImage,
  deleteImage,
  listImages,
  getOptimizedImageUrl,
  validateImage,
  IMAGE_URLS,
};
