/* UniStep validation site: audience switching, pricing, waitlist, measurement. */

(function () {
    'use strict';

    const CONFIG = window.SITE_CONFIG || {};
    const STORAGE_KEYS = {
        visitor: 'us_visitor_id',
        utm: 'us_first_touch'
    };

    const AUDIENCES = {
        students: {
            label: 'For students',
            eyebrow: 'Private beta · Fall 2026',
            title: 'Step-by-step engineering solutions that show their work — and check their units.',
            sub: 'Type a problem or upload a photo. Get the governing equation, a verified derivation, and a dimensional check — not just an answer.',
            points: [
                'Verified derivations for statics, dynamics, rotation and energy',
                'Units tracked and validated at every step',
                'Photo upload turns a problem set into a worked solution',
                'Says “outside the verified library” instead of guessing'
            ],
            cta: 'Join the founding class',
            formTitle: 'Join the founding class',
            formSub: 'We are opening a small beta for first-year engineering students. Tell us what you are stuck on and we will invite you in batches.',
            pricingTitle: 'Founding access for students',
            pricingSub: 'Try the full solver with 10 verified solves, plus the worksheet studio and practice bank on your device. A paid tier adds a synced account and removes the solve limit when billing opens. 14-day refund on paid plans.',
            plans: [
                {
                    id: 'students_free',
                    name: 'Free',
                    price: '$0',
                    period: 'forever',
                    tagline: 'Try the full solver with 10 verified solves.',
                    features: ['10 verified solves', 'Archive with tags', 'Worksheet studio with answer keys', '30-question practice bank and grapher'],
                    cta: 'Start free'
                },
                {
                    id: 'students_founding',
                    name: 'Founding',
                    price: '$9',
                    period: '/month',
                    tagline: 'Adds a synced account, locked at this price for 12 months.',
                    features: ['Everything in Free', 'Server account with synced archive', 'Same archive on phone and laptop', 'Unlimited solves when paid access opens', 'Founding price locked 12 months'],
                    cta: 'Lock founding price',
                    featured: true
                },
                {
                    id: 'students_semester',
                    name: 'Semester',
                    price: '$29',
                    period: '/4 months',
                    tagline: 'One payment for the term. No renewal surprise.',
                    features: ['Everything in Founding', '4 months of access', 'No auto-renewal'],
                    cta: 'Get the semester pass'
                }
            ]
        },
        tutors: {
            label: 'For tutoring centers',
            eyebrow: 'Pilot program · Fall 2026',
            title: 'Generate worksheet and answer-key pairs in minutes — with full derivations.',
            sub: 'Pick a topic, difficulty and count. Export a student sheet and an instructor key with verified steps, units, and the governing equation for every problem.',
            points: [
                'Worksheet and key come from the same verified source',
                'Unit-aware problems with no copy-paste errors',
                'Export to PDF for class or tutoring sessions',
                'Audit any answer back to its derivation'
            ],
            cta: 'Request a 14-day pilot',
            formTitle: 'Request a tutoring pilot',
            formSub: 'Tell us your center size and the courses you support. We will set up a two-week pilot with 25 worksheet and answer-key pairs.',
            pricingTitle: 'Pilot first, then a center plan',
            pricingSub: 'Start with a free two-week pilot. Keep it only if your tutors actually use it. No setup fee, no card to start.',
            plans: [
                {
                    id: 'tutors_pilot',
                    name: 'Pilot',
                    price: '$0',
                    period: '14 days',
                    tagline: 'One center, up to 10 accounts.',
                    features: ['Unlimited worksheet + key pairs', 'Verified answer keys with steps', 'Print to PDF or export CSV', 'No card required'],
                    cta: 'Request a pilot'
                },
                {
                    id: 'tutors_center',
                    name: 'Center',
                    price: '$99',
                    period: '/month',
                    tagline: 'For a single tutoring center.',
                    features: ['Unlimited worksheet generation', 'Answer keys with derivations', 'Print to PDF and CSV export', 'Synced accounts for your tutors', 'Priority support'],
                    cta: 'Start a center plan',
                    featured: true
                },
                {
                    id: 'tutors_department',
                    name: 'Department',
                    price: '$249',
                    period: '/month',
                    tagline: 'Multi-course departments and multi-site centers.',
                    features: ['Up to 40 synced accounts', 'Custom topic coverage on request', 'Onboarding session for tutors'],
                    cta: 'Talk to us'
                }
            ]
        },
        fe: {
            label: 'For FE/PE prep',
            eyebrow: 'Beta · FE/PE prep',
            title: 'Exam-style problems with verified solutions — timed, unit-checked, explained.',
            sub: 'Practice the way the exam asks, then study the exact governing equation, derivation and unit check behind the answer.',
            points: [
                'Problems written in exam format, not textbook format',
                'Timed sets with a review pass after each block',
                'Every solution hand-checked against its governing equation',
                'New problem sets added while you prepare'
            ],
            cta: 'Reserve a beta seat',
            formTitle: 'Reserve a beta seat',
            formSub: 'Tell us which exam and date you are targeting. Beta seats are limited and priced once.',
            pricingTitle: 'Beta pricing',
            pricingSub: 'One payment for the pack, or monthly while you prepare. 14-day refund, no questions asked.',
            plans: [
                {
                    id: 'fe_beta',
                    name: 'Beta pack',
                    price: '$79',
                    period: 'one-time',
                    tagline: 'The starter bank plus every set added during your prep.',
                    features: ['30 hand-checked FE-style problems', 'Timed practice mode with review', 'Verified working for every answer', 'New sets as they ship'],
                    cta: 'Reserve a beta seat',
                    featured: true
                },
                {
                    id: 'fe_monthly',
                    name: 'Monthly',
                    price: '$19',
                    period: '/month',
                    tagline: 'All topics while you prepare.',
                    features: ['Everything in the beta pack', 'New sets as they ship', 'Cancel any time', '14-day refund'],
                    cta: 'Start monthly'
                }
            ]
        }
    };

    const state = {
        audience: 'students',
        visitorId: getVisitorId(),
        firstTouch: getFirstTouch()
    };

    const els = {
        heroEyebrow: document.getElementById('hero-eyebrow'),
        heroTitle: document.getElementById('hero-title'),
        heroSub: document.getElementById('hero-sub'),
        heroPoints: document.getElementById('hero-points'),
        heroCta: document.getElementById('hero-cta'),
        heroPanel: document.getElementById('hero-panel'),
        pricingTitle: document.getElementById('pricing-title'),
        pricingSub: document.getElementById('pricing-sub'),
        pricingGrid: document.getElementById('pricing-grid'),
        formTitle: document.getElementById('form-title'),
        formSub: document.getElementById('form-sub'),
        segmentField: document.getElementById('segment-field'),
        planField: document.getElementById('plan-field'),
        form: document.getElementById('waitlist-form'),
        formStatus: document.getElementById('form-status'),
        submitBtn: document.getElementById('submit-btn'),
        emailField: document.getElementById('email-field'),
        toast: document.getElementById('toast')
    };

    // ------------------------------------------------------------- identity

    function getVisitorId() {
        try {
            const existing = localStorage.getItem(STORAGE_KEYS.visitor);
            if (existing) return existing;
            const id = (window.crypto && typeof crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem(STORAGE_KEYS.visitor, id);
            return id;
        } catch (err) {
            return 'v-session-' + Math.random().toString(36).slice(2, 10);
        }
    }

    function readUtmFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const utm = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
            const value = params.get(key);
            if (value) utm[key] = value.slice(0, 120);
        });
        return utm;
    }

    function getFirstTouch() {
        const fromUrl = readUtmFromUrl();
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.utm) || 'null');
            if (stored && typeof stored === 'object') return stored;
            const first = {
                landing: window.location.pathname + window.location.search,
                referrer: document.referrer ? document.referrer.slice(0, 300) : '',
                utm: fromUrl,
                ts: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.utm, JSON.stringify(first));
            return first;
        } catch (err) {
            return { landing: window.location.pathname, referrer: '', utm: fromUrl, ts: new Date().toISOString() };
        }
    }

    // -------------------------------------------------------------- tracking

    function track(name, meta) {
        const body = JSON.stringify({
            name: name,
            segment: state.audience,
            visitorId: state.visitorId,
            path: window.location.pathname,
            utm: state.firstTouch && state.firstTouch.utm ? state.firstTouch.utm : {},
            meta: meta || {}
        });

        try {
            fetch('/api/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body,
                keepalive: true
            }).catch(() => { /* measurement must never break the page */ });
        } catch (err) { /* ignore */ }
    }

    // -------------------------------------------------------------- rendering

    function activeAudience() {
        return AUDIENCES[state.audience] || AUDIENCES.students;
    }

    function renderAudience() {
        const data = activeAudience();

        els.heroEyebrow.textContent = data.eyebrow;
        els.heroTitle.textContent = data.title;
        els.heroSub.textContent = data.sub;
        els.heroCta.textContent = data.cta;
        els.pricingTitle.textContent = data.pricingTitle;
        els.pricingSub.textContent = window.UniStepCheckout && !window.UniStepCheckout.live()
            ? `${data.pricingSub} ${CONFIG.checkoutClosedNote || ''}`.trim()
            : data.pricingSub;
        els.formTitle.textContent = data.formTitle;
        els.formSub.textContent = data.formSub;
        els.segmentField.value = state.audience;

        els.heroPoints.replaceChildren();
        data.points.forEach((point) => {
            const li = document.createElement('li');
            li.textContent = point;
            els.heroPoints.appendChild(li);
        });

        document.querySelectorAll('[data-audience]').forEach((tab) => {
            const selected = tab.dataset.audience === state.audience;
            tab.setAttribute('aria-selected', selected ? 'true' : 'false');
            tab.tabIndex = selected ? 0 : -1;
            if (selected) els.heroPanel.setAttribute('aria-labelledby', tab.id);
        });

        renderPricing(data.plans);
        renderPlanOptions(data.plans);
    }

    function renderPricing(plans) {
        els.pricingGrid.replaceChildren();

        plans.forEach((plan) => {
            const card = document.createElement('article');
            card.className = 'price-card' + (plan.featured ? ' featured' : '');

            if (plan.featured) {
                const flag = document.createElement('span');
                flag.className = 'price-flag';
                flag.textContent = 'Most popular';
                card.appendChild(flag);
            }

            const name = document.createElement('p');
            name.className = 'price-name';
            name.textContent = plan.name;

            const line = document.createElement('div');
            line.className = 'price-line';
            const amount = document.createElement('span');
            amount.className = 'price-amount';
            amount.textContent = plan.price;
            const period = document.createElement('span');
            period.className = 'price-period';
            period.textContent = plan.period;
            line.append(amount, period);

            const tagline = document.createElement('p');
            tagline.className = 'price-tagline';
            tagline.textContent = plan.tagline;

            const features = document.createElement('ul');
            features.className = 'price-features';
            plan.features.forEach((feature) => {
                const li = document.createElement('li');
                li.textContent = feature;
                features.appendChild(li);
            });

            const cta = document.createElement('button');
            cta.type = 'button';
            cta.className = 'btn ' + (plan.featured ? 'primary' : 'ghost');
            cta.textContent = window.UniStepCheckout
                ? window.UniStepCheckout.ctaLabel(plan)
                : plan.cta;
            cta.addEventListener('click', () => handlePlanClick(plan));

            card.append(name, line, tagline, features, cta);
            els.pricingGrid.appendChild(card);
        });
    }

    function renderPlanOptions(plans) {
        const previous = els.planField.value;
        els.planField.replaceChildren();

        plans
            .filter((plan) => plan.price !== '$0')
            .forEach((plan) => {
                const option = document.createElement('option');
                option.value = plan.id;
                option.textContent = plan.name + ' · ' + plan.price + ' ' + plan.period;
                els.planField.appendChild(option);
            });

        if (previous && [...els.planField.options].some((option) => option.value === previous)) {
            els.planField.value = previous;
        }
    }

    // ------------------------------------------------------------- behaviour

    function showToast(message) {
        if (!els.toast) return;
        els.toast.textContent = message;
        els.toast.classList.add('show');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => els.toast.classList.remove('show'), 4200);
    }

    function scrollToWaitlist(planId) {
        if (planId) {
            const optionExists = [...els.planField.options].some((option) => option.value === planId);
            if (optionExists) els.planField.value = planId;
        }
        document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => els.emailField && els.emailField.focus({ preventScroll: true }), 450);
    }

    function isConfiguredLink(url) {
        return typeof url === 'string' && url.length > 0 && !url.includes('REPLACE_WITH');
    }

    function handlePlanClick(plan) {
        // The student free tier is the prototype itself, not a waitlist.
        if (plan.id === 'students_free') {
            window.open(CONFIG.demoPath || 'demo/index.html', '_blank', 'noopener');
            track('prototype_click');
            return;
        }

        track('preorder_click', { plan: plan.id, price: plan.price });

        if (plan.price === '$0') {
            scrollToWaitlist(plan.id);
            return;
        }

        // Never navigate to a placeholder. checkout.js fails closed.
        const checkout = window.UniStepCheckout;
        const link = checkout ? checkout.planUrl(plan.id) : '';
        if (link && checkout.go(link)) return;

        if (plan.id === 'tutors_pilot') {
            const booking = checkout ? checkout.bookingUrl() : '';
            if (booking && checkout.go(booking)) return;
        }

        showToast(CONFIG.paymentsLive === true
            ? 'That tier has no checkout link yet — join the list and we will send it.'
            : 'Checkout is not open yet. Join the list and we will send your founding link.');
        scrollToWaitlist(plan.id);
    }

    function setAudience(next, options) {
        if (!AUDIENCES[next] || next === state.audience) return;
        state.audience = next;
        renderAudience();

        if (!options || !options.silent) {
            track('segment_view', { audience: next });
            const url = new URL(window.location.href);
            url.searchParams.set('for', next);
            window.history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString() + url.hash);
        }
    }

    function handleTabKeys(event) {
        const tabs = [...document.querySelectorAll('[data-audience]')];
        const index = tabs.indexOf(document.activeElement);
        if (index === -1) return;

        let next = null;
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];

        if (next) {
            event.preventDefault();
            next.focus();
            setAudience(next.dataset.audience);
        }
    }

    // ------------------------------------------------------------------ form

    function setStatus(message, kind) {
        if (!els.formStatus) return;
        els.formStatus.textContent = message;
        els.formStatus.className = 'form-status' + (kind ? ' ' + kind : '');
    }

    function looksLikeEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(els.form);
        const email = String(formData.get('email') || '').trim().toLowerCase();
        const honeypot = String(formData.get('company') || '');
        const consent = formData.get('consent') === 'on';
        const role = String(formData.get('role') || 'student');
        const plan = String(formData.get('plan') || '');
        const topic = String(formData.get('topic') || '').trim().slice(0, 200);

        if (honeypot) {
            // Silently accept bot submissions without storing them.
            showFormSuccess();
            return;
        }

        if (!looksLikeEmail(email)) {
            setStatus('Please enter a valid email address.', 'error');
            els.emailField.focus();
            track('form_error', { reason: 'email' });
            return;
        }

        if (!consent) {
            setStatus('Please accept the privacy policy to continue.', 'error');
            track('form_error', { reason: 'consent' });
            return;
        }

        els.submitBtn.disabled = true;
        setStatus('Sending...', '');

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    segment: state.audience,
                    role: role,
                    plan: plan,
                    topic: topic,
                    consent: true,
                    visitorId: state.visitorId,
                    utm: state.firstTouch && state.firstTouch.utm ? state.firstTouch.utm : {},
                    referrer: state.firstTouch ? state.firstTouch.referrer : '',
                    path: window.location.pathname
                })
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || !payload.ok) {
                throw new Error(payload.error || 'Could not save your request.');
            }

            track('waitlist_submit', { plan: plan, role: role });
            showFormSuccess();
        } catch (err) {
            setStatus(err.message || 'Something went wrong. Please try again.', 'error');
            els.submitBtn.disabled = false;
            track('form_error', { reason: 'server' });
        }
    }

    function showFormSuccess() {
        const success = document.createElement('div');
        success.className = 'form-success';

        const title = document.createElement('h3');
        title.textContent = 'You are on the list.';

        const body = document.createElement('p');
        body.textContent = state.audience === 'tutors'
            ? 'We will reply within two business days to schedule your pilot and confirm your courses.'
            : 'Watch your inbox — invites go out in small batches as we open each topic.';

        success.append(title, body);
        els.form.replaceWith(success);
    }

    // ------------------------------------------------------------------ init

    function initialAudience() {
        const params = new URLSearchParams(window.location.search);
        const requested = (params.get('for') || params.get('audience') || '').toLowerCase();
        return AUDIENCES[requested] ? requested : 'students';
    }

    function init() {
        document.querySelectorAll('[data-brand]').forEach((node) => {
            node.textContent = CONFIG.brand || 'UniStep';
        });

        document.querySelectorAll('[data-contact]').forEach((node) => {
            if (CONFIG.contactEmail) {
                node.href = 'mailto:' + CONFIG.contactEmail;
            } else {
                // No monitored mailbox yet, so route enquiries to the waitlist
                // rather than printing an address that cannot receive mail.
                node.href = '#waitlist';
                node.textContent = 'Contact via the list';
            }
        });

        state.audience = initialAudience();
        renderAudience();
        setAudience(state.audience, { silent: true });

        document.querySelectorAll('[data-audience]').forEach((tab) => {
            tab.addEventListener('click', () => setAudience(tab.dataset.audience));
            tab.addEventListener('keydown', handleTabKeys);
        });

        const demo = document.getElementById('demo-cta');
        if (demo) demo.addEventListener('click', () => track('prototype_click'));

        els.form.addEventListener('submit', handleSubmit);

        // Auto-select the plan from a pricing deep link if present.
        const planParam = new URLSearchParams(window.location.search).get('plan');
        if (planParam && [...els.planField.options].some((option) => option.value === planParam)) {
            els.planField.value = planParam;
        }

        track('page_view', {
            audience: state.audience,
            referrer: state.firstTouch ? state.firstTouch.referrer : ''
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
