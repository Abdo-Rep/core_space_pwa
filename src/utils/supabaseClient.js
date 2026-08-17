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

    const localData = JSON.parse(localStorage.getItem('cs_clients') || '[]');
    const pendingClients = localData.filter(c => c.id && c.id.toString().startsWith('local_'));
    const pendingIds = new Set(pendingClients.map(c => c.id));
    const merged = [...pendingClients, ...data.filter(c => !pendingIds.has(c.id))];

    localStorage.setItem('cs_clients', JSON.stringify(merged));
    return { data: merged, isLocal: false };
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
    created_at: client.created_at || new Date().toISOString()
  };

  const insertPayload = { ...newClient };
  if (insertPayload.id && insertPayload.id.toString().startsWith('local_')) {
    delete insertPayload.id; // Let Supabase auto-generate a valid ID (UUID)
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([insertPayload])
      .select();

    if (error) throw error;

    const remoteClient = data[0];

    // Update Local Storage Cache
    const local = JSON.parse(localStorage.getItem('cs_clients') || '[]');
    const updatedLocal = local.map(c => c.id === newClient.id ? remoteClient : c);
    if (!local.some(c => c.id === newClient.id || c.id === remoteClient.id)) {
      updatedLocal.unshift(remoteClient);
    }
    localStorage.setItem('cs_clients', JSON.stringify(updatedLocal));
    return { success: true, data: remoteClient, isLocal: false };
  } catch (err) {
    console.warn('Supabase insert failed, saving to localStorage only:', err.message);
    const local = JSON.parse(localStorage.getItem('cs_clients') || '[]');
    if (!local.some(c => c.id === newClient.id)) {
      const updatedLocal = [newClient, ...local];
      localStorage.setItem('cs_clients', JSON.stringify(updatedLocal));
    }
    return { success: true, data: newClient, isLocal: true };
  }
};

