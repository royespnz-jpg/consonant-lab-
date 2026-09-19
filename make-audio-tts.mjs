/**
 * THE CONSONANT LAB — clip generator for local voice apps
 *
 * Same job as make-audio.mjs, better voice source. This asks a voice studio
 * running on your own computer for every word and sentence the app can say,
 * and writes them out as plain audio files. Three apps are supported:
 *
 *   Piper        https://github.com/OHF-voice/piper1-gpl    (default)
 *   VoiceStudio  https://github.com/debpalash/VoiceStudio
 *   Voicebox     https://github.com/jamiepine/voicebox
 *
 * Why not call them from the browser: all three listen on 127.0.0.1, which a
 * student's phone cannot reach, and Piper's server sends no CORS headers at
 * all, so a browser on another origin is refused outright. So it runs ONCE,
 * here, and what ships is ordinary mp3 files — which is also why playback is
 * instant for the student.
 *
 * ---------------------------------------------------------------------------
 * HOW TO RUN IT
 *
 * With Piper, which needs no desktop app at all:
 *
 *   pip install piper-tts[http]
 *   python3 -m piper.download_voices en_US-lessac-medium
 *   python3 -m piper.http_server -m en_US-lessac-medium
 *
 * then, in the folder with script.ts:
 *
 *   npm install
 *   node make-audio-tts.mjs --list                 # see the voices
 *   node make-audio-tts.mjs --voice en_US-lessac-medium
 *
 * Options (flags or environment variables):
 *
 *   --app     <name>      piper | voicestudio | voicebox      (default piper)
 *   --voice   <name|id>   which voice to use                     (required)
 *                         Piper multi-speaker: "<voice>#<speaker>"
 *   --speaker <name|id>   Piper only: pick the speaker separately
 *   --engine  <name>      VoiceStudio: omnivoice, voxcpm2, cosyvoice,
 *                         kittentts, mlx-audio, moss-tts-nano
 *                         Voicebox:    luxtts, qwen, qwen_custom_voice,
 *                         chatterbox, chatterbox_turbo, tada, kokoro
 *   --url     <url>       where it is listening   (default: the app's own port)
 *   --set     <id>        folder name under audio/     (default: the app name)
 *   --seed    <n>         fixes the voice run to run             (default 7)
 *   --speed   <n>         speaking speed; 1 is normal            (default 1)
 *   --wav                 keep wav instead of converting to mp3
 *   --list                just print the available voices and stop
 *
 * Piper is the default: it installs with pip, needs no desktop app, and its
 * English voices are natural and quick on a plain CPU. It returns wav, so mp3
 * needs ffmpeg on your PATH; without it the script writes wav and carries on.
 *
 * Afterwards you get:
 *
 *   audio/manifest.json
 *   audio/piper/w/<word>.mp3          one per word
 *   audio/piper/s/<sentence>.mp3      one per sentence
 *
 * Commit the whole audio/ folder. Re-running skips files that already exist,
 * so adding vocabulary later only generates the new items.
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

/* ------------------------------------------------------------------ config */

function flag(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1];
  }
  return fallback;
}

const APP = (flag('app', process.env.TTS_APP) || 'piper').toLowerCase();
if (!['piper', 'voicestudio', 'voicebox'].includes(APP)) {
  console.error(`Unknown --app "${APP}". Use piper, voicestudio or voicebox.`);
  process.exit(1);
}

const DEFAULTS = {
  piper:       { port: 5000,  engine: '' },
  voicestudio: { port: 3900,  engine: 'omnivoice' },
  voicebox:    { port: 17493, engine: 'luxtts' },
};

const URL_BASE = (flag('url', process.env.TTS_URL) || `http://127.0.0.1:${DEFAULTS[APP].port}`)
  .replace(/\/+$/, '');
