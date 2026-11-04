/**
 * UniStep Local Profile Manager
 *
 * Stores per-profile history and credentials in localStorage.
 *
 * SECURITY NOTE: this is a client-side application with no server. Everything
 * below runs in the user's own browser, so it is a profile selector, NOT an
 * authentication boundary. Anyone with DevTools can read or modify storage.
 * The goal here is only to stop storing plaintext passwords and to keep the
 * API safe against corrupted/tampered storage.
 */

(function () {
    const USERS_KEY = 'sc_users';
    const SESSION_KEY = 'sc_current_user';
    const ITERATIONS = 210000;
    const MAX_HISTORY = 200;
    const USERNAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/;

    const encoder = new TextEncoder();

    function bytesToBase64(bytes) {
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return btoa(binary);
    }

    function base64ToBytes(value) {
        const binary = atob(value);
        return Uint8Array.from(binary, (c) => c.charCodeAt(0));
    }

    function constantTimeEqual(a, b) {
        if (a.length !== b.length) return false;
        let diff = 0;
        for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
        return diff === 0;
    }

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    async function derivePassword(password, salt, iterations) {
        if (!globalThis.crypto || !crypto.subtle) {
            throw new Error('Web Crypto is unavailable. Open the app over http://localhost or https.');
        }
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
            keyMaterial,
            256
        );
        return new Uint8Array(bits);
    }

    class AuthManager {
        constructor() {
            this.currentUser = this.getCurrentUser();
        }

        getCurrentUser() {
            try {
                return sessionStorage.getItem(SESSION_KEY);
            } catch (err) {
                return null;
            }
        }

        readUsers() {
            try {
                const raw = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
                if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
                // Null-prototype map so names like "__proto__" cannot pollute Object.prototype.
                const users = {};
                for (const key of Object.keys(raw)) {
                    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
                    if (raw[key] && typeof raw[key] === 'object') users[key] = raw[key];
                }
                return users;
            } catch (err) {
                console.error('Corrupted user store, starting empty.', err);
                return {};
            }
        }

        writeUsers(users) {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        async signUp(username, password) {
            const name = typeof username === 'string' ? username.trim() : '';
            if (!USERNAME_RE.test(name)) {
                return { success: false, error: 'Username must be 3-32 characters: letters, numbers, dot, dash or underscore.' };
            }
            if (typeof password !== 'string' || password.length < 8) {
                return { success: false, error: 'Password must be at least 8 characters.' };
            }
            if (password.length > 256) {
                return { success: false, error: 'Password is too long (max 256 characters).' };
            }

            const users = this.readUsers();
            if (hasOwn(users, name)) {
                return { success: false, error: 'Username already exists.' };
            }

            try {
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const hash = await derivePassword(password, salt, ITERATIONS);

                users[name] = {
                    salt: bytesToBase64(salt),
                    hash: bytesToBase64(hash),
                    iterations: ITERATIONS,
                    algorithm: 'PBKDF2-SHA256',
                    createdAt: new Date().toISOString(),
                    history: []
                };

                this.writeUsers(users);
                this.setCurrentUser(name);
                return { success: true, user: name };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        async login(username, password) {
            const name = typeof username === 'string' ? username.trim() : '';
            const users = this.readUsers();
            const user = hasOwn(users, name) ? users[name] : null;
            const invalid = { success: false, error: 'Invalid username or password.' };

            if (typeof password !== 'string' || password.length === 0 || password.length > 256) {
                return invalid;
            }

            if (!user) {
                // Spend comparable time on unknown users to avoid a trivial timing oracle.
                try {
                    await derivePassword(password, new Uint8Array(16), ITERATIONS);
                } catch (err) { /* ignore */ }
                return invalid;
            }

            try {
                // Migrate legacy plaintext records on first successful login.
                if (typeof user.password === 'string') {
                    if (user.password !== password) return invalid;

                    const salt = crypto.getRandomValues(new Uint8Array(16));
                    const hash = await derivePassword(password, salt, ITERATIONS);
                    delete user.password;
                    user.salt = bytesToBase64(salt);
                    user.hash = bytesToBase64(hash);
                    user.iterations = ITERATIONS;
                    user.algorithm = 'PBKDF2-SHA256';
                    users[name] = user;
                    this.writeUsers(users);

                    this.setCurrentUser(name);
                    return { success: true, user: name, migrated: true };
                }

                if (!user.salt || !user.hash) return invalid;

                const iterations = Number(user.iterations) || ITERATIONS;
                const derived = await derivePassword(password, base64ToBytes(user.salt), iterations);
                if (!constantTimeEqual(derived, base64ToBytes(user.hash))) return invalid;

                this.setCurrentUser(name);
                return { success: true, user: name };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        setCurrentUser(username) {
            sessionStorage.setItem(SESSION_KEY, username);
            this.currentUser = username;
            window.dispatchEvent(new CustomEvent('authChange', { detail: { user: username } }));
        }

        logout() {
            sessionStorage.removeItem(SESSION_KEY);
            this.currentUser = null;
            window.dispatchEvent(new CustomEvent('authChange', { detail: { user: null } }));
        }

        getUserData() {
            if (!this.currentUser) return null;
            const users = this.readUsers();
            return hasOwn(users, this.currentUser) ? users[this.currentUser] : null;
        }

        getUserHistory() {
            const data = this.getUserData();
            return Array.isArray(data?.history) ? data.history.slice(-MAX_HISTORY) : [];
        }

        saveUserHistory(entry) {
            if (!this.currentUser || !entry || typeof entry !== 'object') return;
            this.setUserHistory([...this.getUserHistory(), entry]);
        }

        setUserHistory(history) {
            if (!this.currentUser) return;
            const users = this.readUsers();
            if (!hasOwn(users, this.currentUser)) return;

            users[this.currentUser].history = Array.isArray(history)
                ? history.slice(-MAX_HISTORY)
                : [];
            try {
                this.writeUsers(users);
            } catch (err) {
                console.error('Could not save archive (storage full?).', err);
            }
        }
    }

    window.AuthManager = new AuthManager();
})();
