# ONE CITY. ONE STAGE. ONE RECORD.

A single-page cinematic site for the SNK Dance Company · TYSUN mass dance event:
a 15-minute non-stop Tollywood routine performed by 5,000+ school students in
Hyderabad on **31 October**, staged as an India Book of Records attempt.

The page is written for the person who actually decides — a school principal or
activity coordinator — so it opens on the spectacle and then answers the
questions that decide participation: supervision, safety, timetable impact,
transport and cost.

**Art direction.** A film, not a web page. Near-black ground, premium metallic
gold, warm white type, film grain, stage lighting and silhouettes. Gold is never
a flat swatch — it is an eight-stop ramp with a specular highlight, because that
is the difference between metal and yellow.

---

## Run it

There is no build step, no framework and no package to install.

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

To publish, upload the whole folder to any static host — Netlify, Vercel,
GitHub Pages, Hostinger, cPanel. Drag and drop works; nothing needs compiling.

Opening `index.html` directly off the disk mostly works, but browsers block
webfonts over `file://`, so the display type falls back. Use the command above
to preview it properly.

---

## Before it goes live

Everything you need to fill in lives in **one file**: `assets/js/config.js`.
Open it in any text editor, put your values between the quotes, save, re-upload.
Nothing else needs touching.

| Field | What it is |
|---|---|
| `eventDate` | Shown in the hero badge and the footer |
| `venueShort` / `venueFull` | Short name for the details row, full address for the footer |
| `registrationLink` | The booking page schools fill in and pay on — already set |
| `whatsapp` | Coordinator's WhatsApp, digits with country code — already set to `919912912722` |
| `phone` / `email` | Footer contact details |
| `price` / `priceNote` | The participation fee and what it covers |
| `guest1Name` / `guest2Name` | Guest names — Malla Reddy and Shekar Master |
| `instagram` | Handle without the `@` |
| `officeAddress` | SNK's office. Not the venue — those are different places |

Every field you leave as `""` keeps the safe placeholder already written into
the page, so the site never shows a blank or a broken button.

### How registering works

Three steps on the page, in order:

1. **Register** — the button opens the booking page (`registrationLink`).
2. **Pay** — payment is taken on that same booking page, straight after the
   form. There is no separate payment link on the site, and nothing to
   configure here.
3. **Send the receipt** — opens WhatsApp to the coordinator's number with a
   message already written, asking for the school name and student count, and
   reminding them to attach the receipt.

**Seating is no longer shown.** The ground map section was removed: areas are
marked out and assigned by the ground team on the day, so the page no longer
promises a pre-allocated zone anywhere.

---

## Things to check before publishing

Three items on the page make factual claims. Please confirm each one:

1. **The guest names and photographs.** Both guests are now named as chief
   guests without a "to be confirmed" tag, because SNK's own event poster
   announces them that way — Malla Reddy (Founder Chairman, Malla Reddy Group
   of Institutions) and Shekar Master. Johnny Master was an alternative in the
   original brief and has been ruled out; he appears nowhere on the page.

   The portraits come from the photographs SNK supplied, kept in
   `tools/source/`. `python3 tools/portraits.py` rebuilds the two card images
   from them; to change a photo, replace the file in `tools/source/` and run
   that again rather than editing `assets/images/` by hand.

   Both photographs belong to whoever took them, and both men control the use
   of their own likeness. Appearing on the event poster does not automatically
   cover a website — worth a sentence in writing from SNK confirming they have
   that permission.

2. **The record claim.** The page says "record attempt" throughout and never
   claims the record has been approved, sanctioned or awarded. Keep it that way
   until the adjudication is actually complete.

3. **The run-of-show timings.** The hour-by-hour schedule is built from the
   event flow in the brief, but the individual start times (09:00, 11:30, 13:30
   and so on) are **indicative timings I filled in** — the brief only gave the
   arrival window. The page says as much, but replace them with your real call
   sheet once it exists. They are in `index.html`, in the
   `<section class="band" id="timeline">` block.

