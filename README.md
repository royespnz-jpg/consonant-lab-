# The Consonant Lab

A self-contained listening-practice system for English consonants, built from
**Chapter 15, "Consonants in Detail"** of *Accurate English: A Complete Course in
Pronunciation* (pp. 164–218).

Open `index.html` — no build step, no server, no dependencies.

## The student flow

The chapter's own order is enforced: **review first, then identify.**

1. **Study** — each unit opens with short cards: what the sound is (voicing,
   manner, place), a one-line "how to make it" taken from the book's Practice
   boxes, the spellings that hide the sound, and the grammar rules that predict
   it. Nothing is graded here; every example word has a *play* button.
2. **Drill** — the Drill button stays **disabled until the study cards are
   finished**. Then six listening activities unlock, each needing **80%** to
   clear. *Minimal Pairs — Expert* stays locked until plain Minimal Pairs is
   cleared.
3. **Exam** — 30 items from the end-of-chapter review ("Circle the letter of the
   word you hear"). Unlocks after 3 units are mastered.

### How the minimal pairs got harder

- **Three options, not two.** 94% of the items are three-way sets, most of them
  straight from the book: *hits / hiss / hitch*, *aids / A's / age*,
  *simmer / sinner / singer*, *thin / tin / fin*.
- **A replay budget.** The first play is free; after that you get 3 replays in
  the standard drill and **1** in Expert. Run out and the play button locks
  until you answer.
- **Expert hides the word in a sentence** ("Say ___ again.") at 1.15× speed with
  no Slower button, so the target is coarticulated the way it is in real speech.

## The five units

| # | Unit | Sounds | Source |
|---|------|--------|--------|
| 01 | Hiss or Buzz | /s/ /z/ | Sec. 15.1 |
| 02 | Tongue on Teeth | /θ/ /ð/ | Sec. 15.2 |
| 03 | Hush and Crunch | /ʃ/ /tʃ/ | Sec. 15.3 |
| 04 | Endings That Vanish | final /ts dz/ vs /s z/ vs /tʃ dʒ/ | Sec. 15.6 |
| 05 | Through the Nose | final /m/ /n/ /ŋ/ | Sec. 15.10 |

/ŋ/ keeps /m/ and /n/ alongside it: the book teaches it as a three-way contrast
(*some / son / sung*), and on its own /ŋ/ has nothing to be distinguished from.

## The six activities

| Activity | What plays | What the student decides |
|----------|-----------|--------------------------|
| Minimal Pairs | one word | which of **three** words it was — 12 items, 3 replays |
| Minimal Pairs — Expert | a full sentence at speed | which word it held — 15 items, **1 replay**, no Slower button |
| Same or Different | two words | whether they matched |
| Odd One Out | three words | which one differed |
| In Context | a full sentence | which word appeared in it |
| Spelling to Sound | one word | which sound that spelling makes |

Every set is **regenerated and reshuffled on each attempt** — which word gets
spoken is chosen at random, so nothing can be memorised by position. The exam
works the same way.

## Audio — three sources, in order of preference

| Source | What it is | Use it? |
|--------|-----------|---------|
| **Recorded clips** | mp3 files generated once, served as static assets | **Yes.** Instant, identical on every computer, nothing to download |
| **Device voice** | the browser's `speechSynthesis` | Fine fallback. Instant and offline, but quality varies by machine |
| **Kokoro** | Kokoro-82M generating speech *in the browser* | Only if you cannot generate clips. ~90 MB download and several seconds per word on modest hardware |

Generating speech in the browser was the wrong architecture for a classroom:
even with ONNX moved off the main thread, a school laptop needs seconds per
word. The fix is to do that work **once, offline**, and ship the results.

### Making the clips

```bash
npm init -y
npm install kokoro-js        # needs Node 18+ and ffmpeg
node tools/make-audio.mjs
```

It reads every word and sentence straight out of `script.ts`, writes
`audio/kokoro/w/*.mp3` and `audio/kokoro/s/*.mp3`, and rewrites
`audio/manifest.json`. Commit the `audio/` folder; the app picks it up
automatically and selects it as the default source.

Re-running skips files that already exist, so adding vocabulary is cheap. No
ffmpeg? `node tools/make-audio.mjs --wav` writes .wav instead.

The Audio panel shows what percentage of the material the bank covers, and any
line without a clip falls back to the device voice, so a partial bank is safe.

Every question also has an `R` key to replay and (outside Expert) a **Slower**
button.

## Speaking Studio

Each unit has a studio where the student plays the model, records themselves,
plays their own take, and hears the two back to back. A live level meter shows
the microphone is working, and clips stop at 12 seconds.

Recordings are Blobs held **in memory for the session only** — a reload clears
them, and the page says so. Students press **Send my recordings** to upload
them; `Code.gs` saves each one to a Drive folder and logs a row in a
**Recordings** tab with a link, the student, the unit and the word.

## Sending results to the teacher (optional)

By default nothing leaves the student's browser. To collect scores in a Google
Sheet, use the included **`Code.gs`** (Google Apps Script):

1. Create a Google Sheet → **Extensions → Apps Script** → paste `Code.gs` → Save
2. Run **`setUp`** once and approve the permissions
3. **Deploy → New deployment → Web app**, *Execute as:* **Me**,
   *Who has access:* **Anyone** → copy the `/exec` URL
4. Paste that URL into `REPORT_URL` at the top of `script.ts` (and `script.js`),
   then re-upload

Then:

- students are asked for **name and section once**, on first visit
- every finished activity posts one row to the **Results** tab
- the **Gradebook** tab rebuilds every 6 hours (or from the *Consonant Lab*
  menu) into one row per student with the best score per unit, colour-coded at
  the 80% pass mark

Results are queued in the browser if the network drops and sent automatically
when it returns, so a flaky classroom wifi does not lose anyone's work. The post
goes as `text/plain` with `mode: no-cors`, which is what lets a static GitHub
Pages site talk to Apps Script without a CORS preflight.

Leave `REPORT_URL` empty and none of this happens — no name prompt, no network
calls.

## Files

```
index.html    page shell — chrome, settings drawer, mount point
Code.gs       Google Apps Script for the teacher's results sheet (optional)
style.css     all styling; light + dark themes; reduced-motion support
script.ts     source of truth: content data, audio engine, activity logic
script.js     compiled output — this is what index.html loads
tsconfig.json strict TypeScript config
```

Rebuild after editing `script.ts`:

```bash
tsc -p tsconfig.json
```

Both `script.ts` and `script.js` are committed so the site works straight from
GitHub Pages while the typed source stays editable.

## Notes for the teacher

- Progress is stored in `localStorage` per browser — it is **per-device**, not a
  shared gradebook. **Reset progress** is under Audio.
- The pass mark is the `PASS` constant in `script.ts` (80). The replay budgets
  and item counts live in `buildQuestions`, and the number of units needed to
  unlock the exam is the `need` constant in `viewHome` (3).
- Adding vocabulary means editing the `UNITS` array. `triples` feeds the two
  minimal-pair drills, `pairs` feeds Same/Different and Odd One Out,
  `sentences` feeds In Context, and `sort` feeds Spelling to Sound.
- Sentence pairs must differ **only** in the `{target}` word — otherwise
  students can answer from grammar instead of sound.
