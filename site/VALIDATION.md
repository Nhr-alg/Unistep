# Validation plan: $1k MRR, three tracks

The goal of this phase is **not** to build the product. It is to find out which of the three tracks will pay, at what price, before writing the real engine.

- Track A — Engineering students (B2C, $9/mo or $29/semester)
- Track B — Tutoring centers (B2B, $99/mo, free 14-day pilot)
- Track C — FE/PE candidates (one-time $79 pack or $19/mo)

One landing page tests all three, with separate links so the channels stay clean.

## What we are testing

| # | Hypothesis | Signal |
|---|---|---|
| H1 | Students will pay ~$9/mo for verified steps they can defend in an exam, not just answers. | 30+ signups and 5+ pre-order clicks in `students` |
| H2 | Tutoring centers will pay ~$99/mo for worksheet + verified answer-key generation. | 2+ pilots booked from 40 targeted emails |
| H3 | FE/PE candidates will pay $79 once for exam-format verified solutions. | 10+ signups and 3+ pre-order clicks in `fe` |

The product is not “another calculator.” It is **verified derivations with unit checking** — the thing generic solvers and chat models are worst at.

## Offer and pricing

- Students: free tier (10 verified solves per browser), $9/mo founding (50% off, locked 12 months), $29 per 4-month semester. Paid access is a waitlist until checkout and entitlements are live.
- Tutoring centers: free 14-day pilot (25 worksheet + key pairs), then $99/mo for a center, $249/mo for a department.
- FE/PE: $79 beta pack (lifetime updates) or $19/mo.
- Every paid plan: 14-day refund, no questions asked.

Why these numbers: at $9/mo you need ~111 students for $1k MRR. At $99/mo you need 10 centers. At $79 one-time you need 13 sales — but that is not recurring, so a mix is healthier:

```
60 students × $9        = $540
4 centers × $99         = $396
4 FE monthly × $19      =  $76
                          ----
                          $1,012 / month
```

## Funnel targets (14 days)

Read them with `node report.js`.

| Metric | Target | Meaning |
|---|---|---|
| Signup rate, community traffic | ≥ 15% | The offer resonates |
| Signup rate, cold/paid traffic | ≥ 8% | Acceptable for a niche tool |
| Pre-order click rate | ≥ 10% of visitors, or ≥ 25% of signups | Price is credible |
| Signups in one track | 30+ | Enough to build for |
| Tutor pilots | 2+ paid-intent pilots | B2B is alive |

A signup is an email. A pre-order click is a click on a paid plan (or a real Stripe Payment Link once configured). Interviews are worth more than either.

## 14-day execution

**Before day 1**

- Fill `config.js` with the brand and a real contact address. Only add Stripe Payment Links / a booking link once they are real; keep `paymentsLive: false` until then.
- Deploy to a Node host with a persistent disk (see `README.md`) and confirm `report.js` works on a test signup.
- Ask 10 friends or classmates to click through and report confusion. Fix obvious copy issues only.

**Days 1–3 — students**

- Post one honest build-log in r/EngineeringStudents or a course Discord (check rules first; ask mods where required).
- Post 2 short videos: “why the rolling-sphere ratio is 2/7” with the landing link in the bio.
- DM 5 course Discords asking permission to share a free beta, not spamming links.
- Target: 150 visitors, 15 signups.

**Days 4–6 — tutoring centers**

- Build a list of 40 local/small tutoring centers that cover physics, mechanics, or engineering.
- Send the email in `outreach.md`, personalised with the center name and courses.
- Offer the free 14-day pilot; ask for a 15-minute call.
- Target: 40 emails, 5 replies, 2 calls booked.

**Days 7–9 — FE/PE**

- Post in r/FE_Exam and one FE prep community where promotion is allowed.
- Share a sample exam-format problem with a full derivation.
- Target: 100 visitors, 8 signups, 2 pre-order clicks.

**Days 10–12 — interviews and second pass**

- Interview 5 signups (10 minutes each): what they currently use, what they paid for last, what would make them switch.
- Double down on the track with the best signup × price signal; send 20 more tutor emails if B2B is leading.
- Do not rewrite the product.

**Days 13–14 — decide**

- Run `node report.js`.
- Score each track: signups × price, plus pre-order clicks and pilot calls.
- Pick one track to build for. Park the others with a “coming later” note.

## Decision rules

**Build** if one track has 30+ signups and at least one of:

- 5+ pre-order clicks on a paid plan, or
- 2+ tutor pilot calls booked (B2B), or
- 3+ people ask “when can I pay?”

→ Build the smallest paid MVP for that track (see below).

**Iterate** if 10–29 signups but weak pre-orders:

- The audience is interested, the offer is not. Rewrite the hero around a concrete outcome (exam score, worksheet time saved), raise or lower the price, and test one new channel for 7 more days.

**Reposition or stop** if:

- Fewer than 10 signups after 300+ targeted visitors, or
- 30+ signups and zero pre-order clicks after a price test.

→ Do not build. Change audience or problem, keep the landing page, rerun.

## What to build after a positive signal

Only for the winning track. Four to six weeks:

1. Real solver for one course’s problem types (statics/dynamics if students, worksheet generation if tutors, exam sets if FE).
2. Auth + entitlements + Stripe subscriptions with webhooks.
3. Usage limits and a refund path.
4. 100 seeded problems for SEO and onboarding.
5. Analytics on activation (first solve → third solve → paid).
6. Support inbox and a public accuracy/changelog page.

Keep the prototype at `/demo/` as the marketing demo. Do not ship it as the paid engine.

## Budget

- Domain: ~$12/year.
- Hosting: $0–7/month to start.
- Email: free tier of a transactional provider.
- Ads: $0 during validation. At $9/mo, paid acquisition is usually underwater unless retention is proven. Spend on ads only after organic conversion is known.

## Risks and how to handle them

| Risk | Response |
|---|---|
| Academic-integrity backlash | Position as verification/learning; show steps; publish an integrity policy; never advertise “do my homework.” |
| Free competitors (Wolfram, Symbolab, Photomath, ChatGPT) | Compete on units, exam-style steps, and a narrow course, not on breadth. |
| FE seasonality | Run the FE test now for signal, but do not bet the company on a single exam window. |
| Small sample size | Interview signups; a 10-minute call beats 100 anonymous visits. |
| Payment links not ready | Pre-order clicks still measure intent, but a real $1 deposit is 10× stronger. |
| Data loss on free hosting | Download `data/*.jsonl` before redeploys or attach a disk. |

## The honest version

$1k MRR is a realistic target for a focused niche product with ~100 paying students or ~10 centers. It is not realistic for a generic calculator with no distribution. The code is maybe 20% of the work; the other 80% is choosing one audience, publishing useful examples, and talking to the people who sign up. This validation phase exists to make that choice with evidence instead of hope.
