import React from 'react';

export default function UnitsTab({ units, activeSubTab, onOpenAddModal, onSelectUnit }) {
  // Filter units by active sub-tab (الكل | للبيع | للإيجار)
  const filteredUnits = activeSubTab === 'الكل'
    ? units
    : units.filter(unit => unit.type === activeSubTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header section of tab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
          قائمة الوحدات {activeSubTab === 'الكل' ? '(الكل)' : activeSubTab === 'للبيع' ? '(المعروضة للبيع)' : '(المعروضة للإيجار)'}
        </h2>
        <button className="btn btn-primary" onClick={onOpenAddModal} style={{ padding: '6px 12px', fontSize: '12px', flex: 'none' }}>
          + إضافة عقار
        </button>
      </div>

      {/* Grid of unit cards */}
      {filteredUnits.length === 0 ? (
        <div className="empty-state">
          {/* Empty Icon */}
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <div className="empty-state-text">لا يوجد وحدات بعد في هذا القسم</div>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredUnits.map(unit => {
            const hasImages = unit.images && unit.images.length > 0;
            
            return (
              <div key={unit.id} className="card" onClick={() => onSelectUnit(unit)} style={{ cursor: 'pointer' }}>
                {/* Media Section: Image thumbnail or Placeholder */}
                <div className="unit-card-media" style={{ height: '70px' }}>
                  {hasImages ? (
                    <>
                      <img 
                        src={unit.images[0]} 
                        alt={unit.title} 
                        className="unit-thumbnail" 
                        style={{ height: '70px' }}
                      />
                      {unit.images.length > 1 && (
                        <span className="unit-image-counter">+{unit.images.length - 1} صور</span>
                      )}
                    </>
                  ) : (
                    <div className="unit-image-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v18H3V3z" />
                      </svg>
                      <span style={{ fontSize: '10px' }}>لا يوجد صور</span>
                    </div>
                  )}
                </div>

                {/* Header with badge, title */}
                <div className="card-header-compact" style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`card-badge ${unit.type === 'للبيع' ? 'badge-sale-unit' : 'badge-rent-unit'}`}>
                        {unit.type}
                      </span>
                      {unit.id && unit.id.toString().startsWith('local_') && (
                        <span className="badge-pending-sync">
                          ⏳ جاري المزامنة...
                        </span>
                      )}
                    </div>
                    <h3 className="card-title-compact" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {unit.title}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="card-body-compact">
                  {unit.owner_phone && (
                    <div className="card-detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      <span>{unit.owner_phone}</span>
                    </div>
                  )}

                  {unit.price && (
                    <div className="card-detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        السعر: <strong className="price-tag">{unit.price}</strong>
                      </span>
                    </div>
                  )}

                  {unit.notes && (
                    <div className="card-notes">
                      {unit.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
