// src/App.jsx
import React, { useState, useEffect } from 'react';
import { MONTHS, DAYS, getDaysInMonth, getFirstDay, isSameDay } from './utils/dateUtils';
import { useEmailEvents } from './hooks/useEmailEvents';
import { useReminders }   from './hooks/useReminders';

const MS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ── PrintView ── */
function PrintView({month,year,today,startDate,endDate,cells,holidays,userEvents,dailyNotes,activeDate,monthImages}){
  const hasRange=startDate&&endDate;
  const selHoliday=activeDate?holidays[`${activeDate.getMonth()}-${activeDate.getDate()}`]:null;
  const selEvents=activeDate?userEvents.filter(ev=>ev.month===activeDate.getMonth()&&ev.day===activeDate.getDate()&&(ev.year===activeDate.getFullYear()||ev.isYearly)):[];
  const currentMemo=activeDate?(dailyNotes[`${activeDate.getFullYear()}-${activeDate.getMonth()}-${activeDate.getDate()}`]||''):'';
  return(
    <div className="print-root" style={{display:'none'}}>
      <div className="print-card-left">
        <div className="print-hero" style={{backgroundImage:`url('${monthImages[month]}')`}}>
          <div className="print-hero-overlay"/><div className="print-hero-text"><h2>{MONTHS[month]}</h2><p>{year}</p></div>
        </div>
        <div className="print-cal-body">
          <div className="print-day-headers">{DAYS.map(d=><div key={d}>{d}</div>)}</div>
          <div className="print-day-grid">
            {cells.map((day,i)=>{
              if(!day)return<div key={`e-${i}`}/>;
              const d=new Date(year,month,day);
              const isToday=isSameDay(d,today),isStart=startDate&&isSameDay(d,startDate),isEnd=endDate&&isSameDay(d,endDate);
              const inRange=hasRange&&d>startDate&&d<endDate,isSelected=!hasRange&&activeDate&&isSameDay(d,activeDate);
              const hasHol=holidays[`${month}-${day}`],hasEv=userEvents.some(ev=>ev.month===month&&ev.day===day&&(ev.year===year||ev.isYearly)),hasMemo=dailyNotes[`${year}-${month}-${day}`];
              let cls='print-day-cell';
              if(hasRange){if(isStart)cls+=' range-start';else if(isEnd)cls+=' range-end';else if(inRange)cls+=' in-range';else if(isToday)cls+=' is-today';}
              else{if(isSelected)cls+=' is-selected';else if(isToday)cls+=' is-today';}
              const od=isStart||isEnd||isSelected;
              return(<div key={i} className={cls}>{day}{(hasHol||hasEv||hasMemo)&&<div className="print-dots">{hasHol&&<span className="print-dot" style={{background:od?'#fff':'#ef4444'}}/>}{hasEv&&<span className="print-dot" style={{background:od?'#fff':'#14b8a6'}}/>}{hasMemo&&<span className="print-dot" style={{background:od?'#fff':'#f59e0b'}}/>}</div>}</div>);
            })}
          </div>
          <div style={{display:'flex',gap:14,marginTop:14,flexWrap:'wrap'}}>
            {[{c:'#ef4444',l:'Holiday'},{c:'#14b8a6',l:'Event'},{c:'#f59e0b',l:'Memo'}].map(({c,l})=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:'#666'}}><span style={{width:8,height:8,borderRadius:'50%',background:c,display:'inline-block'}}/>{l}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="print-right-col">
        <div className="print-right-card">
          <div className="print-section-title">Monthly Agenda</div>
          {selHoliday&&<div style={{padding:'8px 10px',borderRadius:8,border:'1px solid #fca5a5',background:'#fff5f5',marginBottom:6}}><div style={{fontSize:9,fontWeight:700,color:'#ef4444',textTransform:'uppercase'}}>{activeDate.getDate()} {MONTHS[activeDate.getMonth()]}</div><div style={{fontSize:13,fontWeight:600,color:'#7f1d1d'}}>{selHoliday}</div></div>}
          {selEvents.map(ev=><div key={ev.id} style={{padding:'8px 10px',borderRadius:8,border:'1px solid #e5e7eb',marginBottom:6}}><div style={{fontSize:9,fontWeight:700,color:'#6366f1',textTransform:'uppercase'}}>{ev.day} {MONTHS[ev.month]}</div><div style={{fontSize:13,fontWeight:600,color:'#111'}}>{ev.title}</div></div>)}
          {!selHoliday&&selEvents.length===0&&<p style={{fontSize:12,color:'#aaa',fontStyle:'italic'}}>No events scheduled.</p>}
        </div>
        <div className="print-right-card">
          <div className="print-section-title">Memos</div>
          <div style={{fontSize:9,fontWeight:700,padding:'3px 8px',background:'#e0e7ff',color:'#4f46e5',borderRadius:6,display:'inline-block',marginBottom:8}}>{activeDate.getDate()} {MONTHS[activeDate.getMonth()]} {activeDate.getFullYear()}</div>
          {currentMemo?<div className="print-memo-area">{currentMemo}</div>:<div style={{color:'#aaa',fontStyle:'italic',fontSize:12}}>No memo for this date.</div>}
        </div>
        <div className="print-footer">Printed from WallCal · {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}

/* ── ReminderToast ── */
function ReminderToast({toast,onDismiss,onSnooze,isDarkMode}){
  const bg=isDarkMode?'#1e293b':'#fff',border=isDarkMode?'#334155':'#e0e7ff',tc=isDarkMode?'#f1f5f9':'#1e293b',sc=isDarkMode?'#94a3b8':'#64748b';
  const btnSec={flex:1,fontSize:11,fontWeight:600,padding:'5px 0',borderRadius:8,background:isDarkMode?'#334155':'#f1f5f9',color:sc,border:'none',cursor:'pointer'};
  return(
    <div style={{background:bg,border:`1px solid ${border}`,borderLeft:'4px solid #6366f1',borderRadius:14,padding:'12px 14px',boxShadow:'0 4px 24px rgba(99,102,241,0.15)',display:'flex',flexDirection:'column',gap:8,minWidth:280,maxWidth:340,animation:'slideIn 0.3s ease'}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:2}}>⏰ Reminder: {toast.label}</div>
          <div style={{fontSize:14,fontWeight:600,color:tc}}>{toast.title}</div>
          <div style={{fontSize:11,color:sc,marginTop:2}}>{toast.day} {MS[toast.month]} {toast.year}</div>
        </div>
        <button onClick={()=>onDismiss(toast.id)} style={{color:sc,fontSize:16,lineHeight:1,padding:'0 2px',flexShrink:0,background:'none',border:'none',cursor:'pointer'}}>✕</button>
      </div>
      <div style={{display:'flex',gap:6}}>
        <button onClick={()=>onSnooze(toast.id,toast.evId,15)} style={btnSec}>Snooze 15m</button>
        <button onClick={()=>onSnooze(toast.id,toast.evId,60)} style={btnSec}>Snooze 1h</button>
        <button onClick={()=>onDismiss(toast.id)} style={{...btnSec,background:'#6366f1',color:'#fff'}}>Got it</button>
      </div>
    </div>
  );
}

/* ── EmailEventTray ── */
function EmailEventTray({pendingEvents,onConfirm,onDismiss,onDismissAll,isLoading,isDarkMode}){
  if(!pendingEvents.length&&!isLoading)return null;
  const bg=isDarkMode?'#0f172a':'#fff',border=isDarkMode?'#1e293b':'#e2e8f0',tc=isDarkMode?'#f1f5f9':'#1e293b',sc=isDarkMode?'#64748b':'#94a3b8';
  return(
    <div style={{position:'fixed',bottom:24,left:24,zIndex:60,background:bg,border:`1px solid ${border}`,borderRadius:20,padding:'18px 20px',boxShadow:'0 8px 40px rgba(0,0,0,0.18)',width:340,maxHeight:460,display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:tc}}>📧 Events from Gmail</div>
          <div style={{fontSize:11,color:sc,marginTop:1}}>{isLoading?'Scanning emails...':`${pendingEvents.length} event${pendingEvents.length!==1?'s':''} detected`}</div>
        </div>
        <button onClick={onDismissAll} style={{fontSize:12,color:sc,padding:'4px 8px',borderRadius:8,border:`1px solid ${border}`,background:'transparent',cursor:'pointer'}}>Dismiss all</button>
      </div>
      {isLoading&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 0',justifyContent:'center'}}><div style={{width:16,height:16,border:'2px solid #6366f1',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/><span style={{fontSize:12,color:sc}}>Reading emails...</span></div>}
      <div style={{overflowY:'auto',display:'flex',flexDirection:'column',gap:8,maxHeight:320}}>
        {pendingEvents.map((ev,i)=>(
          <div key={i} style={{background:isDarkMode?'#1e293b':'#f8fafc',borderRadius:12,padding:'10px 12px',border:`1px solid ${border}`,display:'flex',flexDirection:'column',gap:6}}>
            <div style={{fontSize:10,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'0.05em'}}>{ev.date.getDate()} {MS[ev.date.getMonth()]} {ev.date.getFullYear()} · from email</div>
            <div style={{fontSize:13,fontWeight:600,color:tc,lineHeight:1.4}}>{ev.title}</div>
            {ev.from&&<div style={{fontSize:11,color:sc,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>From: {ev.from}</div>}
            <div style={{display:'flex',gap:6,marginTop:2}}>
              <button onClick={()=>onConfirm(ev,i)} style={{flex:1,fontSize:11,fontWeight:700,padding:'6px 0',borderRadius:8,background:'#6366f1',color:'#fff',border:'none',cursor:'pointer'}}>✓ Add to Calendar</button>
              <button onClick={()=>onDismiss(i)} style={{flex:1,fontSize:11,fontWeight:600,padding:'6px 0',borderRadius:8,background:isDarkMode?'#334155':'#f1f5f9',color:sc,border:'none',cursor:'pointer'}}>Ignore</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── UpcomingRemindersPanel ── */
function UpcomingRemindersPanel({upcomingEvents,permission,onRequestPermission,isDarkMode}){
  const dayLabel=d=>d===0?'Today':d===1?'Tomorrow':`In ${d} days`;
  return(
    <div className={`rounded-[2rem] p-6 border shadow-xl transition-all duration-500 ${isDarkMode?'bg-slate-900 border-slate-800':'bg-white border-gray-100'}`}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <h3 className="text-lg font-serif italic">🔔 Upcoming</h3>
        {permission!=='granted'&&<button onClick={onRequestPermission} style={{fontSize:10,fontWeight:700,padding:'4px 10px',borderRadius:8,background:'#6366f1',color:'#fff',border:'none',cursor:'pointer'}}>Enable alerts</button>}
      </div>
      {upcomingEvents.length===0
        ?<p className="text-xs opacity-50 italic">No events in the next 7 days.</p>
        :<div style={{display:'flex',flexDirection:'column',gap:8}}>
          {upcomingEvents.map(ev=>(
            <div key={ev.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:10,background:isDarkMode?'rgba(99,102,241,0.08)':'rgba(99,102,241,0.05)',border:`1px solid ${isDarkMode?'rgba(99,102,241,0.2)':'rgba(99,102,241,0.12)'}`}}>
              <div style={{width:34,height:34,borderRadius:10,background:'#6366f1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontSize:12,fontWeight:800,color:'#fff',lineHeight:1}}>{ev.day}</span>
                <span style={{fontSize:8,color:'rgba(255,255,255,0.7)',lineHeight:1}}>{MS[ev.month]}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:isDarkMode?'#f1f5f9':'#1e293b',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ev.title}</div>
                <div style={{fontSize:10,color:'#6366f1',fontWeight:600,marginTop:1}}>{dayLabel(ev.daysUntil)}</div>
              </div>
              {ev.source==='email'&&<span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:5,background:isDarkMode?'#1e3a5f':'#dbeafe',color:isDarkMode?'#60a5fa':'#2563eb',flexShrink:0}}>EMAIL</span>}
            </div>
          ))}
        </div>
      }
    </div>
  );
}

/* ── Main App ── */
function App(){
  const today=new Date();
  const [month,setMonth]=useState(today.getMonth());
  const [year,setYear]=useState(today.getFullYear());
  const [startDate,setStartDate]=useState(null);
  const [endDate,setEndDate]=useState(null);
  const [isDarkMode,setIsDarkMode]=useState(()=>{try{return localStorage.getItem('cal_theme')==='dark';}catch{return false;}});
  const [dailyNotes,setDailyNotes]=useState(()=>{try{const s=localStorage.getItem('cal_daily_notes');return s?JSON.parse(s):{};}catch{return{};}});
  const [userEvents,setUserEvents]=useState(()=>{try{const s=localStorage.getItem('cal_user_events');return s?JSON.parse(s):[];}catch{return[];}});
  const [holidays,setHolidays]=useState({});
  const [showAddModal,setShowAddModal]=useState(false);
  const [showDeleteModal,setShowDeleteModal]=useState(false);
  const [eventTitleInput,setEventTitleInput]=useState('');
  const [isYearlyInput,setIsYearlyInput]=useState(false);
  const [eventToDelete,setEventToDelete]=useState(null);

  const activeDate=endDate||startDate||today;

  // ✅ FIX: sirf ek baar destructure karo, duplicate variable nahi
  const {
    isConnected, isLoading: emailLoading, error: emailError,
    pendingEvents, connectGmail, fetchEmailEvents, logout, dismissPending, dismissAll
  } = useEmailEvents();

  const {permission,requestPermission,toasts,dismissToast,snoozeToast,upcomingEvents}=useReminders(userEvents);

  useEffect(()=>{localStorage.setItem('cal_daily_notes',JSON.stringify(dailyNotes));},[dailyNotes]);
  useEffect(()=>{localStorage.setItem('cal_user_events',JSON.stringify(userEvents));},[userEvents]);
  useEffect(()=>{localStorage.setItem('cal_theme',isDarkMode?'dark':'light');},[isDarkMode]);

  useEffect(()=>{
    const KEY=import.meta.env.VITE_GOOGLE_API_KEY||'';
    if(!KEY)return;
    const CID='en.indian#holiday@group.v.calendar.google.com';
    fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CID)}/events?key=${KEY}&timeMin=${new Date(year,0,1).toISOString()}&timeMax=${new Date(year,11,31,23,59,59).toISOString()}&singleEvents=true&orderBy=startTime`)
      .then(r=>r.json()).then(data=>{if(data.items){const m={};data.items.forEach(item=>{const d=new Date(item.start.date||item.start.dateTime);m[`${d.getMonth()}-${d.getDate()}`]=item.summary;});setHolidays(m);}}).catch(()=>{});
  },[year]);

  const handleDayClick=day=>{const clicked=new Date(year,month,day);if(!startDate||(startDate&&endDate)){setStartDate(clicked);setEndDate(null);}else if(startDate&&clicked>startDate){setEndDate(clicked);}else{setStartDate(clicked);}};
  
  const handleSaveEvent=()=>{
    if(!eventTitleInput.trim()||!activeDate)return;
    setUserEvents(prev=>[...prev,{id:Date.now(),title:eventTitleInput,day:activeDate.getDate(),month:activeDate.getMonth(),year:activeDate.getFullYear(),isYearly:isYearlyInput}]);
    setShowAddModal(false);setEventTitleInput('');setIsYearlyInput(false);
  };
  
  const handleMemoChange=val=>{
    const k=`${activeDate.getFullYear()}-${activeDate.getMonth()}-${activeDate.getDate()}`;
    setDailyNotes(prev=>({...prev,[k]:val}));
  };

  // ✅ Email event confirm: localStorage bhi update karo
  const handleConfirmEmailEvent=(ev,index)=>{
    const newEv={id:Date.now()+Math.random(),title:ev.title,day:ev.date.getDate(),month:ev.date.getMonth(),year:ev.date.getFullYear(),isYearly:false,source:'email'};
    const updated=[...userEvents,newEv];
    setUserEvents(updated);
    localStorage.setItem('cal_user_events',JSON.stringify(updated));
    dismissPending(index);
  };

  const navigate=dir=>{let m=month+dir,y=year;if(m<0){m=11;y--;}else if(m>11){m=0;y++;}setMonth(m);setYear(y);};
  
  const handlePrint=()=>{
    const el=document.querySelector('.print-root');
    if(el)el.style.display='grid';
    setTimeout(()=>{window.print();setTimeout(()=>{if(el)el.style.display='none';},500);},100);
  };

  // ✅ FIX: logout sirf Gmail token clear kare, calendar data safe rahe
  const handleLogout=()=>{
    if(logout)logout();
    // Calendar data clear NAHI karo
  };

  const monthImages=["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1507666405895-422eee7d517f?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200","https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1200&q=80"];

  const daysInMonth=getDaysInMonth(year,month),firstDay=getFirstDay(year,month);
  const cells=Array(firstDay).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  const hasRange=startDate&&endDate;
  const selHoliday=activeDate?holidays[`${activeDate.getMonth()}-${activeDate.getDate()}`]:null;
  const selEvents=activeDate?userEvents.filter(ev=>ev.month===activeDate.getMonth()&&ev.day===activeDate.getDate()&&(ev.year===activeDate.getFullYear()||ev.isYearly)):[];
  const currentMemo=activeDate?(dailyNotes[`${activeDate.getFullYear()}-${activeDate.getMonth()}-${activeDate.getDate()}`]||''):'';
  const theme={bg:isDarkMode?'bg-slate-950 text-slate-100':'bg-[#F7F8FA] text-gray-900',cardBg:isDarkMode?'bg-slate-900 border-slate-800':'bg-white border-gray-100',modalBg:isDarkMode?'bg-slate-800 border-slate-700 text-white':'bg-white text-gray-900'};

  return(
    <div className={`min-h-screen ${theme.bg} py-10 px-4 md:px-10 flex flex-col items-center font-sans transition-colors duration-500`}>
      <style>{`@keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <PrintView month={month} year={year} today={today} startDate={startDate} endDate={endDate} cells={cells} holidays={holidays} userEvents={userEvents} dailyNotes={dailyNotes} activeDate={activeDate} monthImages={monthImages}/>

      {/* Header */}
      <div className="w-full max-w-[1200px] flex justify-between items-center mb-6 z-20 no-print">
        <h1 className="text-3xl font-serif font-bold italic tracking-tight opacity-90">WallCal</h1>
        <div className="flex gap-3 items-center flex-wrap">

          {/* Gmail buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={isConnected?()=>fetchEmailEvents():connectGmail}
              disabled={emailLoading}
              style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:20,fontSize:12,fontWeight:700,cursor:emailLoading?'not-allowed':'pointer',background:isConnected?(isDarkMode?'#1e3a5f':'#dbeafe'):(isDarkMode?'#1e293b':'#f1f5f9'),color:isConnected?(isDarkMode?'#60a5fa':'#2563eb'):(isDarkMode?'#94a3b8':'#64748b'),border:`1px solid ${isConnected?(isDarkMode?'#1e40af':'#bfdbfe'):(isDarkMode?'#334155':'#e2e8f0')}`,opacity:emailLoading?0.7:1}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              {emailLoading?'Scanning...':(isConnected?'Sync Gmail':'Connect Gmail')}
            </button>
            {isConnected&&(
              <button onClick={handleLogout} title="Disconnect Gmail" className="p-1.5 rounded-full hover:bg-rose-100 text-rose-500 transition-colors" style={{background:'none',border:'none',cursor:'pointer'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            )}
          </div>

          {emailError&&<span style={{fontSize:11,color:'#ef4444',maxWidth:200,lineHeight:1.3}}>{emailError}</span>}

          {/* Print */}
          <button onClick={handlePrint} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Print">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          </button>

          {/* Dark mode */}
          <button onClick={()=>setIsDarkMode(!isDarkMode)} className={`relative inline-flex items-center h-9 rounded-full w-18 transition-all duration-500 ${isDarkMode?'bg-slate-700':'bg-gray-300'}`}>
            <span className={`inline-block w-7 h-7 transform transition-transform duration-500 rounded-full flex items-center justify-center bg-white shadow-md ${isDarkMode?'translate-x-10':'translate-x-1'}`}><span className="text-sm">{isDarkMode?'🌙':'☀️'}</span></span>
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative no-print">

        {/* LEFT: Calendar */}
        <div className={`relative lg:col-span-8 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col border transition-all duration-500 ${theme.cardBg}`}>
          <div className="relative h-56 md:h-72 bg-cover bg-center transition-all duration-700" style={{backgroundImage:`url('${monthImages[month]}')`}}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
            <div className="absolute bottom-6 left-8 text-white">
              <h2 className="text-6xl md:text-7xl font-serif italic tracking-tight">{MONTHS[month]}</h2>
              <p className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase mt-2 opacity-80">{year}</p>
            </div>
          </div>
          <div className="p-8 pb-12">
            <div className="flex justify-between items-center mb-10">
              <button onClick={()=>navigate(-1)} className={`w-11 h-11 flex items-center justify-center rounded-full border transition-all ${isDarkMode?'border-slate-700 text-slate-400':'bg-white border-gray-100 text-gray-600'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
              <button onClick={()=>{setMonth(today.getMonth());setYear(today.getFullYear());setStartDate(null);setEndDate(null);}} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${isDarkMode?'bg-slate-800':'bg-gray-100'}`}>Today</button>
              <button onClick={()=>navigate(1)} className={`w-11 h-11 flex items-center justify-center rounded-full border transition-all ${isDarkMode?'border-slate-700 text-slate-400':'bg-white border-gray-100 text-gray-600'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg></button>
            </div>
            <div className="grid grid-cols-7 mb-4 text-center text-[11px] font-black uppercase tracking-widest text-gray-400 opacity-60">{DAYS.map(d=><div key={d}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-y-2 relative">
              {cells.map((day,i)=>{
                if(!day)return<div key={`empty-${i}`}/>;
                const d=new Date(year,month,day);
                const isToday=isSameDay(d,today),isStart=startDate&&isSameDay(d,startDate),isEnd=endDate&&isSameDay(d,endDate);
                const inRange=hasRange&&d>startDate&&d<endDate,isSelected=!hasRange&&activeDate&&isSameDay(d,activeDate);
                const hasHoliday=holidays[`${month}-${day}`],hasEvent=userEvents.some(ev=>ev.month===month&&ev.day===day&&(ev.year===year||ev.isYearly)),hasMemo=dailyNotes[`${year}-${month}-${day}`];
                let btnClass='relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-300 font-semibold text-sm z-10 ';
                if(isStart||isEnd)btnClass+='bg-indigo-600 text-white shadow-lg ';
                else if(inRange)btnClass+=`${isDarkMode?'bg-indigo-900/40 text-indigo-200':'bg-indigo-50 text-indigo-700'} rounded-none `;
                else if(isSelected)btnClass+='bg-indigo-600 text-white shadow-lg ';
                else if(isToday)btnClass+=`border-2 ${isDarkMode?'border-indigo-500 text-indigo-400':'border-indigo-200 bg-indigo-50 text-indigo-600'} `;
                else btnClass+=`${isDarkMode?'text-slate-200 hover:bg-slate-800':'text-gray-700 hover:bg-indigo-100/50'} `;
                const od=isStart||isEnd||isSelected;
                return(<div key={i} className="relative flex justify-center items-center py-1"><button onClick={()=>handleDayClick(day)} className={btnClass}>{day}<div className="absolute bottom-1.5 flex gap-1">{hasHoliday&&<span className={`w-1 h-1 rounded-full ${od?'bg-white':'bg-rose-500'}`}/>}{hasEvent&&<span className={`w-1 h-1 rounded-full ${od?'bg-white':'bg-teal-500'}`}/>}{hasMemo&&<span className={`w-1 h-1 rounded-full ${od?'bg-white':'bg-amber-500'}`}/>}</div></button></div>);
              })}
            </div>
          </div>
          <div className="absolute bottom-6 right-6 z-30">
            <button onClick={()=>setShowAddModal(true)} className="relative inline-flex items-center gap-2.5 px-7 py-4 rounded-full shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm">ADD EVENT</button>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Agenda */}
          <div className={`rounded-[2rem] shadow-xl p-8 min-h-[200px] flex flex-col border transition-all duration-500 ${theme.cardBg}`}>
            <h3 className="text-xl font-serif italic mb-6">Monthly Agenda</h3>
            <div className="space-y-3">
              {selHoliday&&(<div className={`p-4 rounded-xl border relative overflow-hidden ${isDarkMode?'bg-rose-950/30 border-rose-900/50':'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-100/50'}`}><p className="text-[10px] font-bold text-rose-400 mb-1">{activeDate.getDate()} {MONTHS[activeDate.getMonth()]}</p><p className={`font-bold text-lg ${isDarkMode?'text-rose-200':'text-rose-900'}`}>{selHoliday}</p></div>)}
              {selEvents.map(ev=>(<div key={ev.id} className={`p-3.5 rounded-xl border flex flex-col ${isDarkMode?'bg-slate-800/20':'bg-white/5'} shadow-sm`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">{ev.day} {MONTHS[ev.month]}</span>
                  {ev.source==='email'&&<span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:4,background:isDarkMode?'#1e3a5f':'#dbeafe',color:isDarkMode?'#60a5fa':'#2563eb'}}>EMAIL</span>}
                  {ev.isYearly&&<span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:4,background:isDarkMode?'#1c3a29':'#dcfce7',color:isDarkMode?'#4ade80':'#15803d'}}>YEARLY</span>}
                </div>
                <div className="flex justify-between items-center"><span className="font-semibold text-sm">{ev.title}</span><button onClick={()=>{setEventToDelete(ev.id);setShowDeleteModal(true);}} className="text-rose-500 text-xs">🗑</button></div>
              </div>))}
              {!selHoliday&&selEvents.length===0&&<p className="text-xs opacity-50 italic">No events scheduled.</p>}
            </div>
          </div>

          {/* Upcoming Reminders - hamesha dikhao */}
          <UpcomingRemindersPanel upcomingEvents={upcomingEvents} permission={permission} onRequestPermission={requestPermission} isDarkMode={isDarkMode}/>

          {/* Memo */}
          <div className={`rounded-[2rem] p-8 border shadow-xl transition-all duration-500 ${theme.cardBg} h-fit`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif italic">Memos</h3>
              <span className="text-[10px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg">{activeDate.getDate()} {MONTHS[activeDate.getMonth()]}</span>
            </div>
            <textarea value={currentMemo} onChange={e=>handleMemoChange(e.target.value)} placeholder="Write something..." className="w-full min-h-[100px] bg-transparent outline-none resize-none text-[0.95rem] opacity-80" style={{lineHeight:'1.6rem',backgroundImage:`repeating-linear-gradient(transparent,transparent calc(1.6rem - 1px),${isDarkMode?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'} calc(1.6rem - 1px),${isDarkMode?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'} 1.6rem)`,backgroundAttachment:'local'}}/>
          </div>
        </div>
      </div>

      {/* ✅ Reminder toasts - bottom right */}
      <div style={{position:'fixed',bottom:24,right:24,zIndex:70,display:'flex',flexDirection:'column-reverse',gap:10,maxWidth:340}}>
        {toasts.map(t=><ReminderToast key={t.id} toast={t} onDismiss={dismissToast} onSnooze={snoozeToast} isDarkMode={isDarkMode}/>)}
      </div>

      {/* ✅ Email tray - bottom left - hamesha render, component khud null return karta hai */}
      <EmailEventTray pendingEvents={pendingEvents} onConfirm={handleConfirmEmailEvent} onDismiss={dismissPending} onDismissAll={dismissAll} isLoading={emailLoading} isDarkMode={isDarkMode}/>

      {/* Add modal */}
      {showAddModal&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className={`rounded-3xl p-8 w-full max-w-sm shadow-2xl ${theme.modalBg}`}><h3 className="text-2xl font-bold mb-2">Create Event</h3><p className="text-sm opacity-60 mb-6">For {activeDate.getDate()} {MONTHS[activeDate.getMonth()]}</p><input type="text" autoFocus value={eventTitleInput} onChange={e=>setEventTitleInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSaveEvent()} placeholder="Title..." className={`w-full rounded-xl px-4 py-3 mb-4 outline-none border ${isDarkMode?'bg-slate-900 border-slate-700':'bg-gray-50 border-gray-200'}`}/><label className="flex items-center gap-3 mb-6 cursor-pointer"><input type="checkbox" checked={isYearlyInput} onChange={e=>setIsYearlyInput(e.target.checked)}/><span className="text-sm">Repeat Yearly</span></label><div className="flex gap-3"><button onClick={()=>setShowAddModal(false)} className={`flex-1 py-3.5 rounded-2xl font-bold ${isDarkMode?'bg-slate-800 text-slate-300':'bg-slate-100 text-slate-500'} hover:opacity-90 transition-all`}>Cancel</button><button onClick={handleSaveEvent} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:opacity-90 transition-all">Save</button></div></div></div>)}

      {/* Delete modal */}
      {showDeleteModal&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className={`rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center ${theme.modalBg}`}><h3 className="text-xl font-bold mb-8">Delete Event?</h3><div className="flex gap-3"><button onClick={()=>setShowDeleteModal(false)} className={`flex-1 py-3.5 rounded-2xl font-bold ${isDarkMode?'bg-slate-800 text-slate-300':'bg-slate-100 text-slate-500'} hover:opacity-90 transition-all`}>Cancel</button><button onClick={()=>{setUserEvents(userEvents.filter(ev=>ev.id!==eventToDelete));setShowDeleteModal(false);setEventToDelete(null);}} className="flex-1 py-3.5 rounded-2xl font-bold bg-rose-500 text-white hover:opacity-90 active:scale-95 transition-all">Delete</button></div></div></div>)}
    </div>
  );
}

export default App;