# Record Attempt — event website

A single-page site for the SNK Dance Company · TYSUN mass dance event: a
15-minute non-stop Tollywood/Bollywood routine performed by 4,000–5,000 school
students in Hyderabad, staged as an Indian Book of Records attempt.

The page is written for the person who actually decides — a school principal or
activity coordinator — so it leads with the spectacle and then answers the
questions that decide participation: supervision, safety, timetable impact and
transport.

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
| `venueShort` / `venueFull` | Short name for the hero strip, full address for the footer |
| `whatsapp` | Coordinator's number, digits only with country code (`919876543210`). Powers the enquiry form |
| `phone` / `email` | Footer contact details |
| `paymentLink` | Your payment page URL — Razorpay, PhonePe, Cashfree, Instamojo, a bank link, anything |
| `upiId` | UPI ID for the secondary pay button |
| `price` / `priceNote` | The participation fee and what it covers |
| `guest1Name` / `guest2Name` | Guest names, once confirmed |

Every field you leave as `""` keeps the safe placeholder already written into
the page, so the site never shows a blank or a broken button. The "Pay
participation fee" button quietly points at the contact section until you add a
real `paymentLink`, and the UPI button stays hidden until you add a `upiId`.

### How the enquiry form works

There is no server and no database. When a school submits the form, it opens
WhatsApp on the coordinator's number with all the details already typed into the
message — they just press send. If no `whatsapp` is set but an `email` is, it
falls back to opening a pre-filled email instead.

This is deliberate: it needs no hosting account, no monthly fee and nothing to
maintain, and school enquiries land where coordinators already work. If you
later want enquiries stored in a database or a spreadsheet, that needs a backend
or a form service (Formspree, Google Forms, Netlify Forms) wired into
`form()` in `assets/js/main.js`.

---

## Things to check before publishing

Three items on the page make factual claims. Please confirm each one:

1. **The guest names.** The brief listed the choreographer as "Shekar Master
   **or** Johnny Master", which means neither is confirmed. Both guests are
   therefore shown with an **"Invited · to be confirmed"** tag. Leave those tags
   in place until you have a written confirmation. Announcing a public figure's
   attendance before they have agreed causes real problems, so this is worth
   being strict about.

2. **The record claim.** The page says "record attempt" throughout and never
   claims the record has been approved, sanctioned or awarded. Keep it that way
   until the adjudication is actually complete.

3. **The run-of-show timings.** The hour-by-hour schedule is built from the
   event flow in the brief, but the individual start times (09:00, 11:30, 13:30
   and so on) are **indicative timings I filled in** — the brief only gave the
   arrival window. The page says as much, but replace them with your real call
   sheet once it exists. They are in `index.html`, in the
   `<section class="band runsheet">` block.

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
| `gallery-1.svg` … `gallery-4.svg` | The gallery grid |
| `guest-1.svg` … `guest-3.svg` | Guest cards |
| `og-cover.svg` | The preview card when the link is shared |
| `mark.svg` | Logo in the header and footer |

Use a `.jpg` at roughly 1600px wide for photographs. Update the `alt` text to
describe what the photo actually shows.

**One caution on photographs of students.** These are children, so get written
consent from the school and the parents before putting identifiable faces on a
public website, and keep that consent on file. Wide crowd shots where nobody is
identifiable are the safer choice. Replace `og-cover.svg` with a `.jpg` or
`.png` too — most social platforms will not render an SVG preview card.

---

## What's in the folder

```
index.html                  the whole page
assets/
  css/style.css             all styling; design tokens are at the top
  css/fonts.css             @font-face rules for the bundled fonts
  js/config.js              >>> the file you edit <<<
  js/main.js                animation, the ground plan, the form
  fonts/                    Bebas Neue, Source Sans 3, IBM Plex Mono
  images/                   artwork
```

### Design notes

- **Colour** comes from a floodlit ground at dusk — deep plum-indigo, marigold
  stage light, vermilion and peacock teal from festival textile. The palette
  lives as CSS custom properties at the top of `style.css`; change it there and
  it changes everywhere.
- **Type** does three jobs: Bebas Neue is the poster voice for headlines,
  Source Sans 3 carries the reading text, and IBM Plex Mono marks anything
  operational — zone codes, timings, labels — so the run of show reads like the
  call sheet it is.
- **The safety section deliberately inverts to cream.** It is the one part of
  the page aimed squarely at a cautious principal, and the tonal shift signals
  a change of register.
- **The ground plan is the signature element.** Hover or tab through the zones
  to see each one's capacity and nearest safety points. The zone data is the
  `ZONES` array in `main.js` — edit it to match the real ground map.
- **The hero canvas** draws roughly a thousand dots standing in for students,
  lighting up outward from the stage and pulsing in unison. It stops drawing
  when scrolled out of view or when the tab is hidden.

### Quality checks that pass

- No JavaScript dependencies, no CDN calls, no third-party requests at runtime.
- All text meets WCAG AA contrast (4.5:1 body, 3:1 large) in both the dark and
  cream sections.
- Full keyboard navigation with a skip link and visible focus rings.
- `prefers-reduced-motion` is respected — animation stops and the final state
  renders immediately.
- No horizontal scrolling at any width from 390px up.
- Measured page weight is **143 KB** over the wire across 18 requests
  (494 KB raw), fonts and artwork included — assuming your host serves
  gzip or brotli, which every mainstream static host does by default.

---

## Licence

Site code: yours to use for this event.

The three bundled typefaces are under the SIL Open Font License 1.1, which
permits web use and redistribution — see `assets/fonts/OFL.txt`. If you swap
them for different fonts, check that font's licence first.
