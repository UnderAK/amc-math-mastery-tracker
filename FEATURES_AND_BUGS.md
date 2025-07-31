Below is a comprehensive, up-to-date list of **features** and **known bugs / limitations** for the AMC Math Mastery Tracker. Everything is grouped so you can quickly scan what’s already built versus what still needs attention.

---

### ✅ **Current Features (Production Ready)**

| Category | Highlights |
|---|---|
| **Core Tracking** | • Log AMC 8, AMC 10, AMC 12, and custom tests  <br>• Automatic score calculation (points vs questions) <br>• Per-test metadata: date, type, duration, difficulty |
| **Analytics & Stats** | • Total tests, last date, average, best/worst, improvement %, consistency %, recent trend <br>• XP & leveling system (XP per correct answer, streak bonuses) <br>• Badges for milestones (first test, 5-day streak, 90 %+ accuracy, etc.) |
| **Gamification** | • Animated streak counter with flame icon <br>• Progress bar toward next level <br>• Confetti on personal-best scores |
| **UI / UX** | • Liquid-glass design with subtle transparency & blur <br>• Blue primary accent + playful pink backgrounds on key panels <br>• Responsive layout (mobile → desktop) <br>• Hover-lift, slide-in, and wiggle micro-animations |
| **Data & Sync** | • Import / export progress as JSON (works offline) <br>• Supabase integration with graceful fallback to localStorage <br>• Guest mode if env vars missing |
| **Robustness** | • Global ErrorBoundary catches runtime crashes <br>• NaN-safe calculations (fixed all known divide-by-zero) <br>• AMC 8 tests always display “questions” mode regardless of global toggle |
| **Reporting** | • Generate and download PDF progress reports with stats and test history |
| **Accessibility** | • Keyboard-navigable buttons & links <br>• Tooltips with aria-labels <br>• High-contrast focus rings |

---

### 🚧 **Known Bugs & Limitations**

| Severity | Issue | Notes / Work-around |
|---|---|---|
| **Medium** | Score calculation is incorrect on "Enter Test" page | 
| **Medium** | Missing source maps in production | Stack traces are minified; use dev build for debugging. |
| **Low** | Edge-case import/export quirks | Malformed JSON or partial overwrites can corrupt state—manual JSON repair needed. |
| **Medium** | No multi-user auth | Only single-user via localStorage or single Supabase project. |
| **Low** | No PWA/offline mode | Requires service-worker setup for true offline installability. |
| **Low** | Missing avatar support | Profile limited to name & preferences only. |
| **Low** | Accessibility gaps | Some ARIA roles and keyboard shortcuts could be richer. |

---

### 🚀 **Quick Wins / Next Ideas**
If you want to expand further:
- Add **dark-mode toggle** (already uses CSS variables).  
- Introduce **leaderboards** (needs multi-user auth).  
- Support **custom problem tags** (algebra, geometry, etc.) for granular analytics.  
- Add **calendar heat-map** of test days.  