4. **The year on the date.** The brief said "31 October" without a year. The
   page shows exactly that, and `eventDate` in the config is set to
   `"31 October"`. 31 October 2026 falls on a Saturday. Set the full date in
   the config once you confirm it.

Other numbers on the page — 5,000+ students, 15 minutes, 7–10 days of training,
four sub-stages — come straight from the brief.

---

## Replacing the artwork with real photographs

The images in `assets/images/` are original graphics I generated for this site,
not stock photos and not pictures of real people. They are built from the same
"crowd of dots" motif as the animated hero, so the set holds together.

Swap any of them for a real photograph by dropping a file into
`assets/images/` and changing one `src` in `index.html`:

| File | Where it appears |
|---|---|
| `guest-1.svg` … `guest-3.svg` | Guest cards |
| `og-cover.svg` | Source artwork for the share preview |
| `og-cover.jpg` | The share preview itself — 1200×630, rendered from the SVG above |
| `mark.svg` | Logo in the header and footer |

Use a `.jpg` at roughly 1600px wide for photographs. Update the `alt` text to
describe what the photo actually shows.

**One caution on photographs of students.** These are children, so get written
consent from the school and the parents before putting identifiable faces on a
public website, and keep that consent on file. Wide crowd shots where nobody is
identifiable are the safer choice. The share preview is already
a `.jpg` (`og-cover.jpg`) because most social platforms will not render an SVG
preview card; if you edit `og-cover.svg`, re-export it at 1200×630.

---

## What's in the folder

```
index.html                  the whole page
assets/
  css/style.css             all styling; design tokens are at the top
  css/fonts.css             @font-face rules for the bundled fonts
  js/config.js              >>> the file you edit <<<
  js/main.js                animation, the ground plan, the form
  fonts/                    Cinzel, Archivo, IBM Plex Mono
  images/                   artwork
```

### Design notes

- **Colour** is the metal ramp: eight stops from `#3A2A0D` through to a
  `#FFF9E4` specular, over a near-black that carries a faint violet bias. Pure
  `#000` was rejected deliberately — it flattens the grain and kills every
  shadow layered on it. All of it lives as CSS custom properties at the top of
  `style.css`.
- **Type** does three jobs. **Cinzel** is the Trajan-descended Roman capital
  used on film posters — it carries the titles, set in caps with wide tracking
  and nothing else. **Archivo** carries reading text and the big numerals.
  **IBM Plex Mono** marks anything operational — zone codes, timings, labels —
  so the run of show reads like the call sheet it is.
- **The scale sequence is the signature.** A pinned frame where the crowd
  multiplies from one silhouette to five thousand as you scroll, with the count
  climbing beside it. It is the only honest way to put "5,000" on a screen:
  make the reader watch it fill up.
- **The silhouettes are drawn, not dotted.** Filled bodies with head, torso and
  limbs, tall and narrow — stroked stick figures read as clip-art at any size,
  which is the fastest way to make a premium page look amateur.
- **The ground plan** is interactive: hover or tab the zones for capacity and
  nearest safety points. The zone data is the `ZONES` array in `main.js` — edit
  it to match the real ground map.
- **Motion has a job or it is cut.** It either reveals scale (the crowd), marks
  progress (the timeline spine), or shows state (zone selection). Both canvases
  stop drawing when scrolled away or when the tab is hidden.

### Quality checks that pass

- GSAP + ScrollTrigger drive the cinematic passages, loaded from cdnjs. **Every
  one has a vanilla fallback**: if that CDN is blocked (school networks often
  are), reveals, the timeline and the 1 → 5,000 scale sequence all still run.
  Tested with GSAP present and absent.
- All text meets WCAG AA contrast (4.5:1 body, 3:1 large) in both the dark and
  cream sections.
- Full keyboard navigation with a skip link and visible focus rings.
- `prefers-reduced-motion` is respected — animation stops and the final state
  renders immediately.
