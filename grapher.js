/**
 * UniStep Grapher
 *
 * Plots y = f(x) on a canvas. The expression is parsed by a small
 * recursive-descent parser — never eval() — so a pasted string cannot
 * execute code. Supported: + - * / ^ ( ) x, numbers, sin cos tan asin acos
 * atan sqrt ln log exp abs.
 */

(function () {
    'use strict';

    const FUNCTIONS = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        sqrt: Math.sqrt,
        ln: Math.log,
        log: Math.log10,
        exp: Math.exp,
        abs: Math.abs
    };

    function tokenize(source) {
        const tokens = [];
        let index = 0;
        const text = String(source).toLowerCase().replace(/\s+/g, '');

        while (index < text.length) {
            const char = text[index];

            if (/[0-9.]/.test(char)) {
                let number = '';
                while (index < text.length && /[0-9.]/.test(text[index])) {
                    number += text[index];
                    index += 1;
                }
                if ((number.match(/\./g) || []).length > 1) throw new Error('Malformed number.');
                tokens.push({ type: 'number', value: parseFloat(number) });
                continue;
            }

            if (/[a-z]/.test(char)) {
                let name = '';
                while (index < text.length && /[a-z0-9_]/.test(text[index])) {
                    name += text[index];
                    index += 1;
                }
                tokens.push({ type: 'name', value: name });
                continue;
            }

            if ('+-*/^()'.includes(char)) {
                tokens.push({ type: 'op', value: char });
                index += 1;
                continue;
            }

            throw new Error(`Unexpected character "${char}".`);
        }

        return tokens;
    }

    function parse(source) {
        const tokens = tokenize(source);
        let position = 0;

        const peek = () => tokens[position];
        const eat = (value) => {
            const token = tokens[position];
            if (!token || token.value !== value) throw new Error(`Expected "${value}".`);
            position += 1;
            return token;
        };

        function expression() {
            let node = term();
            while (peek() && (peek().value === '+' || peek().value === '-')) {
                const operator = tokens[position].value;
                position += 1;
                node = { type: 'binary', operator, left: node, right: term() };
            }
            return node;
        }

        function term() {
            let node = power();
            while (peek() && (peek().value === '*' || peek().value === '/')) {
                const operator = tokens[position].value;
                position += 1;
                node = { type: 'binary', operator, left: node, right: power() };
            }
            return node;
        }

        function power() {
            const base = unary();
            if (peek() && peek().value === '^') {
                position += 1;
                return { type: 'binary', operator: '^', left: base, right: power() };
            }
            return base;
        }

        function unary() {
            if (peek() && peek().value === '-') {
                position += 1;
                return { type: 'negate', value: unary() };
            }
            if (peek() && peek().value === '+') {
                position += 1;
                return unary();
            }
            return primary();
        }

        function primary() {
            const token = peek();
            if (!token) throw new Error('Unexpected end of expression.');

            if (token.type === 'number') {
                position += 1;
                return { type: 'number', value: token.value };
            }

            if (token.type === 'name') {
                position += 1;
                if (token.value === 'x') return { type: 'variable' };
                if (token.value === 'pi') return { type: 'number', value: Math.PI };
                if (token.value === 'e') return { type: 'number', value: Math.E };
                if (FUNCTIONS[token.value]) {
                    eat('(');
                    const argument = expression();
                    eat(')');
                    return { type: 'call', name: token.value, argument };
                }
                throw new Error(`Unknown name "${token.value}".`);
            }

            if (token.value === '(') {
                eat('(');
                const node = expression();
                eat(')');
                return node;
            }

            throw new Error(`Unexpected token "${token.value}".`);
        }

        const tree = expression();
        if (position !== tokens.length) throw new Error('Unexpected trailing input.');
        return tree;
    }

    function evaluate(node, x) {
        switch (node.type) {
            case 'number': return node.value;
            case 'variable': return x;
            case 'negate': return -evaluate(node.value, x);
            case 'binary': {
                const left = evaluate(node.left, x);
                const right = evaluate(node.right, x);
                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return left / right;
                    case '^': return Math.pow(left, right);
                    default: return NaN;
                }
            }
            case 'call': return FUNCTIONS[node.name](evaluate(node.argument, x));
            default: return NaN;
        }
    }

    function compile(source) {
        const tree = parse(source);
        return (x) => evaluate(tree, x);
    }

    function niceStep(range, target) {
        const rough = range / target;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
        const normalised = rough / magnitude;
        let step;
        if (normalised < 1.5) step = 1;
        else if (normalised < 3) step = 2;
        else if (normalised < 7) step = 5;
        else step = 10;
        return step * magnitude;
    }

    function formatTick(value, step) {
        if (Math.abs(value) < 1e-10) return '0';
        if (step >= 1) return String(Math.round(value));
        const decimals = Math.max(0, Math.min(4, -Math.floor(Math.log10(step))));
        return value.toFixed(decimals).replace(/\.?0+$/, '');
    }

    const state = { fn: null, source: '', xmin: -10, xmax: 10 };

    function draw() {
        const canvas = document.getElementById('graph-canvas');
        if (!canvas || !state.fn) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(240, Math.round(rect.width));
        const height = Math.max(180, Math.round(rect.height));

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const styles = getComputedStyle(document.body);
        const lineColour = styles.getPropertyValue('--line-strong').trim() || 'rgba(255,255,255,0.14)';
        const mutedColour = styles.getPropertyValue('--muted-2').trim() || '#6d7890';
        const accentColour = styles.getPropertyValue('--accent').trim() || '#4f8cff';
        const textColour = styles.getPropertyValue('--muted').trim() || '#98a2b8';

        const padding = { left: 44, right: 14, top: 14, bottom: 26 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;

        const samples = Math.max(240, plotWidth);
        const values = [];
        let min = Infinity;
        let max = -Infinity;

        for (let i = 0; i <= samples; i += 1) {
            const x = state.xmin + ((state.xmax - state.xmin) * i) / samples;
            let y;
            try { y = state.fn(x); } catch (err) { y = NaN; }
            values.push({ x, y });
            if (Number.isFinite(y)) {
                if (y < min) min = y;
                if (y > max) max = y;
            }
        }

        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            min = -1;
            max = 1;
        }
        if (Math.abs(max - min) < 1e-9) {
            min -= 1;
            max += 1;
        }

        // Keep tan/log asymptotes from flattening the interesting part.
        const span = max - min;
        const clampedMin = Math.max(min, -20 * span);
        const clampedMax = Math.min(max, 20 * span);
        const yMin = clampedMin - (clampedMax - clampedMin) * 0.08;
        const yMax = clampedMax + (clampedMax - clampedMin) * 0.08;

        const toX = (x) => padding.left + ((x - state.xmin) / (state.xmax - state.xmin)) * plotWidth;
        const toY = (y) => padding.top + ((yMax - y) / (yMax - yMin)) * plotHeight;

        ctx.clearRect(0, 0, width, height);

        const xStep = niceStep(state.xmax - state.xmin, 8);
        const yStep = niceStep(yMax - yMin, 6);

        ctx.lineWidth = 1;
        ctx.strokeStyle = lineColour;
        ctx.fillStyle = textColour;
        ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let x = Math.ceil(state.xmin / xStep) * xStep; x <= state.xmax + 1e-9; x += xStep) {
            const px = toX(x);
            ctx.beginPath();
            ctx.moveTo(px, padding.top);
            ctx.lineTo(px, padding.top + plotHeight);
            ctx.stroke();
            if (Math.abs(x) > 1e-9) {
                ctx.fillText(formatTick(x, xStep), px, padding.top + plotHeight + 6);
            }
        }

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) {
            const py = toY(y);
            ctx.beginPath();
            ctx.moveTo(padding.left, py);
            ctx.lineTo(padding.left + plotWidth, py);
            ctx.stroke();
            if (Math.abs(y) > 1e-9) {
                ctx.fillText(formatTick(y, yStep), padding.left - 6, py);
            }
        }

        // Axes
        ctx.strokeStyle = mutedColour;
        ctx.lineWidth = 1.2;
        if (state.xmin <= 0 && state.xmax >= 0) {
            const px = toX(0);
            ctx.beginPath();
            ctx.moveTo(px, padding.top);
            ctx.lineTo(px, padding.top + plotHeight);
            ctx.stroke();
        }
        if (yMin <= 0 && yMax >= 0) {
            const py = toY(0);
            ctx.beginPath();
            ctx.moveTo(padding.left, py);
            ctx.lineTo(padding.left + plotWidth, py);
            ctx.stroke();
        }

        // Curve
        ctx.strokeStyle = accentColour;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        let drawing = false;
        const jumpLimit = (yMax - yMin) * 2;

        for (const point of values) {
            if (!Number.isFinite(point.y) || point.y < yMin - jumpLimit || point.y > yMax + jumpLimit) {
                drawing = false;
                continue;
            }
            const px = toX(point.x);
            const py = toY(point.y);
            if (!drawing) {
                ctx.moveTo(px, py);
                drawing = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    }

    function plot(source) {
        const input = document.getElementById('graph-input');
        const error = document.getElementById('graph-error');
        const raw = (source !== undefined ? source : input?.value) || '';

        try {
            const clean = raw.replace(/^\s*y\s*=\s*/i, '');
            state.fn = compile(clean);
            state.source = clean;
            if (error) error.textContent = '';
            draw();
        } catch (err) {
            state.fn = null;
            if (error) error.textContent = err.message;
            const canvas = document.getElementById('graph-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    function zoom(factor) {
        const centre = (state.xmin + state.xmax) / 2;
        const half = ((state.xmax - state.xmin) / 2) * factor;
        state.xmin = centre - half;
        state.xmax = centre + half;
        const minField = document.getElementById('graph-xmin');
        const maxField = document.getElementById('graph-xmax');
        if (minField) minField.value = String(Number(state.xmin.toPrecision(4)));
        if (maxField) maxField.value = String(Number(state.xmax.toPrecision(4)));
        draw();
    }

    function setRange() {
        const minField = document.getElementById('graph-xmin');
        const maxField = document.getElementById('graph-xmax');
        const min = Number(minField?.value);
        const max = Number(maxField?.value);
        if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
            const error = document.getElementById('graph-error');
            if (error) error.textContent = 'The left bound must be smaller than the right bound.';
            return;
        }
        state.xmin = min;
        state.xmax = max;
        const error = document.getElementById('graph-error');
        if (error) error.textContent = '';
        draw();
    }

    function open() {
        window.UniStepModal?.open('graph-modal', '#graph-input');
        window.setTimeout(() => {
            if (!state.fn) plot(document.getElementById('graph-input')?.value || 'x^2');
            else draw();
        }, 30);
    }

    function wire() {
        document.getElementById('graph-plot')?.addEventListener('click', () => plot());
        document.getElementById('graph-input')?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                plot();
            }
        });
        document.getElementById('graph-reset')?.addEventListener('click', () => {
            state.xmin = -10;
            state.xmax = 10;
            const minField = document.getElementById('graph-xmin');
            const maxField = document.getElementById('graph-xmax');
            if (minField) minField.value = '-10';
            if (maxField) maxField.value = '10';
            draw();
        });
        document.getElementById('graph-zoom-in')?.addEventListener('click', () => zoom(0.6));
        document.getElementById('graph-zoom-out')?.addEventListener('click', () => zoom(1.6));
        document.getElementById('graph-xmin')?.addEventListener('change', setRange);
        document.getElementById('graph-xmax')?.addEventListener('change', setRange);

        document.querySelectorAll('[data-expr]').forEach((button) => {
            button.addEventListener('click', () => {
                const input = document.getElementById('graph-input');
                if (input) input.value = button.dataset.expr;
                plot(button.dataset.expr);
            });
        });

        window.addEventListener('resize', () => {
            if (!document.getElementById('graph-modal')?.classList.contains('hidden')) draw();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wire);
    } else {
        wire();
    }

    window.UniStepGraph = { open, plot, draw, compile };
})();
