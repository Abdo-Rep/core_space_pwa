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
  AddViewingModal 
} from './components/Modals';
import { 
  dbGetClients, dbAddClient, dbDeleteClient,
  dbGetUnits, dbAddUnit, dbDeleteUnit,
  dbGetViewings, dbAddViewing, dbDeleteViewing
} from './utils/supabaseClient';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('home'); // home | clients | units | viewings
  const [activeSubTabClients, setActiveSubTabClients] = useState('شراء'); // شراء | إيجار
  const [activeSubTabUnits, setActiveSubTabUnits] = useState('للبيع'); // للبيع | للإيجار

  // Theme State (Dark/Light Mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cs_theme') || 'dark'; // Default to dark mode
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('cs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Data States
  const [clients, setClients] = useState([]);
  const [units, setUnits] = useState([]);
  const [viewings, setViewings] = useState([]);

  // UI States
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

  // Initial Data Fetching from Supabase / localStorage Fallback
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      let isAnyLocal = false;

      // Load Clients
      const clientsRes = await dbGetClients();
      setClients(clientsRes.data);
      if (clientsRes.isLocal) isAnyLocal = true;

      // Load Units
      const unitsRes = await dbGetUnits();
      setUnits(unitsRes.data);
      if (unitsRes.isLocal) isAnyLocal = true;

      // Load Viewings
      const viewingsRes = await dbGetViewings();
      setViewings(viewingsRes.data);
      if (viewingsRes.isLocal) isAnyLocal = true;

      setIsLoading(false);
    };

    loadAllData();
  }, []);

  // ----------------------------------------------------
  // CLIENTS ACTIONS
  // ----------------------------------------------------
  const handleAddClient = async (clientData) => {
    setIsLoading(true);
    const res = await dbAddClient(clientData);
    if (res.success) {
      setClients(prev => [res.data, ...prev]);
      triggerAlert('تم إضافة العميل بنجاح');
    } else {
      triggerAlert('فشلت إضافة العميل');
    }
    setIsLoading(false);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف معايناته المرتبطة تلقائياً.')) return;
    
    setIsLoading(true);
    const res = await dbDeleteClient(id, clients);
    if (res.success) {
      setClients(prev => prev.filter(c => c.id !== id));
      // Delete local viewings pointing to this client
      setViewings(prev => prev.filter(v => v.client_id !== id));
      triggerAlert('تم حذف العميل بنجاح');
    } else {
      triggerAlert('فشل حذف العميل');
    }
    setIsLoading(false);
  };

  // ----------------------------------------------------
  // UNITS ACTIONS
  // ----------------------------------------------------
  const handleAddUnit = async (unitData) => {
    setIsLoading(true);
    const res = await dbAddUnit(unitData);
    if (res.success) {
      setUnits(prev => [res.data, ...prev]);
      triggerAlert('تم إضافة العقار بنجاح');
    } else {
      triggerAlert('فشلت إضافة العقار');
    }
    setIsLoading(false);
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العقار؟ سيتم حذف معايناته المرتبطة تلقائياً.')) return;

    setIsLoading(true);
    const res = await dbDeleteUnit(id, units);
    if (res.success) {
      setUnits(prev => prev.filter(u => u.id !== id));
      // Delete local viewings pointing to this unit
      setViewings(prev => prev.filter(v => v.unit_id !== id));
      triggerAlert('تم حذف العقار بنجاح');
    } else {
      triggerAlert('فشل حذف العقار');
    }
    setIsLoading(false);
  };

  // ----------------------------------------------------
  // VIEWING ACTIONS
  // ----------------------------------------------------
  const handleAddViewing = async (viewingData) => {
    setIsLoading(true);
    const res = await dbAddViewing(viewingData);
    if (res.success) {
      // Re-fetch or add and sort in state
      setViewings(prev => {
        const updated = [...prev, res.data];
        return updated.sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));
      });
      triggerAlert('تم جدولة المعاينة بنجاح');
    } else {
      triggerAlert('فشلت جدولة المعاينة');
    }
    setIsLoading(false);
  };

  const handleDeleteViewing = async (id) => {
    if (!window.confirm('هل أنت متأكد من إلغاء موعد هذه المعاينة؟')) return;

    setIsLoading(true);
    const res = await dbDeleteViewing(id, viewings);
    if (res.success) {
      setViewings(prev => prev.filter(v => v.id !== id));
      triggerAlert('تم إلغاء المعاينة بنجاح');
    } else {
      triggerAlert('فشل إلغاء المعاينة');
    }
    setIsLoading(false);
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
            activeSubTab={activeSubTabUnits}
            onDeleteUnit={handleDeleteUnit}
            onOpenAddModal={() => setIsAddUnitOpen(true)}
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
