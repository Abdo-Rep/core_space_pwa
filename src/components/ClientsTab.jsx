import React from 'react';

export default function ClientsTab({ clients, activeSubTab, onDeleteClient, onOpenAddModal, onOpenSmartMatch }) {
  // Filter clients by active sub-tab (شراء | إيجار)
  const filteredClients = clients.filter(client => client.type === activeSubTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header section of tab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
          قائمة العملاء ({activeSubTab === 'شراء' ? 'طالبي الشراء' : 'طالبي الإيجار'})
        </h2>
        <button className="btn btn-primary" onClick={onOpenAddModal} style={{ padding: '6px 12px', fontSize: '12px', flex: 'none' }}>
          + إضافة عميل
        </button>
      </div>

      {/* Grid of client cards */}
      {filteredClients.length === 0 ? (
        <div className="empty-state">
          {/* Empty Icon */}
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <div className="empty-state-text">لا يوجد عملاء بعد في هذا القسم</div>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredClients.map(client => (
            <div key={client.id} className="card">
              <div className="card-header">
                <div>
                  <span className={`card-badge ${client.type === 'شراء' ? 'badge-buy' : 'badge-rent'}`}>
                    {client.type}
                  </span>
                  <h3 className="card-title">{client.name}</h3>
                </div>
                
                {/* Smart Match Button on Top-Left (RTL) of Card */}
                <button 
                  className="smart-match-badge-btn" 
                  onClick={() => onOpenSmartMatch(client)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c0-.414.336-.75.75-.75h3.75c.414 0 .75.336.75.75v3.75c0 .414-.336.75-.75.75h-3.75a.75.75 0 0 1-.75-.75V8.25Z" />
                  </svg>
                  مطابقة ذكية
                </button>
              </div>

              {/* Phone number */}
              <div className="card-detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
                <a href={`tel:${client.phone}`} style={{ textDecoration: 'none', color: 'inherit', fontFamily: 'Outfit' }}>
                  {client.phone}
                </a>
              </div>

              {/* Budget */}
              {client.budget && (
                <div className="card-detail-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5m-18 3h18M3.75 12h16.5m-18 3h16.5M2.25 9.375a60.07 60.07 0 0 1 15.797-2.101c.727-.198 1.453.342 1.453 1.096V9.375M3.75 15.75h16.5" />
                  </svg>
                  <span>الميزانية: <strong className="price-tag">{client.budget}</strong></span>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div className="card-notes">
                  {client.notes}
                </div>
              )}

              {/* Actions row */}
              <div className="card-actions">
                <button className="card-btn-delete" onClick={() => onDeleteClient(client.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.72 0L9 9m5.71-3 1.34-1.34a1.285 1.285 0 0 0-1.09-2.18H8.82c-.347 0-.673.13-.93.36L6.5 6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  حذف العميل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
