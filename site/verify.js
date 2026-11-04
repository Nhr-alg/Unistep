/**
 * Runs the published golden test set in the visitor's browser and renders
 * the raw result. No network, no cached answers — this is the same validator
 * the project runs before shipping.
 */

(function () {
    'use strict';

    const button = document.getElementById('verify-run');
    const body = document.getElementById('verify-results');
    const summary = document.getElementById('verify-summary');

    function cell(text, className) {
        const td = document.createElement('td');
        if (className) td.className = className;
        td.textContent = text === undefined || text === null ? '' : String(text);
        return td;
    }

    function render(details) {
        body.replaceChildren();
        details.forEach((detail) => {
            const row = document.createElement('tr');
            const passed = detail.status.indexOf('PASS') !== -1;

            const status = document.createElement('td');
            const badge = document.createElement('span');
            badge.className = 'verify-badge ' + (passed ? 'pass' : 'fail');
            badge.textContent = passed ? 'Pass' : 'Fail';
            status.appendChild(badge);

            row.appendChild(status);
            row.appendChild(cell(detail.input, 'verify-input'));
            row.appendChild(cell(detail.expected, 'verify-expected'));
            row.appendChild(cell(detail.actual, 'verify-actual'));
            body.appendChild(row);
        });
    }

    async function run() {
        if (!button || !body || !summary) return;

        button.disabled = true;
        summary.className = 'verify-summary';
        summary.textContent = 'Running…';

        try {
            if (!window.Validator || typeof window.Validator.runFullSuite !== 'function') {
                throw new Error('The test harness did not load.');
            }

            const result = await window.Validator.runFullSuite();
            render(result.details);

            const total = result.passed + result.failed;
            summary.textContent = result.failed === 0
                ? `${result.passed} of ${total} passed.`
                : `${result.passed} of ${total} passed — ${result.failed} failed.`;
            summary.className = 'verify-summary ' + (result.failed === 0 ? 'good' : 'bad');
        } catch (err) {
            summary.textContent = 'Could not run the suite: ' + err.message;
            summary.className = 'verify-summary bad';
        } finally {
            button.disabled = false;
        }
    }

    button?.addEventListener('click', run);

    // Run once on load so the page always shows current evidence rather than
    // a claim that has to be taken on faith.
    window.setTimeout(run, 80);
})();
