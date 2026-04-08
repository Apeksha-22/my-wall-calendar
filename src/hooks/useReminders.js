import { useState, useEffect, useCallback, useRef } from 'react';

// LocalStorage ki keys taaki snooze/dismiss ka data save rahe
const SNOOZE_KEY = 'cal_snoozed_reminders';
const DISMISSED_KEY = 'cal_dismissed_reminders';

// LocalStorage se data nikaalne ka helper function
function loadJson(key, fallback) {
  try { 
    const s = localStorage.getItem(key); 
    return s ? JSON.parse(s) : fallback; 
  } catch { return fallback; }
}

// ── Reminder kab-kab aana chahiye (Milliseconds mein) ────────────────────────
const REMINDER_WINDOWS = {
  '1h':    60 * 60 * 1000,       // 1 ghanta pehle
  '3h':    3 * 60 * 60 * 1000,   // 3 ghante pehle
  '1day':  24 * 60 * 60 * 1000,  // 1 din pehle
  '3days': 3 * 24 * 60 * 60 * 1000, // 3 din pehle
};

// Event ki date ko computer ke samajhne layak (Milliseconds) mein badalna
function eventDateToMs(ev) {
  // Hum maan ke chal rahe hain ki event subah 9 baje ka hai
  return new Date(ev.year, ev.month, ev.day, 9, 0, 0).getTime();
}

// Har reminder ke liye ek unique pehchaan (ID + time window)
function reminderKey(ev, window) {
  return `${ev.id}-${window}`;
}

// Aaj se event tak kitne din bache hain?
function daysUntil(ev) {
  const now = new Date();
  const evDate = new Date(ev.year, ev.month, ev.day);
  const diff = evDate.setHours(0,0,0,0) - now.setHours(0,0,0,0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── MAIN HOOK: Jo saari reminders handle karta hai ──────────────────────────
export function useReminders(userEvents) {
  // Browser se notification ki permission check karna
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  
  const [toasts, setToasts] = useState([]); // App ke andar dikhne wale chhote popups
  const [snoozed, setSnoozed] = useState(() => loadJson(SNOOZE_KEY, {})); // Snooze ki list
  const [dismissed, setDismissed] = useState(() => loadJson(DISMISSED_KEY, {})); // Band kiye gaye reminders
  const intervalRef = useRef(null); // Timer ko store karne ke liye

  // Jab bhi snooze ya dismiss change ho, use turant save kar lo
  useEffect(() => { localStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozed)); }, [snoozed]);
  useEffect(() => { localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed)); }, [dismissed]);

  // ── Browser se Notification mangne ka tarika ──────────────────────────────
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // ── Reminder chalane wala asli function (Notification + Audio/Toast) ───────
  const fireReminder = useCallback((ev, label) => {
    const title = `📅 Reminder: ${ev.title}`;
    const body = `${label} — ${ev.day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][ev.month]} ${ev.year}`;

    // Agar user ne permission di hai toh desktop notification dikhao
    if (permission === 'granted') {
      try {
        const n = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `wallcal-${ev.id}`, // Same event ke liye baar-baar notification na aaye
          requireInteraction: true, // Jab tak user click na kare, dikhta rahe
        });
        n.onclick = () => { window.focus(); n.close(); };
      } catch (e) { console.error("Notification failed", e); }
    }

    // App ke andar ek naya "Toast" (banner) add karo
    const toastId = Date.now() + Math.random();
    setToasts(prev => [
      { id: toastId, evId: ev.id, title: ev.title, label, day: ev.day, month: ev.month, year: ev.year },
      ...prev.slice(0, 4), // Ek baar mein 5 se zyada toast nahi dikhayenge
    ]);
  }, [permission]);

  // ── Check karne ka logic: "Kya abhi koi reminder dena hai?" ───────────────
  const checkReminders = useCallback(() => {
    const now = Date.now();

    userEvents.forEach(ev => {
      const evMs = eventDateToMs(ev);
      if (evMs < now - 60 * 60 * 1000) return; // Jo event 1 ghante se purana hai, use bhul jao

      const du = daysUntil(ev);
      const windows = [
        { key: '3days', ms: REMINDER_WINDOWS['3days'], label: 'In 3 days' },
        { key: '1day',  ms: REMINDER_WINDOWS['1day'],  label: 'Tomorrow' },
        { key: '3h',    ms: REMINDER_WINDOWS['3h'],    label: 'In 3 hours' },
        { key: '1h',    ms: REMINDER_WINDOWS['1h'],    label: 'In 1 hour' },
      ];

      windows.forEach(({ key, ms, label }) => {
        const rKey = reminderKey(ev, key);
        
        if (dismissed[rKey]) return; // Agar user ne 'OK' kar diya hai, toh dobara mat dikhao
        if (snoozed[rKey] && now < snoozed[rKey]) return; // Agar snooze period chal raha hai, toh wait karo

        const timeUntil = evMs - now;

        // Logic: Agar hum us 'time window' mein hain, toh dhamaka (reminder) karo!
        if (key === '3days' && du === 3) {
          fireReminder(ev, label);
          setDismissed(d => ({ ...d, [rKey]: true }));
        } else if (key === '1day' && du === 1) {
          fireReminder(ev, label);
          setDismissed(d => ({ ...d, [rKey]: true }));
        } else if (key === '3h' && timeUntil > 0 && timeUntil <= REMINDER_WINDOWS['3h'] && timeUntil > REMINDER_WINDOWS['1h']) {
          fireReminder(ev, label);
          setDismissed(d => ({ ...d, [rKey]: true }));
        } else if (key === '1h' && timeUntil > 0 && timeUntil <= REMINDER_WINDOWS['1h']) {
          fireReminder(ev, label);
          setDismissed(d => ({ ...d, [rKey]: true }));
        }
      });
    });
  }, [userEvents, dismissed, snoozed, fireReminder]);

  // Har 60 second mein check karo ki koi naya reminder toh nahi aaya
  useEffect(() => {
    checkReminders();
    intervalRef.current = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [checkReminders]);

  // ── Toast Actions (Dismiss/Snooze) ────────────────────────────────────────
  
  // Toast ko screen se hatana
  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // Reminder ko 15 minute ke liye "Snooze" kar dena
  const snoozeToast = useCallback((toastId, evId, minutes = 15) => {
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    
    // Dismissed list se hatao taaki agle check mein ye fir se fire ho sake
    setDismissed(d => {
      const next = { ...d };
      Object.keys(next).forEach(k => { if (k.startsWith(`${evId}-`)) delete next[k]; });
      return next;
    });

    // Snooze ka waqt set karo
    setSnoozed(s => {
      const next = { ...s };
      ['1h','3h','1day','3days'].forEach(w => { next[`${evId}-${w}`] = snoozeUntil; });
      return next;
    });
    
    dismissToast(toastId);
  }, [dismissToast]);

  // Agle 7 dinon mein aane wale events ki sorted list (UI ke liye)
  const upcomingEvents = userEvents
    .map(ev => ({ ...ev, daysUntil: daysUntil(ev) }))
    .filter(ev => ev.daysUntil >= 0 && ev.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return {
    permission,
    requestPermission,
    toasts,
    dismissToast,
    snoozeToast,
    upcomingEvents,
  };
}