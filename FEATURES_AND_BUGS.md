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
| **High**   | Live buzzer system not working                                  | The core real-time buzzer functionality is broken. Needs full investigation. |
| **High**   | Practice test scoring incorrect                                 | Scoring for both "questions" and "points" mode is reported as inaccurate. |
| **High**   | Question topics not saving on analytics page                    | Topics selected for questions are defaulting to "Other" and not saving correctly. |
| **High**   | Answer keys not working for preloaded tests                     | When preloading questions, the corresponding answer keys are not loading correctly. |
| **Medium** | Test Data error on analytics                                    | Unspecified error related to test data on the analytics page. |
| **Medium** | Missed questions not loading                                    | The feature to review missed questions is not working. |
| **Medium** | Points to questions toggle not working                          | The UI toggle to switch between scoring modes is broken. |
| **Medium** | Leaderboard not live updating                                   | The leaderboard does not update in real-time as users complete sessions. |
| **Low**    | Dark theme errors on LaTeX                                      | LaTeX rendering has display issues or glitches when the dark theme is active. |

---

### 🚀 **Future Features & Ideas**

- **Practice Missed Questions**: A dedicated mode to review and re-attempt questions that were previously answered incorrectly.
- **Expanded Test Library**: Add support for more standardized tests, such as MATHCOUNTS and AIME, to broaden the practice scope.
- **Host Customization for Live Buzzer**: Give session hosts more control over the live buzzer sessions, such as custom scoring, time limits, and rules.
- **Structured Courses**: Develop guided courses or learning paths that group questions by topic and difficulty to create a structured curriculum.
- **Countdown**:: Displays countdowns to the next AMC dates
