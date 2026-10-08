(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const toast = $('.toast');
  const storeKey = 'enginu_mvp_state_v1';
  const defaults = { bookings: [], notices: [], scorecard: [4, 0], profilePublic: true };
  let state = { ...defaults, ...JSON.parse(localStorage.getItem(storeKey) || '{}') };
  const save = () => localStorage.setItem(storeKey, JSON.stringify(state));
  const tell = (message) => { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3600); };
  const show = (id) => {
    $$('.view').forEach(v => v.classList.toggle('active', v.id === id));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === id));
    $('.sidebar').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = '<section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h3></h3><button class="modal-close" aria-label="إغلاق">×</button></div><div class="modal-body"></div></section>';
  document.body.append(modal);
  const closeModal = () => modal.classList.remove('open');
  const openModal = (title, body) => { $('.modal h3', modal).textContent = title; $('.modal-body', modal).innerHTML = body; modal.classList.add('open'); };
  $('.modal-close', modal).onclick = closeModal;
  modal.onclick = e => { if (e.target === modal) closeModal(); };

  // Navigation works even if the original demo script is cached by a visitor.
  $$('.nav-item').forEach(b => b.onclick = () => show(b.dataset.view));
  $$('[data-view-target]').forEach(b => b.onclick = () => show(b.dataset.viewTarget));
  $('.menu').onclick = () => $('.sidebar').classList.toggle('open');

  const bookingPage = $('#booking');
  bookingPage.insertAdjacentHTML('beforeend', `
    <section class="panel booking-flow" id="booking-flow">
      <div class="panel-title"><h3>اختيار الموعد</h3><span class="demo-label">تجربة MVP</span></div>
      <div class="flow-progress" aria-label="تقدم الحجز"><i class="active"></i><i class="active"></i><i></i></div>
      <div><p class="eyebrow accent">2. اختر يومًا مناسبًا</p><div class="selection-grid" id="date-slots"></div></div>
      <div><p class="eyebrow accent">3. اختر الساعة</p><div class="selection-grid" id="time-slots"></div></div>
      <div class="action-row"><button class="primary" id="review-booking">مراجعة وتأكيد الحجز ←</button><button class="secondary" id="save-draft">حفظ كمسودة</button></div>
    </section>`);
  const dates = ['السبت 18 أكتوبر', 'الأحد 19 أكتوبر', 'الاثنين 20 أكتوبر'];
  const times = ['05:00 مساءً', '07:00 مساءً', '08:30 مساءً'];
  let selectedDate = dates[0], selectedTime = times[1], selectedTrack = 'HVAC & MEP', selectedExpert = 'م. محمد سامي';
  const renderSlots = (target, values, type) => {
    $(target).innerHTML = values.map((v, i) => `<button class="slot ${i === (type === 'date' ? 0 : 1) ? 'selected' : ''}" data-${type}="${v}"><b>${v}</b><small>${type === 'date' ? 'متاح للحجز' : 'جلسة 60 دقيقة'}</small></button>`).join('');
    $$(`[data-${type}]`, $(target)).forEach(b => b.onclick = () => { $$(`[data-${type}]`, $(target)).forEach(x => x.classList.remove('selected')); b.classList.add('selected'); if(type === 'date') selectedDate = b.dataset.date; else selectedTime = b.dataset.time; });
  };
  renderSlots('#date-slots', dates, 'date'); renderSlots('#time-slots', times, 'time');
  $$('.track').forEach(b => b.onclick = () => { $$('.track').forEach(x => x.classList.remove('selected')); b.classList.add('selected'); selectedTrack = $('b', b).textContent; });
  $('.outline', bookingPage).onclick = e => { selectedExpert = 'م. محمد سامي'; tell('تم اختيار م. محمد سامي لهذا التقييم'); e.currentTarget.textContent = 'تم الاختيار ✓'; };
  $('#save-draft').onclick = () => { state.draft = { selectedTrack, selectedExpert, selectedDate, selectedTime }; save(); tell('تم حفظ الحجز كمسودة على هذا الجهاز'); };
  const completeBooking = () => {
    const booking = { id: `ENG-${Date.now().toString().slice(-6)}`, track: selectedTrack, expert: selectedExpert, date: selectedDate, time: selectedTime, status: 'بانتظار المراجعة' };
    state.bookings.unshift(booking); state.notices.unshift({ title: 'تم استلام طلب الحجز', text: `${booking.track} · ${booking.date} · ${booking.time}` }); save();
    closeModal(); renderBookings(); tell(`تم إرسال طلب الحجز رقم ${booking.id}`); show('engineer');
  };
  $('#review-booking').onclick = () => openModal('راجع تفاصيل حجزك', `<div class="booking-success"><strong>${selectedTrack}</strong><span>مع ${selectedExpert}</span><br><span>${selectedDate} — ${selectedTime}</span><br><small>لا يتم تحصيل أي مبلغ في هذه النسخة التجريبية. ستتم مراجعة الموعد من الإدارة.</small></div><div class="action-row" style="margin-top:16px"><button class="primary" id="finalize-booking">تأكيد الطلب</button><button class="secondary" id="cancel-review">رجوع</button></div>`);
  modal.addEventListener('click', e => { if(e.target.id === 'finalize-booking') completeBooking(); if(e.target.id === 'cancel-review') closeModal(); });
  $('#confirm-booking').onclick = () => { show('booking'); setTimeout(() => $('#booking-flow').scrollIntoView({ behavior: 'smooth', block: 'start' }), 150); };

  function renderBookings() {
    const panel = $('.panel', $('#engineer'));
    let target = $('#saved-bookings');
    if (!target) { target = document.createElement('article'); target.id = 'saved-bookings'; target.className = 'panel'; panel.parentElement.insertBefore(target, panel); }
    target.innerHTML = `<div class="panel-title"><h3>طلبات الحجز الخاصة بك</h3><span class="pill ${state.bookings.length ? 'warning' : 'neutral'}">${state.bookings.length || 0} طلب</span></div>${state.bookings.length ? state.bookings.map(b => `<div class="appointment"><div class="date"><b>${b.date.match(/\d+/)?.[0] || '—'}</b><span>أكتوبر</span></div><div><b>${b.track}</b><p>${b.expert} · ${b.time} · ${b.status}</p></div><button class="secondary small" data-booking="${b.id}">التفاصيل</button></div>`).join('') : '<div class="empty-state">لا توجد حجوزات مؤكدة بعد. ابدأ بحجز تقييمك الأول.</div>'}`;
    $$('[data-booking]', target).forEach(b => b.onclick = () => { const item = state.bookings.find(x => x.id === b.dataset.booking); openModal('تفاصيل الطلب', `<div class="booking-success"><strong>${item.track}</strong><p>رقم الطلب: ${item.id}</p><p>${item.date} · ${item.time}</p><p>الخبير: ${item.expert}</p></div>`); });
  }
  renderBookings();

  // Scorecard: selectable, computed, and saved.
  const scorecard = $('.scorecard');
  $$('.score-pick', scorecard).forEach((group, index) => $$('.score-pick button', scorecard).filter(b => b.parentElement === group).forEach((b, value) => {
    b.onclick = () => { $$('.score-pick button', group).forEach(x => x.classList.remove('active')); b.classList.add('active'); state.scorecard[index] = value + 1; save(); renderScoreSummary(); };
  }));
  function renderScoreSummary() {
    let summary = $('#score-summary'); if (!summary) { summary = document.createElement('div'); summary.id = 'score-summary'; summary.className = 'score-summary'; scorecard.append(summary); }
    const answered = state.scorecard.filter(Boolean); summary.textContent = answered.length ? `تم تقييم ${answered.length} معيار — المتوسط الحالي ${Math.round(answered.reduce((a,b) => a+b,0)/answered.length * 20)} / 100` : 'اختر درجة لكل معيار قبل الحفظ.';
  }
  renderScoreSummary();
  $('.scorecard .primary').onclick = () => { if(state.scorecard.filter(Boolean).length < 2) return tell('أكمل جميع المعايير أولًا'); state.notices.unshift({ title: 'Scorecard جاهز للمراجعة', text: 'تم حفظ تقييم محمود عادل للمراجعة الإدارية.' }); save(); tell('تم حفظ الـ Scorecard وإرساله للمراجعة'); };

  // Useful actions in profile/admin/dashboard.
  const profile = $('#profile');
  $('.share', profile).onclick = async () => { const link = `${location.origin}${location.pathname}#profile-ahmed-khaled`; try { await navigator.clipboard.writeText(link); tell('تم نسخ رابط الملف الموثّق'); } catch { openModal('رابط الملف', `<div class="form-field"><input value="${link}" readonly></div>`); } };
  $('.profile-card .primary', profile).onclick = () => openModal('تواصل مع أحمد خالد', '<div class="form-field"><label>رسالتك</label><textarea placeholder="اكتب سبب التواصل أو فرصة العمل"></textarea></div><button class="primary full" id="send-message">إرسال الرسالة</button><p class="modal-note">في النسخة الكاملة ستصل الرسالة داخل حساب المهندس، وليس عبر البريد العام.</p>');
  modal.addEventListener('click', e => { if(e.target.id === 'send-message') { closeModal(); tell('تم إرسال رسالتك للمهندس'); } });
  $$('.join').forEach(b => b.onclick = () => openModal('المقابلة التقنية', '<div class="booking-success"><strong>رابط المقابلة سيظهر هنا</strong><span>في النسخة الحالية يمكن للإدارة إضافته بعد تأكيد الحجز.</span></div>'));
  $$('.text-btn').forEach(b => { if (b.textContent.includes('التقرير')) b.onclick = () => tell('سيتم تجهيز تقرير PDF بعد اكتمال التقييم'); });
  $('#admin .secondary').onclick = () => { const csv = 'Engineer,Track,Expert,Status\nOmar Yasser,Mechanical Design,Dr Karim,Pending\nSara Mahmoud,HVAC & MEP,Eng Mohamed,Confirmed'; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = 'enginu-report.csv'; a.click(); URL.revokeObjectURL(a.href); tell('تم تنزيل تقرير تجريبي بصيغة CSV'); };
  const bell = $('.bell'); bell.onclick = () => openModal('الإشعارات', state.notices.length ? `<div class="notification-list">${state.notices.map(n => `<div class="notification"><b>${n.title}</b><span>${n.text}</span></div>`).join('')}</div>` : '<div class="empty-state">لا توجد إشعارات جديدة.</div>');
})();

