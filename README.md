# 5,000 Students. One Dance.

A single-page site for the SNK Dance Company · TYSUN mass dance event: 5,000+
Hyderabad school students performing one 15-minute Tollywood routine together on
**31 October**, staged as an India Book of Records attempt.

## Who this page is built for

In this order, because this is the order in which people actually say yes:

1. **A parent**, deciding whether their child is safe. Anxious, reading on a
   phone, possibly late at night.
2. **A school**, deciding whether it can carry the day. Thinking about
   timetable, staffing and responsibility.
3. **A student**, deciding whether it sounds fun.

Everything on the page serves that order. The signature element is the
**audience switcher** near the top: three tabs, each answering the six
questions that reader actually has, in the words they would use. A parent asks
"what time will they be home?", not "what is the event schedule".

You can link straight to one view: `…/#who?as=parent`, `?as=school` or
`?as=student`. Useful when a school forwards the page to families.

## Why it is light, not dark

A dark site reads as nightclub, film promo, entertainment. The people who
decide here are cautious adults, and open daylight reads as honest — you are
not hiding anything. Colour is doing a job, not decorating:

| Colour | Role | Why |
|---|---|---|
| Warm white `#FFFCF6` | Page ground | Daylight, openness, nothing concealed |
| Deep indigo `#151B3D` | Text, the day plan, registration | Blue is the trust colour; it carries the operational detail |
| Rose `#C2185B` | Primary action | Energy and urgency, reserved for what you should click |
| Marigold `#FFB627` | Celebration, times, highlights | Indian festival warmth — **fill only**, see below |
| Teal `#0E7A6E` | Safety, and only safety | A semantic colour, so "this is about safety" reads before the words do |

Two rules the contrast maths forces, both enforced in the tokens:

* **Marigold is a fill, never text on a light ground.** At 4.14:1 it fails.
  Dark text on marigold is 9.53:1 and fine.
* Grey `#5F6480` is the lightest secondary that clears 4.5:1 on *both* the
  paper and the warm secondary surface.

---

## Run it

No build step, no framework, no packages.

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

To publish, upload the whole folder to any static host — Netlify, Vercel,
GitHub Pages, Hostinger, cPanel. Opening `index.html` straight off disk mostly
works, but browsers block webfonts over `file://`, so use the command above to
preview it properly.

## Before it goes live

Everything you need to fill in is in **one file**: `assets/js/config.js`.

| Field | What it is |
|---|---|
| `eventDate` / `eventDay` | Shown in the hero card and the footer |
| `venueShort` / `venueFull` | Short name for the hero card, full address for the footer |
| `whatsapp` | Coordinator's number, digits with country code (`919876543210`) |
| `phone` / `email` | Shown in the "rather just talk to someone?" box and the footer |
| `price` / `priceNote` | The participation fee |
| `guest1Name` / `guest2Name` | Guest names |
| `photos` | Guest photographs — read the note in the file first |

Anything left as `""` keeps the safe placeholder already written into the page,
so the site never shows a blank or a dead link.

### How registration works

Four fields — school, your name, phone, approximate student count. Submitting
opens WhatsApp on the coordinator's number with the details already typed in;
they just press send. Falls back to a pre-filled email if no WhatsApp number is
set. No server, no database, no monthly fee, and enquiries land where Indian
school coordinators already work.

The form deliberately asks for almost nothing. A parent or principal on a phone
will abandon a long form, and everything else can be settled on the call back.

---

## Three things to check before publishing

1. **The guest photographs.** `config.js` has slots for them, and they are
   empty on purpose. These are real, identifiable people, so you need two
   things before adding a photo, and neither is optional: a **licence** for the
   image (press and agency photos are copyrighted — taking one from a search
   result is infringement), and **written permission** from the person or their
   office to use their likeness to promote this event. A photograph of a public
   figure on a page that asks schools for money reads as a confirmed
   endorsement.

2. **The "Invited · to be confirmed" tags.** The original brief named the
   choreographer as "Shekar Master **or** Johnny Master", which means neither is
   settled. Leave the tags in place until you have confirmation in writing.

3. **The timings.** The hour-by-hour plan is built from the event flow you gave
   me, but the individual clock times (9:00, 11:30, 13:30 …) are **indicative
   values I filled in** — the brief only fixed the arrival window. The page says
   so, but replace them with the real schedule once it exists. They are in
   `index.html`, in the `<section class="band day" id="day">` block.

Also: the page says "record **attempt**" throughout and never claims a record
has been awarded. Keep it that way until adjudication is actually complete.

---

## What's in the folder

```
index.html                  the whole page
assets/
  css/style.css             all styling; design tokens are at the top
  css/fonts.css             @font-face rules for the bundled fonts
  js/config.js              >>> the file you edit <<<
  js/main.js                tabs, venue map, counters, form
  fonts/                    Bricolage Grotesque, Archivo, IBM Plex Mono
  images/                   brand mark, guest photo frames, share card
```

**Type** does three jobs: **Bricolage Grotesque** carries headings — warm and
characterful rather than corporate or luxury; **Archivo** carries reading text,
chosen for legibility on a phone; **IBM Plex Mono** marks times, zone codes and
small labels so they are scannable.

**The venue map** is interactive — hover or tab the zones for capacity and
nearest safety points. The zone data is the `ZONES` array in `main.js`; edit it
to match the real ground map.

### Quality checks that pass

- Every text pair meets WCAG AA contrast, on all four surfaces.
- The audience tabs are real ARIA tabs: arrow keys, Home and End all work, and
  a screen reader gets the same thing a mouse does.
- **Without JavaScript the page still works** — all three audience panels
  render and the dead tab controls hide themselves.
- `prefers-reduced-motion` is respected.
- No element overflows 390px; no touch target under 40px.
- No third-party requests at runtime — fonts are self-hosted, no CDN, no
  analytics, nothing tracking your visitors' children.
- Measured page weight **163 KB** over the wire across 14 requests.

## Licence

Site code: yours to use for this event. The three bundled typefaces are under
the SIL Open Font License 1.1 — see `assets/fonts/OFL.txt`.
