import React from 'react';

export default function ClientsTab({ clients, activeSubTab, onDeleteClient, onOpenAddModal, onOpenSmartMatch }) {
  // Filter clients by active sub-tab (الكل | شراء | إيجار)
  const filteredClients = activeSubTab === 'الكل' 
    ? clients 
    : clients.filter(client => client.type === activeSubTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header section of tab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
          قائمة العملاء {activeSubTab === 'الكل' ? '(الكل)' : activeSubTab === 'شراء' ? '(طالبي الشراء)' : '(طالبي الإيجار)'}
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
            <div key={client.id} className="card" style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', padding: '8px 12px' }}>
              {/* Client Info (Right/Center side in RTL) */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`card-badge ${client.type === 'شراء' ? 'badge-buy' : 'badge-rent'}`}>
                    {client.type}
                  </span>
                  {client.id && client.id.toString().startsWith('local_') && (
                    <span className="badge-pending-sync" style={{ padding: '2px 6px', fontSize: '9px' }}>
                      ⏳ جاري المزامنة...
                    </span>
                  )}
                  <h3 className="card-title-compact" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: '800' }}>
                    {client.name}
                  </h3>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
                  <a href={`tel:${client.phone}`} style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'Outfit' }}>
                    📞 {client.phone}
                  </a>
                  {client.budget && (
                    <span style={{ fontSize: '11px', color: 'var(--text-medium)' }}>
                      الميزانية: <strong className="price-tag" style={{ fontSize: '12px' }}>{client.budget}</strong>
                    </span>
                  )}
                </div>

                {client.notes && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px', borderRight: '2px solid var(--secondary-color)', paddingRight: '4px' }}>
                    {client.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons (Left side in RTL) */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                {/* Smart Match Icon Button */}
                <button 
                  className="smart-match-badge-btn-compact" 
                  onClick={() => onOpenSmartMatch(client)}
                  style={{ margin: 0, padding: '4px 6px', borderRadius: '5px', fontSize: '10px' }}
                  title="مطابقة ذكية"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '10px', height: '10px' }}>
                    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c0-.414.336-.75.75-.75h3.75c.414 0 .75.336.75.75v3.75c0 .414-.336.75-.75.75h-3.75a.75.75 0 0 1-.75-.75V8.25Z" />
                  </svg>
                  <span style={{ marginRight: '2px' }}>مطابقة</span>
                </button>

                {/* Delete Button */}
                <button 
                  className="card-btn-delete-icon" 
                  onClick={() => onDeleteClient(client.id)}
                  title="حذف العميل"
                  style={{ width: '22px', height: '22px', borderRadius: '5px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '11px', height: '11px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.72 0L9 9m5.71-3 1.34-1.34a1.285 1.285 0 0 0-1.09-2.18H8.82c-.347 0-.673.13-.93.36L6.5 6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
