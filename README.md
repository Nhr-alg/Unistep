# UniStep

**Live product:** https://fantastic-conkies-3b8126.netlify.app

An early-stage browser-based engineering learning and problem-solving project. The source code and documentation are published here for transparency and feedback.

UniStep is a browser-based engineering problem solver that shows its work: the
governing principle, the derivation, and a unit check. It runs on the device, so
problems and photos are not uploaded to a solver service.

This repository contains two parts:

| Path | What it is |
|---|---|
| `index.html`, `app.js`, `solver_engine.js`, ... | The prototype solver (also served at `/demo/`) |
| `site/` | The landing page, waitlist API, local accounts, and validation docs |

## What the prototype actually covers

The verified library is intentionally focused, not an all-of-engineering claim.
The calculator covers selected first-year mechanics, algebra and calculus,
circuits, fluids, thermodynamics, chemistry, materials, and unit problems in
the 38 golden cases in `tests.js`. Theory mode has 22 curated introductory
concept explanations. These are a focused starting library, not all of
engineering. Unsupported calculation types and theory topics are identified
instead of guessed.

## Run the prototype

Open `index.html` in a modern browser, or serve the validation site:

```powershell
cd site
node server.js
```

- Landing page: http://localhost:8090
- Prototype: http://localhost:8090/demo/
- Health check: http://localhost:8090/healthz

No build step and no npm dependencies. Node 18+ is required for the server.

## The free limit

The prototype gives each browser **10 successful calculations**. After the
tenth, Solve mode, photo upload, example cards, and archive re-solve are locked;
Theory mode remains available. The count is stored in `localStorage` and synced
across tabs.

This is a product limit, not a security boundary. Clearing browser storage or
using devtools can reset it. A paid launch needs server-side accounts and
entitlements before charging money; the current checkout is deliberately closed.

## Tests

```powershell
node run-tests.js
```

The suite covers 38 golden solver cases plus theory lookup, coverage, and
unsupported-topic checks. The browser verification page covers solver examples
at `site/verification.html`.

## Docs

- `site/README.md` — run, measure, and deploy the validation site
- `site/VALIDATION.md` — demand hypotheses, channels, and targets
- `site/outreach.md` — outreach scripts (update the free-limit wording before use)
- `PAYMENTS.md` — what must be true before enabling checkout
- `ENGINE_ROADMAP.md` — current coverage, test standard, and expansion order
- `PUBLISH.md` — beginner-friendly publishing and business guide
- `COMPETITORS.md` — market notes and the path to $1,000 MRR
