/**
 * Site configuration.
 *
 * Anything still marked REPLACE_WITH is treated as "not configured" by
 * checkout.js and never navigated to. Keep `paymentsLive: false` until every
 * paid tier has a working destination — see PAYMENTS.md for the checklist.
 */

window.SITE_CONFIG = {
    brand: 'UniStep',

    // Leave empty until the domain is registered and the mailbox is monitored.
    // An empty value makes the footer show launch updates instead of a fake
    // address; the site never prints a .example contact.
    contactEmail: '',

    demoPath: 'demo/index.html',

    // Master switch. Flip to true only when the links below are real.
    paymentsLive: false,

    stripeLinks: {
        students_founding: 'REPLACE_WITH_STRIPE_PAYMENT_LINK',
        students_semester: 'REPLACE_WITH_STRIPE_PAYMENT_LINK',
        tutors_center: 'REPLACE_WITH_STRIPE_PAYMENT_LINK',
        tutors_department: 'REPLACE_WITH_STRIPE_PAYMENT_LINK',
        fe_beta: 'REPLACE_WITH_STRIPE_PAYMENT_LINK',
        fe_monthly: 'REPLACE_WITH_STRIPE_PAYMENT_LINK'
    },

    pilotBookingUrl: 'REPLACE_WITH_BOOKING_LINK',

    foundingNote: 'Founding price locked for 12 months',
    checkoutClosedNote: 'Checkout is not open yet. Every paid tier below is a waitlist, not a charge.'
};
