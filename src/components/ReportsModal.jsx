import React, { useState } from 'react';

// Generates and downloads a CSV file formatted for Excel with Arabic UTF-8 BOM support
const exportToCSV = (data, headers, filename) => {
  const csvRows = [];
  
  // Format cell values to escape double quotes and wrap in quotes
  const formatCell = (val) => {
    if (val === null || val === undefined) return '';
    const stringVal = String(val);
    const escaped = stringVal.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  // Add headers row
  csvRows.push(headers.map(formatCell).join(','));
  
  // Add data rows
  data.forEach(row => {
    csvRows.push(row.map(formatCell).join(','));
  });
  
  // Add UTF-8 BOM so Excel opens Arabic RTL characters correctly
  const csvContent = "\uFEFF" + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generates an elegant print-ready HTML page and triggers the browser's PDF print output
const exportToPDF = (title, headers, rows) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة (Popups) لتوليد تقرير PDF');
    return;
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap');
        body {
          font-family: 'Cairo', sans-serif;
          padding: 40px 30px;
          color: #0d2447;
          background: #ffffff;
          margin: 0;
          direction: rtl;
        }
        .header-print {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #0d2447;
          padding-bottom: 18px;
          margin-bottom: 30px;
        }
        .logo-print {
          font-size: 26px;
          font-weight: 900;
          color: #0d2447;
        }
        .logo-print span {
          color: #3b82f6;
        }
        .title-print {
          font-size: 18px;
          font-weight: 800;
          text-align: left;
        }
        .meta-print {
          font-size: 11px;
          color: #64748b;
          text-align: left;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 10px 12px;
          text-align: right;
          font-size: 12px;
          line-height: 1.5;
        }
        th {
          background-color: #f1f5f9;
          font-weight: 800;
          color: #0d2447;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .footer-print {
          margin-top: 60px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header-print">
        <div>
          <div class="logo-print">Core <span>Space</span></div>
          <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 2px;">Where Deals Take Place | طنطا، مصر</div>
        </div>
        <div>
          <div class="title-print">${title}</div>
          <div class="meta-print">تاريخ طباعة التقرير: ${new Date().toLocaleDateString('ar-EG')}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer-print">
        تم استخراج هذا التقرير رسمياً من نظام إدارة عقارات وعملاء شركة Core Space العقارية.
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export default function ReportsModal({ 
  isOpen, 
  onClose, 
  clients = [], 
  units = [], 
  viewings = [] 
}) {
  const [reportType, setReportType] = useState('clients'); // clients | units | viewings
  const [clientFilter, setClientFilter] = useState('الكل'); // الكل | شراء | إيجار
  const [unitFilter, setUnitFilter] = useState('الكل'); // الكل | للبيع | للإيجار
  const [viewingFilter, setViewingFilter] = useState('الكل'); // الكل | قادمة | سابقة

  if (!isOpen) return null;

  const handleExport = (format) => {
    let title = '';
    let headers = [];
    let rows = [];
    let filename = '';

    if (reportType === 'clients') {
      const filtered = clientFilter === 'الكل' 
        ? clients 
        : clients.filter(c => c.type === clientFilter);
      
      title = `تقرير سجل العملاء (${clientFilter})`;
      headers = ['اسم العميل', 'رقم الهاتف', 'نوع الطلب', 'الميزانية المقترحة', 'الملاحظات والمتطلبات'];
      rows = filtered.map(c => [c.name, c.phone, c.type, c.budget || 'غير محدد', c.notes || 'لا يوجد']);
      filename = `تقرير_العملاء_${clientFilter}`;
    } 
    
    else if (reportType === 'units') {
      const filtered = unitFilter === 'الكل' 
        ? units 
        : units.filter(u => u.type === unitFilter);
      
      title = `تقرير جرد الوحدات العقارية (${unitFilter})`;
      headers = ['عنوان العقار', 'حالة العرض', 'السعر المطلوب', 'رقم هاتف المالك', 'تفاصيل العقار'];
      rows = filtered.map(u => [u.title, u.type, u.price || 'غير محدد', u.owner_phone || 'لا يوجد', u.notes || 'لا يوجد']);
      filename = `جرد_العقارات_${unitFilter}`;
    } 
    
    else if (reportType === 'viewings') {
      const now = new Date();
      const filtered = viewings.filter(v => {
        const vDate = new Date(v.viewing_time);
        if (viewingFilter === 'قادمة') return vDate >= now;
        if (viewingFilter === 'سابقة') return vDate < now;
        return true;
      });
      
      title = `تقرير جدول مواعيد المعاينات (${viewingFilter})`;
      headers = ['اسم العميل', 'العقار المستهدف', 'التاريخ والوقت المجدول', 'ملاحظات الزيارة'];
      rows = filtered.map(v => {
        const formattedDate = new Date(v.viewing_time).toLocaleString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return [v.client_name, v.unit_title, formattedDate, v.notes || 'لا يوجد'];
      });
      filename = `جدول_المعاينات_${viewingFilter}`;
    }

    if (format === 'excel') {
      exportToCSV(rows, headers, filename);
    } else {
      exportToPDF(title, headers, rows);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">تصدير التقارير والبيانات 📊</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 1. Report Type Switcher */}
        <div className="form-group">
          <label className="form-label">اختر نوع التقرير المطلوب</label>
          <div className="toggle-pill-container" style={{ background: 'rgba(3, 9, 20, 0.15)' }}>
            <div 
              className={`toggle-pill-option ${reportType === 'clients' ? 'selected' : ''}`}
              onClick={() => setReportType('clients')}
            >
              👥 العملاء
            </div>
            <div 
              className={`toggle-pill-option ${reportType === 'units' ? 'selected' : ''}`}
              onClick={() => setReportType('units')}
            >
              🏠 الوحدات
            </div>
            <div 
              className={`toggle-pill-option ${reportType === 'viewings' ? 'selected' : ''}`}
              onClick={() => setReportType('viewings')}
            >
              📅 المعاينات
            </div>
          </div>
        </div>

        {/* 2. Sub-Filters Selection */}
        {reportType === 'clients' && (
          <div className="form-group">
            <label className="form-label">فلترة طلبات العملاء</label>
            <div className="toggle-pill-container">
              <div 
                className={`toggle-pill-option ${clientFilter === 'الكل' ? 'selected' : ''}`}
                onClick={() => setClientFilter('الكل')}
              >
                الكل
              </div>
              <div 
                className={`toggle-pill-option ${clientFilter === 'شراء' ? 'selected' : ''}`}
                onClick={() => setClientFilter('شراء')}
              >
                شراء
              </div>
              <div 
                className={`toggle-pill-option ${clientFilter === 'إيجار' ? 'selected' : ''}`}
                onClick={() => setClientFilter('إيجار')}
              >
                إيجار
              </div>
            </div>
          </div>
        )}

        {reportType === 'units' && (
          <div className="form-group">
            <label className="form-label">فلترة تصنيف العقارات</label>
            <div className="toggle-pill-container">
              <div 
                className={`toggle-pill-option ${unitFilter === 'الكل' ? 'selected' : ''}`}
                onClick={() => setUnitFilter('الكل')}
              >
                الكل
              </div>
              <div 
                className={`toggle-pill-option ${unitFilter === 'للبيع' ? 'selected' : ''}`}
                onClick={() => setUnitFilter('للبيع')}
              >
                للبيع
              </div>
              <div 
                className={`toggle-pill-option ${unitFilter === 'للإيجار' ? 'selected' : ''}`}
                onClick={() => setUnitFilter('للإيجار')}
              >
                للإيجار
              </div>
            </div>
          </div>
        )}

        {reportType === 'viewings' && (
          <div className="form-group">
            <label className="form-label">توقيت المعاينات المجدولة</label>
            <div className="toggle-pill-container">
              <div 
                className={`toggle-pill-option ${viewingFilter === 'الكل' ? 'selected' : ''}`}
                onClick={() => setViewingFilter('الكل')}
              >
                الكل
              </div>
              <div 
                className={`toggle-pill-option ${viewingFilter === 'قادمة' ? 'selected' : ''}`}
                onClick={() => setViewingFilter('قادمة')}
              >
                المعاينات القادمة
              </div>
              <div 
                className={`toggle-pill-option ${viewingFilter === 'سابقة' ? 'selected' : ''}`}
                onClick={() => setViewingFilter('سابقة')}
              >
                المعاينات السابقة
              </div>
            </div>
          </div>
        )}

        {/* Preview summary information card */}
        <div className="date-summary-text" style={{ fontSize: '12px', marginTop: '10px' }}>
          💡 <strong>ملخص التصدير الحالي:</strong><br />
          سيتم سحب بيانات {
            reportType === 'clients' ? `العملاء بفلترة (${clientFilter}) - إجمالي: ${
              clientFilter === 'الكل' ? clients.length : clients.filter(c => c.type === clientFilter).length
            }` : 
            reportType === 'units' ? `الوحدات بفلترة (${unitFilter}) - إجمالي: ${
              unitFilter === 'الكل' ? units.length : units.filter(u => u.type === unitFilter).length
            }` : 
            `المعاينات بفلترة (${viewingFilter}) - إجمالي: ${
              viewingFilter === 'الكل' ? viewings.length : 
              viewingFilter === 'قادمة' ? viewings.filter(v => new Date(v.viewing_time) >= new Date()).length : 
              viewings.filter(v => new Date(v.viewing_time) < new Date()).length
            }`
          } سجل.
        </div>

        {/* 3. Export Buttons Row */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => handleExport('excel')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            📊 سحب ملف Excel
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => handleExport('pdf')}
            style={{ 
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', 
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px' 
            }}
          >
            📄 سحب ملف PDF
          </button>
        </div>

        {/* Close Button */}
        <div style={{ marginTop: '4px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
}