export const dbDeleteClient = async (id, currentClients) => {
  const updatedLocal = currentClients.filter(c => c.id !== id);
  localStorage.setItem('cs_clients', JSON.stringify(updatedLocal));

  try {
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

    const localData = JSON.parse(localStorage.getItem('cs_units') || '[]');
    const pendingUnits = localData.filter(u => u.id && u.id.toString().startsWith('local_'));
    const pendingIds = new Set(pendingUnits.map(u => u.id));
    const merged = [...pendingUnits, ...data.filter(u => !pendingIds.has(u.id))];

    localStorage.setItem('cs_units', JSON.stringify(merged));
    return { data: merged, isLocal: false };
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
    images: unit.images || [],
    notes: unit.notes || '',
    created_at: unit.created_at || new Date().toISOString()
  };

  const insertPayload = { ...newUnit };
  if (insertPayload.id && insertPayload.id.toString().startsWith('local_')) {
    delete insertPayload.id;
  }

  try {
    const { data, error } = await supabase
      .from('units')
      .insert([insertPayload])
      .select();

    if (error) throw error;

    const remoteUnit = data[0];

    const local = JSON.parse(localStorage.getItem('cs_units') || '[]');
    const updatedLocal = local.map(u => u.id === newUnit.id ? remoteUnit : u);
    if (!local.some(u => u.id === newUnit.id || u.id === remoteUnit.id)) {
      updatedLocal.unshift(remoteUnit);
    }
    localStorage.setItem('cs_units', JSON.stringify(updatedLocal));
    return { success: true, data: remoteUnit, isLocal: false };
  } catch (err) {
    console.warn('Supabase insert failed, saving to localStorage only:', err.message);
    const local = JSON.parse(localStorage.getItem('cs_units') || '[]');
    if (!local.some(u => u.id === newUnit.id)) {
      const updatedLocal = [newUnit, ...local];
      localStorage.setItem('cs_units', JSON.stringify(updatedLocal));
    }
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

    const localData = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    const pendingViewings = localData.filter(v => v.id && v.id.toString().startsWith('local_'));
    const pendingIds = new Set(pendingViewings.map(v => v.id));
    const merged = [...pendingViewings, ...data.filter(v => !pendingIds.has(v.id))];
    merged.sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));

    localStorage.setItem('cs_viewings', JSON.stringify(merged));
    return { data: merged, isLocal: false };
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to localStorage:', err.message);
    const localData = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
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
    viewing_time: viewing.viewing_time,
    notes: viewing.notes || '',
    created_at: viewing.created_at || new Date().toISOString()
  };

  const insertPayload = { ...newViewing };
  if (insertPayload.id && insertPayload.id.toString().startsWith('local_')) {
    delete insertPayload.id;
  }
  if (insertPayload.client_id && insertPayload.client_id.toString().startsWith('local_')) {
    insertPayload.client_id = null;
  }
  if (insertPayload.unit_id && insertPayload.unit_id.toString().startsWith('local_')) {
    insertPayload.unit_id = null;
  }

  try {
    const { data, error } = await supabase
      .from('viewings')
      .insert([insertPayload])
      .select();

    if (error) throw error;

    const remoteViewing = data[0];

    const local = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    const updatedLocal = local.map(v => v.id === newViewing.id ? remoteViewing : v);
    if (!local.some(v => v.id === newViewing.id || v.id === remoteViewing.id)) {
      updatedLocal.push(remoteViewing);
    }
    updatedLocal.sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
    localStorage.setItem('cs_viewings', JSON.stringify(updatedLocal));
    return { success: true, data: remoteViewing, isLocal: false };
  } catch (err) {
    console.warn('Supabase insert failed, saving to localStorage only:', err.message);
    const local = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    if (!local.some(v => v.id === newViewing.id)) {
      const updatedLocal = [...local, newViewing].sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
      localStorage.setItem('cs_viewings', JSON.stringify(updatedLocal));
    }
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

/**
 * OFFLINE DATA SYNC COORDINATOR
 */
export const syncOfflineData = async (clients, units, viewings, setClients, setUnits, setViewings) => {
  // Sync clients first
  const pendingClients = (clients || []).filter(c => c.id && c.id.toString().startsWith('local_'));
  const clientMap = {};

  for (let client of pendingClients) {
    try {
      const res = await dbAddClient(client);
      if (res.success && !res.isLocal) {
        clientMap[client.id] = res.data.id;
        if (setClients) {
          setClients(prev => prev.map(c => c.id === client.id ? res.data : c));
        }
      }
    } catch (err) {
      console.error('Failed to sync client in batch:', client.name, err);
    }
  }

  // Sync units
  const pendingUnits = (units || []).filter(u => u.id && u.id.toString().startsWith('local_'));
  const unitMap = {};

  for (let unit of pendingUnits) {
    try {
      const res = await dbAddUnit(unit);
      if (res.success && !res.isLocal) {
        unitMap[unit.id] = res.data.id;
        if (setUnits) {
          setUnits(prev => prev.map(u => u.id === unit.id ? res.data : u));
        }
      }
    } catch (err) {
      console.error('Failed to sync unit in batch:', unit.title, err);
    }
  }

  // Update viewing foreign keys in local viewings state/localStorage if referenced clients/units were synced
  const localViewings = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
  let updatedLocalViewings = [...localViewings];
  let changed = false;

  const updatedViewings = (viewings || []).map(v => {
    let itemUpdated = false;
    let newClientId = v.client_id;
    let newUnitId = v.unit_id;

    if (v.client_id && clientMap[v.client_id]) {
      newClientId = clientMap[v.client_id];
      itemUpdated = true;
    }
    if (v.unit_id && unitMap[v.unit_id]) {
      newUnitId = unitMap[v.unit_id];
      itemUpdated = true;
    }

    if (itemUpdated) {
      changed = true;
      const updatedViewing = { ...v, client_id: newClientId, unit_id: newUnitId };
      updatedLocalViewings = updatedLocalViewings.map(item => item.id === v.id ? updatedViewing : item);
      return updatedViewing;
    }
    return v;
  });

  if (changed) {
    localStorage.setItem('cs_viewings', JSON.stringify(updatedLocalViewings));
    if (setViewings) {
      setViewings(updatedViewings);
    }
  }

  // Sync viewings
  const pendingViewings = updatedViewings.filter(v => v.id && v.id.toString().startsWith('local_'));

  for (let viewing of pendingViewings) {
    try {
      const res = await dbAddViewing(viewing);
      if (res.success && !res.isLocal) {
        if (setViewings) {
          setViewings(prev => prev.map(v => v.id === viewing.id ? res.data : v));
        }
      }
    } catch (err) {
      console.error('Failed to sync viewing in batch:', viewing.client_name, err);
    }
  }
};
