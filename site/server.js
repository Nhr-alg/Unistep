/**
 * UniStep validation server.
 *
 * Serves the landing site, exposes a waitlist endpoint, and records
 * privacy-light analytics (no IPs, no cookies, no third-party scripts).
 *
 * Run: node server.js
 * Data: ./data/waitlist.jsonl and ./data/events.jsonl
 *       (override the folder with DATA_DIR=/persistent/path)
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SITE_ROOT = __dirname;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(SITE_ROOT, 'data');
const PORT = Number(process.env.PORT || 8090);
const HOST = process.env.HOST || '0.0.0.0';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const WEBHOOK_URL = process.env.WAITLIST_WEBHOOK_URL || '';

const SITE_CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'"
].join('; ');

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    'Cross-Origin-Opener-Policy': 'same-origin'
};

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.woff2': 'font/woff2'
};

const SEGMENTS = new Set(['students', 'tutors', 'fe']);
const ROLES = new Set(['student', 'tutor', 'educator', 'exam', 'other']);
const EVENT_NAMES = new Set(['page_view', 'segment_view', 'preorder_click', 'prototype_click', 'waitlist_submit', 'form_error']);
const BLOCKED_FILES = new Set([
    'server.js', 'report.js', 'build-pages.js', 'package.json', 'package-lock.json',
    'readme.md', 'validation.md', 'outreach.md', '.gitignore'
]);

const rateBuckets = new Map();

function ensureDataDir() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function clientIp(req) {
    if (TRUST_PROXY) {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string' && forwarded.length > 0) {
            return forwarded.split(',')[0].trim().slice(0, 64);
        }
    }
    return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function rateLimit(req, bucket, max, windowMs) {
    const key = bucket + ':' + clientIp(req);
    const now = Date.now();
    const hits = (rateBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
    if (hits.length >= max) {
        rateBuckets.set(key, hits);
        return false;
    }
    hits.push(now);
    rateBuckets.set(key, hits);
    if (rateBuckets.size > 5000) {
        for (const [k, v] of rateBuckets) {
            if (!v.length || now - v[v.length - 1] > windowMs) rateBuckets.delete(k);
        }
    }
    return true;
}

function sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store'
    });
    res.end(body);
}

function readJsonBody(req, limit) {
    return new Promise((resolve, reject) => {
        const type = String(req.headers['content-type'] || '').split(';')[0].trim();
        if (type !== 'application/json' && type !== 'text/plain') {
            reject(Object.assign(new Error('Unsupported content type.'), { status: 415 }));
            return;
        }

        let size = 0;
        const chunks = [];
        let done = false;

        req.on('data', (chunk) => {
            if (done) return;
            size += chunk.length;
            if (size > limit) {
                done = true;
                // Stop buffering, but drain the rest of the request instead
                // of destroying the socket. Destroying it here surfaced as
                // "ECONNRESET: socket closed unexpectedly" in the browser,
                // which hid the real 413 response.
                req.removeAllListeners('data');
                req.resume();
                reject(Object.assign(new Error('Payload too large.'), { status: 413 }));
                return;
            }
            chunks.push(chunk);
        });

        req.on('end', () => {
            if (done) return;
            done = true;
            try {
                const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    throw new Error('Expected a JSON object.');
                }
                resolve(parsed);
            } catch (err) {
                reject(Object.assign(new Error('Invalid JSON.'), { status: 400 }));
            }
        });

        req.on('error', (err) => {
            if (done) return;
            done = true;
            reject(err);
        });
    });
}

function cleanString(value, max) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, max);
}

function cleanUtm(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const allowed = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const out = {};
    for (const key of allowed) {
        if (typeof value[key] === 'string' && value[key]) out[key] = value[key].slice(0, 120);
    }
    return out;
}

function isValidEmail(email) {
    return typeof email === 'string'
        && email.length >= 5
        && email.length <= 254
        && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

async function appendLine(file, record) {
    await fs.promises.appendFile(path.join(DATA_DIR, file), JSON.stringify(record) + '\n', 'utf8');
}

async function forwardToWebhook(record) {
    if (!WEBHOOK_URL) return;
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
            signal: AbortSignal.timeout(5000)
        });
    } catch (err) {
        console.error('Webhook forward failed:', err.message);
    }
}

async function handleWaitlist(req, res) {
    if (!rateLimit(req, 'waitlist', 8, 60 * 60 * 1000)) {
        sendJson(res, 429, { ok: false, error: 'Too many requests. Try again later.' });
        return;
    }

    let body;
    try {
        body = await readJsonBody(req, 16 * 1024);
    } catch (err) {
        sendJson(res, err.status || 400, { ok: false, error: err.message });
        return;
    }

    const email = cleanString(body.email, 254).toLowerCase();
    const segment = cleanString(body.segment, 20);
    const role = cleanString(body.role, 20);
    const plan = cleanString(body.plan, 40);
    const topic = cleanString(body.topic, 200);
    const visitorId = cleanString(body.visitorId, 100);
    const referrer = cleanString(body.referrer, 300);
    const pagePath = cleanString(body.path, 200);

    if (!isValidEmail(email)) {
        sendJson(res, 400, { ok: false, error: 'Enter a valid email address.' });
        return;
    }
    if (!SEGMENTS.has(segment)) {
        sendJson(res, 400, { ok: false, error: 'Unknown track.' });
        return;
    }
    if (!ROLES.has(role)) {
        sendJson(res, 400, { ok: false, error: 'Unknown role.' });
        return;
    }
    if (!/^[a-z0-9_]{2,40}$/.test(plan)) {
        sendJson(res, 400, { ok: false, error: 'Unknown plan.' });
        return;
    }
    if (body.consent !== true) {
        sendJson(res, 400, { ok: false, error: 'Consent is required.' });
        return;
    }

    const record = {
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        email: email,
        segment: segment,
        role: role,
        plan: plan,
        topic: topic,
        visitorId: visitorId,
        consent: true,
        utm: cleanUtm(body.utm),
        referrer: referrer,
        path: pagePath
    };

    await appendLine('waitlist.jsonl', record);
    forwardToWebhook(record);
    sendJson(res, 200, { ok: true });
}

async function handleEvent(req, res) {
    if (!rateLimit(req, 'event', 240, 60 * 60 * 1000)) {
        sendJson(res, 429, { ok: false, error: 'Too many requests.' });
        return;
    }

    let body;
    try {
        body = await readJsonBody(req, 8 * 1024);
    } catch (err) {
        sendJson(res, err.status || 400, { ok: false, error: err.message });
        return;
    }

    const name = cleanString(body.name, 40);
    const segment = cleanString(body.segment, 20);
    if (!EVENT_NAMES.has(name) || !SEGMENTS.has(segment)) {
        sendJson(res, 400, { ok: false, error: 'Unknown event.' });
        return;
    }

    const meta = body.meta && typeof body.meta === 'object' && !Array.isArray(body.meta)
        ? JSON.stringify(body.meta).slice(0, 2000)
        : '{}';

    const record = {
        ts: new Date().toISOString(),
        name: name,
        segment: segment,
        visitorId: cleanString(body.visitorId, 100),
        path: cleanString(body.path, 200),
        utm: cleanUtm(body.utm),
        meta: meta
    };

    await appendLine('events.jsonl', record);
    sendJson(res, 200, { ok: true });
}

function isInside(root, candidate) {
    const relative = path.relative(root, candidate);
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

// ============================================================== accounts
//
// A small, self-contained account store so a tutoring centre can share a
// roster instead of a browser profile. Passwords are scrypt-hashed with a
// per-user salt; sessions are opaque random tokens in an HttpOnly cookie.
//
// Scope note: this is a single-process store backed by JSON files. It is
// sized for a pilot, not a multi-region deployment - swap the two functions
// below for a real database before you outgrow one machine.

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ARCHIVE_DIR = path.join(DATA_DIR, 'archives');
const SESSION_COOKIE = 'unistep_sid';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const MAX_ARCHIVE_ITEMS = 200;
const sessions = new Map();

let usersStoreFailed = false;

function loadUsers() {
    usersStoreFailed = false;
    try {
        const raw = fs.readFileSync(USERS_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            usersStoreFailed = true;
            console.error('users.json has an unexpected shape; refusing writes.');
            return Object.create(null);
        }
        const out = Object.create(null);
        for (const [name, record] of Object.entries(parsed)) {
            if (!record || typeof record !== 'object') continue;
            if (typeof record.salt !== 'string' || typeof record.hash !== 'string') continue;
            out[name] = {
                salt: record.salt,
                hash: record.hash,
                createdAt: typeof record.createdAt === 'string' ? record.createdAt : ''
            };
        }
        return out;
    } catch (err) {
        if (err.code === 'ENOENT') return Object.create(null);
        // Do not treat an unreadable store as empty: a later sign-up would
        // overwrite every existing account. Fail closed instead.
        usersStoreFailed = true;
        console.error('users.json unreadable; refusing writes:', err.message);
        return Object.create(null);
    }
}

async function saveUsers(users) {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    const tmp = USERS_FILE + '.' + crypto.randomBytes(6).toString('hex') + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(users, null, 2), 'utf8');
    await fs.promises.rename(tmp, USERS_FILE);
}

// Serialise sign-ups so two requests cannot both read the same store and have
// the second write silently discard the first account.
let userStoreQueue = Promise.resolve();

function queueUserStore(task) {
    const next = userStoreQueue.then(task, task);
    userStoreQueue = next.catch(() => {});
    return next;
}

function scryptAsync(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => {
            if (err) reject(err);
            else resolve(key);
        });
    });
}

function parseCookies(req) {
    const header = req.headers.cookie;
    const out = Object.create(null);
    if (typeof header !== 'string' || header.length > 8192) return out;
    for (const part of header.split(';')) {
        const index = part.indexOf('=');
        if (index < 1) continue;
        const name = part.slice(0, index).trim();
        if (!name) continue;
        try {
            // A malformed percent-escape is just a bad cookie. Ignore that
            // value instead of throwing out of the request handler, which
            // would terminate Node and reset every open connection.
            out[name] = decodeURIComponent(part.slice(index + 1).trim());
        } catch (err) {
            continue;
        }
    }
    return out;
}

function sessionCookie(token, maxAgeSeconds) {
    const secure = TRUST_PROXY ? '; Secure' : '';
    return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

function currentUser(req) {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (!token) return null;
    const session = sessions.get(token);
    if (!session) return null;
    if (session.expires < Date.now()) {
        sessions.delete(token);
        return null;
    }
    session.expires = Date.now() + SESSION_TTL_MS;
    return session.username;
}

function sameOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return true;
    try {
        return new URL(origin).host === req.headers.host;
    } catch (err) {
        return false;
    }
}

function cleanUsername(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function archivePath(username) {
    const safe = username.replace(/[^a-z0-9._-]/g, '');
    return path.join(ARCHIVE_DIR, safe + '.json');
}

async function readArchive(username) {
    try {
        const raw = await fs.promises.readFile(archivePath(username), 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        if (err.code !== 'ENOENT') console.error('archive unreadable:', err.message);
        return [];
    }
}

async function writeArchive(username, items) {
    await fs.promises.mkdir(ARCHIVE_DIR, { recursive: true });
    const target = archivePath(username);
    const tmp = target + '.' + crypto.randomBytes(6).toString('hex') + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(items), 'utf8');
    await fs.promises.rename(tmp, target);
}

// History entries come from the browser, so nothing here is trusted. Only
// the known fields survive, every string is length-capped, and the list is
// truncated - a tampered payload cannot grow the file without bound.
function sanitiseHistory(value) {
    if (!Array.isArray(value)) return [];
    const out = [];
    for (const entry of value.slice(0, MAX_ARCHIVE_ITEMS)) {
        if (!entry || typeof entry !== 'object') continue;
        const text = cleanString(entry.text, 2000);
        if (!text) continue;
        const tag = entry.tag === 'important' || entry.tag === 'revision' ? entry.tag : 'none';
        const suppliedId = Number(entry.id);
        const id = Number.isFinite(suppliedId) && suppliedId > 0 ? suppliedId : Date.now();
        const ts = typeof entry.ts === 'number' && Number.isFinite(entry.ts) ? entry.ts : id;
        out.push({
            id,
            text,
            answer: cleanString(entry.answer, 300),
            tag,
            timestamp: cleanString(entry.timestamp, 40),
            ts
        });
    }
    return out;
}

async function handleSignup(req, res) {
    if (!sameOrigin(req)) {
        sendJson(res, 403, { ok: false, error: 'Cross-origin request rejected.' });
        return;
    }
    if (!rateLimit(req, 'signup', 10, 60 * 60 * 1000)) {
        sendJson(res, 429, { ok: false, error: 'Too many sign-ups from this address. Try again later.' });
        return;
    }

    let body;
    try {
        body = await readJsonBody(req, 4 * 1024);
    } catch (err) {
        sendJson(res, err.status || 400, { ok: false, error: err.message });
        return;
    }

    const username = cleanUsername(body.username);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) {
        sendJson(res, 400, { ok: false, error: 'Use 3-32 characters: letters, numbers, dot, dash or underscore.' });
        return;
    }
    if (password.length < 10 || password.length > 200) {
        sendJson(res, 400, { ok: false, error: 'Use a password of at least 10 characters.' });
        return;
    }

    const created = await queueUserStore(async () => {
        const users = loadUsers();
        if (usersStoreFailed) {
            return { status: 503, error: 'Account storage is temporarily unavailable.' };
        }
        if (Object.prototype.hasOwnProperty.call(users, username)) {
            return { status: 409, error: 'That username is already taken.' };
        }

        const salt = crypto.randomBytes(16).toString('base64');
        const hash = (await scryptAsync(password, salt)).toString('base64');
        users[username] = { salt, hash, createdAt: new Date().toISOString() };
        await saveUsers(users);
        return { ok: true };
    });

    if (!created.ok) {
        sendJson(res, created.status, { ok: false, error: created.error });
        return;
    }

    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { username, expires: Date.now() + SESSION_TTL_MS });

    res.setHeader('Set-Cookie', sessionCookie(token, Math.floor(SESSION_TTL_MS / 1000)));
    sendJson(res, 201, { ok: true, username });
}

async function handleLogin(req, res) {
    if (!sameOrigin(req)) {
        sendJson(res, 403, { ok: false, error: 'Cross-origin request rejected.' });
        return;
    }
    if (!rateLimit(req, 'login', 20, 15 * 60 * 1000)) {
        sendJson(res, 429, { ok: false, error: 'Too many attempts. Wait a few minutes and try again.' });
        return;
    }

    let body;
    try {
        body = await readJsonBody(req, 4 * 1024);
    } catch (err) {
        sendJson(res, err.status || 400, { ok: false, error: err.message });
        return;
    }

    const username = cleanUsername(body.username);
    const password = typeof body.password === 'string' ? body.password : '';
    const users = loadUsers();
    if (usersStoreFailed) {
        sendJson(res, 503, { ok: false, error: 'Account storage is temporarily unavailable.' });
        return;
    }
    const record = Object.prototype.hasOwnProperty.call(users, username) ? users[username] : null;
    const validRecord = Boolean(record)
        && typeof record.salt === 'string'
        && typeof record.hash === 'string';

    // Always spend the scrypt time, even for an unknown user, so the response
    // time does not reveal which usernames exist.
    const salt = validRecord ? record.salt : crypto.randomBytes(16).toString('base64');
    const derived = (await scryptAsync(password, salt)).toString('base64');
    const stored = validRecord ? record.hash : crypto.randomBytes(64).toString('base64');
    const matches = validRecord
        && derived.length === stored.length
        && crypto.timingSafeEqual(Buffer.from(derived), Buffer.from(stored));

    if (!matches) {
        sendJson(res, 401, { ok: false, error: 'Incorrect username or password.' });
        return;
    }

    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { username, expires: Date.now() + SESSION_TTL_MS });
    res.setHeader('Set-Cookie', sessionCookie(token, Math.floor(SESSION_TTL_MS / 1000)));
    sendJson(res, 200, { ok: true, username });
}

function handleLogout(req, res) {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) sessions.delete(token);
    res.setHeader('Set-Cookie', sessionCookie('', 0));
    sendJson(res, 200, { ok: true });
}

function handleSession(req, res) {
    const username = currentUser(req);
    // Anonymous is a normal state, not an error: answering 200 keeps the
    // console clean and lets the client decide how to present it.
    sendJson(res, 200, { ok: Boolean(username), username: username || null });
}

async function handleArchiveGet(req, res) {
    const username = currentUser(req);
    if (!username) {
        sendJson(res, 401, { ok: false, error: 'Not signed in.' });
        return;
    }
    const items = await readArchive(username);
    sendJson(res, 200, { ok: true, items });
}

async function handleArchivePut(req, res) {
    if (!sameOrigin(req)) {
        sendJson(res, 403, { ok: false, error: 'Cross-origin request rejected.' });
        return;
    }
    const username = currentUser(req);
    if (!username) {
        sendJson(res, 401, { ok: false, error: 'Not signed in.' });
        return;
    }
    if (!rateLimit(req, 'archive', 120, 60 * 60 * 1000)) {
        sendJson(res, 429, { ok: false, error: 'Too many saves. Try again shortly.' });
        return;
    }

    let body;
    try {
        body = await readJsonBody(req, 512 * 1024);
    } catch (err) {
        sendJson(res, err.status || 400, { ok: false, error: err.message });
        return;
    }

    const items = sanitiseHistory(body.items);
    await writeArchive(username, items);
    sendJson(res, 200, { ok: true, count: items.length });
}

const DEMO_BLOCKED_SEGMENTS = new Set(['site', '_old', 'node_modules', '.git', '.svn']);
const DEMO_EXTENSIONS = new Set([
    '.html', '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.txt', '.woff2', '.json'
]);
// Public landing-site files must match this list. Anything else (a stray
// backup, a future data export, a source map) fails closed with 404 instead
// of being served because nobody remembered to add it to BLOCKED_FILES.
const PUBLIC_EXTENSIONS = new Set([
    '.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.txt', '.xml', '.woff2'
]);

function sendNotFound(res) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
}

function isUnsafePath(relativePath, isDemo) {
    for (const raw of relativePath.split(/[\\/]+/)) {
        if (!raw || raw === '.') continue;
        const segment = raw.toLowerCase();
        // ".." is handled by path.resolve + isInside; everything else is
        // blocked before it can reach a sensitive directory or Windows
        // alternate-data-stream / trailing-dot aliasing.
        if (segment === '..') continue;
        if (isDemo && DEMO_BLOCKED_SEGMENTS.has(segment)) return true;
        if (segment.startsWith('.')) return true;
        if (segment.includes(':')) return true;
        if (/[. ]$/.test(segment)) return true;
        // Windows device names are not ordinary files: "CON", "NUL",
        // "COM1" and friends can block or behave unpredictably when opened.
        if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9]|conin\$|conout\$|clock\$)(?:\.|$)/.test(segment)) return true;
    }
    return false;
}

function sendStatic(req, res, urlPath) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
        res.end();
        return;
    }

    const isDemo = urlPath === '/demo' || urlPath.startsWith('/demo/');
    const root = isDemo ? PROJECT_ROOT : SITE_ROOT;
    // The request listener already decoded the path exactly once. Decoding it
    // again here made "/demo/%25" become "/demo/%" and threw URIError, which
    // escaped the handler and killed the process.
    const relativePath = isDemo ? urlPath.slice('/demo'.length) : urlPath;

    if (relativePath.includes('\0')) {
        res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Bad request');
        return;
    }

    if (isUnsafePath(relativePath, isDemo)) {
        sendNotFound(res);
        return;
    }

    let target = path.resolve(root, '.' + (relativePath || '/'));

    if (!isInside(root, target)) {
        res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    if (!isDemo) {
        // Windows paths are case-insensitive, so compare the relative path in
        // lower case; otherwise "/DATA/USERS.JSON" and "/SERVER.JS" bypass the
        // data-directory and blocked-file checks.
        const siteRelative = path.relative(SITE_ROOT, target).toLowerCase();
        if (siteRelative === 'data' || siteRelative.startsWith('data' + path.sep)) {
            sendNotFound(res);
            return;
        }
        if (BLOCKED_FILES.has(path.basename(target).toLowerCase())) {
            sendNotFound(res);
            return;
        }
    }

    let stat;
    try {
        stat = fs.statSync(target);
        if (stat.isDirectory()) {
            target = path.join(target, 'index.html');
            stat = fs.statSync(target);
        }
    } catch (err) {
        sendNotFound(res);
        return;
    }

    if (!stat.isFile()) {
        sendNotFound(res);
        return;
    }

    // Resolve the real file so an 8.3 short name, junction or symlink cannot
    // point at a blocked file while the URL still looks harmless.
    let canonical;
    try {
        canonical = fs.realpathSync.native ? fs.realpathSync.native(target) : fs.realpathSync(target);
    } catch (err) {
        sendNotFound(res);
        return;
    }

    if (!isInside(root, canonical)) {
        sendNotFound(res);
        return;
    }

    const canonicalBase = path.basename(canonical).toLowerCase();
    if (BLOCKED_FILES.has(canonicalBase)) {
        sendNotFound(res);
        return;
    }

    // The account store and archives must never be reachable, whether the
    // request used "/data/...", a short name, or a symlink.
    const siteRelativeCanonical = path.relative(SITE_ROOT, canonical).toLowerCase();
    if (siteRelativeCanonical === 'data' || siteRelativeCanonical.startsWith('data' + path.sep)) {
        sendNotFound(res);
        return;
    }

    if (isDemo) {
        const canonicalSegments = path.relative(root, canonical).toLowerCase().split(path.sep);
        if (canonicalSegments.some((segment) => DEMO_BLOCKED_SEGMENTS.has(segment))) {
            sendNotFound(res);
            return;
        }
    }

    const ext = path.extname(canonical).toLowerCase();
    if (isDemo) {
        if (!DEMO_EXTENSIONS.has(ext) || BLOCKED_FILES.has(canonicalBase)) {
            sendNotFound(res);
            return;
        }
    } else if (!PUBLIC_EXTENSIONS.has(ext)) {
        sendNotFound(res);
        return;
    }

    const type = MIME[ext] || 'application/octet-stream';
    const headers = {
        ...SECURITY_HEADERS,
        'Content-Type': type,
        'Content-Length': stat.size,
        'Cache-Control': 'no-store'
    };
    if (!isDemo) headers['Content-Security-Policy'] = SITE_CSP;

    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
        res.end();
        return;
    }

    const stream = fs.createReadStream(canonical);
    stream.on('error', (err) => {
        console.error('Static read failed:', err.message);
        res.destroy();
    });
    stream.pipe(res);
}

function failRequest(res, err, label) {
    console.error(label + ':', err);
    if (res.headersSent) {
        res.destroy();
        return;
    }
    try {
        sendJson(res, 500, { ok: false, error: 'Something went wrong on the server.' });
    } catch (sendErr) {
        console.error('Could not send error response:', sendErr);
        res.destroy();
    }
}

function handleRequest(req, res) {
    let urlPath;
    try {
        urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch (err) {
        res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Bad request');
        return;
    }

    if (urlPath === '/healthz') {
        sendJson(res, 200, { ok: true });
        return;
    }

    if (urlPath === '/api/waitlist') {
        if (req.method !== 'POST') {
            res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'POST' });
            res.end();
            return;
        }
        Promise.resolve()
            .then(() => handleWaitlist(req, res))
            .catch((err) => failRequest(res, err, 'Waitlist error'));
        return;
    }

    if (urlPath === '/api/event') {
        if (req.method !== 'POST') {
            res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'POST' });
            res.end();
            return;
        }
        Promise.resolve()
            .then(() => handleEvent(req, res))
            .catch((err) => failRequest(res, err, 'Event error'));
        return;
    }

    if (urlPath.startsWith('/api/auth/') || urlPath === '/api/archive') {
        const route = (() => {
            switch (urlPath) {
                case '/api/auth/signup': return { methods: ['POST'], handler: handleSignup };
                case '/api/auth/login': return { methods: ['POST'], handler: handleLogin };
                case '/api/auth/logout': return { methods: ['POST'], handler: handleLogout };
                case '/api/auth/session': return { methods: ['GET'], handler: handleSession };
                case '/api/archive': return {
                    methods: ['GET', 'PUT'],
                    handler: req.method === 'PUT' ? handleArchivePut : handleArchiveGet
                };
                default: return null;
            }
        })();

        if (!route) {
            sendJson(res, 404, { ok: false, error: 'Not found.' });
            return;
        }
        if (!route.methods.includes(req.method)) {
            res.writeHead(405, { ...SECURITY_HEADERS, Allow: route.methods.join(', ') });
            res.end();
            return;
        }
        // Invoke the handler inside the promise chain. Calling it as an
        // argument to Promise.resolve() runs it synchronously, so a throw
        // escaped the catch and terminated the process.
        Promise.resolve()
            .then(() => route.handler(req, res))
            .catch((err) => failRequest(res, err, 'Auth route error'));
        return;
    }

    if (urlPath.startsWith('/api/')) {
        sendJson(res, 404, { ok: false, error: 'Not found.' });
        return;
    }

    sendStatic(req, res, urlPath);
}

const server = http.createServer((req, res) => {
    res.on('error', (err) => {
        console.error('Response error:', err.message);
    });
    try {
        handleRequest(req, res);
    } catch (err) {
        failRequest(res, err, 'Uncaught request error');
    }
});

server.on('clientError', (err, socket) => {
    if (!socket.writable || socket.destroyed) return;
    socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
});

function pruneSessions() {
    const now = Date.now();
    for (const [token, session] of sessions) {
        if (!session || session.expires < now) sessions.delete(token);
    }
}

server.requestTimeout = 15000;
server.headersTimeout = 20000;

server.on('error', (err) => {
    console.error('Server error:', err.message);
});

const sessionPruner = setInterval(pruneSessions, 60 * 60 * 1000);
sessionPruner.unref();

ensureDataDir();
server.listen(PORT, HOST, () => {
    console.log(`UniStep validation site: http://localhost:${PORT}`);
    console.log(`Demo prototype:          http://localhost:${PORT}/demo/`);
    console.log(`Data directory:          ${DATA_DIR}`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));


