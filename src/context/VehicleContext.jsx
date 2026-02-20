import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VehicleContext = createContext();

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) throw new Error('useVehicles must be used within a VehicleProvider');
  return context;
};

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicle) => {
    try {
      const { data, error } = await supabase
        .from('vehicles').insert([vehicle]).select().single();
      if (error) throw error;
      setVehicles([...vehicles, data]);
      return data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  const updateVehicle = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('vehicles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      setVehicles(vehicles.map(v => v.id === id ? data : v));
      return data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id) => {
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  };

  return (
    <VehicleContext.Provider value={{ vehicles, loading, addVehicle, updateVehicle, deleteVehicle, loadVehicles }}>
      {children}
    </VehicleContext.Provider>
  );
};
