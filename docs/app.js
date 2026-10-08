const views=[...document.querySelectorAll('.view')], nav=[...document.querySelectorAll('.nav-item')], toast=document.querySelector('.toast');
function show(id){views.forEach(v=>v.classList.toggle('active',v.id===id));nav.forEach(n=>n.classList.toggle('active',n.dataset.view===id));window.scrollTo({top:0,behavior:'smooth'});document.querySelector('.sidebar').classList.remove('open')}
nav.forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-view-target]').forEach(b=>b.onclick=()=>show(b.dataset.viewTarget));document.querySelector('.menu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
document.querySelectorAll('.track').forEach(b=>b.onclick=()=>{document.querySelectorAll('.track').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
document.querySelectorAll('.score-pick button').forEach(b=>b.onclick=()=>{b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
document.querySelector('#confirm-booking').onclick=()=>{toast.textContent='تم حفظ اختيارك — الخطوة التالية: ربط الدفع واختيار الموعد من Supabase.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4000)};
// Lightweight production connection check. Business actions are enabled as their Supabase flows are completed.
(async()=>{const c=window.ENGINU_CONFIG;if(!c)return;try{const r=await fetch(c.supabaseUrl+'/rest/v1/assessment_tracks?select=id&limit=1',{headers:{apikey:c.supabaseAnonKey,Authorization:'Bearer '+c.supabaseAnonKey}});if(!r.ok)throw new Error();document.querySelector('.status-dot').textContent='متصل بقاعدة البيانات';}catch{document.querySelector('.status-dot').textContent='وضع تجريبي — تعذر الاتصال';}})();

