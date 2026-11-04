/**
 * UniStep checkout guard
 *
 * One rule: never navigate to a payment URL that is not a real, absolute
 * http(s) link. A placeholder left in config.js must fail closed — the user
 * lands on the waitlist, not on a broken Stripe page or a 404.
 *
 * Set `paymentsLive: true` in config.js only after every link below has been
 * replaced with a working Stripe Payment Link. See PAYMENTS.md.
 */

(function () {
    'use strict';

    const CONFIG = window.SITE_CONFIG || {};

    function isRealUrl(value) {
        if (typeof value !== 'string') return false;
        const trimmed = value.trim();
        if (!trimmed || trimmed.includes('REPLACE_WITH')) return false;
        try {
            const url = new URL(trimmed, window.location.href);
            return url.protocol === 'https:' || url.protocol === 'http:';
        } catch (err) {
            return false;
        }
    }

    function planUrl(id) {
        if (!CONFIG.paymentsLive) return '';
        const link = CONFIG.stripeLinks && CONFIG.stripeLinks[id];
        return isRealUrl(link) ? link : '';
    }

    function bookingUrl() {
        if (!CONFIG.paymentsLive) return '';
        return isRealUrl(CONFIG.pilotBookingUrl) ? CONFIG.pilotBookingUrl : '';
    }

    function live() {
        if (!CONFIG.paymentsLive) return false;
        const links = CONFIG.stripeLinks || {};
        return Object.keys(links).some((key) => isRealUrl(links[key]));
    }

    // A paid tier only advertises its purchase CTA when a real destination
    // exists. Otherwise the honest label is "join the waitlist".
    function ctaLabel(plan) {
        if (!plan || plan.price === '$0') return plan ? plan.cta : 'Join the waitlist';
        if (planUrl(plan.id)) return plan.cta;
        if (plan.id === 'tutors_pilot' && bookingUrl()) return plan.cta;
        return 'Join the waitlist';
    }

    function go(url) {
        if (!isRealUrl(url)) return false;
        window.location.assign(url);
        return true;
    }

    window.UniStepCheckout = {
        live,
        planUrl,
        bookingUrl,
        ctaLabel,
        isRealUrl,
        go
    };
})();
