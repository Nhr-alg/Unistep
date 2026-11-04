/**
 * UniStep Worksheet Studio
 *
 * Generates student sheets and instructor answer keys from the same verified
 * solver that powers the chat. A generator only writes the *question*; the
 * answer, units and derivation always come from SuperSolver, so a key can
 * never drift away from the engine that produced it.
 *
 * Deterministic: the same seed always produces the same sheet, which is what
 * makes "regenerate this worksheet" and reproducible keys possible.
 */

(function () {
    'use strict';

    const fmt = (value, digits = 4) => {
        if (!Number.isFinite(value)) return String(value);
        if (Number.isInteger(value)) return String(value);
        return String(Number(value.toPrecision(digits)));
    };

    // Small, fast, seedable PRNG. Not cryptographic — it only needs to be
    // reproducible so a teacher can regenerate the same sheet.
    function mulberry32(seed) {
        let state = seed >>> 0;
        return function random() {
            state += 0x6D2B79F5;
            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const int = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
    const pick = (rng, list) => list[Math.floor(rng() * list.length)];
    const signed = (value) => (value < 0 ? `- ${Math.abs(value)}` : `+ ${Math.abs(value)}`);

    const TOPICS = [
        {
            id: 'quadratic',
            label: 'Quadratic equations',
            domain: 'Algebra',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const span = level === 'Foundation' ? 5 : level === 'Standard' ? 9 : 14;
                const r1 = int(rng, -span, span) || 1;
                const r2 = int(rng, -span, span) || -2;
                if (r1 === r2) return null;
                const b = -(r1 + r2);
                const c = r1 * r2;
                const a = level === 'Challenge' && rng() > 0.6 ? int(rng, 2, 3) : 1;
                const prompt = a === 1
                    ? `Find the roots of x^2 ${signed(b)}x ${signed(c)} = 0`
                    : `Find the roots of ${a}x^2 ${signed(b * a)}x ${signed(c * a)} = 0`;
                return prompt;
            }
        },
        {
            id: 'linear',
            label: 'Linear equations',
            domain: 'Algebra',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const span = level === 'Foundation' ? 6 : 12;
                const a = int(rng, 2, level === 'Challenge' ? 12 : 8);
                const x = int(rng, -span, span) || 3;
                const b = int(rng, -20, 20);
                const c = a * x + b;
                return `Solve ${a}x ${signed(b)} = ${c}`;
            }
        },
        {
            id: 'system',
            label: 'Systems of two equations',
            domain: 'Algebra',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const span = level === 'Foundation' ? 4 : 8;
                const x = int(rng, -span, span) || 2;
                const y = int(rng, -span, span) || 1;
                const a1 = int(rng, 1, 5);
                const b1 = int(rng, 1, 5);
                const a2 = int(rng, 1, 5);
                const b2 = int(rng, -5, -1);
                const det = a1 * b2 - a2 * b1;
                if (Math.abs(det) < 1) return null;
                return `Solve the system ${a1}x ${signed(b1)}y = ${a1 * x + b1 * y}, ${a2}x ${signed(b2)}y = ${a2 * x + b2 * y}`;
            }
        },
        {
            id: 'derivative',
            label: 'Derivatives',
            domain: 'Calculus',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const degree = level === 'Foundation' ? 2 : level === 'Standard' ? 3 : 4;
                const terms = [];
                for (let power = degree; power >= 0; power -= 1) {
                    const coef = int(rng, -6, 6) || 1;
                    if (power === 0) terms.push(`${signed(coef)}`);
                    else if (power === 1) terms.push(`${signed(coef)}x`);
                    else terms.push(`${signed(coef)}x^${power}`);
                }
                const expression = terms.join(' ').replace(/^\+ /, '');
                return `Find the derivative of ${expression}`;
            }
        },
        {
            id: 'integral',
            label: 'Indefinite integrals',
            domain: 'Calculus',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const degree = level === 'Foundation' ? 2 : level === 'Standard' ? 3 : 4;
                const terms = [];
                for (let power = degree; power >= 0; power -= 1) {
                    const coef = int(rng, -5, 5) || 1;
                    if (power === 0) terms.push(`${signed(coef)}`);
                    else if (power === 1) terms.push(`${signed(coef)}x`);
                    else terms.push(`${signed(coef)}x^${power}`);
                }
                const expression = terms.join(' ').replace(/^\+ /, '');
                return `Find the integral of ${expression}`;
            }
        },
        {
            id: 'matrix',
            label: '2×2 determinants',
            domain: 'Linear Algebra',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const span = level === 'Foundation' ? 5 : 9;
                const a = int(rng, -span, span) || 2;
                const b = int(rng, -span, span) || 3;
                const c = int(rng, -span, span) || 1;
                const d = int(rng, -span, span) || 4;
                if (a * d - b * c === 0) return null;
                return `Find the determinant of [[${a},${b}],[${c},${d}]]`;
            }
        },
        {
            id: 'ph',
            label: 'pH from concentration',
            domain: 'Chemistry',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const exponent = level === 'Foundation' ? int(rng, 1, 5) : int(rng, 1, 9);
                const mantissa = level === 'Challenge' ? pick(rng, [1.5, 2.5, 5]) : 1;
                const concentration = mantissa * Math.pow(10, -exponent);
                return `Calculate the pH of a solution with hydrogen concentration ${concentration.toExponential(2).replace('e', 'e')}`;
            }
        },
        {
            id: 'moles',
            label: 'Moles from mass',
            domain: 'Chemistry',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const molarMass = int(rng, 10, level === 'Foundation' ? 40 : 120);
                const moles = level === 'Foundation' ? int(rng, 1, 5) : Math.round((rng() * 2 + 0.2) * 100) / 100;
                const mass = moles * molarMass;
                return `Find the moles of a substance with mass ${fmt(mass, 6)}g and molar mass ${molarMass}g/mol.`;
            }
        },
        {
            id: 'idealGas',
            label: 'Ideal gas law',
            domain: 'Thermodynamics',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const moles = level === 'Foundation' ? int(rng, 1, 4) : Math.round(rng() * 3 * 10) / 10 + 0.2;
                const temperature = int(rng, 280, 340);
                const volume = level === 'Foundation' ? pick(rng, [0.02, 0.05, 0.1]) : Math.round((rng() * 0.18 + 0.02) * 1000) / 1000;
                return `Calculate the pressure of ${fmt(moles)} mol of an ideal gas at ${temperature} K in ${volume} m3`;
            }
        },
        {
            id: 'kinematics',
            label: 'Uniform acceleration',
            domain: 'Mechanics',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const acceleration = level === 'Foundation' ? int(rng, 1, 5) : Math.round((rng() * 8 + 1) * 10) / 10;
                const time = int(rng, 2, level === 'Foundation' ? 8 : 20);
                return `A car starts from rest and accelerates at ${fmt(acceleration)} m/s^2 for ${time} seconds. Find the final velocity.`;
            }
        },
        {
            id: 'incline',
            label: 'Motion on a rough incline',
            domain: 'Dynamics',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const angle = int(rng, 15, 45);
                const mu = level === 'Foundation' ? 0 : Math.round(rng() * 0.5 * 100) / 100;
                return `Find the acceleration of a block sliding down a rough incline at ${angle} degrees with friction coefficient ${mu}.`;
            }
        },
        {
            id: 'rolling',
            label: 'Rolling energy ratios',
            domain: 'Rotation',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng) {
                const shape = pick(rng, ['solid sphere', 'hollow sphere', 'solid cylinder', 'thin ring']);
                return `A ${shape} rolls without slipping. Find the ratio of rotational KE to total KE.`;
            }
        },
        {
            id: 'ohm',
            label: "Ohm's law",
            domain: 'Circuits',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const voltage = level === 'Foundation' ? int(rng, 2, 24) : int(rng, 5, 240);
                const resistance = level === 'Foundation' ? pick(rng, [2, 4, 5, 10]) : int(rng, 2, 60);
                return `A voltage of ${voltage} V across a resistance of ${resistance} ohm. Find the current.`;
            }
        },
        {
            id: 'resistors',
            label: 'Series and parallel resistors',
            domain: 'Circuits',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const first = int(rng, 2, level === 'Foundation' ? 12 : 40);
                const second = int(rng, 2, level === 'Foundation' ? 12 : 40);
                const mode = pick(rng, ['parallel', 'series']);
                return `Two resistors ${first} ohm and ${second} ohm in ${mode}`;
            }
        },
        {
            id: 'stress',
            label: 'Axial stress',
            domain: 'Materials',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const force = level === 'Foundation' ? int(rng, 1, 20) * 1000 : int(rng, 1, 200) * 1000;
                const area = pick(rng, [0.00007854, 0.0003142, 0.0007069, 0.001963]);
                return `A force of ${force} N acts on an area of ${area} m2. Find the stress.`;
            }
        },
        {
            id: 'reynolds',
            label: 'Reynolds number',
            domain: 'Fluids',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const velocity = level === 'Foundation' ? int(rng, 1, 4) : Math.round((rng() * 4 + 0.5) * 10) / 10;
                const diameter = pick(rng, [0.02, 0.05, 0.08, 0.1, 0.15]);
                return `Find the Reynolds number for water at ${fmt(velocity)} m/s in a pipe of diameter ${diameter} m`;
            }
        },
        {
            id: 'projectile',
            label: 'Projectile range',
            domain: 'Kinematics',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const speed = level === 'Foundation' ? int(rng, 5, 25) : int(rng, 10, 60);
                const angle = int(rng, 15, 75);
                const ask = pick(rng, ['range', 'maximum height', 'time of flight']);
                return `A projectile is launched at ${speed} m/s at ${angle} degrees. Find the ${ask}.`;
            }
        },
        {
            id: 'units',
            label: 'Unit conversion',
            domain: 'Units',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const options = [
                    () => `Convert ${int(rng, 10, 120)} km/h to m/s`,
                    () => `Convert ${int(rng, 1, 50)} km to m`,
                    () => `Convert ${int(rng, 1, 20)} m to cm`,
                    () => `Convert ${int(rng, 1, 20)} kg to g`,
                    () => `Convert ${int(rng, 1, 40) * 10} kPa to Pa`,
                    () => `Convert ${int(rng, 1, 20)} bar to kPa`,
                    () => `Convert ${int(rng, 1, 30)} kJ to J`
                ];
                return pick(rng, options)();
            }
        },
        {
            id: 'heat',
            label: 'Sensible heat',
            domain: 'Thermodynamics',
            levels: ['Foundation', 'Standard', 'Challenge'],
            generate(rng, level) {
                const mass = level === 'Foundation' ? int(rng, 1, 5) : Math.round((rng() * 5 + 0.5) * 10) / 10;
                const delta = int(rng, 5, 40);
                const material = pick(rng, ['water', 'aluminium', 'copper', 'steel']);
                return `Find the heat required to raise ${fmt(mass)} kg of ${material} by ${delta} K`;
            }
        }
    ];

    const TOPIC_BY_ID = TOPICS.reduce((map, topic) => {
        map[topic.id] = topic;
        return map;
    }, {});

    function solveVerified(prompt) {
        if (!window.SuperSolver || typeof window.SuperSolver.solve !== 'function') return null;
        try {
            const numbers = window.SuperSolver.extractNumbers(prompt);
            const result = window.SuperSolver.solve(prompt, numbers);
            return result && result.success ? result : null;
        } catch (err) {
            console.error('Worksheet generator: solver threw on', prompt, err);
            return null;
        }
    }

    function build(options) {
        const settings = options || {};
        const topicIds = Array.isArray(settings.topics) && settings.topics.length
            ? settings.topics
            : TOPICS.map((topic) => topic.id);
        const count = Math.max(1, Math.min(40, Number(settings.count) || 10));
        const level = settings.level || 'Standard';
        const seed = Number(settings.seed) || Date.now();
        const rng = mulberry32(seed);

        const problems = [];
        const seen = new Set();
        const attempts = count * 25;

        for (let i = 0; i < attempts && problems.length < count; i += 1) {
            const topicId = pick(rng, topicIds);
            const topic = TOPIC_BY_ID[topicId];
            if (!topic) continue;

            let prompt;
            try {
                prompt = topic.generate(rng, level);
            } catch (err) {
                prompt = null;
            }
            if (!prompt || seen.has(prompt)) continue;

            const result = solveVerified(prompt);
            if (!result) continue;

            seen.add(prompt);
            problems.push({
                topicId: topic.id,
                topic: topic.label,
                domain: topic.domain,
                level,
                prompt,
                answer: result.result,
                units: result.units,
                steps: Array.isArray(result.steps) ? result.steps : [],
                theory: result.theory || '',
                assumptions: Array.isArray(result.assumptions) ? result.assumptions : [],
                formula: (result.steps || []).map((step) => step.formula).find(Boolean) || ''
            });
        }

        return { problems, seed, level, requested: count };
    }

    // ---------------------------------------------------------------- render

    function visibleUnits(units) {
        if (!units) return '';
        const clean = String(units).trim();
        return /^(n\/?a|none|dimensionless|-|ratio)$/i.test(clean) ? '' : clean;
    }

    // Keep generated keys readable: the solver may return full float
    // precision, but a worksheet should show engineering precision.
    function cleanAnswer(value) {
        if (typeof value === 'number' && Number.isFinite(value) && !Number.isInteger(value)) {
            return Number(value.toPrecision(6));
        }
        return value;
    }

    function formatAnswer(problem) {
        const units = visibleUnits(problem.units);
        const answer = cleanAnswer(problem.answer);
        return units ? `${answer} ${units}` : String(answer);
    }

    function render(container, problems, options) {
        if (!container) return;
        const settings = options || {};
        container.replaceChildren();

        const list = document.createElement('ol');
        list.className = 'ws-list';

        problems.forEach((problem, index) => {
            const item = document.createElement('li');
            item.className = 'ws-item';

            const head = document.createElement('div');
            head.className = 'ws-item-head';

            const number = document.createElement('span');
            number.className = 'ws-number';
            number.textContent = String(index + 1).padStart(2, '0');
            head.appendChild(number);

            const meta = document.createElement('span');
            meta.className = 'ws-meta';
            meta.textContent = `${problem.topic} · ${problem.level}`;
            head.appendChild(meta);

            item.appendChild(head);

            const prompt = document.createElement('p');
            prompt.className = 'ws-prompt';
            prompt.textContent = problem.prompt;
            item.appendChild(prompt);

            if (settings.answers) {
                const answer = document.createElement('div');
                answer.className = 'ws-answer';

                const label = document.createElement('span');
                label.className = 'ws-answer-label';
                label.textContent = 'Answer';
                answer.appendChild(label);

                const value = document.createElement('span');
                value.className = 'ws-answer-value';
                value.textContent = formatAnswer(problem);
                answer.appendChild(value);
                item.appendChild(answer);

                if (problem.steps.length) {
                    const steps = document.createElement('ol');
                    steps.className = 'ws-steps';
                    problem.steps.forEach((step) => {
                        const row = document.createElement('li');
                        if (step.title) {
                            const title = document.createElement('strong');
                            title.textContent = step.title;
                            row.appendChild(title);
                        }
                        if (step.explanation) {
                            const text = document.createElement('span');
                            text.textContent = step.explanation;
                            row.appendChild(text);
                        }
                        if (step.formula) {
                            const formula = document.createElement('code');
                            formula.textContent = step.formula;
                            row.appendChild(formula);
                        }
                        steps.appendChild(row);
                    });
                    item.appendChild(steps);
                }

                if (problem.assumptions.length) {
                    const assumptions = document.createElement('p');
                    assumptions.className = 'ws-assumptions';
                    assumptions.textContent = `Assumptions: ${problem.assumptions.join('; ')}`;
                    item.appendChild(assumptions);
                }
            } else {
                const work = document.createElement('div');
                work.className = 'ws-work';
                item.appendChild(work);
            }

            list.appendChild(item);
        });

        container.appendChild(list);
    }

    // ------------------------------------------------------------------ csv

    function csvCell(value) {
        let text = String(value === undefined || value === null ? '' : value);
        // Spreadsheet formula injection: a cell starting with =, +, -, @,
        // tab or CR is executed by Excel/Sheets. Prefix it with an apostrophe
        // unless it is a plain number, so negative answers stay numeric.
        const plainNumber = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;
        if (/^[=+\-@\t\r]/.test(text) && !plainNumber.test(text)) {
            text = "'" + text;
        }
        return `"${text.replace(/"/g, '""')}"`;
    }

    function toCsv(problems) {
        const rows = [['Number', 'Topic', 'Level', 'Problem', 'Answer', 'Unit', 'Governing formula']];
        problems.forEach((problem, index) => {
            rows.push([
                index + 1,
                problem.topic,
                problem.level,
                problem.prompt,
                cleanAnswer(problem.answer),
                visibleUnits(problem.units),
                problem.formula
            ]);
        });
        return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
    }

    function download(filename, text, mime) {
        const blob = new Blob([text], { type: mime || 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.rel = 'noopener';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    // ---------------------------------------------------------------- print

    function ensurePrintRoot() {
        let root = document.getElementById('print-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'print-root';
            root.setAttribute('aria-hidden', 'true');
            document.body.appendChild(root);
        }
        return root;
    }

    function print(problems, options) {
        const settings = options || {};
        const answers = Boolean(settings.answers);
        const root = ensurePrintRoot();
        root.replaceChildren();

        const sheet = document.createElement('section');
        sheet.className = 'print-sheet';

        const head = document.createElement('header');
        head.className = 'print-head';

        const brand = document.createElement('p');
        brand.className = 'print-brand';
        brand.textContent = 'UniStep';
        head.appendChild(brand);

        const title = document.createElement('h1');
        title.textContent = settings.title || (answers ? 'Answer key' : 'Worksheet');
        head.appendChild(title);

        const meta = document.createElement('p');
        meta.className = 'print-meta';
        meta.textContent = `${problems.length} problems · ${settings.level || 'Standard'} · Generated ${new Date().toLocaleDateString()}`;
        head.appendChild(meta);

        if (!answers) {
            const fields = document.createElement('p');
            fields.className = 'print-fields';
            fields.textContent = 'Name: ______________________________     Date: ______________     Score: ______ / ' + problems.length;
            head.appendChild(fields);
        }

        sheet.appendChild(head);

        const list = document.createElement('ol');
        list.className = 'print-list';

        problems.forEach((problem) => {
            const item = document.createElement('li');
            item.className = 'print-item';

            const prompt = document.createElement('p');
            prompt.className = 'print-prompt';
            prompt.textContent = problem.prompt;
            item.appendChild(prompt);

            if (answers) {
                const answer = document.createElement('p');
                answer.className = 'print-answer';
                answer.textContent = `Answer: ${formatAnswer(problem)}`;
                item.appendChild(answer);

                if (problem.formula) {
                    const formula = document.createElement('p');
                    formula.className = 'print-formula';
                    formula.textContent = `Governing relation: ${problem.formula}`;
                    item.appendChild(formula);
                }

                if (problem.steps.length) {
                    const steps = document.createElement('ol');
                    steps.className = 'print-steps';
                    problem.steps.forEach((step) => {
                        const row = document.createElement('li');
                        row.textContent = step.formula
                            ? `${step.title ? step.title + ': ' : ''}${step.explanation || ''} ${step.formula}`.trim()
                            : `${step.title ? step.title + ': ' : ''}${step.explanation || ''}`.trim();
                        steps.appendChild(row);
                    });
                    item.appendChild(steps);
                }

                if (problem.assumptions.length) {
                    const assumptions = document.createElement('p');
                    assumptions.className = 'print-assumptions';
                    assumptions.textContent = `Assumptions: ${problem.assumptions.join('; ')}`;
                    item.appendChild(assumptions);
                }
            } else {
                const work = document.createElement('div');
                work.className = 'print-work';
                item.appendChild(work);
            }

            list.appendChild(item);
        });

        sheet.appendChild(list);

        const foot = document.createElement('footer');
        foot.className = 'print-foot';
        foot.textContent = 'Generated by UniStep. Every answer is produced by the verified solver, not by a language model.';
        sheet.appendChild(foot);

        root.appendChild(sheet);
        document.body.classList.add('printing');
        window.print();
    }

    function endPrint() {
        document.body.classList.remove('printing');
        const root = document.getElementById('print-root');
        if (root) root.replaceChildren();
    }

    window.addEventListener('afterprint', endPrint);

    window.UniStepWorksheet = {
        TOPICS,
        build,
        render,
        toCsv,
        download,
        print,
        formatAnswer
    };
})();
