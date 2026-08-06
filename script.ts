/**
 * THE CONSONANT LAB
 * Listening & pronunciation practice built on Chapter 15, "Consonants in Detail"
 * (Dauer, Accurate English, pp. 164-218).
 *
 * Flow: STUDY (review the key information) -> DRILL (identify what you hear) -> EXAM.
 * Audio is produced with the Web Speech API so the app stays a static site.
 */

/* ============================================================================
   1. TYPES
   ========================================================================== */

type Voicing = 'voiceless' | 'voiced' | 'none';

interface SoundProfile {
  ipa: string;
  label: string;
  voicing: Voicing;
  manner: string;
  place: string;
  /** One-line "how to make it", rewritten from the book's Practice boxes. */
  howTo: string;
  spellings: Array<{ pattern: string; note?: string; examples: string }>;
}

interface WordPair {
  a: string;
  b: string;
}

interface SentencePair {
  /** Sentence with {} marking the target word, e.g. "What's the {price}?" */
  a: string;
  b: string;
}

interface SortItem {
  word: string;
  /** index into unit.sounds */
  sound: number;
}

interface ReviewCard {
  kind: 'sound' | 'contrast' | 'rule' | 'wordbank';
  title: string;
  body?: string;
  sound?: SoundProfile;
  rows?: Array<{ head: string; items: string }>;
  callout?: string;
}

interface Unit {
  id: string;
  num: string;
  title: string;
  tagline: string;
  book: string;
  sounds: SoundProfile[];
  review: ReviewCard[];
  pairs: WordPair[];
  sentences: SentencePair[];
  sort: SortItem[];
}

type ActivityKind = 'pairs' | 'samediff' | 'odd' | 'sentence' | 'sort';

interface Question {
  kind: ActivityKind;
  /** The utterances to play, in order. */
  audio: string[];
  prompt: string;
  options: string[];
  answer: number;
  /** Shown after answering. */
  note?: string;
}

interface ExamItem {
  /** Sentence with ___ where the tested word goes. */
  frame: string;
  /** Choices printed on screen; one is picked at random to be spoken. */
  options: string[];
}

interface UnitProgress {
  reviewed: boolean;
  best: Record<string, number>;
}

interface SaveState {
  version: 3;
  units: Record<string, UnitProgress>;
  exam: { best: number; taken: number };
  settings: { voiceURI: string | null; rate: number; theme: 'dark' | 'light' | 'auto' };
}

/* ============================================================================
   2. SOUND PROFILES
   ========================================================================== */

const S: Record<string, SoundProfile> = {
  s: {
    ipa: '/s/', label: 'ess', voicing: 'voiceless', manner: 'fricative', place: 'alveolar',
    howTo: 'Tongue tip near the tooth ridge, teeth almost closed. Push a thin, high hiss out. Throat is silent.',
    spellings: [
      { pattern: '<s>', examples: 'see, smile, yes, us, this, hopes' },
      { pattern: '<ss>', examples: 'class, discuss, necessary' },
      { pattern: '<c>', note: 'before i, e, y', examples: 'city, recent, face, cycle' },
      { pattern: '<sc>', note: 'before i, e', examples: 'science, scenery, descend' },
      { pattern: '<se>', note: 'after a consonant', examples: 'sense, course, false, collapse' },
      { pattern: '<x>', note: '= /ks/', examples: 'six, taxi, exercise, expect' },
    ],
  },
  z: {
    ipa: '/z/', label: 'zee', voicing: 'voiced', manner: 'fricative', place: 'alveolar',
    howTo: 'Exactly the same mouth position as /s/ — but switch the voice on. Touch your throat: it must buzz.',
    spellings: [
      { pattern: '<z>, <zz>', examples: 'zoo, zero, lazy, buzz' },
      { pattern: '<s>', note: 'between vowels', examples: 'music, easy, busy, choose' },
      { pattern: '<se>', note: 'after a vowel', examples: 'house (v.), cease, rise, noise, those' },
      { pattern: '-s ending', note: 'after a voiced sound', examples: 'plays, knees, beads, plans' },
    ],
  },
  th: {
    ipa: '/θ/', label: 'voiceless th', voicing: 'voiceless', manner: 'fricative', place: 'dental',
    howTo: 'Tongue TIP touches the cutting edge of the upper front teeth — lightly. Blow. In a mirror you should see only a little tongue.',
    spellings: [
      { pattern: '<th>', note: 'start of content words', examples: 'think, thirsty, three, thumb' },
      { pattern: '<th>', note: 'end of words', examples: 'mouth, breath, health, month' },
    ],
  },
  dh: {
    ipa: '/ð/', label: 'voiced th', voicing: 'voiced', manner: 'fricative', place: 'dental',
    howTo: 'Same as /θ/ plus voice. Keep the air flowing — it is a soft, weak sound, never a hard stop like /d/.',
    spellings: [
      { pattern: '<th>', note: 'start of function words', examples: 'the, they, this, that, though' },
      { pattern: '<th>', note: 'between vowels', examples: 'mother, leather, weather, another' },
      { pattern: '<the>', note: 'end of words', examples: 'soothe, breathe, bathe, clothe' },
    ],
  },
  t: {
    ipa: '/t/', label: 'tee', voicing: 'voiceless', manner: 'stop', place: 'alveolar',
    howTo: 'Tongue tip presses the tooth ridge and blocks the air completely, then releases with a small puff.',
    spellings: [{ pattern: '<t>, <tt>', examples: 'tin, taught, better, sit' }],
  },
  sh: {
    ipa: '/ʃ/', label: 'sh', voicing: 'voiceless', manner: 'fricative', place: 'post-alveolar',
    howTo: 'Front of the tongue moves toward the roof of the mouth — further back than /s/ — and the lips round slightly. Lower, softer hiss.',
    spellings: [
      { pattern: '<sh>', examples: 'she, ship, cash, wash' },
      { pattern: '<ti>', note: 'in -tion', examples: 'nation, condition, patient' },
      { pattern: '<ci>, <ce>', examples: 'special, ocean, artificial' },
      { pattern: '<ss>', note: 'in -ssion', examples: 'mission, expression, issue' },
      { pattern: '<ch>', note: 'French loanwords', examples: 'machine, chef, parachute, Chicago' },
    ],
  },
  ch: {
    ipa: '/tʃ/', label: 'ch', voicing: 'voiceless', manner: 'affricate', place: 'post-alveolar',
    howTo: 'STOP the air completely first (like /t/), then open into /ʃ/. Stop + hiss glued together.',
    spellings: [
      { pattern: '<ch>', examples: 'cheap, chair, much, teacher' },
      { pattern: '<tch>', examples: 'watch, catch, ditch, match' },
      { pattern: '<t> + <u>', examples: 'future, picture, nature, statue, punctual' },
    ],
  },
  j: {
    ipa: '/dʒ/', label: 'j', voicing: 'voiced', manner: 'affricate', place: 'post-alveolar',
    howTo: 'The voiced twin of /tʃ/. Stop the air, then release into /ʒ/ with real friction — even in unstressed syllables.',
    spellings: [
      { pattern: '<j>, <dj>', examples: 'judge, joke, major, enjoy, adjust' },
      { pattern: '<g>', note: 'before e, i, y', examples: 'George, manager, page, giant, gym' },
      { pattern: '<dge>', examples: 'budget, edge, knowledge' },
      { pattern: '<du>', note: 'unstressed', examples: 'gradual, individual, educate, procedure' },
    ],
  },
  zh: {
    ipa: '/ʒ/', label: 'zh', voicing: 'voiced', manner: 'fricative', place: 'post-alveolar',
    howTo: 'Like /ʃ/ with the voice on, and the air must keep flowing — never stop it. Rare, and almost never starts a word.',
    spellings: [
      { pattern: '<si>', note: 'in -sion after a vowel', examples: 'vision, decision, explosion, occasion' },
      { pattern: '<su>', examples: 'measure, pleasure, usual, casual, leisure' },
      { pattern: 'French loans', examples: 'beige, rouge, garage, massage, mirage' },
    ],
  },
  y: {
    ipa: '/j/', label: 'y as in yes', voicing: 'voiced', manner: 'glide', place: 'palatal',
    howTo: 'A quick glide — no friction, no stop. The tongue is pushed further forward than for /i/.',
    spellings: [
      { pattern: '<y>', examples: 'you, year, beyond, yellow' },
      { pattern: '<i>', note: 'between C and V', examples: 'onion, convenient, million, familiar' },
      { pattern: '<u>, <ue>', note: '= /yu/', examples: 'usually, university, computer, music, cute, human, fuel' },
      { pattern: '<ew>, <eu>', examples: 'few, Matthew, Europe, feud' },
    ],
  },
  f: {
    ipa: '/f/', label: 'ef', voicing: 'voiceless', manner: 'fricative', place: 'labiodental',
    howTo: 'Inside of the LOWER LIP touches the upper teeth. Squeeze and force air out the whole time. No lip rounding.',
    spellings: [
      { pattern: '<f>, <ff>', examples: 'four, free, leaf, prefer, traffic, off' },
      { pattern: '<ph>', examples: 'pharmacy, telephone, sphere, photograph' },
      { pattern: '<gh>', note: 'common words', examples: 'laugh, cough, enough, rough, tough' },
    ],
  },
  v: {
    ipa: '/v/', label: 'vee', voicing: 'voiced', manner: 'fricative', place: 'labiodental',
    howTo: 'Form it exactly like /f/, then add voice. The vowel before a final /v/ gets longer.',
    spellings: [
      { pattern: '<v>', examples: 'very, view, seven, solve, arrive' },
      { pattern: 'exception', examples: 'of = /əv/' },
    ],
  },
  b: {
    ipa: '/b/', label: 'bee', voicing: 'voiced', manner: 'stop', place: 'bilabial',
    howTo: 'BOTH lips close and stop the air completely, then pop open. Not a long buzz like /v/.',
    spellings: [{ pattern: '<b>, <bb>', examples: 'berry, boat, habit, rubber' }],
  },
  w: {
    ipa: '/w/', label: 'double-u', voicing: 'voiced', manner: 'glide', place: 'labial-velar',
    howTo: 'Lips push forward and ROUND into a small circle. The teeth never touch the lip. It glides straight into the vowel.',
    spellings: [
      { pattern: '<w>', examples: 'was, wood, away, twenty, sweet' },
      { pattern: '<wh>', examples: 'why, when, where, whale' },
      { pattern: '<u>', note: 'after q, g, s', examples: 'quiet, squeeze, language, persuade' },
      { pattern: 'exceptions', examples: 'one, once, choir /kwaɪɚ/' },
    ],
  },
  h: {
    ipa: '/h/', label: 'aitch', voicing: 'voiceless', manner: 'fricative', place: 'glottal',
    howTo: 'Open the glottis and just breathe out — the vocal folds do not vibrate. Very relaxed. No scraping at the back of the mouth.',
    spellings: [
      { pattern: '<h>', examples: 'how, hand, heavy, behind, alcohol' },
      { pattern: '<wh>', note: 'a few words', examples: 'who, whom, whose, whole' },
      { pattern: 'SILENT <h>', examples: 'hour, honest, honor, herb, heir, exhaust, ghost, rhythm' },
    ],
  },
  zero: {
    ipa: '∅', label: 'no /h/ — vowel start', voicing: 'none', manner: '—', place: '—',
    howTo: 'The word simply begins on the vowel. Link it smoothly to the word before; do not start with a glottal stop.',
    spellings: [{ pattern: 'vowel', examples: 'ate, angry, art, eating, edge, air, armed' }],
  },
  r: {
    ipa: '/r/', label: 'ar', voicing: 'voiced', manner: 'approximant', place: 'post-alveolar',
    howTo: 'The tongue tip POINTS AT but never touches the roof of the mouth. Sides of the tongue press the back upper teeth; lips round a little.',
    spellings: [
      { pattern: '<r>, <rr>', examples: 'red, try, string, zero, carry, arrive' },
      { pattern: '<wr>', examples: 'wrong, write, wrap, wrist' },
      { pattern: '<rh>', note: 'academic words', examples: 'rhythm, rhyme, rhapsody' },
    ],
  },
  l: {
    ipa: '/l/', label: 'el', voicing: 'voiced', manner: 'lateral', place: 'alveolar',
    howTo: 'Tongue tip TOUCHES the tooth ridge; air escapes around the SIDES. Lips are NOT rounded. Drop the tip quickly into the vowel.',
    spellings: [
      { pattern: '<l>, <ll>', examples: 'like, splash, relate, fool, told, yellow, ball' },
      { pattern: 'SILENT <l>', examples: 'talk, walk, chalk, should, would, folk, half, calm' },
    ],
  },
  m: {
    ipa: '/m/', label: 'em', voicing: 'voiced', manner: 'nasal', place: 'bilabial',
    howTo: 'Lips closed, sound out the nose. At the end of a word hold it LONG — do not chop it off.',
    spellings: [{ pattern: '<m>, <mm>', examples: 'some, summer, climb, comb, autumn' }],
  },
  n: {
    ipa: '/n/', label: 'en', voicing: 'voiced', manner: 'nasal', place: 'alveolar',
    howTo: 'Tongue tip on the tooth ridge, lips OPEN, sound out the nose. Hold it long at the end of a word.',
    spellings: [{ pattern: '<n>, <nn>', examples: 'son, run, dinner, know, gone' }],
  },
  ng: {
    ipa: '/ŋ/', label: 'eng', voicing: 'voiced', manner: 'nasal', place: 'velar',
    howTo: 'BACK of the tongue lifts to the roof of the mouth; tongue tip stays down. Never add a /g/ or /k/ after it in "sing, long".',
    spellings: [
      { pattern: '<ng>', examples: 'sing, long, sung, ring' },
      { pattern: '<n>', note: 'before k, g', examples: 'think, finger, uncle, bank' },
    ],
  },
};

