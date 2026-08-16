import React from 'react';

// Format date and time in Arabic (ar-EG) including weekday
const formatArabicDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  // Format to Egyptian Arabic (ar-EG)
  const dateStr = date.toLocaleDateString('ar-EG', dateOptions);
  const timeStr = date.toLocaleTimeString('ar-EG', timeOptions);
  
  return `${dateStr} - الساعة ${timeStr}`;
};

export default function ViewingsTab({ viewings, onDeleteViewing, onOpenAddModal }) {
  // Sort viewings ascending by time (safeguard)
  const sortedViewings = [...viewings].sort((a, b) => new Date(a.viewing_time) - new Date(b.viewing_time));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header section of tab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
          جدول المعاينات العقارية ({sortedViewings.length})
        </h2>
        <button className="btn btn-primary" onClick={onOpenAddModal} style={{ padding: '6px 12px', fontSize: '12px', flex: 'none' }}>
          + إضافة معاينة
        </button>
      </div>

      {/* Vertical list of viewings */}
      {sortedViewings.length === 0 ? (
        <div className="empty-state">
          {/* Calendar Clock Icon */}
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
          </svg>
          <div className="empty-state-text">لا يوجد معاينات بعد</div>
        </div>
      ) : (
        <div className="viewing-list">
          {sortedViewings.map(viewing => (
            <div key={viewing.id} className="card viewing-card">
              {/* Formatted Date/Time badge */}
              <div style={{ alignSelf: 'flex-start' }}>
                <span className="viewing-date-badge">
                  🕒 {formatArabicDateTime(viewing.viewing_time)}
                </span>
              </div>

              {/* Client Name with User Icon */}
              <div className="card-detail-item" style={{ marginTop: '4px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span>العميل: <strong style={{ color: 'var(--text-primary)' }}>{viewing.client_name}</strong></span>
              </div>

              {/* Unit Title with Building Icon */}
              <div className="card-detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v18H3V3z" />
                </svg>
                <span>العقار: <strong style={{ color: 'var(--text-primary)' }}>{viewing.unit_title}</strong></span>
              </div>

              {/* Optional viewing notes */}
              {viewing.notes && (
                <div className="card-notes" style={{ borderRightColor: 'var(--secondary-color)' }}>
                  {viewing.notes}
                </div>
              )}

              {/* Actions row */}
              <div className="card-actions">
                <button className="card-btn-delete" onClick={() => onDeleteViewing(viewing.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.72 0L9 9m5.71-3 1.34-1.34a1.285 1.285 0 0 0-1.09-2.18H8.82c-.347 0-.673.13-.93.36L6.5 6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  إلغاء المعاينة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
