#!/usr/bin/env node
/**
 * Validation report.
 *
 * Usage:
 *   node report.js
 *   node report.js --json
 *
 * Reads ./data/events.jsonl and ./data/waitlist.jsonl and prints
 * per-track funnel numbers against the targets in VALIDATION.md.
 * Set DATA_DIR to match the server when data lives on a mounted disk.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(__dirname, 'data');
const SEGMENTS = ['students', 'tutors', 'fe'];
const LABELS = { students: 'Students', tutors: 'Tutoring centers', fe: 'FE/PE prep' };

function readJsonl(file) {
    const full = path.join(DATA_DIR, file);
    if (!fs.existsSync(full)) return [];
    return fs.readFileSync(full, 'utf8')
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
            try {
                return JSON.parse(line);
            } catch (err) {
                return null;
            }
        })
        .filter(Boolean);
}

function maskEmail(email) {
    if (typeof email !== 'string' || !email.includes('@')) return '(invalid)';
    const [local, domain] = email.split('@');
    return (local.slice(0, 1) || '?') + '***@' + domain;
}

function pad(value, width) {
    const text = String(value);
    return text + ' '.repeat(Math.max(0, width - text.length));
}

function pct(numerator, denominator) {
    if (!denominator) return '—';
    return (100 * numerator / denominator).toFixed(1) + '%';
}

function buildReport() {
    const events = readJsonl('events.jsonl');
    const waitlist = readJsonl('waitlist.jsonl');

    const bySegment = {};
    for (const segment of SEGMENTS) {
        bySegment[segment] = {
            label: LABELS[segment],
            visitors: new Set(),
            pageViews: 0,
            preorderClicks: 0,
            emails: new Set(),
            signups: 0
        };
    }

    for (const event of events) {
        const bucket = bySegment[event.segment];
        if (!bucket) continue;
        if (event.name === 'page_view') {
            bucket.pageViews++;
            if (event.visitorId) bucket.visitors.add(event.visitorId);
        }
        if (event.name === 'preorder_click') bucket.preorderClicks++;
    }

    for (const entry of waitlist) {
        const bucket = bySegment[entry.segment];
        if (!bucket) continue;
        bucket.emails.add(entry.email);
    }

    const rows = SEGMENTS.map((segment) => {
        const bucket = bySegment[segment];
        const visitors = bucket.visitors.size;
        const signups = bucket.emails.size;
        return {
            segment: segment,
            label: bucket.label,
            visitors: visitors,
            pageViews: bucket.pageViews,
            signups: signups,
            signupRate: visitors ? signups / visitors : 0,
            preorderClicks: bucket.preorderClicks,
            preorderRate: visitors ? bucket.preorderClicks / visitors : 0
        };
    });

    const totals = rows.reduce((acc, row) => {
        acc.visitors += row.visitors;
        acc.signups += row.signups;
        acc.preorderClicks += row.preorderClicks;
        return acc;
    }, { visitors: 0, signups: 0, preorderClicks: 0 });

    const recent = waitlist.slice(-8).reverse().map((entry) => ({
        ts: entry.ts,
        email: maskEmail(entry.email),
        segment: entry.segment,
        role: entry.role,
        plan: entry.plan
    }));

    return {
        generatedAt: new Date().toISOString(),
        rows: rows,
        totals: {
            ...totals,
            signupRate: totals.visitors ? totals.signups / totals.visitors : 0,
            preorderRate: totals.visitors ? totals.preorderClicks / totals.visitors : 0
        },
        recent: recent
    };
}

function printReport(report) {
    console.log('');
    console.log('UniStep validation report');
    console.log('Generated: ' + report.generatedAt);
    console.log('');

    const header = pad('Track', 20) + pad('Visitors', 10) + pad('Signups', 9) + pad('Signup %', 10) + pad('Pre-order', 11) + 'Pre-order %';
    console.log(header);
    console.log('-'.repeat(header.length));

    for (const row of report.rows) {
        console.log(
            pad(row.label, 20) +
            pad(row.visitors, 10) +
            pad(row.signups, 9) +
            pad(pct(row.signups, row.visitors), 10) +
            pad(row.preorderClicks, 11) +
            pct(row.preorderClicks, row.visitors)
        );
    }

    console.log('-'.repeat(header.length));
    console.log(
        pad('All tracks', 20) +
        pad(report.totals.visitors, 10) +
        pad(report.totals.signups, 9) +
        pad(pct(report.totals.signups, report.totals.visitors), 10) +
        pad(report.totals.preorderClicks, 11) +
        pct(report.totals.preorderClicks, report.totals.visitors)
    );

    console.log('');
    console.log('Decision targets (14 days, see VALIDATION.md):');
    console.log('  Signup rate     >= 8% cold traffic / >= 15% community traffic');
    console.log('  Pre-order rate  >= 10% of visitors or >= 25% of signups');
    console.log('  Build signal    30+ signups in a track, or 2+ paid tutor pilots');
    console.log('');

    if (report.recent.length) {
        console.log('Latest signups:');
        for (const entry of report.recent) {
            console.log(
                '  ' + pad(entry.ts, 22) +
                pad(entry.segment, 10) +
                pad(entry.role, 10) +
                pad(entry.plan, 22) +
                entry.email
            );
        }
    } else {
        console.log('No signups recorded yet.');
    }
    console.log('');
}

const report = buildReport();

if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
} else {
    printReport(report);
}