/* ============================================================================
   3. UNITS
   ========================================================================== */

const contrastCard = (a: SoundProfile, b: SoundProfile, body: string, callout?: string): ReviewCard => ({
  kind: 'contrast', title: `${a.ipa} vs ${b.ipa}`, body, callout,
});

const UNITS: Unit[] = [
  {
    id: 's-z', num: '01', title: 'Hiss or Buzz', tagline: 'The voicing switch', book: 'Sec. 15.1',
    sounds: [S.s, S.z],
    review: [
      { kind: 'sound', title: 'The voiceless one', sound: S.s },
      { kind: 'sound', title: 'The voiced one', sound: S.z },
      contrastCard(S.s, S.z,
        'The mouth does not move. The only difference is the voice box. Put two fingers on your throat and say a long ssssss, then a long zzzzz — you should feel the buzz start.',
        'If you cannot hear it, hold the sound for three seconds. /z/ vibrates; /s/ is pure air.'),
      {
        kind: 'rule', title: 'The grammar shortcut',
        body: 'Many word pairs are spelled the same but split by sound. The NOUN or ADJECTIVE takes /s/; the VERB takes /z/.',
        rows: [
          { head: 'noun / adj → /s/', items: 'some advice · the use · an excuse · a house · a close friend · a loose jacket' },
          { head: 'verb → /z/', items: 'to advise · to use · to excuse · to house · to close · to lose' },
        ],
      },
      {
        kind: 'wordbank', title: 'Endings after a voiced sound become /z/',
        rows: [
          { head: '/s/ after voiceless', items: 'hopes · cats · books · laughs · months' },
          { head: '/z/ after voiced', items: 'plays · knees · beads · plans · rides · lambs' },
        ],
        callout: 'This is why plants and plans sound different — /ts/ against /nz/.',
      },
    ],
    pairs: [
      { a: 'price', b: 'prize' }, { a: 'place', b: 'plays' }, { a: 'peace', b: 'peas' },
      { a: 'niece', b: 'knees' }, { a: 'bus', b: 'buzz' }, { a: 'cost', b: 'caused' },
      { a: 'lamps', b: 'lambs' }, { a: 'plants', b: 'plans' }, { a: 'false', b: 'falls' },
      { a: 'fierce', b: 'fears' }, { a: 'advice', b: 'advise' }, { a: 'loose', b: 'lose' },
      { a: 'Sue', b: 'zoo' }, { a: 'ice', b: 'eyes' }, { a: 'racer', b: 'razor' },
      { a: 'hiss', b: 'his' }, { a: 'sip', b: 'zip' }, { a: 'course', b: 'cores' },
    ],
    sentences: [
      { a: "What's the {price}?", b: "What's the {prize}?" },
      { a: "I'd like some {peace} for a change.", b: "I'd like some {peas} for a change." },
      { a: 'His {niece} received some cuts in the crash.', b: 'His {knees} received some cuts in the crash.' },
      { a: 'They {bus} people when they need to.', b: 'They {buzz} people when they need to.' },
      { a: 'It {cost} him a lot of worry.', b: 'It {caused} him a lot of worry.' },
      { a: 'There are some {lamps} in the room.', b: 'There are some {lambs} in the room.' },
      { a: 'Do you have any {plants}?', b: 'Do you have any {plans}?' },
      { a: "I think they're {false}.", b: "I think they're {falls}." },
    ],
    sort: [
      { word: 'because', sound: 1 }, { word: 'choose', sound: 1 }, { word: 'release', sound: 0 },
      { word: 'chase', sound: 0 }, { word: 'whose', sound: 1 }, { word: 'purpose', sound: 0 },
      { word: 'mouse', sound: 0 }, { word: 'revise', sound: 1 }, { word: 'noise', sound: 1 },
      { word: 'erase', sound: 0 }, { word: 'those', sound: 1 }, { word: 'baseball', sound: 0 },
      { word: 'science', sound: 0 }, { word: 'music', sound: 1 }, { word: 'exercise', sound: 0 },
      { word: 'lazy', sound: 1 }, { word: 'course', sound: 0 }, { word: 'easy', sound: 1 },
    ],
  },

  {
    id: 'th-dh', num: '02', title: 'Tongue on Teeth', tagline: 'The two <th> sounds', book: 'Sec. 15.2',
    sounds: [S.th, S.dh],
    review: [
      { kind: 'sound', title: 'Voiceless <th>', sound: S.th },
      { kind: 'sound', title: 'Voiced <th>', sound: S.dh },
      contrastCard(S.th, S.dh,
        'Same tongue position, same light contact with the teeth. /θ/ is pure air; /ð/ has the voice on and stays soft.',
        'Do NOT stick your tongue out. In a mirror you should see just a little of the tip.'),
      {
        kind: 'rule', title: 'How to predict which one',
        body: 'Spelling will not tell you — position in the word will.',
        rows: [
          { head: '/θ/ starts CONTENT words', items: 'think · thirsty · three · thumb · Thursday' },
          { head: '/ð/ starts FUNCTION words', items: 'the · they · this · that · those · though' },
          { head: '/ð/ between vowels', items: 'mother · leather · weather · together · another' },
          { head: '/θ/ at the end', items: 'mouth · breath · health · month · truth' },
          { head: '/ð/ in the ending <the>', items: 'breathe · bathe · clothe · soothe · loathe' },
        ],
      },
      {
        kind: 'rule', title: 'Noun /θ/ → verb /ð/',
        rows: [
          { head: 'noun', items: 'breath · bath · cloth · teeth' },
          { head: 'verb', items: 'breathe · bathe · clothe · teethe' },
        ],
        callout: 'The vowel changes too — breath /brɛθ/ but breathe /briːð/.',
      },
    ],
    pairs: [
      { a: 'thin', b: 'tin' }, { a: 'thanks', b: 'tanks' }, { a: 'thought', b: 'taught' },
      { a: 'themes', b: 'teams' }, { a: 'death', b: 'debt' }, { a: 'bath', b: 'bat' },
      { a: 'both', b: 'boat' }, { a: 'faith', b: 'fate' }, { a: 'three', b: 'tree' },
      { a: 'thumb', b: 'sum' }, { a: 'thought', b: 'sought' }, { a: 'mouth', b: 'mouse' },
      { a: 'path', b: 'pass' }, { a: 'faith', b: 'face' }, { a: 'tenth', b: 'tense' },
      { a: 'three', b: 'free' }, { a: 'thread', b: 'Fred' }, { a: 'thin', b: 'fin' },
      { a: 'death', b: 'deaf' }, { a: 'then', b: 'den' }, { a: 'they', b: 'day' },
      { a: 'leather', b: 'letter' }, { a: 'clothe', b: 'close' }, { a: 'mother', b: 'mutter' },
      { a: 'either', b: 'eater' }, { a: 'breathe', b: 'breed' },
    ],
    sentences: [
      { a: "It's {thin}.", b: "It's {tin}." },
      { a: 'He {thought} about the war.', b: 'He {taught} about the war.' },
      { a: 'He gave him a {bath}.', b: 'He gave him a {bat}.' },
      { a: "What's his {faith}?", b: "What's his {fate}?" },
      { a: "Where's your {thumb}?", b: "Where's your {sum}?" },
      { a: 'Her {mouth} is pretty.', b: 'Her {mouse} is pretty.' },
      { a: 'They went over the {path}.', b: 'They went over the {pass}.' },
      { a: "He's the {tenth} child.", b: "He's the {tense} child." },
      { a: 'I saw her {then}.', b: 'I saw her {den}.' },
      { a: "Where's the {leather}?", b: "Where's the {letter}?" },
    ],
    sort: [
      { word: 'think', sound: 0 }, { word: 'they', sound: 1 }, { word: 'birthday', sound: 0 },
      { word: 'father', sound: 1 }, { word: 'health', sound: 0 }, { word: 'although', sound: 1 },
      { word: 'mathematics', sound: 0 }, { word: 'southern', sound: 1 }, { word: 'month', sound: 0 },
      { word: 'breathe', sound: 1 }, { word: 'breath', sound: 0 }, { word: 'clothing', sound: 1 },
      { word: 'thirsty', sound: 0 }, { word: 'weather', sound: 1 }, { word: 'truth', sound: 0 },
      { word: 'smooth', sound: 1 }, { word: 'wealthy', sound: 0 }, { word: 'these', sound: 1 },
    ],
  },

  {
    id: 'sh-ch', num: '03', title: 'Hush and Crunch', tagline: 'Fricative vs affricate', book: 'Sec. 15.3',
    sounds: [S.sh, S.ch],
    review: [
      { kind: 'sound', title: 'The long hush', sound: S.sh },
      { kind: 'sound', title: 'The crunch', sound: S.ch },
      contrastCard(S.sh, S.ch,
        '/ʃ/ can be held forever — shhhhh. /tʃ/ cannot: the air is blocked first, so it starts with a tiny explosion and ends instantly.',
        'Test: try to hold the sound for 3 seconds. If you can, it is /ʃ/.'),
      contrastCard(S.sh, S.s,
        '/s/ is high, thin and sharp with the tongue forward. /ʃ/ is lower, softer and rounder — the tongue slides back and the lips push out a little.',
        'Watch the lips: /ʃ/ rounds them, /s/ does not.'),
      {
        kind: 'wordbank', title: '/ʃ/ hides in ordinary spellings',
        rows: [
          { head: '-tion', items: 'nation · condition · situation · appreciation' },
          { head: '-ssion / -ssue', items: 'mission · expression · issue' },
          { head: '-cial / -cious', items: 'special · artificial · suspicious' },
          { head: 'French <ch>', items: 'machine · chef · parachute · Chicago' },
        ],
        callout: 'And <ch> = /k/ in Greek roots: monarch, echo, chorus, mechanic, chemist, chaos.',
      },
    ],
    pairs: [
      { a: 'sheep', b: 'cheap' }, { a: 'shows', b: 'chose' }, { a: 'ships', b: 'chips' },
      { a: 'share', b: 'chair' }, { a: 'washing', b: 'watching' }, { a: 'cash', b: 'catch' },
      { a: 'dish', b: 'ditch' }, { a: 'mash', b: 'match' }, { a: 'washed', b: 'watched' },
      { a: 'shave', b: 'save' }, { a: 'showed', b: 'sewed' }, { a: 'shoes', b: "Sue's" },
      { a: 'shock', b: 'sock' }, { a: 'sheet', b: 'seat' }, { a: 'clashes', b: 'classes' },
      { a: 'leash', b: 'lease' }, { a: 'mesh', b: 'mess' }, { a: 'crushed', b: 'crust' },
      { a: 'rushed', b: 'rusted' }, { a: 'Porsche', b: 'porch' },
    ],
    sentences: [
      { a: "They're {sheep}.", b: "They're {cheap}." },
      { a: 'I counted ten {ships}.', b: 'I counted ten {chips}.' },
      { a: 'He took my {share}.', b: 'He took my {chair}.' },
      { a: "They're {washing} my car.", b: "They're {watching} my car." },
      { a: 'You should {cash} it.', b: 'You should {catch} it.' },
      { a: 'He put it in the {dish}.', b: 'He put it in the {ditch}.' },
      { a: "I'll {shave} more.", b: "I'll {save} more." },
      { a: 'Did you find a new {sheet}?', b: 'Did you find a new {seat}?' },
      { a: 'His {leash} is very long.', b: 'His {lease} is very long.' },
      { a: 'It was caught in a {mesh}.', b: 'It was caught in a {mess}.' },
    ],
    sort: [
      { word: 'nation', sound: 0 }, { word: 'future', sound: 1 }, { word: 'machine', sound: 0 },
      { word: 'kitchen', sound: 1 }, { word: 'special', sound: 0 }, { word: 'picture', sound: 1 },
      { word: 'mission', sound: 0 }, { word: 'question', sound: 1 }, { word: 'sugar', sound: 0 },
      { word: 'teacher', sound: 1 }, { word: 'ocean', sound: 0 }, { word: 'nature', sound: 1 },
      { word: 'parachute', sound: 0 }, { word: 'statue', sound: 1 }, { word: 'insurance', sound: 0 },
      { word: 'punctual', sound: 1 },
    ],
  },

  {
    id: 'j-y-zh', num: '04', title: 'Judge, Yellow, Vision', tagline: '/dʒ/ · /j/ · /ʒ/', book: 'Secs. 15.4-15.5',
    sounds: [S.j, S.y, S.zh],
    review: [
      { kind: 'sound', title: 'The voiced crunch', sound: S.j },
      { kind: 'sound', title: 'The glide', sound: S.y },
      { kind: 'sound', title: 'The soft buzz', sound: S.zh },
      contrastCard(S.j, S.y,
        '/dʒ/ blocks the air completely and releases with friction. /j/ never blocks anything — it slides straight into the vowel.',
        'major vs mayor · jello vs yellow · jet vs yet.'),
      contrastCard(S.j, S.zh,
        'Both are voiced and made in the same place. /dʒ/ STOPS first; /ʒ/ never stops — the air runs the whole time.',
        'pigeon vs vision · legion vs lesion.'),
      {
        kind: 'rule', title: 'Verb → noun: the /ʒ/ machine',
        body: 'A huge family of academic words swaps a /d/ or /z/ for /ʒ/ when it becomes a noun.',
        rows: [
          { head: 'verb /d/ → noun /ʒ/', items: 'explode → explosion · conclude → conclusion · invade → invasion · decide → decision · divide → division · collide → collision' },
          { head: 'verb /z/ → noun /ʒ/', items: 'seize → seizure · enclose → enclosure · expose → exposure · please → pleasure' },
          { head: 'but -ssion = /ʃ/', items: 'permit → permission · express → expression · possess → possession' },
        ],
      },
      {
        kind: 'rule', title: 'Add /j/ before <u>',
        body: 'After p, b, f, v, m, θ, k, g, h — and at the start of a word — <u>, <ew>, <eu> are pronounced /ju/.',
        rows: [{ head: 'say /ju/', items: 'fuel · pure · cute · music · menu · huge · future · computer · human · Europe' }],
        callout: 'Exception: beautiful still takes /j/, but blue, true and rule do not.',
      },
    ],
    pairs: [
      { a: 'major', b: 'mayor' }, { a: 'jello', b: 'yellow' }, { a: 'jet', b: 'yet' },
      { a: 'jam', b: 'yam' }, { a: 'juice', b: 'use' }, { a: 'Jew', b: 'you' },
      { a: 'pigeon', b: 'vision' }, { a: 'legion', b: 'lesion' }, { a: 'joke', b: 'yoke' },
      { a: 'version', b: 'virgin' }, { a: 'Asian', b: 'aging' }, { a: 'beige', b: 'bays' },
      { a: 'measure', b: 'major' }, { a: 'lunch', b: 'lunge' }, { a: 'rich', b: 'ridge' },
      { a: 'batch', b: 'badge' }, { a: 'search', b: 'surge' },
    ],
    sentences: [
      { a: 'He met the {major}.', b: 'He met the {mayor}.' },
      { a: "That's a good {joke}.", b: "That's a good {yoke}." },
      { a: 'Are they {Asian}?', b: 'Are they {aging}?' },
      { a: "I don't know about the {version}.", b: "I don't know about the {Virgin}." },
      { a: "I think they're {beige}.", b: "I think they're {bays}." },
      { a: 'Did you see her {lunch}?', b: 'Did you see her {lunge}?' },
      { a: 'He pointed at the {jello}.', b: 'He pointed at the {yellow}.' },
    ],
    sort: [
      { word: 'judge', sound: 0 }, { word: 'yellow', sound: 1 }, { word: 'measure', sound: 2 },
      { word: 'giant', sound: 0 }, { word: 'onion', sound: 1 }, { word: 'decision', sound: 2 },
      { word: 'knowledge', sound: 0 }, { word: 'computer', sound: 1 }, { word: 'garage', sound: 2 },
      { word: 'gradual', sound: 0 }, { word: 'million', sound: 1 }, { word: 'usual', sound: 2 },
      { word: 'religion', sound: 0 }, { word: 'Europe', sound: 1 }, { word: 'leisure', sound: 2 },
      { word: 'procedure', sound: 0 }, { word: 'familiar', sound: 1 }, { word: 'explosion', sound: 2 },
    ],
  },

  {
    id: 'finals', num: '05', title: 'Endings That Vanish', tagline: 'Final /ts dz/ vs /tʃ dʒ/', book: 'Sec. 15.6',
    sounds: [S.s, S.z, S.ch, S.j],
    review: [
      {
        kind: 'rule', title: 'Why endings are the hardest part',
        body: 'English piles consonants at the end of words. Most learners drop them, so plates, place and plays all collapse into one blurry word. The listener then loses the grammar: number, tense, and person all live in that final sound.',
        callout: 'Say the ending strongly. Then link it to the next word instead of cutting it off.',
      },
      {
        kind: 'rule', title: 'Two consonants, not one',
        rows: [
          { head: '/ts/ = t + s', items: 'plates · nights · courts · aids · rides' },
          { head: '/s/ alone', items: 'place · nice · course' },
          { head: '/dz/ = d + z', items: 'needs · roads · beads · lids · sides' },
          { head: '/z/ alone', items: 'knees · rows · bees · rise' },
        ],
        callout: 'plates = /pleɪts/ but place = /pleɪs/. The tongue taps the ridge first in /ts/.',
      },
      {
        kind: 'rule', title: 'And do not turn them into /tʃ/ or /dʒ/',
        rows: [
          { head: '/ts/ vs /tʃ/', items: 'cats vs catch · eats vs each · coats vs coach · mats vs match · Ritz vs rich' },
          { head: '/dz/ vs /dʒ/', items: 'heads vs hedge · raids vs rage · chains vs change · rains vs range' },
        ],
        callout: '/ts/ and /dz/ are two separate consonants in a row. /tʃ/ and /dʒ/ are ONE sound.',
      },
    ],
    pairs: [
      { a: 'plates', b: 'place' }, { a: 'nights', b: 'nice' }, { a: 'courts', b: 'course' },
      { a: 'sides', b: 'sighs' }, { a: 'needs', b: 'knees' }, { a: 'roads', b: 'rows' },
      { a: 'lids', b: 'Liz' }, { a: 'nudes', b: 'news' }, { a: 'beads', b: 'bees' },
      { a: 'rides', b: 'rise' }, { a: 'cats', b: 'catch' }, { a: 'eats', b: 'each' },
      { a: 'coats', b: 'coach' }, { a: 'mats', b: 'match' }, { a: 'Ritz', b: 'rich' },
      { a: 'heads', b: 'hedge' }, { a: 'raids', b: 'rage' }, { a: 'chains', b: 'change' },
      { a: 'rains', b: 'range' }, { a: 'pizzas', b: 'peaches' },
    ],
    sentences: [
      { a: 'Look at the {plates}.', b: 'Look at the {place}.' },
      { a: 'I like the {courts}.', b: 'I like the {course}.' },
      { a: 'Describe the {sides}.', b: 'Describe the {sighs}.' },
      { a: 'They crossed the {roads}.', b: 'They crossed the {rows}.' },
      { a: 'She collected the {beads}.', b: 'She collected the {bees}.' },
      { a: 'They discussed the {news}.', b: 'They discussed the {nudes}.' },
      { a: 'He mentioned the {cats}.', b: 'He mentioned the {catch}.' },
      { a: 'We talked about the {coats}.', b: 'We talked about the {coach}.' },
      { a: 'Show me the {mats}.', b: 'Show me the {match}.' },
      { a: 'Nobody noticed the {heads}.', b: 'Nobody noticed the {hedge}.' },
      { a: 'The report described the {raids}.', b: 'The report described the {rage}.' },
      { a: "I couldn't find the {chains}.", b: "I couldn't find the {change}." },
      { a: 'Everyone remembers the {rains}.', b: 'Everyone remembers the {range}.' },
    ],
    sort: [
      { word: 'plants', sound: 0 }, { word: 'plans', sound: 1 }, { word: 'watch', sound: 2 },
      { word: 'wage', sound: 3 }, { word: 'rights', sound: 0 }, { word: 'rides', sound: 1 },
      { word: 'reach', sound: 2 }, { word: 'ridge', sound: 3 }, { word: 'streets', sound: 0 },
      { word: 'seeds', sound: 1 }, { word: 'speech', sound: 2 }, { word: 'bridge', sound: 3 },
    ],
  },

  {
    id: 'f-v-b-w', num: '06', title: 'Lips and Teeth', tagline: '/f/ · /v/ · /b/ · /w/', book: 'Sec. 15.7',
    sounds: [S.f, S.v, S.b, S.w],
    review: [
      { kind: 'sound', title: 'Lip against teeth, no voice', sound: S.f },
      { kind: 'sound', title: 'Lip against teeth, with voice', sound: S.v },
      { kind: 'sound', title: 'Two lips, air stopped', sound: S.b },
      { kind: 'sound', title: 'Two lips, rounded and gliding', sound: S.w },
      contrastCard(S.f, S.v,
        'Identical mouth, opposite voicing. And the vowel before a final /v/ is noticeably LONGER: leave is longer than leaf.',
        'Look in a mirror: for /f/ and /v/ you must clearly see your two front teeth on your lower lip.'),
      contrastCard(S.v, S.b,
        'This is the classic Spanish-speaker trap. /v/ = teeth on lip, air flowing continuously. /b/ = both lips shut, air completely stopped, then popped.',
        'very / berry · vote / boat · marvel / marble · curve / curb.'),
      contrastCard(S.v, S.w,
        '/v/ uses the TEETH. /w/ never touches the teeth — the lips just round and glide.',
        'vest / west · veil / whale · vine / wine.'),
      {
        kind: 'rule', title: 'Verb /v/ → noun /f/',
        rows: [
          { head: 'verb ends /v/', items: 'to leave · to save · to prove · to have · to believe' },
          { head: 'noun / adj ends /f/', items: 'a leaf · safe · proof · half · belief' },
        ],
      },
    ],
    pairs: [
      { a: 'view', b: 'few' }, { a: 'van', b: 'fan' }, { a: 'vine', b: 'fine' },
      { a: 'service', b: 'surface' }, { a: 'of', b: 'off' }, { a: 'lived', b: 'lift' },
      { a: 'leave', b: 'leaf' }, { a: 'save', b: 'safe' }, { a: 'prove', b: 'proof' },
      { a: 'have', b: 'half' }, { a: 'believe', b: 'belief' }, { a: 'alive', b: 'a life' },
      { a: 'very', b: 'berry' }, { a: 'vote', b: 'boat' }, { a: 'vest', b: 'best' },
      { a: 'marvel', b: 'marble' }, { a: 'curve', b: 'curb' }, { a: 'calves', b: 'cabs' },
      { a: 'slob', b: 'Slav' }, { a: 'vest', b: 'west' }, { a: 'veil', b: 'whale' },
      { a: 'vine', b: 'wine' }, { a: 'verse', b: 'worse' }, { a: 'vent', b: 'went' },
    ],
    sentences: [
      { a: "I'd like a {view}.", b: "I'd like a {few}." },
      { a: 'A {van} would be nice to have.', b: 'A {fan} would be nice to have.' },
      { a: 'The {service} was pretty good.', b: 'The {surface} was pretty good.' },
      { a: 'They {lived} over there.', b: 'They {lift} over there.' },
      { a: 'They saw the {veil}.', b: 'They saw the {whale}.' },
      { a: 'He looked at the {wine}.', b: 'He looked at the {vine}.' },
      { a: "I think it's the {vest}.", b: "I think it's the {west}." },
      { a: 'The accident was on the {curve}.', b: 'The accident was on the {curb}.' },
      { a: "It's a {marvel}.", b: "It's a {marble}." },
      { a: 'Two {calves} were in the road.', b: 'Two {cabs} were in the road.' },
    ],
    sort: [
      { word: 'photograph', sound: 0 }, { word: 'arrive', sound: 1 }, { word: 'habit', sound: 2 },
      { word: 'twenty', sound: 3 }, { word: 'enough', sound: 0 }, { word: 'solve', sound: 1 },
      { word: 'rubber', sound: 2 }, { word: 'language', sound: 3 }, { word: 'telephone', sound: 0 },
      { word: 'seven', sound: 1 }, { word: 'become', sound: 2 }, { word: 'squeeze', sound: 3 },
      { word: 'laugh', sound: 0 }, { word: 'vacation', sound: 1 }, { word: 'blueberry', sound: 2 },
      { word: 'persuade', sound: 3 },
    ],
  },

  {
    id: 'h', num: '07', title: 'The Breath', tagline: '/h/ or nothing at all', book: 'Sec. 15.8',
    sounds: [S.h, S.zero],
    review: [
      { kind: 'sound', title: 'The breath', sound: S.h },
      { kind: 'sound', title: 'Silence', sound: S.zero },
      contrastCard(S.h, S.zero,
        'Dropping /h/ turns hate into ate and heart into art. Adding one where it does not belong is just as confusing.',
        'Breathe in, then let the air out slowly and softly, and start the vowel while it is still flowing.'),
      {
        kind: 'rule', title: 'When <h> is silent',
        rows: [
          { head: 'always silent', items: 'hour · honest · honor · herb · heir' },
          { head: 'inside the word', items: 'exhaust · exhibit · ghost · rhythm · vehicle' },
          { head: 'unstressed syllables', items: 'Graham · Buckingham · Amherst' },
          { head: 'weak function words', items: 'tell him · ask her · what have you done' },
        ],
        callout: 'But you DO pronounce it in hotel, horrible, history, behave, inherit, perhaps, alcoholic.',
      },
      {
        kind: 'rule', title: 'Link instead of stopping',
        body: 'When a word starts with a vowel, glue it onto the word before. Americans use a glottal stop only for strong emphasis.',
        rows: [{ head: 'link it', items: 'an hour → a-nour · his art → hi-zart · they armed → they-yarmed' }],
      },
    ],
    pairs: [
      { a: 'hate', b: 'ate' }, { a: 'hungry', b: 'angry' }, { a: 'Haiti', b: 'eighty' },
      { a: 'heart', b: 'art' }, { a: 'heating', b: 'eating' }, { a: 'hedge', b: 'edge' },
      { a: 'hair', b: 'air' }, { a: 'harmed', b: 'armed' }, { a: 'high', b: 'eye' },
      { a: 'hill', b: 'ill' }, { a: 'hold', b: 'old' }, { a: 'hear', b: 'ear' },
      { a: 'heat', b: 'eat' }, { a: 'hand', b: 'and' }, { a: 'hall', b: 'all' },
      { a: 'his', b: 'is' },
    ],
    sentences: [
      { a: 'I {hate} it.', b: 'I {ate} it.' },
      { a: 'Are you {hungry}?', b: 'Are you {angry}?' },
      { a: '{Haiti} would be fine.', b: '{Eighty} would be fine.' },
      { a: "His {heart} isn't very good.", b: "His {art} isn't very good." },
      { a: "She's {heating} her supper.", b: "She's {eating} her supper." },
      { a: "Don't go too near the {hedge}.", b: "Don't go too near the {edge}." },
      { a: 'He needs more {hair}.', b: 'He needs more {air}.' },
      { a: 'They {harmed} the soldier.', b: 'They {armed} the soldier.' },
    ],
    sort: [
      { word: 'horrible', sound: 0 }, { word: 'hour', sound: 1 }, { word: 'humid', sound: 0 },
      { word: 'honest', sound: 1 }, { word: 'behave', sound: 0 }, { word: 'ghost', sound: 1 },
      { word: 'perhaps', sound: 0 }, { word: 'heir', sound: 1 }, { word: 'history', sound: 0 },
      { word: 'exhibit', sound: 1 }, { word: 'hotel', sound: 0 }, { word: 'rhythm', sound: 1 },
      { word: 'inherit', sound: 0 }, { word: 'vehicle', sound: 1 }, { word: 'alcoholic', sound: 0 },
      { word: 'honor', sound: 1 },
    ],
  },

  {
    id: 'r-l', num: '08', title: 'Never Touch, Always Touch', tagline: '/r/ vs /l/', book: 'Sec. 15.9',
    sounds: [S.r, S.l],
    review: [
      { kind: 'sound', title: 'The one that never touches', sound: S.r },
      { kind: 'sound', title: 'The one that always touches', sound: S.l },
      contrastCard(S.r, S.l,
        'The whole difference is one question: does the tongue tip TOUCH the roof of your mouth? For /l/ yes, firmly. For /r/ no, never — and the lips round a little.',
        'Say a long vowel /ɚ/ (as in "her") then speed it up: that is /r/. Now press the tip up: that is /l/.'),
      {
        kind: 'rule', title: 'They hide in the middle of words too',
        rows: [
          { head: 'medial contrast', items: 'dairy / daily · corrected / collected · pirate / pilot · sorry / Sally · arrive / alive' },
          { head: 'after a vowel', items: 'over / oval · tower / towel · shutter / shuttle · litter / little · batter / battle' },
        ],
      },
      {
        kind: 'rule', title: 'Silent <l>, and the long ending',
        body: 'After /ɔ/ and before a consonant, <l> disappears.',
        rows: [
          { head: 'silent', items: 'talk · walk · chalk · should · would · folk · half · calm · palm' },
          { head: 'takes two beats', items: 'girl · world · pearl · hurl · curled' },
        ],
        callout: 'Final /l/ is long. When a vowel follows, link it: he\'ll_ask, fail_it, apple_is.',
      },
    ],
    pairs: [
      { a: 'red', b: 'lead' }, { a: 'rock', b: 'lock' }, { a: 'reading', b: 'leading' },
      { a: 'rake', b: 'lake' }, { a: 'right', b: 'light' }, { a: 'dairy', b: 'daily' },
      { a: 'corrected', b: 'collected' }, { a: 'pirate', b: 'pilot' }, { a: 'sorry', b: 'Sally' },
      { a: 'arrive', b: 'alive' }, { a: 'over', b: 'oval' }, { a: 'tower', b: 'towel' },
      { a: 'shutter', b: 'shuttle' }, { a: 'litter', b: 'little' }, { a: 'finer', b: 'final' },
      { a: 'batter', b: 'battle' }, { a: 'murder', b: 'Myrtle' }, { a: 'breed', b: 'bleed' },
      { a: 'grow', b: 'glow' }, { a: 'crowd', b: 'cloud' }, { a: 'pray', b: 'play' },
      { a: 'fry', b: 'fly' }, { a: 'war', b: 'wall' }, { a: 'fear', b: 'feel' },
    ],
    sentences: [
      { a: 'She bought a {red} pencil.', b: 'She bought a {lead} pencil.' },
      { a: "That's a big {rock}.", b: "That's a big {lock}." },
      { a: "He's {reading} them.", b: "He's {leading} them." },
      { a: 'Is it {right} now?', b: 'Is it {light} now?' },
      { a: "It's a {dairy} truck.", b: "It's a {daily} truck." },
      { a: 'Have you {corrected} the papers?', b: 'Have you {collected} the papers?' },
      { a: "He's a dangerous {pirate}.", b: "He's a dangerous {pilot}." },
      { a: 'The {shutter} needs to be fixed.', b: 'The {shuttle} needs to be fixed.' },
      { a: "I think they're {litter} bugs.", b: "I think they're {little} bugs." },
      { a: 'They finished the {batter}.', b: 'They finished the {battle}.' },
      { a: 'Will they {breed}?', b: 'Will they {bleed}?' },
      { a: "They don't like the new {war}.", b: "They don't like the new {wall}." },
    ],
    sort: [
      { word: 'write', sound: 0 }, { word: 'yellow', sound: 1 }, { word: 'rhythm', sound: 0 },
      { word: 'ability', sound: 1 }, { word: 'carry', sound: 0 }, { word: 'splash', sound: 1 },
      { word: 'wrong', sound: 0 }, { word: 'relate', sound: 1 }, { word: 'zero', sound: 0 },
      { word: 'told', sound: 1 }, { word: 'wrist', sound: 0 }, { word: 'ball', sound: 1 },
      { word: 'arrive', sound: 0 }, { word: 'fool', sound: 1 },
    ],
  },

  {
    id: 'nasals', num: '09', title: 'Through the Nose', tagline: 'Final /m/ · /n/ · /ŋ/', book: 'Sec. 15.10',
    sounds: [S.m, S.n, S.ng],
    review: [
      { kind: 'sound', title: 'Lips', sound: S.m },
      { kind: 'sound', title: 'Tip', sound: S.n },
      { kind: 'sound', title: 'Back', sound: S.ng },
      {
        kind: 'rule', title: 'Three positions, one airstream',
        body: 'All three send the sound out through the nose. Only the blocking point in the mouth changes — front, middle, back.',
        rows: [
          { head: '/m/ front', items: 'some · rum · Kim · dumb · clams' },
          { head: '/n/ middle', items: 'son · run · kin · done · clans' },
          { head: '/ŋ/ back', items: 'sung · rung · king · dung · clangs' },
        ],
        callout: 'In the mirror /p b m/ look identical, and so do /t d n/ and /k g ŋ/. Feel the position instead of watching it.',
      },
      {
        kind: 'rule', title: 'Hold them, do not chop them',
        body: 'Final nasals are LONG. Cutting them with a glottal stop is what makes them disappear. Link them to the next word.',
        rows: [{ head: 'link', items: 'some_apples · sun_is · long_hour · time_out' }],
        callout: 'Informal -ing is often just /ɪn/ ("goin\' home") — but in stressed syllables keep /m n ŋ/ distinct.',
      },
    ],
    pairs: [
      { a: 'simmer', b: 'sinner' }, { a: 'sinner', b: 'singer' }, { a: 'some', b: 'son' },
      { a: 'son', b: 'sung' }, { a: 'them', b: 'thin' }, { a: 'thin', b: 'thing' },
      { a: 'rum', b: 'run' }, { a: 'run', b: 'rung' }, { a: 'Kim', b: 'kin' },
      { a: 'kin', b: 'king' }, { a: 'dumb', b: 'done' }, { a: 'done', b: 'dung' },
      { a: 'clams', b: 'clans' }, { a: 'clans', b: 'clangs' }, { a: 'lawn', b: 'long' },
      { a: 'banned', b: 'banged' }, { a: 'sin', b: 'sing' }, { a: 'ban', b: 'bang' },
      { a: 'sun', b: 'sung' }, { a: 'win', b: 'wing' },
    ],
    sentences: [
      { a: 'He heard the {sinner}.', b: 'He heard the {singer}.' },
      { a: 'It sounded like {some}.', b: 'It sounded like {son}.' },
      { a: "It's {them} I know.", b: "It's {thin} I know." },
      { a: 'They have {rum}.', b: 'They have {run}.' },
      { a: "He's our {Kim}.", b: "He's our {king}." },
      { a: "It's really {dumb}.", b: "It's really {done}." },
      { a: 'The {clams} were big.', b: 'The {clans} were big.' },
      { a: 'I heard the {clangs}.', b: 'I heard the {clans}.' },
      { a: 'They {banned} it.', b: 'They {banged} it.' },
    ],
    sort: [
      { word: 'autumn', sound: 0 }, { word: 'gone', sound: 1 }, { word: 'think', sound: 2 },
      { word: 'climb', sound: 0 }, { word: 'know', sound: 1 }, { word: 'finger', sound: 2 },
      { word: 'summer', sound: 0 }, { word: 'dinner', sound: 1 }, { word: 'uncle', sound: 2 },
      { word: 'comb', sound: 0 }, { word: 'nine', sound: 1 }, { word: 'bank', sound: 2 },
    ],
  },
];