// --voice is the name this uses; --profile stays accepted because Voicebox
// calls them profiles and the earlier version of this script did too.
const VOICE = flag('voice', flag('profile', process.env.TTS_VOICE)) || '';
const ENGINE = flag('engine', process.env.TTS_ENGINE) || DEFAULTS[APP].engine;
const SET_ID = flag('set', process.env.SET_ID) || APP;
const SEED = Number(flag('seed', process.env.SEED) || 7);
const SPEED = Number(flag('speed', process.env.SPEED) || 1);
// Piper voices can hold many speakers in one model; this picks one by name or id.
const SPEAKER = flag('speaker', process.env.TTS_SPEAKER) || '';
const LIST_ONLY = process.argv.includes('--list');

let WAV_ONLY = process.argv.includes('--wav');
let EXT = 'mp3';

const ROOT = path.resolve('.');
const OUT = path.join(ROOT, 'audio', SET_ID);

const key = (t) => String(t).trim().toLowerCase().replace(/\s+/g, ' ');
const slug = (t) =>
  key(t).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'clip';

/* --------------------------------------------------------------- vocabulary */

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
  for (const block of src.split('triples:').slice(1)) {
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
    for (const o of m[3].split(',')) {
      const opt = o.trim().replace(/^['"]|['"]$/g, '');
      if (opt) sentences.add(m[2].replace('___', opt));
    }
  }

  // Carrier phrases for the Expert drill. The app derives the phrase from the
  // word itself (carrierFor), so there is exactly ONE recording per word here
  // instead of one per word per phrase.
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

/* --------------------------------------------------------------- transport */

const APP_NAME = { piper: 'Piper', voicestudio: 'VoiceStudio', voicebox: 'Voicebox' }[APP];

async function api(pathname, init) {
  let res;
  try {
    res = await fetch(URL_BASE + pathname, init);
  } catch (err) {
    throw new Error(
      `Cannot reach ${APP_NAME} at ${URL_BASE}. Is the app running?\n  (${err.message})`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${init?.method || 'GET'} ${pathname} -> ${res.status} ${body.slice(0, 200)}`);
  }
  return res;
}

/** Each app answers with a list of {id, name}; the shapes differ. */
async function listVoices() {
  if (APP === 'piper') {
    // Piper answers with { "<voice id>": <config>, ... }. A config carrying
    // more than one speaker is really many voices in one file, so each is
    // listed separately as "<voice>#<speaker>".
    const body = await (await api('/voices')).json();
    const out = [];
    for (const [id, cfg] of Object.entries(body || {})) {
      const lang = cfg?.language?.name_english || cfg?.espeak?.voice || '';
      const speakers = cfg?.speaker_id_map || {};
      const names = Object.keys(speakers);
      if (names.length > 1) {
        for (const sp of names) out.push({ id: `${id}#${sp}`, name: `${id} · ${sp}`, note: lang });
      } else {
        out.push({ id, name: id, note: lang });
      }
    }
    return out;
  }
  if (APP === 'voicestudio') {
    const body = await (await api('/v1/audio/voices')).json();
    return (body.voices || []).map((v) => ({
      id: v.voice_id, name: v.name, note: v.type === 'openai_alias' ? 'built-in' : (v.language || ''),
    }));
  }
  const body = await (await api('/profiles')).json();
  return body.map((p) => ({ id: p.id, name: p.name, note: '' }));
}

/** Accepts either an id or a name, the way both apps' own endpoints do. */
async function resolveVoice(wanted) {
  const all = await listVoices();
  if (!all.length) {
    throw new Error(`${APP_NAME} has no voices yet. Create or clone one in the app first.`);
  }
  const hit = all.find((v) => v.id === wanted)
    || all.find((v) => String(v.name || '').toLowerCase() === wanted.toLowerCase());
  if (!hit) {
    throw new Error(
      `No ${APP_NAME} voice called "${wanted}". Available:\n` +
      all.map((v) => `  ${v.name}${v.note ? '  [' + v.note + ']' : ''}  (${v.id})`).join('\n'));
  }
  return hit;
}

/**
 * /generate queues the work and answers immediately, so the id it returns is
 * not audio yet. /generate/<id>/status is a Server-Sent Events stream that
 * pushes one object per change and ends once the row reaches completed or
 * failed — this reads that stream rather than polling blindly.
 */
async function waitFor(generationId, timeoutMs = 300000) {
  const res = await api(`/generate/${generationId}/status`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const started = Date.now();
  let buffer = '';

  try {
    for (;;) {
      if (Date.now() - started > timeoutMs) throw new Error('timed out waiting for Voicebox');
      const { value, done } = await reader.read();
      if (done) return 'completed';           // stream closed after the last event
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        let evt;
        try { evt = JSON.parse(line.slice(5).trim()); } catch { continue; }
        if (evt.status === 'failed') throw new Error(evt.error || 'Voicebox reported a failure');
        if (evt.status === 'not_found') throw new Error('Voicebox lost the generation');
        if (evt.status === 'completed') return 'completed';
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

/**
 * VoiceStudio speaks OpenAI's audio protocol: one request, audio straight back
 * in whichever format we ask for. Nothing to poll, and no ffmpeg step because
 * it encodes the mp3 itself.
 */
async function speakVoiceStudio(voiceId, text) {
  const res = await api('/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ENGINE,
      input: text,
      voice: voiceId,
      response_format: EXT,      // 'mp3' or 'wav'
      speed: SPEED,
      language: 'en',
      seed: SEED,                // same word, same voice, every run
    }),
  });
  return {
    bytes: Buffer.from(await res.arrayBuffer()),
    type: res.headers.get('content-type') || (EXT === 'mp3' ? 'audio/mpeg' : 'audio/wav'),
  };
}

/**
 * Voicebox queues instead: /generate answers with an id before the audio
 * exists, so the clip has to be waited for and then fetched separately.
 */
async function speakVoicebox(voiceId, text) {
  const res = await api('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile_id: voiceId,
      text,
      language: 'en',
      engine: ENGINE,
      seed: SEED,
      normalize: true,
    }),
  });
  const { id } = await res.json();
  if (!id) throw new Error('Voicebox did not return a generation id');
  await waitFor(id);

  const audio = await api(`/audio/${id}`);
  return {
    bytes: Buffer.from(await audio.arrayBuffer()),
    type: audio.headers.get('content-type') || '',
  };
}

