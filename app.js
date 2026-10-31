/* jeexles.licham — Vietnamese lunisolar calendar application. No data is sent to a server. */
(() => {
  'use strict';
  const Core = window.JeexLunar;
  if (!Core) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:24px;color:#ac2025">Không thể tải dữ liệu âm lịch. Vui lòng tải lại trang.</p>'); return; }

  const TODAY_VN = () => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone:'Asia/Ho_Chi_Minh', year:'numeric', month:'numeric', day:'numeric' }).formatToParts(new Date());
    const pick = key => +parts.find(p => p.type === key).value;
    return createDate(pick('year'),pick('month'),pick('day'));
  };
  const createDate = (year, month, day) => new Date(year, month-1, day, 12, 0, 0, 0);
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseDate = str => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || ''); if (!m) return null; const d = createDate(+m[1],+m[2],+m[3]); return dateKey(d) === str ? d : null; };
  const moveDays = (d, n) => createDate(d.getFullYear(), d.getMonth()+1, d.getDate()+n);
  const addMonths = (year, month, delta) => { const d = createDate(year, month+delta, 1); return {year:d.getFullYear(),month:d.getMonth()+1}; };
  const diffDays = (a, b) => Math.round((Date.UTC(a.getFullYear(),a.getMonth(),a.getDate())-Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())) / 86400000);
  const mon = d => d.getMonth()+1;
  const weekday = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  const lunarMonthName = ['Giêng','Hai','Ba','Tư','Năm','Sáu','Bảy','Tám','Chín','Mười','Mười Một','Chạp'];
  const fmtLunarMonth = n => `tháng ${lunarMonthName[n-1]}`;
  const e = (id) => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  const isValidYear = y => Number.isInteger(y) && y >= 1901 && y <= 2098;
  const lunarCache = new Map();
  const lunar = d => {
    const key=dateKey(d);
    if (!lunarCache.has(key)) {
      if (lunarCache.size > 2500) lunarCache.clear();
      lunarCache.set(key,Core.getLunarDate(d.getDate(),mon(d),d.getFullYear()));
    }
    return lunarCache.get(key);
  };
  const solarFromLunar = (day,month,year,leap=0) => {
    if (!isValidYear(year) || month<1 || month>12 || day<1 || day>30) return null;
    const ly=Core.getYearInfo(year);
    const idx=ly.findIndex(x => x.month===month && x.leap===Number(leap));
    if (idx<0) return null;
    const start=ly[idx].jd, end=(ly[idx+1]?.jd || Core.getYearInfo(year+1)[0].jd);
    if (start+day-1>=end) return null;
    const [d,m,y]=Core.fromDayNumber(start+day-1);
    return createDate(y,m,d);
  };
  const state = {
    selected:TODAY_VN(), viewYear:TODAY_VN().getFullYear(), viewMonth:mon(TODAY_VN()), tab:'month', filter:'all',
    settings: {showLunar:true, weekMonday:true}, userEvents:[], deferredInstall:null
  };
  function loadStorage() {
    try {
      const settings=JSON.parse(localStorage.getItem('jxl-settings')||'null');
      if (settings && typeof settings==='object') Object.assign(state.settings,settings);
      const arr=JSON.parse(localStorage.getItem('jxl-events')||'[]');
      if (Array.isArray(arr)) state.userEvents=arr.filter(x=>x&&typeof x.title==='string'&&x.title.length<=120&&['solar','lunar'].includes(x.calendar)&&Number.isInteger(x.day)&&Number.isInteger(x.month));
    } catch (_) { /* Browsers can disable storage. The rest of the app still works. */ }
  }
  function saveStorage(){ try{localStorage.setItem('jxl-settings',JSON.stringify(state.settings));localStorage.setItem('jxl-events',JSON.stringify(state.userEvents));return true;}catch(_){toast('Trình duyệt không cho lưu sự kiện trên thiết bị.');return false;} }
  loadStorage();
  const urlDay = (()=>{try{return parseDate(new URLSearchParams(location.search).get('date'));}catch(_){return null;}})();
  if(urlDay&&isValidYear(urlDay.getFullYear())){state.selected=urlDay;state.viewYear=urlDay.getFullYear();state.viewMonth=mon(urlDay);}
  const holidays = [
    {type:'solar',month:1,day:1,title:'Tết Dương lịch'},
    {type:'solar',month:2,day:3,title:'Ngày thành lập Đảng Cộng sản Việt Nam'},
    {type:'solar',month:2,day:14,title:'Lễ Tình nhân'},
    {type:'solar',month:2,day:27,title:'Ngày Thầy thuốc Việt Nam'},
    {type:'solar',month:3,day:8,title:'Quốc tế Phụ nữ'},
    {type:'solar',month:3,day:26,title:'Ngày thành lập Đoàn TNCS Hồ Chí Minh'},
    {type:'solar',month:4,day:30,title:'Ngày Giải phóng miền Nam'},
    {type:'solar',month:5,day:1,title:'Ngày Quốc tế Lao động'},
    {type:'solar',month:5,day:19,title:'Ngày sinh Chủ tịch Hồ Chí Minh'},
    {type:'solar',month:6,day:1,title:'Quốc tế Thiếu nhi'},
    {type:'solar',month:7,day:27,title:'Ngày Thương binh – Liệt sĩ'},
    {type:'solar',month:9,day:2,title:'Quốc khánh Việt Nam'},
    {type:'solar',month:10,day:20,title:'Ngày Phụ nữ Việt Nam'},
    {type:'solar',month:11,day:20,title:'Ngày Nhà giáo Việt Nam'},
    {type:'solar',month:12,day:22,title:'Ngày thành lập QĐND Việt Nam'},
    {type:'solar',month:12,day:24,title:'Đêm Giáng sinh'},
    {type:'solar',month:12,day:25,title:'Lễ Giáng sinh'},
    {type:'lunar',month:1,day:1,title:'Tết Nguyên Đán'},
    {type:'lunar',month:1,day:2,title:'Mùng 2 Tết'},
    {type:'lunar',month:1,day:3,title:'Mùng 3 Tết'},
    {type:'lunar',month:1,day:15,title:'Rằm tháng Giêng'},
    {type:'lunar',month:3,day:3,title:'Tết Hàn thực'},
    {type:'lunar',month:3,day:10,title:'Giỗ Tổ Hùng Vương'},
    {type:'lunar',month:4,day:15,title:'Lễ Phật Đản'},
    {type:'lunar',month:5,day:5,title:'Tết Đoan Ngọ'},
    {type:'lunar',month:7,day:15,title:'Lễ Vu Lan'},
    {type:'lunar',month:8,day:15,title:'Tết Trung Thu'},
    {type:'lunar',month:12,day:23,title:'Tết Ông Công Ông Táo'}
  ];
  function getHoliday(d, ld = lunar(d)) {
    return holidays.filter(h => h.type==='solar' ? h.day===d.getDate()&&h.month===mon(d) : h.day===ld.day&&h.month===ld.month&&!ld.leap);
  }
  function eventMatches(evt,d,ld=lunar(d)){
    if(evt.calendar==='solar'){
      return evt.day===d.getDate()&&evt.month===mon(d)&& (evt.repeat || evt.year===d.getFullYear());
    }
    return evt.day===ld.day&&evt.month===ld.month&&Number(evt.leap||0)===ld.leap && (evt.repeat || evt.year===ld.year);
  }
  function personalOn(d,ld=lunar(d)){return state.userEvents.filter(evt=>eventMatches(evt,d,ld));}
  function allOn(d,ld=lunar(d)){
    return [...getHoliday(d,ld).map(h=>({...h,personal:false})),...personalOn(d,ld).map(h=>({...h,personal:true}))];
  }
  function longLunar(ld){return `${ld.day===1?'Mùng 1':ld.day===15?'Rằm':'Ngày '+ld.day} ${fmtLunarMonth(ld.month)}${ld.leap?' nhuận':''}`;}
  function setSelected(d,{setView=true,updateUrl=true}={}){
    if(!isValidYear(d.getFullYear())){toast('Hỗ trợ tra cứu từ năm 1901 đến 2098.');return;}
    state.selected=d;
    if(setView){state.viewMonth=mon(d);state.viewYear=d.getFullYear();}
    if(updateUrl){try{const u=new URL(location.href);u.searchParams.set('date',dateKey(d));history.replaceState({},'',u);}catch(_){}}
    render();
  }
  function goToday(tab=state.tab){setSelected(TODAY_VN());setTab(tab);}
  function setTab(tab){if(!['month','today','events'].includes(tab))return;state.tab=tab;document.querySelectorAll('[data-tab]').forEach(x=>{const active=x.dataset.tab===tab;x.classList.toggle('active',active);if(active)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});e('monthPage').classList.toggle('active',tab==='month');e('todayPage').classList.toggle('active',tab==='today');e('eventsPage').classList.toggle('active',tab==='events');render();window.scrollTo({top:0,behavior:'smooth'});}
  function renderHero(){
    const d=state.selected, ld=lunar(d), h=getHoliday(d,ld);
    e('heroWeekday').textContent=weekday[d.getDay()].toLocaleUpperCase('vi-VN');
    e('heroDay').textContent=d.getDate();
    e('heroMonth').textContent=`Tháng ${mon(d)} năm ${d.getFullYear()}`;
    e('heroLunar').textContent=longLunar(ld);
    e('heroYear').textContent=`Năm ${Core.getYearCanChi(ld.year)}`;
    e('heroCanChi').textContent=`Ngày ${Core.getCanChi(ld)[0]}`;
    e('heroHoliday').hidden=!h.length;
    e('heroHoliday').textContent=h.map(x=>x.title).join(' · ');
  }
  function renderCalendar(){
    const month=state.viewMonth,year=state.viewYear;
    e('monthTitle').textContent=`Tháng ${month}, ${year}`;
    e('prevMonth').disabled=(year===1901&&month===1);
    e('nextMonth').disabled=(year===2098&&month===12);
    const dayNames=state.settings.weekMonday?['T2','T3','T4','T5','T6','T7','CN']:['CN','T2','T3','T4','T5','T6','T7'];
    e('weekdayNames').innerHTML=dayNames.map(name=>`<div class="${name==='CN'?'sunday':''}">${name}</div>`).join('');
    const first=createDate(year,month,1), offset=state.settings.weekMonday?(first.getDay()+6)%7:first.getDay();
    const totalDays=new Date(year,month,0).getDate();
    const totalCells=Math.ceil((offset+totalDays)/7)*7;
    const currentKey=dateKey(TODAY_VN()),selectedKey=dateKey(state.selected);
    let html='';
    for(let cell=0;cell<totalCells;cell++){
      const index=cell-offset+1;
      if(index<1 || index>totalDays){html+='<span class="calendar-day empty" aria-hidden="true"></span>';continue;}
      const date=createDate(year,month,index),key=dateKey(date),ld=lunar(date),isSel=key===selectedKey,isToday=key===currentKey,hasHolidays=getHoliday(date,ld).length>0,hasPersonal=personalOn(date,ld).length>0;
      const lunarText=(index===1||ld.day===1)?`${ld.day}/${ld.month}${ld.leap?' N':''}`:`${ld.day}${ld.leap?' N':''}`;
      const cls=['calendar-day',date.getDay()===0?'sunday':'',isSel?'selected':''].filter(Boolean).join(' ');
      const special=hasHolidays?getHoliday(date,ld).map(x=>x.title).join(', '):hasPersonal?'Sự kiện cá nhân':'';
      html+=`<button type="button" role="gridcell" class="${cls}" data-date="${key}" aria-selected="${isSel}" aria-label="${index} tháng ${month} năm ${year}; âm lịch ${ld.day} tháng ${ld.month}${special?'; '+esc(special):''}"><span class="day-solar">${index}</span><span class="day-lunar">${state.settings.showLunar?lunarText:'&nbsp;'}</span>${isToday?'<span class="today-pin" aria-hidden="true"></span>':''}${hasHolidays||hasPersonal?`<span class="event-pin ${hasHolidays?'holiday':''}" aria-hidden="true"></span>`:''}</button>`;
    }
    e('calendarGrid').innerHTML=html;
    renderUpcoming();
  }
  function nextEvents(from,count=2,days=400,onlyFilter='all',omitMinor=false){
    const list=[];
    for(let i=0;i<=days;i++){
      const d=moveDays(from,i);
      if(d.getFullYear()>2098)break;
      const events=allOn(d).filter(x=>(onlyFilter==='all'||(onlyFilter==='personal'?x.personal:!x.personal)) && (!omitMinor || !['Mùng 2 Tết','Mùng 3 Tết','Ngày Thầy thuốc Việt Nam'].includes(x.title)));
      for(const event of events)list.push({date:d,...event});
      if(list.length>=count)break;
    }
    return list.slice(0,count);
  }
  function renderUpcoming(){
    // When browsing another month, upcoming means the selected or viewed period.
    const mStart=createDate(state.viewYear,state.viewMonth,1),today=TODAY_VN();
    const selectedInView=mon(state.selected)===state.viewMonth&&state.selected.getFullYear()===state.viewYear;
    const start=selectedInView?state.selected:(state.viewMonth===mon(today)&&state.viewYear===today.getFullYear()?today:mStart);
    const upcoming=nextEvents(start,2,400,'all',true);
    e('upcomingList').innerHTML=upcoming.length?upcoming.map(x=>`<button type="button" class="upcoming-item" data-date="${dateKey(x.date)}" title="Xem ngày ${dateKey(x.date)}"><span class="mini-date"><strong>${pad(x.date.getDate())}</strong><small>TH${mon(x.date)}</small></span><span class="event-copy"><strong>${esc(x.title)}</strong><small>${x.type==='lunar'||x.calendar==='lunar'?longLunar(lunar(x.date)):`Ngày ${x.date.getDate()}/${mon(x.date)}`}</small></span></button>`).join(''):'<div class="empty-events">Không có sự kiện sắp tới trong khoảng thời gian này.</div>';
  }
  function renderDetails(){
    const d=state.selected,ld=lunar(d),cc=Core.getCanChi(ld),h=allOn(d);
    e('detailDate').textContent=`${d.getDate()} tháng ${mon(d)}, ${d.getFullYear()}`;
    e('detailWeekday').textContent=weekday[d.getDay()];
    e('todayIntro').textContent=`${weekday[d.getDay()]}, ${dateKey(d).split('-').reverse().join('/')}`;
    e('detailLunar').textContent=longLunar(ld);
    e('detailYear').textContent=cc[2];
    e('detailCanDay').textContent=cc[0];
    e('detailCanMonth').textContent=cc[1];
    e('detailSolarTerm').textContent=Core.solarTerms[Core.getSunLongitude(ld.jd+1,7.0)];
    e('detailHours').textContent=Core.getGioHoangDao(ld.jd).replace(/\n/g,' · ');
    e('detailHoliday').hidden=!h.length;
    e('detailHoliday').textContent=h.map(x=>x.title).join(' · ');
    e('todayPrev').disabled=d.getFullYear()<=1901&&mon(d)===1&&d.getDate()===1;
    e('todayNext').disabled=d.getFullYear()>=2098&&mon(d)===12&&d.getDate()===31;
  }
  function renderEvents(){
    const filter=state.filter;
    document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));
    const anchor=TODAY_VN(),items=nextEvents(anchor,120,395,filter);
    if(filter==='personal' && !state.userEvents.length){e('eventsList').innerHTML='<div class="empty-events"><span aria-hidden="true" style="font-size:29px">♡</span><strong>Chưa có sự kiện riêng</strong>Bạn có thể thêm sinh nhật, kỷ niệm hoặc những ngày quan trọng. Các sự kiện được lưu trên thiết bị này.</div>';return;}
    if(!items.length){e('eventsList').innerHTML='<div class="empty-events">Không có sự kiện sắp tới.</div>';return;}
    e('eventsList').innerHTML=items.map(x=>`<article class="event-row"><div class="mini-date"><strong>${pad(x.date.getDate())}</strong><small>TH${mon(x.date)}</small></div><div class="event-copy"><strong>${esc(x.title)}</strong><small>${dateKey(x.date).split('-').reverse().join('/')} · ${x.calendar==='lunar'||x.type==='lunar'?longLunar(lunar(x.date)):'Dương lịch'}${x.personal?' · Của tôi':''}</small></div>${x.personal?`<div class="event-actions"><button type="button" data-edit="${esc(x.id)}" aria-label="Sửa ${esc(x.title)}" title="Chỉnh sửa">✎</button><button type="button" data-delete="${esc(x.id)}" aria-label="Xóa ${esc(x.title)}" title="Xóa">×</button></div>`:''}</article>`).join('');
  }
  function render(){renderHero();renderCalendar();renderDetails();if(state.tab==='events')renderEvents();e('footerYear').textContent=TODAY_VN().getFullYear();}
  const toast=(message)=>{const el=e('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2800);};
  function openDialog(title,eyebrow,html,after){e('dialogTitle').textContent=title;e('dialogEyebrow').textContent=eyebrow;e('dialogBody').innerHTML=html;e('dialogBackdrop').hidden=false;document.body.style.overflow='hidden';if(after)after();e('dialogClose').focus();}
  function closeDialog(){e('dialogBackdrop').hidden=true;document.body.style.overflow='';}
  function openConversion(mode='solar'){
    const d=state.selected,ld=lunar(d);
    const html=`<div class="modal-tabs"><button class="modal-tab ${mode==='solar'?'active':''}" data-convert-tab="solar" type="button">Dương → Âm</button><button class="modal-tab ${mode==='lunar'?'active':''}" data-convert-tab="lunar" type="button">Âm → Dương</button></div>
    ${mode==='solar'?`<div class="form-group"><label for="solarPicker">Chọn ngày dương lịch</label><input id="solarPicker" type="date" value="${dateKey(d)}" min="1901-01-01" max="2098-12-31"></div>`:`<div class="form-row"><div class="form-group"><label for="lDay">Ngày âm</label><input id="lDay" type="number" min="1" max="30" value="${ld.day}"></div><div class="form-group"><label for="lMonth">Tháng âm</label><select id="lMonth">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${ld.month===i+1?'selected':''}>${i+1}</option>`).join('')}</select></div><div class="form-group"><label for="lYear">Năm âm</label><input id="lYear" type="number" min="1901" max="2098" value="${ld.year}"></div></div><label class="check-row"><input id="lLeap" type="checkbox" ${ld.leap?'checked':''}> Tháng nhuận</label>`}
    <div id="conversionResult" class="converted-output" aria-live="polite"></div><div class="modal-actions"><button class="outline-btn" type="button" id="conversionCancel">Đóng</button><button class="primary-btn" type="button" id="conversionApply">Xem ngày này</button></div>`;
    openDialog('Đổi ngày âm / dương','TRA CỨU LỊCH VIỆT NAM',html,()=>{
      let result=null;
      const update=()=>{
        if(mode==='solar')result=parseDate(e('solarPicker').value);
        else result=solarFromLunar(Number(e('lDay').value),Number(e('lMonth').value),Number(e('lYear').value),e('lLeap').checked);
        if(!result||!isValidYear(result.getFullYear())){e('conversionResult').innerHTML='<small>KHÔNG HỢP LỆ</small><strong>Vui lòng kiểm tra ngày đã nhập</strong><p>Tháng nhuận và số ngày mỗi tháng có thể khác nhau.</p>';e('conversionApply').disabled=true;return;}
        e('conversionApply').disabled=false;
        const converted=lunar(result);
        e('conversionResult').innerHTML=mode==='solar'?`<small>ÂM LỊCH</small><strong>${longLunar(converted)}</strong><p>Năm ${Core.getYearCanChi(converted.year)} · ${weekday[result.getDay()]}</p>`:`<small>DƯƠNG LỊCH</small><strong>${pad(result.getDate())}/${pad(mon(result))}/${result.getFullYear()}</strong><p>${weekday[result.getDay()]}</p>`;
      };
      e('dialogBody').querySelectorAll('input,select').forEach(input=>input.addEventListener('input',update));
      e('conversionCancel').addEventListener('click',closeDialog);
      e('conversionApply').addEventListener('click',()=>{if(result){setSelected(result);setTab('today');closeDialog();}});
      e('dialogBody').querySelectorAll('[data-convert-tab]').forEach(btn=>btn.addEventListener('click',()=>openConversion(btn.dataset.convertTab)));
      update();
    });
  }
  function openEventForm(item=null){
    const d=state.selected,ld=lunar(d);
    const v=item||{title:'',calendar:'solar',day:d.getDate(),month:mon(d),year:d.getFullYear(),leap:0,repeat:true};
    const html=`<form id="eventForm"><div class="form-group"><label for="eventTitle">Tên sự kiện</label><input id="eventTitle" type="text" maxlength="80" placeholder="Ví dụ: Sinh nhật, ngày kỷ niệm..." value="${esc(v.title)}" required></div>
    <div class="form-group"><label for="eventCalendar">Loại lịch</label><select id="eventCalendar"><option value="solar" ${v.calendar==='solar'?'selected':''}>Dương lịch</option><option value="lunar" ${v.calendar==='lunar'?'selected':''}>Âm lịch</option></select></div>
    <div class="form-row"><div class="form-group"><label for="eventDay">Ngày</label><input id="eventDay" type="number" min="1" max="31" value="${v.day}" required></div><div class="form-group"><label for="eventMonth">Tháng</label><input id="eventMonth" type="number" min="1" max="12" value="${v.month}" required></div><div class="form-group"><label for="eventYear">Năm</label><input id="eventYear" type="number" min="1901" max="2098" value="${v.year}" required></div></div>
    <label class="check-row" id="eventLeapRow" ${v.calendar==='solar'?'hidden':''}><input type="checkbox" id="eventLeap" ${v.leap?'checked':''}> Tháng âm nhuận</label>
    <label class="check-row"><input type="checkbox" id="eventRepeat" ${v.repeat?'checked':''}> Lặp lại mỗi năm</label>
    <p class="muted" style="font-size:12px;line-height:1.6">Sự kiện được lưu trong trình duyệt của thiết bị. Không cần tài khoản.</p>
    <div class="modal-actions"><button class="outline-btn" type="button" id="eventCancel">Hủy</button><button class="primary-btn" type="submit">${item?'Lưu thay đổi':'Thêm sự kiện'}</button></div></form>`;
    openDialog(item?'Sửa sự kiện':'Thêm sự kiện','LỊCH CỦA TÔI',html,()=>{
      e('eventCalendar').addEventListener('change',()=>{e('eventLeapRow').hidden=e('eventCalendar').value==='solar';});
      e('eventCancel').addEventListener('click',closeDialog);
      e('eventForm').addEventListener('submit',ev=>{
        ev.preventDefault();
        const title=e('eventTitle').value.trim(),calendar=e('eventCalendar').value,day=Number(e('eventDay').value),month=Number(e('eventMonth').value),year=Number(e('eventYear').value),leap=calendar==='lunar'&&e('eventLeap').checked?1:0,repeat=e('eventRepeat').checked;
        if(!title||title.length>80||!isValidYear(year)){toast('Vui lòng nhập tên và năm hợp lệ.');return;}
        if(calendar==='lunar'&&!solarFromLunar(day,month,year,leap)){toast('Ngày âm lịch hoặc tháng nhuận không hợp lệ.');return;}
        if(calendar==='solar'&&(!parseDate(`${year}-${pad(month)}-${pad(day)}`))){toast('Ngày dương lịch không hợp lệ.');return;}
        const data={id:item?.id||'evt_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),title,calendar,day,month,year,leap,repeat};
        if(item)state.userEvents=state.userEvents.map(x=>x.id===item.id?data:x);else state.userEvents.push(data);
        saveStorage();closeDialog();render();toast(item?'Đã cập nhật sự kiện.':'Đã lưu sự kiện trên thiết bị.');
      });
      e('eventTitle').focus();
    });
  }
  function openSettings(){
    openDialog('Cài đặt','JEE.XLES · LỊCH ÂM',`<div class="settings-row"><div><strong>Hiện ngày âm</strong><p class="setting-desc">Hiển thị ngày âm nhỏ bên dưới ngày dương.</p></div><label class="toggle" aria-label="Hiện ngày âm"><input id="settingLunar" type="checkbox" ${state.settings.showLunar?'checked':''}><span></span></label></div>
      <div class="settings-row"><div><strong>Tuần bắt đầu từ thứ Hai</strong><p class="setting-desc">Đổi vị trí thứ Hai và Chủ Nhật trên lịch.</p></div><label class="toggle" aria-label="Bắt đầu tuần từ thứ Hai"><input id="settingMonday" type="checkbox" ${state.settings.weekMonday?'checked':''}><span></span></label></div>
      <button class="settings-install" id="settingsInstall" type="button"><svg viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M5 17v3h14v-3"/></svg> Cài ứng dụng lên màn hình chính</button>
      <div class="settings-foot"><strong>jeexles.licham</strong> · Sáng tạo bởi <strong>jeexles</strong><div>Phiên bản 2.0 · Lịch Việt Nam (GMT+7)</div><div>Bộ tính lịch âm – dương riêng cho jeexles.licham, quy đổi theo múi giờ Việt Nam (GMT+7).</div><div>Ứng dụng không theo dõi và không tải dữ liệu sự kiện của bạn lên máy chủ.</div></div>`,()=>{
      e('settingLunar').addEventListener('change',ev=>{state.settings.showLunar=ev.target.checked;saveStorage();render();});
      e('settingMonday').addEventListener('change',ev=>{state.settings.weekMonday=ev.target.checked;saveStorage();render();});
      e('settingsInstall').addEventListener('click',installApp);
    });
  }
  async function installApp(){
    if(state.deferredInstall){
      const prompt=state.deferredInstall;state.deferredInstall=null;closeDialog();await prompt.prompt();return;
    }
    const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
    toast(isIOS?'Trên Safari: Chia sẻ → Thêm vào Màn hình chính.':'Trên Chrome: mở menu ⋮ → Thêm vào màn hình chính / Cài đặt ứng dụng.');
  }
  window.addEventListener('beforeinstallprompt',ev=>{ev.preventDefault();state.deferredInstall=ev;e('installHeader').hidden=false;});
  window.addEventListener('appinstalled',()=>{state.deferredInstall=null;e('installHeader').hidden=true;toast('Đã cài đặt jeexles.licham!');});
  document.addEventListener('click',ev=>{
    const nav=ev.target.closest('[data-tab]');if(nav){setTab(nav.dataset.tab);return;}
    const day=ev.target.closest('.calendar-day[data-date],.upcoming-item[data-date]');if(day){const d=parseDate(day.dataset.date);if(d)setSelected(d);return;}
    const filter=ev.target.closest('[data-filter]');if(filter){state.filter=filter.dataset.filter;renderEvents();return;}
    const edit=ev.target.closest('[data-edit]');if(edit){const evt=state.userEvents.find(x=>x.id===edit.dataset.edit);if(evt)openEventForm(evt);return;}
    const del=ev.target.closest('[data-delete]');if(del){const evt=state.userEvents.find(x=>x.id===del.dataset.delete);if(evt){openDialog('Xóa sự kiện?','XÁC NHẬN',`<p>Bạn muốn xóa sự kiện <strong>${esc(evt.title)}</strong> khỏi thiết bị này?</p><div class="modal-actions"><button class="outline-btn" type="button" id="noDelete">Giữ lại</button><button class="primary-btn" type="button" id="yesDelete">Xóa sự kiện</button></div>`,()=>{e('noDelete').onclick=closeDialog;e('yesDelete').onclick=()=>{state.userEvents=state.userEvents.filter(x=>x.id!==evt.id);saveStorage();closeDialog();renderEvents();renderCalendar();toast('Đã xóa sự kiện.');};});}return;}
  });
  e('brandBtn').addEventListener('click',()=>goToday('month'));
  e('todayBtn').addEventListener('click',()=>goToday('month'));
  e('todayTodayBtn').addEventListener('click',()=>goToday('today'));
  e('prevMonth').addEventListener('click',()=>{const p=addMonths(state.viewYear,state.viewMonth,-1);if(isValidYear(p.year)){state.viewYear=p.year;state.viewMonth=p.month;renderCalendar();}});
  e('nextMonth').addEventListener('click',()=>{const p=addMonths(state.viewYear,state.viewMonth,1);if(isValidYear(p.year)){state.viewYear=p.year;state.viewMonth=p.month;renderCalendar();}});
  e('todayPrev').addEventListener('click',()=>setSelected(moveDays(state.selected,-1)));
  e('todayNext').addEventListener('click',()=>setSelected(moveDays(state.selected,1)));
  e('todayToCalendar').addEventListener('click',()=>setTab('month'));
  e('convertBtn').addEventListener('click',()=>openConversion());
  e('addEvent').addEventListener('click',()=>openEventForm());
  e('settingsBtn').addEventListener('click',openSettings);
  e('installHeader').addEventListener('click',installApp);
  e('showAllEvents').addEventListener('click',()=>setTab('events'));
  e('dialogClose').addEventListener('click',closeDialog);
  e('dialogBackdrop').addEventListener('click',ev=>{if(ev.target===e('dialogBackdrop'))closeDialog();});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!e('dialogBackdrop').hidden)closeDialog();if(e('dialogBackdrop').hidden&&state.tab==='month'&&['ArrowLeft','ArrowRight'].includes(ev.key)&&document.activeElement?.classList.contains('calendar-day')){ev.preventDefault();const d=parseDate(document.activeElement.dataset.date);if(d)setSelected(moveDays(d,ev.key==='ArrowRight'?1:-1));}});
  e('shareDate').addEventListener('click',async()=>{
    const d=state.selected,ld=lunar(d),txt=`jeexles.licham · ${weekday[d.getDay()]}, ${d.getDate()}/${mon(d)}/${d.getFullYear()} — âm lịch ${ld.day}/${ld.month}${ld.leap?' nhuận':''}/${ld.year}`;
    if(navigator.share){try{await navigator.share({title:'Lịch âm · jeexles',text:txt,url:location.href});return;}catch(_){}}
    try{await navigator.clipboard.writeText(txt);toast('Đã sao chép thông tin ngày.');}catch(_){toast(txt);}
  });
  render();
  if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();