/* ============================================================================
   4. FINAL EXAM  (Chapter 15 review test, p. 218)
   ========================================================================== */

const EXAM_A: ExamItem[] = [
  { frame: 'I saw her ___.', options: ['then', 'den'] },
  { frame: '___ will be coming soon.', options: ['They', 'Day'] },
  { frame: "Where's the ___?", options: ['leather', 'letter'] },
  { frame: 'We need to ___ them.', options: ['clothe', 'close'] },
  { frame: 'Are those ___?', options: ['threes', 'trees'] },
  { frame: 'You need a ___.', options: ['bath', 'bat'] },
  { frame: 'She ___ a lot.', options: ['thought', 'taught', 'sought'] },
  { frame: "She's ___ quickly.", options: ['thinking', 'sinking'] },
  { frame: 'Is that his ___?', options: ['mouth', 'mouse'] },
  { frame: 'Give me my ___.', options: ['chair', 'share'] },
  { frame: 'Three ___ is enough.', options: ['chips', 'ships'] },
  { frame: 'You should ___ it carefully.', options: ['watch', 'wash'] },
  { frame: "He's sitting on my ___!", options: ['porch', 'Porsche'] },
  { frame: 'His ___ is too short.', options: ['lease', 'leash'] },
  { frame: 'Did you find the ___?', options: ['seat', 'sheet'] },
  { frame: "That's a good ___.", options: ['yoke', 'joke'] },
  { frame: 'Are they ___?', options: ['Asian', 'aging'] },
  { frame: "I don't know about the ___.", options: ['version', 'Virgin'] },
  { frame: "I think they're ___.", options: ['beige', 'bays'] },
  { frame: 'The ___ caused problems.', options: ['range', 'rains'] },
];

