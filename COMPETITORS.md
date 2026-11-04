# UniStep — Competitive Analysis

Prepared 27 Oct 2026. Prices verified by fetching competitor pages on this date unless marked
"reported". UniStep scope verified by reading `calculator.js` and `solver_engine.js`.

---

## 1. Verdict in five lines

1. UniStep is **not** competing with Photomath or Symbolab. It cannot win there, and shouldn't try.
2. UniStep is competing in **four different markets** at once, and its strongest lane is the one it
   has built the least for: **tutoring centers**.
3. The real differentiator is **verification** — and verification only has monetary value where a
   wrong answer is expensive. That is FE/PE prep and paid tutoring, not homework.
4. The pricing is competitive ($9 vs $9.99 incumbents) but the **funnel is empty**: one indexable
   page, no app-store presence, no accounts.
5. **$1,000 MRR is reachable in ~90 days, but the shape is 6 centers + 45 students, not 112 students.**
   B2B is the shortest path and the product for it does not exist yet.

---

## 2. The competitive set (four arenas, not one)

| Arena | Who actually wins | UniStep's position |
|---|---|---|
| Consumer math solver | Photomath, Mathway, Symbolab | Weak — breadth + camera + app store are the moat |
| Engineering reference calculators | Omni Calculator, Engineering ToolBox | Niche — free + SEO wins; UniStep can win on *explanation*, not breadth |
| FE/PE exam prep | PPI (Kaplan), School of PE | Credible story, no content bank, no trust artifacts |
| Tutoring-center tooling | **Nobody at $99/mo** | **Open lane — this is the opportunity** |

The mistake to avoid is treating "competitors" as one list. Symbolab beating you on integrals is
irrelevant if your buyer is a tutoring center that needs 25 worksheet/key pairs by Friday.

---

## 3. Competitor table

| Competitor | Owner | Price (verified) | What they're actually good at | Where they're beatable |
|---|---|---|---|---|
| **Photomath** | Google | Free tier with steps; **Plus $9.99/mo or $69.99/yr** | Camera-first capture, 3-second answer, brand recognition, handwriting OCR | Math-only, unit-blind, no engineering context, no assumptions surfaced |
| **Mathway** | Chegg | Free ad-supported step-by-step; paid ad-free tier (price rendered at checkout, not static) | 5B+ problems solved, 11 subjects incl. physics & chemistry, photo upload | Ads on free tier, shallow "why", no unit tracking, no derivation quality |
| **Symbolab** | Learneo | Free tier; Pro subscription (price not on a crawlable page — set per region/promo) | Thousands of topic calculators, graphing, practice, cheat sheets, Chrome extension, 12 languages | Math-first; engineering word problems fall outside its grammar; no verification claim |
| **Wolfram\|Alpha Pro** | Wolfram | **$9.99/mo or $5.00/mo billed $60/yr** (student). Pro Premium **$12.00/mo or $8.25/mo billed $99/yr** | Actual computation engine, step-by-step, practice problems with hints, guided calculators, photo input in mobile apps | Opaque, intimidating, no teaching narrative, no engineering workflow, no worksheet output |
| **StudyX** | StudyX | Free + Pro | 16M+ students, 50+ subjects, notes/flashcards/quizzes/writing tools — a *study suite* | Breadth over depth; no verification; no B2B tooling |
| **Gauth** | ByteDance | Free + paid; AI + **24/7 human tutors** | Human escalation, 1.9M app ratings, huge distribution | Human tutors are a cost center; no engineering rigour; no unit checking |
| **Omni Calculator** | Omni | **3,938 free calculators**, ad-supported | SEO dominance, long-tail coverage, zero friction | No steps, no derivations, no teaching, no worksheets, ad-cluttered |
| **Engineering ToolBox** | Independent | Free, ad-supported | Reference tables engineers actually bookmark (fluid, HVAC, materials) | Dated UX, no solver, no explanations |
| **PPI (Kaplan)** | Kaplan | FE/PE bundles, discounts up to $700; university + corporate programs | Exam authority, question banks, institutional sales | $300–700 price point leaves a huge gap under it |
| **School of PE** | School of PE | **FE OnDemand from $349, PE from $499**; 94% claimed pass rate | Pass-rate marketing, structured courses, corporate partnerships | Expensive, course-shaped, not on-demand for a single stuck problem |

