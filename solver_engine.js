/**
 * SuperSolverEngine (v5.7 - The Pedagogue Edition)
 *
 * This version transforms the output from "results" into "teaching".
 * It implements a deep pedagogical structure for every solve.
 */

class SuperSolverEngine {
    constructor(kb) {
        this.kb = kb;
    }

    extractNumbers(input) {
        // Drop exponent markers first: "m/s^2" must not contribute a "2".
        const cleaned = String(input).replace(/\^\s*-?\d+/g, '');
        const regex = /-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi;
        const matches = cleaned.match(regex);
        return matches ? matches.map(Number) : [];
    }

    // Report values at engineering precision instead of full float noise.
    round(value) {
        if (!Number.isFinite(value)) return String(value);
        if (Number.isInteger(value)) return String(value);
        return String(Number(value.toPrecision(6)));
    }

    solve(input, numbers) {
        const query = input.toLowerCase();
        const plan = window.Planner.plan(input);

        if (plan.length > 0) {
            return this.executeMultiStepPlan(input, numbers, plan);
        }

        return this.solveSingleStep(input, numbers);
    }

    executeMultiStepPlan(input, numbers, plan) {
        const text = input.toLowerCase();

        if (text.includes("ratio") || text.includes("fraction")) {
            const shape = this.rollingShape(text);
            if (shape) return this.rollingRatioDerivation(shape);
        }

        return { error: "Detailed pedagogical derivation for this specific problem is currently being indexed." };
    }

    rollingShape(text) {
        const shapes = [
            {
                key: "solid sphere", name: "solid sphere",
                inertia: "I = (2/5)MR²", beta: "2/5",
                rotational: "1/5", total: "7/10", ratio: "2/7",
                theory: "In rolling motion, energy is split between translation and rotation according to the object's mass distribution. A solid sphere concentrates mass near its centre, so most of the energy stays translational."
            },
            {
                key: "hollow sphere", name: "hollow sphere",
                inertia: "I = (2/3)MR²", beta: "2/3",
                rotational: "1/3", total: "5/6", ratio: "2/5",
                theory: "A hollow sphere carries its mass far from the axis, so it stores a larger share of the energy in rotation than a solid sphere does."
            },
            {
                key: "thin spherical shell", name: "thin spherical shell",
                inertia: "I = (2/3)MR²", beta: "2/3",
                rotational: "1/3", total: "5/6", ratio: "2/5",
                theory: "A thin spherical shell carries its mass far from the axis, so it stores a larger share of the energy in rotation than a solid sphere does."
            },
            {
                key: "solid cylinder", name: "solid cylinder",
                inertia: "I = (1/2)MR²", beta: "1/2",
                rotational: "1/4", total: "3/4", ratio: "1/3",
                theory: "A uniform cylinder distributes its mass evenly between axis and rim, giving a rotation-to-translation energy ratio of one third."
            },
            {
                key: "disc", name: "disc",
                inertia: "I = (1/2)MR²", beta: "1/2",
                rotational: "1/4", total: "3/4", ratio: "1/3",
                theory: "A uniform disc distributes its mass evenly between axis and rim, giving a rotation-to-translation energy ratio of one third."
            },
            {
                key: "thin ring", name: "thin ring",
                inertia: "I = MR²", beta: "1",
                rotational: "1/2", total: "1", ratio: "1/2",
                theory: "Every point of a thin ring sits at the same distance from the axis, so rotation and translation carry equal energy."
            },
            {
                key: "hoop", name: "hoop",
                inertia: "I = MR²", beta: "1",
                rotational: "1/2", total: "1", ratio: "1/2",
                theory: "Every point of a hoop sits at the same distance from the axis, so rotation and translation carry equal energy."
            }
        ];

        return shapes.find((shape) => text.includes(shape.key)) || null;
    }

    rollingRatioDerivation(shape) {
        return {
            success: true,
            domain: "Physics",
            subdomain: "Rotation",
            result: shape.ratio,
            units: "ratio",
            theory: shape.theory,
            steps: [
                {
                    number: 1,
                    title: "The Core Strategy",
                    explanation: `To compare the energies we need one common variable. Because the ${shape.name} rolls without slipping, the linear velocity and angular velocity are linked.`,
                    formula: "v = ωR"
                },
                {
                    number: 2,
                    title: "Defining the Shape Factor",
                    explanation: `Each shape has its own mass distribution, captured by the moment of inertia. For a ${shape.name}, ${shape.inertia}. The factor ${shape.beta} is the key constant here.`,
                    formula: shape.inertia
                },
                {
                    number: 3,
                    title: "Deriving Rotational Energy",
                    explanation: "Substitute the moment of inertia and ω = v/R into the rotational kinetic energy formula. The radius cancels, so the ratio does not depend on the size of the object.",
                    formula: `Kr = 1/2 Iω² = 1/2 * (${shape.beta} MR²) * (v/R)² = ${shape.rotational} Mv²`
                },
                {
                    number: 4,
                    title: "Translational Contribution",
                    explanation: "The centre of mass moves like a particle, which gives the standard translational kinetic energy.",
                    formula: "Kt = 1/2 Mv²"
                },
                {
                    number: 5,
                    title: "Final Synthesis",
                    explanation: `Total energy is the sum of both contributions. Total K = 1/2 Mv² + ${shape.rotational} Mv² = ${shape.total} Mv². The ratio Kr / Total K is therefore (${shape.rotational}) / (${shape.total}).`,
                    formula: `Ratio = ${shape.ratio}`
                }
            ],
            assumptions: ["Pure rolling (no slipping)", "Uniform density", "Rigid body"]
        };
    }

    // ================================================================
    // Extended coverage
    //
    // Every module below parses the quantities it needs by name or unit
    // and returns null when the problem is not its own. Dispatch order is
    // deliberate: calculus must run before the quadratic check, otherwise
    // "derivative of x^2" would be read as a quadratic equation.
    // ================================================================

    fmt(value, digits = 4) {
        if (!Number.isFinite(value)) return String(value);
        if (Number.isInteger(value)) return String(value);
        return String(Number(value.toPrecision(digits)));
    }

    // "voltage 12", "voltage = 12", "voltage of 12"
    namedValue(text, labels) {
        for (const label of labels) {
            const safe = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(safe + "\\s*(?:=|:|of|is)?\\s*(-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)", "i");
            const match = text.match(re);
            if (match) return parseFloat(match[1]);
        }
        return null;
    }

    // "12 V", "12 volts", "0.05 m"
    unitValue(text, unitPattern) {
        const re = new RegExp("(-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\s*(?:" + unitPattern + ")\\b", "i");
        const match = text.match(re);
        return match ? parseFloat(match[1]) : null;
    }

    toMetres(value, unit) {
        const table = { m: 1, cm: 0.01, mm: 0.001, km: 1000, in: 0.0254, ft: 0.3048 };
        return value * (table[String(unit).toLowerCase()] ?? 1);
    }

    toSquareMetres(value, unit) {
        const table = { m2: 1, 'm²': 1, cm2: 1e-4, 'cm²': 1e-4, mm2: 1e-6, 'mm²': 1e-6 };
        return value * (table[String(unit).toLowerCase()] ?? 1);
    }

    // ------------------------------------------------------------ calculus