const EXAM_B: ExamItem[] = [
  { frame: "I think it's the ___.", options: ['vest', 'best', 'west'] },
  { frame: "He's a ___.", options: ['slob', 'Slav'] },
  { frame: 'The accident was on the ___.', options: ['curve', 'curb'] },
  { frame: 'Two ___ were in the road.', options: ['calves', 'cabs'] },
  { frame: "She's got ___.", options: ['to have it', 'a habit'] },
  { frame: "It's a ___.", options: ['marvel', 'marble'] },
  { frame: 'We really ___ them.', options: ['hate', 'ate'] },
  { frame: "Yes, it's ___.", options: ['right', 'light', 'white'] },
  { frame: "She hasn't ___ our homework.", options: ['corrected', 'collected'] },
  { frame: "The ___ isn't finished.", options: ['barrel', 'battle'] },
  { frame: 'Will they ___?', options: ['breed', 'bleed'] },
  { frame: "They don't like the new ___.", options: ['war', 'wall'] },
  { frame: 'I never ___ them.', options: ['fear', 'feel', 'feed'] },
  { frame: 'They left ___.', options: ['the litter', 'a little'] },
  { frame: "It's a wonderful ___.", options: ['shutter', 'shuttle', 'shadow'] },
  { frame: "He's our ___.", options: ['kin', 'king', 'Kim'] },
  { frame: 'He ___ a lot.', options: ['sins', 'sings'] },
  { frame: 'When did they ___ it?', options: ['ban', 'bang', 'bank'] },
  { frame: 'Did you say ___?', options: ['thin', 'thing', 'think'] },
  { frame: 'They have ___ already.', options: ['a son', 'sung', 'sunk'] },
];