/**
 * Piper answers synchronously with a WAV body. length_scale is duration, not
 * rate, so it is the reciprocal of speed: 0.5x speed means twice as long.
 */
async function speakPiper(voiceId, text) {
  const [model, speaker] = String(voiceId).split('#');
  const body = { text, length_scale: 1 / (SPEED || 1) };
  if (model) body.voice = model;
  const who = SPEAKER || speaker;
  if (who) {
    if (/^\d+$/.test(who)) body.speaker_id = Number(who);
    else body.speaker = who;
  }
  const res = await api('/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return {
    bytes: Buffer.from(await res.arrayBuffer()),
    type: res.headers.get('content-type') || 'audio/wav',
  };
}

const speak = { piper: speakPiper, voicestudio: speakVoiceStudio, voicebox: speakVoicebox }[APP];

/* ----------------------------------------------------------------- writing */

function sourceExt(contentType) {
  if (contentType.includes('mpeg') || contentType.includes('mp3')) return '.mp3';
  if (contentType.includes('ogg')) return '.ogg';
  if (contentType.includes('flac')) return '.flac';
  return '.wav';
}

async function writeClip(clip, outPath) {
  const srcExt = sourceExt(clip.type);

  // Already the format we ship, or we were told not to convert: straight out.
  if (WAV_ONLY || srcExt === path.extname(outPath)) {
    await fs.writeFile(outPath, clip.bytes);
    return;
  }
  const tmp = outPath.replace(/\.[^.]+$/, '.tmp' + srcExt);
  await fs.writeFile(tmp, clip.bytes);
  try {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-b:a', '64k', outPath]);
  } finally {
    await fs.rm(tmp, { force: true });
  }
}

/* -------------------------------------------------------------------- main */

