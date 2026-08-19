import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardTab from './components/DashboardTab';
import ClientsTab from './components/ClientsTab';
import UnitsTab from './components/UnitsTab';
import ViewingsTab from './components/ViewingsTab';
import SmartMatchModal from './components/SmartMatchModal';
import ReportsModal from './components/ReportsModal';
import { 
  AddClientModal, 
  AddUnitModal, 
  AddViewingModal,
  UnitDetailsModal
} from './components/Modals';
import { 
  dbGetClients, dbAddClient, dbDeleteClient,
  dbGetUnits, dbAddUnit, dbDeleteUnit,
  dbGetViewings, dbAddViewing, dbDeleteViewing,
  syncOfflineData
} from './utils/supabaseClient';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('home'); // home | clients | units | viewings
  const [activeSubTabClients, setActiveSubTabClients] = useState('الكل'); // الكل | شراء | إيجار
  const [activeSubTabUnits, setActiveSubTabUnits] = useState('الكل'); // الكل | للبيع | للإيجار
  const [selectedUnitForDetails, setSelectedUnitForDetails] = useState(null);

  // Theme State (Dark/Light Mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cs_theme') || 'dark'; // Default to dark mode
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Data States (Loaded instantly from local storage cache)
  const [clients, setClients] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cs_clients') || '[]');
    } catch {
      return [];
    }
  });
  const [units, setUnits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cs_units') || '[]');
    } catch {
      return [];
    }
  });
  const [viewings, setViewings] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
      return data.sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
    } catch {
      return [];
    }
  });

  // UI States (Starts false on startup to prevent blocking loaders)
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [selectedClientForMatch, setSelectedClientForMatch] = useState(null);

  // Modals Visibility
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isAddViewingOpen, setIsAddViewingOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Trigger temporary toast notification
  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => {
      setAlertMsg('');
    }, 3000);
  };

  // Silent Background Fetching (No blocking loading spinners on launch)
  useEffect(() => {
    const loadAllDataSilently = async () => {
      try {
        const clientsRes = await dbGetClients();
        setClients(clientsRes.data);

        const unitsRes = await dbGetUnits();
        setUnits(unitsRes.data);

        const viewingsRes = await dbGetViewings();
        setViewings(viewingsRes.data);

        if (clientsRes.error || unitsRes.error || viewingsRes.error) {
          const dbErr = clientsRes.error || unitsRes.error || viewingsRes.error;
          triggerAlert(`تنبيه: فشل الاتصال بالسحابة (يعمل محلياً حالياً). السبب: ${dbErr}`);
        }

        // Run background sync coordinator on load
        await syncOfflineData(
          clientsRes.data,
          unitsRes.data,
          viewingsRes.data,
          setClients,
          setUnits,
          setViewings,
          triggerAlert
        );
      } catch (err) {
        console.warn('Silent background synchronization failed:', err.message);
      }
    };

    loadAllDataSilently();
  }, []);

  // Automatically trigger sync when network status changes to online
  useEffect(() => {
    const handleOnline = () => {
      console.log('App detected online connection, triggering sync offline data...');
      syncOfflineData(clients, units, viewings, setClients, setUnits, setViewings, triggerAlert);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [clients, units, viewings]);

  // ----------------------------------------------------
  // CLIENTS ACTIONS
  // ----------------------------------------------------
  const handleAddClient = async (clientData) => {
    const tempId = 'local_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    const newClient = {
      id: tempId,
      name: clientData.name,
      phone: clientData.phone,
      type: clientData.type,
      budget: clientData.budget || '',
      notes: clientData.notes || '',
      created_at: new Date().toISOString()
    };

    // Update state immediately
    setClients(prev => [newClient, ...prev]);

    // Update localStorage cache immediately
    const local = JSON.parse(localStorage.getItem('cs_clients') || '[]');
    localStorage.setItem('cs_clients', JSON.stringify([newClient, ...local]));

    triggerAlert('جاري حفظ وإضافة العميل... ⏳');

    // Perform database insertion in background
    dbAddClient(newClient).then(res => {
      if (res.success && !res.isLocal) {
        setClients(prev => prev.map(c => c.id === tempId ? res.data : c));
        triggerAlert('تم حفظ ومزامنة العميل بنجاح ✅');
      } else {
        triggerAlert(`فشل مزامنة العميل: ${res.error || 'خطأ غير معروف'}`);
      }
    }).catch(err => {
      console.error('Background add client error:', err);
    });
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف معايناته المرتبطة تلقائياً.')) return;
    
    // Update local state immediately
    setClients(prev => prev.filter(c => c.id !== id));
    setViewings(prev => prev.filter(v => v.client_id !== id));

    // Update localStorage immediately
    const localClients = JSON.parse(localStorage.getItem('cs_clients') || '[]');
    localStorage.setItem('cs_clients', JSON.stringify(localClients.filter(c => c.id !== id)));

    const localViewings = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    localStorage.setItem('cs_viewings', JSON.stringify(localViewings.filter(v => v.client_id !== id)));

    triggerAlert('جاري حذف العميل... ⏳');

    dbDeleteClient(id, clients).then(res => {
      if (res.success) {
        triggerAlert('تم حذف العميل بنجاح ✅');
      } else {
        triggerAlert('فشل حذف العميل من السحابة (تم الحذف محلياً)');
      }
    }).catch(err => {
      console.error('Background delete client error:', err);
    });
  };

  // ----------------------------------------------------
  // UNITS ACTIONS
  // ----------------------------------------------------
  const handleAddUnit = async (unitData) => {
    const tempId = 'local_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    const newUnit = {
      id: tempId,
      owner_phone: unitData.owner_phone || '',
      title: unitData.title,
      type: unitData.type,
      price: unitData.price || '',
      images: unitData.images || [],
      notes: unitData.notes || '',
      created_at: new Date().toISOString()
    };

    setUnits(prev => [newUnit, ...prev]);

    const local = JSON.parse(localStorage.getItem('cs_units') || '[]');
    localStorage.setItem('cs_units', JSON.stringify([newUnit, ...local]));

    triggerAlert('جاري حفظ وإضافة العقار... ⏳');

    dbAddUnit(newUnit).then(res => {
      if (res.success && !res.isLocal) {
        setUnits(prev => prev.map(u => u.id === tempId ? res.data : u));
        triggerAlert('تم حفظ ومزامنة العقار بنجاح ✅');
      } else {
        triggerAlert(`فشل مزامنة العقار: ${res.error || 'خطأ غير معروف'}`);
      }
    }).catch(err => {
      console.error('Background add unit error:', err);
    });
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العقار؟ سيتم حذف معايناته المرتبطة تلقائياً.')) return;

    setUnits(prev => prev.filter(u => u.id !== id));
    setViewings(prev => prev.filter(v => v.unit_id !== id));

    const localUnits = JSON.parse(localStorage.getItem('cs_units') || '[]');
    localStorage.setItem('cs_units', JSON.stringify(localUnits.filter(u => u.id !== id)));

    const localViewings = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    localStorage.setItem('cs_viewings', JSON.stringify(localViewings.filter(v => v.unit_id !== id)));

    triggerAlert('جاري حذف العقار... ⏳');

    dbDeleteUnit(id, units).then(res => {
      if (res.success) {
        triggerAlert('تم حذف العقار بنجاح ✅');
      } else {
        triggerAlert('فشل حذف العقار من السحابة (تم الحذف محلياً)');
      }
    }).catch(err => {
      console.error('Background delete unit error:', err);
    });
  };

  // ----------------------------------------------------
  // VIEWING ACTIONS
  // ----------------------------------------------------
  const handleAddViewing = async (viewingData) => {
    const tempId = 'local_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    const newViewing = {
      id: tempId,
      client_id: viewingData.client_id,
      unit_id: viewingData.unit_id,
      client_name: viewingData.client_name,
      unit_title: viewingData.unit_title,
      viewing_time: viewingData.viewing_time,
      notes: viewingData.notes || '',
      created_at: new Date().toISOString()
    };

    setViewings(prev => {
      const updated = [...prev, newViewing];
      return updated.sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
    });

    const local = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    const updatedLocal = [...local, newViewing].sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
    localStorage.setItem('cs_viewings', JSON.stringify(updatedLocal));

    triggerAlert('جاري حفظ وجدولة المعاينة... ⏳');

    dbAddViewing(newViewing).then(res => {
      if (res.success && !res.isLocal) {
        setViewings(prev => prev.map(v => v.id === tempId ? res.data : v).sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time)));
        triggerAlert('تم حفظ وجدولة المعاينة بنجاح ✅');
      } else {
        triggerAlert(`فشل مزامنة المعاينة: ${res.error || 'خطأ غير معروف'}`);
      }
    }).catch(err => {
      console.error('Background add viewing error:', err);
    });
  };

  const handleDeleteViewing = async (id) => {
    if (!window.confirm('هل أنت متأكد من إلغاء موعد هذه المعاينة؟')) return;

    setViewings(prev => prev.filter(v => v.id !== id));

    const localViewings = JSON.parse(localStorage.getItem('cs_viewings') || '[]');
    localStorage.setItem('cs_viewings', JSON.stringify(localViewings.filter(v => v.id !== id)));

    triggerAlert('جاري إلغاء المعاينة... ⏳');

    dbDeleteViewing(id, viewings).then(res => {
      if (res.success) {
        triggerAlert('تم إلغاء المعاينة بنجاح ✅');
      } else {
        triggerAlert('فشل إلغاء المعاينة من السحابة (تم الإلغاء محلياً)');
      }
    }).catch(err => {
      console.error('Background delete viewing error:', err);
    });
  };



  return (
    <>
      {/* Alert toast notification */}
      {alertMsg && <div className="alert-toast">{alertMsg}</div>}

      {/* Top Header Section */}
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* Conditional Sub-header for Tabs 1 and 2 */}
      {activeTab === 'clients' && (
        <div className="sub-header-bar">
          <button 
            className={`pill-button ${activeSubTabClients === 'الكل' ? 'active' : ''}`}
            onClick={() => setActiveSubTabClients('الكل')}
          >
            الكل
          </button>
          <button 
            className={`pill-button ${activeSubTabClients === 'شراء' ? 'active' : ''}`}
            onClick={() => setActiveSubTabClients('شراء')}
          >
            شراء
          </button>
          <button 
            className={`pill-button ${activeSubTabClients === 'إيجار' ? 'active' : ''}`}
            onClick={() => setActiveSubTabClients('إيجار')}
          >
            إيجار
          </button>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="sub-header-bar">
          <button 
            className={`pill-button ${activeSubTabUnits === 'الكل' ? 'active' : ''}`}
            onClick={() => setActiveSubTabUnits('الكل')}
          >
            الكل
          </button>
          <button 
            className={`pill-button ${activeSubTabUnits === 'للبيع' ? 'active' : ''}`}
            onClick={() => setActiveSubTabUnits('للبيع')}
          >
            للبيع
          </button>
          <button 
            className={`pill-button ${activeSubTabUnits === 'للإيجار' ? 'active' : ''}`}
            onClick={() => setActiveSubTabUnits('للإيجار')}
          >
            للإيجار
          </button>
        </div>
      )}

      {/* Main Content scroll area */}
      <main className="main-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {activeTab === 'home' && (
          <DashboardTab 
            clients={clients}
            units={units}
            viewings={viewings}
            setActiveTab={setActiveTab}
            onOpenAddClient={() => setIsAddClientOpen(true)}
            onOpenAddUnit={() => setIsAddUnitOpen(true)}
            onOpenAddViewing={() => setIsAddViewingOpen(true)}
            onOpenReports={() => setIsReportsOpen(true)}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab 
            clients={clients} 
            activeSubTab={activeSubTabClients}
            onDeleteClient={handleDeleteClient}
            onOpenAddModal={() => setIsAddClientOpen(true)}
            onOpenSmartMatch={(client) => setSelectedClientForMatch(client)}
          />
        )}

        {activeTab === 'units' && (
          <UnitsTab 
            units={units} 
            viewings={viewings}
            activeSubTab={activeSubTabUnits}
            onOpenAddModal={() => setIsAddUnitOpen(true)}
            onSelectUnit={(unit) => setSelectedUnitForDetails(unit)}
          />
        )}

        {activeTab === 'viewings' && (
          <ViewingsTab 
            viewings={viewings} 
            onDeleteViewing={handleDeleteViewing}
            onOpenAddModal={() => setIsAddViewingOpen(true)}
          />
        )}
      </main>



      {/* Fixed Bottom Navigation Footer */}
      <nav className="bottom-nav">
        <button 
          className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          {/* Home Dashboard Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="nav-tab-label">الرئيسية</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          {/* User group SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766v-.07c0-2.29 1.88-4.196 4.158-4.204A12.064 12.064 0 0 1 9.374 15c2.333 0 4.513.647 6.376 1.767M15 8.25a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM18.75 9a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          <span className="nav-tab-label">العملاء</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'units' ? 'active' : ''}`}
          onClick={() => setActiveTab('units')}
        >
          {/* Building/Office SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          <span className="nav-tab-label">الوحدات</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'viewings' ? 'active' : ''}`}
          onClick={() => setActiveTab('viewings')}
        >
          {/* Calendar SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
          </svg>
          <span className="nav-tab-label">معاينات</span>
        </button>
      </nav>

      {/* Add Client Modal */}
      <AddClientModal 
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSave={handleAddClient}
      />

      {/* Add Unit Modal */}
      <AddUnitModal 
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
        onSave={handleAddUnit}
      />

      {/* Unit Details Modal */}
      <UnitDetailsModal 
        isOpen={!!selectedUnitForDetails}
        onClose={() => setSelectedUnitForDetails(null)}
        unit={selectedUnitForDetails}
        onDelete={handleDeleteUnit}
        viewings={viewings}
      />

      {/* Add Viewing Modal */}
      <AddViewingModal 
        isOpen={isAddViewingOpen}
        onClose={() => setIsAddViewingOpen(false)}
        onSave={handleAddViewing}
        clients={clients}
        units={units}
      />

      {/* Smart Match AI Modal */}
      {selectedClientForMatch && (
        <SmartMatchModal 
          client={selectedClientForMatch}
          units={units}
          onClose={() => setSelectedClientForMatch(null)}
        />
      )}

      {/* Reports Modal */}
      <ReportsModal 
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        clients={clients}
        units={units}
        viewings={viewings}
      />
    </>
  );
}
