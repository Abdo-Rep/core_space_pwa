import React, { useState, useEffect } from 'react';

// Helper to extract numbers from Arabic or English text (e.g., "500000", "500 ألف", "مليون ونصف")
const parseNumericValue = (text) => {
  if (!text) return 0;
  
  // Convert Eastern Arabic numerals (٠-٩) to standard English digits
  let cleanText = text.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  
  // Find any digits in the string
  const digits = cleanText.replace(/[^\d]/g, '');
  let num = digits ? parseInt(digits, 10) : 0;
  
  // Custom parsing for common Arabic financial keywords
  const textLower = cleanText.toLowerCase();
  
  if (textLower.includes('مليون')) {
    // If there is a number before "مليون", multiply by 1,000,000
    if (num > 0 && num < 100) {
      num = num * 1000000;
    } else if (textLower.includes('مليون ونصف') || textLower.includes('مليون ونص')) {
      num = 1500000;
    } else if (num === 0) {
      num = 1000000;
    }
  } else if (textLower.includes('ألف') || textLower.includes('الف')) {
    if (num > 0 && num < 1000) {
      num = num * 1000;
    } else if (num === 0) {
      num = 1000;
    }
  }
  
  return num;
};

// Check keyword matches between client notes and unit text
const calculateKeywordScore = (clientNotes = '', unitTitle = '', unitNotes = '') => {
  if (!clientNotes) return 0;
  
  const keywords = ['غرف', 'شارع', 'الجيش', 'النادي', 'متر', 'دور', 'أسانسير', 'اسانسير', 'تشطيب', 'سوبر', 'لوكس', 'دوبلكس', 'شقة', 'شقه', 'محل', 'ارضي', 'أرضي'];
  let score = 0;
  
  const clientNotesClean = clientNotes.toLowerCase();
  const unitTextCombined = `${unitTitle} ${unitNotes}`.toLowerCase();
  
  keywords.forEach(word => {
    if (clientNotesClean.includes(word) && unitTextCombined.includes(word)) {
      score += 15; // +15 points for every matching keyword
    }
  });
  
  return Math.min(score, 50); // Max keyword score is 50
};

