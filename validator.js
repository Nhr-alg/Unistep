/**
 * UniStep Validation Framework
 *
 * This module allows the calculator to "self-train" by running its
 * solver against a Golden Set of verified problems.
 */

class SolverValidator {
    constructor(solver, testSuite) {
        this.solver = solver;
        this.testSuite = Array.isArray(testSuite) ? testSuite : [];
    }

    async runFullSuite() {
        const results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            details: []
        };

        if (!this.solver || typeof this.solver.solve !== 'function') {
            return { ...results, error: "Solver is not available." };
        }

        for (const test of this.testSuite) {
            if (!test || typeof test.text !== 'string') {
                results.skipped++;
                continue;
            }

            let response;
            try {
                const numbers = typeof this.solver.extractNumbers === 'function'
                    ? this.solver.extractNumbers(test.text)
                    : [];
                response = this.solver.solve(test.text, numbers);
            } catch (err) {
                response = { success: false, error: err.message };
            }

            const isCorrect = this.verifyResult(response, test.expected);

            if (isCorrect) results.passed++;
            else results.failed++;

            results.details.push({
                id: test.id,
                input: test.text,
                expected: test.expected,
                actual: response && response.success ? response.result : response && response.error,
                status: isCorrect ? "✅ PASS" : "❌ FAIL"
            });
        }
        return results;
    }

    verifyResult(response, expected) {
        if (!response || !response.success) return false;

        const actual = response.result;

        // Numerical answers: compare with a small relative tolerance.
        if (typeof expected === 'number') {
            // A scalar golden answer must be matched by one scalar result.
            // Accepting any matching array member can hide extra wrong values.
            if (Array.isArray(actual)) return false;
            const numeric = typeof actual === 'number' ? actual : Number(actual);
            if (!Number.isFinite(numeric)) return false;
            const scale = Math.max(1, Math.abs(expected), Math.abs(numeric));
            return Math.abs(numeric - expected) <= 1e-9 * scale;
        }

        // Symbolic answers: normalize whitespace/case and require an exact match.
        const normalize = (value) => String(value ?? '').toLowerCase().replace(/\s+/g, '');
        const wanted = normalize(expected);

        const candidates = Array.isArray(actual) ? actual : [actual];
        return candidates.some((value) => normalize(value) === wanted);
    }
}

// Initialize Validator (testSuite falls back to [] when tests are unavailable)
window.Validator = new SolverValidator(window.SuperSolver, window.TEST_SUITE);
