/**
 * UniStep Legal Content
 *
 * Static, bundled policy text rendered inside the legal modal.
 * The markup below is authored here and never built from user input.
 */

const LEGAL_CONTENT = {
    privacy: {
        title: "Privacy Policy",
        lastUpdated: "October 27, 2026",
        content: `
            <p class="lead">Your data remains your own.</p>
            <p>UniStep is designed with a privacy-first architecture. The current edition runs as a client-side application: your problem history and profile are stored locally in your browser. Nothing is sent to a UniStep server.</p>

            <h3>1. Data collection</h3>
            <p>We do not collect, transmit, or store your personal information on external servers. Symbolic derivations and calculations run on your device.</p>

            <h3>2. Local storage</h3>
            <p>The study archive uses your browser's local storage to save solved problems. You control it completely and can wipe it at any time with “Reset archive” or by signing out and clearing browser data.</p>

            <h3>3. Third-party services</h3>
            <p>Optical character recognition uses Tesseract.js. Image processing runs locally in your browser; images are not uploaded to a transcription service. The OCR engine itself is loaded from a public CDN.</p>

            <p class="fine">This policy is written so that academic work and proprietary engineering problems stay confidential.</p>
        `
    },
    tos: {
        title: "Terms of Service",
        lastUpdated: "October 27, 2026",
        content: `
            <p class="lead">Academic integrity and professional use.</p>
            <p>By using UniStep, you agree to the following terms.</p>

            <h3>1. Educational purpose</h3>
            <p>UniStep is a pedagogical companion. It is intended to help you understand the <em>process</em> of a derivation. Verify results against your course material before relying on them for graded work.</p>

            <h3>2. Fair use</h3>
            <p>The software is provided for individual academic and professional use. Redistributing the solver engine as your own product is not permitted.</p>

            <h3>3. Limitation of liability</h3>
            <p>UniStep is provided “as is”. We are not liable for errors caused by ambiguous input or unforeseen edge cases in symbolic solving.</p>

            <p class="fine">If a result matters, check it twice. That is good engineering practice with or without this tool.</p>
        `
    },
    cookies: {
        title: "Cookie Policy",
        lastUpdated: "October 27, 2026",
        content: `
            <p class="lead">A zero-tracking commitment.</p>
            <p>UniStep does not use advertising trackers or analytics scripts.</p>

            <h3>1. Do you use cookies?</h3>
            <p>No. The application does not use HTTP cookies to track behaviour, serve advertisements, or build cross-site profiles.</p>

            <h3>2. Local storage, not cookies</h3>
            <p>We use <strong>local storage</strong>, which stays on your device. It holds your study archive and the current session's profile name.</p>

            <h3>3. Control</h3>
            <p>Clear everything from the archive panel, or clear this site's data in your browser settings. Either action removes the stored records.</p>

            <p class="fine">No third-party analytics, no fingerprinting, no cross-site tracking.</p>
        `
    }
};

window.LEGAL_CONTENT = LEGAL_CONTENT;