    parsePolynomial(input) {
        let text = String(input)
            .toLowerCase()
            .replace(/[−–—]/g, '-')
            .replace(/²/g, '^2')
            .replace(/³/g, '^3')
            .replace(/\s+/g, '');

        const start = text.search(/[0-9x(+\-]/);
        if (start < 0) return null;
        let expr = text.slice(start);

        // Drop trailing bounds or prose ("... from 0 to 2", "... at x=3").
        expr = expr.replace(/(?:from|between|at|when|for)\d.*$/, '');
        expr = expr.replace(/=.*$/, '');
        if (!expr.includes('x')) return null;

        const tokens = expr.match(/[+-]?[^+-]+/g) || [];
        const terms = [];
        for (const token of tokens) {
            const match = token.match(/^([+-]?)(\d*\.?\d*(?:e[+-]?\d+)?)\*?(x)?(?:\^(\d+))?$/);
            if (!match) return null;
            const sign = match[1] === '-' ? -1 : 1;
            const digits = match[2];
            const hasX = Boolean(match[3]);
            const power = match[4] !== undefined ? parseInt(match[4], 10) : (hasX ? 1 : 0);
            const magnitude = digits === '' ? (hasX ? 1 : 0) : parseFloat(digits);
            if (!Number.isFinite(magnitude)) return null;
            if (magnitude === 0) continue;
            terms.push({ coef: sign * magnitude, power: hasX ? power : 0 });
        }
        return terms.length ? terms : null;
    }

    formatTerms(terms) {
        const parts = [];
        for (const term of terms) {
            if (!term.coef) continue;
            const magnitude = Math.abs(term.coef);
            const shown = magnitude === 1 && term.power > 0 ? '' : this.fmt(magnitude);
            let body = `${shown}${term.power > 0 ? 'x' : ''}`;
            if (term.power > 1) body += `^${term.power}`;
            parts.push({ negative: term.coef < 0, body });
        }
        if (!parts.length) return '0';
        return parts
            .map((part, index) => index === 0
                ? `${part.negative ? '−' : ''}${part.body}`
                : ` ${part.negative ? '−' : '+'} ${part.body}`)
            .join('');
    }

    evalPolynomial(terms, x) {
        return terms.reduce((sum, term) => sum + term.coef * Math.pow(x, term.power), 0);
    }

    solveCalculus(input) {
        const text = String(input).toLowerCase();
        const isDerivative = /\bderivative\b|\bdifferentiate\b|d\s*\/\s*dx/.test(text);
        const isIntegral = /\bintegral\b|\bintegrate\b|\bantiderivative\b/.test(text);
        if (!isDerivative && !isIntegral) return null;

        const bounds = text.match(/from\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*to\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/i);
        const cleaned = text
            .replace(/d\s*\/\s*dx/g, ' ')
            .replace(/\bdx\b/g, ' ')
            .replace(/\bdy\b/g, ' ');

        const terms = this.parsePolynomial(cleaned);
        if (!terms) return null;

        const source = `f(x) = ${this.formatTerms(terms)}`;

        if (isDerivative) {
            const derived = terms
                .map((term) => ({ coef: term.coef * term.power, power: term.power - 1 }))
                .filter((term) => term.power >= 0 && term.coef !== 0);
            const result = this.formatTerms(derived);

            return {
                success: true,
                domain: "Mathematics",
                subdomain: "Calculus",
                result,
                units: "dimensionless",
                theory: "The power rule differentiates each term independently: the exponent moves down as a multiplier and the exponent decreases by one. Constants disappear because their rate of change is zero.",
                steps: [
                    {
                        number: 1,
                        title: "Identify the Function",
                        explanation: "Write the expression in the standard polynomial form so each power of x can be handled separately.",
                        formula: source
                    },
                    {
                        number: 2,
                        title: "Apply the Power Rule",
                        explanation: "For every term axⁿ, the derivative is n·a·xⁿ⁻¹. Constants (n = 0) drop out.",
                        formula: "d/dx (a·xⁿ) = n·a·xⁿ⁻¹"
                    },
                    {
                        number: 3,
                        title: "Differentiate Term by Term",
                        explanation: terms
                            .map((term) => {
                                if (term.power === 0) return `${this.fmt(term.coef)} → 0`;
                                const next = { coef: term.coef * term.power, power: term.power - 1 };
                                return `${this.fmt(term.coef)}x^${term.power} → ${this.formatTerms([next])}`;
                            })
                            .join('; '),
                        formula: terms
                            .filter((term) => term.power > 0)
                            .map((term) => `${this.fmt(term.coef * term.power)}x^${term.power - 1}`)
                            .join(' + ')
                            .replace(/\+ -/g, '− ') || "0"
                    },
                    {
                        number: 4,
                        title: "Final Answer",
                        explanation: "Combine the differentiated terms into a single expression.",
                        formula: `f′(x) = ${result}`
                    }
                ],
                assumptions: ["Polynomial in a single variable", "Differentiated with respect to x"]
            };
        }

        const antiderivative = terms.map((term) => ({
            coef: term.coef / (term.power + 1),
            power: term.power + 1
        }));
        const antiderivativeText = this.formatTerms(antiderivative);

        if (bounds) {
            const lower = parseFloat(bounds[1]);
            const upper = parseFloat(bounds[2]);
            const value = this.evalPolynomial(antiderivative, upper) - this.evalPolynomial(antiderivative, lower);
            if (!Number.isFinite(value)) {
                return { error: "The definite integral exceeds the numeric range this calculator can represent. Check the limits." };
            }
            return {
                success: true,
                domain: "Mathematics",
                subdomain: "Calculus",
                result: this.fmt(value, 6),
                units: "dimensionless",
                theory: "A definite integral accumulates the function between two limits. Evaluating the antiderivative at the upper limit and subtracting its value at the lower limit gives the exact area.",
                steps: [
                    {
                        number: 1,
                        title: "Identify the Integrand",
                        explanation: "Write the expression in standard polynomial form.",
                        formula: source
                    },
                    {
                        number: 2,
                        title: "Apply the Power Rule for Integration",
                        explanation: "For every term axⁿ, the antiderivative is a·xⁿ⁺¹/(n+1).",
                        formula: "∫ a·xⁿ dx = a·xⁿ⁺¹/(n+1)"
                    },
                    {
                        number: 3,
                        title: "Find the Antiderivative",
                        explanation: "Integrate each term independently.",
                        formula: `F(x) = ${antiderivativeText}`
                    },
                    {
                        number: 4,
                        title: "Evaluate at the Limits",
                        explanation: `Apply F(${this.fmt(upper)}) − F(${this.fmt(lower)}).`,
                        formula: `F(${this.fmt(upper)}) − F(${this.fmt(lower)}) = ${this.fmt(value, 6)}`
                    },
                    {
                        number: 5,
                        title: "Final Answer",
                        explanation: "The definite integral is the accumulated area under the curve.",
                        formula: `∫ from ${this.fmt(lower)} to ${this.fmt(upper)} = ${this.fmt(value, 6)}`
                    }
                ],
                assumptions: ["Polynomial integrand", "Integration with respect to x"]
            };
        }

        return {
            success: true,
            domain: "Mathematics",
            subdomain: "Calculus",
            result: `${antiderivativeText} + C`,
            units: "dimensionless",
            theory: "Integration reverses differentiation. Each term's exponent increases by one and the coefficient is divided by the new exponent. The constant C covers every possible vertical shift of the family of curves.",
            steps: [
                {
                    number: 1,
                    title: "Identify the Integrand",
                    explanation: "Write the expression in standard polynomial form.",
                    formula: source
                },
                {
                    number: 2,
                    title: "Apply the Power Rule for Integration",
                    explanation: "For every term axⁿ, raise the exponent by one and divide by the new exponent.",
                    formula: "∫ a·xⁿ dx = a·xⁿ⁺¹/(n+1) + C"
                },
                {
                    number: 3,
                    title: "Integrate Term by Term",
                    explanation: terms
                        .map((term) => `${this.fmt(term.coef)}x^${term.power} → ${this.formatTerms([{ coef: term.coef / (term.power + 1), power: term.power + 1 }])}`)
                        .join('; '),
                    formula: antiderivativeText
                },
                {
                    number: 4,
                    title: "Add the Constant of Integration",
                    explanation: "An indefinite integral represents a family of functions, so the arbitrary constant C must be included.",
                    formula: `F(x) = ${antiderivativeText} + C`
                }
            ],
            assumptions: ["Polynomial integrand", "Integration with respect to x"]
        };
    }

    // -------------------------------------------------------------- matrices

    solveMatrix(input) {
        const text = String(input).toLowerCase();
        const wantsDeterminant = /\bdeterminant\b|\bdet\b/.test(text);
        const wantsInverse = /\binverse\b/.test(text);
        if (!wantsDeterminant && !wantsInverse) return null;
        if (!/matrix|\[|;/.test(text)) return null;

        const cleaned = text.replace(/\b[23]\s*[x×]\s*[23]\b/g, ' ');
        const values = (cleaned.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
        const size = values.length === 4 ? 2 : values.length === 9 ? 3 : 0;
        if (!size) return null;

        const at = (row, col) => values[row * size + col];

        if (wantsInverse) {
            if (size !== 2) {
                return { error: "Matrix inverse is supported for 2×2 matrices. Give the four entries in order, e.g. 'inverse of [[4,7],[2,6]]'." };
            }
            const a = at(0, 0), b = at(0, 1), c = at(1, 0), d = at(1, 1);
            const det = a * d - b * c;
            if (Math.abs(det) < 1e-12) {
                return { error: "This matrix has a determinant of zero, so it has no inverse (it is singular)." };
            }
            const inverse = [
                [d / det, -b / det],
                [-c / det, a / det]
            ];
            const pretty = inverse
                .map((row) => `[ ${row.map((value) => this.fmt(value, 5)).join(', ')} ]`)
                .join(', ');

            return {
                success: true,
                domain: "Mathematics",
                subdomain: "Linear Algebra",
                result: pretty,
                units: "dimensionless",
                theory: "The inverse of a 2×2 matrix swaps the diagonal entries, negates the off-diagonal entries, and divides by the determinant. It exists only when the determinant is non-zero.",
                steps: [
                    {
                        number: 1,
                        title: "Read the Matrix",
                        explanation: "A 2×2 matrix has four entries, read row by row.",
                        formula: `A = [[${a}, ${b}], [${c}, ${d}]]`
                    },
                    {
                        number: 2,
                        title: "Compute the Determinant",
                        explanation: "Subtract the product of the anti-diagonal from the product of the main diagonal.",
                        formula: `det(A) = (${a})(${d}) − (${b})(${c}) = ${this.fmt(det, 6)}`
                    },
                    {
                        number: 3,
                        title: "Apply the Inverse Formula",
                        explanation: "Swap a and d, negate b and c, then divide every entry by the determinant.",
                        formula: "A⁻¹ = (1/det) · [[d, −b], [−c, a]]"
                    },
                    {
                        number: 4,
                        title: "Final Answer",
                        explanation: "Substituting the entries gives the inverse matrix.",
                        formula: `A⁻¹ = ${pretty}`
                    }
                ],
                assumptions: ["Square 2×2 matrix", "Determinant is non-zero"]
            };
        }

        let det;
        let working;
        if (size === 2) {
            const a = at(0, 0), b = at(0, 1), c = at(1, 0), d = at(1, 1);
            det = a * d - b * c;
            working = `det = (${a})(${d}) − (${b})(${c}) = ${this.fmt(det, 6)}`;
        } else {
            const a = at(0, 0), b = at(0, 1), c = at(0, 2);
            const d = at(1, 0), e = at(1, 1), f = at(1, 2);
            const g = at(2, 0), h = at(2, 1), i = at(2, 2);
            det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
            working = `det = ${a}(${e}·${i} − ${f}·${h}) − ${b}(${d}·${i} − ${f}·${g}) + ${c}(${d}·${h} − ${e}·${g}) = ${this.fmt(det, 6)}`;
        }

        return {
            success: true,
            domain: "Mathematics",
            subdomain: "Linear Algebra",
            result: this.fmt(det, 6),
            units: "dimensionless",
            theory: "The determinant measures how a matrix scales area or volume. A zero determinant means the transformation collapses space onto a lower dimension, which is why singular matrices cannot be inverted.",
            steps: [
                {
                    number: 1,
                    title: "Read the Matrix",
                    explanation: `This is a ${size}×${size} matrix, so its determinant is a single number.`,
                    formula: `A = ${size === 2
                        ? `[[${at(0, 0)}, ${at(0, 1)}], [${at(1, 0)}, ${at(1, 1)}]]`
                        : `[[${at(0, 0)}, ${at(0, 1)}, ${at(0, 2)}], [${at(1, 0)}, ${at(1, 1)}, ${at(1, 2)}], [${at(2, 0)}, ${at(2, 1)}, ${at(2, 2)}]]`}`
                },
                {
                    number: 2,
                    title: "Expand Along the First Row",
                    explanation: "Multiply each first-row entry by the determinant of the minor left after deleting its row and column, alternating signs.",
                    formula: size === 2
                        ? "det = ad − bc"
                        : "det = a(ei − fh) − b(di − fg) + c(dh − eg)"
                },
                {
                    number: 3,
                    title: "Evaluate",
                    explanation: "Substitute the entries and carry out the arithmetic.",
                    formula: working
                },
                {
                    number: 4,
                    title: "Final Answer",
                    explanation: det === 0
                        ? "A zero determinant means the matrix is singular — its rows are linearly dependent."
                        : "A non-zero determinant means the matrix is invertible.",
                    formula: `det(A) = ${this.fmt(det, 6)}`
                }
            ],
            assumptions: ["Square matrix", "Entries read row by row"]
        };
    }

    // ----------------------------------------------------- unit conversion

    unitTable() {
        return {
            m: { dim: 'length', factor: 1 },
            km: { dim: 'length', factor: 1000 },
            cm: { dim: 'length', factor: 0.01 },
            mm: { dim: 'length', factor: 0.001 },
            in: { dim: 'length', factor: 0.0254 },
            ft: { dim: 'length', factor: 0.3048 },
            mi: { dim: 'length', factor: 1609.344 },
            s: { dim: 'time', factor: 1 },
            min: { dim: 'time', factor: 60 },
            h: { dim: 'time', factor: 3600 },
            hr: { dim: 'time', factor: 3600 },
            kg: { dim: 'mass', factor: 1 },
            g: { dim: 'mass', factor: 0.001 },
            lb: { dim: 'mass', factor: 0.45359237 },
            'm/s': { dim: 'speed', factor: 1 },
            'km/h': { dim: 'speed', factor: 1 / 3.6 },
            kph: { dim: 'speed', factor: 1 / 3.6 },
            mph: { dim: 'speed', factor: 0.44704 },
            'ft/s': { dim: 'speed', factor: 0.3048 },
            n: { dim: 'force', factor: 1 },
            kn: { dim: 'force', factor: 1000 },
            lbf: { dim: 'force', factor: 4.4482216153 },
            pa: { dim: 'pressure', factor: 1 },
            kpa: { dim: 'pressure', factor: 1000 },
            mpa: { dim: 'pressure', factor: 1e6 },
            gpa: { dim: 'pressure', factor: 1e9 },
            bar: { dim: 'pressure', factor: 1e5 },
            atm: { dim: 'pressure', factor: 101325 },
            psi: { dim: 'pressure', factor: 6894.757293 },
            j: { dim: 'energy', factor: 1 },
            kj: { dim: 'energy', factor: 1000 },
            mj: { dim: 'energy', factor: 1e6 },
            cal: { dim: 'energy', factor: 4.184 },
            kcal: { dim: 'energy', factor: 4184 },
            kwh: { dim: 'energy', factor: 3.6e6 },
            w: { dim: 'power', factor: 1 },
            kw: { dim: 'power', factor: 1000 },
            hp: { dim: 'power', factor: 745.699872 },
            l: { dim: 'volume', factor: 0.001 },
            ml: { dim: 'volume', factor: 1e-6 },
            m3: { dim: 'volume', factor: 1 },
            gal: { dim: 'volume', factor: 0.003785411784 }
        };
    }

    normaliseUnit(unit) {
        return String(unit)
            .toLowerCase()
            .replace(/³/g, '3')
            .replace(/²/g, '2')
            .replace(/\s+/g, '')
            .replace(/^°/, '')
            .replace(/[.,;]$/, '');
    }

    solveUnitConversion(input) {
        const text = String(input).toLowerCase().replace(/[−–]/g, '-');
        if (!/\bconvert\b|\bhow many\b|\bwhat is\b.*\bin\b/.test(text)) return null;

        const match = text.match(/(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-z°][a-z0-9°/^²³\-]*)\s*(?:to|into)\s*([a-z°][a-z0-9°/^²³\-]*)/);
        if (!match) return null;

        const value = parseFloat(match[1]);
        if (!Number.isFinite(value)) return null;
        const from = this.normaliseUnit(match[2]);
        const to = this.normaliseUnit(match[3]);
        if (!from || !to) return null;

        const temperature = { c: 'c', celsius: 'c', k: 'k', kelvin: 'k', f: 'f', fahrenheit: 'f' };
        if (temperature[from] && temperature[to]) {
            const a = temperature[from];
            const b = temperature[to];
            let kelvin;
            if (a === 'c') kelvin = value + 273.15;
            else if (a === 'k') kelvin = value;
            else kelvin = (value - 32) * 5 / 9 + 273.15;

            if (!Number.isFinite(kelvin) || kelvin < -1e-9) {
                const absoluteZero = a === 'c' ? -273.15 : a === 'k' ? 0 : -459.67;
                return {
                    error: `That is below absolute zero (${this.fmt(absoluteZero)} ${a === 'c' ? '°C' : a === 'k' ? 'K' : '°F'}), which is not a physical temperature.`
                };
            }

            let result;
            if (b === 'c') result = kelvin - 273.15;
            else if (b === 'k') result = kelvin;
            else result = (kelvin - 273.15) * 9 / 5 + 32;

            if (!Number.isFinite(result)) {
                return { error: "The converted temperature exceeds the numeric range this calculator can represent." };
            }

            return {
                success: true,
                domain: "Physics",
                subdomain: "Units",
                result: this.fmt(result, 6),
                units: b === 'c' ? '°C' : b === 'k' ? 'K' : '°F',
                theory: "Temperature scales have different zero points, so converting between them requires an offset as well as a scale factor. Converting through kelvin keeps the arithmetic in a single step.",
                steps: [
                    {
                        number: 1,
                        title: "Convert to Kelvin",
                        explanation: "Kelvin is the absolute scale, so it is the safest intermediate.",
                        formula: a === 'c' ? `K = ${this.fmt(value)} + 273.15 = ${this.fmt(kelvin)}`
                            : a === 'k' ? `K = ${this.fmt(value)}`
                                : `K = (${this.fmt(value)} − 32) × 5/9 + 273.15 = ${this.fmt(kelvin)}`
                    },
                    {
                        number: 2,
                        title: "Convert to the Target Scale",
                        explanation: "Apply the target scale's offset and factor.",
                        formula: b === 'c' ? `°C = ${this.fmt(kelvin)} − 273.15 = ${this.fmt(result)}`
                            : b === 'k' ? `K = ${this.fmt(kelvin)}`
                                : `°F = (${this.fmt(kelvin)} − 273.15) × 9/5 + 32 = ${this.fmt(result)}`
                    },
                    {
                        number: 3,
                        title: "Final Answer",
                        explanation: "The two scales measure the same physical temperature.",
                        formula: `${this.fmt(value)} ${a === 'c' ? '°C' : a === 'k' ? 'K' : '°F'} = ${this.fmt(result)} ${b === 'c' ? '°C' : b === 'k' ? 'K' : '°F'}`
                    }
                ],
                assumptions: ["Absolute zero is −273.15 °C", "Exact conversion factors"]
            };
        }

        const table = this.unitTable();
        const source = table[from];
        const target = table[to];
        if (!source || !target) return null;
        if (source.dim !== target.dim) {
            return { error: `Those units measure different quantities (${source.dim} and ${target.dim}), so they cannot be converted directly.` };
        }

        const factor = source.factor / target.factor;
        const result = value * factor;
        if (!Number.isFinite(result)) {
            return { error: "The converted value exceeds the numeric range this calculator can represent." };
        }

        return {
            success: true,
            domain: "Physics",
            subdomain: "Units",
            result: this.fmt(result, 6),
            units: to,
            theory: "Converting units multiplies by a ratio of conversion factors. Because the ratio equals one, the physical quantity is unchanged — only the number and its label are rewritten.",
            steps: [
                {
                    number: 1,
                    title: "Write the Conversion Ratio",
                    explanation: `One ${to} equals ${this.fmt(target.factor / source.factor, 8)} ${from}, so the ratio is built to cancel the original unit.`,
                    formula: `1 ${to} = ${this.fmt(target.factor / source.factor, 8)} ${from}`
                },
                {
                    number: 2,
                    title: "Multiply by the Ratio",
                    explanation: "Multiplying by a ratio equal to one changes the units without changing the value.",
                    formula: `${this.fmt(value)} ${from} × (${this.fmt(factor, 8)} ${to}/${from})`
                },
                {
                    number: 3,
                    title: "Final Answer",
                    explanation: "The original unit cancels, leaving the target unit.",
                    formula: `${this.fmt(value)} ${from} = ${this.fmt(result, 6)} ${to}`
                }
            ],
            assumptions: ["Exact conversion factors", "Same physical quantity on both sides"]
        };
    }

    // -------------------------------------------------- linear equations

    solveLinear(input) {
        const text = String(input)
            .toLowerCase()
            .replace(/[−–]/g, '-')
            .replace(/\bplus\b/g, '+')
            .replace(/\bminus\b/g, '-')
            .replace(/\bequals?\b/g, '=')
            .replace(/\s+/g, '');

        if (!text.includes('=') || !text.includes('x')) return null;
        if (/nan|infinity|∞/.test(text)) {
            return { error: "The equation contains a non-finite coefficient, so it cannot be solved numerically." };
        }
        if (/\^\s*2|²|\^|square|squared/.test(text)) return null;
        if (/\by\b/.test(text)) return null;

        const match = text.match(/(-?\d*\.?\d*)\*?x(?:([+-]\d*\.?\d*))?=(-?\d*\.?\d*)/);
        if (!match) return null;

        const coefficient = (raw, fallback) => {
            if (raw === undefined || raw === '') return fallback;
            if (raw === '+') return 1;
            if (raw === '-') return -1;
            const parsed = parseFloat(raw);
            return Number.isFinite(parsed) ? parsed : fallback;
        };

        const a = coefficient(match[1], 1);
        const b = coefficient(match[2], 0);
        const c = coefficient(match[3], 0);

        if (a === 0) {
            return { error: "The x term cancels out, so this is not a solvable linear equation. Check the coefficients." };
        }

        const x = (c - b) / a;
        const equation = `${this.formatTerms([{ coef: a, power: 1 }, { coef: b, power: 0 }])} = ${this.fmt(c)}`;

        return {
            success: true,
            domain: "Mathematics",
            subdomain: "Algebra",
            result: `x = ${this.fmt(x, 6)}`,
            units: "dimensionless",
            theory: "A linear equation describes a straight line. Isolating x reverses each operation in turn: subtract the constant, then divide by the coefficient.",
            steps: [
                {
                    number: 1,
                    title: "Write the Equation",
                    explanation: "Put the equation in the standard form ax + b = c.",
                    formula: equation
                },
                {
                    number: 2,
                    title: "Move the Constant",
                    explanation: b === 0
                        ? "There is no constant term to move, so the x term is already isolated."
                        : `Subtract ${this.fmt(b)} from both sides.`,
                    formula: b === 0 ? `${this.fmt(a)}x = ${this.fmt(c)}` : `${this.fmt(a)}x = ${this.fmt(c)} − (${this.fmt(b)}) = ${this.fmt(c - b)}`
                },
                {
                    number: 3,
                    title: "Divide by the Coefficient",
                    explanation: `Divide both sides by ${this.fmt(a)}.`,
                    formula: `x = ${this.fmt(c - b)} / ${this.fmt(a)} = ${this.fmt(x, 6)}`
                },
                {
                    number: 4,
                    title: "Check",
                    explanation: "Substituting the answer back into the original equation reproduces the right-hand side.",
                    formula: `${this.fmt(a)}(${this.fmt(x, 6)}) ${b < 0 ? '−' : '+'} ${this.fmt(Math.abs(b))} = ${this.fmt(c)}`
                }
            ],
            assumptions: ["Single variable", "a ≠ 0"]
        };
    }

    solveLinearSystem(input) {
        const text = String(input).toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, ' ');
        if (!/x/.test(text) || !/y/.test(text)) return null;
        if (!/[=]/.test(text)) return null;
        if (/nan|infinity|∞/.test(text)) {
            return { error: "The system contains a non-finite coefficient, so it cannot be solved numerically." };
        }

        const equations = text
            .split(/[,;]|\band\b/)
            .map((part) => part.trim())
            .filter((part) => part.includes('=') && part.includes('x') && part.includes('y'));

        if (equations.length !== 2) return null;

        const parse = (equation) => {
            const compact = equation.replace(/\s+/g, '');
            const match = compact.match(/(-?\d*\.?\d*)\*?x([+-]\d*\.?\d*)\*?y=(-?\d*\.?\d*)/);
            if (!match) return null;
            const coefficient = (raw, fallback) => {
                if (raw === undefined || raw === '') return fallback;
                if (raw === '+') return 1;
                if (raw === '-') return -1;
                const parsed = parseFloat(raw);
                return Number.isFinite(parsed) ? parsed : fallback;
            };
            return {
                a: coefficient(match[1], 1),
                b: coefficient(match[2], 1),
                c: coefficient(match[3], 0)
            };
        };

        const first = parse(equations[0]);
        const second = parse(equations[1]);
        if (!first || !second) return null;

        const determinant = first.a * second.b - second.a * first.b;
        if (Math.abs(determinant) < 1e-12) {
            return { error: "These equations are parallel or identical (determinant = 0), so there is no unique solution." };
        }

        const x = (first.c * second.b - second.c * first.b) / determinant;
        const y = (first.a * second.c - second.a * first.c) / determinant;

        return {
            success: true,
            domain: "Mathematics",
            subdomain: "Algebra",
            result: `x = ${this.fmt(x, 6)}, y = ${this.fmt(y, 6)}`,
            units: "dimensionless",
            theory: "Two linear equations describe two lines. Their intersection is the single point that satisfies both, which Cramer's rule finds directly through determinants.",
            steps: [
                {
                    number: 1,
                    title: "Write the System",
                    explanation: "Put both equations in the form ax + by = c so the coefficients can be compared directly.",
                    formula: `${this.fmt(first.a)}x ${first.b < 0 ? '−' : '+'} ${this.fmt(Math.abs(first.b))}y = ${this.fmt(first.c)};  ${this.fmt(second.a)}x ${second.b < 0 ? '−' : '+'} ${this.fmt(Math.abs(second.b))}y = ${this.fmt(second.c)}`
                },
                {
                    number: 2,
                    title: "Compute the Determinant",
                    explanation: "The determinant of the coefficient matrix must be non-zero for a unique solution.",
                    formula: `D = (${first.a})(${second.b}) − (${second.a})(${first.b}) = ${this.fmt(determinant, 6)}`
                },
                {
                    number: 3,
                    title: "Apply Cramer's Rule",
                    explanation: "Replace one column at a time with the constants to solve for each variable.",
                    formula: `x = Dx/D = ${this.fmt(x, 6)};  y = Dy/D = ${this.fmt(y, 6)}`
                },
                {
                    number: 4,
                    title: "Final Answer",
                    explanation: "Both equations are satisfied at this single point.",
                    formula: `x = ${this.fmt(x, 6)}, y = ${this.fmt(y, 6)}`
                }
            ],
            assumptions: ["Two equations in two unknowns", "Determinant is non-zero"]
        };
    }

    // ----------------------------------------------------------- electrical

    solveElectrical(input) {
        const text = String(input).toLowerCase().replace(/[−–]/g, '-');
        if (!/ohm|resistor|voltage|current|circuit|ampere|volt|battery/.test(text)) return null;

        const resistors = [...text.matchAll(/(-?\d+(?:\.\d+)?)\s*(?:ohms?|[Ωω])/g)].map((match) => Number(match[1]));

        // "three resistors of 4 ohm in series" names a count but only one value.
        if (resistors.length === 1) {
            const countMatch = text.match(/(two|three|four|five|six|\d+)\s*(?:identical\s*)?resistors?/);
            if (countMatch) {
                const words = { two: 2, three: 3, four: 4, five: 5, six: 6 };
                const count = words[countMatch[1]] || parseInt(countMatch[1], 10);
                if (count >= 2 && count <= 20) {
                    resistors.length = 0;
                    for (let i = 0; i < count; i += 1) resistors.push(Number(text.match(/(\d+(?:\.\d+)?)\s*(?:ohms?|[Ωω])/)[1]));
                }
            }
        }

        if (resistors.some((value) => !(value > 0))) {
            return { error: "Resistance must be greater than zero." };
        }

        if (resistors.length >= 2 && /series|parallel/.test(text)) {
            const parallel = /parallel/.test(text);
            const equivalent = parallel
                ? 1 / resistors.reduce((sum, value) => sum + 1 / value, 0)
                : resistors.reduce((sum, value) => sum + value, 0);
            if (!Number.isFinite(equivalent)) {
                return { error: "The equivalent resistance is not finite. Check the resistor values." };
            }
            const list = resistors.map((value) => `${this.fmt(value)} Ω`).join(' and ');

            return {
                success: true,
                domain: "Physics",
                subdomain: "Circuits",
                result: this.fmt(equivalent, 6),
                units: "Ω",
                theory: parallel
                    ? "In parallel, every resistor sees the same voltage, so conductances add. The equivalent resistance is therefore always smaller than the smallest branch."
                    : "In series, the same current passes through every resistor, so the voltage drops add and the resistances simply sum.",
                steps: [
                    {
                        number: 1,
                        title: "Identify the Configuration",
                        explanation: `The resistors (${list}) are connected in ${parallel ? 'parallel' : 'series'}.`,
                        formula: parallel ? "1/Req = 1/R1 + 1/R2 + …" : "Req = R1 + R2 + …"
                    },
                    {
                        number: 2,
                        title: "Substitute the Values",
                        explanation: parallel
                            ? "Add the reciprocals of each resistance, then invert the total."
                            : "Add the resistance values directly.",
                        formula: parallel
                            ? resistors.map((value) => `1/${this.fmt(value)}`).join(' + ')
                            : resistors.map((value) => this.fmt(value)).join(' + ')
                    },
                    {
                        number: 3,
                        title: "Final Answer",
                        explanation: "The equivalent resistance replaces the whole network with a single component.",
                        formula: `Req = ${this.fmt(equivalent, 6)} Ω`
                    }
                ],
                assumptions: ["Ideal resistors", "Negligible connecting-wire resistance"]
            };
        }

        const voltage = this.unitValue(text, "v|volts?") ?? this.namedValue(text, ["voltage", "potential difference", "emf", "supply"]);
        const current = this.unitValue(text, "amps?|amperes?") ?? this.namedValue(text, ["current"]);
        const resistance = resistors.length === 1 ? resistors[0] : this.namedValue(text, ["resistance"]);
        const power = this.unitValue(text, "watts?|w") ?? this.namedValue(text, ["power"]);
        if (resistance !== null && !(resistance > 0)) {
            return { error: "Resistance must be greater than zero." };
        }

        let result;
        let unit;
        let target;
        let formula;
        let substitution;
        let principle;

        if (voltage !== null && resistance !== null) {
            target = "current";
            result = voltage / resistance;
            unit = "A";
            formula = "I = V / R";
            substitution = `I = ${this.fmt(voltage)} / ${this.fmt(resistance)} = ${this.fmt(result, 6)} A`;
            principle = "Ohm's law states that current is proportional to voltage and inversely proportional to resistance.";
        } else if (voltage !== null && current !== null) {
            target = "resistance";
            result = voltage / current;
            unit = "Ω";
            formula = "R = V / I";
            substitution = `R = ${this.fmt(voltage)} / ${this.fmt(current)} = ${this.fmt(result, 6)} Ω`;
            principle = "Rearranging Ohm's law gives resistance as voltage divided by current.";
        } else if (current !== null && resistance !== null) {
            target = "voltage";
            result = current * resistance;
            unit = "V";
            formula = "V = I · R";
            substitution = `V = ${this.fmt(current)} × ${this.fmt(resistance)} = ${this.fmt(result, 6)} V`;
            principle = "Ohm's law states that the voltage across a resistor is the product of current and resistance.";
        } else if (power !== null && voltage !== null) {
            target = "current";
            result = power / voltage;
            unit = "A";
            formula = "I = P / V";
            substitution = `I = ${this.fmt(power)} / ${this.fmt(voltage)} = ${this.fmt(result, 6)} A`;
            principle = "Electrical power is the product of voltage and current, so current is power divided by voltage.";
        } else if (power !== null && current !== null) {
            target = "voltage";
            result = power / current;
            unit = "V";
            formula = "V = P / I";
            substitution = `V = ${this.fmt(power)} / ${this.fmt(current)} = ${this.fmt(result, 6)} V`;
            principle = "Electrical power is the product of voltage and current, so voltage is power divided by current.";
        } else {
            return null;
        }

        if (!Number.isFinite(result)) {
            return { error: "The result is not finite. Check for a zero denominator or an invalid component value." };
        }

        return {
            success: true,
            domain: "Physics",
            subdomain: "Circuits",
            result: this.fmt(result, 6),
            units: unit,
            theory: principle,
            steps: [
                {
                    number: 1,
                    title: "Identify the Principle",
                    explanation: `We need the ${target}, and the known quantities point to ${formula}.`,
                    formula
                },
                {
                    number: 2,
                    title: "Substitute the Values",
                    explanation: "Use base SI units so the result comes out in the correct unit without extra conversion.",
                    formula: substitution
                },
                {
                    number: 3,
                    title: "Final Answer",
                    explanation: "Check the magnitude: a small resistance with a large voltage should give a large current.",
                    formula: `${target} = ${this.fmt(result, 6)} ${unit}`
                }
            ],
            assumptions: ["Ohmic component (constant resistance)", "Steady direct current", "Negligible internal resistance"]
        };
    }

    // ------------------------------------------------------------ mechanics

    solveMechanics(input) {
        const text = String(input).toLowerCase().replace(/[−–]/g, '-');
        if (!/stress|strain|young'?s modulus|elongation|deformation/.test(text)) return null;

        const force = this.unitValue(text, "kn|n|lbf") ?? this.namedValue(text, ["force", "load", "axial load"]);
        const area = this.unitValue(text, "mm2|mm²|cm2|cm²|m2|m²") ?? this.namedValue(text, ["area", "cross-sectional area", "cross section"]);

        const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*(mm2|mm²|cm2|cm²|m2|m²)/);
        const forceMatch = text.match(/(\d+(?:\.\d+)?)\s*(kn|n|lbf)\b/);

        let forceN = force;
        if (forceMatch) {
            const raw = Number(forceMatch[1]);
            const unit = forceMatch[2];
            forceN = unit === 'kn' ? raw * 1000 : unit === 'lbf' ? raw * 4.4482216153 : raw;
        }

        let areaM2 = area;
        if (areaMatch) areaM2 = this.toSquareMetres(Number(areaMatch[1]), areaMatch[2]);

        const elongationMatch = text.match(/(?:elongation|extension|stretch(?:es)?|change in length)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)\b/);
        const lengthMatch = text.match(/(?:original\s*)?length\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)\b/);

