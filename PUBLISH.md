# Publish UniStep and start the business

This is the very simple version. Think of it like opening a lemonade stand:

1. You already built the lemonade machine.
2. You need a place on the street where people can find it.
3. You need a sign with a name.
4. You need to tell people about it.
5. You need to ask some of them to pay.

UniStep already has a live web deployment. Publishing the source means putting
its code in GitHub so changes can be reviewed, versioned and deployed consistently.

---

## First, the honest rules

Read these before you show anyone the site.

- **Do not make up customers.** No fake testimonials, no fake university logos,
  no "10,000 students" unless 10,000 real students used it.
- **Do not make up results.** No "97% pass rate" unless you measured it.
- **Do not make up a domain or email.** If you have not bought
  `yourdomain.com`, do not print `hello@yourdomain.com`.
- **Do not sell something you have not built.** Checkout is closed for a reason.
  The paid plans are a waitlist until the links and entitlements are real.
- **The 10-solve limit is a product limit, not a bank vault.** It is stored in
  the browser. Someone who knows how to open developer tools can erase it. That
  is fine for a beta. Before you charge money, move the count to the server.
- **The limit applies to the solver input.** The worksheet studio and practice
  bank are separate study tools and stay available. If you decide to charge for
  those, gate them too. Do not advertise "10 solves" and then hand out unlimited
  solved worksheets by accident.
- **Do not take money yet.** The site has `paymentsLive: false`. Keep it false
  until every Stripe link works and you have a refund process.

The only thing that is live today is this:

> Try the prototype. It gives you 10 verified solves. Join the waitlist if you
> want paid access when it opens.

That is enough to start learning whether people want the product.

---

## Part 1 — The four pieces

Here is the whole machine:

```
Your files  →  GitHub  →  Host  →  Your domain  →  Customer
                               ↘  Stripe (later)
```

- **Your files** are in `C:\path\to\unistep`.
- **GitHub** is a safe box for your code. It keeps every version.
- **The host** is a computer that runs your Node server all day.
- **The domain** is the name people type, like `yourname.com`.
- **Stripe** is how you take money later. It is not connected yet.

You can publish without a domain first. The host will give you a long test
address. That is okay for friends and beta testers. Buy the domain when you are
ready to look real.

---

## Part 2 — Test it at home first (30 minutes)

Do this before you pay anyone.

1. Open **PowerShell**.
2. Go to the site folder:

   ```powershell
   cd C:\path\to\unistep\site
   ```

3. Start the server:

   ```powershell
   node server.js
   ```

4. Open <http://localhost:8090> in your browser.
5. Click **Try the prototype**.
6. Solve one easy problem, such as `Find the roots of x^2 + 5x + 6 = 0`.
7. Look at the small text under the input. It should count down from 10.
8. Solve until you reach 10. The 10th solve should:
   - show the answer,
   - lock the text box,
   - disable the Solve button,
   - disable the photo button,
   - disable the example cards,
   - show the "You have used all 10 free solves" panel.
9. Refresh the page. It should still be locked.
10. Open the site in a second tab. It should be locked there too.
11. Run the solver tests in another PowerShell window:

    ```powershell
    cd C:\path\to\unistep
    node run-tests.js
    ```

    You should see `38/38 golden cases passed.` plus the theory checks.

12. Stop the server with `Ctrl + C`.

### If you want to test the lock again

The calculation count is stored in your browser under the name `us_free_solves_v1`. Theory mode remains available after the limit.

1. Open the browser's developer tools (`F12`).
2. Go to **Application** → **Local Storage** → `http://localhost:8090`.
3. Delete `us_free_solves_v1`.
4. Refresh.

That works because the limit is a prototype limit. It is exactly why you cannot
charge money until the count lives on the server.

---

## Part 3 — Put the code in a safe box (GitHub)

This is like saving your game so you never lose it.

1. Make a free account at <https://github.com>.
2. Install Git from <https://git-scm.com/downloads>. Use the normal installer
   options.
3. Open PowerShell and go to the project:

   ```powershell
   cd C:\path\to\unistep
   ```

4. Start the safe box:

   ```powershell
   git init
   git add .
   git commit -m "UniStep: 10-solve prototype"
   ```

5. On GitHub, click **New repository**.
   - Name: `unistep`
   - Visibility: **Private** while you are still testing.
   - Do **not** add a README, `.gitignore`, or license. You already have files.
6. GitHub will show you commands. They look like this. Replace `YOURNAME` with
   your GitHub username:

   ```powershell
   git remote add origin https://github.com/YOURNAME/unistep.git
   git branch -M main
   git push -u origin main
   ```

