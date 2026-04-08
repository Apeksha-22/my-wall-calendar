// src/hooks/useEmailEvents.js
import { useState, useCallback, useEffect } from 'react';

const MONTH_MAP = {
  jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,
  may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,
  sep:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11,
};

const EVENT_KEYWORDS = [
  'meeting','interview','appointment','call','conference','webinar',
  'deadline','due date','demo','presentation','review','standup',
  'lunch','dinner','event','workshop','training','session','seminar',
];

const DATE_PATTERNS = [
  /(?:on\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)?,?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/gi,
  /(\d{1,2})(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?/gi,
  /\b(\d{4})-(\d{2})-(\d{2})\b/g,
  /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
  /\b(tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi,
];

function parseFoundDate(raw, today) {
  const lower = raw.toLowerCase().trim();
  if (lower === 'tomorrow') { const d = new Date(today); d.setDate(d.getDate() + 1); return d; }
  if (lower.startsWith('next ')) {
    const dayName = lower.replace('next ', '');
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const target = days.indexOf(dayName);
    if (target >= 0) { const d = new Date(today); const diff = (target - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + diff); return d; }
  }
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(parseInt(iso[1]), parseInt(iso[2])-1, parseInt(iso[3]));
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return new Date(parseInt(slash[3]), parseInt(slash[1])-1, parseInt(slash[2]));
  const parts = raw.replace(/,/g,'').split(/\s+/);
  let day, month, year = today.getFullYear();
  for (const p of parts) {
    const n = parseInt(p);
    if (!isNaN(n) && n > 31) { year = n; continue; }
    if (!isNaN(n) && n >= 1 && n <= 31) { day = n; continue; }
    const m = MONTH_MAP[p.toLowerCase().substring(0,3)];
    if (m !== undefined) month = m;
  }
  if (day && month !== undefined) return new Date(year, month, day);
  return null;
}

function extractEventsFromText(subject, body, today) {
  const text = `${subject}\n${body}`;
  const found = [];
  const seenDates = new Set();
  const allDates = [];
  for (const pattern of DATE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let m;
    while ((m = regex.exec(text)) !== null) { allDates.push({ raw: m[0], index: m.index }); }
  }
  for (const { raw, index } of allDates) {
    const date = parseFoundDate(raw, today);
    if (!date || date < today) continue;
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (seenDates.has(dateKey)) continue;
    seenDates.add(dateKey);
    const snippet = text.substring(Math.max(0, index - 80), index + 80);
    let title = subject.trim();
    for (const kw of EVENT_KEYWORDS) {
      if (snippet.toLowerCase().includes(kw)) {
        const sentences = snippet.split(/[.!?\n]/);
        for (const s of sentences) {
          if (s.toLowerCase().includes(kw) && s.trim().length > 5) {
            title = s.replace(raw, '').replace(/\s{2,}/g, ' ').trim();
            if (title.length > 60) title = title.substring(0, 60) + '...';
            break;
          }
        }
        break;
      }
    }
    found.push({ date, title: title || subject, source: 'email', raw });
  }
  return found;
}

function decodeBase64Url(str) {
  try {
    const b64 = str.replace(/-/g,'+').replace(/_/g,'/');
    return decodeURIComponent(atob(b64).split('').map(c => '%' + ('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  } catch { return ''; }
}

function getEmailBody(payload) {
  if (!payload) return '';
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64Url(part.body.data);
    }
    for (const part of payload.parts) { const nested = getEmailBody(part); if (nested) return nested; }
  }
  return '';
}

export function useEmailEvents() {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('gmail_token'));
  const [isConnected, setIsConnected] = useState(() => !!localStorage.getItem('gmail_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [error, setError] = useState(null);

  // ✅ FIX 1: fetchEmailEvents pehle define karo useCallback se
  const fetchEmailEvents = useCallback(async (token) => {
    const activeToken = token || localStorage.getItem('gmail_token');
    if (!activeToken) return;
    setIsLoading(true);
    setError(null);
    const today = new Date();
    try {
      const listRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=is:unread',
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      // ✅ FIX 2: 401 matlab token expire — cleanly handle karo
      if (listRes.status === 401) {
        localStorage.removeItem('gmail_token');
        setAccessToken(null);
        setIsConnected(false);
        setError('Session expire ho gayi. Dobara Connect Gmail karein.');
        setIsLoading(false);
        return;
      }
      const listData = await listRes.json();
      if (!listData.messages) { setIsLoading(false); return; }
      const allExtracted = [];
      await Promise.all(
        listData.messages.slice(0, 15).map(async ({ id }) => {
          try {
            const msgRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
              { headers: { Authorization: `Bearer ${activeToken}` } }
            );
            const msg = await msgRes.json();
            const subject = msg.payload?.headers?.find(h => h.name === 'Subject')?.value || '';
            const from = msg.payload?.headers?.find(h => h.name === 'From')?.value || '';
            const body = getEmailBody(msg.payload);
            const events = extractEventsFromText(subject, body, today);
            events.forEach(ev => allExtracted.push({ ...ev, from, emailId: id }));
          } catch {}
        })
      );
      const seen = new Set();
      const unique = allExtracted.filter(ev => {
        const key = `${ev.date.toDateString()}-${ev.title}`;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
      setPendingEvents(unique);
    } catch (e) {
      setError('Emails fetch nahi ho saki. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ FIX 3: useEffect ab fetchEmailEvents ke BAAD hai
  useEffect(() => {
    const savedToken = localStorage.getItem('gmail_token');
    if (savedToken) {
      setAccessToken(savedToken);
      setIsConnected(true);
      fetchEmailEvents(savedToken);
    }
  }, [fetchEmailEvents]);

  // ✅ FIX 4: redirect_uri = window.location.origin (no /oauth-callback path needed)
  const connectGmail = useCallback(() => {
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!CLIENT_ID) { setError('VITE_GOOGLE_CLIENT_ID .env mein set karein.'); return; }
    setPendingEvents([]);
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin,  // ✅ MAIN FIX: /oauth-callback nahi, sirf origin
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      prompt: 'select_account',
    });
    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      'gmail-auth', 'width=500,height=600,left=200,top=100'
    );
    if (!popup) { setError('Popup blocked! Browser settings mein popup allow karein.'); return; }
    const timer = setInterval(() => {
      try {
        if (popup.closed) { clearInterval(timer); return; }
        const url = popup.location.href;
        if (url.includes('access_token') || url.includes('error')) {
          clearInterval(timer);
          const hash = new URLSearchParams(popup.location.hash.slice(1));
          const token = hash.get('access_token');
          const err = hash.get('error');
          popup.close();
          if (err) {
            if (err === 'access_denied') setError('Permission deny kar di. Dobara try karein.');
            else setError(`Login error: ${err}`);
            return;
          }
          if (token) {
            localStorage.setItem('gmail_token', token);
            setAccessToken(token);
            setIsConnected(true);
            fetchEmailEvents(token);
          }
        }
      } catch {}
    }, 500);
  }, [fetchEmailEvents]);

  const dismissPending = useCallback((index) => {
    setPendingEvents(prev => prev.filter((_, i) => i !== index));
  }, []);

  const dismissAll = useCallback(() => setPendingEvents([]), []);

  // ✅ FIX 5: logout sirf Gmail data clear kare, calendar data nahi
  const logout = useCallback(() => {
    localStorage.removeItem('gmail_token');
    setAccessToken(null);
    setIsConnected(false);
    setPendingEvents([]);
    setError(null);
  }, []);

  return {
    isConnected,
    accessToken,
    isLoading,
    error,
    pendingEvents,
    connectGmail,
    fetchEmailEvents,
    logout,
    dismissPending,
    dismissAll,
  };
}