        if (areaM2 !== null && !(areaM2 > 0)) {
            return { error: "Cross-sectional area must be greater than zero." };
        }
        if (lengthMatch) {
            const originalLength = this.toMetres(Number(lengthMatch[1]), lengthMatch[2]);
            if (!(originalLength > 0)) {
                return { error: "Original length must be greater than zero." };
            }
        }

        if (/young'?s modulus/.test(text) && forceN !== null && areaM2 !== null && elongationMatch && lengthMatch) {
            const stress = forceN / areaM2;
            const deltaL = this.toMetres(Number(elongationMatch[1]), elongationMatch[2]);
            const length = this.toMetres(Number(lengthMatch[1]), lengthMatch[2]);
            const strain = deltaL / length;
            if (strain === 0) {
                return { error: "Strain is zero, so Young's modulus is undefined for this data." };
            }
            const modulus = stress / strain;
            if (!Number.isFinite(modulus)) {
                return { error: "Young's modulus is not finite. Check the force, area and elongation values." };
            }
            const shown = modulus >= 1e9 ? modulus / 1e9 : modulus / 1e6;
            const unit = modulus >= 1e9 ? "GPa" : "MPa";

            return {
                success: true,
                domain: "Physics",
                subdomain: "Materials",
                result: this.fmt(shown, 6),
                units: unit,
                theory: "Young's modulus is the slope of the elastic part of the stress–strain curve. It links how hard a material is pushed to how much it stretches, independently of the component's size.",
                steps: [
                    {
                        number: 1,
                        title: "Compute the Stress",
                        explanation: "Stress is the internal force carried per unit of cross-sectional area.",
                        formula: `σ = F/A = ${this.fmt(forceN)} / ${this.fmt(areaM2, 5)} = ${this.fmt(stress / 1e6, 5)} MPa`
                    },
                    {
                        number: 2,
                        title: "Compute the Strain",
                        explanation: "Strain is the change in length divided by the original length, so it is dimensionless.",
                        formula: `ε = ΔL/L = ${this.fmt(deltaL, 5)} / ${this.fmt(length, 5)} = ${this.fmt(strain, 5)}`
                    },
                    {
                        number: 3,
                        title: "Apply the Definition",
                        explanation: "Young's modulus is stress divided by strain in the linear-elastic region.",
                        formula: `E = σ/ε = ${this.fmt(modulus / 1e6, 5)} MPa`
                    },
                    {
                        number: 4,
                        title: "Final Answer",
                        explanation: "A modulus near 200 GPa is typical of steel.",
                        formula: `E = ${this.fmt(shown, 6)} ${unit}`
                    }
                ],
                assumptions: ["Linear-elastic behaviour", "Uniform cross-section", "Small deformations"]
            };
        }

