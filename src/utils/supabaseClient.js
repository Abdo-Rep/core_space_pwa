import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://itqzhfkktowdcixvmbpc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cXpoZmtrdG93ZGNpeHZtYnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NzM5MDQsImV4cCI6MjEwMjQ0OTkwNH0.C90K_tkaZk_1piv_BcbVyaP97tIlUMxHeiHfgF8hT1U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper for generating UUIDs locally when offline/local mode is active
const generateUUID = () => {
  return 'local_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

/**
 * CLIENTS OPERATIONS
 */
export const dbGetClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    localStorage.setItem('cs_clients', JSON.stringify(data));
    return { data, isLocal: false };
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to localStorage:', err.message);
    const localData = JSON.parse(localStorage.getItem('cs_clients') || '[]');
    return { data: localData, isLocal: true };
  }
};

export const dbAddClient = async (client) => {
  const newClient = {
    id: client.id || generateUUID(),
    name: client.name,
    phone: client.phone,
    type: client.type,
    budget: client.budget || '',
    notes: client.notes || '',
    created_at: new Date().toISOString()
  };

  try {
    // Try to insert in Supabase
    const { data, error } = await supabase
      .from('clients')
      .insert([newClient])
      .select();

    if (error) throw error;

    // Update Local Storage Cache
    const local = JSON.parse(localStorage.getItem('cs_clients') || '[]');
    localStorage.setItem('cs_clients', JSON.stringify([newClient, ...local]));
    return { success: true, data: data[0], isLocal: false };
  } catch (err) {
    console.warn('Supabase insert failed, saving to localStorage only:', err.message);
    const local = JSON.parse(localStorage.getItem('cs_clients') || '[]');
    const updatedLocal = [newClient, ...local];
    localStorage.setItem('cs_clients', JSON.stringify(updatedLocal));
    return { success: true, data: newClient, isLocal: true };
  }
};

export const dbDeleteClient = async (id, currentClients) => {
  const updatedLocal = currentClients.filter(c => c.id !== id);
  localStorage.setItem('cs_clients', JSON.stringify(updatedLocal));

  try {
    // If it's a local ID, no need to call Supabase
    if (id.toString().startsWith('local_')) {
      return { success: true, isLocal: true };
    }
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, isLocal: false };
  } catch (err) {
    console.warn('Supabase delete failed, updated local cache only:', err.message);
    return { success: true, isLocal: true };
  }
};

/**
 * UNITS OPERATIONS
 */
export const dbGetUnits = async () => {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    localStorage.setItem('cs_units', JSON.stringify(data));
    return { data, isLocal: false };
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to localStorage:', err.message);
    const localData = JSON.parse(localStorage.getItem('cs_units') || '[]');
    return { data: localData, isLocal: true };
  }
};

export const dbAddUnit = async (unit) => {
  const newUnit = {
    id: unit.id || generateUUID(),
    owner_phone: unit.owner_phone || '',
    title: unit.title,
    type: unit.type,
    price: unit.price || '',
    images: unit.images || [], // Stored as Array (represented as JSONB in Supabase)
    notes: unit.notes || '',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('units')
      .insert([newUnit])
      .select();

    if (error) throw error;

    const local = JSON.parse(localStorage.getItem('cs_units') || '[]');
    localStorage.setItem('cs_units', JSON.stringify([newUnit, ...local]));
    return { success: true, data: data[0], isLocal: false };
  } catch (err) {
    console.warn('Supabase insert failed, saving to localStorage only:', err.message);
    const local = JSON.parse(localStorage.getItem('cs_units') || '[]');
    const updatedLocal = [newUnit, ...local];
    localStorage.setItem('cs_units', JSON.stringify(updatedLocal));
    return { success: true, data: newUnit, isLocal: true };
  }
};

export const dbDeleteUnit = async (id, currentUnits) => {
  const updatedLocal = currentUnits.filter(u => u.id !== id);
  localStorage.setItem('cs_units', JSON.stringify(updatedLocal));

  try {
    if (id.toString().startsWith('local_')) {
      return { success: true, isLocal: true };
    }
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, isLocal: false };
  } catch (err) {
    console.warn('Supabase delete failed, updated local cache only:', err.message);
    return { success: true, isLocal: true };
  }
};

/**
 * VIEWINGS OPERATIONS
 */
export const dbGetViewings = async () => {
  try {
    const { data, error } = await supabase
      .from('viewings')
      .select('*')
      .order('viewing_time', { ascending: true });

    if (error) throw error;
    localStorage.setItem('cs_viewings', JSON.stringify(data));
    return { data, isLocal: false };
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to localStorage:', err.message);
    const localData = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    // Sort ascending by viewing time
    localData.sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
    return { data: localData, isLocal: true };
  }
};

export const dbAddViewing = async (viewing) => {
  const newViewing = {
    id: viewing.id || generateUUID(),
    client_id: viewing.client_id,
    unit_id: viewing.unit_id,
    client_name: viewing.client_name,
    unit_title: viewing.unit_title,
    viewing_time: viewing.viewing_time, // ISO string
    notes: viewing.notes || '',
    created_at: new Date().toISOString()
  };

  try {
    // If the referenced client_id or unit_id starts with 'local_', Supabase will fail foreign key checks.
    // In this case, we insert nulls for the FKs in Supabase, but save them in local storage.
    const supabasePayload = { ...newViewing };
    if (newViewing.client_id && newViewing.client_id.toString().startsWith('local_')) {
      supabasePayload.client_id = null;
    }
    if (newViewing.unit_id && newViewing.unit_id.toString().startsWith('local_')) {
      supabasePayload.unit_id = null;
    }

    const { data, error } = await supabase
      .from('viewings')
      .insert([supabasePayload])
      .select();

    if (error) throw error;

    const local = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    const updatedLocal = [...local, newViewing].sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
    localStorage.setItem('cs_viewings', JSON.stringify(updatedLocal));
    return { success: true, data: data[0], isLocal: false };
  } catch (err) {
    console.warn('Supabase insert failed, saving to localStorage only:', err.message);
    const local = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    const updatedLocal = [...local, newViewing].sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
    localStorage.setItem('cs_viewings', JSON.stringify(updatedLocal));
    return { success: true, data: newViewing, isLocal: true };
  }
};

export const dbDeleteViewing = async (id, currentViewings) => {
  const updatedLocal = currentViewings.filter(v => v.id !== id);
  localStorage.setItem('cs_viewings', JSON.stringify(updatedLocal));

  try {
    if (id.toString().startsWith('local_')) {
      return { success: true, isLocal: true };
    }
    const { error } = await supabase
      .from('viewings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, isLocal: false };
  } catch (err) {
    console.warn('Supabase delete failed, updated local cache only:', err.message);
    return { success: true, isLocal: true };
  }
};
