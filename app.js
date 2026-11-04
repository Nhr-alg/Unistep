/**
 * UniStep Application Shell
 *
 * UI wiring, archive rendering and the solve pipeline.
 * User-controlled strings are inserted with textContent / createElement,
 * never with innerHTML, so archive entries and OCR output cannot execute code.
 */

(function () {
    'use strict';

    const MAX_GUEST_HISTORY = 200;
    // MVP launch: unlimited solves â€” no free-tier gate
    const FREE_SOLVE_LIMIT = Infinity;
    const FREE_SOLVE_KEY = 'us_free_solves_v1';
    const $ = (id) => document.getElementById(id);

    const chatContainer = $('chat-container');
    const userInput = $('user-input');
    const sendBtn = $('send-btn');
    const emptyState = $('empty-state');
    const statusBadge = $('status-badge');
    const toastEl = $('toast');
    let activeMode = 'solve';

    let authMode = 'login';
    let lastFocused = null;
    let toastTimer = 0;
    let isSolving = false;
    let freeSolvesUsed = readFreeSolves();

    // ---------------------------------------------------------------- helpers

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = String(text);
        return node;
    }

    function playLaunchAnimation() {
        const splash = $('launch-splash');
        const appShell = $('app-shell');
        const skip = $('launch-skip');
        if (!splash || !appShell || !skip) return false;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;

        try {
            if (sessionStorage.getItem('unistep_launch_seen_v1') === '1') return false;
            sessionStorage.setItem('unistep_launch_seen_v1', '1');
        } catch (err) {
            // Storage may be unavailable in a private or file-based browser context.
        }

        splash.hidden = false;
        splash.setAttribute('aria-hidden', 'false');
        appShell.inert = true;

        let finished = false;
        let dismissTimer = 0;
        const finish = () => {
            if (finished) return;
            finished = true;
            window.clearTimeout(dismissTimer);
            splash.classList.add('is-leaving');
            window.setTimeout(() => {
                splash.hidden = true;
                splash.setAttribute('aria-hidden', 'true');
                appShell.inert = false;
                if (!isFreeLimitReached() && window.matchMedia('(min-width: 861px)').matches) {
                    userInput.focus();
                }
            }, 270);
        };

        skip.addEventListener('click', finish, { once: true });
        dismissTimer = window.setTimeout(finish, 2250);
        skip.focus({ preventScroll: true });
        return true;
    }

    // Solver results are raw doubles (e.g. 3.205858157774931). Engineering
    // convention is a handful of significant figures, never machine precision.
    function formatResult(value) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            if (Number.isInteger(value)) return String(value);
            return String(Number(value.toPrecision(4)));
        }
        return value === undefined || value === null ? '' : String(value);
    }

    function visibleUnits(units) {
        if (!units) return '';
        const clean = String(units).trim();
        return /^(n\/?a|none|dimensionless|-)$/i.test(clean) ? '' : clean;
    }

    function showToast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 2600);
    }

    // ------------------------------------------------------- free solve gate

    // The prototype gives every browser 10 successful solves. The count is
    // deliberately browser-wide: signing in, signing out, or switching local
    // profiles does not mint a fresh allowance. This is a product limit, not a
    // security boundary â€” anyone with devtools can clear localStorage, so a
    // real paid launch needs server-side entitlements.
    function readFreeSolves() {
        try {
            const raw = localStorage.getItem(FREE_SOLVE_KEY);
            if (raw === null) return 0;
            const count = Number.parseInt(raw, 10);
            if (!Number.isFinite(count) || count < 0) return 0;
            return Math.min(count, FREE_SOLVE_LIMIT);
        } catch (err) {
            console.error('Could not read the free solve count.', err);
            return 0;
        }
    }

    function persistFreeSolves(count) {
        try {
            localStorage.setItem(FREE_SOLVE_KEY, String(count));
        } catch (err) {
            console.error('Could not save the free solve count.', err);
        }
    }

    function freeSolvesLeft() {
        return Math.max(0, FREE_SOLVE_LIMIT - freeSolvesUsed);
    }

    // MVP: no solve limit â€” always allow solving
    function isFreeLimitReached() {
        return false;
    }

    function syncFreeSolveUI() {
        const locked = isFreeLimitReached();
        const solveLocked = locked && activeMode === 'solve';
        document.body.classList.toggle('free-locked', solveLocked);

        const composer = document.querySelector('.composer');
        if (composer) composer.classList.toggle('is-locked', solveLocked);

        if (userInput) {
            userInput.disabled = solveLocked;
            userInput.placeholder = solveLocked
                ? 'Free limit reached â€” input locked'
                : activeMode === 'theory'
                    ? 'Ask a theory question or name a conceptâ€¦'
                    : 'Describe your problemâ€¦';
        }

        if (sendBtn) {
            sendBtn.disabled = solveLocked || isSolving;
            const label = sendBtn.querySelector('.solve-label');
            if (label && !isSolving) label.textContent = solveLocked ? 'Locked' : activeMode === 'theory' ? 'Explain' : 'Solve';
            sendBtn.dataset.mobileLabel = solveLocked ? 'Locked' : activeMode === 'theory' ? 'Ask' : 'Go';
        }

        document.querySelectorAll('.example-card').forEach((card) => {
            card.disabled = locked;
        });

        const panel = $('free-limit');
        if (panel) panel.classList.toggle('hidden', !solveLocked);

        const panelTitle = $('free-limit-title');
        if (panelTitle) panelTitle.textContent = `You have used all ${FREE_SOLVE_LIMIT} free solves.`;

        const panelBadge = document.querySelector('.free-limit-badge');
        if (panelBadge) panelBadge.textContent = `${FREE_SOLVE_LIMIT}/${FREE_SOLVE_LIMIT}`;

        document.querySelectorAll('[data-mode]').forEach((button) => {
            const selected = button.dataset.mode === activeMode;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });

        const modeDescription = $('mode-description');
        if (modeDescription) modeDescription.textContent = activeMode === 'theory'
            ? `Built-in explanations for ${window.UniStepTheory?.topics().length || 0} core concepts; unsupported topics are identified.`
            : 'Get a checked numerical or symbolic solution.';
        $('theory-prompts')?.classList.toggle('hidden', activeMode !== 'theory');
        const enterHint = $('enter-hint');
        if (enterHint) enterHint.replaceChildren(el('kbd', null, 'Enter'), document.createTextNode(activeMode === 'theory' ? ' to explain' : ' to solve'));
        const photoHint = $('photo-hint');
        if (photoHint) photoHint.textContent = activeMode === 'theory'
            ? 'Switch to Solve to ask about a photo'
            : 'Photos are read on this device';
        document.body.classList.toggle('theory-mode', activeMode === 'theory');

        // MVP: unlimited solves â€” hide the solve-count hint
        const hint = $('free-solves-hint');
        if (hint) hint.style.display = 'none';            if (statusBadge) {
            if (locked) {
                statusBadge.textContent = 'Free limit reached';
                statusBadge.classList.remove('busy');
            } else if (!statusBadge.classList.contains('busy')) {
                statusBadge.textContent = 'Engine ready';
            }
        }
    }

    // MVP: no solve limit â€” recording is a no-op
    function recordFreeSolve() {
        // Unlimited solves: do not track or persist a count.
    }

    // MVP: no solve limit â€” never block
    function guardFreeLimit() {
        return false;
    }

    // MVP: no pricing/plans â€” hide the plans link
    function wireFreeLimitLink() {
        const link = $('free-limit-link');
        if (link) link.style.display = 'none';
    }

    function handleFreeSolveStorage(event) {
        if (event.key !== FREE_SOLVE_KEY && event.key !== null) return;
        freeSolvesUsed = readFreeSolves();
        syncFreeSolveUI();
        if (isFreeLimitReached()) {
            showToast('The free solve limit was reached in another tab.');
        }
    }

    function setStatus(mode) {
        if (!statusBadge) return;
        if (isFreeLimitReached() && activeMode === 'solve') {
            statusBadge.textContent = 'Free limit reached';
            statusBadge.classList.remove('busy');
            return;
        }
        const busy = mode === 'busy';
        statusBadge.textContent = busy ? activeMode === 'theory' ? 'Finding explanation' : 'Solving' : activeMode === 'theory' ? 'Theory library ready' : 'Engine ready';
        statusBadge.classList.toggle('busy', busy);
    }

    function readGuestHistory() {
        try {
            const parsed = JSON.parse(localStorage.getItem('sc_history') || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error('Corrupted archive, starting empty.', err);
            return [];
        }
    }

    function writeGuestHistory(history) {
        try {
            localStorage.setItem('sc_history', JSON.stringify(history.slice(-MAX_GUEST_HISTORY)));
        } catch (err) {
            console.error('Could not save archive (storage full?).', err);
        }
    }

    function getHistory() {
        return window.AuthManager.currentUser
            ? window.AuthManager.getUserHistory()
            : readGuestHistory();
    }

    function persistHistory(history) {
        if (window.AuthManager.currentUser) {
            window.AuthManager.setUserHistory(history);
        } else {
            writeGuestHistory(history);
        }
    }

    // ------------------------------------------------------------- modal flow

    function openModal(modal, focusSelector) {
        if (!modal) return;
        lastFocused = document.activeElement;
        modal.classList.remove('hidden');
        const target = focusSelector ? modal.querySelector(focusSelector) : null;
        window.setTimeout(() => {
            (target || modal.querySelector('button'))?.focus();
        }, 0);
    }

    function closeModal(modal) {
        if (!modal || modal.classList.contains('hidden')) return;
        modal.classList.add('hidden');
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
        lastFocused = null;
    }

    function openTopModal() {
        return ['auth-modal', 'legal-modal', 'confirm-modal', 'worksheet-modal', 'practice-modal', 'graph-modal']
            .map($)
            .find((modal) => modal && !modal.classList.contains('hidden')) || null;
    }

    // Shared with worksheet.js / practice.js / grapher.js so every modal opens
    // and closes through one focus-restoring path.
    window.UniStepModal = {
        open(id, focusSelector) {
            openModal($(id), focusSelector);
        },
        close(id) {
            closeModal($(id));
        },
        isOpen(id) {
            const modal = $(id);
            return Boolean(modal && !modal.classList.contains('hidden'));
        }
    };

    // ----------------------------------------------------------- auth modal

    function setAuthError(message) {
        const node = $('auth-error');
        if (node) node.textContent = message || '';
    }

    function cloudAvailable() {
        return Boolean(window.UniStepCloud && window.UniStepCloud.status().available);
    }

    function applyAuthMode() {
        const isLogin = authMode === 'login';
        const online = cloudAvailable();
        $('auth-title').textContent = isLogin ? 'Welcome back' : 'Create your account';
        $('auth-sub').textContent = online
            ? (isLogin
                ? 'Sign in to load the archive saved to your account.'
                : 'Your archive syncs to this account, so it follows you between devices.')
            : (isLogin
                ? 'Sign in to load the archive saved to this profile.'
                : 'No server reachable, so this profile stays in this browser only.');
        $('auth-main-btn').textContent = isLogin ? 'Sign in' : 'Create account';
        $('auth-mode-toggle').textContent = isLogin
            ? 'New here? Create an account'
            : 'Already have an account? Sign in';
        $('auth-pass').setAttribute('autocomplete', isLogin ? 'current-password' : 'new-password');
        setAuthError('');
    }

    function openAuth() {
        applyAuthMode();
        const pass = $('auth-pass');
        if (pass) pass.value = '';
        openModal($('auth-modal'), '#auth-user');
    }

    function toggleAuthMode() {
        authMode = authMode === 'login' ? 'signup' : 'login';
        applyAuthMode();
        $('auth-user').focus();
    }

    async function handleAuthSubmit(event) {
        event.preventDefault();

        const userField = $('auth-user');
        const passField = $('auth-pass');
        const submitBtn = $('auth-main-btn');
        const user = userField.value.trim();
        const pass = passField.value;

        setAuthError('');

        if (!user || !pass) {
            setAuthError('Enter both a username and a password.');
            (user ? passField : userField).focus();
            return;
        }

        submitBtn.disabled = true;
        const label = submitBtn.textContent;
        submitBtn.textContent = authMode === 'login' ? 'Signing inâ€¦' : 'Creatingâ€¦';

        try {
            const result = authMode === 'login'
                ? await window.AuthManager.login(user, pass)
                : await window.AuthManager.signUp(user, pass);

            if (result.success) {
                const signedIn = authMode === 'login';
                passField.value = '';
                authMode = 'login';
                closeModal($('auth-modal'));
                showToast(signedIn ? `Signed in as ${result.user}` : `Profile created for ${result.user}`);
                userInput.focus();
            } else {
                setAuthError(result.error || 'Could not complete that request.');
            }
        } catch (err) {
            console.error(err);
            setAuthError('Could not complete that request.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = label;
        }
    }

    function updateAuthUI() {
        const user = window.AuthManager.currentUser;
        const name = $('account-name');
        const hint = $('account-hint');
        const avatar = $('account-avatar');
        const btn = $('auth-btn');

        if (name) name.textContent = user || 'Guest session';
        if (hint) {
            hint.textContent = user
                ? (cloudAvailable() ? 'Archive synced to your account' : 'Archive saved to this profile')
                : 'Archive saved in this browser';
        }
        if (avatar) avatar.textContent = user ? user.charAt(0) : 'G';
        if (btn) {
            btn.textContent = user ? 'Sign out' : 'Sign in';
            btn.title = user ? `Sign out of ${user}` : 'Sign in or create a local profile';
        }

        renderHistory();
    }

    // ----------------------------------------------------------- legal modal

    function openLegal(type) {
        const data = window.LEGAL_CONTENT && window.LEGAL_CONTENT[type];
        if (!data) return;

        $('legal-title').textContent = data.title;
        $('legal-date').textContent = `Updated ${data.lastUpdated}`;
        $('legal-body').innerHTML = data.content; // static, bundled content only
        openModal($('legal-modal'), '#legal-close-btn');
    }

    // -------------------------------------------------------------- archive

    function buildHistoryItem(item) {
        const row = el('div', 'history-item');
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
        row.setAttribute('aria-label', `Reopen ${item.mode === 'theory' ? 'theory question' : 'problem'}: ${item.text}`);

        row.appendChild(el('p', 'history-text', item.text));
        row.appendChild(el('span', 'history-time', item.timestamp));

        const actions = el('div', 'history-actions');

        const important = el('button', 'tag-btn important', 'â˜…');
        important.type = 'button';
        important.title = item.tag === 'important' ? 'Remove important tag' : 'Mark as important';
        important.setAttribute('aria-label', important.title);
        important.setAttribute('aria-pressed', item.tag === 'important' ? 'true' : 'false');
        if (item.tag === 'important') important.classList.add('active');
        important.addEventListener('click', (event) => {
            event.stopPropagation();
            tagProblem(item.id, 'important');
        });

        const revision = el('button', 'tag-btn revision', 'âš‘');
        revision.type = 'button';
        revision.title = item.tag === 'revision' ? 'Remove revision flag' : 'Flag for revision';
        revision.setAttribute('aria-label', revision.title);
        revision.setAttribute('aria-pressed', item.tag === 'revision' ? 'true' : 'false');
        if (item.tag === 'revision') revision.classList.add('active');
        revision.addEventListener('click', (event) => {
            event.stopPropagation();
            tagProblem(item.id, 'revision');
        });

        actions.append(important, revision);
        row.appendChild(actions);

        row.addEventListener('click', () => {
            closeSidebar();
            activeMode = item.mode === 'theory' ? 'theory' : 'solve';
            syncFreeSolveUI();
            if (activeMode === 'solve' && guardFreeLimit()) return;
            userInput.value = String(item.text ?? '');
            resizeInput();
            handleSolve();
        });

        row.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                row.click();
            }
        });

        return row;
    }

    function addEmptyNote(container, message) {
        if (container.children.length > 0) return;
        container.appendChild(el('p', 'empty-note', message));
    }

    function renderHistory() {
        const allDiv = $('history-all');
        const impDiv = $('history-important');
        const revDiv = $('history-revision');
        if (!allDiv || !impDiv || !revDiv) return;

        allDiv.replaceChildren();
        impDiv.replaceChildren();
        revDiv.replaceChildren();

        for (const item of getHistory()) {
            allDiv.appendChild(buildHistoryItem(item));
            if (item.tag === 'important') impDiv.appendChild(buildHistoryItem(item));
            if (item.tag === 'revision') revDiv.appendChild(buildHistoryItem(item));
        }

        addEmptyNote(impDiv, 'No starred problems');
        addEmptyNote(revDiv, 'Nothing flagged yet');
        addEmptyNote(allDiv, 'Solved problems appear here');
    }

    function saveToHistory(input, result, mode = 'solve') {
        const entry = {
            id: Date.now(),
            text: input,
            result: result,
            mode: mode === 'theory' ? 'theory' : 'solve',
            tag: 'none',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (window.AuthManager.currentUser) {
            window.AuthManager.saveUserHistory(entry);
        } else {
            const history = readGuestHistory();
            history.push(entry);
            writeGuestHistory(history);
        }
        renderHistory();
    }

    function tagProblem(id, tag) {
        const history = getHistory();
        const target = history.find((item) => String(item.id) === String(id));
        if (!target) return;

        target.tag = target.tag === tag ? 'none' : tag;
        persistHistory(history);
        renderHistory();

        showToast(target.tag === 'none'
            ? 'Tag removed'
            : target.tag === 'important' ? 'Marked as important' : 'Flagged for revision');
    }

    function clearCategory(category) {
        let history = getHistory();
        history = category === 'all'
            ? []
            : history.filter((item) => item.tag !== category);

        persistHistory(history);
        renderHistory();
        showToast(category === 'all' ? 'Archive cleared' : 'Section cleared');
    }

    function confirmGlobalClear() {
        openModal($('confirm-modal'), '#confirm-cancel');
    }

    // ------------------------------------------------------------ empty state

    function hideEmptyState() {
        if (emptyState) emptyState.classList.add('hidden');
    }

    function showEmptyState() {
        if (emptyState) emptyState.classList.remove('hidden');
    }

    function startNewProblem() {
        if (guardFreeLimit()) return;
        chatContainer.querySelectorAll('.message').forEach((node) => node.remove());
        showEmptyState();
        userInput.value = '';
        resizeInput();
        setStatus('ready');
        closeSidebar();
        userInput.focus();
    }

    function fillInput(text) {
        if (guardFreeLimit()) return;
        activeMode = 'solve';
        syncFreeSolveUI();
        userInput.value = String(text ?? '');
        resizeInput();
        userInput.focus();
    }

    // --------------------------------------------------------------- sidebar

    function openSidebar() {
        document.body.classList.add('sidebar-open');
        $('menu-btn')?.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
        document.body.classList.remove('sidebar-open');
        $('menu-btn')?.setAttribute('aria-expanded', 'false');
    }

    // --------------------------------------------------------------- OCR

    // Camera/OCR removed for MVP â€” not functioning


    // Camera/OCR removed for MVP â€” not functioning

        addMessage('Reading the problem from your imageâ€¦');

    // ------------------------------------------------------------- messages

    function addMessage(text, isUser = false, isComplex = false, data = null) {
        hideEmptyState();

        const wrapper = el('div', `message ${isUser ? 'user' : 'assistant'}`);
        const bubble = el('div', 'bubble');

        if (isComplex && data) {
            bubble.appendChild(isComplex === 'theory' ? renderTheoryAnswer(data) : renderDerivation(data));
        } else {
            bubble.appendChild(el('p', isUser ? null : 'note-text', text));
        }

        wrapper.appendChild(bubble);
        chatContainer.appendChild(wrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function renderDerivation(data) {
        const fragment = document.createDocumentFragment();
        const article = el('article', 'derivation');

        const head = el('header', 'derivation-head');
        head.appendChild(el('span', 'eyebrow', 'Verified derivation'));
        const chip = el('span', 'domain-chip', data.domain || 'General');
        if (data.subdomain) chip.title = data.subdomain;
        head.appendChild(chip);
        article.appendChild(head);

        const result = el('div', 'result');
        result.appendChild(el('span', 'result-label', 'Result'));
        const line = el('div', 'result-line');
        line.appendChild(el('span', 'result-value', formatResult(data.result)));
        const units = visibleUnits(data.units);
        if (units) line.appendChild(el('span', 'result-unit', units));
        result.appendChild(line);
        article.appendChild(result);

        const steps = Array.isArray(data.steps) ? data.steps : [];
        if (steps.length) {
            const section = el('section', 'steps');
            section.appendChild(el('h3', 'steps-title', 'Derivation'));

            const list = el('ol', 'step-list');
            steps.forEach((step, index) => {
                const row = el('li', 'step');
                row.appendChild(el('span', 'step-no', String(index + 1).padStart(2, '0')));

                const body = el('div', 'step-body');
                if (step.title) body.appendChild(el('strong', 'step-title', step.title));
                body.appendChild(el('p', 'step-text', step.explanation));
                if (step.formula) body.appendChild(el('code', 'formula', step.formula));

                row.appendChild(body);
                list.appendChild(row);
            });

            section.appendChild(list);
            article.appendChild(section);
        }

        if (data.theory) {
            const theory = el('blockquote', 'theory');
            theory.appendChild(el('span', 'theory-label', 'Principle'));
            theory.appendChild(el('p', null, data.theory));
            article.appendChild(theory);
        }

        if (Array.isArray(data.assumptions) && data.assumptions.length) {
            const box = el('div', 'assumptions');
            box.appendChild(el('span', 'assumptions-label', 'Assumptions'));

            const list = el('ul', 'assumption-list');
            data.assumptions.forEach((assumption) => list.appendChild(el('li', null, assumption)));

            box.appendChild(list);
            article.appendChild(box);
        }

        fragment.appendChild(article);
        return fragment;
    }

    function renderTheoryAnswer(data) {
        const article = el('article', 'derivation theory-answer');
        const head = el('header', 'derivation-head');
        head.appendChild(el('span', 'eyebrow', 'Theory explanation'));
        head.appendChild(el('span', 'domain-chip', data.subject || 'Engineering'));
        article.appendChild(head);
        article.appendChild(el('h2', 'theory-title', data.title));

        const addSection = (label, value, className) => {
            if (!value) return;
            const section = el('section', `theory-section ${className || ''}`.trim());
            section.appendChild(el('h3', 'theory-section-label', label));
            if (Array.isArray(value)) {
                const list = el('ul', 'theory-list');
                value.forEach((item) => list.appendChild(el(className === 'equations' ? 'li' : 'li', className === 'equations' ? 'theory-equation' : null, item)));
                section.appendChild(list);
            } else {
                section.appendChild(el('p', 'theory-section-text', value));
            }
            article.appendChild(section);
        };

        addSection('In one sentence', data.summary);
        addSection('Build the intuition', data.intuition);
        addSection('Key equations', data.equations, 'equations');
        addSection('Units', data.units);
        addSection('When this model applies', data.conditions);
        addSection('Quick example', data.example);
        addSection('Check your understanding', data.check, 'theory-check');
        return article;
    }

    // ---------------------------------------------------------------- solve

    function resizeInput() {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
    }

    async function handleSolve() {
        const text = userInput.value.trim();
        if (!text || isSolving) return;

        addMessage(text, true);
        userInput.value = '';
        resizeInput();

        isSolving = true;
        sendBtn.disabled = true;
        sendBtn.querySelector('.solve-label').textContent = activeMode === 'theory' ? 'Explainingâ€¦' : 'Solvingâ€¦';
        setStatus('busy');

        try {
            const mode = activeMode;
            const response = mode === 'theory'
                ? window.UniStepTheory?.answer(text)
                : window.UniStepNLP?.solve(text);
            if (!response) throw new Error(mode === 'theory' ? 'Theory library unavailable' : 'Solver unavailable');
            if (response && response.success) {
                addMessage('', false, mode === 'theory' ? 'theory' : true, response);
                saveToHistory(text, response, mode);
            } else {
                addMessage((response && response.error) || 'Something went wrong.');
            }
        } catch (err) {
            console.error(err);
            addMessage('Something went wrong while solving that problem.');
        } finally {
            isSolving = false;
            syncFreeSolveUI();
            setStatus('ready');
        }
    }

    // ----------------------------------------------------------- study studio

    const studio = {
        topics: new Set(),
        answers: false,
        sheet: null,
        seeded: false
    };

    function syncTopicFade() {
        const grid = $('ws-topic-grid');
        if (!grid) return;
        const more = grid.scrollTop + grid.clientHeight < grid.scrollHeight - 2;
        grid.classList.toggle('has-more', more);
    }

    function buildTopicGrid() {
        const grid = $('ws-topic-grid');
        const api = window.UniStepWorksheet;
        if (!grid || !api) return;

        grid.replaceChildren();
        studio.topics.clear();

        api.TOPICS.forEach((topic) => {
            const button = el('button', 'ws-topic', topic.label);
            button.type = 'button';
            button.setAttribute('aria-pressed', 'true');
            button.dataset.topic = topic.id;
            studio.topics.add(topic.id);
            button.addEventListener('click', () => {
                const on = button.getAttribute('aria-pressed') === 'true';
                button.setAttribute('aria-pressed', on ? 'false' : 'true');
                if (on) studio.topics.delete(topic.id);
                else studio.topics.add(topic.id);
            });
            grid.appendChild(button);
        });

        grid.addEventListener('scroll', syncTopicFade, { passive: true });
        window.addEventListener('resize', syncTopicFade);
        // The grid has no size while the modal is hidden; observe it so the
        // overflow hint appears as soon as it is laid out.
        if (typeof ResizeObserver === 'function') {
            new ResizeObserver(syncTopicFade).observe(grid);
        }
        syncTopicFade();
    }

    function setWorksheetStatus(message) {
        const status = $('ws-status');
        if (status) status.textContent = message || '';
    }

    function renderSheet() {
        const api = window.UniStepWorksheet;
        const preview = $('ws-preview');
        if (!api || !preview) return;
        if (!studio.sheet || !studio.sheet.problems.length) {
            preview.replaceChildren();
            return;
        }
        api.render(preview, studio.sheet.problems, {
            answers: studio.answers,
            level: studio.sheet.level
        });
    }

    function generateWorksheet() {
        const api = window.UniStepWorksheet;
        if (!api) return;

        if (!studio.topics.size) {
            setWorksheetStatus('Pick at least one topic.');
            return;
        }

        const level = $('ws-level')?.value || 'Standard';
        const count = Number($('ws-count')?.value) || 10;
        const started = Date.now();
        const sheet = api.build({
            topics: Array.from(studio.topics),
            count,
            level,
            seed: started
        });

        if (!sheet.problems.length) {
            setWorksheetStatus('The solver could not verify any problem for that selection. Try another topic.');
            return;
        }

        studio.sheet = sheet;
        studio.answers = false;
        const toggle = $('ws-toggle-answers');
        if (toggle) {
            toggle.setAttribute('aria-pressed', 'false');
            toggle.textContent = 'Show answer key';
        }

        renderSheet();

        const short = sheet.problems.length < sheet.requested
            ? ` (${sheet.requested - sheet.problems.length} skipped â€” the generator only prints problems the solver can verify)`
            : '';
        setWorksheetStatus(`${sheet.problems.length} verified problems    ${level}    seed ${sheet.seed}${short}`);
    }

    function toggleWorksheetAnswers() {
        if (!studio.sheet) {
            setWorksheetStatus('Generate a sheet first.');
            return;
        }
        studio.answers = !studio.answers;
        const toggle = $('ws-toggle-answers');
        if (toggle) {
            toggle.setAttribute('aria-pressed', studio.answers ? 'true' : 'false');
            toggle.textContent = studio.answers ? 'Hide answer key' : 'Show answer key';
        }
        renderSheet();
    }

    function printWorksheet() {
        const api = window.UniStepWorksheet;
        if (!api) return;
        if (!studio.sheet) {
            setWorksheetStatus('Generate a sheet first.');
            return;
        }
        api.print(studio.sheet.problems, {
            level: studio.sheet.level,
            answers: studio.answers,
            title: studio.answers ? 'Answer key' : 'Worksheet'
        });
    }

    function downloadWorksheet() {
        const api = window.UniStepWorksheet;
        if (!api) return;
        if (!studio.sheet) {
            setWorksheetStatus('Generate a sheet first.');
            return;
        }
        const stamp = new Date().toISOString().slice(0, 10);
        api.download(`unistep-worksheet-${stamp}.csv`, api.toCsv(studio.sheet.problems));
        showToast('Worksheet downloaded as CSV');
    }

    function openWorksheet() {
        if (!studio.seeded) {
            buildTopicGrid();
            studio.seeded = true;
        }
        window.UniStepModal.open('worksheet-modal', '#ws-generate');
        if (!studio.sheet) {
            generateWorksheet();
        } else {
            renderSheet();
        }
        // Layout is available a tick after the modal is shown; the observer
        // covers resizes, this covers the first open (and background tabs,
        // where observers can be deferred).
        window.setTimeout(syncTopicFade, 60);
    }

    function wireStudio() {
        $('open-worksheet')?.addEventListener('click', () => {
            closeSidebar();
            openWorksheet();
        });
        $('open-practice')?.addEventListener('click', () => {
            closeSidebar();
            window.UniStepPractice?.open();
        });
        $('open-graph')?.addEventListener('click', () => {
            closeSidebar();
            window.UniStepGraph?.open();
        });

        $('worksheet-close-btn')?.addEventListener('click', () => window.UniStepModal.close('worksheet-modal'));
        $('ws-generate')?.addEventListener('click', generateWorksheet);
        $('ws-toggle-answers')?.addEventListener('click', toggleWorksheetAnswers);
        $('ws-print')?.addEventListener('click', printWorksheet);
        $('ws-csv')?.addEventListener('click', downloadWorksheet);

        $('graph-close-btn')?.addEventListener('click', () => window.UniStepModal.close('graph-modal'));

        window.addEventListener('cloudReady', () => {
            updateAuthUI();
            applyAuthMode();
        });

        // A sync can finish after the sidebar rendered, so redraw the archive
        // when the merged list lands.
        window.addEventListener('cloudSync', renderHistory);
    }

    // ---------------------------------------------------------------- wiring

    function wireEvents() {
        sendBtn.addEventListener('click', handleSolve);

        document.querySelectorAll('[data-mode]').forEach((button) => {
            button.addEventListener('click', () => {
                activeMode = button.dataset.mode === 'theory' ? 'theory' : 'solve';
                syncFreeSolveUI();
                setStatus('ready');
                userInput.focus();
            });
        });
        document.querySelectorAll('[data-theory-fill]').forEach((button) => {
            button.addEventListener('click', () => {
                activeMode = 'theory';
                syncFreeSolveUI();
                setStatus('ready');
                userInput.value = button.dataset.theoryFill || '';
                resizeInput();
                userInput.focus();
            });
        });

        userInput.addEventListener('input', resizeInput);
        userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSolve();
            }
        });

        document.querySelectorAll('[data-fill]').forEach((card) => {
            card.addEventListener('click', () => fillInput(card.dataset.fill));
        });

        document.querySelectorAll('[data-clear]').forEach((button) => {
            button.addEventListener('click', () => {
                if (button.dataset.clear === 'all') {
                    confirmGlobalClear();
                } else {
                    clearCategory(button.dataset.clear);
                }
            });
        });

        $('reset-archive')?.addEventListener('click', confirmGlobalClear);
        $('confirm-cancel')?.addEventListener('click', () => closeModal($('confirm-modal')));
        $('confirm-ok')?.addEventListener('click', () => {
            clearCategory('all');
            closeModal($('confirm-modal'));
        });

        $('new-problem')?.addEventListener('click', startNewProblem);

        $('auth-form')?.addEventListener('submit', handleAuthSubmit);
        $('auth-mode-toggle')?.addEventListener('click', toggleAuthMode);
        $('auth-close-btn')?.addEventListener('click', () => closeModal($('auth-modal')));

        $('legal-close-btn')?.addEventListener('click', () => closeModal($('legal-modal')));
        document.querySelectorAll('[data-legal]').forEach((button) => {
            button.addEventListener('click', () => openLegal(button.dataset.legal));
        });

        $('auth-btn')?.addEventListener('click', () => {
            const user = window.AuthManager.currentUser;
            if (user) {
                window.AuthManager.logout();
                showToast(`Signed out of ${user}`);
            } else {
                openAuth();
            }
        });

        $('menu-btn')?.addEventListener('click', openSidebar);
        $('sidebar-close')?.addEventListener('click', closeSidebar);
        $('sidebar-scrim')?.addEventListener('click', closeSidebar);

        document.querySelectorAll('.modal').forEach((modal) => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) closeModal(modal);
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            const modal = openTopModal();
            if (modal) {
                closeModal(modal);
            } else if (document.body.classList.contains('sidebar-open')) {
                closeSidebar();
            }
        });

        window.addEventListener('authChange', updateAuthUI);
        window.addEventListener('storage', handleFreeSolveStorage);
    }

    // ------------------------------------------------------------------ init

    wireEvents();
    wireStudio();
    wireFreeLimitLink();
    updateAuthUI();
    syncFreeSolveUI();
    resizeInput();

    const launchAnimationShown = playLaunchAnimation();
    if (!launchAnimationShown && !isFreeLimitReached() && window.matchMedia('(min-width: 861px)').matches) {
        userInput.focus();
    }
})();

