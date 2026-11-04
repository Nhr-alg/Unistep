# Outreach scripts

Rules that keep this from becoming spam:

- Disclose that you are the builder.
- Read the community's self-promotion rules and ask a mod when unsure.
- Personalise the first line of every email. No mass BCC.
- One follow-up maximum. Honour opt-outs immediately.
- Link with UTM tags so `report.js` can tell the channels apart.

Replace `https://your-domain.example` with the deployed URL.

Track links:

```
https://your-domain.example/?for=students&utm_source=reddit&utm_medium=community&utm_campaign=beta1
https://your-domain.example/?for=tutors&utm_source=email&utm_medium=outreach&utm_campaign=centers1
https://your-domain.example/?for=fe&utm_source=reddit&utm_medium=community&utm_campaign=fe1
```

## Track A — students

### Reddit / Discord build-log post

> **Title:** I built a step-by-step solver that checks its own units, and I'm looking for students to break it
>
> I'm a student building a solver for first-year engineering mechanics. The difference from the usual tools: every answer shows the governing equation, the derivation, and a dimensional check, and it refuses to guess when a problem is outside its library.
>
> Example: a solid sphere rolling without slipping gives 2/7, with the I = 2/5 MR² step and the cancellation shown — not just the number.
>
> I'm opening a small free beta and I'd rather have five students tell me it's wrong than a hundred signups who never use it. If you're taking statics/dynamics this term, the waitlist is here: <link>. Happy to answer questions about how the verification works in the comments.
>
> Not selling anything yet. The free prototype includes 10 verified solves per browser, then the input locks. No card, no charge.

### Short video outline (30–45s)

1. Hook: “This is the step everyone loses marks on.”
2. Show the problem.
3. Show the two paths (energy and forces) agreeing.
4. Show the unit check.
5. “Beta link in bio — I want students to try to break it.”

Do not read a script; screen-record the actual prototype.

### Discord DM (only after asking mods)

> Hey — is it okay to share a free beta for a step-by-step engineering solver? It shows units and derivations. The prototype gives 10 free solves, then locks; no card and no charge. Happy to keep it to one message and take feedback in the channel.

## Track B — tutoring centers

### First email

**Subject:** Worksheet + answer keys for {{course}} — free 14-day pilot

> Hi {{name}},
>
> I'm building a tool for tutoring centers that generates a student worksheet and an instructor answer key from the same verified problem set — every answer comes with the governing equation, the steps, and a unit check.
>
> I saw that {{center}} supports {{course/subject}}. Would a free two-week pilot be useful? You'd get 25 worksheet/key pairs for the topics you choose, and I'd ask for one 15-minute call to hear what's missing.
>
> No card, no commitment. If it saves your tutors time, we can talk about a center plan afterwards.
>
> — {{your name}}, {{link with UTMs}}

### Follow-up (5–7 days later)

> Hi {{name}} — one follow-up in case the first note got buried. Happy to send two sample worksheets for {{course}} so you can judge the quality without a call. Would that help?

### 15-minute call agenda

1. Which courses and levels do you tutor most?
2. Where does worksheet prep hurt most today? (time, errors, formatting)
3. What would you need to see to pay $99/month? (volume, exports, branding, seats)
4. Offer: 14-day pilot, 25 pairs, feedback call at the end.

## Track C — FE/PE candidates

### Forum / community post

> **Title:** I'm building FE-style practice with full verified derivations — looking for a few candidates to test it
>
> Most FE resources give you an answer key. I'm building sets where every solution shows the governing equation, the substitution, the unit check, and a second independent check where possible.
>
> I'm looking for 5–10 people sitting the FE in the next few months to try a beta pack and tell me whether the explanations are exam-realistic. Beta price is $79 one-time for the full pack, refundable if it's not useful. Link: <link>.
>
> I'm the builder; happy to answer anything here.

### LinkedIn message to a prep instructor

> Hi {{name}} — I'm building verified, exam-format FE practice with full derivations. I'm looking for one instructor to review a sample set and tell me whether the explanations match what you teach. No pitch — I'll send the samples and you keep them. Interested?

## Weekly review

Every Friday:

```powershell
cd C:\Users\acer\supercalculator\site
node report.js
```

Log three numbers in a note: visitors, signups, pre-order clicks — per track. Change one variable per week (headline, price, channel). Two weeks of noise is not a trend.
