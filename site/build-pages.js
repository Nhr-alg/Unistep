/**
 * UniStep topic-page generator
 *
 *   node build-pages.js
 *
 * Builds the indexable study pages under ./topics/. Every worked example is
 * solved by the real engine at build time — if a single example fails, the
 * build stops and nothing is written. A page can therefore never advertise an
 * answer the product cannot produce.
 *
 * Sitemap URLs need an absolute origin. Set SITE_URL when you deploy:
 *
 *   SITE_URL=https://your-domain.example node build-pages.js
 *
 * With SITE_URL unset the pages are still written, but sitemap.xml is skipped
 * rather than filled with a domain that does not exist.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE_ROOT = __dirname;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TOPICS_DIR = path.join(SITE_ROOT, 'topics');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');

// ---------------------------------------------------------------- engine

function loadEngine() {
    const sandbox = {
        window: {},
        console,
        Math,
        Number,
        parseFloat,
        parseInt,
        String,
        RegExp,
        Date,
        JSON,
        isFinite,
        NaN,
        Infinity,
        Array,
        Object
    };
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);

    for (const file of ['calculator.js', 'planner.js', 'solver_engine.js']) {
        const full = path.join(PROJECT_ROOT, file);
        vm.runInContext(fs.readFileSync(full, 'utf8'), sandbox, { filename: file });
    }
    return sandbox.window.SuperSolver;
}

const solver = loadEngine();

function solve(problem) {
    let result;
    try {
        result = solver.solve(problem, solver.extractNumbers(problem));
    } catch (err) {
        throw new Error(`Engine threw on "${problem}": ${err.message}`);
    }
    if (!result || !result.success) {
        throw new Error(`Engine could not verify "${problem}": ${result && result.error}`);
    }
    return result;
}

// The engine returns full float precision. Pages show engineering precision,
// which is the same rounding the app applies to its own results.
function displayValue(value) {
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) return String(value);
        if (Number.isInteger(value)) return String(value);
        return String(Number(value.toPrecision(6)));
    }
    const text = String(value);
    const numeric = Number(text);
    if (text.trim() !== '' && Number.isFinite(numeric) && /^-?\d+(\.\d+)?$/.test(text)) {
        if (Number.isInteger(numeric)) return String(numeric);
        return String(Number(numeric.toPrecision(6)));
    }
    return text;
}

function unitsLabel(units) {
    if (!units) return '';
    const clean = String(units).trim();
    return /^(n\/?a|none|dimensionless|-|ratio)$/i.test(clean) ? '' : clean;
}

// ------------------------------------------------------------------ topics

const TOPICS = [
    {
        slug: 'quadratic-equations',
        name: 'Quadratic equations',
        title: 'Quadratic equations: worked roots with steps',
        description: 'Solve quadratic equations with the discriminant and the quadratic formula, including complex roots, with every step shown.',
        intro: 'A quadratic equation has the form ax² + bx + c = 0. The discriminant b² − 4ac decides whether the roots are real and distinct, repeated, or complex. These examples show the full substitution rather than just the answer.',
        examples: [
            'Find the roots of x^2 + 5x + 6 = 0',
            'Find the roots of 2x^2 - 3x - 5 = 0'
        ],
        related: ['linear-equations', 'systems-of-equations']
    },
    {
        slug: 'linear-equations',
        name: 'Linear equations',
        title: 'Linear equations: solve for x with every step',
        description: 'Rearrange a linear equation by moving the constant and dividing by the coefficient, then check the answer by substitution.',
        intro: 'A linear equation describes a straight line and has exactly one solution. Isolating x reverses each operation in turn: remove the constant, then divide by the coefficient.',
        examples: [
            'Solve 3x - 7 = 11',
            'Solve 5x + 2 = -13'
        ],
        related: ['quadratic-equations', 'systems-of-equations']
    },
    {
        slug: 'systems-of-equations',
        name: 'Systems of two equations',
        title: '2×2 systems of equations by Cramer’s rule',
        description: 'Solve two linear equations in two unknowns with determinants, and see why a zero determinant means no unique solution.',
        intro: 'Two linear equations describe two lines. Their intersection is the single point satisfying both. Cramer’s rule finds it directly through the determinant of the coefficient matrix.',
        examples: [
            'Solve the system 2x + 3y = 8, x - y = 1',
            'Solve the system 3x + 2y = 12, x + 4y = 16'
        ],
        related: ['linear-equations', 'determinants']
    },
    {
        slug: 'derivatives',
        name: 'Derivatives of polynomials',
        title: 'Polynomial derivatives with the power rule',
        description: 'Differentiate each term of a polynomial with the power rule, including why constant terms disappear.',
        intro: 'The power rule differentiates each term independently: the exponent moves down as a multiplier and decreases by one. Constants vanish because their rate of change is zero.',
        examples: [
            'Find the derivative of 3x^3 + 2x^2 - 5x + 1',
            'Find the derivative of x^2'
        ],
        related: ['integrals', 'definite-integrals']
    },
    {
        slug: 'integrals',
        name: 'Indefinite integrals',
        title: 'Indefinite integrals of polynomials',
        description: 'Integrate polynomials term by term, raise the exponent, divide by the new exponent, and add the constant of integration.',
        intro: 'Integration reverses differentiation. Each term’s exponent increases by one and the coefficient is divided by the new exponent. The constant C covers every possible vertical shift of the family of curves.',
        examples: [
            'Find the integral of 3x^2 + 2x',
            'Find the integral of x^3 - 4x'
        ],
        related: ['derivatives', 'definite-integrals']
    },
    {
        slug: 'definite-integrals',
        name: 'Definite integrals',
        title: 'Definite integrals: evaluate between limits',
        description: 'Find the antiderivative, then subtract its value at the lower limit from its value at the upper limit.',
        intro: 'A definite integral accumulates a function between two limits. Evaluating the antiderivative at the upper limit and subtracting its value at the lower limit gives the exact signed area.',
        examples: [
            'Evaluate the integral of 2x + 3 from 0 to 2',
            'Evaluate the integral of x^2 from 1 to 3'
        ],
        related: ['integrals', 'derivatives']
    },
    {
        slug: 'determinants',
        name: 'Determinants',
        title: '2×2 and 3×3 determinants by cofactor expansion',
        description: 'Compute a determinant by expanding along the first row, and read what a zero determinant means geometrically.',
        intro: 'The determinant measures how a matrix scales area or volume. A zero determinant means the transformation collapses space onto a lower dimension, which is why singular matrices cannot be inverted.',
        examples: [
            'Find the determinant of [[1,2],[3,4]]',
            'Find the determinant of [[2,3,1],[4,1,2],[3,5,1]]'
        ],
        related: ['matrix-inverse', 'systems-of-equations']
    },
    {
        slug: 'matrix-inverse',
        name: 'Matrix inverse',
        title: 'Inverting a 2×2 matrix',
        description: 'Swap the diagonal, negate the off-diagonal, and divide by the determinant — with the singularity check shown.',
        intro: 'The inverse of a 2×2 matrix swaps the diagonal entries, negates the off-diagonal entries, and divides by the determinant. It exists only when the determinant is non-zero.',
        examples: [
            'Find the inverse of [[4,7],[2,6]]',
            'Find the inverse of [[3,1],[2,4]]'
        ],
        related: ['determinants']
    },
    {
        slug: 'unit-conversion',
        name: 'Unit conversion',
        title: 'Unit conversion by ratio, with the units cancelled',
        description: 'Convert between length, time, mass, speed, force, pressure, energy, power and volume units by multiplying by a ratio equal to one.',
        intro: 'Converting units multiplies by a ratio of conversion factors. Because the ratio equals one, the physical quantity is unchanged — only the number and its label are rewritten.',
        examples: [
            'Convert 90 km/h to m/s',
            'Convert 5 km to m'
        ],
        related: ['temperature-conversion']
    },
    {
        slug: 'temperature-conversion',
        name: 'Temperature conversion',
        title: 'Celsius, Kelvin and Fahrenheit conversions',
        description: 'Convert between Celsius, Kelvin and Fahrenheit by going through the absolute scale, so the offset is applied exactly once.',
        intro: 'Temperature scales have different zero points, so converting between them requires an offset as well as a scale factor. Converting through kelvin keeps the arithmetic in a single step.',
        examples: [
            'Convert 100 °C to °F',
            'Convert 300 K to °C'
        ],
        related: ['unit-conversion', 'sensible-heat']
    },
    {
        slug: 'ohms-law',
        name: "Ohm's law",
        title: "Ohm's law: current, voltage and resistance",
        description: 'Apply V = IR in all three rearrangements, with the known quantities identified before substitution.',
        intro: "Ohm's law relates voltage across a component to the current through it and its resistance. Any one of the three can be found from the other two.",
        examples: [
            'A voltage of 12 V across a resistance of 4 ohm. Find the current.',
            'A current of 2 A through a resistance of 5 ohm. Find the voltage.'
        ],
        related: ['series-parallel-resistors']
    },
    {
        slug: 'series-parallel-resistors',
        name: 'Series and parallel resistors',
        title: 'Equivalent resistance in series and parallel',
        description: 'Add resistances in series, add conductances in parallel, and check that a parallel result is smaller than the smallest branch.',
        intro: 'In series, the same current passes through every resistor, so voltage drops add and resistances sum. In parallel, every resistor sees the same voltage, so conductances add and the equivalent resistance is smaller than the smallest branch.',
        examples: [
            'Two resistors 4 ohm and 6 ohm in parallel',
            'Three resistors 4 ohm in series'
        ],
        related: ['ohms-law']
    },
    {
        slug: 'axial-stress',
        name: 'Axial stress',
        title: 'Normal stress from force and area',
        description: 'Convert force and area to base units, divide, and report the result in MPa or kPa.',
        intro: 'Normal stress is the internal force divided by the cross-sectional area it acts on. The same force over a smaller area produces a larger stress, which is why thin sections fail first.',
        examples: [
            'A force of 20000 N acts on an area of 0.00007854 m2. Find the stress.',
            'A force of 5000 N acts on an area of 0.001963 m2. Find the stress.'
        ],
        related: ['strain-and-youngs-modulus']
    },
    {
        slug: 'strain-and-youngs-modulus',
        name: "Strain and Young's modulus",
        title: "Strain and Young's modulus from a tensile test",
        description: 'Compute strain as change in length over original length, then take stress divided by strain to get the elastic modulus.',
        intro: "Young's modulus is the slope of the elastic part of the stress–strain curve. It links how hard a material is pushed to how much it stretches, independently of the component's size.",
        examples: [
            'Find the strain for an elongation of 2 mm over a length of 2 m',
            "Find Young's modulus for a force of 10000 N on an area of 0.0001 m2 with elongation 0.5 mm over a length of 1 m"
        ],
        related: ['axial-stress']
    },
    {
        slug: 'reynolds-number',
        name: 'Reynolds number',
        title: 'Reynolds number and flow regime',
        description: 'Compute Re from density, velocity, diameter and viscosity, then classify the flow as laminar, transitional or turbulent.',
        intro: 'The Reynolds number compares inertial forces to viscous forces. Below about 2300 viscous effects dominate and flow is laminar; above about 4000 inertia dominates and flow is turbulent.',
        examples: [
            'Find the Reynolds number for water at 2 m/s in a pipe of diameter 0.05 m',
            'Find the Reynolds number for air at 5 m/s in a pipe of diameter 0.1 m'
        ],
        related: ['bernoulli-equation']
    },
    {
        slug: 'bernoulli-equation',
        name: "Bernoulli's equation",
        title: "Bernoulli's equation: pressure change along a streamline",
        description: 'Use the horizontal form of Bernoulli’s equation to find the pressure change when a fluid accelerates or slows.',
        intro: "Along a streamline, pressure, kinetic energy per unit volume and gravitational potential energy per unit volume trade off against each other. Where the fluid speeds up, the pressure must fall.",
        examples: [
            'Using Bernoulli, water flows at v1 = 1 m/s and v2 = 3 m/s. Find the pressure drop.',
            'Using Bernoulli, water flows at v1 = 4 m/s and v2 = 1 m/s. Find the pressure change.'
        ],
        related: ['reynolds-number']
    },
    {
        slug: 'sensible-heat',
        name: 'Sensible heat',
        title: 'Sensible heat: q = mcΔT worked examples',
        description: 'Find the energy needed to change a material’s temperature, using its specific heat capacity and no phase change.',
        intro: "Sensible heat is the energy needed to change a substance's temperature without changing its phase. It depends on mass, the material's specific heat capacity, and the temperature rise.",
        examples: [
            'Find the heat required to raise 2 kg of water by 10 K',
            'Find the heat required to raise 1.5 kg of copper by 20 K'
        ],
        related: ['temperature-conversion']
    },
    {
        slug: 'projectile-motion',
        name: 'Projectile motion',
        title: 'Projectile range, maximum height and flight time',
        description: 'Resolve the launch velocity into components, then use constant-acceleration kinematics to find range, height or time of flight.',
        intro: 'Projectile motion separates into independent horizontal and vertical parts. Horizontally the velocity is constant; vertically gravity acts alone, which sets the flight time and the peak height.',
        examples: [
            'A projectile is launched at 20 m/s at 30 degrees. Find the range.',
            'A projectile is launched at 25 m/s at 45 degrees. Find the maximum height.'
        ],
        related: ['rolling-energy-ratio']
    },
    {
        slug: 'rolling-energy-ratio',
        name: 'Rolling energy ratios',
        title: 'Rotational to total kinetic energy for rolling bodies',
        description: 'Find the ratio of rotational to total kinetic energy for a rolling sphere, cylinder or ring from its moment of inertia.',
        intro: 'A body rolling without slipping shares its kinetic energy between translation and rotation. The split depends only on the shape, because the moment of inertia fixes the ratio I/(MR²).',
        examples: [
            'A solid sphere rolls without slipping. Find the ratio of rotational KE to total KE.',
            'A thin ring rolls without slipping. Find the ratio of rotational KE to total KE.'
        ],
        related: ['projectile-motion']
    },
    {
        slug: 'ideal-gas-law',
        name: 'Ideal gas law',
        title: 'Ideal gas law: pressure from moles, temperature and volume',
        description: 'Apply PV = nRT to find the pressure of a gas from its amount, temperature and volume.',
        intro: 'The ideal gas law combines the pressure, volume, amount and absolute temperature of a gas into one relation. Temperature must be in kelvin, because the law is defined from absolute zero.',
        examples: [
            'Calculate the pressure of 2 mol of an ideal gas at 300 K in 0.05 m3',
            'Calculate the pressure of 1 mol of an ideal gas at 350 K in 0.02 m3'
        ],
        related: ['sensible-heat']
    }
];

// ------------------------------------------------------------------ render

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function pageHead(topic) {
    const canonical = SITE_URL ? `\n    <link rel="canonical" href="${SITE_URL}/topics/${topic.slug}.html">` : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(topic.title)} — UniStep</title>
    <meta name="description" content="${escapeHtml(topic.description)}">
    <meta name="theme-color" content="#f4f1e8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'">
    <link rel="stylesheet" href="../styles.css">${canonical}
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23c24627'/%3E%3Cpath d='M14 50h12V38h12V26h12' stroke='%23f4f1e8' stroke-width='6' fill='none'/%3E%3C/svg%3E">
</head>
<body>
<header class="site-header">
    <div class="wrap header-inner">
        <a class="logo" href="../index.html" aria-label="UniStep home">
            <span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M4 19h5v-5h5V9h6"></path></svg></span>
            <span data-brand>UniStep</span>
        </a>
        <nav class="nav" aria-label="Main">
            <a href="../index.html#how">How it works</a>
            <a href="../index.html#pricing">Pricing</a>
            <a href="index.html">Topics</a>
            <a href="../verification.html">Verification</a>
        </nav>
        <a class="btn small primary" href="../index.html#waitlist">Join the beta</a>
    </div>
</header>
`;
}

function renderExample(problem, result) {
    const units = unitsLabel(result.units);
    const value = displayValue(result.result);
    const answer = units ? `${value} ${units}` : value;

    const steps = Array.isArray(result.steps) ? result.steps : [];
    const stepsHtml = steps.map((step) => `
                <li>
                    <strong>${escapeHtml(step.title || 'Step')}</strong>
                    <span>${escapeHtml(step.explanation || '')}</span>
                    ${step.formula ? `<code>${escapeHtml(step.formula)}</code>` : ''}
                </li>`).join('');

    const assumptions = Array.isArray(result.assumptions) && result.assumptions.length
        ? `\n            <p class="example-assumptions">Assumptions: ${escapeHtml(result.assumptions.join('; '))}</p>`
        : '';

    return `
        <article class="example">
            <p class="example-problem">${escapeHtml(problem)}</p>
            <p class="example-answer"><span>Answer</span> ${escapeHtml(answer)}</p>
            <ol class="example-steps">${stepsHtml}
            </ol>${assumptions}
        </article>`;
}

function renderTopicPage(topic, solved) {
    const examples = topic.examples
        .map((problem, index) => renderExample(problem, solved[index]))
        .join('');

    const related = topic.related
        .map((slug) => {
            const match = TOPICS.find((entry) => entry.slug === slug);
            return match ? `<a href="${match.slug}.html">${escapeHtml(match.name)}</a>` : '';
        })
        .filter(Boolean)
        .join('');

    return `${pageHead(topic)}
<main class="legal">
    <div class="wrap narrow">
        <p class="eyebrow">Worked examples</p>
        <h1>${escapeHtml(topic.name)}</h1>
        <p class="lede">${escapeHtml(topic.intro)}</p>
${examples}

        <div class="topic-cta">
            <p>Every answer above was produced by the same engine that runs in the app — not written by hand for this page.</p>
            <a class="btn primary" href="../demo/index.html">Try your own problem</a>
            <a class="btn ghost" href="../verification.html">See the test suite</a>
        </div>

        ${related ? `<nav class="topic-related" aria-label="Related topics"><span>Related</span>${related}</nav>` : ''}
    </div>
</main>

<footer class="site-footer">
    <div class="wrap footer-inner">
        <div>
            <a class="logo" href="../index.html" aria-label="UniStep home">
                <span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M4 19h5v-5h5V9h6"></path></svg></span>
                <span data-brand>UniStep</span>
            </a>
            <p class="footer-note">Verified engineering solutions. Built for learning, not shortcuts.</p>
        </div>
        <nav class="footer-links" aria-label="Legal">
            <a href="../privacy.html">Privacy</a>
            <a href="../terms.html">Terms</a>
            <a href="../verification.html">Verification</a>
            <a href="../security.html">Security</a>
        </nav>
    </div>
</footer>
</body>
</html>
`;
}

function renderIndex() {
    const cards = TOPICS.map((topic) => `
            <li>
                <a href="${topic.slug}.html">
                    <strong>${escapeHtml(topic.name)}</strong>
                    <span>${escapeHtml(topic.description)}</span>
                </a>
            </li>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Worked engineering examples — UniStep topics</title>
    <meta name="description" content="Worked examples for mechanics, materials, fluids, thermodynamics, circuits, calculus, linear algebra and unit conversion — each solved by the verified engine.">
    <meta name="theme-color" content="#f4f1e8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'">
    <link rel="stylesheet" href="../styles.css">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23c24627'/%3E%3Cpath d='M14 50h12V38h12V26h12' stroke='%23f4f1e8' stroke-width='6' fill='none'/%3E%3C/svg%3E">
</head>
<body>
<header class="site-header">
    <div class="wrap header-inner">
        <a class="logo" href="../index.html" aria-label="UniStep home">
            <span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M4 19h5v-5h5V9h6"></path></svg></span>
            <span data-brand>UniStep</span>
        </a>
        <nav class="nav" aria-label="Main">
            <a href="../index.html#how">How it works</a>
            <a href="../index.html#pricing">Pricing</a>
            <a href="index.html" aria-current="page">Topics</a>
            <a href="../verification.html">Verification</a>
        </nav>
        <a class="btn small primary" href="../index.html#waitlist">Join the beta</a>
    </div>
</header>

<main class="legal">
    <div class="wrap narrow">
        <p class="eyebrow">Topics</p>
        <h1>Worked examples, verified by the engine</h1>
        <p class="lede">Each page below shows complete working — the governing relation, every substitution, the result with its unit, and the assumptions that make it valid. The answers are generated by the same solver that runs in the app, so a page cannot promise a problem the product cannot solve.</p>

        <ul class="topic-grid">${cards}
        </ul>

        <div class="topic-cta">
            <p>Twenty topics and forty worked examples. The app covers more, and tells you when a problem falls outside the verified library.</p>
            <a class="btn primary" href="../demo/index.html">Open the demo</a>
        </div>
    </div>
</main>

<footer class="site-footer">
    <div class="wrap footer-inner">
        <div>
            <a class="logo" href="../index.html" aria-label="UniStep home">
                <span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M4 19h5v-5h5V9h6"></path></svg></span>
                <span data-brand>UniStep</span>
            </a>
            <p class="footer-note">Verified engineering solutions. Built for learning, not shortcuts.</p>
        </div>
        <nav class="footer-links" aria-label="Legal">
            <a href="../privacy.html">Privacy</a>
            <a href="../terms.html">Terms</a>
            <a href="../verification.html">Verification</a>
            <a href="../security.html">Security</a>
        </nav>
    </div>
</footer>
</body>
</html>
`;
}

// -------------------------------------------------------------------- build

function build() {
    // Verify every example before writing anything.
    const solved = new Map();
    let exampleCount = 0;

    for (const topic of TOPICS) {
        const results = topic.examples.map((problem) => {
            exampleCount += 1;
            return solve(problem);
        });
        solved.set(topic.slug, results);
    }

    fs.mkdirSync(TOPICS_DIR, { recursive: true });

    for (const topic of TOPICS) {
        const html = renderTopicPage(topic, solved.get(topic.slug));
        fs.writeFileSync(path.join(TOPICS_DIR, `${topic.slug}.html`), html, 'utf8');
    }
    fs.writeFileSync(path.join(TOPICS_DIR, 'index.html'), renderIndex(), 'utf8');

    if (SITE_URL) {
        const urls = [
            { loc: `${SITE_URL}/`, priority: '1.0' },
            { loc: `${SITE_URL}/topics/`, priority: '0.9' },
            { loc: `${SITE_URL}/verification.html`, priority: '0.8' },
            { loc: `${SITE_URL}/security.html`, priority: '0.6' },
            { loc: `${SITE_URL}/privacy.html`, priority: '0.3' },
            { loc: `${SITE_URL}/terms.html`, priority: '0.3' },
            ...TOPICS.map((topic) => ({ loc: `${SITE_URL}/topics/${topic.slug}.html`, priority: '0.7' }))
        ];

        const today = new Date().toISOString().slice(0, 10);
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
        fs.writeFileSync(path.join(SITE_ROOT, 'sitemap.xml'), sitemap, 'utf8');
        fs.writeFileSync(path.join(SITE_ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /data/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');
        console.log(`sitemap.xml written for ${SITE_URL}`);
    } else {
        console.log('SITE_URL not set — sitemap.xml and robots.txt skipped (no invented domain).');
    }

    console.log(`${TOPICS.length} topic pages, ${exampleCount} examples verified and written to ${TOPICS_DIR}`);
}

build();