/* ============================================================================
   5. UTILITIES
   ========================================================================== */

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T =>
  root.querySelector(sel) as T;

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const pick = <T>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

/** "What's the {price}?" -> plain sentence for speaking. */
const plain = (s: string): string => s.replace(/[{}]/g, '');

/** "What's the {price}?" -> "price" */
const target = (s: string): string => (s.match(/\{([^}]+)\}/) || ['', s])[1];

/** "What's the {price}?" -> HTML with the target marked. */
const markup = (s: string): string =>
  escapeHtml(s).replace(/\{([^}]+)\}/g, '<b class="tgt">$1</b>');

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

/* ============================================================================
   6. STATE
   ========================================================================== */

const SAVE_KEY = 'consonant-lab-v3';

const blankState = (): SaveState => ({
  version: 3,
  units: {},
  exam: { best: 0, taken: 0 },
  settings: { voiceURI: null, rate: 0.9, theme: 'auto' },
});

let state: SaveState = blankState();

function loadState(): void {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveState;
      if (parsed && parsed.version === 3) state = { ...blankState(), ...parsed };
    }
  } catch {
    /* storage blocked — run in memory */
  }
  for (const u of UNITS) if (!state.units[u.id]) state.units[u.id] = { reviewed: false, best: {} };
}

function saveState(): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