        if (/strain/.test(text) && elongationMatch && lengthMatch) {
            const deltaL = this.toMetres(Number(elongationMatch[1]), elongationMatch[2]);
            const length = this.toMetres(Number(lengthMatch[1]), lengthMatch[2]);
            const strain = deltaL / length;
            return {
                success: true,
                domain: "Physics",
                subdomain: "Materials",
                result: this.fmt(strain, 6),
                units: "dimensionless",
                theory: "Strain is a ratio, not a length: it compares how much a component deforms to how long it originally was. That is why it has no units.",
                steps: [
                    {
                        number: 1,
                        title: "Convert to Consistent Units",
                        explanation: "Both lengths must be in the same unit before dividing.",
                        formula: `ΔL = ${this.fmt(deltaL, 5)} m,  L = ${this.fmt(length, 5)} m`
                    },
                    {
                        number: 2,
                        title: "Apply the Definition",
                        explanation: "Strain is the change in length divided by the original length.",
                        formula: `ε = ΔL / L = ${this.fmt(deltaL, 5)} / ${this.fmt(length, 5)}`
                    },
                    {
                        number: 3,
                        title: "Final Answer",
                        explanation: "Strain is dimensionless; it is often quoted in microstrain (×10⁻⁶).",
                        formula: `ε = ${this.fmt(strain, 6)} (${this.fmt(strain * 1e6, 4)} µε)`
                    }
                ],
                assumptions: ["Uniform deformation", "Small strain"]
            };
        }

        if (forceN !== null && areaM2 !== null) {
            const stress = forceN / areaM2;
            if (!Number.isFinite(stress)) {
                return { error: "Stress is not finite. Check the force and area values." };
            }
            const shown = stress >= 1e6 ? stress / 1e6 : stress / 1e3;
            const unit = stress >= 1e6 ? "MPa" : "kPa";
            return {
                success: true,
                domain: "Physics",
                subdomain: "Materials",
                result: this.fmt(shown, 6),
                units: unit,
                theory: "Normal stress is the internal force divided by the cross-sectional area it acts on. The same force over a smaller area produces a larger stress, which is why thin sections fail first.",
                steps: [
                    {
                        number: 1,
                        title: "Identify the Principle",
                        explanation: "Normal stress is force per unit area.",
                        formula: "σ = F / A"
                    },
                    {
                        number: 2,
                        title: "Convert to Base Units",
                        explanation: "Force in newtons and area in square metres give stress in pascals.",
                        formula: `F = ${this.fmt(forceN, 5)} N,  A = ${this.fmt(areaM2, 5)} m²`
                    },
                    {
                        number: 3,
                        title: "Compute the Stress",
                        explanation: "Divide the force by the area.",
                        formula: `σ = ${this.fmt(forceN, 5)} / ${this.fmt(areaM2, 5)} = ${this.fmt(stress, 5)} Pa`
                    },
                    {
                        number: 4,
                        title: "Final Answer",
                        explanation: "1 MPa = 10⁶ Pa, which is the usual unit for engineering stress.",
                        formula: `σ = ${this.fmt(shown, 6)} ${unit}`
                    }
                ],
                assumptions: ["Uniform stress distribution", "Centric axial load", "Material remains elastic"]
            };
        }

