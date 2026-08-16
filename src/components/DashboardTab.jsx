import React, { useState } from 'react';

// Formats a date for the dashboard in Arabic (ar-EG)
const getArabicDateToday = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('ar-EG', options);
};

export default function DashboardTab({ 
  clients = [], 
  units = [], 
  viewings = [], 
  setActiveTab,
  onOpenAddClient,
  onOpenAddUnit,
  onOpenAddViewing,
  onOpenReports
}) {
  
  const [timeframe, setTimeframe] = useState('week'); // 'today' | 'week' | 'month' | 'custom'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // Default to last 7 days range
    d.setHours(0,0,0,0);
    return d;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(23,59,59,999);
    return d;
  });
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Get upcoming viewings (limit to 2)
  const upcomingViewings = [...viewings]
    .filter(v => new Date(v.viewing_time) >= new Date())
    .slice(0, 2);

  const monthsArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const weekdaysArabic = ['أح', 'إث', 'ث', 'أر', 'خ', 'ج', 'س'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayIndex = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleCalendarDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    clickedDate.setHours(0, 0, 0, 0);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else {
      if (clickedDate < startDate) {
        setStartDate(clickedDate);
      } else {
        const end = new Date(clickedDate);
        end.setHours(23, 59, 59, 999);
        setEndDate(end);
        setShowCustomCalendar(false); // collapse calendar when selection complete
      }
    }
  };

  // Get dynamic analytics based on creation dates and selected timeframe
  const getAnalytics = () => {
    const now = new Date();
    
    const isToday = (dateStr, targetDate = now) => {
      if (!dateStr) return false;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        return d.getDate() === targetDate.getDate() &&
               d.getMonth() === targetDate.getMonth() &&
               d.getFullYear() === targetDate.getFullYear();
      } catch {
        return false;
      }
    };

    const isThisWeek = (dateStr) => {
      if (!dateStr) return false;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } catch {
        return false;
      }
    };

    const isThisMonth = (dateStr) => {
      if (!dateStr) return false;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      } catch {
        return false;
      }
    };

    const isBetweenDates = (dateStr, start, end) => {
      if (!dateStr || !start) return false;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        const s = new Date(start);
        s.setHours(0, 0, 0, 0);
        const e = end ? new Date(end) : new Date(start);
        e.setHours(23, 59, 59, 999);
        return d >= s && d <= e;
      } catch {
        return false;
      }
    };

    const stats = { clients: 0, units: 0, viewings: 0 };
    const checkMatch = (dateStr) => {
      if (timeframe === 'today') return isToday(dateStr, now);
      if (timeframe === 'week') return isThisWeek(dateStr);
      if (timeframe === 'month') return isThisMonth(dateStr);
      if (timeframe === 'custom') return isBetweenDates(dateStr, startDate, endDate);
      return false;
    };

    // Calculate stats
    clients.forEach(c => { if (checkMatch(c.created_at)) stats.clients++; });
    units.forEach(u => { if (checkMatch(u.created_at)) stats.units++; });
    viewings.forEach(v => { if (checkMatch(v.created_at)) stats.viewings++; });

    return stats;
  };

  const analytics = getAnalytics();

  // Calculate chart bars based on selected timeframe
  const getChartData = () => {
    const now = new Date();

    const isToday = (dateStr, targetDate = now) => {
      if (!dateStr) return false;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        return d.getDate() === targetDate.getDate() &&
               d.getMonth() === targetDate.getMonth() &&
               d.getFullYear() === targetDate.getFullYear();
      } catch { return false; }
    };

    if (timeframe === 'today') {
      const targetDate = now;
      const periods = [
        { label: 'الصباح', startHour: 6, endHour: 12, count: 0, icon: '🌅' },
        { label: 'الظهيرة', startHour: 12, endHour: 18, count: 0, icon: '☀️' },
        { label: 'المساء', startHour: 18, endHour: 24, count: 0, icon: '🌆' },
        { label: 'الليل', startHour: 0, endHour: 6, count: 0, icon: '🌙' }
      ];

      const checkPeriod = (dateStr) => {
        if (!isToday(dateStr, targetDate)) return -1;
        const hour = new Date(dateStr).getHours();
        if (hour >= 6 && hour < 12) return 0;
        if (hour >= 12 && hour < 18) return 1;
        if (hour >= 18 && hour < 24) return 2;
        return 3;
      };

      clients.forEach(c => { const p = checkPeriod(c.created_at); if (p !== -1) periods[p].count++; });
      units.forEach(u => { const p = checkPeriod(u.created_at); if (p !== -1) periods[p].count++; });
      viewings.forEach(v => { const p = checkPeriod(v.created_at); if (p !== -1) periods[p].count++; });

      return periods.map(p => ({ label: p.label, value: p.count, display: `${p.icon} ${p.label}` }));
    } 
    
    else if (timeframe === 'week') {
      const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayNamesShort = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        days.push({
          date: d,
          dayName: dayNames[d.getDay()],
          dayNameShort: dayNamesShort[d.getDay()],
          count: 0
        });
      }

      const matchDay = (dateStr, targetDate) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getDate() === targetDate.getDate() &&
               d.getMonth() === targetDate.getMonth() &&
               d.getFullYear() === targetDate.getFullYear();
      };

      days.forEach(day => {
        clients.forEach(c => { if (matchDay(c.created_at, day.date)) day.count++; });
        units.forEach(u => { if (matchDay(u.created_at, day.date)) day.count++; });
        viewings.forEach(v => { if (matchDay(v.created_at, day.date)) day.count++; });
      });

      return days.map(d => ({ label: d.dayName, value: d.count, display: d.dayNameShort }));
    } 
    
    else if (timeframe === 'month') {
      const weeks = [
        { label: 'الأسبوع 1', startDay: 1, endDay: 7, count: 0 },
        { label: 'الأسبوع 2', startDay: 8, endDay: 14, count: 0 },
        { label: 'الأسبوع 3', startDay: 15, endDay: 21, count: 0 },
        { label: 'الأسبوع 4', startDay: 22, endDay: 31, count: 0 }
      ];

      const matchMonthYear = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getMonth() === now.getMonth() &&
               d.getFullYear() === now.getFullYear();
      };

      const getWeekIndex = (dateStr) => {
        if (!matchMonthYear(dateStr)) return -1;
        const date = new Date(dateStr).getDate();
        if (date >= 1 && date <= 7) return 0;
        if (date >= 8 && date <= 14) return 1;
        if (date >= 15 && date <= 21) return 2;
        return 3;
      };

      clients.forEach(c => { const w = getWeekIndex(c.created_at); if (w !== -1) weeks[w].count++; });
      units.forEach(u => { const w = getWeekIndex(u.created_at); if (w !== -1) weeks[w].count++; });
      viewings.forEach(v => { const w = getWeekIndex(v.created_at); if (w !== -1) weeks[w].count++; });

      return weeks.map(w => ({ label: w.label, value: w.count, display: w.label }));
    }

    else if (timeframe === 'custom') {
      if (!startDate) return [];
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = endDate ? new Date(endDate) : new Date(startDate);
      end.setHours(23, 59, 59, 999);

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Filter data in range
      const inRangeData = [];
      const filterData = (arr) => {
        arr.forEach(item => {
          if (!item.created_at) return;
          const d = new Date(item.created_at);
          if (d >= start && d <= end) {
            inRangeData.push(d);
          }
        });
      };
      filterData(clients);
      filterData(units);
      filterData(viewings);

      if (diffDays <= 1) {
        const periods = [
          { label: 'الصباح', count: 0, icon: '🌅' },
          { label: 'الظهيرة', count: 0, icon: '☀️' },
          { label: 'المساء', count: 0, icon: '🌆' },
          { label: 'الليل', count: 0, icon: '🌙' }
        ];
        inRangeData.forEach(d => {
          const hour = d.getHours();
          if (hour >= 6 && hour < 12) periods[0].count++;
          else if (hour >= 12 && hour < 18) periods[1].count++;
          else if (hour >= 18 && hour < 24) periods[2].count++;
          else periods[3].count++;
        });
        return periods.map(p => ({ label: p.label, value: p.count, display: `${p.icon} ${p.label}` }));
      } 
      
      else if (diffDays <= 8) {
        const days = [];
        for (let i = 0; i < diffDays; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          days.push({
            date: d,
            label: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
            count: 0
          });
        }
        inRangeData.forEach(d => {
          days.forEach(day => {
            if (d.getDate() === day.date.getDate() && d.getMonth() === day.date.getMonth()) {
              day.count++;
            }
          });
        });
        return days.map(day => ({ label: day.label, value: day.count, display: day.label }));
      } 
      
      else if (diffDays <= 35) {
        const weeksCount = Math.ceil(diffDays / 7);
        const weeks = Array.from({ length: weeksCount }, (_, i) => {
          const wStart = new Date(start);
          wStart.setDate(start.getDate() + i * 7);
          const wEnd = new Date(start);
          wEnd.setDate(start.getDate() + (i + 1) * 7 - 1);
          return {
            label: `أسبوع ${i + 1}`,
            startDay: wStart,
            endDay: wEnd,
            count: 0
          };
        });
        inRangeData.forEach(d => {
          weeks.forEach(w => {
            if (d >= w.startDay && d <= w.endDay) {
              w.count++;
            }
          });
        });
        return weeks.map(w => ({ label: w.label, value: w.count, display: w.label }));
      } 
      
      else {
        const monthsMap = {};
        inRangeData.forEach(d => {
          const mKey = d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
          monthsMap[mKey] = (monthsMap[mKey] || 0) + 1;
        });

        const monthsList = [];
        let runner = new Date(start);
        while (runner <= end) {
          const mKey = runner.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
          if (!monthsList.includes(mKey)) {
            monthsList.push(mKey);
          }
          runner.setMonth(runner.getMonth() + 1);
        }

        return monthsList.map(mKey => ({
          label: mKey,
          value: monthsMap[mKey] || 0,
          display: mKey.split(' ')[0]
        }));
      }
    }

    return [];
  };

  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  const formatTimeOnly = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDateOnly = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bento-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Welcoming Hero Banner */}
      <div className="bento-hero">
        <div className="bento-hero-left">
          <span className="bento-hero-badge">⚡ شريك صفقاتك العقارية</span>
          <h2 className="bento-hero-title">Core Space</h2>
          <p className="bento-hero-desc">حيث تلتقي أفضل صفقات عقارات طنطا</p>
        </div>
        <div className="bento-hero-date">
          <span>{getArabicDateToday()}</span>
        </div>
      </div>

      {/* 2. Upcoming Viewings Bento Feed */}
      <div>
        <h3 className="bento-section-title">🔔 أقرب موعدين معاينة</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {upcomingViewings.length === 0 ? (
            <div className="bento-feed-empty">
              <span>📭 لا يوجد مواعيد معاينة مجدولة قريباً</span>
            </div>
          ) : (
            upcomingViewings.map(v => (
              <div key={v.id} className="bento-feed-card">
                <div className="feed-card-header">
                  <span className="feed-time-badge">🕒 {formatDateOnly(v.viewing_time)} | {formatTimeOnly(v.viewing_time)}</span>
                </div>
                <div className="feed-card-body">
                  <div className="feed-info-item">👤 العميل: <strong>{v.client_name}</strong></div>
                  <div className="feed-info-item">🏠 العقار: <span>{v.unit_title}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Optimized Bento Stats Grid */}
      <div>
        <h3 className="bento-section-title">📊 لوحة المؤشرات</h3>
        <div className="bento-stats-layout">
          
          {/* Row 1: Full-Width Primary Card (Clients) */}
          <div className="bento-card-wide clients-bento" onClick={() => setActiveTab('clients')}>
            <div className="bento-card-wide-right">
              <span className="bento-emoji-circle">👥</span>
              <div className="bento-card-info">
                <span className="bento-label-primary">العملاء النشطين</span>
                <span className="bento-desc-secondary">طالبو الشراء والإيجار المسجلين</span>
              </div>
            </div>
            <div className="bento-card-wide-left">
              <span className="bento-num-glow">{clients.length}</span>
            </div>
          </div>

          {/* Row 2: Two equal columns side-by-side (Units & Viewings) */}
          <div className="bento-row-two-columns">
            {/* Units Card */}
            <div className="bento-card-square units-bento" onClick={() => setActiveTab('units')}>
              <span className="bento-emoji-flat">🏠</span>
              <span className="bento-square-num">{units.length}</span>
              <span className="bento-square-label">عقار متاح</span>
            </div>

            {/* Viewings Card */}
            <div className="bento-card-square viewings-bento" onClick={() => setActiveTab('viewings')}>
              <span className="bento-emoji-flat">📅</span>
              <span className="bento-square-num">{viewings.length}</span>
              <span className="bento-square-label">معاينة مجدولة</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* 3. Quick Action Shortcuts */}
      <div>
        <h3 className="bento-section-title">🚀 اختصارات سريعة</h3>
        <div className="bento-shortcuts-grid">
          
          <button className="bento-shortcut-btn add-client-shortcut" onClick={onOpenAddClient}>
            <span className="shortcut-emoji">👤+</span>
            <span className="shortcut-text">إضافة عميل</span>
          </button>

          <button className="bento-shortcut-btn add-unit-shortcut" onClick={onOpenAddUnit}>
            <span className="shortcut-emoji">🏠+</span>
            <span className="shortcut-text">إضافة عقار</span>
          </button>

          <button className="bento-shortcut-btn add-viewing-shortcut" onClick={onOpenAddViewing}>
            <span className="shortcut-emoji">📅+</span>
            <span className="shortcut-text">حجز معاينة</span>
          </button>

          <button className="bento-shortcut-btn reports-shortcut" onClick={onOpenReports}>
            <span className="shortcut-emoji">📊</span>
            <span className="shortcut-text">تصدير تقارير</span>
          </button>

        </div>
      </div>

      {/* 4. Analytics & Growth Insights Section */}
      <div>
        <h3 className="bento-section-title">📈 تحليلات ونمو النشاط</h3>
        <div className="analytics-layout" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Timeframe selector header */}
          <div className="analytics-tab-selectors" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button 
              type="button"
              className={`pill-button ${timeframe === 'today' ? 'active' : ''}`}
              onClick={() => { setTimeframe('today'); setShowCustomCalendar(false); }}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              اليوم
            </button>
            <button 
              type="button"
              className={`pill-button ${timeframe === 'week' ? 'active' : ''}`}
              onClick={() => { setTimeframe('week'); setShowCustomCalendar(false); }}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              الأسبوع
            </button>
            <button 
              type="button"
              className={`pill-button ${timeframe === 'month' ? 'active' : ''}`}
              onClick={() => { setTimeframe('month'); setShowCustomCalendar(false); }}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              الشهر
            </button>
            <button 
              type="button"
              className={`pill-button ${timeframe === 'custom' ? 'active' : ''}`}
              onClick={() => { setTimeframe('custom'); setShowCustomCalendar(prev => !prev); }}
              style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              📅 {timeframe === 'custom' ? (
                endDate ? (
                  `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`
                ) : (
                  `${startDate.getDate()}/${startDate.getMonth() + 1}`
                )
              ) : 'تاريخ مخصص'}
            </button>
          </div>

          {/* Inline custom calendar picker */}
          {timeframe === 'custom' && showCustomCalendar && (
            <div className="modern-calendar" style={{ marginTop: '0', padding: '12px', border: '1px solid var(--card-glass-border)' }}>
              <div className="calendar-header" style={{ padding: '6px 10px', background: 'var(--calendar-header-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0' }}>
                <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth} title="الشهر السابق" style={{ background: 'rgba(255, 255, 255, 0.1)', width: '28px', height: '28px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '12px', height: '12px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select 
                    value={currentMonth} 
                    onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                    className="calendar-select-dropdown"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.15)', 
                      border: 'none', 
                      color: '#ffffff', 
                      fontWeight: '800', 
                      fontSize: '11px', 
                      padding: '4px 8px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      outline: 'none',
                      fontFamily: 'Cairo'
                    }}
                  >
                    {monthsArabic.map((m, idx) => (
                      <option key={idx} value={idx} style={{ color: '#0d2447', background: '#ffffff' }}>{m}</option>
                    ))}
                  </select>

                  <select 
                    value={currentYear} 
                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    className="calendar-select-dropdown"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.15)', 
                      border: 'none', 
                      color: '#ffffff', 
                      fontWeight: '800', 
                      fontSize: '11px', 
                      padding: '4px 8px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      outline: 'none',
                      fontFamily: 'Outfit'
                    }}
                  >
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => (
                      <option key={y} value={y} style={{ color: '#0d2447', background: '#ffffff' }}>{y}</option>
                    ))}
                  </select>
                </div>

                <button type="button" className="calendar-nav-btn" onClick={handleNextMonth} title="الشهر التالي" style={{ background: 'rgba(255, 255, 255, 0.1)', width: '28px', height: '28px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '12px', height: '12px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>
              </div>

              <div className="calendar-weekdays" style={{ paddingBottom: '6px' }}>
                {weekdaysArabic.map((dayName, idx) => (
                  <div key={idx} className="calendar-weekday-cell" style={{ fontSize: '11px' }}>{dayName}</div>
                ))}
              </div>

              <div className="calendar-days-grid" style={{ gap: '4px' }}>
                {(() => {
                  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
                  const firstDayIdx = getFirstDayIndex(currentYear, currentMonth);
                  const cells = [];
                  for (let i = 0; i < firstDayIdx; i++) {
                    cells.push(<div key={`empty-${i}`} className="calendar-day-cell empty"></div>);
                  }
                  for (let day = 1; day <= daysInMonth; day++) {
                    const cellDate = new Date(currentYear, currentMonth, day);
                    cellDate.setHours(0,0,0,0);

                    const isSelectedStart = startDate && 
                                           startDate.getDate() === day && 
                                           startDate.getMonth() === currentMonth && 
                                           startDate.getFullYear() === currentYear;
                    
                    const isSelectedEnd = endDate && 
                                         endDate.getDate() === day && 
                                         endDate.getMonth() === currentMonth && 
                                         endDate.getFullYear() === currentYear;

                    const startVal = startDate ? startDate.getTime() : 0;
                    const endVal = endDate ? endDate.getTime() : 0;
                    const cellVal = cellDate.getTime();
                    
                    const isInRange = startDate && endDate && cellVal > startVal && cellVal < endVal;

                    const d = new Date();
                    const isToday = d.getDate() === day && 
                                    d.getMonth() === currentMonth && 
                                    d.getFullYear() === currentYear;

                    cells.push(
                      <div 
                        key={`day-${day}`} 
                        className={`calendar-day-cell ${
                          isSelectedStart ? 'selected selected-start' : 
                          isSelectedEnd ? 'selected selected-end' : 
                          isInRange ? 'selected-range-between' : ''
                        } ${isToday ? 'today' : ''}`}
                        onClick={() => {
                          handleCalendarDayClick(day);
                        }}
                        style={{ fontSize: '11px', height: '28px', width: '28px' }}
                      >
                        {day}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', fontWeight: '800' }}>
                💡 اختر تاريخ البداية ثم تاريخ النهاية لتحديد الفترة بالكامل.
              </div>
            </div>
          )}

          {/* Interactive Card showing Stats and Graph */}
          <div className="analytics-card" style={{ gap: '16px' }}>
            
            {/* Header info */}
            <div className="analytics-card-header">
              <span className={`analytics-time-badge ${
                timeframe === 'today' ? 'time-today' : timeframe === 'week' ? 'time-week' : timeframe === 'month' ? 'time-month' : 'time-today'
              }`} style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.18)' }}>
                {timeframe === 'today' && '⚡ نشاط اليوم الحالي'}
                {timeframe === 'week' && '📅 إجمالي الأسبوع'}
                {timeframe === 'month' && '📊 إجمالي الشهر الحالي'}
                {timeframe === 'custom' && (
                  endDate ? (
                    `📅 للفترة من ${startDate.toLocaleDateString('ar-EG')} إلى ${endDate.toLocaleDateString('ar-EG')}`
                  ) : (
                    `📅 ليوم ${startDate.toLocaleDateString('ar-EG')}`
                  )
                )}
              </span>
              <span className="analytics-card-trend" style={{ animation: 'none' }}>
                نمو النشاط
              </span>
            </div>

            {/* Counts Row */}
            <div className="analytics-stats-row" style={{ borderTop: 'none', paddingTop: '0' }}>
              <div className="analytics-stat-item">
                <span className="analytics-stat-icon">👥</span>
                <div className="analytics-stat-details">
                  <span className="analytics-num">{analytics.clients}</span>
                  <span className="analytics-label">عملاء جدد</span>
                </div>
              </div>
              <div className="analytics-stat-item">
                <span className="analytics-stat-icon">🏠</span>
                <div className="analytics-stat-details">
                  <span className="analytics-num">{analytics.units}</span>
                  <span className="analytics-label">عقارات مضافة</span>
                </div>
              </div>
              <div className="analytics-stat-item">
                <span className="analytics-stat-icon">📅</span>
                <div className="analytics-stat-details">
                  <span className="analytics-num">{analytics.viewings}</span>
                  <span className="analytics-label">معاينات</span>
                </div>
              </div>
            </div>

            {/* Visual Growth Bar Chart */}
            <div className="analytics-chart-container" style={{ marginTop: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', marginBottom: '8px' }}>
                📈 رسم بياني يوضح معدلات التفاعل
              </span>
              
              <div className="bar-chart-wrapper" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100px', paddingBottom: '4px' }}>
                {chartData.map((d, index) => {
                  const percentage = Math.max((d.value / maxChartValue) * 100, 6); // At least 6% height to show empty bars elegantly
                  return (
                    <div key={index} className="chart-bar-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
                      
                      {/* Bar and Tooltip Group */}
                      <div className="bar-wrapper" style={{ position: 'relative', width: '12px', height: '70px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        {/* Tooltip */}
                        <span className="bar-tooltip" style={{ 
                          position: 'absolute', 
                          bottom: '100%', 
                          background: 'var(--primary-color)', 
                          color: '#ffffff', 
                          fontSize: '9px', 
                          padding: '2px 4px', 
                          borderRadius: '4px',
                          fontWeight: '800',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          border: '1px solid var(--card-glass-border)'
                        }}>
                          {d.value}
                        </span>

                        {/* Bar Capsule */}
                        <div 
                          className="bar-capsule" 
                          style={{ 
                            width: '100%', 
                            height: `${percentage}%`, 
                            background: timeframe === 'today' || timeframe === 'custom' ? 'linear-gradient(to top, #10b981, #34d399)' :
                                        timeframe === 'week' ? 'linear-gradient(to top, #6366f1, #818cf8)' :
                                        'linear-gradient(to top, #f59e0b, #fbbf24)',
                            borderRadius: '6px',
                            transition: 'height 0.5s ease-out-in',
                            boxShadow: timeframe === 'today' || timeframe === 'custom' ? '0 0 10px rgba(52, 211, 153, 0.3)' :
                                       timeframe === 'week' ? '0 0 10px rgba(129, 140, 248, 0.3)' :
                                       '0 0 10px rgba(251, 191, 36, 0.3)',
                            cursor: 'pointer'
                          }}
                        />
                      </div>

                      {/* Label */}
                      <span className="bar-label" style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {d.display}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