const PASS = 80;
const ACTIVITIES: Array<{ id: ActivityKind; name: string; blurb: string }> = [
  { id: 'pairs', name: 'Minimal Pairs', blurb: 'One word plays. Choose the one you heard.' },
  { id: 'samediff', name: 'Same or Different', blurb: 'Two words play. Decide if they match.' },
  { id: 'odd', name: 'Odd One Out', blurb: 'Three words play. Find the one that differs.' },
  { id: 'sentence', name: 'In Context', blurb: 'A full sentence plays. Choose the word used.' },
  { id: 'sort', name: 'Spelling to Sound', blurb: 'Decide which sound the spelling makes.' },
];

const unitScore = (u: Unit): number => {
  const p = state.units[u.id];
  const vals = ACTIVITIES.map((a) => p.best[a.id] || 0);
  return Math.round(vals.reduce((x, y) => x + y, 0) / ACTIVITIES.length);
};
const unitMastered = (u: Unit): boolean =>
  ACTIVITIES.every((a) => (state.units[u.id].best[a.id] || 0) >= PASS);

/* ============================================================================
   7. AUDIO ENGINE
   ========================================================================== */

class Speaker {
  private voices: SpeechSynthesisVoice[] = [];
  private ready = false;
  readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  onchange: (() => void) | null = null;

  init(): void {
    if (!this.supported) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
      if (this.voices.length) {
        this.ready = true;
        if (!state.settings.voiceURI || !this.voices.some((v) => v.voiceURI === state.settings.voiceURI)) {
          state.settings.voiceURI = this.preferred().voiceURI;
        }
        this.onchange?.();
      }
    };
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
    // Safari sometimes never fires the event.
    setTimeout(load, 400);
    setTimeout(load, 1200);
  }

  private preferred(): SpeechSynthesisVoice {
    const score = (v: SpeechSynthesisVoice) => {
      let s = 0;
      if (/en[-_]US/i.test(v.lang)) s += 4;
      else if (/en[-_](GB|CA|AU)/i.test(v.lang)) s += 2;
      if (v.localService) s += 2;
      if (/samantha|google us|aria|jenny|zira|alex|daniel/i.test(v.name)) s += 3;
      return s;
    };
    return this.voices.slice().sort((a, b) => score(b) - score(a))[0];
  }

  list(): SpeechSynthesisVoice[] {
    return this.voices;
  }
  get available(): boolean {
    return this.ready && this.voices.length > 0;
  }

  stop(): void {
    if (this.supported) speechSynthesis.cancel();
  }

  say(text: string, rate = state.settings.rate): Promise<void> {
    return new Promise((resolve) => {
      if (!this.supported) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      const v = this.voices.find((x) => x.voiceURI === state.settings.voiceURI);
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      }
      u.rate = rate;
      u.pitch = 1;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      u.onend = finish;
      u.onerror = finish;
      // Watchdog: some engines silently drop short utterances.
      setTimeout(finish, Math.max(1600, text.length * 110));
      speechSynthesis.speak(u);
    });
  }

  async sequence(items: string[], gapMs = 520, rate?: number): Promise<void> {
    for (let i = 0; i < items.length; i++) {
      await this.say(items[i], rate);
      if (i < items.length - 1) await new Promise((r) => setTimeout(r, gapMs));
    }
  }
}

const speaker = new Speaker();

/* ============================================================================
   8. QUESTION GENERATION
   ========================================================================== */

const QUESTIONS_PER_SET = 10;

function buildQuestions(unit: Unit, kind: ActivityKind): Question[] {
  switch (kind) {
    case 'pairs':
      return pick(unit.pairs, QUESTIONS_PER_SET).map((p) => {
        const opts = shuffle([p.a, p.b]);
        const heard = opts[Math.floor(Math.random() * 2)];
        return {
          kind, audio: [heard], prompt: 'Which word did you hear?',
          options: opts, answer: opts.indexOf(heard),
          note: `${p.a} / ${p.b}`,
        };
      });

    case 'samediff':
      return pick(unit.pairs, QUESTIONS_PER_SET).map((p) => {
        const same = Math.random() < 0.5;
        const first = Math.random() < 0.5 ? p.a : p.b;
        const second = same ? first : first === p.a ? p.b : p.a;
        return {
          kind, audio: [first, second], prompt: 'Are the two words the same or different?',
          options: ['Same', 'Different'], answer: same ? 0 : 1,
          note: `You heard: ${first} — ${second}`,
        };
      });

    case 'odd':
      return pick(unit.pairs, QUESTIONS_PER_SET).map((p) => {
        const twin = Math.random() < 0.5 ? p.a : p.b;
        const odd = twin === p.a ? p.b : p.a;
        const slot = Math.floor(Math.random() * 3);
        const words = [twin, twin, twin];
        words[slot] = odd;
        return {
          kind, audio: words, prompt: 'Which one is different?',
          options: ['First', 'Second', 'Third'], answer: slot,
          note: `${words.join(' · ')}`,
        };
      });

    case 'sentence':
      return pick(unit.sentences, Math.min(QUESTIONS_PER_SET, unit.sentences.length)).map((sp) => {
        const useA = Math.random() < 0.5;
        const said = useA ? sp.a : sp.b;
        const opts = shuffle([target(sp.a), target(sp.b)]);
        return {
          kind, audio: [plain(said)], prompt: 'Which word was in the sentence?',
          options: opts, answer: opts.indexOf(target(said)),
          note: markup(said),
        };
      });

    case 'sort':
      return pick(unit.sort, Math.min(QUESTIONS_PER_SET, unit.sort.length)).map((item) => ({
        kind, audio: [item.word],
        prompt: `Which sound does the underlined spelling make in <b class="tgt">${escapeHtml(item.word)}</b>?`,
        options: unit.sounds.map((s) => s.ipa),
        answer: item.sound,
        note: `${item.word} → ${unit.sounds[item.sound].ipa}`,
      }));
  }
}

function buildExam(): Question[] {
  return [...EXAM_A, ...EXAM_B].map((item) => {
    const heard = item.options[Math.floor(Math.random() * item.options.length)];
    const opts = shuffle(item.options);
    return {
      kind: 'sentence',
      audio: [item.frame.replace('___', heard)],
      prompt: 'Circle the word you hear.',
      options: opts,
      answer: opts.indexOf(heard),
      note: escapeHtml(item.frame.replace('___', heard)),
    };
  });
}

