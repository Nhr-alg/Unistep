/**
 * UniStep Professional NLP & Unit Engine
 *
 * FINAL INTEGRATED VERSION
 * Features:
 * - Command Handling (Retry, Clear, Help)
 * - Session State Management
 * - Basic Unit Normalization
 * - Step-by-Step Reasoning
 */

class UniStepNLP {
    constructor(solver) {
        this.solver = solver;
        this.conversions = {
            'km/h': 1 / 3.6,
            'cm': 0.01,
            'mm': 0.001,
            'g': 0.001,
            'min': 60,
            'hour': 3600,
            'deg': (val) => val * Math.PI / 180
        };
    }

    normalizeValue(val, unit) {
        if (!unit) return val;
        const u = unit.toLowerCase();
        if (this.conversions[u]) {
            const conv = this.conversions[u];
            return typeof conv === 'function' ? conv(val) : val * conv;
        }
        return val;
    }

    solve(input) {
        // 1. Input Sanitization
        if (!input || typeof input !== 'string' || input.trim().length === 0) {
            return { error: "Please provide a valid problem description." };
        }

        const sanitizedInput = input.trim();

        // 2. Check for system commands first via CommandHandler
        const cmd = window.CommandHandler.handle(sanitizedInput);
        if (cmd) {
            if (cmd.action === "CLEAR") {
                window.Session.clear();
                return { error: "Session cleared. Ready for a new problem!" };
            }
            if (cmd.action === "HELP") {
                return { error: "Welcome! Enter a physics, chemistry, or math problem. I can handle symbolic ratios (e.g., 'ratio of KE for a sphere') and numerical problems." };
            }
            if (cmd.action === "RETRY") {
                const last = window.Session.getLastProblem();
                if (!last) return { error: "No previous problem found to retry." };
                return this.solve(last);
            }
        }

        // 3. Normal Problem Solving Pipeline with Safe-Solve Wrapper
        try {
            // Delegate number extraction to the solver so exponents ("m/s^2")
            // and scientific notation are handled in exactly one place.
            const values = typeof this.solver.extractNumbers === 'function'
                ? this.solver.extractNumbers(sanitizedInput)
                : (sanitizedInput.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi) || []).map(parseFloat);

            const result = this.solver.solve(sanitizedInput, values);

            // Store for "Retry" functionality
            if (result.success) {
                window.Session.setLastProblem(sanitizedInput, result);
            }

            return result;
        } catch (err) {
            console.error("Solver Crash Detected:", err);
            return {
                error: "Our symbolic engine encountered an unexpected edge case while processing this derivation. Please try rephrasing the problem or check for missing values."
            };
        }
    }
}

window.UniStepNLP = new UniStepNLP(window.SuperSolver);
