# 📅 WallCal – Interactive Wall Calendar

> A polished, feature-rich wall calendar built with **React 18 + Vite + Tailwind CSS** as part of a Frontend Engineering Assessment.

---

## 🖥️ Live Demo

> Run locally — steps below.

---

## ✨ Features

### Core Requirements ✅
| Feature | Details |
|---|---|
| **Wall Calendar Aesthetic** | Month-specific hero images (Unsplash), serif typography, warm color palette |
| **Day Range Selector** | Click start → click end. Visual states: selected (indigo), in-range (light indigo), today (border) |
| **Integrated Notes / Memos** | Per-date memo textarea with lined-paper effect. Auto-saved to `localStorage` |
| **Fully Responsive** | Desktop: 2-column grid. Mobile: single column stacked |

### Extra Features (Beyond Requirements) 🚀
| Feature | Details |
|---|---|
| **Gmail → Calendar Integration** | OAuth 2.0 login, scans unread emails for dates/events using regex, suggests adding to calendar |
| **Smart Reminders** | Browser Notification API + in-app toasts. Alerts at 3 days / 1 day / 3 hours / 1 hour before event |
| **Snooze & Dismiss** | Snooze reminders 15 min or 1 hour. State persisted in `localStorage` |
| **Indian Holidays** | Auto-fetched from Google Calendar API (Republic Day, Independence Day, Diwali, etc.) with red dot indicator |
| **Event Badges** | EMAIL badge for Gmail-sourced events, YEARLY badge for recurring events |
| **Dark / Light Theme** | Full dark mode via Tailwind. Preference saved in `localStorage` |
| **Print Support** | A4 landscape print layout with hero image, calendar grid, agenda, and memo |
| **Repeat Yearly Events** | Checkbox to mark events as yearly recurring |

---

## 🗂️ Project Structure

```
my-wall-calendar/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.jsx      # Day grid with range highlight logic
│   │   │   └── HeroSection.jsx       # Month hero image + title
│   │   └── notes/
│   │       └── NotesInput.jsx        # Lined textarea with localStorage
│   ├── hooks/
│   │   ├── useCalendarRange.js       # Start/end date selection logic
│   │   ├── useEmailEvents.js         # Gmail OAuth + email event extraction
│   │   └── useReminders.js           # Browser notification + toast system
│   ├── utils/
│   │   └── dateUtils.js              # MONTHS, DAYS, getDaysInMonth, isSameDay
│   ├── App.jsx                       # Main app — all state, UI, modals
│   ├── App.css                       # Legacy styles
│   ├── index.css                     # Tailwind + print media queries
│   └── main.jsx                      # React root
├── .env                              # API keys (not committed)
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Google Cloud Console account (for Gmail + Calendar features)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/my-wall-calendar.git
cd my-wall-calendar
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the project root:
```dotenv
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

**How to get these values — see section below.**

### 4. Run the app
```bash
npm run dev
```

Open **http://localhost:5173**

---

## 🔑 Google Cloud Console Setup

### Step 1 — Create a project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. New Project → name it `WallCal` → Create

### Step 2 — Enable APIs
Go to **APIs & Services → Library** and enable:
- ✅ **Gmail API**
- ✅ **Google Calendar API**

### Step 3 — Create API Key
**APIs & Services → Credentials → Create Credentials → API Key**

Copy this value → paste as `VITE_GOOGLE_API_KEY` in `.env`

### Step 4 — Create OAuth Client ID
**APIs & Services → Credentials → Create Credentials → OAuth Client ID**

- Application type: **Web application**
- Authorized JavaScript origins: `http://localhost:5173`
- Authorized redirect URIs: `http://localhost:5173`

Copy the Client ID → paste as `VITE_GOOGLE_CLIENT_ID` in `.env`

### Step 5 — OAuth Consent Screen
**APIs & Services → OAuth consent screen**
- User type: External
- App name: WallCal
- Add your email as test user

---

## ⚠️ Important Note for Evaluators — "This app isn't verified"