**UniStep today:** 11 formula families across 3 domains (moments of inertia ×4, pure rolling, KE
ratios, rough incline, rolling incline, uniform acceleration, ideal gas, pH, molarity, quadratic).
Client-side. Unit-aware. OCR. Local archive. No accounts, no sync.

---

## 4. Where UniStep is genuinely strong

These are defensible, not just nice.

**S1 — It refuses to guess.** I verified this directly: an unparseable equation returns "write it as
ax² + bx + c", not a confident wrong answer. Every LLM-based competitor (StudyX, Gauth, ChatGPT)
optimises for *always answering*. In an engineering context that is the single worst property a tool
can have. "Outside the verified library" is a feature, and it is the one thing a $9.99 incumbent
cannot copy without breaking their own UX promise.

**S2 — Units are tracked end to end.** Results come back as `16 m/s`, `3.206 m/s²`, `0.5 mol`;
meaningless units are hidden rather than printed as `N/A`. Photomath, Mathway and Symbolab are
math-first and treat units as decoration. This is the actual engineering wedge, and it's the reason
an engineering student would pick you over a better-funded app.

**S3 — Assumptions are surfaced.** "Constant acceleration", "pure rolling (no slipping)", "starts
from rest (u = 0)" appear as chips. This is pedagogically correct — most wrong answers in engineering
come from an unexamined assumption, not bad algebra — and essentially nobody else does it.

**S4 — Privacy by architecture.** No upload, no account required, computation in the browser. That is
a real procurement argument for a tutoring center handling minors' work, and a real trust argument
for a student. Competitors all require an account and a server round-trip.

**S5 — Price and shape.** $9 founding vs $9.99 for Photomath and Wolfram Pro; $29 per 4-month term
= **$7.25/mo effective**, the cheapest credible option in the category. The semester pass is a
genuinely good product idea — it matches how students actually buy (one term at a time).

**S6 — Worksheet + answer key from one verified source.** *If built*, this has no direct competitor
at $99/mo. Kuta/Math-Aids generate drills without derivations; LLM chat generates keys you can't
trust; Omni has no export. This is the strongest single idea in the whole product.

**S7 — Zero-friction archive.** Star/flag/tag locally, no signup wall. Small, but it's the kind of
thing that makes a tool feel like yours.

---

## 5. Where UniStep is weak

Ranked by whether it blocks the first $1,000 — not by how impressive the fix would be.

### G1 — You cannot take money (blocker, ~1 day to fix)
`site/config.js` still contains `REPLACE_WITH_STRIPE_PAYMENT_LINK` for all six plans and
`REPLACE_WITH_BOOKING_LINK` for the pilot. Pre-order clicks are recorded and routed to the waitlist.
No revenue is possible today. Everything below is theoretical until this is done.

### G2 — The $99/mo product does not exist (blocker for B2B)
This is the most important finding in this report. These are marketing claims with no implementation
anywhere in the codebase:

| Claim on site | Reality |
|---|---|
| "Generate worksheet and answer-key pairs" | No generator |
| "Export to PDF" | No PDF library, no export path |
| "LMS export (Canvas, Moodle)" | Nothing |
| "Timed practice mode" | No timer, no question bank |
| "Unlimited worksheet generation" | No worksheet feature at all |

Selling a $99/mo plan whose core feature is copy is not a growth problem, it's a refund-and-chargeback
problem, and in B2B it's a reputation problem that follows you into the next 20 sales calls. Either
build the generator or relabel the page as "pilot — we build it with you."

