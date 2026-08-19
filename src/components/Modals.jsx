import React, { useState, useEffect, useRef } from 'react';
import { compressImage } from '../utils/imageCompressor';

/**
 * 1. AddClientModal Component
 */
export function AddClientModal({ isOpen, onClose, onSave }) {
  const [type, setType] = useState('شراء');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'يرجى إدخال اسم العميل';
    if (!phone.trim()) newErrors.phone = 'يرجى إدخال رقم الهاتف';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ type, name, phone, budget, notes });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setBudget('');
    setNotes('');
    setType('شراء');
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">إضافة عميل جديد 👤</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Toggle Type Pill */}
          <div className="form-group">
            <span className="form-label">نوع الطلب</span>
            <div className="toggle-pill-container">
              <div 
                className={`toggle-pill-option ${type === 'شراء' ? 'selected' : ''}`}
                onClick={() => setType('شراء')}
              >
                شراء
              </div>
              <div 
                className={`toggle-pill-option ${type === 'إيجار' ? 'selected' : ''}`}
                onClick={() => setType('إيجار')}
              >
                إيجار
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="form-group">
            <label className="form-label">الاسم الكامل *</label>
            <input 
              type="text" 
              className={`form-input ${errors.name ? 'input-error' : ''}`} 
              placeholder="مثال: أحمد محمد علي" 
              value={name}
              onChange={handleNameChange}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Phone Input */}
          <div className="form-group">
            <label className="form-label">رقم الهاتف *</label>
            <input 
              type="tel" 
              className={`form-input ${errors.phone ? 'input-error' : ''}`} 
              placeholder="مثال: 01012345678" 
              value={phone}
              onChange={handlePhoneChange}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* Budget Input */}
          <div className="form-group">
            <label className="form-label">الميزانية / السعر المتوقع</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="مثال: 500,000 أو خمسمائة ألف" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          {/* Notes Input */}
          <div className="form-group">
            <label className="form-label">ملاحظات الطلب (المساحة، الغرف، المنطقة...)</label>
            <textarea 
              rows={3}
              className="form-input" 
              placeholder="اكتب هنا تفاصيل العقار المطلوبة، مثل: 3 غرف، شارع الجيش، تشطيب كامل..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">حفظ العميل</button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * 2. AddUnitModal Component
 */
