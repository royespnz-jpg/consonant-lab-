/**
 * THE CONSONANT LAB — clip generator
 *
 * Runs Kokoro ONCE on your own computer and writes the mp3 files the app then
 * plays as plain static audio. This is what makes the site fast: the browser
 * never generates speech, it just plays a file.
 *
 * ---------------------------------------------------------------------------
 * HOW TO RUN IT  (needs Node 18+ and ffmpeg on your PATH)
 *
 *   cd  <the folder with script.ts>
 *   npm install
 *   npm run audio
 *
 * The first run downloads the Kokoro model (~90 MB) into node_modules/.cache
 * and then takes a few minutes. Afterwards you get:
 *
 *   audio/manifest.json
 *   audio/kokoro/w/<word>.mp3          one per word
 *   audio/kokoro/s/<sentence>.mp3      one per sentence
 *
 * Commit the whole audio/ folder. Re-run it whenever you add vocabulary; it
 * skips files that already exist, so it is cheap to run again.
 *
 * ---------------------------------------------------------------------------
 * ffmpeg is optional. If it is on your PATH you get small mp3 files; if not,
 * the script writes wav instead and carries on. Nothing to install either way.
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const VOICE = process.env.VOICE || 'af_heart';
const SET_ID = process.env.SET_ID || 'kokoro';
// mp3 is ~8x smaller, but it needs ffmpeg. Rather than demand it, we look for
// it and quietly fall back to wav, which kokoro-js writes on its own.
let WAV_ONLY = process.argv.includes('--wav');
let EXT = 'mp3';

const ROOT = path.resolve('.');
const OUT = path.join(ROOT, 'audio', SET_ID);

/* ---------------------------------------------------------------- helpers */

const key = (t) => String(t).trim().toLowerCase().replace(/\s+/g, ' ');
const slug = (t) =>
  key(t).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'clip';

/** Pull every spoken string out of script.ts without importing it. */
async function collect() {
  const src = await fs.readFile(path.join(ROOT, 'script.ts'), 'utf8');

  const words = new Set();
  const sentences = new Set();

  // pairs: { a: 'x', b: 'y' }
  for (const m of src.matchAll(/\{\s*a:\s*(['"])(.*?)\1\s*,\s*b:\s*(['"])(.*?)\3\s*\}/g)) {
    const a = m[2], b = m[4];
    if (a.includes('{')) { sentences.add(a.replace(/[{}]/g, '')); sentences.add(b.replace(/[{}]/g, '')); }
    else { words.add(a); words.add(b); }
  }

  // triples: [ 'a', 'b', 'c' ] inside the triples blocks
  const tri = src.split('triples:').slice(1);
  for (const block of tri) {
    const end = block.indexOf('],\n    pairs:');
    const chunk = end > 0 ? block.slice(0, end) : block.slice(0, 2000);
    for (const m of chunk.matchAll(/\[([^\[\]]+)\]/g)) {
      for (const w of m[1].split(',')) {
        const c = w.trim().replace(/^['"]|['"]$/g, '');
        if (c && !c.includes(':')) words.add(c);
      }
    }
  }

  // sort items: { word: 'x', sound: n }
  for (const m of src.matchAll(/\{\s*word:\s*(['"])(.*?)\1/g)) words.add(m[2]);

  // exam frames: { frame: '... ___ ...', options: ['a','b'] }
  for (const m of src.matchAll(/\{\s*frame:\s*(['"])(.*?)\1\s*,\s*options:\s*\[(.*?)\]/g)) {
    const frame = m[2];
    for (const o of m[3].split(',')) {
      const opt = o.trim().replace(/^['"]|['"]$/g, '');
      if (opt) sentences.add(frame.replace('___', opt));
    }
  }

  // Carrier phrases for the Expert drill. The app derives the phrase from the
  // word itself (carrierFor), so there is exactly ONE recording per word here
  // instead of one per word per phrase — 368 clips rather than 1840.
  const carriers = ['Say ___ again.', 'The word is ___, okay?', 'I heard ___ clearly.',
                    'Write ___ down.', 'They said ___ twice.'];
  const carrierFor = (w) => {
    let h = 0;
    for (let i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) >>> 0;
    return carriers[h % carriers.length];
  };
  for (const w of words) sentences.add(carrierFor(w).replace('___', w));

  return {
    words: [...words].filter(Boolean).sort(),
    sentences: [...sentences].filter(Boolean).sort(),
  };
}

async function toFile(audio, outPath) {
  if (WAV_ONLY) { await audio.save(outPath); return; }
  const tmp = outPath.replace(/\.mp3$/, '.tmp.wav');
  await audio.save(tmp);
  try {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-b:a', '64k', outPath]);
  } finally {
    await fs.rm(tmp, { force: true });
  }
}

/* ------------------------------------------------------------------- main */

const { words, sentences } = await collect();
console.log(`Found ${words.length} words and ${sentences.length} sentences.`);

if (!WAV_ONLY) {
  try {
    await run('ffmpeg', ['-version']);
    console.log('ffmpeg found — writing mp3 (small files).');
  } catch {
    WAV_ONLY = true;
    console.log('No ffmpeg — writing wav instead. Works fine, the files are just bigger.');
  }
}
EXT = WAV_ONLY ? 'wav' : 'mp3';

const { KokoroTTS } = await import('kokoro-js');
console.log('Loading Kokoro (first run downloads ~90 MB)…');
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
  dtype: 'q8', device: 'cpu',
});

await fs.mkdir(path.join(OUT, 'w'), { recursive: true });
await fs.mkdir(path.join(OUT, 's'), { recursive: true });

const clips = {};
const missing = [];
let made = 0, skipped = 0;

async function generate(list, sub) {
  for (const text of list) {
    const rel = `${SET_ID}/${sub}/${slug(text)}.${EXT}`;
    const abs = path.join(ROOT, 'audio', rel);
    clips[key(text)] = rel;
    try {
      await fs.access(abs);
      skipped++;
      continue;                               // already generated
    } catch { /* needs generating */ }
    try {
      const audio = await tts.generate(text, { voice: VOICE });
      await toFile(audio, abs);
      made++;
      if (made % 25 === 0) console.log(`  ${made} generated…`);
    } catch (e) {
      console.warn(`  ! failed: ${text} — ${e.message}`);
      missing.push(text);
      delete clips[key(text)];
    }
  }
}

console.log('Generating words…');
await generate(words, 'w');
console.log('Generating sentences…');
await generate(sentences, 's');

const manifest = {
  sets: [{
    id: SET_ID,
    label: `Kokoro (English, ${VOICE})`,
    engine: 'kokoro',
    voice: VOICE,
    bitrate: WAV_ONLY ? null : 64,
    generated: new Date().toISOString().slice(0, 10),
    missing,
  }],
  clips,
};

await fs.writeFile(
  path.join(ROOT, 'audio', 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n');

console.log(`\nDone. ${made} new, ${skipped} already there, ${missing.length} failed.`);
console.log(`${Object.keys(clips).length} clips listed in audio/manifest.json`);
console.log('Commit the audio/ folder and the app will use it automatically.');