7. Refresh the GitHub page. You should see your files.

### Check that private data did not go up

The file `.gitignore` tells Git to skip `site/data/`. That folder holds waitlist
emails, accounts, and archives.

Look at your GitHub repository. You should **not** see:

- `site/data/users.json`
- `site/data/waitlist.jsonl`
- `site/data/events.jsonl`
- `site/data/archives/`

If you see them, stop. Remove them from Git before making the repository public.
Ask for help if you are not sure how.

---

## Part 4 — Buy a name (the domain)

A domain is the name of your shop. It costs money every year. Prices change, so
check the registrar's checkout page before you pay.

1. Go to a registrar you trust. Examples: Cloudflare Registrar, Namecheap,
   Porkbun. Use the one you understand.
2. Search for names. Try:
   - `getunistep.com`
   - `unistep.app`
   - `unistep.io`
   - `unistep.co`
   - `tryunistep.com`
3. **Do not assume a name is free.** The registrar will tell you. If it is taken,
   pick another. Do not buy a trademarked name.
4. Buy one year. Turn on auto-renew if you can afford it.
5. Turn on privacy protection if it is free. You do not want your home address
   in a public database.
6. Write the name in a notebook. You will need it in Part 6.

**If you have no money yet:** skip this part. Use the host's free test address.
Do not print a fake domain on the site.

---

## Part 5 — Make a real email address

People need a way to ask for a refund or ask a question. A `@gmail.com` address
works at the start, but a domain address looks more trustworthy.

Pick one:

- **Forwarding:** your registrar forwards `hello@yourdomain.com` to your normal
  inbox. Check that replies work.
- **Mailbox:** Zoho Mail, Google Workspace, or Microsoft 365. Check current
  prices; some have free plans for one user.
- **Start simple:** use a real personal address you check every day. Do not print
  an address you do not read.

When you have a real address, open `site/config.js` and change this line:

```js
contactEmail: '',
```

to:

```js
contactEmail: 'hello@yourdomain.com',
```

Then test it:

1. Open the site.
2. Click the contact link.
3. Send yourself an email.
4. Reply to it.
5. Confirm it arrives.

Until then, leave it empty. The site sends people to the waitlist instead of
printing an address that cannot receive mail.

---

## Part 6 — Put it on a host

The site is not just a picture. It has a small Node server that saves waitlist
signups and accounts. That means you need a host that runs **Node.js** and gives
you a **persistent disk** (a folder that survives restarts).

Good kinds of hosts:

- Render
- Railway
- Fly.io
- A small VPS (a rented Linux computer)

A plain static host (like a basic Netlify or Cloudflare Pages site) will show the
landing page, but the waitlist form will not work unless you replace the API with
a serverless function. Do not do that on your first day. Use a Node host.

### Example: Render

The buttons may change, but the idea is the same.

1. Make an account at <https://render.com>.
2. Click **New** → **Web Service**.
3. Connect your GitHub account and pick the `unistep` repository.
4. Fill in:
   - **Root Directory:** `site`
   - **Build Command:** leave empty (there are no dependencies to install)
   - **Start Command:** `npm start`
   - **Health Check Path:** `/healthz`
5. Add environment variables:
   - `TRUST_PROXY=1` — the host sits in front of your server.
   - `DATA_DIR=/var/data/unistep` — use the persistent disk path. If the host
     gives you a different mount path, use that instead. Pick a folder
     **outside** the public `site` folder.
   - `SITE_URL=https://yourdomain.com` — only after you have the domain.
   - `WAITLIST_WEBHOOK_URL` — optional. Skip it on day one.
6. Add a **persistent disk** and mount it at `/var/data`.
7. Click **Deploy**.
8. Wait for the green "live" message.
9. Open the host's test address.
10. Check `/healthz`. It should say the server is healthy.
11. Submit a waitlist signup with your own email.
12. Confirm it was saved. On the host's shell, run:

    ```bash
    DATA_DIR=/var/data/unistep node report.js
    ```

    Use the same `DATA_DIR` the server uses. You should see one signup. Delete
    your test signup from `waitlist.jsonl` afterward so your numbers stay honest.

### Important host warnings

- **Free plans often sleep.** The first visit may be slow.
- **Free plans often lose files.** If the disk is not persistent, every restart
  can erase your waitlist. That is why `DATA_DIR` matters.
- **Do not put the data folder inside `site/`** on a public host. Keep it on the
  mounted disk, outside the public files.