- No horizontal scrolling at any width from 390px up.
- Measured page weight is **177 KB** over the wire across 16 requests
  (419 KB raw), fonts, GSAP and artwork included — assuming your host serves
  gzip or brotli, which every mainstream static host does by default.

---

## Putting it online, and the address it sits at

The site is plain HTML, CSS and JavaScript with no build step, and every path
in it is relative. That means it runs from any static host, at a domain root or
in a sub-folder, with nothing to configure.

### It is live

**https://devarsh-2206.github.io/Event-design/**

Free, permanent, and fine to send to schools. Every push to
`claude/indian-book-records-dance-mvsmpa` redeploys it through
`.github/workflows/pages.yml`, so there is nothing to run by hand.

How it is wired, in case it ever needs untangling: Pages serves the
**`gh-pages`** branch, which holds only `index.html`, `assets/` and a
`.nojekyll` marker — the README and `tools/` stay out of it. The workflow
rebuilds that branch on each push and force-pushes it.

It is set up this way because a workflow's own token cannot create a Pages
site through the API — GitHub counts that as an admin action, and
`actions/deploy-pages` fails with *"Resource not accessible by integration"*.
Pushing a branch called `gh-pages` turns Pages on by itself, no admin rights
needed, which is what happened here.

### Free addresses with a shorter name

If you want something that reads better out loud, these static hosts give you a
permanent free address on their own domain. Connect this repository and each one
redeploys on every push, exactly as Pages does.

| Host | Address you get | Notes |
|---|---|---|
| Cloudflare Pages | `tysun.pages.dev` | Fastest of these from India. |
| Netlify | `tysun.netlify.app` | Drag the folder onto the dashboard, or connect the repo. |
| Vercel | `tysun.vercel.app` | Same idea. |

Pick the name carefully; it is what schools will read out. `tysun.pages.dev`
reads far better than `event-design-final-v2.netlify.app`.

### Free *custom* domains — read this before chasing one

The old answer to this was Freenom, which handed out `.tk`, `.ml`, `.ga`, `.cf`
and `.gq` for free. **That is over.** Freenom stopped free registrations after
Meta sued it over phishing, `.tk` is closed to new registrations entirely, and
`.ml` went back to Mali's own registry. Freenom now sells a few of those
extensions instead of giving them away. Those endings also carry a bad
reputation with spam filters — a school's mail server may well bin an email
that links to one, which is the opposite of what this site needs.

What is left that is genuinely free:

- **`.eu.org`** — free, permanent, run by volunteers since 1996, approved by a
  human so it can take days or weeks. Reads oddly for a Hyderabad event.
- **`.is-a.dev`** — free, but it is for developer portfolios, not events.
- **GitHub Student Developer Pack** — if you have a student email, this
  includes a free domain for a year from Namecheap or Name.com, across
  extensions like `.me`, `.live` and `.app`. Free for the first year only;
  normal renewal rates apply after that.

My honest recommendation: the Pages address above is live and costs nothing, so
use it now and buy a real `.in` or `.com` when the client is ready. A `.in` is
cheap — I believe it is in the ballpark of a few hundred rupees for the first
year, but prices move and vary by registrar, so check the current rate yourself
before quoting it to the client. Moving the site to a real domain later is a DNS
change, not a rebuild.

### After you have a domain

Two things to change, both at the top of `index.html` (they are flagged with a
comment): the five `https://devarsh-2206.github.io/Event-design/` URLs become
your own, and — if you are on a host other than Pages — point that host at this
repository. Those URLs must stay full `https://` addresses; WhatsApp and
Facebook only fetch a preview image from one, so a relative path means a
forwarded link shows text with no picture. That preview is the first thing a
school principal sees.

Add a `CNAME` file at the repository root containing just the domain if you stay
on GitHub Pages, then point the domain's DNS at GitHub.

---

## Licence

Site code: yours to use for this event.

The three bundled typefaces are under the SIL Open Font License 1.1, which
permits web use and redistribution — see `assets/fonts/OFL.txt`. If you swap
them for different fonts, check that font's licence first.