### G3 — Coverage stops at problem #2 (blocker for retention)
Eleven formula families. A first-year engineering student hits statics, circuits, thermodynamics,
fluids and calculus within the first month. The churn pattern in this category is brutal and specific:
the user's *second* problem fails, and they never come back. Coverage is not a "nice to have" here,
it is the retention curve. Priority families: statics (trusses, beams, friction), Ohm/Kirchhoff/RC,
thermo cycles and entropy, Bernoulli/Reynolds, stress–strain, matrices, derivatives/integrals,
unit conversion.

### G4 — No accounts, no sync (blocker for seats)
Everything is `localStorage`. That means: a lost laptop is a lost archive; a center cannot buy 10
seats and have them mean anything; there is no audit trail; there is no way to see whether a pilot
is being used. Seat-based B2B pricing requires server-side identity. This is also the prerequisite
for the "Department / 40 seats" tier.

### G5 — No acquisition surface (blocker for scale)
One indexable page. Omni has 3,938. Symbolab has thousands of solver pages. No app-store listing. For
a $9 consumer product, distribution *is* the product — a better solver nobody finds is a hobby.
The cheapest fix is not 3,938 pages, it's 20–30 honest "topic" pages that each solve one thing well
and rank for the long tail ("pH from hydrogen concentration calculator").

### G6 — No trust artifacts (blocker for FE/PE)
No testimonials, no pass rates, no university logos. The placeholder contact address has been
removed and a security page exists, but there is still no third-party evidence. FE buyers are
comparing you against "94% pass rate" and $349 courses; "verified" is a good claim but it needs
evidence attached. Do not invent that evidence — collect real pilot results first.

### G7 — No question bank (blocker for FE/PE)
FE/PE prep is a *content* business that happens to have software. You have a solver, not a bank.
$79 for a "full exam pack with lifetime updates" implies hundreds of calibrated problems per
discipline. Start with **one** discipline (FE Mechanical or FE Civil), not all of them.

### G8 — Missing table stakes for switchers
No graphing, no matrices, no calculus, no step editing, no multi-method solutions. Anyone coming from
Symbolab will notice within a minute. This is fine — it's a deliberate trade — but the landing page
should say so rather than let them discover it.

### G9 — Mobile capture is not the primary flow
Photomath's moat is camera → answer in three seconds. UniStep's OCR exists and works, but the
experience is desktop-shaped. Engineering students are on phones in class.

### G10 — No human escalation (do not build)
Gauth has 24/7 tutors. That's a labor business with labor margins. Partner or skip.

### G11 — Flying blind on funnel
"No third-party analytics" is a genuine strength — keep it. But you currently can't answer "how many
people reached pricing and left?" Add first-party, cookieless, aggregate counters (page → CTA →
waitlist) and say so in the privacy policy. Privacy and measurement are not in conflict if you
measure counts, not people.

---

## 6. The $1,000 MRR math

| Path | Units needed | Reality check |
|---|---|---|
| Students only, $9/mo | **112 subscribers** | At 3–5% free→paid, that's **2,200–3,700 signups** with no SEO, no app store, no ads. Hardest path. |
| Centers only, $99/mo | **11 centers** | At ~40% pilot→paid, ~28 pilots; at ~25% call→pilot, ~110 conversations. ~5–6 weeks at 20 calls/week. |
| **Blended (recommended)** | **6 centers + 45 students** | **$594 + $405 = $999/mo.** Centers pay the bills, students prove the product. |
| FE beta, $79 one-time | 13 packs | Not MRR, but $1,027 cash and a credibility asset. |

The asymmetry is the whole strategy: **one tutoring-center conversation is worth 11 student
signups.** Spend your time accordingly.

---

## 7. What each buyer actually compares

**Engineering student.** "Will this solve my actual homework tonight, for free, on my phone?"
Photomath wins on capture, Mathway wins on coverage, Symbolab wins on topic breadth, ChatGPT wins on
fluency. UniStep wins only on: *it tells me why, with units, and doesn't make things up.* That is a
real but narrow win — which is why students should be the second act, not the first.