/** Everything below talks to a machine that may simply not be running, so the
 *  failures here are ordinary and deserve a sentence, not a stack trace. */
function bail(err) {
  console.error('\n' + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
}
process.on('unhandledRejection', bail);

if (LIST_ONLY) {
  const all = await listVoices().catch(bail);
  if (!all.length) console.log(`No voices yet — create or clone one in ${APP_NAME}.`);
  for (const v of all) console.log(`${v.name}${v.note ? '  [' + v.note + ']' : ''}  (${v.id})`);
  process.exit(0);
}

if (!VOICE) {
  console.error('Which voice? Pass --voice "<name>". Run with --list to see them.');
  process.exit(1);
}

const voice = await resolveVoice(VOICE).catch(bail);
console.log(`${APP_NAME}  ·  voice: ${voice.name}${ENGINE ? '  ·  engine: ' + ENGINE : ''}  ·  seed: ${SEED}`);

// VoiceStudio encodes the format we ask for, so there is nothing to convert.
// Piper and Voicebox hand back wav, so mp3 there depends on ffmpeg.
if (!WAV_ONLY && APP !== 'voicestudio') {
  try {
    await run('ffmpeg', ['-version']);
    console.log('ffmpeg found — writing mp3 (small files).');
  } catch {
    WAV_ONLY = true;
    console.log('No ffmpeg — writing wav instead. Works fine, the files are just bigger.');
  }
}
EXT = WAV_ONLY ? 'wav' : 'mp3';

const { words, sentences } = await collect();
console.log(`Found ${words.length} words and ${sentences.length} sentences.`);

await fs.mkdir(path.join(OUT, 'w'), { recursive: true });
await fs.mkdir(path.join(OUT, 's'), { recursive: true });

const clips = {};
const missing = [];
let made = 0, skipped = 0;

/**
 * slug() drops punctuation, so two prompts that differ only there — "on my
 * porch." and "on my porch!" — would land on one filename and the second
 * would silently play the first one's audio. Anything already claimed by a
 * different text gets a short tag from the text itself so both survive.
 */
const claimed = new Map();
function relPathFor(text, sub) {
  let name = slug(text);
  const taken = claimed.get(`${sub}/${name}`);
  if (taken !== undefined && taken !== key(text)) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    name += '-' + h.toString(36).slice(0, 4);
  }
  claimed.set(`${sub}/${name}`, key(text));
  return `${SET_ID}/${sub}/${name}.${EXT}`;
}

async function generate(list, sub) {
  for (const text of list) {
    const rel = relPathFor(text, sub);
    const abs = path.join(ROOT, 'audio', rel);
    clips[key(text)] = rel;

    try {
      await fs.access(abs);
      skipped++;
      continue;                               // already generated
    } catch { /* needs generating */ }

    try {
      await writeClip(await speak(voice.id, text), abs);
      made++;
      const total = words.length + sentences.length;
      if (made % 10 === 0) console.log(`  ${made + skipped}/${total}…`);
    } catch (err) {
      // One bad clip must not throw away the hundreds already generated.
      console.warn(`  skipped "${text}": ${err.message}`);
      missing.push(text);
      delete clips[key(text)];
    }
  }
}

await generate(words, 'w');
await generate(sentences, 's');

const manifest = {
  sets: [{
    id: SET_ID,
    label: ENGINE ? `${voice.name} (${APP_NAME}, ${ENGINE})` : `${voice.name} (${APP_NAME})`,
    engine: APP,
    voice: voice.name,
    voiceId: voice.id,
    seed: SEED,
    generated: new Date().toISOString().slice(0, 10),
    missing,
  }],
  clips,
};

await fs.writeFile(
  path.join(ROOT, 'audio', 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n');

console.log(`\n${made} generated, ${skipped} already there.`);
if (missing.length) console.log(`${missing.length} could not be generated: ${missing.slice(0, 5).join(', ')}…`);
console.log(`${Object.keys(clips).length} clips listed in audio/manifest.json`);
console.log('Commit the audio/ folder and the site will play these instead of generating speech.');