export default function SmartMatchModal({ client, units, onClose }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (!client || !units) return;

    // 1. Filter units by type: 
    // Client 'شراء' -> Unit 'للبيع'
    // Client 'إيجار' -> Unit 'للإيجار'
    const targetUnitType = client.type === 'شراء' ? 'للبيع' : 'للإيجار';
    const candidateUnits = units.filter(unit => unit.type === targetUnitType);

    const scoredMatches = candidateUnits.map(unit => {
      let score = 30; // Base score for matching type

      const clientBudget = parseNumericValue(client.budget);
      const unitPrice = parseNumericValue(unit.price);

      // Price matching score logic
      if (clientBudget > 0 && unitPrice > 0) {
        if (clientBudget >= unitPrice) {
          // Inside budget
          const ratio = unitPrice / clientBudget;
          score += 40 * ratio; // The closer it is to the maximum budget, the higher the score (up to 40)
        } else {
          // Exceeds budget
          const overBudgetPercent = (unitPrice - clientBudget) / clientBudget;
          if (overBudgetPercent <= 0.1) {
            score += 20; // Slightly over budget (+10%)
          } else if (overBudgetPercent <= 0.25) {
            score += 10; // moderately over budget (+25%)
          } else {
            score -= 10; // far over budget
          }
        }
      } else {
        score += 20; // Default addition if price is not parseable
      }

      // Keyword match score logic
      const keywordScore = calculateKeywordScore(client.notes, unit.title, unit.notes);
      score += keywordScore;

      // Bound score between 0 and 100
      const finalScore = Math.max(0, Math.min(Math.round(score), 100));

      return {
        unit,
        score: finalScore,
        clientBudget,
        unitPrice
      };
    });

    // Sort matches by score descending
    scoredMatches.sort((a, b) => b.score - a.score);
    setMatches(scoredMatches);
  }, [client, units]);

  // Clean phone number for Egypt (standardize 01xxxxxxxxx to country code format)
  const formatWhatsAppPhone = (phone) => {
    let clean = phone.replace(/[^\d]/g, '');
    if (clean.startsWith('0')) {
      clean = '20' + clean.substring(1);
    } else if (clean.startsWith('1')) {
      clean = '20' + clean;
    }
    return clean;
  };

  const handleSendWhatsApp = (match) => {
    const formattedPhone = formatWhatsAppPhone(client.phone);
    const clientFirstName = client.name.split(' ')[0];
    
    // Arabic formatted pitch message
    const message = `أهلاً بك يا فندم ${clientFirstName}، شركة Core Space ترحب بحضرتك 🤝\nبناءً على طلبك، متوفر لدينا حالياً عقار متميز يطابق مواصفاتك تماماً:\n\n📌 العقار: ${match.unit.title}\n💰 السعر: ${match.unit.price || 'عند التواصل'}\n📝 تفاصيل إضافية: ${match.unit.notes || 'تشطيب ممتاز وموقع متميز'}\n\nيسعدنا تحديد موعد للمعاينة أو الرد على أي استفسار لحضرتك. دمتم بخير!`;
    
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">المطابقة الذكية العقارية ✨</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ fontSize: '13px', borderBottom: '1px solid var(--card-glass-border)', paddingBottom: '10px' }}>
          <strong>طلب العميل:</strong> {client.name} ({client.type})<br />
          {client.budget && <><strong>الميزانية:</strong> {client.budget}<br /></>}
          {client.notes && <><strong>الملاحظات:</strong> {client.notes}</>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>العقارات المطابقة المتاحة:</h4>
          
          {matches.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <div className="empty-state-text">لا يوجد عقارات مطابقة في هذا التبويب حالياً</div>
            </div>
          ) : (
            matches.map((match, idx) => (
              <div key={match.unit.id} className={`match-comparison-card ${idx === 0 ? 'selected-match' : ''}`}>
                <div className="match-header">
                  <span className="card-title" style={{ fontSize: '14px' }}>{match.unit.title}</span>
                  <span className="match-score">نسبة المطابقة: {match.score}%</span>
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>السعر: </span><strong className="price-tag">{match.unit.price || 'غير محدد'}</strong>
                  {match.unit.notes && <div style={{ marginTop: '4px', fontStyle: 'italic' }}>{match.unit.notes}</div>}
                </div>

                <div className="whatsapp-box">
                  <div className="whatsapp-text">
                    💬 <strong>محتوى الرسالة المقترحة للعميل:</strong><br />
                    أهلاً بك يا فندم {client.name.split(' ')[0]}... متوفر لدينا عقار متميز: {match.unit.title} بسعر {match.unit.price || 'غير محدد'}...
                  </div>
                  
                  <button className="btn btn-whatsapp" onClick={() => handleSendWhatsApp(match)}>
                    {/* WhatsApp Icon */}
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.035-3.468c1.667.989 3.3 1.485 5.962 1.488 5.305.003 9.622-4.27 9.626-9.526.002-2.546-.988-4.941-2.79-6.745C17.028 3.945 14.64 2.955 12.01 2.955c-5.309 0-9.624 4.273-9.628 9.531-.001 2.1.55 4.148 1.597 5.955l-.995 3.633 3.738-.981zm12.39-6.206c-.3-.15-1.77-.875-2.045-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.79-1.49-1.77-1.665-2.07-.175-.3-.02-.46.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.368-.008-.567-.008-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.115 4.525.715.31 1.273.495 1.71.635.715.227 1.365.195 1.88.117.573-.086 1.77-.724 2.02-1.417.25-.693.25-1.293.175-1.418-.075-.125-.275-.2-.575-.35z" />
                    </svg>
                    إرسال العرض عبر واتساب للعميل
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
