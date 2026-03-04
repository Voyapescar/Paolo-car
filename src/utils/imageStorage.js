/**
 * Gestión de imágenes con Supabase Storage
 * Bucket: paolocar
 */

import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'paolocar';

/**
 * Sube una imagen a Supabase Storage
 * @param {File} file - Archivo de imagen a subir
 * @param {string} folder - Carpeta dentro del bucket (ej: 'fleet', 'general')
 * @returns {Promise<Object>} { url: string, pathname: string }
 */
export const uploadImage = async (file, folder = 'general') => {
  if (!file) throw new Error('No se proporcionó ningún archivo');

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, WEBP y GIF');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Tamaño máximo: 5MB');
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop().toLowerCase();
  const pathname = `${folder}/${timestamp}-${randomString}.${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(pathname, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(`Error al subir imagen: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    pathname: data.path,
    size: file.size,
    type: file.type,
  };
};

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} pathname - Ruta del archivo dentro del bucket (ej: 'fleet/xxx.jpg')
 * @returns {Promise<boolean>}
 */
export const deleteImage = async (pathname) => {
  if (!pathname) throw new Error('No se proporcionó la ruta de la imagen');

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([pathname]);

  if (error) throw new Error(`Error al eliminar imagen: ${error.message}`);
  return true;
};

/**
 * Lista todas las imágenes de una carpeta
 * @param {string} folder - Carpeta a listar
 * @returns {Promise<Array>}
 */
export const listImages = async (folder = '') => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folder, { sortBy: { column: 'created_at', order: 'desc' } });

  if (error) throw new Error(`Error al listar imágenes: ${error.message}`);

  return (data || []).map(file => {
    const path = folder ? `${folder}/${file.name}` : file.name;
    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return {
      url: publicUrl,
      pathname: path,
      name: file.name,
      size: file.metadata?.size,
    };
  });
};

/**
 * Valida una imagen antes de subirla
 * @param {File} file
 * @returns {{ isValid: boolean, error: string }}
 */
export const validateImage = (file) => {
  if (!file) return { isValid: false, error: 'No se proporcionó ningún archivo' };

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Solo se permiten imágenes JPG, PNG, WEBP y GIF' };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'El archivo es demasiado grande. Máximo: 5MB' };
  }

  return { isValid: true, error: '' };
};

export default { uploadImage, deleteImage, listImages, validateImage };