- **Back up the data.** Download `waitlist.jsonl`, `events.jsonl`, and the
  archives at least once a week. A business cannot lose its customer list.

---

## Part 7 — Connect the domain and HTTPS

1. In your host, find **Custom Domain** and add `yourdomain.com` and
   `www.yourdomain.com`.
2. The host will show DNS records. They usually look like an `A` record or a
   `CNAME`.
3. In your registrar's DNS page, copy those records exactly.
4. Wait. DNS can take a few minutes or a few hours.
5. Open `https://yourdomain.com`. You should see the site with a padlock.
6. If the padlock is missing, stop and fix it before sharing the link.

Then generate the sitemap so search engines can find you:

```powershell
cd C:\path\to\unistep\site
$env:SITE_URL="https://yourdomain.com"
node build-pages.js
```

This writes `sitemap.xml` and `robots.txt`. Commit them and push:

```powershell
cd C:\path\to\unistep
git add site/
git commit -m "Add sitemap and regenerate topic pages"
git push
```

`git add site/` is safe because `.gitignore` keeps `site/data/` out. The server
now serves `.xml` files, so `/sitemap.xml` will work.

---

## Part 8 — Test the real site like a customer

Do this on your phone and on a computer.

- [ ] The landing page loads with the padlock.
- [ ] **Try the prototype** opens.
- [ ] The free counter says 10.
- [ ] Ten successful solves lock the input.
- [ ] Refresh keeps it locked.
- [ ] A second tab is locked too.
- [ ] The "See plans" link goes to the pricing section.
- [ ] The waitlist form accepts your email.
- [ ] The waitlist form rejects a fake email.
- [ ] The privacy and terms pages open.
- [ ] The contact link works, or sends you to the waitlist.
- [ ] `/healthz` says healthy.
- [ ] There are no red errors in the browser console.

If any box is unchecked, fix it before inviting people. A broken form teaches you
nothing.

---

## Part 9 — Start the business (the part that matters)

Publishing is not the business. The business is **finding people who will pay**.

The shortest path is **tutoring centers**, not students. A center already sells
tutoring. It needs worksheets and answer keys every week. If UniStep saves a
tutor two hours, the center can pay for it.

The target is **$1,000 per month**. Two ways to get there:

- 4 centers × $249/month = $996/month
- 11 centers × $99/month = $1,089/month

Those are targets, not promises. You get there by talking to people, not by
posting a link and hoping.

### Week 1 — Publish and prepare

- [ ] Deploy the site.
- [ ] Set a real contact email.
- [ ] Test the 10-solve lock.
- [ ] Write down your one-sentence pitch:

  > "UniStep generates a verified worksheet and answer key in minutes, so your
  > tutors spend time teaching instead of typing."

- [ ] Make a simple spreadsheet with these columns:
  `Center | Contact name | Email | Date sent | Reply | Pilot start | Notes`
- [ ] Read `site/outreach.md` and rewrite the placeholders in your own words.

### Week 2 — Talk to 30 centers

Do not send 300 copy-paste emails. Send 10 good ones a day.

1. Search for tutoring centers within one hour of you.
2. Find the owner or the lead tutor. Use the contact page, not a random address.
3. Send a short email:

   > Subject: A worksheet + answer-key tool for your tutors
   >
   > Hi [Name] — I built UniStep, a worksheet generator for first-year engineering
   > courses. It makes a student sheet and an instructor key from the same verified
   > solver, so the key cannot disagree with the questions.
   >
   > I am offering a free two-week pilot: 25 worksheet/key pairs, no card. If it
   > saves your tutors time, we can talk about a center plan. Would a 15-minute
   > call next week be useful?
   >
   > [Your name]
   > [Real link]

4. If nobody replies after three business days, send **one** short follow-up.
5. Do not argue. Do not send a second follow-up. Move on.

### Week 3 — Run two pilots

The goal is not to sign up 100 people. The goal is to watch **two real tutors**
use the product.

- [ ] Schedule a 15-minute call.
- [ ] Ask: Which courses? How many students? How do you make worksheets now?
- [ ] Generate the first worksheet **with them** on the call.
- [ ] Ask them to use it for one week.
- [ ] Ask: "What was annoying?" Write it down.
- [ ] Fix one annoying thing per day. Do not build ten new features.

### Week 4 — Ask for money

After the pilot, ask a simple question:

> "Would the center plan at $99/month be useful enough to keep?"

If yes:

