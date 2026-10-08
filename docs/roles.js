(() => {
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const toast = $('.toast');
  const say = m => { toast.textContent=m; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),3200); };
  const labels = { engineer: 'مهندس', expert: 'خبير تقييم', admin: 'مدير المنصة' };
  let role = localStorage.getItem('enginu_preview_role') || 'engineer';
  const nav = $$('.nav-item');
  function setView(id) {
    // Inline display removes any ambiguity caused by older cached stylesheet rules.
    $$('.view').forEach(v => { v.classList.toggle('active', v.id === id); v.style.display = v.id === id ? 'block' : 'none'; });
    nav.forEach(n => n.classList.toggle('active', n.dataset.view === id));
    $('.sidebar').classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function allowed(view) {
    if (role === 'admin') return true;
    if (role === 'expert') return ['home','expert','profile'].includes(view);
    return ['home','booking','engineer','profile'].includes(view);
  }
  function renderRole() {
    nav.forEach(btn => {
      const ok = allowed(btn.dataset.view);
      btn.style.display = ok ? '' : 'none';
      btn.disabled = !ok;
    });
    const account = $('.account');
    account.innerHTML = `<span class="avatar">${role === 'expert' ? 'خ' : role === 'admin' ? 'م' : 'أ'}</span><span><b>${role === 'engineer' ? 'أحمد خالد' : role === 'expert' ? 'م. محمد سامي' : 'إدارة Enginu'}</b><small>${labels[role]} · حساب تجريبي</small></span><span>⌄</span>`;
    account.onclick = openRoleModal;
    let banner = $('#role-banner');
    if (!banner) { banner=document.createElement('div'); banner.id='role-banner'; banner.className='role-banner'; $('.page', $('#engineer'))?.prepend(banner); }
    banner.innerHTML = role === 'engineer'
      ? `<div><span class="role-chip">حساب مهندس</span><p>هذه لوحتك الخاصة. لا تظهر لك بيانات أي مهندس آخر أو نتائجهم الخاصة.</p></div><button class="secondary small" id="role-info">ما الذي أراه؟</button>`
      : `<div><span class="role-chip">${labels[role]}</span><p>أنت في وضع الصلاحيات الموسّعة الخاص بالخبير/المدير.</p></div>`;
    $('#role-info')?.addEventListener('click', () => openInfoModal());
    if (!allowed($('.view.active')?.id || 'home')) setView(role === 'expert' ? 'expert' : role === 'admin' ? 'admin' : 'engineer');
  }
  function openRoleModal() {
    const m=$('.modal-backdrop'); $('.modal h3',m).textContent='وضع معاينة الحساب'; $('.modal-body',m).innerHTML=`<p class="modal-note">الحساب الظاهر الآن هو <b>${labels[role]}</b>. هذا التبديل للاختبار فقط؛ في النسخة الحقيقية تحدد الصلاحية من حساب المستخدم وقاعدة البيانات.</p><div class="role-switch"><button data-role="engineer"><b>مهندس</b><small>لوحة شخصية، حجز وتقييمات وملفك فقط.</small></button><button data-role="expert"><b>خبير</b><small>مقابلات، scorecards وبيانات المهندسين اللازمة للتقييم.</small></button><button data-role="admin"><b>مدير</b><small>تشغيل المنصة ومتابعة الحجوزات والجودة.</small></button></div>`; m.classList.add('open');
    $$('[data-role]',m).forEach(b=>b.onclick=()=>{role=b.dataset.role;localStorage.setItem('enginu_preview_role',role);m.classList.remove('open');renderRole();setView(role==='expert'?'expert':role==='admin'?'admin':'engineer');say(`تم التحويل إلى عرض ${labels[role]}`);});
  }
  function openInfoModal() {
    const m=$('.modal-backdrop'); $('.modal h3',m).textContent='حدود صلاحية المهندس'; $('.modal-body',m).innerHTML='<ul class="access-list"><li>بياناته الشخصية، حجوزاته، نتائجه وملفه العام.</li><li>حجز تقييم والتواصل مع الدعم أو الخبير.</li><li class="no">لا يرى بيانات أو نتائج أو حجوزات مهندسين آخرين.</li><li class="no">لا يستطيع فتح لوحة الخبير أو الإدارة.</li></ul>'; m.classList.add('open');
  }
  // Capture phase ensures this wins over legacy click handlers.
  nav.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation(); if(!allowed(b.dataset.view)) return say('هذه الصفحة غير متاحة لصلاحية حسابك'); setView(b.dataset.view);},true));
  $$('[data-view-target]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const id=b.dataset.viewTarget;if(!allowed(id)) return say('هذه الصفحة غير متاحة لصلاحية حسابك');setView(id);},true));

  // Expand the expert scorecard into a complete, reusable assessment rubric.
  const expert=$('#expert');
  const completeRubric=[
    ['Technical Fundamentals','فهم المبادئ الميكانيكية الأساسية'],['System Design','اختيار النظام والحلول التصميمية'],['Calculations & Sizing','الأحمال والحسابات والتحجيم'],['Software Proficiency','Revit / AutoCAD / SolidWorks حسب المسار'],['Codes & Standards','الأكواد والمواصفات ذات الصلة'],['Drawings & Documentation','الرسومات وBOQ والمستندات'],['Problem Solving','تشخيص الأعطال وحل المشكلات'],['Engineering Judgment','اتخاذ القرار والمفاضلات الهندسية'],['Quality & Safety','الجودة والسلامة وإدارة المخاطر'],['Communication','عرض الفكرة والتعاون المهني']
  ];
  const old=$('.scorecard',expert); if(old){
    const panel=document.createElement('article'); panel.className='panel'; panel.id='complete-scorecard';
    panel.innerHTML=`<div class="panel-title"><div><h3>نموذج تقييم شامل</h3><p class="rubric-note">اختر 1 إلى 5 لكل بند؛ التقييم النهائي يتكيف مع مسار المهندس.</p></div><span class="pill warning">10 معايير</span></div><div class="rubric-stack">${completeRubric.map((r,i)=>`<div class="rubric"><span>${i+1}. ${r[0]}<small style="display:block;font-weight:400;color:#66736d;margin-top:3px">${r[1]}</small></span><div class="score-pick" data-rubric="${i}">${[1,2,3,4,5].map(n=>`<button>${n}</button>`).join('')}</div></div>`).join('')}</div><div class="score-summary" id="full-score">لم يتم إدخال درجات بعد.</div><div class="action-row"><button class="primary" id="save-full-score">حفظ التقييم النهائي</button><button class="secondary" id="download-score-template">تحميل نموذج التقييم</button></div>`;
    old.after(panel); old.remove();
    const scores=Array(10).fill(0);
    $$('.score-pick',panel).forEach((group,i)=>$$('button',group).forEach((b,n)=>b.onclick=()=>{ $$('button',group).forEach(x=>x.classList.remove('active')); b.classList.add('active'); scores[i]=n+1; const done=scores.filter(Boolean); $('#full-score',panel).textContent=done.length?`اكتمل ${done.length}/10 — المتوسط ${Math.round(done.reduce((a,x)=>a+x,0)/done.length*20)} / 100`:'لم يتم إدخال درجات بعد.';}));
    $('#save-full-score',panel).onclick=()=>{if(scores.some(x=>!x))return say('أكمل المعايير العشرة قبل الحفظ');say('تم حفظ التقييم وإرساله لمراجعة الإدارة');};
    $('#download-score-template',panel).onclick=()=>{const text='Enginu Scorecard\n'+completeRubric.map((r,i)=>`${i+1}. ${r[0]} — ${r[1]} — Score: ___/5`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));a.download='enginu-scorecard-template.txt';a.click();};
  }
  // Expert-only engineer records: visibility is removed for engineer role by navigation, and backed by RLS in production.
  const records=document.createElement('article');records.className='panel';records.id='engineer-records';records.innerHTML=`<div class="panel-title"><div><h3>سجل المهندسين للتقييم</h3><p class="rubric-note">بيانات مهنية مطلوبة لتنفيذ التقييم فقط.</p></div><span class="pill success">3 مهندسين</span></div><div class="records-grid">${[['أحمد خالد','HVAC & MEP','ahmed@example.com','86'],['سارة محمود','Mechanical Design','sara@example.com','—'],['محمود عادل','Manufacturing','mahmoud@example.com','74']].map(x=>`<div class="engineer-record"><div><b>${x[0]}</b><span>${x[2]}</span></div><div><b>${x[1]}</b><span>مسار التقييم</span></div><div><b>${x[3] === '—' ? 'بانتظار التقييم' : x[3]+'/100'}</b><span>آخر نتيجة</span></div><div class="row-actions"><button class="secondary small" data-record="${x[0]}">فتح الملف</button></div></div>`).join('')}</div>`;
  expert.append(records);
  $$('[data-record]',records).forEach(b=>b.onclick=()=>{const m=$('.modal-backdrop');$('.modal h3',m).textContent=`ملف ${b.dataset.record}`;$('.modal-body',m).innerHTML='<ul class="access-list"><li>الخبرة والمسار المهني وملفات المشروع.</li><li>سجل التقييمات والـScorecards.</li><li>بيانات التواصل المهنية اللازمة للمقابلة.</li></ul>';m.classList.add('open');});
  renderRole();
})();

