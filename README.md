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

## Audio — two engines

Under **Audio** in the top bar you choose the voice engine:

| Engine | What it is | Trade-off |
|--------|-----------|-----------|
| **Device voices** (default) | the browser's `speechSynthesis` | instant, offline, but quality varies wildly between computers |
| **Kokoro** | Kokoro-82M neural TTS running **locally in the browser** via `transformers.js` | far clearer and identical on every machine; downloads ~90 MB once, then cached |

Kokoro is loaded lazily from `cdn.jsdelivr.net` with the model weights from
Hugging Face, quantised to `q8` and run on WASM. Nine curated English voices are
offered (American and British). Generated clips are cached in memory and the
**next question's audio is prefetched while the student is answering**, so the
neural engine does not add a wait between questions.

If Kokoro cannot load — no network, a school firewall, an old browser — the app
says so in the settings panel and **silently falls back to the device voices**.
Nothing breaks.

Every question also has an `R` key to replay and (outside Expert) a **Slower**
button.

## Files

```
index.html    page shell — chrome, settings drawer, mount point
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
