/**
 * UniStep Practice
 *
 * A small, honest FE-style question bank plus a timed runner. Every entry is
 * hand-checked against the same formulas the solver uses; the explanation on
 * review is the working, not a restatement of the answer.
 *
 * This is a starter bank, not an exam simulator: 30 items across the topics
 * the engine can verify. It exists so "timed practice mode" is a real feature.
 */

(function () {
    'use strict';

    const BANK = [
        {
            id: 'stat_001', discipline: 'Statics', topic: 'Beam bending',
            prompt: 'A simply supported beam spans 10 m and carries a 200 N point load at midspan. What is the maximum bending moment?',
            choices: ['250 N·m', '500 N·m', '1,000 N·m', '2,000 N·m'],
            answer: 1,
            solution: 'For a point load at midspan, Mmax = PL/4 = (200)(10)/4 = 500 N·m.'
        },
        {
            id: 'stat_002', discipline: 'Statics', topic: 'Force components',
            prompt: 'A 50 N force acts at 30° above the horizontal. What is its horizontal component?',
            choices: ['25.0 N', '43.3 N', '50.0 N', '86.6 N'],
            answer: 1,
            solution: 'Fx = F cos θ = 50 cos 30° = 43.3 N.'
        },
        {
            id: 'stat_003', discipline: 'Dynamics', topic: 'Incline',
            prompt: 'A 20 kg block slides down a frictionless 30° incline. What is its acceleration?',
            choices: ['4.91 m/s²', '8.50 m/s²', '9.81 m/s²', '17.0 m/s²'],
            answer: 0,
            solution: 'On a frictionless incline a = g sin θ = 9.81 sin 30° = 4.91 m/s². Mass cancels.'
        },
        {
            id: 'stat_004', discipline: 'Statics', topic: 'Resultant',
            prompt: 'Two forces of 30 N and 40 N act at right angles. What is the magnitude of the resultant?',
            choices: ['10 N', '35 N', '50 N', '70 N'],
            answer: 2,
            solution: 'Perpendicular forces add as vectors: R = √(30² + 40²) = 50 N.'
        },
        {
            id: 'stat_005', discipline: 'Statics', topic: 'Equilibrium',
            prompt: 'A 100 N weight hangs from two symmetric ropes, each at 45° to the vertical. What is the tension in each rope?',
            choices: ['50.0 N', '70.7 N', '100 N', '141 N'],
            answer: 1,
            solution: 'Vertical equilibrium: 2T cos 45° = 100, so T = 100/(2 × 0.7071) = 70.7 N.'
        },
        {
            id: 'mat_001', discipline: 'Mechanics of Materials', topic: 'Axial stress',
            prompt: 'A 10 mm diameter steel rod carries a 20 kN axial load. What is the normal stress?',
            choices: ['63.7 MPa', '127 MPa', '255 MPa', '509 MPa'],
            answer: 2,
            solution: 'A = πd²/4 = π(0.010)²/4 = 7.854×10⁻⁵ m². σ = F/A = 20,000/7.854×10⁻⁵ = 255 MPa.'
        },
        {
            id: 'mat_002', discipline: 'Mechanics of Materials', topic: 'Strain',
            prompt: 'The same rod reaches 255 MPa. If E = 200 GPa, what is the axial strain?',
            choices: ['1.27×10⁻³', '2.55×10⁻³', '5.09×10⁻⁴', '1.27×10⁻⁴'],
            answer: 0,
            solution: 'ε = σ/E = 255×10⁶ / 200×10⁹ = 1.27×10⁻³.'
        },
        {
            id: 'mat_003', discipline: 'Mechanics of Materials', topic: 'Deformation',
            prompt: 'A 2 m rod with strain 1.27×10⁻³ elongates by how much?',
            choices: ['0.64 mm', '1.27 mm', '2.55 mm', '5.09 mm'],
            answer: 2,
            solution: 'ΔL = εL = (1.27×10⁻³)(2 m) = 2.54×10⁻³ m = 2.55 mm.'
        },
        {
            id: 'mat_004', discipline: 'Mechanics of Materials', topic: 'Torsion',
            prompt: 'A solid 25 mm diameter shaft carries 500 N·m of torque. What is the maximum shear stress?',
            choices: ['40.7 MPa', '81.5 MPa', '163 MPa', '326 MPa'],
            answer: 2,
            solution: 'τ = 16T/(πd³) = 16(500)/(π × 0.025³) = 163 MPa.'
        },
        {
            id: 'mat_005', discipline: 'Mechanics of Materials', topic: 'Beam bending',
            prompt: 'A simply supported 3 m beam carries a uniform load of 4 kN/m. What is the maximum bending moment?',
            choices: ['1.5 kN·m', '3.0 kN·m', '4.5 kN·m', '9.0 kN·m'],
            answer: 2,
            solution: 'For a uniform load, Mmax = wL²/8 = (4)(3²)/8 = 4.5 kN·m.'
        },
        {
            id: 'fluid_001', discipline: 'Fluids', topic: 'Continuity',
            prompt: 'Water flows at 2 m/s through a 50 mm diameter pipe. What is the volumetric flow rate?',
            choices: ['1.57 L/s', '3.93 L/s', '7.85 L/s', '15.7 L/s'],
            answer: 1,
            solution: 'Q = Av = π(0.025)²(2) = 3.93×10⁻³ m³/s = 3.93 L/s.'
        },
        {
            id: 'fluid_002', discipline: 'Fluids', topic: 'Reynolds number',
            prompt: 'Water (ρ = 1000 kg/m³, μ = 1×10⁻³ Pa·s) flows at 2 m/s in a 50 mm pipe. What is Re?',
            choices: ['1×10³', '1×10⁴', '1×10⁵', '1×10⁶'],
            answer: 2,
            solution: 'Re = ρvD/μ = (1000)(2)(0.05)/(1×10⁻³) = 100,000. The flow is turbulent.'
        },
        {
            id: 'fluid_003', discipline: 'Fluids', topic: 'Bernoulli',
            prompt: 'Water accelerates from 1 m/s to 3 m/s along a horizontal streamline. What is the pressure drop?',
            choices: ['2 kPa', '4 kPa', '8 kPa', '16 kPa'],
            answer: 1,
            solution: 'ΔP = ½ρ(v₁² − v₂²) = ½(1000)(1 − 9) = −4,000 Pa. Pressure falls by 4 kPa.'
        },
        {
            id: 'fluid_004', discipline: 'Fluids', topic: 'Hydrostatics',
            prompt: 'What is the gauge pressure at 5 m depth in water?',
            choices: ['9.81 kPa', '24.5 kPa', '49.1 kPa', '98.1 kPa'],
            answer: 2,
            solution: 'P = ρgh = (1000)(9.81)(5) = 49,050 Pa = 49.1 kPa.'
        },
        {
            id: 'fluid_005', discipline: 'Fluids', topic: 'Buoyancy',
            prompt: 'A floating object displaces 0.06 m³ of water. What is the buoyant force?',
            choices: ['60 N', '294 N', '589 N', '981 N'],
            answer: 2,
            solution: 'Fb = ρgV = (1000)(9.81)(0.06) = 588.6 N.'
        },
        {
            id: 'thermo_001', discipline: 'Thermodynamics', topic: 'Ideal gas',
            prompt: 'What is the pressure of 2 mol of an ideal gas at 300 K in 0.05 m³?',
            choices: ['49.9 kPa', '99.8 kPa', '199.5 kPa', '399 kPa'],
            answer: 1,
            solution: 'P = nRT/V = (2)(8.314)(300)/0.05 = 99,768 Pa ≈ 99.8 kPa.'
        },
        {
            id: 'thermo_002', discipline: 'Thermodynamics', topic: 'Sensible heat',
            prompt: 'How much heat raises 2 kg of water by 10 K? (c = 4.186 kJ/kg·K)',
            choices: ['8.37 kJ', '41.9 kJ', '83.7 kJ', '167 kJ'],
            answer: 2,
            solution: 'q = mcΔT = (2)(4.186)(10) = 83.72 kJ.'
        },
        {
            id: 'thermo_003', discipline: 'Thermodynamics', topic: 'Carnot cycle',
            prompt: 'A heat engine operates between 500 K and 300 K. What is its maximum (Carnot) efficiency?',
            choices: ['20%', '40%', '60%', '80%'],
            answer: 1,
            solution: 'η = 1 − Tc/Th = 1 − 300/500 = 0.40 = 40%.'
        },
        {
            id: 'thermo_004', discipline: 'Thermodynamics', topic: 'Boundary work',
            prompt: 'A gas expands at a constant 100 kPa from 0.1 m³ to 0.3 m³. How much work does it do?',
            choices: ['10 kJ', '20 kJ', '30 kJ', '40 kJ'],
            answer: 1,
            solution: 'W = PΔV = (100,000)(0.3 − 0.1) = 20,000 J = 20 kJ.'
        },
        {
            id: 'thermo_005', discipline: 'Thermodynamics', topic: 'Refrigeration',
            prompt: 'A refrigerator removes 4 kW of heat using 1 kW of compressor work. What is its COP?',
            choices: ['0.25', '1', '4', '5'],
            answer: 2,
            solution: 'COP = Qc/W = 4/1 = 4.'
        },
        {
            id: 'math_001', discipline: 'Mathematics', topic: 'Differentiation',
            prompt: 'What is the value of the derivative of 3x³ − 2x² + 5 at x = 2?',
            choices: ['20', '24', '28', '32'],
            answer: 2,
            solution: "f′(x) = 9x² − 4x. At x = 2: 36 − 8 = 28."
        },
        {
            id: 'math_002', discipline: 'Mathematics', topic: 'Definite integral',
            prompt: 'Evaluate ∫₀² (2x + 3) dx.',
            choices: ['7', '10', '12', '14'],
            answer: 1,
            solution: '∫(2x+3)dx = x² + 3x. From 0 to 2: (4 + 6) − 0 = 10.'
        },
        {
            id: 'math_003', discipline: 'Mathematics', topic: 'Quadratic roots',
            prompt: 'What are the roots of x² − 5x + 6 = 0?',
            choices: ['x = −2, x = −3', 'x = 2, x = 3', 'x = 1, x = 6', 'x = −1, x = −6'],
            answer: 1,
            solution: 'Factor as (x − 2)(x − 3) = 0, so x = 2 and x = 3. Check: 2 + 3 = 5, 2 × 3 = 6.'
        },
        {
            id: 'math_004', discipline: 'Mathematics', topic: 'Determinant',
            prompt: 'What is the determinant of [[2, 3], [1, 4]]?',
            choices: ['5', '8', '11', '−5'],
            answer: 0,
            solution: 'det = ad − bc = (2)(4) − (3)(1) = 5.'
        },
        {
            id: 'math_005', discipline: 'Mathematics', topic: 'Linear equation',
            prompt: 'Solve 3x − 7 = 11.',
            choices: ['x = 4', 'x = 5', 'x = 6', 'x = 18'],
            answer: 2,
            solution: 'Add 7: 3x = 18. Divide by 3: x = 6.'
        },
        {
            id: 'elec_001', discipline: 'Electrical', topic: "Ohm's law",
            prompt: 'A 12 V source is connected across a 4 Ω resistor. What current flows?',
            choices: ['0.33 A', '3 A', '8 A', '48 A'],
            answer: 1,
            solution: 'I = V/R = 12/4 = 3 A.'
        },
        {
            id: 'elec_002', discipline: 'Electrical', topic: 'Parallel resistors',
            prompt: 'Two 6 Ω resistors are connected in parallel. What is the equivalent resistance?',
            choices: ['3 Ω', '6 Ω', '12 Ω', '0.33 Ω'],
            answer: 0,
            solution: 'For two equal resistors in parallel, Req = R/2 = 3 Ω. Check: 1/6 + 1/6 = 1/3.'
        },
        {
            id: 'elec_003', discipline: 'Electrical', topic: 'Power',
            prompt: 'A current of 2 A flows through a 10 Ω resistor. How much power is dissipated?',
            choices: ['5 W', '20 W', '40 W', '100 W'],
            answer: 2,
            solution: 'P = I²R = (2²)(10) = 40 W.'
        },
        {
            id: 'elec_004', discipline: 'Electrical', topic: 'Series resistors',
            prompt: 'Three 4 Ω resistors are connected in series. What is the equivalent resistance?',
            choices: ['1.33 Ω', '4 Ω', '8 Ω', '12 Ω'],
            answer: 3,
            solution: 'In series resistances add: Req = 4 + 4 + 4 = 12 Ω.'
        },
        {
            id: 'elec_005', discipline: 'Electrical', topic: 'Voltage divider',
            prompt: '10 V is applied across a 2 kΩ and a 3 kΩ resistor in series. What voltage appears across the 3 kΩ resistor?',
            choices: ['3 V', '4 V', '6 V', '7 V'],
            answer: 2,
            solution: 'Vout = Vin × R2/(R1 + R2) = 10 × 3/5 = 6 V.'
        }
    ];

    const state = {
        questions: [],
        index: 0,
        answers: [],
        flagged: [],
        remaining: 0,
        timerId: 0,
        active: false,
        minutes: 25
    };

    const $ = (id) => document.getElementById(id);

    function shuffle(list) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function formatClock(seconds) {
        const safe = Math.max(0, seconds);
        const minutes = Math.floor(safe / 60);
        const rest = safe % 60;
        return `${minutes}:${String(rest).padStart(2, '0')}`;
    }

    function showPanel(name) {
        ['practice-setup', 'practice-run', 'practice-review'].forEach((id) => {
            const panel = $(id);
            if (panel) panel.classList.toggle('hidden', id !== name);
        });
    }

    function updateProgress() {
        const total = state.questions.length;
        const position = state.index + 1;
        const progress = $('practice-progress');
        if (progress) progress.textContent = `${position} / ${total}`;
        const fill = $('practice-progress-fill');
        if (fill) fill.style.width = `${(position / total) * 100}%`;
        const flag = $('practice-flag');
        if (flag) {
            const isFlagged = state.flagged[state.index];
            flag.classList.toggle('active', Boolean(isFlagged));
            flag.textContent = isFlagged ? 'Flagged' : 'Flag';
            flag.setAttribute('aria-pressed', isFlagged ? 'true' : 'false');
        }
        const next = $('practice-next');
        if (next) next.textContent = position === total ? 'Finish' : 'Next';
        const prev = $('practice-prev');
        if (prev) prev.disabled = state.index === 0;
    }

    function renderQuestion() {
        const question = state.questions[state.index];
        if (!question) return;

        $('practice-topic').textContent = `${question.discipline} · ${question.topic}`;
        $('practice-question').textContent = question.prompt;

        const choices = $('practice-choices');
        choices.replaceChildren();

        question.choices.forEach((label, choiceIndex) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'practice-choice';
            button.textContent = `${String.fromCharCode(65 + choiceIndex)}. ${label}`;
            button.setAttribute('aria-pressed', state.answers[state.index] === choiceIndex ? 'true' : 'false');
            if (state.answers[state.index] === choiceIndex) button.classList.add('selected');
            button.addEventListener('click', () => {
                state.answers[state.index] = choiceIndex;
                renderQuestion();
                updateProgress();
            });
            choices.appendChild(button);
        });

        updateProgress();
    }

    function startTimer() {
        window.clearInterval(state.timerId);
        state.timerId = window.setInterval(() => {
            state.remaining -= 1;
            const timer = $('practice-timer');
            if (timer) {
                timer.textContent = formatClock(state.remaining);
                timer.classList.toggle('urgent', state.remaining <= 60);
            }
            if (state.remaining <= 0) finish(true);
        }, 1000);
    }

    function stopTimer() {
        window.clearInterval(state.timerId);
        state.timerId = 0;
    }

    function start() {
        const count = Number($('practice-count')?.value) || 10;
        const minutes = Number($('practice-minutes')?.value) || 25;

        state.questions = shuffle(BANK).slice(0, Math.min(count, BANK.length));
        state.index = 0;
        state.answers = new Array(state.questions.length).fill(null);
        state.flagged = new Array(state.questions.length).fill(false);
        state.remaining = minutes * 60;
        state.active = true;
        state.minutes = minutes;

        showPanel('practice-run');
        const timer = $('practice-timer');
        if (timer) {
            timer.textContent = formatClock(state.remaining);
            timer.classList.remove('urgent');
        }
        renderQuestion();
        startTimer();
        const first = document.querySelector('.practice-choice');
        if (first) first.focus();
    }

    function finish(expired) {
        if (!state.active) return;
        state.active = false;
        stopTimer();
        showPanel('practice-review');

        let correct = 0;
        state.questions.forEach((question, index) => {
            if (state.answers[index] === question.answer) correct += 1;
        });

        const total = state.questions.length;
        const percent = Math.round((correct / total) * 100);
        const headline = $('practice-score');
        if (headline) {
            headline.textContent = `${correct} / ${total} correct · ${percent}%${expired ? ' · time expired' : ''}`;
        }

        try {
            const previous = Number(localStorage.getItem('sc_practice_best') || 0);
            if (percent > previous) localStorage.setItem('sc_practice_best', String(percent));
        } catch (err) { /* storage may be unavailable */ }

        const list = $('practice-review-list');
        if (!list) return;
        list.replaceChildren();

        state.questions.forEach((question, index) => {
            const chosen = state.answers[index];
            const isCorrect = chosen === question.answer;

            const row = document.createElement('article');
            row.className = `review-item ${isCorrect ? 'correct' : 'wrong'}`;

            const head = document.createElement('div');
            head.className = 'review-head';

            const badge = document.createElement('span');
            badge.className = 'review-badge';
            badge.textContent = isCorrect ? 'Correct' : chosen === null ? 'Skipped' : 'Incorrect';
            head.appendChild(badge);

            const topic = document.createElement('span');
            topic.className = 'review-topic';
            topic.textContent = `${question.discipline} · ${question.topic}`;
            head.appendChild(topic);

            row.appendChild(head);

            const prompt = document.createElement('p');
            prompt.className = 'review-prompt';
            prompt.textContent = question.prompt;
            row.appendChild(prompt);

            const answers = document.createElement('p');
            answers.className = 'review-answers';
            const yours = chosen === null ? 'no answer' : question.choices[chosen];
            answers.textContent = `Your answer: ${yours} · Correct: ${question.choices[question.answer]}`;
            row.appendChild(answers);

            const solution = document.createElement('p');
            solution.className = 'review-solution';
            solution.textContent = question.solution;
            row.appendChild(solution);

            list.appendChild(row);
        });
    }

    function open() {
        showPanel('practice-setup');
        state.active = false;
        stopTimer();
        const best = (() => {
            try { return localStorage.getItem('sc_practice_best'); } catch (err) { return null; }
        })();
        const note = $('practice-best');
        if (note) note.textContent = best ? `Your best score so far: ${best}%.` : 'No attempts yet — the timer starts when you do.';
        window.UniStepModal?.open('practice-modal', '#practice-start');
    }

    function close() {
        stopTimer();
        state.active = false;
        window.UniStepModal?.close('practice-modal');
    }

    function wire() {
        $('practice-start')?.addEventListener('click', start);
        $('practice-close-btn')?.addEventListener('click', close);
        $('practice-done')?.addEventListener('click', close);
        $('practice-again')?.addEventListener('click', () => {
            showPanel('practice-setup');
            open();
        });

        $('practice-next')?.addEventListener('click', () => {
            if (state.index >= state.questions.length - 1) {
                finish(false);
                return;
            }
            state.index += 1;
            renderQuestion();
        });

        $('practice-prev')?.addEventListener('click', () => {
            if (state.index === 0) return;
            state.index -= 1;
            renderQuestion();
        });

        $('practice-flag')?.addEventListener('click', () => {
            state.flagged[state.index] = !state.flagged[state.index];
            updateProgress();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wire);
    } else {
        wire();
    }

    window.UniStepPractice = { open, close, BANK };
})();