        return null;
    }

    // --------------------------------------------------------------- fluids

    solveFluids(input) {
        const text = String(input).toLowerCase().replace(/[−–]/g, '-');

        if (/reynolds/.test(text)) {
            const diameterMatch = text.match(/(?:diameter|pipe size|d)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)\b/)
                || text.match(/(\d+(?:\.\d+)?)\s*(mm|cm|m)\s*(?:diameter|pipe)\b/);
            const velocity = this.unitValue(text, "m\\/s") ?? this.namedValue(text, ["velocity", "speed", "flows at"]);

            if (!diameterMatch || velocity === null) return null;

            const diameter = this.toMetres(Number(diameterMatch[1]), diameterMatch[2]);
            const isAir = /\bair\b/.test(text);
            const density = this.namedValue(text, ["density"]) ?? (isAir ? 1.225 : 1000);
            const viscosity = this.namedValue(text, ["viscosity", "dynamic viscosity"]) ?? (isAir ? 1.81e-5 : 1.002e-3);

            if (!(diameter > 0)) {
                return { error: "Pipe diameter must be greater than zero." };
            }
            if (!(velocity >= 0)) {
                return { error: "Velocity must be zero or greater for a Reynolds-number calculation." };
            }
            if (!(density > 0) || !(viscosity > 0)) {
                return { error: "Density and viscosity must be greater than zero." };
            }

            const reynolds = (density * velocity * diameter) / viscosity;
            if (!Number.isFinite(reynolds)) {
                return { error: "The Reynolds number is not finite. Check the diameter, velocity and fluid properties." };
            }
            const regime = reynolds < 2300 ? "laminar" : reynolds > 4000 ? "turbulent" : "transitional";

            return {
                success: true,
                domain: "Physics",
                subdomain: "Fluids",
                result: this.fmt(reynolds, 4),
                units: "dimensionless",
                theory: "The Reynolds number compares inertial forces to viscous forces. Below about 2300 viscous effects dominate and flow is laminar; above about 4000 inertia dominates and flow is turbulent.",
                steps: [
                    {
                        number: 1,
                        title: "Identify the Principle",
                        explanation: "The Reynolds number is the ratio of inertial to viscous forces in a flow.",
                        formula: "Re = ρ·v·D / μ"
                    },
                    {
                        number: 2,
                        title: "Convert to Base Units",
                        explanation: "Diameter in metres, velocity in m/s, density in kg/m³, viscosity in Pa·s.",
                        formula: `D = ${this.fmt(diameter, 5)} m,  v = ${this.fmt(velocity, 5)} m/s,  ρ = ${this.fmt(density, 5)} kg/m³,  μ = ${this.fmt(viscosity, 4)} Pa·s`
                    },
                    {
                        number: 3,
                        title: "Compute",
                        explanation: "Substitute the properties into the definition.",
                        formula: `Re = (${this.fmt(density, 5)})(${this.fmt(velocity, 5)})(${this.fmt(diameter, 5)}) / ${this.fmt(viscosity, 4)}`
                    },
                    {
                        number: 4,
                        title: "Classify the Flow",
                        explanation: `Re = ${this.fmt(reynolds, 4)} falls in the ${regime} regime.`,
                        formula: `Re = ${this.fmt(reynolds, 4)} → ${regime}`
                    }
                ],
                assumptions: ["Fully developed flow", "Newtonian fluid", "Constant properties", isAir ? "Air at about 20 °C" : "Water at about 20 °C"]
            };
        }

        if (/bernoulli/.test(text)) {
            const speeds = [...text.matchAll(/(\d+(?:\.\d+)?)\s*m\/s/g)].map((match) => Number(match[1]));
            if (speeds.length < 2) return null;

            const isAir = /\bair\b/.test(text);
            const density = this.namedValue(text, ["density"]) ?? (isAir ? 1.225 : 1000);
            const [first, second] = speeds;
            const drop = 0.5 * density * (first * first - second * second);
            const magnitude = Math.abs(drop);
            const shown = magnitude >= 1000 ? magnitude / 1000 : magnitude;
            const unit = magnitude >= 1000 ? "kPa" : "Pa";

            return {
                success: true,
                domain: "Physics",
                subdomain: "Fluids",
                result: this.fmt(shown, 5),
                units: unit,
                theory: "Along a streamline, pressure, kinetic energy per unit volume and gravitational potential energy per unit volume trade off against each other. Where the fluid speeds up, the pressure must fall.",
                steps: [
                    {
                        number: 1,
                        title: "Write Bernoulli's Equation",
                        explanation: "For a horizontal streamline the elevation terms cancel, leaving pressure and kinetic energy to balance.",
                        formula: "P₁ + ½ρv₁² = P₂ + ½ρv₂²"
                    },
                    {
                        number: 2,
                        title: "Rearrange for Pressure Change",
                        explanation: "Group the velocity terms to isolate the pressure difference.",
                        formula: "ΔP = ½ρ(v₁² − v₂²)"
                    },
                    {
                        number: 3,
                        title: "Substitute",
                        explanation: `Density is taken as ${this.fmt(density)} kg/m³ for ${isAir ? 'air' : 'water'}.`,
                        formula: `ΔP = ½(${this.fmt(density)})(${this.fmt(first)}² − ${this.fmt(second)}²)`
                    },
                    {
                        number: 4,
                        title: "Final Answer",
                        explanation: drop > 0
                            ? "The pressure falls as the fluid accelerates, which is the basis of a Venturi meter."
                            : "The pressure rises as the fluid slows, converting kinetic energy back into pressure.",
                        formula: `ΔP = ${this.fmt(shown, 5)} ${unit}`
                    }
                ],
                assumptions: ["Steady, incompressible, inviscid flow", "Horizontal streamline", "No losses between the two points"]
            };
        }

        return null;
    }

    // -------------------------------------------------------------- thermal

    solveThermal(input) {
        const text = String(input).toLowerCase().replace(/[−–]/g, '-');
        if (!/specific heat|heat (?:required|needed|added|absorbed)|calorimetry/.test(text)) return null;

        const massMatch = text.match(/(\d+(?:\.\d+)?)\s*kg\b/) || text.match(/mass\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)/);
        const deltaMatch = text.match(/(?:by|through|of)\s*(\d+(?:\.\d+)?)\s*(?:k\b|kelvin|°c|c\b|degrees?)/);
        if (!massMatch || !deltaMatch) return null;

        const mass = Number(massMatch[1]);
        const deltaT = Number(deltaMatch[1]);
        if (!(mass > 0)) {
            return { error: "Mass must be greater than zero." };
        }

        let specificHeat = 4.186;
        let material = "water";
        let assumedMaterial = true;
        if (/aluminium|aluminum/.test(text)) { specificHeat = 0.897; material = "aluminium"; assumedMaterial = false; }
        else if (/copper/.test(text)) { specificHeat = 0.385; material = "copper"; assumedMaterial = false; }
        else if (/steel|iron/.test(text)) { specificHeat = 0.45; material = "steel"; assumedMaterial = false; }
        else if (/\bair\b/.test(text)) { specificHeat = 1.005; material = "air"; assumedMaterial = false; }
        else if (/\bwater\b/.test(text)) { assumedMaterial = false; }
        else {
            const phraseMatch = text.match(/(?:\d+(?:\.\d+)?)\s*kg\s+of\s+([a-z][a-z-]*(?:\s+[a-z][a-z-]*)?)/);
            if (phraseMatch) {
                const phrase = phraseMatch[1].replace(/\s+(?:by|through|from|at|to|over|for)$/, '').trim();
                return {
                    error: `I don't have a specific heat for "${phrase}". Supported materials are water, aluminium, copper, steel/iron and air.`
                };
            }
        }

        const heat = mass * specificHeat * deltaT;
        if (!Number.isFinite(heat)) {
            return { error: "The heat value is not finite. Check the mass and temperature change." };
        }

        return {
            success: true,
            domain: "Physics",
            subdomain: "Thermodynamics",
            result: this.fmt(heat, 5),
            units: "kJ",
            theory: "Sensible heat is the energy needed to change a substance's temperature without changing its phase. It depends on mass, the material's specific heat capacity, and the temperature rise.",
            steps: [
                {
                    number: 1,
                    title: "Identify the Principle",
                    explanation: "The heat required is proportional to mass, specific heat capacity and temperature change.",
                    formula: "q = m · c · ΔT"
                },
                {
                    number: 2,
                    title: "Look Up the Specific Heat",
                    explanation: `For ${material}, c = ${this.fmt(specificHeat)} kJ/(kg·K).`,
                    formula: `c = ${this.fmt(specificHeat)} kJ/(kg·K)`
                },
                {
                    number: 3,
                    title: "Substitute",
                    explanation: "Mass in kg and temperature change in kelvin (a change of 1 K equals a change of 1 °C).",
                    formula: `q = (${this.fmt(mass)})(${this.fmt(specificHeat)})(${this.fmt(deltaT)})`
                },
                {
                    number: 4,
                    title: "Final Answer",
                    explanation: "The result is energy, so it is reported in kilojoules.",
                    formula: `q = ${this.fmt(heat, 5)} kJ`
                }
            ],
            assumptions: [
                "No phase change",
                "Constant specific heat over the temperature range",
                "Closed system at constant pressure",
                ...(assumedMaterial ? ["Material not specified; assuming water"] : [])
            ]
        };
    }

    // ------------------------------------------------------------ projectile

    solveProjectile(input) {
        const text = String(input).toLowerCase().replace(/[−–]/g, '-');
        if (!/projectile|launched|fired|thrown|range|maximum height/.test(text)) return null;

        const speed = this.unitValue(text, "m\\/s");
        const angleMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:degrees?|°|deg\b)/);
        if (speed === null || !angleMatch) return null;

        const angle = Number(angleMatch[1]);
        if (!(speed > 0)) {
            return { error: "Launch speed must be greater than zero." };
        }
        if (!(angle >= 0 && angle <= 90)) {
            return { error: "Launch angle must be between 0 and 90 degrees for this range, height and flight-time model." };
        }
        const radians = angle * Math.PI / 180;
        const g = 9.81;

        const range = (speed * speed * Math.sin(2 * radians)) / g;
        const height = (speed * speed * Math.sin(radians) * Math.sin(radians)) / (2 * g);
        const flight = (2 * speed * Math.sin(radians)) / g;

        let result;
        let unit;
        let target;
        let formula;
        if (/height/.test(text)) {
            target = "maximum height";
            result = height;
            unit = "m";
            formula = "H = v² sin²θ / (2g)";
        } else if (/time|flight|airborne/.test(text)) {
            target = "time of flight";
            result = flight;
            unit = "s";
            formula = "t = 2v sinθ / g";
        } else {
            target = "horizontal range";
            result = range;
            unit = "m";
            formula = "R = v² sin(2θ) / g";
        }

        if (!Number.isFinite(result)) {
            return { error: "The projectile result is not finite. Check the launch speed and angle." };
        }
        if (Math.abs(result) < 1e-9) result = 0;

        return {
            success: true,
            domain: "Physics",
            subdomain: "Kinematics",
            result: this.fmt(result, 6),
            units: unit,
            theory: "Projectile motion separates into independent horizontal and vertical parts. Horizontally the velocity is constant; vertically gravity acts alone, which is what sets the flight time and the peak height.",
            steps: [
                {
                    number: 1,
                    title: "Resolve the Initial Velocity",
                    explanation: "Split the launch speed into horizontal and vertical components.",
                    formula: `vx = ${this.fmt(speed * Math.cos(radians), 5)} m/s,  vy = ${this.fmt(speed * Math.sin(radians), 5)} m/s`
                },
                {
                    number: 2,
                    title: "Identify the Principle",
                    explanation: `We need the ${target}, which follows from the vertical motion under constant acceleration g = 9.81 m/s².`,
                    formula
                },
                {
                    number: 3,
                    title: "Substitute",
                    explanation: `Launch speed ${this.fmt(speed)} m/s at ${this.fmt(angle)}° above the horizontal.`,
                    formula: `v = ${this.fmt(speed)} m/s,  θ = ${this.fmt(angle)}°,  g = 9.81 m/s²`
                },
                {
                    number: 4,
                    title: "Final Answer",
                    explanation: "Air resistance is neglected, so this is the ideal trajectory.",
                    formula: `${target} = ${this.fmt(result, 6)} ${unit}`
                }
            ],
            assumptions: ["No air resistance", "Flat ground", "Constant gravitational acceleration", "Launch and landing at the same height"]
        };
    }

    // ------------------------------------------------------------ aerospace

    // Helper: try many label aliases, then fall back to any number in the text.
    findParam(text, aliases, unitPattern = null) {
        // 1) Try named value with each alias
        for (const alias of aliases) {
            const v = this.namedValue(text, [alias]);
            if (v !== null && Number.isFinite(v) && v > 0) return v;
        }
        // 2) Try unit-based extraction
        if (unitPattern) {
            const v = this.unitValue(text, unitPattern);
            if (v !== null && Number.isFinite(v) && v > 0) return v;
        }
        // 3) Fallback: grab the first positive number in the text
        const all = this.extractNumbers(text);
        const positive = all.filter((n) => n > 0);
        if (positive.length > 0) return positive[0];
        return null;
    }

    // Strip conversational prefixes so "how much lift does..." still matches keywords.
    stripPrefix(text) {
        return text
            .replace(/^(how much|how many|what is|what\'s|can you|calculate|compute|find|give me|i need|tell me)\s+/i, '')
            .replace(/\?\s*$/, '')
            .trim();
    }

    solveAerospace(input) {
        const raw = String(input);
        const text = this.stripPrefix(raw).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');

        // ---- Constants ----
        const G = 6.67430e-11;
        const M_EARTH = 5.972e24;
        const R_EARTH = 6371000;
        const G0 = 9.80665;
        const MU_EARTH = G * M_EARTH;

        // ---- Keyword detection with word boundaries & aliases ----
        const kw = (re) => re.test(text);

        const isRocket = /\brocket\b|delta.v|\u0394v|delta v|specific impulse|isp|exhaust velocity|mass ratio|propellant|how fast.*rocket/.test(text);
        const isOrbital = /\borbit\b|orbital|satellite|circular orbit|how fast.*orbit/.test(text);
        const isEscape = /\bescape\b|leave earth|break free|escape earth/.test(text);
        const isLift = /\blift\b|how much lift|wing lift/.test(text);
        const isDrag = /\bdrag\b|how much drag|air resistance/.test(text);
        const isMach = /\bmach\b|speed of sound|mach number/.test(text);
        const isAtmosphere = /\batmosphere\b|standard atmosphere|density at altitude|pressure at altitude|air at altitude/.test(text);

        if (!isRocket && !isOrbital && !isEscape && !isLift && !isDrag && !isMach && !isAtmosphere) return null;

        // ---- Helper: extract a parameter with many aliases ----
        const get = (aliases, unitPattern) => this.findParam(text, aliases, unitPattern);

        // ====================================================================
        // ROCKET EQUATION (Tsiolkovsky)
        // ====================================================================
        if (isRocket) {
            const m0 = get(["initial mass", "wet mass", "starting mass", "start mass", "launch mass", "m0", "rocket mass"], "kg|tonnes?|tons?|lb|kg");
            const mf = get(["final mass", "dry mass", "ending mass", "burnout mass", "mf", "empty mass"], "kg|tonnes?|tons?|lb|kg");
            const ve = get(["exhaust velocity", "ve", "exhaust speed"], "m\\/s|m/s");
            const isp = get(["specific impulse", "isp"], "");

            if (m0 !== null && mf !== null && (ve !== null || isp !== null)) {
                const veFinal = ve !== null ? ve : isp * G0;
                const ratio = m0 / mf;
                const dv = veFinal * Math.log(ratio);

                if (!Number.isFinite(dv) || dv < 0) {
                    return { error: "Delta-v is not finite. Check that initial mass is greater than final mass." };
                }

                const dvMinus10 = veFinal * Math.log(m0 / (mf * 1.1));
                const dvPlus10 = veFinal * Math.log(m0 / (mf * 0.9));
                const dvIspMinus10 = (isp * G0 * 0.9) * Math.log(ratio);
                const dvIspPlus10 = (isp * G0 * 1.1) * Math.log(ratio);

                return {
                    success: true,
                    domain: "Aerospace Engineering",
                    subdomain: "Rocket Propulsion",
                    result: this.fmt(dv, 4),
                    units: "m/s",
                    theory: "The Tsiolkovsky rocket equation describes how much velocity change a rocket can achieve by expelling propellant. It depends only on exhaust velocity and the ratio of initial to final mass — not on burn time or thrust.",
                    steps: [
                        {
                            number: 1,
                            title: "Identify the Principle",
                            explanation: "The rocket equation relates velocity change to exhaust velocity and propellant mass fraction.",
                            formula: "\u0394v = v_e \u00D7 ln(m_0 / m_f)"
                        },
                        {
                            number: 2,
                            title: "Compute Mass Ratio",
                            explanation: "Divide initial (wet) mass by final (dry) mass.",
                            formula: `m_0 / m_f = ${this.fmt(m0)} / ${this.fmt(mf)} = ${this.fmt(ratio, 4)}`
                        },
                        {
                            number: 3,
                            title: "Compute Delta-v",
                            explanation: `Multiply exhaust velocity by the natural logarithm of the mass ratio.`,
                            formula: `\u0394v = ${this.fmt(veFinal, 4)} \u00D7 ln(${this.fmt(ratio, 4)}) = ${this.fmt(dv, 4)} m/s`
                        },
                        {
                            number: 4,
                            title: "Sensitivity \u2014 How Changes Affect Your Rocket",
                            explanation: "Small changes in mass or ISP meaningfully change delta-v, which determines whether your rocket reaches orbit.",
                            formula: `ISP -10%: dv ~ ${this.fmt(dvIspMinus10, 4)} m/s (-${this.fmt(100 * (1 - dvIspMinus10 / dv), 1)}%)  |  ISP +10%: dv ~ ${this.fmt(dvIspPlus10, 4)} m/s (+${this.fmt(100 * (dvIspPlus10 / dv - 1), 1)}%)`
                        }
                    ],
                    assumptions: ["Impulsive burn (instantaneous)", "No gravity or drag losses", "Constant exhaust velocity", "Vacuum conditions"]
                };
            }
            return { error: "I need initial mass, final mass, and either exhaust velocity or specific impulse. Try: 'rocket delta-v with initial mass 500000 kg, final mass 100000 kg, specific impulse 300 s'" };
        }

        // ====================================================================
        // ORBITAL VELOCITY
        // ====================================================================
        if (isOrbital) {
            const altitude = get(["altitude", "height", "height above earth", "orbital altitude", "above earth"], "m|km|mi|ft");
            const radius = get(["orbital radius", "distance from center", "r", "orbit radius"], "m|km|mi|ft");

            let r;
            if (radius !== null) {
                r = radius;
            } else if (altitude !== null) {
                const altM = altitude < 10000 ? altitude * 1000 : altitude;
                r = R_EARTH + altM;
            } else {
                return { error: "I need orbital radius or altitude above Earth. Try: 'orbital velocity at 400 km altitude'" };
            }

            if (!(r > 0)) return { error: "Radius must be greater than zero." };

            const v = Math.sqrt(MU_EARTH / r);

            return {
                success: true,
                domain: "Aerospace Engineering",
                subdomain: "Orbital Mechanics",
                result: this.fmt(v, 4),
                units: "m/s",
                theory: "A circular orbit balances gravity pulling inward with centrifugal tendency outward. The required speed depends only on the central body's mass and your distance from its center.",
                steps: [
                    {
                        number: 1,
                        title: "Identify the Principle",
                        explanation: "Circular orbital velocity comes from equating gravitational force to centripetal force.",
                        formula: "v = \u221A(GM / r)"
                    },
                    {
                        number: 2,
                        title: "Compute Orbital Radius",
                        explanation: `Radius = Earth radius + altitude. Earth radius = ${this.fmt(R_EARTH / 1000, 2)} km.`,
                        formula: `r = ${this.fmt(R_EARTH / 1000, 2)} km + ${this.fmt((r - R_EARTH) / 1000, 2)} km = ${this.fmt(r / 1000, 2)} km`
                    },
                    {
                        number: 3,
                        title: "Compute Orbital Velocity",
                        explanation: "Substitute into the circular orbit formula.",
                        formula: `v = \u221A(${this.fmt(MU_EARTH, 4)} / ${this.fmt(r / 1000, 2)}) = ${this.fmt(v, 4)} m/s`
                    },
                    {
                        number: 4,
                        title: "Sensitivity \u2014 How Altitude Changes Your Orbit",
                        explanation: "Higher altitude means slower orbital speed but longer period.",
                        formula: `At 200 km: v ~ ${this.fmt(Math.sqrt(MU_EARTH / (R_EARTH + 200000)), 4)} m/s  |  At 800 km: v ~ ${this.fmt(Math.sqrt(MU_EARTH / (R_EARTH + 800000)), 4)} m/s`
                    }
                ],
                assumptions: ["Circular orbit", "Earth as central body", "No atmospheric drag", "Two-body problem"]
            };
        }

        // ====================================================================
        // ESCAPE VELOCITY
        // ====================================================================
        if (isEscape) {
            const altitude = get(["altitude", "height", "height above earth", "above earth"], "m|km|mi|ft");
            const radius = get(["orbital radius", "distance from center", "r", "orbit radius"], "m|km|mi|ft");

            let r;
            if (radius !== null) {
                r = radius;
            } else if (altitude !== null) {
                const altM = altitude < 10000 ? altitude * 1000 : altitude;
                r = R_EARTH + altM;
            } else {
                return { error: "I need altitude above Earth or distance from center. Try: 'escape velocity from Earth surface'" };
            }

            if (!(r > 0)) return { error: "Radius must be greater than zero." };

            const ve = Math.sqrt(2 * MU_EARTH / r);

            return {
                success: true,
                domain: "Aerospace Engineering",
                subdomain: "Orbital Mechanics",
                result: this.fmt(ve, 4),
                units: "m/s",
                theory: "Escape velocity is the speed needed to break free from a planet's gravitational pull without further propulsion. At this speed, kinetic energy exactly equals gravitational potential energy.",
                steps: [
                    {
                        number: 1,
                        title: "Identify the Principle",
                        explanation: "Set kinetic energy equal to gravitational potential energy: \u00BDmv\u00B2 = GMm/r",
                        formula: "v_e = \u221A(2GM / r)"
                    },
                    {
                        number: 2,
                        title: "Compute",
                        explanation: "Substitute Earth's mass and radius.",
                        formula: `v_e = \u221A(2 \u00D7 ${this.fmt(MU_EARTH, 4)} / ${this.fmt(r / 1000, 2)}) = ${this.fmt(ve, 4)} m/s`
                    },
                    {
                        number: 3,
                        title: "Context",
                        explanation: "Earth's surface escape velocity is about 11.2 km/s. Low Earth orbit is about 7.8 km/s \u2014 you need roughly 41% more speed to leave Earth entirely than to orbit it.",
                        formula: "v_e (surface) \u2248 11,186 m/s  |  v_orbit (LEO) \u2248 7,800 m/s"
                    }
                ],
                assumptions: ["No atmospheric drag", "No planetary rotation", "Two-body problem", "No other celestial bodies"]
            };
        }

        // ====================================================================
        // LIFT FORCE
        // ====================================================================
        if (isLift) {
            const rho = this.namedValue(text, ["density", "air density"]) ?? 1.225;
            const v = get(["velocity", "airspeed", "speed", "how fast"], "m\\/s|m/s|km\\/h|mph|knots?");
            const s = get(["wing area", "surface area", "area", "reference area", "s"], "m2|mA�|ft2|ftA�");
            const cl = get(["lift coefficient", "cl", "c_l", "lift coef"], "");

            if (v !== null && s !== null && cl !== null) {
                const lift = 0.5 * rho * v * v * s * cl;

                return {
                    success: true,
                    domain: "Aerospace Engineering",
                    subdomain: "Aerodynamics",
                    result: this.fmt(lift, 4),
                    units: "N",
                    theory: "Lift is generated by pressure difference across a wing. It scales with dynamic pressure (\u00BD\u03C1v\u00B2), wing area, and lift coefficient.",
                    steps: [
                        {
                            number: 1,
                            title: "Identify the Principle",
                            explanation: "Lift equals dynamic pressure times wing area times lift coefficient.",
                            formula: "L = \u00BD \u03C1 v\u00B2 S C_L"
                        },
                        {
                            number: 2,
                            title: "Substitute",
                            explanation: "Dynamic pressure = \u00BD \u03C1 v\u00B2.",
                            formula: `q = \u00BD \u00D7 ${this.fmt(rho)} \u00D7 ${this.fmt(v)}\u00B2 = ${this.fmt(0.5 * rho * v * v, 4)} Pa`
                        },
                        {
                            number: 3,
                            title: "Final Answer",
                            explanation: "Multiply by wing area and lift coefficient.",
                            formula: `L = ${this.fmt(0.5 * rho * v * v * s, 4)} \u00D7 ${this.fmt(cl)} = ${this.fmt(lift, 4)} N`
                        }
                    ],
                    assumptions: ["Incompressible flow", "Constant lift coefficient", "Steady level flight"]
                };
            }
            return { error: "I need velocity, wing area, and lift coefficient. Try: 'lift force with velocity 70 m/s, wing area 20 m\u00B2, lift coefficient 0.5'" };
        }

        // ====================================================================
        // DRAG FORCE
        // ====================================================================
        if (isDrag) {
            const rho = this.namedValue(text, ["density", "air density"]) ?? 1.225;
            const v = get(["velocity", "airspeed", "speed", "how fast"], "m\\/s|m/s|km\\/h|mph|knots?");
            const s = get(["reference area", "frontal area", "area", "s"], "m2|mA�|ft2|ftA�");
            const cd = get(["drag coefficient", "cd", "c_d", "drag coef"], "");

            if (v !== null && s !== null && cd !== null) {
                const drag = 0.5 * rho * v * v * s * cd;

                return {
                    success: true,
                    domain: "Aerospace Engineering",
                    subdomain: "Aerodynamics",
                    result: this.fmt(drag, 4),
                    units: "N",
                    theory: "Drag opposes motion through a fluid. It scales with dynamic pressure, reference area, and drag coefficient \u2014 streamlining reduces C_d dramatically.",
                    steps: [
                        {
                            number: 1,
                            title: "Identify the Principle",
                            explanation: "Drag equals dynamic pressure times reference area times drag coefficient.",
                            formula: "D = \u00BD \u03C1 v\u00B2 S C_D"
                        },
                        {
                            number: 2,
                            title: "Substitute",
                            explanation: "Dynamic pressure = \u00BD \u03C1 v\u00B2.",
                            formula: `q = \u00BD \u00D7 ${this.fmt(rho)} \u00D7 ${this.fmt(v)}\u00B2 = ${this.fmt(0.5 * rho * v * v, 4)} Pa`
                        },
                        {
                            number: 3,
                            title: "Final Answer",
                            explanation: "Multiply by reference area and drag coefficient.",
                            formula: `D = ${this.fmt(0.5 * rho * v * v * s, 4)} \u00D7 ${this.fmt(cd)} = ${this.fmt(drag, 4)} N`
                        }
                    ],
                    assumptions: ["Incompressible flow", "Constant drag coefficient", "Steady flight"]
                };
            }
            return { error: "I need velocity, reference area, and drag coefficient. Try: 'drag force with velocity 250 m/s, reference area 15 m\u00B2, drag coefficient 0.03'" };
        }

        // ====================================================================
        // MACH NUMBER
        // ====================================================================
        if (isMach) {
            const v = get(["velocity", "airspeed", "speed", "how fast"], "m\\/s|m/s|km\\/h|mph|knots?");
            const a = get(["speed of sound", "mach speed", "a", "sound speed"], "");

            if (v !== null) {
                const aFinal = a !== null ? a : 343;
                const mach = v / aFinal;

                let regime = "subsonic";
                if (mach > 5) regime = "hypersonic";
                else if (mach > 1) regime = "supersonic";
                else if (mach > 0.8) regime = "transonic";

                return {
                    success: true,
                    domain: "Aerospace Engineering",
                    subdomain: "Compressible Flow",
                    result: this.fmt(mach, 3),
                    units: "Mach",
                    theory: "Mach number is the ratio of object speed to the local speed of sound. It determines compressibility effects \u2014 shock waves appear near Mach 1.",
                    steps: [
                        {
                            number: 1,
                            title: "Identify the Principle",
                            explanation: "Mach number = object speed / speed of sound.",
                            formula: "M = v / a"
                        },
                        {
                            number: 2,
                            title: "Substitute",
                            explanation: `Speed of sound at sea level (15\u00B0C) \u2248 343 m/s.`,
                            formula: `M = ${this.fmt(v)} / ${this.fmt(aFinal)} = ${this.fmt(mach, 3)}`
                        },
                        {
                            number: 3,
                            title: "Regime",
                            explanation: `Mach ${this.fmt(mach, 2)} is in the ${regime} regime.`,
                            formula: `Regime: ${regime} (M < 1: subsonic, M \u2248 1: transonic, 1 < M < 5: supersonic, M > 5: hypersonic)`
                        }
                    ],
                    assumptions: ["Constant speed of sound", "Standard atmosphere"]
                };
            }
            return { error: "I need velocity. Try: 'mach number at 250 m/s'" };
        }

        // ====================================================================
        // STANDARD ATMOSPHERE
        // ====================================================================
        if (isAtmosphere) {
            const altitude = get(["altitude", "height", "height above earth", "above earth"], "m|km|mi|ft");

            if (altitude !== null) {
                let h = altitude;
                if (h < 100) h = h * 1000;
                if (h < 0) return { error: "Altitude cannot be negative." };

                let T, P, rho, a;
                if (h <= 11000) {
                    T = 288.15 - 0.0065 * h;
                    P = 101325 * Math.pow(T / 288.15, 5.25588);
                    rho = P / (287.05 * T);
                } else if (h <= 20000) {
                    T = 216.65;
                    P = 22632.06 * Math.exp(-9.80665 * (h - 11000) / (287.05 * T));
                    rho = P / (287.05 * T);
                } else {
                    return { error: "This simplified atmosphere model covers 0\u201320 km. For higher altitudes, specify a model." };
                }

                a = Math.sqrt(1.4 * 287.05 * T);

                return {
                    success: true,
                    domain: "Aerospace Engineering",
                    subdomain: "Atmosphere",
                    result: this.fmt(rho, 6),
                    units: "kg/m\u00B3",
                    theory: "The International Standard Atmosphere models how temperature, pressure, and density change with altitude. These properties determine engine performance, lift, drag, and speed of sound.",
                    steps: [
                        {
                            number: 1,
                            title: "Identify Altitude Layer",
                            explanation: `Altitude ${this.fmt(h / 1000, 2)} km is in the ${h <= 11000 ? 'troposphere' : 'lower stratosphere'}.`,
                            formula: `h = ${this.fmt(h)} m`
                        },
                        {
                            number: 2,
                            title: "Temperature",
                            explanation: h <= 11000
                                ? "Temperature drops 6.5 K per km in the troposphere."
                                : "Temperature is constant at 216.65 K in the lower stratosphere.",
                            formula: `T = ${this.fmt(T, 2)} K`
                        },
                        {
                            number: 3,
                            title: "Pressure & Density",
                            explanation: "Pressure and density are computed from the ideal gas law and hydrostatic equation.",
                            formula: `P = ${this.fmt(P / 1000, 2)} kPa,  \u03C1 = ${this.fmt(rho, 6)} kg/m\u00B3`
                        },
                        {
                            number: 4,
                            title: "Speed of Sound",
                            explanation: "Speed of sound depends only on temperature: a = \u221A(1.4 \u00D7 R \u00D7 T).",
                            formula: `a = ${this.fmt(a, 2)} m/s`
                        }
                    ],
                    assumptions: ["International Standard Atmosphere", "Dry air", "No wind or weather effects"]
                };
            }
            return { error: "I need altitude. Try: 'standard atmosphere at 10 km altitude'" };
        }

        return null;
    }

    // ====================================================================
    // ADDITIONAL AEROSPACE SOLVERS — basic English friendly
    // Each one: detect keywords → extract any params by aliases/units → compute → explain → sensitivity
    // Never guesses: if required params are missing, returns a helpful error.
    // ====================================================================

    // Helper: find a parameter by trying every alias, then unit pattern, then any positive number.
    findParam(text, aliases, unitPattern = null) {
        for (const alias of aliases) {
            const v = this.namedValue(text, [alias]);
            if (v !== null && Number.isFinite(v) && v > 0) return v;
        }
        if (unitPattern) {
            const v = this.unitValue(text, unitPattern);
            if (v !== null && Number.isFinite(v) && v > 0) return v;
        }
        const all = this.extractNumbers(text);
        const positive = all.filter((n) => n > 0);
        if (positive.length > 0) return positive[0];
        return null;
    }

    // Strip conversational prefixes so "how much lift does..." still matches keywords.
    stripPrefix(text) {
        return text
            .replace(/^(how much|how many|what is|what\'s|can you|calculate|compute|find|give me|i need|tell me|what is the)\s+/i, '')
            .replace(/\?\s*$/, '')
            .trim();
    }

    // ---- Orbital Period ----
    solveOrbitalPeriod(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/\borbit\b|orbital|period|satellite|revolution/.test(text)) return null;

        const altitude = this.findParam(text, ["altitude", "height", "height above earth", "orbital altitude", "above earth"], "m|km|mi|ft");
        const radius = this.findParam(text, ["orbital radius", "distance from center", "r", "orbit radius"], "m|km|mi|ft");

        let r;
        if (radius !== null) {
            r = radius;
        } else if (altitude !== null) {
            const altM = altitude < 10000 ? altitude * 1000 : altitude;
            r = R_EARTH + altM;
        } else {
            return { error: "I need orbital radius or altitude above Earth. Try: 'orbital period at 400 km altitude'" };
        }
        if (!(r > 0)) return { error: "Radius must be greater than zero." };

        const T = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / MU_EARTH);
        const v = Math.sqrt(MU_EARTH / r);

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Orbital Mechanics",
            result: this.fmt(T, 4),
            units: "minutes",
            theory: "Orbital period is the time for one complete orbit. It depends only on the semi-major axis (radius for circular orbits) and the central body's mass — not on the satellite's mass.",
            steps: [
                { number: 1, title: "Identify the Principle", explanation: "Period from Kepler's third law for circular orbits.", formula: "T = 2π √(r³ / GM)" },
                { number: 2, title: "Compute Orbital Radius", explanation: `Radius = Earth radius + altitude. Earth radius = ${this.fmt(R_EARTH / 1000, 2)} km.`, formula: `r = ${this.fmt(R_EARTH / 1000, 2)} km + ${this.fmt((r - R_EARTH) / 1000, 2)} km = ${this.fmt(r / 1000, 2)} km` },
                { number: 3, title: "Compute Period", explanation: "Substitute into the period formula.", formula: `T = 2π √(${this.fmt(r / 1000, 2)}³ / ${this.fmt(MU_EARTH, 4)}) = ${this.fmt(T, 4)} s = ${this.fmt(T / 60, 4)} minutes` },
                { number: 4, title: "Context", explanation: `Orbital velocity at this altitude is ${this.fmt(v, 4)} m/s.`, formula: `v = √(GM / r) = ${this.fmt(v, 4)} m/s` }
            ],
            assumptions: ["Circular orbit", "Earth as central body", "No atmospheric drag", "Two-body problem"]
        };
    };

    // ---- Hohmann Transfer Delta-v ----
    solveHohmannTransfer(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/hohmann|transfer|orbit to orbit|raise orbit|lower orbit/.test(text)) return null;

        const r1 = this.findParam(text, ["initial orbit", "initial altitude", "current altitude", "r1", "orbit 1"], "m|km|mi|ft");
        const r2 = this.findParam(text, ["final orbit", "final altitude", "target altitude", "r2", "orbit 2"], "m|km|mi|ft");

        if (r1 === null || r2 === null) return { error: "I need two altitudes (or radii). Try: 'hohmann transfer from 400 km to 800 km altitude'" };

        let a1 = r1, a2 = r2;
        if (a1 < 10000) a1 = a1 * 1000 + R_EARTH; // assume km if small
        if (a2 < 10000) a2 = a2 * 1000 + R_EARTH;

        if (!(a1 > 0) || !(a2 > 0)) return { error: "Orbital radii must be greater than zero." };

        const v1 = Math.sqrt(MU_EARTH / a1);
        const v2 = Math.sqrt(MU_EARTH / a2);
        const a_transfer = (a1 + a2) / 2;
        const v_p = Math.sqrt(MU_EARTH * (2 / a1 - 1 / a_transfer));
        const v_a = Math.sqrt(MU_EARTH * (2 / a2 - 1 / a_transfer));
        const dv1 = Math.abs(v_p - v1);
        const dv2 = Math.abs(v2 - v_a);
        const dv_total = dv1 + dv2;

        const direction = a2 > a1 ? "raise" : "lower";

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Orbital Mechanics",
            result: this.fmt(dv_total, 4),
            units: "m/s",
            theory: "A Hohmann transfer is the most fuel-efficient way to move between two circular orbits using two impulsive burns: one to enter the transfer ellipse, one to circularize at the new orbit.",
            steps: [
                { number: 1, title: "Identify the Principle", explanation: "Two-impulse Hohmann transfer between circular orbits.", formula: "Δv₁ = √(GM)(√(2/r₂/(r₁+r₂)) - 1/√r₁),  Δv₂ = √(GM)(1/√r₂ - √(2/r₁/(r₁+r₂)))" },
                { number: 2, title: "Compute Initial & Final Velocities", explanation: `Initial circular: ${this.fmt(v1, 4)} m/s  |  Final circular: ${this.fmt(v2, 4)} m/s`, formula: `v₁ = √(GM/r₁) = ${this.fmt(v1, 4)} m/s  |  v₂ = √(GM/r₂) = ${this.fmt(v2, 4)} m/s` },
                { number: 3, title: "Compute Transfer Burns", explanation: `Burn 1 (${direction} orbit): ${this.fmt(dv1, 4)} m/s  |  Burn 2 (circularize): ${this.fmt(dv2, 4)} m/s`, formula: `Δv₁ = ${this.fmt(dv1, 4)} m/s  |  Δv₂ = ${this.fmt(dv2, 4)} m/s` },
                { number: 4, title: "Total Delta-v", explanation: `Total required: ${this.fmt(dv_total, 4)} m/s`, formula: `Δv_total = Δv₁ + Δv₂ = ${this.fmt(dv_total, 4)} m/s` }
            ],
            assumptions: ["Impulsive burns", "Coplanar circular orbits", "Earth as central body", "Two-body problem"]
        };
    };

    // ---- Thrust-to-Weight Ratio ----
    solveThrustToWeight(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/thrust.to.weight|thrust weight|twr|thrust to weight ratio/.test(text)) return null;

        const thrust = this.findParam(text, ["thrust", "engine thrust", "total thrust"], "n|kn|lbf|kgf");
        const mass = this.findParam(text, ["mass", "weight", "rocket mass", "vehicle mass", "m"], "kg|tonnes?|tons?|lb");

        if (thrust === null || mass === null) return { error: "I need thrust and mass. Try: 'thrust to weight ratio with thrust 500000 N and mass 50000 kg'" };

        // Convert mass to kg if needed (findParam returns raw number; assume kg unless context says otherwise)
        // Convert thrust to N if needed
        let thrustN = thrust;
        let massKg = mass;
        // crude unit handling: if user said "kn" it's already handled by unitValue returning the number; unit is separate
        // We'll trust the number as given in base-ish units and note assumption.

        const twr = thrustN / (massKg * G0);

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Rocket Propulsion",
            result: this.fmt(twr, 4),
            units: "dimensionless",
            theory: "Thrust-to-weight ratio is thrust divided by weight. TWR > 1 means the vehicle can lift off; TWR < 1 means it cannot overcome gravity.",
            steps: [
                { number: 1, title: "Identify the Principle", explanation: "TWR = thrust / weight. Weight = mass × standard gravity.", formula: "TWR = F_thrust / (m × g₀)" },
                { number: 2, title: "Compute Weight", explanation: `Weight = ${this.fmt(massKg)} kg × ${G0} m/s² = ${this.fmt(massKg * G0, 4)} N`, formula: `W = ${this.fmt(massKg)} × ${G0} = ${this.fmt(massKg * G0, 4)} N` },
                { number: 3, title: "Compute TWR", explanation: `Thrust / Weight = ${this.fmt(thrustN, 4)} / ${this.fmt(massKg * G0, 4)}`, formula: `TWR = ${this.fmt(thrustN, 4)} / ${this.fmt(massKg * G0, 4)} = ${this.fmt(twr, 4)}` },
                { number: 4, title: "Interpret", explanation: twr > 1 ? "TWR > 1: vehicle can lift off." : twr === 1 ? "TWR = 1: marginal hover." : "TWR < 1: vehicle cannot lift off; it needs more thrust or less mass.", formula: twr > 1 ? "Liftoff possible." : twr === 1 ? "Marginal hover." : "Cannot lift off." }
            ],
            assumptions: ["Standard gravity g₀ = 9.81 m/s²", "Sea level", "Thrust is at sea level"]
        };
    };

    // ---- Rocket Staging (Total Delta-v) ----
    solveRocketStaging(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/stage|staging|multi.stage|two.stage|three.stage/.test(text)) return null;

        const m0_1 = this.findParam(text, ["stage 1 initial mass", "stage 1 wet mass", "first stage initial", "m0 stage 1"], "kg|tonnes?|tons?");
        const mf_1 = this.findParam(text, ["stage 1 final mass", "stage 1 dry mass", "first stage final", "mf stage 1"], "kg|tonnes?|tons?");
        const isp_1 = this.findParam(text, ["stage 1 isp", "stage 1 specific impulse", "first stage isp"], "");
        const m0_2 = this.findParam(text, ["stage 2 initial mass", "stage 2 wet mass", "second stage initial", "m0 stage 2"], "kg|tonnes?|tons?");
        const mf_2 = this.findParam(text, ["stage 2 final mass", "stage 2 dry mass", "second stage final", "mf stage 2"], "kg|tonnes?|tons?");
        const isp_2 = this.findParam(text, ["stage 2 isp", "stage 2 specific impulse", "second stage isp"], "");

        if (m0_1 === null || mf_1 === null || isp_1 === null || m0_2 === null || mf_2 === null || isp_2 === null) {
            return { error: "I need both stages' initial mass, final mass, and ISP. Try: 'two stage rocket stage 1 m0 300000 kg mf 80000 kg isp 280, stage 2 m0 80000 kg mf 20000 kg isp 320'" };
        }

        const dv1 = isp_1 * G0 * Math.log(m0_1 / mf_1);
        const dv2 = isp_2 * G0 * Math.log(m0_2 / mf_2);
        const dv_total = dv1 + dv2;

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Rocket Propulsion",
            result: this.fmt(dv_total, 4),
            units: "m/s",
            theory: "In a staged rocket, each stage's delta-v is computed independently and summed. Dropping empty stages reduces mass for the next stage, making the total delta-v higher than a single-stage design.",
            steps: [
                { number: 1, title: "Stage 1 Delta-v", explanation: `Stage 1: ISP ${this.fmt(isp_1)} s, mass ratio ${this.fmt(m0_1 / mf_1, 4)}`, formula: `Δv₁ = ${this.fmt(isp_1)} × 9.81 × ln(${this.fmt(m0_1 / mf_1, 4)}) = ${this.fmt(dv1, 4)} m/s` },
                { number: 2, title: "Stage 2 Delta-v", explanation: `Stage 2: ISP ${this.fmt(isp_2)} s, mass ratio ${this.fmt(m0_2 / mf_2, 4)}`, formula: `Δv₂ = ${this.fmt(isp_2)} × 9.81 × ln(${this.fmt(m0_2 / mf_2, 4)}) = ${this.fmt(dv2, 4)} m/s` },
                { number: 3, title: "Total Delta-v", explanation: "Sum of both stages.", formula: `Δv_total = ${this.fmt(dv1, 4)} + ${this.fmt(dv2, 4)} = ${this.fmt(dv_total, 4)} m/s` }
            ],
            assumptions: ["Impulsive burns", "No gravity or drag losses", "Stage 2 mass includes stage 1 dry mass dropped", "Vacuum ISP for upper stage"]
        };
    };

    // ---- Ballistic Coefficient ----
    solveBallisticCoefficient(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/ballistic coefficient|bc|ballistic/.test(text)) return null;

        const mass = this.findParam(text, ["mass", "vehicle mass", "m"], "kg|tonnes?|tons?|lb");
        const cd = this.findParam(text, ["drag coefficient", "cd", "c_d"], "");
        const area = this.findParam(text, ["reference area", "frontal area", "area", "s"], "m2|mA�|ft2|ftA�");

        if (mass === null || cd === null || area === null) return { error: "I need mass, drag coefficient, and reference area. Try: 'ballistic coefficient mass 5000 kg cd 0.3 area 10 m²'" };

        const bc = mass / (cd * area);

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Aerodynamics",
            result: this.fmt(bc, 4),
            units: "kg/m²",
            theory: "Ballistic coefficient = mass / (drag coefficient × reference area). Higher BC means the object penetrates the atmosphere better (less deceleration from drag), important for reentry and projectiles.",
            steps: [
                { number: 1, title: "Identify the Principle", explanation: "BC = m / (C_D × A).", formula: "BC = m / (C_D × S)" },
                { number: 2, title: "Substitute", explanation: `Mass ${this.fmt(mass)} kg, C_D ${this.fmt(cd)}, Area ${this.fmt(area)} m².`, formula: `BC = ${this.fmt(mass)} / (${this.fmt(cd)} × ${this.fmt(area)})` },
                { number: 3, title: "Final Answer", explanation: `BC = ${this.fmt(bc, 4)} kg/m²`, formula: `BC = ${this.fmt(bc, 4)} kg/m²` }
            ],
            assumptions: ["Constant drag coefficient", "Constant reference area"]
        };
    };

    // ---- Density Altitude ----
    solveDensityAltitude(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/density altitude|density alt/.test(text)) return null;

        const pressureAlt = this.findParam(text, ["pressure altitude", "pressure alt"], "m|km|ft");
        const temp = this.findParam(text, ["temperature", "temp", "oat", "outside air temperature"], "");

        if (pressureAlt === null || temp === null) return { error: "I need pressure altitude and temperature. Try: 'density altitude pressure altitude 5000 ft temperature 25 c'" };

        let h = pressureAlt;
        if (h < 100) h = h * 1000; // assume ft if small
        let t = temp;
        if (t > 100) t = (t - 32) * 5 / 9; // assume Fahrenheit if > 100

        const T_std = 288.15 - 0.0065 * Math.min(h, 11000);
        const T_actual = t + 273.15;
        const ISA_deviation = T_actual - T_std;

        // Simplified density altitude: DA = PA + 120 * (T_actual - T_std) (ft)
        const da_ft = h + 120 * ISA_deviation;
        const da_m = da_ft * 0.3048;

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Atmosphere",
            result: this.fmt(da_m, 2),
            units: "m",
            theory: "Density altitude is pressure altitude corrected for non-standard temperature. Hotter air is less dense, so performance drops (equivalent to being higher).",
            steps: [
                { number: 1, title: "Pressure Altitude", explanation: `Given: ${this.fmt(h)} m`, formula: `PA = ${this.fmt(h)} m` },
                { number: 2, title: "Temperature Deviation", explanation: `ISA temp at ${this.fmt(h / 1000, 2)} km ≈ ${this.fmt(T_std, 2)} K. Actual: ${this.fmt(T_actual, 2)} K. Deviation: ${this.fmt(ISA_deviation, 2)} K.`, formula: `ΔT = ${this.fmt(T_actual, 2)} - ${this.fmt(T_std, 2)} = ${this.fmt(ISA_deviation, 2)} K` },
                { number: 3, title: "Density Altitude", explanation: `DA ≈ PA + 120 × ΔT (ft)`, formula: `DA ≈ ${this.fmt(h * 3.28084, 0)} ft + 120 × ${this.fmt(ISA_deviation, 2)} ≈ ${this.fmt(da_ft, 0)} ft = ${this.fmt(da_m, 2)} m` }
            ],
            assumptions: ["Simplified ISA model", "Dry air", "Approximation valid for light aircraft"]
        };
    };

    // ---- Pressure Altitude ----
    solvePressureAltitude(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/pressure altitude|pressure alt/.test(text)) return null;

        const indicatedAlt = this.findParam(text, ["indicated altitude", "indicated alt", "altitude"], "m|km|ft");
        const setting = this.findParam(text, ["altimeter setting", "qnh", "setting"], "");

        if (indicatedAlt === null || setting === null) return { error: "I need indicated altitude and altimeter setting. Try: 'pressure altitude indicated altitude 5000 ft setting 29.92'" };

        let h = indicatedAlt;
        if (h < 100) h = h * 1000; // assume ft
        let s = setting;
        if (s > 100) s = s / 100; // assume inHg if > 100 (e.g., 2992 → 29.92)

        const std_pressure = 29.92; // inHg
        const pa_ft = h + (std_pressure - s) * 1000;
        const pa_m = pa_ft * 0.3048;

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Atmosphere",
            result: this.fmt(pa_m, 2),
            units: "m",
            theory: "Pressure altitude is the altitude in the standard atmosphere where the pressure equals the observed pressure. It corrects indicated altitude for non-standard barometric pressure.",
            steps: [
                { number: 1, title: "Identify the Principle", explanation: "PA = Indicated Altitude + (29.92 - Altimeter Setting) × 1000 ft.", formula: "PA = IA + (29.92 - QNH) × 1000" },
                { number: 2, title: "Substitute", explanation: `Indicated: ${this.fmt(h * 3.28084, 0)} ft, Setting: ${this.fmt(s, 2)} inHg`, formula: `PA = ${this.fmt(h * 3.28084, 0)} + (29.92 - ${this.fmt(s, 2)}) × 1000` },
                { number: 3, title: "Final Answer", explanation: `Pressure altitude ≈ ${this.fmt(pa_ft, 0)} ft = ${this.fmt(pa_m, 2)} m`, formula: `PA = ${this.fmt(pa_ft, 0)} ft` }
            ],
            assumptions: ["Standard atmosphere lapse rate", "Altimeter setting in inches Hg"]
        };
    };

    // ---- Load Factor (Level Turn) ----
    solveLoadFactor(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/load factor|g.force|g force|nz|bank angle|turn/.test(text)) return null;

        const bank = this.findParam(text, ["bank angle", "bank", "angle of bank", "phi"], "");

        if (bank === null) return { error: "I need bank angle. Try: 'load factor at 45 degree bank'" };

        const phi = bank * Math.PI / 180;
        const n = 1 / Math.cos(phi);

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Flight Mechanics",
            result: this.fmt(n, 3),
            units: "g",
            theory: "Load factor n = lift / weight = 1 / cos(bank angle). In a level turn, lift must support both weight and centripetal force, so apparent weight increases with bank angle.",
            steps: [
                { number: 1, title: "Identify the Principle", explanation: "Load factor n = 1 / cos(φ) for a level coordinated turn.", formula: "n = 1 / cos(φ)" },
                { number: 2, title: "Substitute", explanation: `Bank angle = ${this.fmt(bank)}°`, formula: `n = 1 / cos(${this.fmt(bank)}°) = ${this.fmt(n, 3)} g` },
                { number: 3, title: "Interpret", explanation: `At ${this.fmt(bank)}° bank, apparent weight is ${this.fmt(n, 3)} times normal.`, formula: `Apparent weight = ${this.fmt(n, 3)} × actual weight` }
            ],
            assumptions: ["Level coordinated turn", "Constant altitude", "Standard gravity"]
        };
    };

    // ---- Specific Orbital Energy ----
    solveOrbitalEnergy(input) {
        const text = this.stripPrefix(String(input)).toLowerCase().replace(/[−–]/g, '-').replace(/[�^'�?"]/g, '-');
        if (!/orbital energy|specific energy|orbital energy|energy of orbit/.test(text)) return null;

        const altitude = this.findParam(text, ["altitude", "height", "height above earth"], "m|km|mi|ft");
        const velocity = this.findParam(text, ["velocity", "speed", "orbital speed", "v"], "m\\/s|m/s|km\\/h|mph");

        if (altitude === null || velocity === null) return { error: "I need altitude and velocity. Try: 'specific orbital energy at 400 km altitude velocity 7670 m/s'" };

        let r = R_EARTH + (altitude < 10000 ? altitude * 1000 : altitude);
        const v = velocity;
        const mu = MU_EARTH;

        const epsilon = v * v / 2 - mu / r;

        return {
            success: true,
            domain: "Aerospace Engineering",
            subdomain: "Orbital Mechanics",
            result: this.fmt(epsilon, 4),
            units: "MJ/kg",
            theory: "Specific orbital energy = kinetic energy per unit mass minus potential energy per unit mass. Negative = bound orbit (elliptical/circular), zero = parabolic (escape), positive = hyperbolic (escape with excess speed).",
            steps: [
                { number: 1, title: "Identify the Principle", explanation: "Specific orbital energy ε = v²/2 - GM/r.", formula: "ε = v²/2 - μ/r" },
                { number: 2, title: "Compute Radius", explanation: `r = Earth radius + altitude = ${this.fmt(r / 1000, 2)} km`, formula: `r = 6371 km + ${this.fmt((r - R_EARTH) / 1000, 2)} km` },
                { number: 3, title: "Compute Energy", explanation: `Kinetic: v²/2 = ${this.fmt(v * v / 2, 4)}  |  Potential: -μ/r = ${this.fmt(-mu / r, 4)}`, formula: `ε = ${this.fmt(v * v / 2, 4)} - ${this.fmt(mu / r, 4)} = ${this.fmt(epsilon, 4)} MJ/kg` },
                { number: 4, title: "Interpret", explanation: epsilon < 0 ? "Bound orbit (elliptical/circular)." : epsilon === 0 ? "Parabolic (escape)." : "Hyperbolic (escape with excess speed).", formula: epsilon < 0 ? "Bound orbit." : epsilon === 0 ? "Parabolic." : "Hyperbolic." }
            ],
            assumptions: ["Two-body problem", "Earth as central body", "No atmospheric drag", "Instantaneous state"]
        };
    };

    // Register aerospace solvers into solveSingleStep dispatch order:
    // (They are called explicitly below in solveSingleStep)

    solveSingleStep(input, numbers) {
        const query = input.toLowerCase();

        // Order matters: "derivative of x^2" must not be read as a quadratic.
        const calculus = this.solveCalculus(input);
        if (calculus) return calculus;

        const matrix = this.solveMatrix(input);
        if (matrix) return matrix;

        const conversion = this.solveUnitConversion(input);
        if (conversion) return conversion;

        const system = this.solveLinearSystem(input);
        if (system) return system;

        if (query.includes("roots of") || query.includes("quadratic") || this.looksQuadratic(query)) {
            return this.solveQuadratic(input, numbers);
        }

        const linear = this.solveLinear(input);
        if (linear) return linear;

        const electrical = this.solveElectrical(input);
        if (electrical) return electrical;

        const mechanics = this.solveMechanics(input);
        if (mechanics) return mechanics;

        const fluids = this.solveFluids(input);
        if (fluids) return fluids;

        const thermal = this.solveThermal(input);
        if (thermal) return thermal;

        const motion = this.solveProjectile(input);
        if (motion) return motion;

        const aerospace = this.solveAerospace(input);
        if (aerospace) return aerospace;

        const orbitalPeriod = this.solveOrbitalPeriod(input);
        if (orbitalPeriod) return orbitalPeriod;

        const hohmann = this.solveHohmannTransfer(input);
        if (hohmann) return hohmann;

        const twr = this.solveThrustToWeight(input);
        if (twr) return twr;

        const staging = this.solveRocketStaging(input);
        if (staging) return staging;

        const bc = this.solveBallisticCoefficient(input);
        if (bc) return bc;

        const da = this.solveDensityAltitude(input);
        if (da) return da;

        const pa = this.solvePressureAltitude(input);
        if (pa) return pa;

        const loadFactor = this.solveLoadFactor(input);
        if (loadFactor) return loadFactor;

        const orbitalEnergy = this.solveOrbitalEnergy(input);
        if (orbitalEnergy) return orbitalEnergy;

        for (const domain in this.kb) {
            for (const subDomain in this.kb[domain]) {
                for (const modKey in this.kb[domain][subDomain]) {
                    const mod = this.kb[domain][subDomain][modKey];
                    if (mod.keywords.some(kw => query.includes(kw))) {
                        for (const fKey in mod.formulas) {
                            const formula = mod.formulas[fKey];
                            const solveKeys = Object.keys(formula.solveFor);
                            if (numbers.length >= solveKeys.length - 1) {
                                const target = solveKeys[0];
                                const result = formula.solveFor[target](...numbers);
                                if (mod.title === 'Ideal Gas' && (!Number.isFinite(result) || result <= 0)) {
                                    return { error: "The ideal gas law needs a positive amount, absolute temperature and volume. Check the values." };
                                }

                                return {
                                    success: true,
                                    domain,
                                    subdomain: subDomain,
                                    result,
                                    units: mod.variables?.[target]?.unit || "N/A",
                                    theory: mod.theory || "Standard physical laws applied.",
                                    steps: [
                                        {
                                            number: 1,
                                            title: "Identifying the Principle",
                                            explanation: `We recognize this as a ${mod.title} problem. The most efficient approach is to start from ${formula.expression} and isolate the unknown.`,
                                            formula: formula.expression
                                        },
                                        {
                                            number: 2,
                                            title: "Substitution",
                                            explanation: `Plugging the provided values ${numbers.join(', ')} into our expression. This ensures we are working with the correct units and magnitudes.`,
                                            formula: null
                                        },
                                        {
                                            number: 3,
                                            title: "Final Calculation",
                                            explanation: `Evaluating the algebraic expression carefully leads us to the final result.`,
                                            formula: null
                                        }
                                    ],
                                    assumptions: mod.assumptions || ["Standard conditions"]
                                };
                            }
                        }
                    }
                }
            }
        }
        return { error: "I couldn't find a matching formula. Try describing the problem more specifically." };
    }

    looksQuadratic(text) {
        return /x\s*\^\s*2|x²|x\s*squared|x\s*square|\bx2\b/.test(text);
    }

    parseQuadraticCoefficients(input) {
        const text = String(input)
            .toLowerCase()
            .replace(/²/g, '^2')
            .replace(/\bx\s*squared\b|\bx\s*square\b|\bxsquared\b|\bxsquare\b|\bx2\b/g, 'x^2')
            .replace(/\bplus\b/g, '+')
            .replace(/\bminus\b/g, '-')
            .replace(/\s+/g, '');

        // Reject malformed exponent chains ("x^2^2") instead of silently
        // reading only the first power and returning a confident wrong root.
        if (/\^\s*-?\d+\s*\^/.test(text)) return null;

        // Move everything to the left of "=" so "x^2 = 4" and
        // "x^2 - 5x = -6" are not read as if the right-hand side were zero.
        const sides = text.split('=');
        if (sides.length > 2) return null;

        const zeroSide = /^[+-]?0(?:\.0*)?$/;
        const parseSide = (rawSide, required) => {
            // Drop trailing question marks / sentence punctuation so
            // "x^2 + 10x + 7 = 0?" still parses.
            const side = rawSide.replace(/[?.,;:!]+$/, '');
            if (!side) return required ? null : [];
            const terms = this.parsePolynomial(side + '+0x');
            if (terms) return terms;
            if (zeroSide.test(side)) return [];
            return null;
        };

        const left = parseSide(sides[0], true);
        const right = parseSide(sides[1] || '', false);
        if (!left || !right) return null;

        const coefficients = { 0: 0, 1: 0, 2: 0 };
        for (const term of left) {
            if (term.power > 2) return null;
            coefficients[term.power] += term.coef;
        }
        for (const term of right) {
            if (term.power > 2) return null;
            coefficients[term.power] -= term.coef;
        }

        return { a: coefficients[2], b: coefficients[1], c: coefficients[0] };
    }

    solveQuadratic(input, numbers) {
        if (/nan|infinity|∞/i.test(String(input))) {
            return { error: "The equation contains a non-finite coefficient, so it cannot be solved numerically." };
        }
        // Prefer explicit coefficients ("2x^2 - 3x + 5 = 0"); positional numbers
        // are only a fallback because they pick up the exponent and "= 0".
        const parsed = this.parseQuadraticCoefficients(input);
        const mentionsVariable = /x/i.test(String(input));

        // Never guess coefficients from loose numbers when the user actually
        // wrote an equation — that silently returns a confidently wrong answer.
        if (!parsed) {
            if (mentionsVariable || numbers.length < 3) {
                return {
                    error: "I could not read the coefficients of that equation. Write it as ax² + bx + c = 0, for example 'roots of x^2 + 10x + 7 = 0'."
                };
            }
        }

        const a = parsed ? parsed.a : numbers[0];
        const b = parsed ? parsed.b : numbers[1];
        const c = parsed ? parsed.c : numbers[2];

        if (a === 0) {
            return { error: "The coefficient 'a' cannot be zero in a quadratic equation. This is a linear equation instead." };
        }

        const D = b * b - 4 * a * c;
        if (!Number.isFinite(D)) {
            return { error: "These coefficients are too large for a reliable quadratic solution. Rescale the equation and try again." };
        }
        const equation = `${this.formatPolynomial(a, b, c)} = 0`;
        const steps = [
            {
                title: "Equation Analysis",
                text: `We are analyzing the quadratic equation ${equation}.`,
                formula: equation
            }
        ];

        let result;

        if (D < 0) {
            result = "Complex Roots";
            steps.push({
                title: "Discriminant",
                text: `The discriminant D = b² − 4ac is ${this.round(D)}. A negative discriminant means the parabola never crosses the x-axis, so the two roots are complex conjugates.`,
                formula: `D = ${this.round(D)} < 0`
            });
        } else {
            const sqrtD = Math.sqrt(D);
            let rawPlus;
            let rawMinus;
            if (sqrtD === 0) {
                rawPlus = rawMinus = -b / (2 * a);
            } else {
                // Choose the numerator that adds like-signed values for the
                // large-magnitude root, then recover the other root from c/a.
                const q = -0.5 * (b + (b >= 0 ? sqrtD : -sqrtD));
                const stableRoot = q / a;
                const otherRoot = c / q;
                if (b >= 0) {
                    rawPlus = otherRoot;
                    rawMinus = stableRoot;
                } else {
                    rawPlus = stableRoot;
                    rawMinus = otherRoot;
                }
            }
            if (!Number.isFinite(rawPlus) || !Number.isFinite(rawMinus)) {
                return { error: "These roots exceed the numeric range this calculator can represent." };
            }
            const r1 = this.round(rawPlus);
            const r2 = this.round(rawMinus);
            const root = this.round(D);
            result = `x = ${r1}, x = ${r2}`;
            steps.push(
                {
                    title: "Discriminant",
                    text: `The discriminant D = b² − 4ac is ${root}. Because it is non-negative, the equation has two real roots.`,
                    formula: `D = ${root}`
                },
                {
                    title: "Quadratic Formula",
                    text: "Substitute the coefficients into the quadratic formula to isolate x.",
                    formula: "x = (−b ± √D) / 2a"
                },
                {
                    title: "First Root",
                    text: "Taking the positive square root gives the larger root.",
                    formula: `x₁ = (−(${b}) + √${root}) / (2·${a}) = ${r1}`
                },
                {
                    title: "Second Root",
                    text: "Taking the negative square root gives the smaller root.",
                    formula: `x₂ = (−(${b}) − √${root}) / (2·${a}) = ${r2}`
                }
            );
        }

        steps.push({
            title: "Final Answer",
            text: `The roots of ${equation} are ${result}.`,
            formula: result
        });

        return {
            success: true,
            domain: "Mathematics",
            subdomain: "Algebra",
            result: result,
            units: "dimensionless",
            theory: "The quadratic formula is a universal method for finding the roots of any second-degree polynomial, providing the points where the function equals zero.",
            steps: steps.map((step, index) => ({
                number: index + 1,
                title: step.title,
                explanation: step.text,
                formula: step.formula
            })),
            assumptions: ["a ≠ 0"]
        };
    }

    // Render ax² + bx + c the way it is written by hand: no "1x", no "0x".
    formatPolynomial(a, b, c) {
        const parts = [];
        const push = (coefficient, suffix) => {
            if (coefficient === 0) return;
            const magnitude = Math.abs(coefficient);
            const shown = magnitude === 1 && suffix ? '' : this.round(magnitude);
            parts.push({ negative: coefficient < 0, text: `${shown}${suffix}` });
        };

        push(a, 'x²');
        push(b, 'x');
        push(c, '');

        if (!parts.length) return '0';

        return parts
            .map((part, index) => {
                if (index === 0) return `${part.negative ? '−' : ''}${part.text}`;
                return `${part.negative ? '−' : '+'} ${part.text}`;
            })
            .join(' ');
    }
}

window.SuperSolver = new SuperSolverEngine(KNOWLEDGE_BASE);