export function AddUnitModal({ isOpen, onClose, onSave }) {
  const [type, setType] = useState('للبيع');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsCompressing(true);
    const compressedImages = [];

    for (let file of files) {
      try {
        const compressed = await compressImage(file);
        compressedImages.push(compressed);
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    }

    setImages(prev => [...prev, ...compressedImages]);
    setIsCompressing(false);
    
    // Clear input so the user can re-upload same files if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'يرجى إدخال عنوان أو وصف مختصر للوحدة';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ type, owner_phone: ownerPhone, title, price, images, notes });
    handleClose();
  };

  const handleClose = () => {
    setType('للبيع');
    setOwnerPhone('');
    setTitle('');
    setPrice('');
    setImages([]);
    setNotes('');
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">إضافة وحدة عقارية جديدة 🏠</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Toggle Type Pill */}
          <div className="form-group">
            <span className="form-label">نوع العقار</span>
            <div className="toggle-pill-container">
              <div 
                className={`toggle-pill-option ${type === 'للبيع' ? 'selected' : ''}`}
                onClick={() => setType('للبيع')}
              >
                للبيع
              </div>
              <div 
                className={`toggle-pill-option ${type === 'للإيجار' ? 'selected' : ''}`}
                onClick={() => setType('للإيجار')}
              >
                للإيجار
              </div>
            </div>
          </div>

          {/* Title/Address Input */}
          <div className="form-group">
            <label className="form-label">عنوان ووصف الوحدة العقارية *</label>
            <input 
              type="text" 
              className={`form-input ${errors.title ? 'input-error' : ''}`} 
              placeholder="مثال: شقة 3 غرف شارع الجيش" 
              value={title}
              onChange={handleTitleChange}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Owner Phone Input */}
          <div className="form-group">
            <label className="form-label">هاتف صاحب العقار (المالك)</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="مثال: 01234567890" 
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
            />
          </div>

          {/* Price Input */}
          <div className="form-group">
            <label className="form-label">السعر المعروض</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="مثال: 600,000 أو ستمائة ألف جنيه" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Images Input */}
          <div className="form-group">
            <label className="form-label">صور العقار (يمكن اختيار صور متعددة)</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => fileInputRef.current.click()}
              disabled={isCompressing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {isCompressing ? 'جاري ضغط ومعالجة الصور...' : 'رفع صور من الجهاز'}
            </button>
            
            {images.length > 0 && (
              <div className="image-upload-preview-grid">
                {images.map((img, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={img} alt={`Preview ${idx}`} />
                    <button type="button" className="image-preview-remove" onClick={() => removeImage(idx)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div className="form-group">
            <label className="form-label">ملاحظات العقار (الدور، التشطيب، الأسانسير، المساحة...)</label>
            <textarea 
              rows={3}
              className="form-input" 
              placeholder="اكتب هنا تفاصيل إضافية: الدور الثالث، يوجد أسانسير، تشطيب سوبر لوكس، مساحة 120 متر..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">حفظ الوحدة</button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * 3. AddViewingModal Component
 */
export function AddViewingModal({ isOpen, onClose, onSave, clients = [], units = [] }) {
  // Client selection autocomplete
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPhone, setClientPhone] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const clientContainerRef = useRef(null);

  // Unit selection autocomplete
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const unitContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientContainerRef.current && !clientContainerRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
      if (unitContainerRef.current && !unitContainerRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleClientDropdown = (e) => {
    e.stopPropagation();
    if (!showClientDropdown) {
      setFilteredClients(clients);
    }
    setShowClientDropdown(prev => !prev);
  };

  const toggleUnitDropdown = (e) => {
    e.stopPropagation();
    if (!showUnitDropdown) {
      setFilteredUnits(units);
    }
    setShowUnitDropdown(prev => !prev);
  };

  // Custom Calendar & Time Picker States
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // Hours and minutes configuration
  let initHour = now.getHours();
  let initPeriod = 'ص';
  if (initHour >= 12) {
    initPeriod = 'م';
    if (initHour > 12) initHour -= 12;
  }
  if (initHour === 0) initHour = 12;

  // Round minutes to nearest 5 minutes
  const initMinute = Math.round(now.getMinutes() / 5) * 5;
  const initMinStr = (initMinute >= 60 ? 55 : initMinute).toString().padStart(2, '0');
  const initHourStr = initHour.toString().padStart(2, '0');

  const [selectedHour, setSelectedHour] = useState(initHourStr);
  const [selectedMinute, setSelectedMinute] = useState(initMinStr);
  const [selectedPeriod, setSelectedPeriod] = useState(initPeriod);

  // General fields
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // 1. Client Autocomplete Logic (Show all when empty, filter when typing)
  useEffect(() => {
    if (clientSearch.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = clientSearch.toLowerCase();
      const filtered = clients.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.phone.toLowerCase().includes(query)
      );
      setFilteredClients(filtered);
    }
  }, [clientSearch, clients]);

  // 2. Unit Autocomplete Logic (Show all when empty, filter when typing)
  useEffect(() => {
    if (unitSearch.trim() === '') {
      setFilteredUnits(units);
    } else {
      const query = unitSearch.toLowerCase();
      const filtered = units.filter(u => 
        u.title.toLowerCase().includes(query)
      );
      setFilteredUnits(filtered);
    }
  }, [unitSearch, units]);

  if (!isOpen) return null;

  // Selection handlers
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    if (client.phone) setClientPhone(client.phone);
    setShowClientDropdown(false);
    if (errors.client) setErrors(prev => ({ ...prev, client: '' }));
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setUnitSearch(unit.title);
    setShowUnitDropdown(false);
    if (errors.unit) setErrors(prev => ({ ...prev, unit: '' }));
  };

  // Calendar Helpers
  const monthsArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  const weekdaysArabic = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayIndex = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDaySelect = (dayNum) => {
    const newDate = new Date(currentYear, currentMonth, dayNum);
    setSelectedDate(newDate);
    if (errors.time) setErrors(prev => ({ ...prev, time: '' }));
  };

  // Combine calendar & time into ISO string
  const getCombinedDateTimeISO = () => {
    if (!selectedDate) return '';
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    let hour = parseInt(selectedHour, 10);
    const minute = parseInt(selectedMinute, 10);

    if (selectedPeriod === 'م') {
      if (hour < 12) hour += 12;
    } else { // 'ص'
      if (hour === 12) hour = 0;
    }

    const combinedDate = new Date(year, month, day, hour, minute);
    return combinedDate.toISOString();
  };

  // Formatted date string to display live in the modal
  const getLiveFormattedDate = () => {
    if (!selectedDate) return '';
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = selectedDate.toLocaleDateString('ar-EG', dateOptions);
    return `${dateStr} في تمام الساعة ${selectedHour}:${selectedMinute} ${selectedPeriod === 'ص' ? 'صباحاً' : 'مساءً'}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!selectedClient && !clientSearch.trim()) newErrors.client = 'يرجى اختيار أو كتابة اسم العميل';
    if (!selectedUnit && !unitSearch.trim()) newErrors.unit = 'يرجى اختيار أو كتابة العقار المعني بالمعاينة';
    
    const combinedISO = getCombinedDateTimeISO();
    if (!combinedISO) newErrors.time = 'يرجى تحديد تاريخ المعاينة';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      client_id: selectedClient ? selectedClient.id : 'custom_' + Date.now(),
      client_name: selectedClient ? selectedClient.name : clientSearch.trim(),
      client_phone: clientPhone.trim(),
      unit_id: selectedUnit ? selectedUnit.id : 'custom_' + Date.now(),
      unit_title: selectedUnit ? selectedUnit.title : unitSearch.trim(),
      viewing_time: combinedISO,
      notes
    });
    
    handleClose();
  };

  const handleClose = () => {
    setClientSearch('');
    setSelectedClient(null);
    setClientPhone('');
    setShowClientDropdown(false);
    setUnitSearch('');
    setSelectedUnit(null);
    setShowUnitDropdown(false);
    setSelectedDate(new Date());
    setSelectedHour(initHourStr);
    setSelectedMinute(initMinStr);
    setSelectedPeriod(initPeriod);
    setNotes('');
    setErrors({});
    onClose();
  };

  // Generate calendar days grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIdx = getFirstDayIndex(currentYear, currentMonth); // 0 = Sunday, 1 = Monday...
  
  // Calculate empty spaces before 1st of month
  const calendarCells = [];
  for (let i = 0; i < firstDayIdx; i++) {
    calendarCells.push({ isEmpty: true, key: `empty-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selectedDate && 
                       selectedDate.getDate() === day && 
                       selectedDate.getMonth() === currentMonth && 
                       selectedDate.getFullYear() === currentYear;
    
    const isToday = now.getDate() === day && 
                    now.getMonth() === currentMonth && 
                    now.getFullYear() === currentYear;

    calendarCells.push({ 
      isEmpty: false, 
      dayNum: day, 
      isSelected, 
      isToday,
      key: `day-${day}` 
    });
  }

  // Hours array 1 to 12
  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  // Minutes array at 5-min intervals
  const minutesList = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxContentHeight: '90vh' }}>
        <div className="modal-header">
          <h3 className="modal-title">إضافة موعد معاينة جديد 📅</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Client Search Autocomplete */}
          <div className="form-group autocomplete-container" ref={clientContainerRef}>
            <label className="form-label">اختر العميل *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className={`form-input ${errors.client ? 'input-error' : ''}`} 
                placeholder="ابحث باسم العميل أو رقم هاتفه، أو اكتب اسماً جديداً..." 
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setSelectedClient(null); // Clear selection if typing manually
                  setShowClientDropdown(true);
                  if (errors.client) setErrors(prev => ({ ...prev, client: '' }));
                }}
                onFocus={() => setShowClientDropdown(true)}
                style={{ paddingLeft: '35px' }}
              />
              <button 
                type="button" 
                onClick={toggleClientDropdown}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', fontSize: '10px' }}
              >
                ▼
              </button>
            </div>
            {errors.client && <span className="form-error">{errors.client}</span>}
            
            {showClientDropdown && (
              <div className="autocomplete-dropdown">
                {filteredClients.length === 0 ? (
                  <div className="autocomplete-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
                    لا يوجد عملاء مطابقين للبحث (اكتب الاسم مباشرة إذا كان غير مسجل)
                  </div>
                ) : (
                  filteredClients.map(c => (
                    <div 
                      key={c.id} 
                      className="autocomplete-item"
                      onClick={() => handleClientSelect(c)}
                    >
                      {c.name} ({c.phone}) - {c.type}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {selectedClient && (
              <div className="selected-badge-info">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>العميل المختار: <strong>{selectedClient.name} ({selectedClient.phone})</strong></span>
              </div>
            )}
            {!selectedClient && clientSearch.trim() && (
              <div className="selected-badge-info" style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                <span>العميل المكتوب (غير مسجل): <strong>{clientSearch.trim()}</strong></span>
              </div>
            )}
          </div>

          {/* Optional Client Phone Field */}
          <div className="form-group">
            <label className="form-label">رقم هاتف العميل (اختياري)</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="أدخل رقم هاتف للتواصل مع هذا العميل..." 
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </div>

          {/* Unit Search Autocomplete */}
          <div className="form-group autocomplete-container" ref={unitContainerRef}>
            <label className="form-label">اختر العقار المعني بالمعاينة *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className={`form-input ${errors.unit ? 'input-error' : ''}`} 
                placeholder="ابحث بوصف أو عنوان العقار، أو اكتب وصفاً جديداً..." 
                value={unitSearch}
                onChange={(e) => {
                  setUnitSearch(e.target.value);
                  setSelectedUnit(null); // Clear selection if typing manually
                  setShowUnitDropdown(true);
                  if (errors.unit) setErrors(prev => ({ ...prev, unit: '' }));
                }}
                onFocus={() => setShowUnitDropdown(true)}
                style={{ paddingLeft: '35px' }}
              />
              <button 
                type="button" 
                onClick={toggleUnitDropdown}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', fontSize: '10px' }}
              >
                ▼
              </button>
            </div>
            {errors.unit && <span className="form-error">{errors.unit}</span>}
            
            {showUnitDropdown && (
              <div className="autocomplete-dropdown">
                {filteredUnits.length === 0 ? (
                  <div className="autocomplete-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
                    لا يوجد عقارات مطابقة للبحث (اكتب وصف العقار مباشرة إذا كان غير مسجل)
                  </div>
                ) : (
                  filteredUnits.map(u => (
                    <div 
                      key={u.id} 
                      className="autocomplete-item"
                      onClick={() => handleUnitSelect(u)}
                    >
                      {u.title} ({u.type}) - {u.price || 'بدون سعر'}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {selectedUnit && (
              <div className="selected-badge-info">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>العقار المختار: <strong>{selectedUnit.title} ({selectedUnit.type})</strong></span>
              </div>
            )}
            {!selectedUnit && unitSearch.trim() && (
              <div className="selected-badge-info" style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                <span>العقار المكتوب (غير مسجل): <strong>{unitSearch.trim()}</strong></span>
              </div>
            )}
          </div>

          {/* Custom Calendar & Time Picker */}
          <div className="form-group">
            <label className="form-label">موعد المعاينة *</label>
            
            {/* Custom Calendar Body */}
            <div className="modern-calendar">
              <div className="calendar-header">
                <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth} title="الشهر السابق">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
                <span className="calendar-month-title">{monthsArabic[currentMonth]} {currentYear}</span>
                <button type="button" className="calendar-nav-btn" onClick={handleNextMonth} title="الشهر التالي">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>
              </div>

              {/* Weekdays */}
              <div className="calendar-weekdays">
                {weekdaysArabic.map((dayName, idx) => (
                  <div key={idx} className="calendar-weekday-cell">{dayName}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="calendar-days-grid">
                {calendarCells.map((cell) => {
                  if (cell.isEmpty) {
                    return <div key={cell.key} className="calendar-day-cell empty"></div>;
                  }
                  return (
                    <div 
                      key={cell.key} 
                      className={`calendar-day-cell ${cell.isSelected ? 'selected' : ''} ${cell.isToday ? 'today' : ''}`}
                      onClick={() => handleDaySelect(cell.dayNum)}
                    >
                      {cell.dayNum}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Time Picker */}
            <div className="modern-time-picker">
              <div className="time-select-group">
                <span className="time-picker-label">الساعة</span>
                <select 
                  className="form-input time-select-box"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                >
                  {hoursList.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="time-select-group">
                <span className="time-picker-label">الدقيقة</span>
                <select 
                  className="form-input time-select-box"
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                >
                  {minutesList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="time-select-group">
                <span className="time-picker-label">الفترة</span>
                <div className="toggle-pill-container" style={{ padding: '2px', borderRadius: '6px' }}>
                  <div 
                    className={`toggle-pill-option ${selectedPeriod === 'ص' ? 'selected' : ''}`}
                    onClick={() => setSelectedPeriod('ص')}
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    صباحاً
                  </div>
                  <div 
                    className={`toggle-pill-option ${selectedPeriod === 'م' ? 'selected' : ''}`}
                    onClick={() => setSelectedPeriod('م')}
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    مساءً
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Date Summary Badge */}
            <div className="date-summary-text">
              📅 الموعد المختار: <strong>{getLiveFormattedDate()}</strong>
            </div>
            {errors.time && <span className="form-error">{errors.time}</span>}
          </div>

          {/* Notes Input */}
          <div className="form-group">
            <label className="form-label">ملاحظات المعاينة</label>
            <textarea 
              rows={2}
              className="form-input" 
              placeholder="مثال: يرجى التأكيد قبلها بـ 24 ساعة، حضور المالك مطلوب..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">حفظ المعاينة</button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * 4. UnitDetailsModal Component
 */
export function UnitDetailsModal({ isOpen, onClose, unit, onDelete, onUpdate, viewings = [] }) {
  if (!isOpen || !unit) return null;

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(unit.title);
  const [price, setPrice] = useState(unit.price || '');
  const [ownerPhone, setOwnerPhone] = useState(unit.owner_phone || '');
  const [notes, setNotes] = useState(unit.notes || '');
  const [type, setType] = useState(unit.type);

  useEffect(() => {
    setTitle(unit.title);
    setPrice(unit.price || '');
    setOwnerPhone(unit.owner_phone || '');
    setNotes(unit.notes || '');
    setType(unit.type);
    setIsEditing(false);
    setActiveImgIdx(0);
  }, [unit]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;

    // Swipe left (next image)
    if (diff > 50) {
      if (activeImgIdx < unit.images.length - 1) {
        setActiveImgIdx(prev => prev + 1);
      }
    }
    // Swipe right (prev image)
    if (diff < -50) {
      if (activeImgIdx > 0) {
        setActiveImgIdx(prev => prev - 1);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleSaveEdit = () => {
    if (!title.trim()) {
      alert('يرجى إدخال عنوان أو وصف العقار');
      return;
    }
    onUpdate(unit.id, {
      title,
      price,
      owner_phone: ownerPhone,
      notes,
      type
    });
    setIsEditing(false);
  };

  const unitViewingsCount = viewings.filter(v => v.unit_id === unit.id).length;
  const hasImages = unit.images && unit.images.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ flex: 1 }}>تفاصيل العقار</h3>
          <span className={`card-badge ${type === 'للبيع' ? 'badge-sale-unit' : 'badge-rent-unit'}`} style={{ alignSelf: 'center', marginLeft: '12px' }}>
            {type}
          </span>
          <button className="modal-close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">العنوان / الوصف المختصر *</label>
                <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              
              <div className="form-group">
                <span className="form-label">نوع المعاملة</span>
                <div className="toggle-pill-container" style={{ padding: '2px', borderRadius: '8px' }}>
                  <div 
                    className={`toggle-pill-option ${type === 'للبيع' ? 'selected' : ''}`}
                    onClick={() => setType('للبيع')}
                  >
                    للبيع
                  </div>
                  <div 
                    className={`toggle-pill-option ${type === 'للإيجار' ? 'selected' : ''}`}
                    onClick={() => setType('للإيجار')}
                  >
                    للإيجار
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">السعر / الإيجار</label>
                <input className="form-input" value={price} onChange={e => setPrice(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">رقم هاتف المالك</label>
                <input className="form-input" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">ملاحظات العقار</label>
                <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>حفظ التعديلات ✅</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>إلغاء</button>
              </div>
            </div>
          ) : (
            <>
              {/* Images Grid or Carousel */}
              {hasImages ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div 
                    className="unit-card-media" 
                    style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img 
                      src={unit.images[activeImgIdx]} 
                      alt={unit.title} 
                      className="unit-thumbnail" 
                      style={{ height: '200px', objectFit: 'cover', width: '100%', userSelect: 'none' }}
                    />

                    {/* Arrow overlays */}
                    {unit.images.length > 1 && (
                      <>
                        {activeImgIdx > 0 && (
                          <button 
                            type="button"
                            onClick={() => setActiveImgIdx(prev => prev - 1)}
                            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                          >
                            ❯
                          </button>
                        )}
                        {activeImgIdx < unit.images.length - 1 && (
                          <button 
                            type="button"
                            onClick={() => setActiveImgIdx(prev => prev + 1)}
                            style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                          >
                            ❮
                          </button>
                        )}

                        {/* Dots indicators */}
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '10px', zIndex: 2 }}>
                          {unit.images.map((_, idx) => (
                            <span 
                              key={idx} 
                              onClick={() => setActiveImgIdx(idx)}
                              style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === activeImgIdx ? 'var(--secondary-color)' : 'rgba(255,255,255,0.5)', display: 'block', cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {unit.images.length > 1 && (
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {unit.images.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`detail-${idx}`} 
                          onClick={() => setActiveImgIdx(idx)}
                          style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: idx === activeImgIdx ? '2px solid var(--secondary-color)' : '1px solid var(--card-glass-border)', cursor: 'pointer', opacity: idx === activeImgIdx ? 1 : 0.6 }} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="unit-card-media" style={{ height: '120px', borderRadius: '12px', overflow: 'hidden' }}>
                  <div className="unit-image-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '32px', height: '32px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v18H3V3z" />
                    </svg>
                    <span style={{ fontSize: '11px', marginTop: '4px' }}>لا يوجد صور</span>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{unit.title}</h4>
              </div>

              {/* Details list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-glass-border)' }}>
                {unit.owner_phone && (
                  <div className="card-detail-item" style={{ fontSize: '13px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <span>المالك: <strong>
                      <a href={`tel:${unit.owner_phone}`} style={{ textDecoration: 'none', color: 'var(--secondary-color)', fontFamily: 'Outfit' }}>
                        {unit.owner_phone}
                      </a>
                    </strong></span>
                  </div>
                )}

                {unit.price && (
                  <div className="card-detail-item" style={{ fontSize: '13px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span>السعر: <strong className="price-tag" style={{ fontSize: '14px' }}>{unit.price}</strong></span>
                  </div>
                )}

                <div className="card-detail-item" style={{ fontSize: '13px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span>عدد المعاينات المجدولة: <strong style={{ color: 'var(--secondary-color)', fontSize: '14px' }}>{unitViewingsCount}</strong></span>
                </div>

                {unit.id && unit.id.toString().startsWith('local_') && (
                  <div className="card-detail-item" style={{ fontSize: '13px', color: '#fbbf24' }}>
                    ⏳ جاري المزامنة مع السيرفر السحابي...
                  </div>
                )}
              </div>

              {/* Notes */}
              {unit.notes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span className="form-label">ملاحظات العقار</span>
                  <div className="card-notes" style={{ fontSize: '12px', padding: '10px 12px', borderRightWidth: '4px' }}>
                    {unit.notes}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ color: 'var(--color-error)', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', fontSize: '12px', padding: '8px 16px' }}
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من حذف هذا العقار؟ سيتم حذف معايناته المرتبطة تلقائياً.')) {
                      onDelete(unit.id);
                      onClose();
                    }
                  }}
                >
                  حذف العقار 🗑️
                </button>

                <button 
                  className="btn btn-primary" 
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                  onClick={() => setIsEditing(true)}
                >
                  تعديل البيانات 📝
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 5. ClientDetailsModal Component
 */
export function ClientDetailsModal({ isOpen, onClose, client, onDelete, onUpdate }) {
  if (!isOpen || !client) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [type, setType] = useState(client.type);
  const [budget, setBudget] = useState(client.budget || '');
  const [notes, setNotes] = useState(client.notes || '');

  useEffect(() => {
    setName(client.name);
    setPhone(client.phone);
    setType(client.type);
    setBudget(client.budget || '');
    setNotes(client.notes || '');
    setIsEditing(false);
  }, [client]);

  const handleSaveEdit = () => {
    if (!name.trim() || !phone.trim()) {
      alert('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }
    onUpdate(client.id, {
      name,
      phone,
      type,
      budget,
      notes
    });
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ flex: 1 }}>تفاصيل العميل</h3>
          <span className={`card-badge ${type === 'شراء' ? 'badge-buy' : 'badge-rent'}`} style={{ alignSelf: 'center', marginLeft: '12px' }}>
            {type}
          </span>
          <button className="modal-close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">الاسم الكامل *</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">رقم الهاتف *</label>
                <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <span className="form-label">نوع الطلب</span>
                <div className="toggle-pill-container" style={{ padding: '2px', borderRadius: '8px' }}>
                  <div 
                    className={`toggle-pill-option ${type === 'شراء' ? 'selected' : ''}`}
                    onClick={() => setType('شراء')}
                  >
                    شراء
                  </div>
                  <div 
                    className={`toggle-pill-option ${type === 'إيجار' ? 'selected' : ''}`}
                    onClick={() => setType('إيجار')}
                  >
                    إيجار
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">الميزانية / السعر</label>
                <input className="form-input" value={budget} onChange={e => setBudget(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">ملاحظات الطلب</label>
                <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>حفظ التعديلات ✅</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>إلغاء</button>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-glass-border)' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  👤
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)' }}>{client.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>رقم المعرّف: {client.id.toString().substring(0, 13)}...</span>
                </div>
              </div>

              {/* Details list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-glass-border)' }}>
                <div className="card-detail-item" style={{ fontSize: '13px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5" />
                  </svg>
                  <span>الهاتف: <strong>
                    <a href={`tel:${client.phone}`} style={{ textDecoration: 'none', color: 'var(--secondary-color)', fontFamily: 'Outfit' }}>
                      {client.phone}
                    </a>
                  </strong></span>
                </div>

                {client.budget && (
                  <div className="card-detail-item" style={{ fontSize: '13px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12" />
                    </svg>
                    <span>الميزانية: <strong className="price-tag" style={{ fontSize: '14px' }}>{client.budget}</strong></span>
                  </div>
                )}

                {client.id && client.id.toString().startsWith('local_') && (
                  <div className="card-detail-item" style={{ fontSize: '13px', color: '#fbbf24' }}>
                    ⏳ جاري المزامنة مع السيرفر السحابي...
                  </div>
                )}
              </div>

              {/* Notes */}
              {client.notes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span className="form-label">ملاحظات الطلب</span>
                  <div className="card-notes" style={{ fontSize: '12px', padding: '10px 12px', borderRightWidth: '4px' }}>
                    {client.notes}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ color: 'var(--color-error)', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', fontSize: '12px', padding: '8px 16px' }}
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع معايناته تلقائياً.')) {
                      onDelete(client.id);
                      onClose();
                    }
                  }}
                >
                  حذف العميل 🗑️
                </button>

                <button 
                  className="btn btn-primary" 
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                  onClick={() => setIsEditing(true)}
                >
                  تعديل البيانات 📝
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