1. Create a Stripe Payment Link for the center plan.
2. Send it.
3. Do not turn on `paymentsLive` until every link is real.
4. Before recurring charges, move the free-solve count and plan access to the
   server. The browser count is not enough for paid customers.

If no:

1. Ask why.
2. Write down the exact words.
3. Fix the biggest reason.
4. Try five more centers.

### The student track (second, not first)

After you have talked to 10 centers, you can post a build log for students.

- Ask the moderators first.
- Post in 2 or 3 communities, not 20.
- Show the real prototype. Do not use fake screenshots.
- Say: "The prototype gives 10 free solves, then locks. I want feedback, not
  signups."
- Reply to every comment for the first two hours.

Students are a good long-term market, but they are harder to charge. Centers pay
for tools that save staff time.

---

## Part 10 — Money, rules, and trust

### Stripe

1. Make a Stripe account.
2. Create a product and a recurring price for each paid plan.
3. Create a **Payment Link** for each price.
4. Paste the links into `site/config.js`.
5. Test in Stripe test mode first.
6. Add a webhook that marks an account as paid, and move the solve limit to the
   server. Without that, anyone can share a payment link and you cannot tell who
   paid.
7. Only then set `paymentsLive: true`.
8. Keep the 14-day refund promise. Put it in the terms and honor it.

### Legal and taxes

This is not legal advice. Get a local accountant and a lawyer to review your
terms before you take recurring payments.

- Register a business name with your local government.
- Open a separate bank account for the business.
- Learn how sales tax/VAT works where your customers are.
- Keep the privacy policy accurate. If you store emails, say so.
- The site says 16+. Do not collect data from younger children.
- Have a deletion process: if someone asks, delete their waitlist email and
  account.

### Support

- Check email every weekday.
- Reply within two business days.
- Keep a simple log of every bug and request.
- Never promise a feature just to close a sale.

---

## Part 11 — What to measure

Use `node report.js` on the host to see:

- visitors,
- waitlist signups,
- signup rate,
- pre-order clicks,
- pilot requests.

The numbers that matter, in order:

1. **Conversations** — how many center owners replied?
2. **Pilots** — how many agreed to try it?
3. **Activation** — how many generated a worksheet?
4. **Paid** — how many paid?
5. **Retention** — how many are still paying next month?

Do not celebrate page views. A page view is not a customer.

---

## Part 12 — The launch checklist

Copy this into a note and tick it off.

### Build

- [ ] `node run-tests.js` says 38/38 and all theory checks pass.
- [ ] 10 successful solves lock the input.
- [ ] Theory mode remains usable after the calculation limit.
- [ ] Refresh keeps the lock.
- [ ] A second tab is locked.
- [ ] Photo upload is disabled after the lock.
- [ ] Example cards are disabled after the lock.
- [ ] Archive re-solve is blocked after the lock.
- [ ] No console errors.

### Site

- [ ] Landing page says 10 free solves, not 3.
- [ ] Free plan says 10 solves, not unlimited.
- [ ] No fake testimonials or pass rates.
- [ ] No fake domain or email.
- [ ] Privacy and terms pages load.
- [ ] Contact link works or goes to the waitlist.
- [ ] Waitlist form works.
- [ ] `/healthz` works.
- [ ] Sitemap works after setting `SITE_URL`.

### Host

- [ ] Node host, not a plain static host.
- [ ] `DATA_DIR` points at a persistent disk.
- [ ] `TRUST_PROXY=1` is set behind the proxy.
- [ ] Data is backed up weekly.
- [ ] Test signup was deleted from the real data.

### Money

- [ ] Stripe links are real, not `REPLACE_WITH_*`.
- [ ] `paymentsLive` is still false until all links are ready.
- [ ] Server-side entitlement exists before recurring charges.
- [ ] Refund process is written down.
- [ ] Terms and privacy were reviewed by a professional.

### Sales

- [ ] 30 centers listed.
- [ ] 10 personalized emails sent.
- [ ] One follow-up per center, no spam.
- [ ] Two pilot calls booked.
- [ ] One worksheet generated on a call.
- [ ] One price conversation held.

---

## The one-page version

If you forget everything else, remember this:

1. Test the lock at home.
2. Put the code on GitHub.
3. Put the site on a Node host with a real disk.
4. Buy a domain and make a real email.
5. Test the site on your phone.
6. Email 30 tutoring centers.
7. Run two free pilots.
8. Ask one center to pay.
9. Only then connect Stripe and move the solve count to the server.
10. Do not lie in the copy.

That is publishing. That is the business. Everything else is details.
