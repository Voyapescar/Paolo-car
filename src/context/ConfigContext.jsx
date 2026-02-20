import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ConfigContext = createContext();

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig debe ser usado dentro de ConfigProvider');
  return context;
}

const defaultConfig = {
  // Hero
  heroTitle: 'Servicios profesionales',
  heroSubtitle: 'Sin Igual',
  heroDescription: 'Vehículos de primera categoría para quienes exigen lo mejor. Calidad, elegancia y servicio impecable en Iquique.',
  heroBadge: 'Premium Rentals',

  // Fleet
  fleetTitle: 'Nuestra Flota',
  fleetSubtitle: 'Vehículos seleccionados para cada ocasión',

  // Booking
  bookingTitle: 'Reserva Tu Vehículo',
  bookingDescription: 'Completa tu solicitud y nos pondremos en contacto a la brevedad.',

  // Footer
  footerDescription: 'Servicio de arriendo de vehículos premium en Iquique, Chile.',
  footerPhone: '+56 9 XXXX XXXX',
  footerEmail: 'contacto@paolorentacar.cl',
  footerAddress: 'Iquique, Chile',

  // Contact
  whatsappNumber: '56900000000',
  whatsappMessage: 'Hola, me gustaría información sobre el arriendo de vehículos Paolo Rent a Car',
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config').select('config').eq('id', 1).single();
      if (error) throw error;
      if (data) setConfig({ ...defaultConfig, ...data.config });
    } catch (error) {
      console.error('Error loading config:', error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    try {
      const { error } = await supabase
        .from('site_config').update({ config: newConfig }).eq('id', 1);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  const resetConfig = async () => {
    setConfig(defaultConfig);
    try {
      const { error } = await supabase
        .from('site_config').update({ config: defaultConfig }).eq('id', 1);
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting config:', error);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, loading, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}