/* ============================================================================
   9. VIEWS
   ========================================================================== */

const app = () => $('#view');
let escapeHandler: ((e: KeyboardEvent) => void) | null = null;

function setView(html: string): void {
  speaker.stop();
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }
  const v = app();
  v.innerHTML = html;
  v.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  $('#main').focus({ preventScroll: true });
}

/* ---------- Home / study plan ---------- */

function viewHome(): void {
  const doneCount = UNITS.filter(unitMastered).length;
  const overall = Math.round(UNITS.reduce((s, u) => s + unitScore(u), 0) / UNITS.length);
  const examUnlocked = doneCount >= 5;

  const cards = UNITS.map((u, i) => {
    const p = state.units[u.id];
    const score = unitScore(u);
    const done = unitMastered(u);
    const status = done ? 'mastered' : p.reviewed ? 'in-progress' : 'new';
    const statusLabel = done ? 'Mastered' : p.reviewed ? 'In progress' : 'Not started';
    return `
    <article class="unit ${status}" style="--i:${i}">
      <div class="unit-top">
        <span class="unit-num">${u.num}</span>
        <span class="chip chip-${status}">${statusLabel}</span>
      </div>
      <h3>${escapeHtml(u.title)}</h3>
      <p class="unit-tag">${escapeHtml(u.tagline)}</p>
      <div class="ipa-row">${u.sounds
        .map((s) => `<span class="ipa v-${s.voicing}">${s.ipa}</span>`)
        .join('')}</div>
      <div class="meter" role="img" aria-label="Progress ${score} percent">
        <span style="width:${score}%"></span>
      </div>
      <div class="unit-foot">
        <span class="pct">${score}%</span>
        <span class="src">${u.book}</span>
      </div>
      <div class="unit-actions">
        <button class="btn btn-ghost" data-go="review" data-unit="${u.id}">Study</button>
        <button class="btn btn-solid" data-go="drills" data-unit="${u.id}"
                ${p.reviewed ? '' : `disabled aria-describedby="lock-${u.id}"`}>Drill</button>
      </div>
      ${p.reviewed ? '' : `<p class="lock" id="lock-${u.id}">Finish the study cards to unlock the drills.</p>`}
    </article>`;
  }).join('');

  setView(`
    <header class="hero">
      <p class="eyebrow">Accurate English · Chapter 15 · Consonants in Detail</p>
      <h1>The Consonant<br><em>Lab</em></h1>
      <p class="lede">${UNITS.length} units. Study the key information first, then prove you can hear
      the difference. Every drill plays real audio &mdash; you decide what was said.</p>
      <div class="stats">
        <div><strong>${doneCount}<span>/${UNITS.length}</span></strong><span class="stat-l">units mastered</span></div>
        <div><strong>${overall}<span>%</span></strong><span class="stat-l">overall accuracy</span></div>
        <div><strong>${state.exam.best}<span>%</span></strong><span class="stat-l">best exam score</span></div>
      </div>
    </header>

    <section class="how">
      <h2 class="rule-h">How this works</h2>
      <ol class="steps">
        <li><span>1</span><b>Study</b><p>Short cards: what the sound is, how your mouth makes it, and which spellings hide it. No test, no pressure.</p></li>
        <li><span>2</span><b>Drill</b><p>Five listening activities per unit. You must identify the sound correctly &mdash; ${PASS}% to clear each one.</p></li>
        <li><span>3</span><b>Exam</b><p>Forty items from the chapter review. Unlocks after five units are mastered.</p></li>
      </ol>
    </section>

    <section>
      <h2 class="rule-h">Study plan</h2>
      <div class="grid">${cards}</div>
    </section>

    <section class="exam-band ${examUnlocked ? '' : 'locked'}">
      <div>
        <p class="eyebrow">Final assessment</p>
        <h2>Chapter 15 Listening Exam</h2>
        <p class="lede sm">Forty sentences from the end-of-chapter review. Circle the word you hear.
        ${state.exam.taken ? `Taken ${state.exam.taken}&times; · best ${state.exam.best}%.` : ''}</p>
      </div>
      <button class="btn btn-solid lg" data-go="exam" ${examUnlocked ? '' : 'disabled'}>
        ${examUnlocked ? 'Start the exam' : `Master ${5 - doneCount} more unit${5 - doneCount === 1 ? '' : 's'}`}
      </button>
    </section>
  `);
}

/* ---------- Review ---------- */

function viewReview(unit: Unit, idx = 0): void {
  const cards = unit.review;
  const card = cards[idx];
  const last = idx === cards.length - 1;

  let body = '';
  if (card.kind === 'sound' && card.sound) {
    const s = card.sound;
    body = `
      <div class="sound-hero">
        <button class="ipa-big v-${s.voicing}" data-say="${escapeHtml(s.spellings[0].examples.split(',')[0].trim())}"
                aria-label="Play an example of ${escapeHtml(s.label)}">
          ${s.ipa}<span class="play-dot" aria-hidden="true"></span>
        </button>
        <div>
          <p class="sound-name">${escapeHtml(s.label)}</p>
          <ul class="tags">
            <li class="v-${s.voicing}">${s.voicing === 'none' ? 'no consonant' : s.voicing}</li>
            <li>${s.manner}</li>
            <li>${s.place}</li>
          </ul>
        </div>
      </div>
      <p class="howto"><b>How to make it.</b> ${escapeHtml(s.howTo)}</p>
      <table class="spell">
        <caption>Spellings that produce ${s.ipa}</caption>
        <tbody>${s.spellings.map((sp) => `
          <tr>
            <th scope="row">${escapeHtml(sp.pattern)}${sp.note ? `<em>${escapeHtml(sp.note)}</em>` : ''}</th>
            <td>${escapeHtml(sp.examples)}
              <button class="mini" data-say="${escapeHtml(sp.examples.replace(/,/g, ', '))}"
                      aria-label="Play the examples for ${escapeHtml(sp.pattern)}">play</button></td>
          </tr>`).join('')}</tbody>
      </table>`;
  } else {
    body = `
      ${card.body ? `<p class="howto">${escapeHtml(card.body)}</p>` : ''}
      ${card.rows ? `<table class="spell"><tbody>${card.rows.map((r) => `
        <tr><th scope="row">${escapeHtml(r.head)}</th>
        <td>${escapeHtml(r.items)}
          <button class="mini" data-say="${escapeHtml(r.items.replace(/[·]/g, ','))}"
                  aria-label="Play these examples">play</button></td></tr>`).join('')}</tbody></table>` : ''}
      ${card.callout ? `<p class="callout">${escapeHtml(card.callout)}</p>` : ''}`;
  }

  setView(`
    <div class="stack">
      <nav class="crumb"><button class="link" data-go="home">&larr; Study plan</button>
        <span>Unit ${unit.num} &middot; ${escapeHtml(unit.title)}</span></nav>

      <div class="progress-dots" role="group" aria-label="Study card ${idx + 1} of ${cards.length}">
        ${cards.map((_, i) => `<span class="${i === idx ? 'on' : i < idx ? 'past' : ''}"></span>`).join('')}
      </div>
    </div>

    <article class="card review-card" key="${idx}">
      <p class="eyebrow">${card.kind === 'sound' ? 'The sound' : card.kind === 'contrast' ? 'The contrast' : 'Key rule'}</p>
      <h2>${escapeHtml(card.title)}</h2>
      ${body}
    </article>

    <div class="pager">
      <button class="btn btn-ghost" data-review="${idx - 1}" ${idx === 0 ? 'disabled' : ''}>Back</button>
      <span class="pager-count">${idx + 1} / ${cards.length}</span>
      ${last
        ? `<button class="btn btn-solid" data-finish-review="${unit.id}">I&rsquo;ve studied this &rarr;</button>`
        : `<button class="btn btn-solid" data-review="${idx + 1}">Next</button>`}
    </div>
  `);
  $('#view').dataset.unit = unit.id;
  $('#view').dataset.idx = String(idx);
}

/* ---------- Drill menu ---------- */

function viewDrills(unit: Unit): void {
  const p = state.units[unit.id];
  setView(`
    <nav class="crumb"><button class="link" data-go="home">&larr; Study plan</button>
      <span>Unit ${unit.num} &middot; ${escapeHtml(unit.title)}</span></nav>

    <header class="drill-head">
      <p class="eyebrow">${unit.book}</p>
      <h1>${escapeHtml(unit.title)}</h1>
      <div class="ipa-row lg">${unit.sounds.map((s) => `<span class="ipa v-${s.voicing}">${s.ipa}</span>`).join('')}</div>
      <button class="link" data-go="review" data-unit="${unit.id}">Re-read the study cards</button>
    </header>

    <div class="grid drills">
      ${ACTIVITIES.map((a, i) => {
        const best = p.best[a.id] || 0;
        const passed = best >= PASS;
        return `
        <article class="unit act ${passed ? 'mastered' : best ? 'in-progress' : 'new'}" style="--i:${i}">
          <div class="unit-top">
            <span class="unit-num">${String(i + 1).padStart(2, '0')}</span>
            ${passed ? '<span class="chip chip-mastered">Cleared</span>' : best ? `<span class="chip chip-in-progress">${best}%</span>` : ''}
          </div>
          <h3>${a.name}</h3>
          <p class="unit-tag">${a.blurb}</p>
          <div class="meter"><span style="width:${best}%"></span></div>
          <div class="unit-actions">
            <button class="btn ${passed ? 'btn-ghost' : 'btn-solid'}" data-run="${a.id}" data-unit="${unit.id}">
              ${best ? 'Try again' : 'Start'}
            </button>
          </div>
        </article>`;
      }).join('')}
    </div>
  `);
}

/* ---------- Quiz runner ---------- */

interface Session {
  questions: Question[];
  i: number;
  correct: number;
  answered: boolean;
  unit: Unit | null;
  activity: ActivityKind | 'exam';
  title: string;
}

let session: Session | null = null;

