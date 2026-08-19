import React from 'react';

export default function UnitsTab({ units, viewings = [], activeSubTab, onOpenAddModal, onSelectUnit }) {
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
            const unitViewingsCount = (viewings || []).filter(v => v.unit_id === unit.id).length;
            
            return (
              <div key={unit.id} className="card" onClick={() => onSelectUnit(unit)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', padding: '8px' }}>
                {/* Text Content (Right side in RTL) */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`card-badge ${unit.type === 'للبيع' ? 'badge-sale-unit' : 'badge-rent-unit'}`}>
                      {unit.type}
                    </span>
                    {unit.id && unit.id.toString().startsWith('local_') && (
                      <span className="badge-pending-sync" style={{ padding: '2px 6px', fontSize: '9px' }}>
                        ⏳ جاري المزامنة...
                      </span>
                    )}
                  </div>
                  
                  <h3 className="card-title-compact" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: '800' }}>
                    {unit.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
                    {unit.price && (
                      <span style={{ fontSize: '11px', color: 'var(--text-medium)' }}>
                        السعر: <strong className="price-tag" style={{ fontSize: '12px' }}>{unit.price}</strong>
                      </span>
                    )}
                    {unitViewingsCount > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--secondary-color)', fontWeight: '700' }}>
                        📅 معاينات: <strong>{unitViewingsCount}</strong>
                      </span>
                    )}
                    {unit.owner_phone && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Outfit' }}>
                        📞 {unit.owner_phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Media Section (Left side in RTL) */}
                <div className="unit-card-media" style={{ width: '64px', height: '64px', borderRadius: '8px', flexShrink: 0, overflow: 'hidden' }}>
                  {hasImages ? (
                    <img 
                      src={unit.images[0]} 
                      alt={unit.title} 
                      className="unit-thumbnail" 
                      style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="unit-image-placeholder" style={{ height: '100%', width: '100%', gap: '2px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v18H3V3z" />
                      </svg>
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