This project includes **Google OAuth 2.0 authentication** and **Gmail API integration** as an additional feature beyond the core assessment requirements. It demonstrates practical knowledge of OAuth flows, API integration, and real-world frontend architecture.

Since the app is in **development / testing mode**, Google shows this warning during login:

> *"This app isn't verified"*

This is **completely normal** for apps that have not completed Google's production verification process.

### To proceed during evaluation:
1. Click **"Advanced"**
2. Click **"Go to WallCal (unsafe)"**
3. Grant the requested permissions

This warning does **not** affect functionality. Gmail sync, event detection, and calendar integration all work as intended.

### Why verification is not completed:
Production verification requires a live domain, a hosted Privacy Policy, and Google's manual review — steps that are outside the scope of this frontend assessment.

---

## 📱 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| `lg` ≥ 1024px | 2-column: Calendar (8 cols) + Agenda/Notes (4 cols) |
| `md` 768–1023px | Adapted, hero image height reduces |
| `< 768px` | Single column, all sections stacked vertically |

---

## 🗓️ How Gmail Integration Works

1. Click **"Connect Gmail"** in the header
2. Google OAuth popup opens → user grants `gmail.readonly` permission
3. App fetches last 25 unread emails via Gmail API
4. Each email's subject + body is scanned with regex patterns for:
   - Named dates: `January 15`, `15th Jan`, `15/04/2025`, `2025-04-15`
   - Relative dates: `tomorrow`, `next Monday`
   - Event keywords: `meeting`, `interview`, `deadline`, `appointment`, etc.
5. Detected events appear in a **bottom-left tray**
6. User clicks **"✓ Add to Calendar"** → event is saved with an `EMAIL` badge
7. Token is persisted in `localStorage` — no re-login needed on refresh

---

## 🔔 How Reminders Work

- Every **60 seconds**, the app checks upcoming events
- Reminders fire at: **3 days before**, **1 day before**, **3 hours before**, **1 hour before**
- **Browser notification** shown if permission is granted (click "Enable alerts")
- **In-app toast** appears bottom-right with Snooze (15m / 1h) and Dismiss options
- Snooze/dismiss state is saved in `localStorage` — survives page refresh

---

## 🖨️ Print Feature

Click the **print icon** in the header to open the browser print dialog.

Output is A4 landscape with:
- Month hero image with title overlay
- Full calendar grid with all visual states
- Monthly agenda (holidays + events) for selected date
- Memo for selected date
- Color legend

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS v4 |
| Auth | Google OAuth 2.0 (Implicit Flow) |
| APIs | Gmail API v1, Google Calendar API v3 |
| Data Persistence | localStorage |
| Notifications | Browser Notification API |
| Images | Unsplash (month-specific landscape photos) |
| Fonts | DM Sans, Playfair Display (via Google Fonts) |

---

## 📦 Key Design Decisions

**Why `localStorage` and not a database?**
This is a frontend-only assessment. `localStorage` provides persistence without requiring a backend, database, or deployment infrastructure.

**Why Implicit OAuth flow (not Authorization Code)?**
Authorization Code flow with refresh tokens requires a backend server to securely store `client_secret`. Since this is a pure frontend app, Implicit flow (direct `access_token`) is the correct and standard approach.

**Why no `react-router`?**
The app is single-page with no URL-based navigation needed. Adding a router would add unnecessary complexity.

---

## 🤝 Evaluation Criteria Coverage

| Criteria | How it's addressed |
|---|---|
| Code Quality | Modular hooks (`useEmailEvents`, `useReminders`, `useCalendarRange`), clean component separation |
| Component Architecture | PrintView, ReminderToast, EmailEventTray, UpcomingRemindersPanel all isolated |
| CSS / Styling | Tailwind utility classes + CSS custom properties + `@media print` in `index.css` |
| State Management | `useState` + `localStorage` sync via `useEffect` — no unnecessary global state |
| UX / UI Details | Dot indicators, badge labels, hover states, dark mode, toast animations |
| Responsive Design | Tailwind breakpoints `lg:col-span-8`, `grid-cols-1 lg:grid-cols-12` |

---

*Built with ❤️ for the Frontend Engineering Assessment*