function startQuiz(unit: Unit | null, activity: ActivityKind | 'exam'): void {
  const questions = unit ? buildQuestions(unit, activity as ActivityKind) : buildExam();
  session = {
    questions, i: 0, correct: 0, answered: false, unit, activity,
    title: unit ? ACTIVITIES.find((a) => a.id === activity)!.name : 'Chapter 15 Listening Exam',
  };
  renderQuestion();
}

function renderQuestion(): void {
  if (!session) return;
  const { questions, i, unit, title } = session;
  const q = questions[i];
  const pct = Math.round((i / questions.length) * 100);

  setView(`
    <div class="stack">
      <nav class="crumb">
        <button class="link" data-go="${unit ? 'drills' : 'home'}" data-unit="${unit ? unit.id : ''}">&larr; Leave</button>
        <span>${escapeHtml(title)}</span>
      </nav>

      <div class="qbar"><span style="width:${pct}%"></span></div>
      <p class="qcount">Question ${i + 1} of ${questions.length}<span class="dot">&middot;</span>${session.correct} correct</p>
    </div>

    <section class="card quiz" aria-live="polite">
      <div class="player">
        <button class="playbtn" id="play" aria-label="Play the audio">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="wave" id="wave" aria-hidden="true">${'<i></i>'.repeat(9)}</div>
        <button class="mini slow" id="slow">Slower</button>
      </div>

      <p class="prompt">${q.prompt}</p>

      <div class="options" id="options" role="group">
        ${q.options.map((o, k) => `
          <button class="opt" data-pick="${k}">
            <kbd>${k + 1}</kbd><span>${escapeHtml(o)}</span>
          </button>`).join('')}
      </div>

      <div class="verdict" id="verdict" role="status" aria-live="assertive"></div>
    </section>

    <div class="pager"><span class="hint">Press <kbd>R</kbd> to replay &middot; <kbd>1</kbd>&ndash;<kbd>${q.options.length}</kbd> to answer</span></div>
  `);

  const play = (rate?: number) => {
    const wave = $('#wave');
    wave.classList.add('on');
    speaker.stop();
    const started = Date.now();
    // Hold the meter on briefly even if the engine returns instantly, so it
    // reads as "something played" instead of flickering.
    speaker.sequence(q.audio, 520, rate).then(() => {
      setTimeout(() => wave.classList.remove('on'), Math.max(0, 420 - (Date.now() - started)));
    });
  };

  $('#play').addEventListener('click', () => play());
  $('#slow').addEventListener('click', () => play(0.55));
  setTimeout(() => play(), 260);

  escapeHandler = (e: KeyboardEvent) => {
    // Once answered, the focused "Next" button handles Enter natively — adding
    // our own handler here would advance twice and skip a question.
    if (!session || session.answered) return;
    if (e.key.toLowerCase() === 'r') { play(); return; }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= q.options.length) answer(n - 1);
  };
  document.addEventListener('keydown', escapeHandler);

  $('#options').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-pick]') as HTMLElement | null;
    if (btn) answer(Number(btn.dataset.pick));
  });
}

function answer(choice: number): void {
  if (!session || session.answered) return;
  session.answered = true;
  const q = session.questions[session.i];
  const right = choice === q.answer;
  if (right) session.correct++;

  const opts = Array.from(document.querySelectorAll<HTMLElement>('.opt'));
  opts.forEach((el, k) => {
    el.setAttribute('disabled', 'true');
    if (k === q.answer) el.classList.add('right');
    if (k === choice && !right) el.classList.add('wrong');
  });

  $('#verdict').innerHTML = `
    <p class="${right ? 'ok' : 'no'}">
      <b>${right ? 'Correct' : 'Not quite'}</b>
      ${q.note ? `<span class="note">${q.note}</span>` : ''}
    </p>
    <button class="btn btn-solid" id="next">${session.i + 1 === session.questions.length ? 'See results' : 'Next question'} &rarr;</button>`;

  const next = $('#next');
  next.addEventListener('click', advance);
  next.focus();
}

function advance(): void {
  if (!session) return;
  session.i++;
  session.answered = false;
  if (session.i >= session.questions.length) finishQuiz();
  else renderQuestion();
}

function finishQuiz(): void {
  if (!session) return;
  const { correct, questions, unit, activity, title } = session;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= PASS;

  if (unit) {
    const prev = state.units[unit.id].best[activity] || 0;
    if (score > prev) state.units[unit.id].best[activity] = score;
  } else {
    state.exam.taken++;
    if (score > state.exam.best) state.exam.best = score;
  }
  saveState();

  const mastered = unit ? unitMastered(unit) : false;

  setView(`
    <section class="card result ${passed ? 'pass' : 'fail'}">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="score" role="img" aria-label="Score ${score} percent">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" class="track"/>
          <circle cx="60" cy="60" r="52" class="fill" style="--dash:${(score / 100) * 327}"/>
        </svg>
        <strong>${score}<i>%</i></strong>
      </div>
      <h2>${passed ? 'Cleared.' : 'Keep going.'}</h2>
      <p class="lede sm">${correct} of ${questions.length} correct.
        ${passed
          ? mastered
            ? `Unit ${unit!.num} is fully mastered.`
            : unit ? 'On to the next activity.' : 'Strong finish.'
          : `You need ${PASS}% to clear this one. Replay the study cards and try again &mdash; the questions reshuffle every time.`}</p>
      <div class="pager center">
        ${unit ? `<button class="btn btn-ghost" data-go="review" data-unit="${unit.id}">Study cards</button>
                  <button class="btn btn-ghost" data-run="${activity}" data-unit="${unit.id}">Retry</button>
                  <button class="btn btn-solid" data-go="drills" data-unit="${unit.id}">Back to drills</button>`
                : `<button class="btn btn-ghost" data-go="exam">Retake</button>
                   <button class="btn btn-solid" data-go="home">Study plan</button>`}
      </div>
    </section>
  `);
  session = null;
}

/* ============================================================================
   10. ROUTING + CHROME
   ========================================================================== */

const unitById = (id: string): Unit => UNITS.find((u) => u.id === id)!;

function route(go: string, unitId?: string): void {
  switch (go) {
    case 'home': viewHome(); break;
    case 'review': viewReview(unitById(unitId!), 0); break;
    case 'drills': viewDrills(unitById(unitId!)); break;
    case 'exam': startQuiz(null, 'exam'); break;
  }
}

function wireGlobalClicks(): void {
  document.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;

    const say = el.closest<HTMLElement>('[data-say]');
    if (say) {
      const wasOn = say.classList.contains('speaking');
      document.querySelectorAll('.speaking').forEach((n) => n.classList.remove('speaking'));
      speaker.stop();
      if (!wasOn) {
        say.classList.add('speaking');
        speaker.say(say.dataset.say!).then(() => say.classList.remove('speaking'));
      }
      return;
    }

    const go = el.closest<HTMLElement>('[data-go]');
    if (go && !go.hasAttribute('disabled')) {
      route(go.dataset.go!, go.dataset.unit || undefined);
      return;
    }

    const run = el.closest<HTMLElement>('[data-run]');
    if (run && !run.hasAttribute('disabled')) {
      startQuiz(unitById(run.dataset.unit!), run.dataset.run as ActivityKind);
      return;
    }

    const rev = el.closest<HTMLElement>('[data-review]');
    if (rev && !rev.hasAttribute('disabled')) {
      viewReview(unitById($('#view').dataset.unit!), Number(rev.dataset.review));
      return;
    }

    const fin = el.closest<HTMLElement>('[data-finish-review]');
    if (fin) {
      state.units[fin.dataset.finishReview!].reviewed = true;
      saveState();
      viewDrills(unitById(fin.dataset.finishReview!));
      return;
    }
  });
}

function wireSettings(): void {
  const rate = $<HTMLInputElement>('#rate');
  const rateOut = $('#rate-out');
  const voice = $<HTMLSelectElement>('#voice');
  const theme = $<HTMLButtonElement>('#theme');
  const panel = $('#settings');
  const toggle = $('#settings-toggle');

  rate.value = String(state.settings.rate);
  rateOut.textContent = `${state.settings.rate.toFixed(2)}×`;
  rate.addEventListener('input', () => {
    state.settings.rate = Number(rate.value);
    rateOut.textContent = `${state.settings.rate.toFixed(2)}×`;
    saveState();
  });

  const fillVoices = () => {
    const list = speaker.list();
    if (!list.length) {
      voice.innerHTML = '<option>No English voice found</option>';
      voice.disabled = true;
      $('#no-audio').hidden = false;
      return;
    }
    voice.disabled = false;
    $('#no-audio').hidden = true;
    voice.innerHTML = list
      .map((v) => `<option value="${escapeHtml(v.voiceURI)}" ${v.voiceURI === state.settings.voiceURI ? 'selected' : ''}>${escapeHtml(v.name)} — ${escapeHtml(v.lang)}</option>`)
      .join('');
  };
  speaker.onchange = fillVoices;
  fillVoices();

  voice.addEventListener('change', () => {
    state.settings.voiceURI = voice.value;
    saveState();
    speaker.say('This is the voice you will hear.');
  });

  $('#test').addEventListener('click', () => speaker.say('She sells sea shells. They think this. Very few voted.'));

  const applyTheme = () => {
    const t = state.settings.theme;
    if (t === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    theme.textContent = t === 'auto' ? 'Theme: Auto' : t === 'dark' ? 'Theme: Dark' : 'Theme: Light';
  };
  theme.addEventListener('click', () => {
    const order: Array<SaveState['settings']['theme']> = ['auto', 'dark', 'light'];
    state.settings.theme = order[(order.indexOf(state.settings.theme) + 1) % 3];
    applyTheme();
    saveState();
  });
  applyTheme();

  toggle.addEventListener('click', () => {
    const open = panel.hasAttribute('hidden');
    if (open) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', String(open));
  });

  $('#reset').addEventListener('click', () => {
    if (!confirm('Erase all progress on this device? This cannot be undone.')) return;
    state = blankState();
    loadState();
    saveState();
    viewHome();
  });
}

function boot(): void {
  loadState();
  speaker.init();
  wireGlobalClicks();
  wireSettings();
  viewHome();
  if (!speaker.supported) $('#no-audio').hidden = false;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
