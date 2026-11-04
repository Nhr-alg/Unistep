# Payments — what is live and what is not

**Status: checkout is closed.** `site/config.js` has `paymentsLive: false` and every
link still reads `REPLACE_WITH_*`. Nothing on the site can take money, and no button
navigates to a placeholder.

That is deliberate. `site/checkout.js` fails closed: a paid tier only shows its
purchase button when a real `https://` link exists **and** `paymentsLive` is `true`.
Until then every paid CTA reads “Join the waitlist”, the click is recorded as
`preorder_click`, and the visitor is scrolled to the waitlist form.

---

## 1. Create the six Stripe Payment Links

In the Stripe dashboard: **Payment links → New**.

| Key in `config.js`    | Plan                | Price   | Billing        |
| --------------------- | ------------------- | ------- | -------------- |
| `students_founding`   | Student Founding    | $9      | Monthly        |
| `students_semester`   | Student Semester    | $29     | One-time       |
| `tutors_center`       | Tutoring Center     | $99     | Monthly        |
| `tutors_department`   | Department          | $249    | Monthly        |
| `fe_beta`             | FE Beta pack        | $79     | One-time       |
| `fe_monthly`          | FE Monthly          | $19     | Monthly        |

For each link:

1. Set the price exactly as above. Do not rely on the site copy to state the amount.
2. Collect **email** and **name**. Add a custom field for `centre name` on the two
   tutoring tiers, and `exam date` on the FE tiers.
3. Enable **14-day refund** in the link's after-payment settings where the plan
   advertises it. If you cannot honour the refund window, remove the claim from
   `site/app.js` instead of leaving it on the page.
4. Set the confirmation redirect to your real domain (not `localhost`).
5. Copy the `https://buy.stripe.com/...` URL.

## 2. Create the pilot booking link

`pilotBookingUrl` is used only for the `tutors_pilot` tier. Any absolute `https://`
URL works — Cal.com, Calendly, SavvyCal, or a Google Appointment page.

## 3. Paste the links

Edit `site/config.js`:

```js
paymentsLive: true,   // only after all seven URLs below are real
stripeLinks: {
    students_founding: 'https://buy.stripe.com/...',
    students_semester: 'https://buy.stripe.com/...',
    tutors_center:     'https://buy.stripe.com/...',
    tutors_department: 'https://buy.stripe.com/...',
    fe_beta:           'https://buy.stripe.com/...',
    fe_monthly:        'https://buy.stripe.com/...'
},
pilotBookingUrl: 'https://cal.com/...'
```

## 4. Verify before announcing

Run through this list with the deployed site, not localhost.

- [ ] Every paid CTA opens the Stripe page for the **matching** plan and price.
- [ ] Test mode purchase succeeds and the confirmation email arrives.
- [ ] A refund issued in Stripe actually returns the money.
- [ ] `paymentsLive` is `true` only if all six links resolve — one dead link means
      a chargeback, not a conversion.
- [ ] The pilot CTA opens the booking page and the slot is really bookable.
- [ ] Prices on the site match prices in Stripe, including currency.
- [ ] `/privacy.html` and `/terms.html` name the payment processor and the refund
      window that the plans advertise.

## 5. What must never ship

- A `REPLACE_WITH_*` string reachable by a click.
- A plan that promises a feature the app cannot do. The current copy is checked
  against the demo: worksheet generation, answer keys with steps, print/PDF,
  CSV export, timed practice, synced accounts. **LMS export does not exist** and
  has been removed from the Department tier.
- A testimonial, pass rate, university logo or user count that is not real.

---

## Why the guard lives in code, not in a checklist

A checklist is forgotten the day someone pastes a link at 11pm. `checkout.js`
re-checks every URL on every click:

```js
function isRealUrl(value) {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed || trimmed.includes('REPLACE_WITH')) return false;
    ...
}
```

A placeholder can never be navigated to, even if `paymentsLive` is flipped on by
accident. The failure mode is “join the waitlist”, not “404 on Stripe”.
