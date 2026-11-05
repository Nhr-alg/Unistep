/**
 * UniStep Cloud
 *
 * Optional Supabase-backed accounts and archive sync.
 *
 * Design rule: the app must work exactly as before when there is no server.
 * Everything here is additive — if Supabase is unreachable (missing config,
 * static hosting, file://, or offline) the local profile manager keeps
 * running untouched.
 *
 * Supabase stores only the archive list: question text, a short answer
 * preview, the tag and the timestamp. Full derivations are recomputed by the
 * local solver when an entry is reopened, so syncing never ships a stale
 * explanation and never uploads a user's working.
 *
 * Config: set window.SupabaseConfig = { url, anonKey } before this script
 * runs, or pass data-supabase-url / data-supabase-anon-key on this script tag.
 */

(function () {
    'use strict';

    const GUEST_KEY = 'sc_history';
    const SAVE_DELAY = 1200;

    const state = {
        available: false,
        checked: false,
        user: null,        // display name (email) shown in the UI
        userId: null,      // Supabase auth user UUID (for DB row ownership)
        syncing: false,
        saving: false,
        lastError: '',
        lastSync: 0,
        supabase: null
    };

    let saveTimer = 0;

    // ---------------------------------------------------------------- helpers

    function readGuestHistory() {
        try {
            const parsed = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    // ------------------------------------------------------- record mapping

    function toWire(entry) {
        const ts = Number(entry.id) || Number(entry.ts) || Date.now();
        const result = entry.result && typeof entry.result === 'object' ? entry.result : null;
        const answer = result && result.result !== undefined ? String(result.result) : '';
        return {
            id: ts,
            ts,
            text: String(entry.text || ''),
            answer: answer.slice(0, 300),
            tag: entry.tag === 'important' || entry.tag === 'revision' ? entry.tag : 'none',
            timestamp: String(entry.timestamp || '')
        };
    }

    function fromWire(record) {
        const ts = Number(record.ts) || Number(record.id) || Date.now();
        return {
            id: ts,
            text: String(record.text || ''),
            result: { success: true, result: String(record.answer || ''), units: '' },
            tag: record.tag === 'important' || record.tag === 'revision' ? record.tag : 'none',
            timestamp: String(record.timestamp || new Date(ts).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            }))
        };
    }

    // Same question at the same millisecond is the same entry. Newer tag wins
    // so a tag set on one device is not undone by an older copy elsewhere.
    function mergeEntries(...lists) {
        const byKey = new Map();
        for (const list of lists) {
            for (const entry of list) {
                if (!entry || !entry.text) continue;
                const key = `${entry.text}\u0000${Number(entry.id) || 0}`;
                const existing = byKey.get(key);
                if (!existing) {
                    byKey.set(key, entry);
                    continue;
                }
                if (existing.tag === 'none' && entry.tag !== 'none') {
                    byKey.set(key, { ...existing, tag: entry.tag });
                }
            }
        }
        return Array.from(byKey.values())
            .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0))
            .slice(-200);
    }

    // ------------------------------------------------------- supabase client

    function initSupabase() {
        const script = document.currentScript;
        const config = window.SupabaseConfig || {};
        const url = config.url || (script && script.dataset.supabaseUrl);
        const key = config.anonKey || (script && script.dataset.supabaseAnonKey);

        if (!url || !key) {
            // No Supabase config: local-only mode stands.
            return null;
        }

        // @supabase/supabase-js is loaded via CDN in index.html.
        // UMD global: window.supabase.createClient(url, key)
        const supabase = window.supabase;
        if (typeof supabase === 'undefined' ||
            typeof supabase.createClient !== 'function') {
            console.warn('Supabase client library not loaded.');
            return null;
        }

        try {
            return supabase.createClient(url, key);
        } catch (err) {
            console.error('Supabase init failed.', err);
            return null;
        }
    }

    // ------------------------------------------------------------ operations

    async function probe() {
        if (state.checked) return state.available;
        state.checked = true;

        state.supabase = initSupabase();
        if (!state.supabase) {
            state.available = false;
            return false;
        }

        try {
            const { data, error } = await state.supabase.auth.getSession();
            if (error) throw error;
            if (data.session && data.session.user) {
                state.userId = data.session.user.id;
                state.user = data.session.user.email || data.session.user.id;
                adopt(state.userId, state.user, { silent: true });
            }
            state.available = true;
        } catch (err) {
            // Supabase unreachable: local mode stands.
            state.available = false;
            state.supabase = null;
        }
        return state.available;
    }

    function adopt(userId, displayName, options) {
        const settings = options || {};
        const auth = window.AuthManager;
        if (!auth) return;

        state.userId = userId;
        state.user = displayName;
        if (auth.currentUser !== displayName) auth.setCurrentUser(displayName);
        if (!settings.silent) syncNow().catch(() => {});
    }

    async function signUp(username, password) {
        if (!state.available || !state.supabase) return { success: false, offline: true };
        try {
            const { data, error } = await state.supabase.auth.signUp({
                email: username,
                password: password
            });
            if (error) throw error;
            if (!data.user) throw new Error('No user returned.');
            adopt(data.user.id, data.user.email || username);
            return { success: true, user: data.user.email || username, cloud: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async function login(username, password) {
        if (!state.available || !state.supabase) return { success: false, offline: true };
        try {
            const { data, error } = await state.supabase.auth.signInWithPassword({
                email: username,
                password: password
            });
            if (error) throw error;
            if (!data.user) throw new Error('No user returned.');
            adopt(data.user.id, data.user.email || username);
            return { success: true, user: data.user.email || username, cloud: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async function logout() {
        if (!state.available || !state.supabase) return { success: false, offline: true };
        try {
            const { error } = await state.supabase.auth.signOut();
            if (error) throw error;
            state.userId = null;
            state.user = null;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async function pull() {
        if (!state.supabase || !state.userId) return [];
        const { data, error } = await state.supabase
            .from('archive_entries')
            .select('*')
            .eq('user_id', state.userId)
            .order('ts', { ascending: true });
        if (error) throw error;
        return Array.isArray(data) ? data : [];
    }

    async function push(entries) {
        if (!state.supabase || !state.userId) return;
        const items = entries.map((entry) => ({
            ...toWire(entry),
            user_id: state.userId
        }));
        // Full-replace sync: clear then re-insert (simple, safe for MVP scale)
        await state.supabase.from('archive_entries').delete().eq('user_id', state.userId);
        if (items.length) {
            const { error } = await state.supabase.from('archive_entries').insert(items);
            if (error) throw error;
        }
    }

    async function syncNow() {
        const auth = window.AuthManager;
        if (!state.available || !state.userId || !auth || !state.supabase) return { ok: false, reason: 'offline' };
        if (state.syncing) return { ok: false, reason: 'busy' };

        state.syncing = true;
        state.lastError = '';
        try {
            const remote = await pull();
            const mine = auth.currentUser === state.user ? auth.getUserHistory() : [];
            const merged = mergeEntries(
                mine,
                readGuestHistory().map((entry) => entry),
                remote.map(fromWire)
            );

            auth.setUserHistory(merged);
            await push(merged);

            state.lastSync = Date.now();
            window.dispatchEvent(new CustomEvent('cloudSync', {
                detail: { user: state.user, count: merged.length }
            }));
            return { ok: true, count: merged.length };
        } catch (err) {
            state.lastError = err.message;
            if (err.status === 401 || String(err.message).includes('401')) {
                state.userId = null;
                state.user = null;
                auth.logout();
            }
            return { ok: false, error: err.message };
        } finally {
            state.syncing = false;
        }
    }

    function scheduleSave() {
        if (!state.available || !state.userId || !state.supabase) return;
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(async () => {
            const auth = window.AuthManager;
            if (!auth || auth.currentUser !== state.user) return;
            state.saving = true;
            try {
                await push(auth.getUserHistory());
                state.lastError = '';
                state.lastSync = Date.now();
                window.dispatchEvent(new CustomEvent('cloudSync', {
                    detail: { user: state.user, count: auth.getUserHistory().length }
                }));
            } catch (err) {
                state.lastError = err.message;
            } finally {
                state.saving = false;
            }
        }, SAVE_DELAY);
    }

    // --------------------------------------------------------- integration

    function patchAuthManager() {
        const auth = window.AuthManager;
        if (!auth || auth.__cloudPatched) return;
        auth.__cloudPatched = true;

        const originalSignUp = auth.signUp.bind(auth);
        const originalLogin = auth.login.bind(auth);
        const originalLogout = auth.logout.bind(auth);
        const originalSetHistory = auth.setUserHistory.bind(auth);

        auth.setUserHistory = function (history) {
            originalSetHistory(history);
            if (state.userId && auth.currentUser === state.user) scheduleSave();
        };

        auth.signUp = async function (username, password) {
            if (!state.available) return originalSignUp(username, password);
            return signUp(username, password);
        };

        auth.login = async function (username, password) {
            if (!state.available) return originalLogin(username, password);
            return login(username, password);
        };

        auth.logout = function () {
            if (state.available && state.userId) {
                logout().catch(() => {});
            }
            state.userId = null;
            state.user = null;
            originalLogout();
        };
    }

    function status() {
        return {
            available: state.available,
            user: state.user,
            syncing: state.syncing,
            saving: state.saving,
            lastError: state.lastError,
            lastSync: state.lastSync
        };
    }

    async function init() {
        patchAuthManager();
        await probe();
        window.dispatchEvent(new CustomEvent('cloudReady', { detail: status() }));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { init(); });
    } else {
        init();
    }

    window.UniStepCloud = {
        status,
        probe,
        signUp,
        login,
        logout,
        syncNow,
        scheduleSave,
        mergeEntries
    };
})();