**Tutoring center owner.** "Can I produce 25 worksheet/key pairs this week without my tutors burning
Sunday, and can I trust the keys?" Nobody serves this at $99/mo. The buyer is pragmatic, reachable by
email, and pays monthly. **This is the lane.**

**FE/PE candidate.** "Will this get me across the line in October?" They buy trust (pass rates,
instructor brands, question volume) and they buy it once, under time pressure, at $300–700. A $79
verified-solutions pack is a plausible wedge *under* PPI — but only with a real bank behind it.

---

## 8. Recommendations, sequenced

**Week 1 — make revenue possible and stop over-promising**
1. Replace all six Stripe placeholders and the booking link; buy the real domain and mailbox.
2. Rewrite the tutors/FE pages to match what exists (pilot-led: "we build the worksheet generator
   with your center over 14 days"). Never sell a feature that isn't built.
3. Add a trust block: who built it, what "verified" means, what it refuses to solve, refund policy.

**Weeks 2–4 — build the only product that has no competitor**
4. Worksheet generator: pick topic + difficulty + count → student sheet + instructor key with
   derivations, units, governing equation. PDF export. The solver already produces every ingredient;
   this is assembly, not research. Then run the 14-day pilots you're already advertising.

**Weeks 4–8 — coverage sprint, publicly**
5. Add 10–15 high-frequency first-year families, each with a golden test (the suite is 38 cases now;
   it should be 40+).
6. Publish a **coverage page**: exactly what UniStep can and cannot solve. Honesty is both the brand
   and the SEO strategy. Then 20–30 topic pages off that list.

**Weeks 6–10 — make seats real**
7. Magic-link accounts + server-side archive sync. Required before the $249 Department tier means
   anything, and it's the single biggest retention lever for students too.

**Parallel — sell**
8. 100–150 center conversations against the existing `site/outreach.md`. Target: 28 pilots → 11 paid.
9. Two student cohorts via department newsletters / Discord / subreddits → 45 founding subs.
10. Pick **one** FE discipline and build 150–200 calibrated problems before charging $79.

**Deliberately do not build:** a general CAS, a camera-first app clone, human tutors, an ad-supported
free tier, or 3,938 SEO calculators. Each is a way to lose to someone with more capital.

---

## 9. Sources and confidence

| Claim | Source | Confidence |
|---|---|---|
| Photomath Plus $9.99/mo, $69.99/yr | photomath.com price strings, 27 Oct 2026 | High |
| Wolfram Pro $9.99/mo or $5.00/mo @ $60/yr; Premium $12.00/mo or $8.25/mo @ $99/yr | wolframalpha.com/pro/pricing, 27 Oct 2026 | High |
| Omni 3,938 calculators, free/ad-supported | omnicalculator.com, 27 Oct 2026 | High |
| Mathway free step-by-step, 11 subjects, Chegg-owned | mathway.com | High |
| Mathway paid tier price | rendered client-side at checkout | Not verified — do not quote |
| Symbolab Pro price | not on any crawlable page | Not verified — do not quote |
| Symbolab feature set (AI solver, graphing, practice, extension, 12 languages) | symbolab.com | High |
| StudyX 16M+ students, 50+ subjects, study suite | studyx.ai | Medium (vendor claim) |
| Gauth AI + 24/7 human tutors, 1.9M ratings | gauth.com | Medium (vendor claim) |
| PPI discounts up to $700, university/corporate programs | ppi2pass.com | Medium (promotional) |
| School of PE FE from $349, PE from $499, 94% pass rate | schoolofpe.com | Medium (vendor claim) |
| UniStep scope: 11 formula families / 3 domains | `calculator.js`, `solver_engine.js` | High |
| Worksheet/PDF/LMS/timed features unimplemented | full-text search of all `.js`/`.html` | High |
| Stripe + booking placeholders | `site/config.js` | High |

Note: web search was unavailable in this session, so competitor prices come from fetching their own
pages. Two prices (Symbolab, Mathway) could not be verified and are deliberately left unquoted rather
than estimated.
