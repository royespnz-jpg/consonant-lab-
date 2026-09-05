"use strict";
/**
 * THE CONSONANT LAB
 * Listening & pronunciation practice built on Chapter 15, "Consonants in Detail"
 * (Dauer, Accurate English, pp. 164-218).
 *
 * Scope: /s z/ · /θ ð/ · /ʃ tʃ/ · final /ts dz/ vs /s z/ vs /tʃ dʒ/ · final /m n ŋ/
 *
 * Flow: STUDY (rules from the book) -> DRILL (identify what you hear) -> EXAM.
 * Audio: the device's own voices, or Kokoro-82M running locally in the browser.
 */
/* ============================================================================
   0. TEACHER SETUP  —  results reporting to a Google Sheet
   ==========================================================================

   Leave REPORT_URL empty and the app works exactly as before: progress stays
   in each student's browser and nothing is sent anywhere.

   To collect results in a Google Sheet:
     1. Open the Sheet -> Extensions -> Apps Script
     2. Paste the contents of Code.gs, save, run setUp() once
     3. Deploy -> New deployment -> Web app
          Execute as:      Me
          Who has access:  Anyone
     4. Copy the /exec URL it gives you and paste it between the quotes below
     5. Re-upload script.js (or rebuild from script.ts)

   Students are then asked for their name and section once, on first visit.
   ========================================================================== */
const REPORT_URL = 'https://script.google.com/macros/s/AKfycbxMXhykrtVCQ6YXqU3AgOslmAgBNyt5a4QxU0t6P-TFmlrhkQamfIOccCLEnnqrzOMu/exec';
/* ============================================================================
   2. SOUND PROFILES
   ========================================================================== */
const S = {
    s: {
        ipa: '/s/', label: 'ess', voicing: 'voiceless', manner: 'fricative', place: 'alveolar',
        howTo: 'Force air through a very narrow channel between the front of the tongue and the tooth ridge. Lips spread. Strong, high-pitched hiss, and the throat stays silent.',
        spellings: [
            { pattern: '<s>', examples: 'see, smile, yes, us, this, its, hopes' },
            { pattern: '<ss>', examples: 'class, discuss, necessary' },
            { pattern: '<c>', note: 'before i, e, y', examples: 'city, recent, face, cycle' },
            { pattern: '<sc>', note: 'before i, e', examples: 'science, scenery, descend' },
            { pattern: '<se>', note: 'after a consonant', examples: 'sense, course, false, collapse' },
            { pattern: '<se>', note: 'after a vowel', examples: 'house, cease, loose, used to, precise, promise' },
            { pattern: '<x>', note: '= /ks/', examples: 'six, taxi, exercise, expect' },
            { pattern: 'exceptions', examples: 'waltz, pretzel, pizza /ˈpitsə/' },
        ],
    },
    z: {
        ipa: '/z/', label: 'zee', voicing: 'voiced', manner: 'fricative', place: 'alveolar',
        howTo: 'Exactly the same channel as /s/, but voiced — and the friction noise is WEAKER than /s/, not stronger. Touch your throat: it must buzz.',
        spellings: [
            { pattern: '<z>', examples: 'zoo, crazy, frozen, quiz, breeze' },
            { pattern: '<zz>', examples: 'buzz, fuzzy, blizzard' },
            { pattern: '<s>', note: 'between vowels', examples: 'easy, reason, disease, music' },
            { pattern: '<se>', note: 'after a vowel', examples: 'these, cause, to lose, to use' },
            { pattern: '<-s, -es>', note: 'ending', examples: 'plays, windows, tries, goes, does, dogs, comes, rides' },
            { pattern: '<s>', note: 'function words', examples: 'is, was, has, his, as, always' },
            { pattern: '<ism>', note: '= /ɪzəm/', examples: 'communism, baptism' },
            { pattern: '<x>', note: '= /gz/ before a stressed vowel', examples: 'example, exist, exam, exact' },
            { pattern: 'exceptions', examples: 'dessert /dɪˈzɚt/, scissors, possess, dissolve, Xerox /ˈzɪrɑks/' },
        ],
    },
    th: {
        ipa: '/θ/', label: 'voiceless th', voicing: 'voiceless', manner: 'fricative', place: 'dental',
        howTo: 'Tongue TIP lightly against the cutting edges of the upper front teeth, and blow. Do not stick your tongue out — in a mirror you should see just a little of it. The contact stays LOOSE so air keeps passing.',
        spellings: [
            { pattern: '<th>', note: 'start of content words', examples: 'think, thirsty, three, thumb, Thursday' },
            { pattern: '<th>', note: 'end of words', examples: 'mouth, breath, health, month, truth, south' },
            { pattern: '<th>', note: 'in the middle', examples: 'author, mathematics, birthday, healthy, wealthy, filthy' },
        ],
    },
    dh: {
        ipa: '/ð/', label: 'voiced th', voicing: 'voiced', manner: 'fricative', place: 'dental',
        howTo: 'Made exactly like /θ/ but voiced, and the air must KEEP FLOWING between tongue and teeth. It is a soft, weak sound — never a hard stop like /d/.',
        spellings: [
            { pattern: '<th>', note: 'start of function words', examples: 'the, they, this, that, these, those, though, thus' },
            { pattern: '<th>', note: 'between vowels', examples: 'mother, father, leather, weather, together, another' },
            { pattern: '<the>', note: 'end of words', examples: 'soothe, breathe, bathe, clothe, loathe, smooth' },
        ],
    },
    sh: {
        ipa: '/ʃ/', label: 'sh', voicing: 'voiceless', manner: 'fricative', place: 'post-alveolar',
        howTo: 'Press the front of the tongue toward the roof of the mouth a little FURTHER BACK than /s/, and round the lips slightly. The tongue is more relaxed and the hiss is lower-pitched and softer than /s/.',
        spellings: [
            { pattern: '<sh>', examples: 'she, should, fashion, brush, wish' },
            { pattern: '<ti>', note: 'unstressed endings', examples: 'station, condition, partial, initial, ambitious, patient' },
            { pattern: '<ci>', note: 'unstressed endings', examples: 'musician, suspicion, special, official, delicious, sufficient' },
            { pattern: '<ssi>', examples: 'permission, discussion, Russia' },
            { pattern: '<ch>', note: 'from French', examples: 'Chicago, machine, brochure, mustache' },
            { pattern: '<su>, <ssu>', examples: 'sugar, sure, assure, insurance, pressure, tissue, issue' },
            { pattern: '<si>', note: 'in -nsion, -lsion', examples: 'dimension, expansion, propulsion' },
            { pattern: '<xu>, <xi>', note: '= /kʃ/', examples: 'sexual, luxury, anxious, obnoxious' },
        ],
    },
    ch: {
        ipa: '/tʃ/', label: 'ch', voicing: 'voiceless', manner: 'affricate', place: 'post-alveolar',
        howTo: 'STOP the air completely first, then open up into /ʃ/. Stop plus hiss, welded into one sound — it cannot be held.',
        spellings: [
            { pattern: '<ch>', examples: 'church, purchase, teacher, which, much' },
            { pattern: '<tch>', examples: 'kitchen, watch, scratch' },
            { pattern: '<tu>', note: 'unstressed endings', examples: 'nature, picture, statue, fortune, actual, century, situation, punctuate' },
            { pattern: '<ti>', note: 'after <s>', examples: 'question, suggestion, Christian' },
            { pattern: '<ce>, <te>', examples: 'cello, concerto, amateur, righteous' },
        ],
    },
    ts: {
        ipa: '/ts/', label: 'final t + s', voicing: 'voiceless', manner: 'stop + fricative', place: 'alveolar',
        howTo: 'TWO consonants in a row. Stop the air completely for a short moment, then open into /s/. Not one sound — you must hear the tongue tap the ridge first.',
        spellings: [{ pattern: '-ts, -tes', examples: 'cats, rates, rights, plates, lights, courts, eights' }],
    },
    dz: {
        ipa: '/dz/', label: 'final d + z', voicing: 'voiced', manner: 'stop + fricative', place: 'alveolar',
        howTo: 'The voiced twin of /ts/, and the hardest ending in the chapter. Stop the air, then release into /z/, and LENGTHEN the vowel before it.',
        spellings: [{ pattern: '-ds, -des', examples: 'roads, needs, sides, words, aids, seeds, buds' }],
    },
    j: {
        ipa: '/dʒ/', label: 'j', voicing: 'voiced', manner: 'affricate', place: 'post-alveolar',
        howTo: 'One single sound: stop the air, then release into /ʒ/ with real friction. Compare with /dz/, where the tongue tip taps the ridge and the two consonants stay separate.',
        spellings: [
            { pattern: '<j>, <dge>', examples: 'judge, joke, budge, edge, siege' },
            { pattern: '<g>', note: 'before e, i, y', examples: 'age, rage, page, giant, religion' },
        ],
    },
    m: {
        ipa: '/m/', label: 'em', voicing: 'voiced', manner: 'nasal', place: 'bilabial',
        howTo: 'BOTH LIPS come together and stop the air leaving the mouth; the sound goes out through the nose. At the end of a word hold it LONG.',
        spellings: [
            { pattern: '<m>, <mm>', examples: 'me, smart, crumble, summer, time, farm' },
            { pattern: '<mb>', note: 'word finally', examples: 'comb, bomb, climb, crumb, dumb, plumber' },
            { pattern: '<mn>', note: 'word finally', examples: 'autumn, condemn, column' },
            { pattern: '<gm>', note: 'word finally', examples: 'diaphragm, paradigm' },
        ],
    },
    n: {
        ipa: '/n/', label: 'en', voicing: 'voiced', manner: 'nasal', place: 'alveolar',
        howTo: 'The TIP OF THE TONGUE touches the tooth ridge and stops the air; the sound goes out through the nose. Lips stay open.',
        spellings: [
            { pattern: '<n>, <nn>', examples: 'no, snow, sunny, ignore, son, alone, barn' },
            { pattern: '<kn>', note: 'word initially', examples: 'knife, knew, knee' },
            { pattern: '<pn>', note: 'word initially', examples: 'pneumonia, pneumatic' },
            { pattern: '<gn>', note: 'initial or final', examples: 'gnat, sign, foreign, campaign' },
        ],
    },
    ng: {
        ipa: '/ŋ/', label: 'eng', voicing: 'voiced', manner: 'nasal', place: 'velar',
        howTo: 'The BACK OF THE TONGUE touches the soft palate and stops the air there; the tip stays down. Never add a /g/ or /k/ after it in sing or long.',
        spellings: [
            { pattern: '<n>', note: 'before /g/ or /k/', examples: 'angle, thank, uncle, larynx, stronger, finger' },
            { pattern: '<ng>', note: 'word finally', examples: 'sing, singing, singer, strong, strongly' },
            { pattern: '<ngue>', note: 'word finally', examples: 'tongue' },
        ],
    },
};
/* ============================================================================
   3. UNITS
   ========================================================================== */
const UNITS = [
    /* ---------------------------------------------------------------- 15.1 */
    {
        id: 's-z', num: '01', title: 'Hiss or Buzz', tagline: 'The voicing switch', book: 'Sec. 15.1',
        sounds: [S.s, S.z],
        review: [
            { kind: 'sound', title: 'The voiceless one', sound: S.s },
            { kind: 'sound', title: 'The voiced one', sound: S.z },
            {
                kind: 'contrast', title: '/s/ vs /z/',
                body: 'Both are fricatives made by forcing air through a very narrow channel between the front of the tongue and the tooth ridge, with the lips spread. The mouth does not move between them. /s/ is voiceless with a STRONG, high-pitched hiss; /z/ is voiced with a WEAKER friction noise.',
                callout: 'Hold each one for three seconds and touch your throat. /z/ vibrates; /s/ is pure air.',
            },
            {
                kind: 'rule', title: 'The real clue is the VOWEL',
                body: 'At the end of a word, English speakers often devoice /z/ — so voicing alone will not save you. What actually separates the pair is length, and it works the opposite way round from what most learners expect.',
                rows: [
                    { head: 'before final /s/', items: 'the vowel is SHORT and the /s/ is long — peace · ice · price' },
                    { head: 'before final /z/', items: 'the vowel is LONG and the /z/ is short — peas · eyes · prize' },
                ],
                callout: 'This is the single most useful rule in the unit. Listen for the length of the vowel, not the buzz.',
            },
            {
                kind: 'rule', title: 'The grammar shortcut',
                body: 'Many words are spelled the same but split by sound. The NOUN or ADJECTIVE takes /s/; the VERB takes /z/.',
                rows: [
                    { head: 'noun / adj → /s/', items: 'some advice · the use · an excuse · a house · a close friend · a loose jacket' },
                    { head: 'verb → /z/', items: 'to advise · to use · to excuse · to house · to close · to lose' },
                ],
            },
            {
                kind: 'rule', title: 'Endings follow the sound before them',
                rows: [
                    { head: '/s/ after a voiceless sound', items: 'hopes · cats · books · laughs · months' },
                    { head: '/z/ after a voiced sound', items: 'plays · knees · beads · plans · rides · dogs' },
                ],
                callout: 'This is why plants and plans differ — /ts/ against /nz/.',
            },
        ],
        triples: [
            ['sip', 'zip', 'ship'], ['Sue', 'zoo', 'shoe'], ['sink', 'zinc', 'think'],
            ['bus', 'buzz', 'bush'], ['peace', 'peas', 'peach'], ['price', 'prize', 'pride'],
            ['lacy', 'lazy', 'lady'], ['race', 'raise', 'rage'], ['face', 'phase', 'faith'],
            ['ice', 'eyes', 'aids'], ['sewn', 'zoned', 'shown'], ['seal', 'zeal', 'steal'],
            ['prices', 'prizes', 'praises'], ['fussy', 'fuzzy', 'fussed'],
        ],
        pairs: [
            { a: 'price', b: 'prize' }, { a: 'place', b: 'plays' }, { a: 'peace', b: 'peas' },
            { a: 'niece', b: 'knees' }, { a: 'bus', b: 'buzz' }, { a: 'cost', b: 'caused' },
            { a: 'lamps', b: 'lambs' }, { a: 'plants', b: 'plans' }, { a: 'false', b: 'falls' },
            { a: 'fierce', b: 'fears' }, { a: 'advice', b: 'advise' }, { a: 'loose', b: 'lose' },
            { a: 'Sue', b: 'zoo' }, { a: 'ice', b: 'eyes' }, { a: 'racing', b: 'raising' },
            { a: 'lacy', b: 'lazy' }, { a: 'prices', b: 'prizes' }, { a: 'fussy', b: 'fuzzy' },
            { a: 'recent', b: 'reason' }, { a: 'sipped', b: 'zipped' }, { a: 'sewn', b: 'zoned' },
            { a: 'hiss', b: 'his' }, { a: 'course', b: 'cores' },
        ],
        sentences: [
            { a: "What's the {price}?", b: "What's the {prize}?" },
            { a: 'I said {C}.', b: 'I said {Z}.' },
            { a: 'They {sipped} it up slowly.', b: 'They {zipped} it up slowly.' },
            { a: 'Was it {sewn} correctly?', b: 'Was it {zoned} correctly?' },
            { a: "They're {racing} horses.", b: "They're {raising} horses." },
            { a: "They're very {lacy}.", b: "They're very {lazy}." },
            { a: 'The {prices} are excellent.', b: 'The {prizes} are excellent.' },
            { a: 'Is she {fussy}?', b: 'Is she {fuzzy}?' },
            { a: "That's not {recent} enough.", b: "That's not {reason} enough." },
            { a: "I'd like some {peace} for a change.", b: "I'd like some {peas} for a change." },
            { a: 'His {niece} received some cuts.', b: 'His {knees} received some cuts.' },
            { a: 'It {cost} him a lot of worry.', b: 'It {caused} him a lot of worry.' },
            { a: 'There are some {lamps} in the room.', b: 'There are some {lambs} in the room.' },
            { a: 'Do you have any {plants}?', b: 'Do you have any {plans}?' },
        ],
        sort: [
            { word: 'because', sound: 1 }, { word: 'choose', sound: 1 }, { word: 'release', sound: 0 },
            { word: 'chase', sound: 0 }, { word: 'whose', sound: 1 }, { word: 'purpose', sound: 0 },
            { word: 'mouse', sound: 0 }, { word: 'revise', sound: 1 }, { word: 'noise', sound: 1 },
            { word: 'erase', sound: 0 }, { word: 'those', sound: 1 }, { word: 'baseball', sound: 0 },
            { word: 'science', sound: 0 }, { word: 'music', sound: 1 }, { word: 'exercise', sound: 0 },
            { word: 'example', sound: 1 }, { word: 'exist', sound: 1 }, { word: 'expect', sound: 0 },
            { word: 'dessert', sound: 1 }, { word: 'possess', sound: 0 }, { word: 'communism', sound: 1 },
            { word: 'promise', sound: 0 },
        ],
    },
    /* ---------------------------------------------------------------- 15.2 */
    {
        id: 'th-dh', num: '02', title: 'Tongue on Teeth', tagline: 'The two <th> sounds', book: 'Sec. 15.2',
        sounds: [S.th, S.dh],
        review: [
            { kind: 'sound', title: 'Voiceless <th>', sound: S.th },
            { kind: 'sound', title: 'Voiced <th>', sound: S.dh },
            {
                kind: 'contrast', title: '/θ/ vs /ð/',
                body: 'Same tongue position, same light contact with the teeth, same loose channel. /θ/ is pure air; /ð/ adds voice and stays soft. Alternate /θθðððθθð/ without moving anything but your voice box.',
                callout: 'Compared with /s/, the tongue for /θ/ is FLAT and lets a lot of air pass out.',
            },
            {
                kind: 'rule', title: 'Position tells you which one',
                body: 'Spelling will not help — both are written <th>. Where the sound sits in the word will.',
                rows: [
                    { head: '/θ/ starts CONTENT words', items: 'think · thirsty · three · thumb · Thursday · thick' },
                    { head: '/ð/ starts FUNCTION words', items: 'the · they · this · that · those · though · than' },
                    { head: '/ð/ between vowels', items: 'mother · father · leather · weather · together · another' },
                    { head: '/θ/ at the end', items: 'mouth · breath · health · month · truth · south' },
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
            {
                kind: 'rule', title: 'The three traps',
                body: 'Learners replace /θ/ with one of three other sounds. Each has a different mouth position, so the fix is different each time.',
                rows: [
                    { head: 'vs /t/ — a STOP', items: 'thin/tin · thought/taught · bath/bat · three/tree · both/boat' },
                    { head: 'vs /s/ — tongue BEHIND the teeth', items: 'thumb/sum · mouth/mouse · path/pass · tenth/tense' },
                    { head: 'vs /f/ — the LOWER LIP, not the tongue', items: 'three/free · thread/Fred · thin/fin · death/deaf' },
                ],
                callout: 'In a mirror: for /θ/ you must see the tongue touching the upper teeth, with the lips out of the way.',
            },
            {
                kind: 'rule', title: 'Weak /ð/, and the /θr/ cluster',
                body: '/ð/ is often unstressed (the, them, another). Saying it weakly is correct and helps you reduce the syllable. For /θr/ as in three, the tongue must pull away from the teeth WITHOUT hitting the roof of the mouth.',
                rows: [{ head: 'practise slowly', items: 'three things · three thousand · thread the needle · I threw them away' }],
            },
        ],
        triples: [
            ['thin', 'tin', 'fin'], ['thought', 'taught', 'sought'], ['death', 'debt', 'deaf'],
            ['three', 'tree', 'free'], ['thread', 'tread', 'Fred'], ['tenth', 'tense', 'tents'],
            ['faith', 'fate', 'face'], ['path', 'pass', 'pat'], ['mouth', 'mouse', 'mount'],
            ['thumb', 'sum', 'some'], ['then', 'den', 'Zen'], ['thinking', 'sinking', 'thinning'],
            ['both', 'boat', 'boast'], ['fourth', 'force', 'forced'], ['thigh', 'tie', 'sigh'],
            ['breathe', 'breed', 'breeze'],
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
            { a: 'either', b: 'eater' }, { a: 'breathe', b: 'breed' }, { a: 'thimble', b: 'symbol' },
            { a: 'unthinkable', b: 'unsinkable' },
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
            { a: 'We need to {clothe} them.', b: 'We need to {close} them.' },
            { a: 'Are those {threes}?', b: 'Are those {trees}?' },
            { a: "She's {thinking} quickly.", b: "She's {sinking} quickly." },
            { a: 'I never {thought} it.', b: 'I never {sought} it.' },
        ],
        sort: [
            { word: 'think', sound: 0 }, { word: 'they', sound: 1 }, { word: 'birthday', sound: 0 },
            { word: 'father', sound: 1 }, { word: 'health', sound: 0 }, { word: 'although', sound: 1 },
            { word: 'mathematics', sound: 0 }, { word: 'southern', sound: 1 }, { word: 'month', sound: 0 },
            { word: 'breathe', sound: 1 }, { word: 'breath', sound: 0 }, { word: 'clothing', sound: 1 },
            { word: 'thirsty', sound: 0 }, { word: 'weather', sound: 1 }, { word: 'truth', sound: 0 },
            { word: 'smooth', sound: 1 }, { word: 'wealthy', sound: 0 }, { word: 'these', sound: 1 },
            { word: 'northwest', sound: 0 }, { word: 'northern', sound: 1 }, { word: 'author', sound: 0 },
            { word: 'together', sound: 1 },
        ],
    },
    /* ---------------------------------------------------------------- 15.3 */
    {
        id: 'sh-ch', num: '03', title: 'Hush and Crunch', tagline: 'Fricative vs affricate', book: 'Sec. 15.3',
        sounds: [S.sh, S.ch],
        review: [
            { kind: 'sound', title: 'The long hush', sound: S.sh },
            { kind: 'sound', title: 'The crunch', sound: S.ch },
            {
                kind: 'contrast', title: '/ʃ/ vs /tʃ/',
                body: '/ʃ/ is a fricative: the air never stops, so you can hold it forever — shhhhh. /tʃ/ is an affricate: the air is blocked completely first, so it begins with a tiny explosion and cannot be held at all.',
                callout: 'Test: try to stretch the sound for three seconds. If you can, it is /ʃ/.',
            },
            {
                kind: 'contrast', title: '/ʃ/ vs /s/',
                body: '/s/ is high, thin and sharp, with the tongue forward and the lips spread. /ʃ/ is lower and softer: the tongue slides further back, relaxes, and the lips round a little.',
                callout: 'Watch your lips in a mirror — /ʃ/ rounds them, /s/ does not.',
            },
            {
                kind: 'rule', title: '/ʃ/ hides in ordinary spellings',
                body: 'Almost none of the common /ʃ/ words are spelled <sh>. Learn the endings instead.',
                rows: [
                    { head: '<ti> in -tion', items: 'station · condition · partial · initial · ambitious · patient' },
                    { head: '<ci>', items: 'musician · suspicion · special · official · delicious · sufficient' },
                    { head: '<ssi>, <ssu>', items: 'permission · discussion · pressure · tissue · issue' },
                    { head: '<ch> from French', items: 'Chicago · machine · brochure · mustache' },
                    { head: '<su> (rare)', items: 'sugar · sure · assure · insurance' },
                    { head: '<xu>, <xi> = /kʃ/', items: 'sexual · luxury · anxious · obnoxious' },
                ],
            },
            {
                kind: 'rule', title: '/tʃ/ hides too — and <ch> is not always /tʃ/',
                rows: [
                    { head: '<tu> endings = /tʃ/', items: 'nature · picture · statue · fortune · actual · century · situation' },
                    { head: '<ti> after <s> = /tʃ/', items: 'question · suggestion · Christian' },
                    { head: 'but <ch> = /k/ in Greek roots', items: 'monarch · echo · chorus · mechanic · chemist · chaos · orchestra' },
                ],
                callout: '/stʃ/ as in question may be simplified to /ʃtʃ/ — /ˈkwɛʃtʃən/. That is normal, not sloppy.',
            },
        ],
        triples: [
            ['ships', 'chips', 'sips'], ['share', 'chair', 'scare'], ['cash', 'catch', 'cats'],
            ['sheep', 'cheap', 'seep'], ['shoes', 'choose', "Sue's"], ['mash', 'match', 'mass'],
            ['crushed', 'crutch', 'crust'], ['shin', 'chin', 'sin'], ['dish', 'ditch', 'dips'],
            ['washing', 'watching', 'wishing'], ['shop', 'chop', 'stop'], ['shear', 'cheer', 'seer'],
            ['wash', 'watch', 'wasp'], ['sheet', 'cheat', 'seat'],
        ],
        pairs: [
            { a: 'sheep', b: 'cheap' }, { a: 'shows', b: 'chose' }, { a: 'ships', b: 'chips' },
            { a: 'share', b: 'chair' }, { a: 'washing', b: 'watching' }, { a: 'cash', b: 'catch' },
            { a: 'dish', b: 'ditch' }, { a: 'mash', b: 'match' }, { a: 'washed', b: 'watched' },
            { a: 'shave', b: 'save' }, { a: 'showed', b: 'sewed' }, { a: 'shoes', b: "Sue's" },
            { a: 'shock', b: 'sock' }, { a: 'sheet', b: 'seat' }, { a: 'clashes', b: 'classes' },
            { a: 'leash', b: 'lease' }, { a: 'mesh', b: 'mess' }, { a: 'crushed', b: 'crust' },
            { a: 'rushed', b: 'rusted' }, { a: 'Porsche', b: 'porch' }, { a: 'wash', b: 'watch' },
            { a: 'shin', b: 'chin' },
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
            { a: 'You should {watch} it carefully.', b: 'You should {wash} it carefully.' },
            { a: "He's sitting on my {porch}.", b: "He's sitting on my {Porsche}." },
            { a: "I think they're {shoes}.", b: "I think they're {Sue's}." },
            { a: 'Have they had many {clashes}?', b: 'Have they had many {classes}?' },
        ],
        sort: [
            { word: 'nation', sound: 0 }, { word: 'future', sound: 1 }, { word: 'machine', sound: 0 },
            { word: 'kitchen', sound: 1 }, { word: 'special', sound: 0 }, { word: 'picture', sound: 1 },
            { word: 'mission', sound: 0 }, { word: 'question', sound: 1 }, { word: 'sugar', sound: 0 },
            { word: 'teacher', sound: 1 }, { word: 'ocean', sound: 0 }, { word: 'nature', sound: 1 },
            { word: 'parachute', sound: 0 }, { word: 'statue', sound: 1 }, { word: 'insurance', sound: 0 },
            { word: 'punctual', sound: 1 }, { word: 'luxury', sound: 0 }, { word: 'suggestion', sound: 1 },
            { word: 'delicious', sound: 0 }, { word: 'century', sound: 1 }, { word: 'pressure', sound: 0 },
            { word: 'righteous', sound: 1 },
        ],
    },
    /* ---------------------------------------------------------------- 15.6 */
    {
        id: 'finals', num: '04', title: 'Endings That Vanish', tagline: 'Final /ts dz/ vs /s z/ vs /tʃ dʒ/', book: 'Sec. 15.6',
        sounds: [S.ts, S.s, S.ch, S.dz, S.z, S.j],
        review: [
            {
                kind: 'rule', title: 'Why endings are the hardest part',
                body: 'English piles consonants at the end of words, and that is where the grammar lives — number, tense, and person all sit in that last sound. Drop it and plates, place and playschool all collapse into one blurry word.',
                callout: 'This section is marked ADVANCED in the book. Take it slowly.',
            },
            {
                kind: 'rule', title: 'The rule for /ts/ and /dz/',
                body: 'When you pronounce /ts/ or /dz/ at the end of a word, STOP THE AIR COMPLETELY for a short time before opening up for the fricative /s/ or /z/. Two consonants, one after the other — not a single sound.',
                rows: [
                    { head: 'start with /ts/', items: 'it is easier: cats · rates · rights · plates · lights · courts' },
                    { head: 'then /dz/', items: 'substitute /ts/ at first and LENGTHEN the vowel: roads · needs · sides · words' },
                    { head: 'link whenever possible', items: 'he_needs_it /hi nid zɪt/ · she_rides_it /ʃi raɪd zɪt/' },
                ],
                callout: 'Lengthening the vowel is what makes /dz/ sound voiced, even when the /z/ itself devoices.',
            },
            {
                kind: 'rule', title: 'Three-way contrast: the whole point',
                body: 'Every ending in this unit sits in a three-way opposition. Two consonants in a row, one fricative, or one affricate.',
                rows: [
                    { head: '/ts/ vs /s/ vs /tʃ/', items: 'eights / ace / H · mats / mass / match · hits / hiss / hitch · pizzas / pieces / peaches' },
                    { head: '/dz/ vs /z/ vs /dʒ/', items: "aids / A's / age · raids / raise / rage · buds / buzz / budge · seeds / seas / siege" },
                ],
                callout: '/ts/ and /dz/ are TWO consonants. /tʃ/ and /dʒ/ are ONE. That is the whole distinction.',
            },
            {
                kind: 'rule', title: 'And do not lose the /t/ or /d/ altogether',
                rows: [
                    { head: '/ts/ vs /s/', items: 'rates/race · rights/rice · plates/place · lights/lice · courts/course' },
                    { head: '/dz/ vs /z/', items: 'roads/rows · nudes/news · sides/size · needs/knees · trades/trays · words/whirs' },
                ],
            },
        ],
        triples: [
            ['eights', 'ace', 'H'], ['mats', 'mass', 'match'], ['hits', 'hiss', 'hitch'],
            ['pizzas', 'pieces', 'peaches'], ['aids', "A's", 'age'], ['raids', 'raise', 'rage'],
            ['buds', 'buzz', 'budge'], ['seeds', 'seas', 'siege'], ['cats', 'cass', 'catch'],
            ['rights', 'rice', 'rich'], ['heads', 'haze', 'hedge'], ['rains', 'range', 'rage'],
        ],
        pairs: [
            { a: 'rates', b: 'race' }, { a: 'rights', b: 'rice' }, { a: 'plates', b: 'place' },
            { a: 'hits', b: 'hiss' }, { a: 'lights', b: 'lice' }, { a: 'courts', b: 'course' },
            { a: 'roads', b: 'rows' }, { a: 'nudes', b: 'news' }, { a: 'sides', b: 'size' },
            { a: 'needs', b: 'knees' }, { a: 'trades', b: 'trays' }, { a: 'words', b: 'whirs' },
            { a: 'worlds', b: 'whirls' }, { a: 'cats', b: 'catch' }, { a: 'eats', b: 'each' },
            { a: 'coats', b: 'coach' }, { a: 'mats', b: 'match' }, { a: 'Ritz', b: 'rich' },
            { a: 'heads', b: 'hedge' }, { a: 'raids', b: 'rage' }, { a: 'chains', b: 'change' },
            { a: 'rains', b: 'range' }, { a: 'aids', b: "A's" }, { a: 'seeds', b: 'seas' },
            { a: 'buds', b: 'buzz' }, { a: 'eights', b: 'ace' },
        ],
        sentences: [
            { a: 'The {rates} kept getting worse.', b: 'The {race} kept getting worse.' },
            { a: "They don't have any {rights} in that country.", b: "They don't have any {rice} in that country." },
            { a: 'He lost his {plates}.', b: 'He lost his {place}.' },
            { a: 'Did you hear the {hits}?', b: 'Did you hear the {hiss}?' },
            { a: 'Did the {lights} bother you?', b: 'Did the {lice} bother you?' },
            { a: 'The {courts} convinced us.', b: 'The {course} convinced us.' },
            { a: 'The {roads} were dirty.', b: 'The {rows} were dirty.' },
            { a: 'Did he watch the {nudes} on TV?', b: 'Did he watch the {news} on TV?' },
            { a: "Something's wrong with the {sides}.", b: "Something's wrong with the {size}." },
            { a: 'Her {needs} are unusual.', b: 'Her {knees} are unusual.' },
            { a: 'Some {trades} were made there.', b: 'Some {trays} were made there.' },
            { a: 'Did you hear the {words}?', b: 'Did you hear the {whirs}?' },
            { a: 'He described the {worlds}.', b: 'He described the {whirls}.' },
            { a: 'He mentioned the {cats}.', b: 'He mentioned the {catch}.' },
            { a: 'Nobody noticed the {heads}.', b: 'Nobody noticed the {hedge}.' },
            { a: 'The report described the {raids}.', b: 'The report described the {rage}.' },
        ],
        sort: [
            { word: 'cats', sound: 0, opts: [0, 1, 2] }, { word: 'mass', sound: 1, opts: [0, 1, 2] },
            { word: 'match', sound: 2, opts: [0, 1, 2] }, { word: 'rights', sound: 0, opts: [0, 1, 2] },
            { word: 'rice', sound: 1, opts: [0, 1, 2] }, { word: 'rich', sound: 2, opts: [0, 1, 2] },
            { word: 'hits', sound: 0, opts: [0, 1, 2] }, { word: 'hiss', sound: 1, opts: [0, 1, 2] },
            { word: 'hitch', sound: 2, opts: [0, 1, 2] }, { word: 'eights', sound: 0, opts: [0, 1, 2] },
            { word: 'aids', sound: 3, opts: [3, 4, 5] }, { word: "A's", sound: 4, opts: [3, 4, 5] },
            { word: 'age', sound: 5, opts: [3, 4, 5] }, { word: 'roads', sound: 3, opts: [3, 4, 5] },
            { word: 'rows', sound: 4, opts: [3, 4, 5] }, { word: 'rage', sound: 5, opts: [3, 4, 5] },
            { word: 'seeds', sound: 3, opts: [3, 4, 5] }, { word: 'buzz', sound: 4, opts: [3, 4, 5] },
            { word: 'siege', sound: 5, opts: [3, 4, 5] }, { word: 'needs', sound: 3, opts: [3, 4, 5] },
        ],
    },
    /* ---------------------------------------------------------------- 15.10 */
    {
        id: 'nasals', num: '05', title: 'Through the Nose', tagline: 'Final /m/ · /n/ · /ŋ/', book: 'Sec. 15.10',
        sounds: [S.m, S.n, S.ng],
        review: [
            { kind: 'sound', title: 'Lips', sound: S.m },
            { kind: 'sound', title: 'Tip', sound: S.n },
            { kind: 'sound', title: 'Back', sound: S.ng },
            {
                kind: 'rule', title: 'One airstream, three doors',
                body: 'For all three nasals the air comes out of the NOSE instead of the mouth. Only the place where the mouth is blocked changes — front, middle, back.',
                rows: [
                    { head: '/m/ — both lips', items: 'some · rum · Kim · dumb · clams · time · farm' },
                    { head: '/n/ — tongue tip on the ridge', items: 'son · run · kin · done · clans · alone · barn' },
                    { head: '/ŋ/ — back of the tongue', items: 'sung · rung · king · dung · clangs · strong · tongue' },
                ],
                callout: 'Say mom /mɑm/, none /nʌn/ and gang /gæŋ/ and check that the tongue is in exactly the same place at the start and the end of each word.',
            },
            {
                kind: 'rule', title: 'Hold them — do not chop them',
                body: 'These nasals are all LONG at the end of a word. Cutting them off with a glottal stop is what makes them disappear for the listener. Link them to any vowel that follows.',
                rows: [{ head: 'link it', items: 'some_apples · sun_is · long_hour · time_out · Kim_asked' }],
            },
            {
                kind: 'rule', title: 'You cannot see the difference — only feel it',
                body: 'In a mirror, /p b m/ look identical to each other, and so do /t d n/ and /k g ŋ/. Watching your mouth will not help here; you have to feel where the block is.',
                callout: 'If you get stuck, borrow the sound from the start of a word: the /m/ in some is the same as in summer; the /n/ in sun is the same as in sunny.',
            },
            {
                kind: 'rule', title: '/ŋ/ has its own spelling rules',
                rows: [
                    { head: '<n> before /g/ or /k/', items: 'angle · thank · uncle · larynx · stronger · finger' },
                    { head: '<ng> word finally', items: 'sing · singing · singer · strong · strongly' },
                    { head: '<ngue> word finally', items: 'tongue' },
                ],
                callout: 'Never add a /g/ or /k/ after final /ŋ/ — singer does not rhyme with finger.',
            },
            {
                kind: 'rule', title: 'The informal -ing',
                body: 'In relaxed speech the ending <ing> is often just /ɪn/ or /ən/ — written <in\'> in songs and novels: "he\'s goin\' home", "they\'re ridin\' away". Even something becomes /ˈsəmʔm̩/ in fast speech.',
                callout: 'In STRESSED syllables, though, the difference between /m n ŋ/ is always maintained. Do not use fast speech as an excuse.',
            },
        ],
        triples: [
            ['simmer', 'sinner', 'singer'], ['some', 'son', 'sung'], ['them', 'thin', 'thing'],
            ['rum', 'run', 'rung'], ['Kim', 'kin', 'king'], ['dumb', 'done', 'dung'],
            ['clams', 'clans', 'clangs'], ['sum', 'sun', 'sung'], ['ram', 'ran', 'rang'],
            ['whim', 'win', 'wing'], ['bam', 'ban', 'bang'], ['tom', 'ton', 'tongue'],
        ],
        pairs: [
            { a: 'simmer', b: 'sinner' }, { a: 'sinner', b: 'singer' }, { a: 'some', b: 'son' },
            { a: 'son', b: 'sung' }, { a: 'them', b: 'thin' }, { a: 'thin', b: 'thing' },
            { a: 'rum', b: 'run' }, { a: 'run', b: 'rung' }, { a: 'Kim', b: 'kin' },
            { a: 'kin', b: 'king' }, { a: 'dumb', b: 'done' }, { a: 'done', b: 'dung' },
            { a: 'clams', b: 'clans' }, { a: 'clans', b: 'clangs' }, { a: 'lawn', b: 'long' },
            { a: 'banned', b: 'banged' }, { a: 'sin', b: 'sing' }, { a: 'ban', b: 'bang' },
            { a: 'sun', b: 'sung' }, { a: 'win', b: 'wing' }, { a: 'sins', b: 'sings' },
            { a: 'thing', b: 'think' }, { a: 'ban', b: 'bank' },
        ],
        sentences: [
            { a: "They don't need a {sinner}.", b: "They don't need a {singer}." },
            { a: 'I have {some} at home.', b: 'I have {sung} at home.' },
            { a: "It's {them} I know.", b: "It's {thin} I know." },
            { a: 'They have {rum}.', b: 'They have {run}.' },
            { a: "He's our {Kim}.", b: "He's our {king}." },
            { a: "It's really {dumb}.", b: "It's really {done}." },
            { a: 'The {clams} were big.', b: 'The {clans} were big.' },
            { a: 'They {banned} it.', b: 'They {banged} it.' },
            { a: 'He {sins} a lot.', b: 'He {sings} a lot.' },
            { a: 'I heard the {clangs}.', b: 'I heard the {clans}.' },
            { a: 'Did you say {thin}?', b: 'Did you say {thing}?' },
            { a: "He's our {kin}.", b: "He's our {king}." },
        ],
        sort: [
            { word: 'autumn', sound: 0 }, { word: 'gone', sound: 1 }, { word: 'think', sound: 2 },
            { word: 'climb', sound: 0 }, { word: 'know', sound: 1 }, { word: 'finger', sound: 2 },
            { word: 'summer', sound: 0 }, { word: 'dinner', sound: 1 }, { word: 'uncle', sound: 2 },
            { word: 'comb', sound: 0 }, { word: 'nine', sound: 1 }, { word: 'bank', sound: 2 },
            { word: 'column', sound: 0 }, { word: 'sign', sound: 1 }, { word: 'tongue', sound: 2 },
            { word: 'paradigm', sound: 0 }, { word: 'pneumonia', sound: 1 }, { word: 'stronger', sound: 2 },
            { word: 'condemn', sound: 0 }, { word: 'campaign', sound: 1 }, { word: 'larynx', sound: 2 },
            { word: 'singer', sound: 2 },
        ],
    },
];
/* ============================================================================
   4. FINAL EXAM — chapter review items for these sounds only (p. 218)
   ========================================================================== */
const EXAM = [
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
    { frame: 'The ___ caused problems.', options: ['range', 'rains'] },
    { frame: 'He mentioned the ___.', options: ['mats', 'mass', 'match'] },
    { frame: 'Did you hear the ___?', options: ['hits', 'hiss', 'hitch'] },
    { frame: 'She described the ___.', options: ['raids', 'raise', 'rage'] },
    { frame: 'I counted the ___.', options: ['seeds', 'seas', 'siege'] },
    { frame: 'The ___ kept getting worse.', options: ['rates', 'race'] },
    { frame: 'He lost his ___.', options: ['plates', 'place'] },
    { frame: 'Her ___ are unusual.', options: ['needs', 'knees'] },
    { frame: "He's our ___.", options: ['kin', 'king', 'Kim'] },
    { frame: 'He ___ a lot.', options: ['sins', 'sings'] },
    { frame: 'When did they ___ it?', options: ['ban', 'bang', 'bank'] },
    { frame: 'Did you say ___?', options: ['thin', 'thing', 'think'] },
    { frame: 'They have ___ already.', options: ['some', 'sung', 'sunk'] },
    { frame: "They don't need a ___.", options: ['simmer', 'sinner', 'singer'] },
    { frame: 'The ___ were big.', options: ['clams', 'clans', 'clangs'] },
];
/* ============================================================================
   5. UTILITIES
   ========================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
const pick = (arr, n) => shuffle(arr).slice(0, n);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const plain = (s) => s.replace(/[{}]/g, '');
const target = (s) => (s.match(/\{([^}]+)\}/) || ['', s])[1];
const markup = (s) => escapeHtml(s).replace(/\{([^}]+)\}/g, '<b class="tgt">$1</b>');
function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
/** Carrier phrases used by the Expert drill so the target word is coarticulated. */
const CARRIERS = [
    'Say ___ again.',
    'The word is ___, okay?',
    'I heard ___ clearly.',
    'Write ___ down.',
    'They said ___ twice.',
];
/* ============================================================================
   6. STATE
   ========================================================================== */
const SAVE_KEY = 'consonant-lab-v5';
const OUTBOX_KEY = 'consonant-lab-outbox';
const blankState = () => ({
    version: 5,
    student: null,
    units: {},
    exam: { best: 0, taken: 0 },
    settings: { engine: 'device', voiceURI: null, kokoroVoice: 'af_heart', rate: 0.9, theme: 'auto' },
});
let state = blankState();
function loadState() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.version === 5) {
                state = { ...blankState(), ...parsed, settings: { ...blankState().settings, ...parsed.settings } };
            }
        }
    }
    catch {
        /* storage blocked — run in memory */
    }
    for (const u of UNITS)
        if (!state.units[u.id])
            state.units[u.id] = { reviewed: false, best: {} };
}
function saveState() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }
    catch { /* ignore */ }
}
const PASS = 80;
const ACTIVITIES = [
    { id: 'pairs', name: 'Minimal Pairs', blurb: 'Three words on screen, one in your ears. 12 items, 3 replays each.' },
    { id: 'pairsx', name: 'Minimal Pairs — Expert', blurb: 'Inside a sentence, at speed, ONE replay. 15 items.', hard: true },
    { id: 'samediff', name: 'Same or Different', blurb: 'Two words play. Decide if they match.' },
    { id: 'odd', name: 'Odd One Out', blurb: 'Three words play. Find the one that differs.' },
    { id: 'sentence', name: 'In Context', blurb: 'A full sentence plays. Choose the word used.' },
    { id: 'sort', name: 'Spelling to Sound', blurb: 'Decide which sound the spelling makes.' },
];
const unitScore = (u) => {
    const p = state.units[u.id];
    const vals = ACTIVITIES.map((a) => p.best[a.id] || 0);
    return Math.round(vals.reduce((x, y) => x + y, 0) / ACTIVITIES.length);
};
const unitMastered = (u) => ACTIVITIES.every((a) => (state.units[u.id].best[a.id] || 0) >= PASS);
const cleared = (u, a) => (state.units[u.id].best[a] || 0) >= PASS;
const reportingOn = () => REPORT_URL.trim().length > 0;
function readOutbox() {
    try {
        return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
    }
    catch {
        return [];
    }
}
function writeOutbox(rows) {
    try {
        localStorage.setItem(OUTBOX_KEY, JSON.stringify(rows.slice(-200)));
    }
    catch { /* ignore */ }
}
/** Guards against two flushes running at once and sending the same row twice. */
let flushing = false;
async function flushOutbox() {
    if (!reportingOn() || flushing)
        return;
    const rows = readOutbox();
    if (!rows.length)
        return;
    flushing = true;
    // Claim the rows immediately: a result finished mid-flush is appended to a
    // now-empty outbox instead of being re-sent alongside these.
    writeOutbox([]);
    const left = [];
    for (const row of rows) {
        try {
            await fetch(REPORT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(row),
            });
        }
        catch {
            left.push(row); // keep it for the next attempt
        }
    }
    writeOutbox([...left, ...readOutbox()]);
    flushing = false;
    paintOutbox();
}
function paintOutbox() {
    const el = document.getElementById('outbox');
    if (!el)
        return;
    const n = readOutbox().length;
    el.hidden = !reportingOn() || n === 0;
    el.textContent = n === 1
        ? '1 result still waiting to be sent — it will go automatically.'
        : `${n} results still waiting to be sent — they will go automatically.`;
}
function report(unit, activity, score, correct, total) {
    if (!reportingOn() || !state.student)
        return;
    const act = ACTIVITIES.find((a) => a.id === activity);
    const row = {
        student: state.student.name,
        section: state.student.section,
        unit: unit ? unit.num : 'EXAM',
        unitTitle: unit ? unit.title : 'Chapter 15 Listening Exam',
        activity,
        activityName: act ? act.name : 'Final Exam',
        score, correct, total,
        engine: speaker.engine,
        at: new Date().toISOString(),
    };
    writeOutbox([...readOutbox(), row]);
    void flushOutbox();
}
/* ============================================================================
   7. AUDIO ENGINES
   ========================================================================== */
const KOKORO_CDN = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm';
const KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
/** Curated Kokoro voices — American first, then British. */
const KOKORO_VOICES = [
    { id: 'af_heart', name: 'Heart — American female (best quality)' },
    { id: 'af_bella', name: 'Bella — American female' },
    { id: 'af_nicole', name: 'Nicole — American female (soft)' },
    { id: 'af_sarah', name: 'Sarah — American female' },
    { id: 'am_michael', name: 'Michael — American male' },
    { id: 'am_fenrir', name: 'Fenrir — American male' },
    { id: 'am_puck', name: 'Puck — American male' },
    { id: 'bf_emma', name: 'Emma — British female' },
    { id: 'bm_george', name: 'George — British male' },
];
/** Kokoro-82M running locally in the browser via transformers.js. */
class KokoroEngine {
    constructor() {
        this.tts = null;
        this.loading = null;
        this.ctx = null;
        this.cache = new Map();
        this.current = null;
        this.status = 'idle';
        this.progress = 0;
        this.error = '';
        this.onchange = null;
    }
    audioCtx() {
        if (!this.ctx)
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended')
            void this.ctx.resume();
        return this.ctx;
    }
    get ready() { return this.status === 'ready' && !!this.tts; }
    load() {
        if (this.tts)
            return Promise.resolve();
        if (this.loading)
            return this.loading;
        this.status = 'loading';
        this.progress = 0;
        this.onchange?.();
        this.loading = (async () => {
            const mod = await import(/* @vite-ignore */ KOKORO_CDN);
            // Without this, ONNX inference runs ON THE MAIN THREAD and freezes the
            // whole page for as long as each clip takes to generate. proxy:true moves
            // it into a Web Worker so the UI keeps responding.
            try {
                const wasm = mod.env?.backends?.onnx?.wasm;
                if (wasm) {
                    wasm.proxy = true;
                    // Multi-threading needs cross-origin isolation, which GitHub Pages
                    // does not provide; asking for it just produces warnings.
                    wasm.numThreads = 1;
                }
            }
            catch { /* older builds: fall back to whatever the default is */ }
            this.tts = await mod.KokoroTTS.from_pretrained(KOKORO_MODEL, {
                dtype: 'q8',
                device: 'wasm',
                progress_callback: (p) => {
                    if (p && typeof p.progress === 'number') {
                        this.progress = Math.max(this.progress, Math.round(p.progress));
                        this.onchange?.();
                    }
                },
            });
            this.status = 'ready';
            this.progress = 100;
            this.onchange?.();
        })().catch((e) => {
            this.status = 'error';
            this.error = e instanceof Error ? e.message : String(e);
            this.loading = null;
            this.onchange?.();
            throw e;
        });
        return this.loading;
    }
    key(text, speed) {
        return `${state.settings.kokoroVoice}|${speed.toFixed(2)}|${text}`;
    }
    /** Generate (or fetch from cache) without playing — used to prefetch. */
    async prepare(text, speed) {
        if (!this.ready)
            return null;
        const k = this.key(text, speed);
        const hit = this.cache.get(k);
        if (hit)
            return hit;
        try {
            const raw = await this.tts.generate(text, {
                voice: state.settings.kokoroVoice,
                speed,
            });
            const data = raw.audio ?? raw.data;
            const sr = raw.sampling_rate ?? raw.samplingRate ?? 24000;
            const buf = this.audioCtx().createBuffer(1, data.length, sr);
            buf.getChannelData(0).set(data);
            if (this.cache.size > 220)
                this.cache.delete(this.cache.keys().next().value);
            this.cache.set(k, buf);
            return buf;
        }
        catch {
            return null;
        }
    }
    async say(text, speed) {
        const buf = await this.prepare(text, speed);
        if (!buf)
            return false;
        const ctx = this.audioCtx();
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        this.current = src;
        await new Promise((resolve) => {
            src.onended = () => resolve();
            src.start();
        });
        this.current = null;
        return true;
    }
    stop() {
        if (this.current) {
            try {
                this.current.stop();
            }
            catch { /* already stopped */ }
            this.current = null;
        }
    }
}
/** The device's built-in speech synthesis. */
class DeviceEngine {
    constructor() {
        this.voices = [];
        this.supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
        this.onchange = null;
    }
    init() {
        if (!this.supported)
            return;
        const load = () => {
            this.voices = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
            if (this.voices.length) {
                if (!state.settings.voiceURI || !this.voices.some((v) => v.voiceURI === state.settings.voiceURI)) {
                    state.settings.voiceURI = this.preferred().voiceURI;
                }
                this.onchange?.();
            }
        };
        load();
        speechSynthesis.addEventListener('voiceschanged', load);
        setTimeout(load, 400);
        setTimeout(load, 1200);
    }
    preferred() {
        const score = (v) => {
            let s = 0;
            if (/en[-_]US/i.test(v.lang))
                s += 4;
            else if (/en[-_](GB|CA|AU)/i.test(v.lang))
                s += 2;
            if (v.localService)
                s += 2;
            if (/samantha|google us|aria|jenny|zira|alex|daniel/i.test(v.name))
                s += 3;
            return s;
        };
        return this.voices.slice().sort((a, b) => score(b) - score(a))[0];
    }
    list() { return this.voices; }
    get available() { return this.voices.length > 0; }
    stop() { if (this.supported)
        speechSynthesis.cancel(); }
    say(text, rate) {
        return new Promise((resolve) => {
            if (!this.supported)
                return resolve();
            const u = new SpeechSynthesisUtterance(text);
            const v = this.voices.find((x) => x.voiceURI === state.settings.voiceURI);
            if (v) {
                u.voice = v;
                u.lang = v.lang;
            }
            u.rate = rate;
            u.pitch = 1;
            let done = false;
            let poll = 0;
            let started = false;
            const finish = () => {
                if (done)
                    return;
                done = true;
                clearInterval(poll);
                resolve();
            };
            u.onend = finish;
            u.onerror = finish;
            speechSynthesis.speak(u);
            // Several engines never fire onend. Watching the queue drain ends the
            // word as soon as it actually stops, instead of sitting through a fixed
            // timeout and leaving a second of dead air after every single word.
            poll = setInterval(() => {
                if (speechSynthesis.speaking || speechSynthesis.pending) {
                    started = true;
                    return;
                }
                if (started)
                    finish();
            }, 60);
            setTimeout(finish, Math.max(1200, text.length * 90));
        });
    }
}
/** Routes playback to whichever engine is selected, with a safe fallback. */
class Speaker {
    constructor() {
        this.device = new DeviceEngine();
        this.kokoro = new KokoroEngine();
        this.onchange = null;
        this.busy = false;
    }
    init() {
        this.device.onchange = () => this.onchange?.();
        this.kokoro.onchange = () => this.onchange?.();
        this.device.init();
        if (state.settings.engine === 'kokoro')
            void this.kokoro.load().catch(() => { });
    }
    get engine() {
        return state.settings.engine === 'kokoro' && this.kokoro.ready ? 'kokoro' : 'device';
    }
    stop() { this.device.stop(); this.kokoro.stop(); }
    async say(text, rateMul = 1) {
        const rate = Math.min(1.6, Math.max(0.4, state.settings.rate * rateMul));
        this.busy = true;
        document.body.classList.add('speaking');
        try {
            if (state.settings.engine === 'kokoro' && this.kokoro.ready) {
                const ok = await this.kokoro.say(text, rate);
                if (ok)
                    return;
            }
            await this.device.say(text, rate);
        }
        finally {
            this.busy = false;
            document.body.classList.remove('speaking');
        }
    }
    /** Warm the cache for upcoming utterances (Kokoro only). */
    prefetch(texts, rateMul = 1) {
        if (state.settings.engine !== 'kokoro' || !this.kokoro.ready)
            return;
        if (this.busy)
            return;
        const rate = Math.min(1.6, Math.max(0.4, state.settings.rate * rateMul));
        void (async () => { for (const t of texts)
            await this.kokoro.prepare(t, rate); })();
    }
    async sequence(items, gapMs = 380, rateMul = 1) {
        for (let i = 0; i < items.length; i++) {
            await this.say(items[i], rateMul);
            if (i < items.length - 1)
                await new Promise((r) => setTimeout(r, gapMs));
        }
    }
}
const speaker = new Speaker();
/* ============================================================================
   8. QUESTION GENERATION
   ========================================================================== */
/** Build a 3-option set from the unit's triples, topped up with pairs. */
function discriminationSets(unit, n) {
    const sets = shuffle(unit.triples).slice(0, n);
    if (sets.length < n) {
        for (const p of shuffle(unit.pairs)) {
            if (sets.length >= n)
                break;
            sets.push([p.a, p.b]);
        }
    }
    return sets;
}
function buildQuestions(unit, kind) {
    switch (kind) {
        case 'pairs':
            return discriminationSets(unit, 12).map((set) => {
                const opts = shuffle(set);
                const heard = rand(opts);
                return {
                    kind, audio: [heard], prompt: 'Which word did you hear?',
                    options: opts, answer: opts.indexOf(heard),
                    note: set.join(' · '), maxReplays: 3,
                };
            });
        case 'pairsx':
            return discriminationSets(unit, 15).map((set) => {
                const opts = shuffle(set);
                const heard = rand(opts);
                const carrier = rand(CARRIERS);
                return {
                    kind, audio: [carrier.replace('___', heard)],
                    prompt: 'Which word was in the sentence?',
                    options: opts, answer: opts.indexOf(heard),
                    note: escapeHtml(carrier.replace('___', heard)),
                    maxReplays: 1, rate: 1.15, noSlow: true,
                };
            });
        case 'samediff':
            return pick(unit.pairs, 12).map((p) => {
                const same = Math.random() < 0.5;
                const first = Math.random() < 0.5 ? p.a : p.b;
                const second = same ? first : first === p.a ? p.b : p.a;
                return {
                    kind, audio: [first, second], prompt: 'Are the two words the same or different?',
                    options: ['Same', 'Different'], answer: same ? 0 : 1,
                    note: `You heard: ${first} — ${second}`, maxReplays: 3,
                };
            });
        case 'odd':
            return pick(unit.pairs, 12).map((p) => {
                const twin = Math.random() < 0.5 ? p.a : p.b;
                const odd = twin === p.a ? p.b : p.a;
                const slot = Math.floor(Math.random() * 3);
                const words = [twin, twin, twin];
                words[slot] = odd;
                return {
                    kind, audio: words, prompt: 'Which one is different?',
                    options: ['First', 'Second', 'Third'], answer: slot,
                    note: words.join(' · '), maxReplays: 3,
                };
            });
        case 'sentence':
            return pick(unit.sentences, Math.min(12, unit.sentences.length)).map((sp) => {
                const useA = Math.random() < 0.5;
                const said = useA ? sp.a : sp.b;
                const opts = shuffle([target(sp.a), target(sp.b)]);
                return {
                    kind, audio: [plain(said)], prompt: 'Which word was in the sentence?',
                    options: opts, answer: opts.indexOf(target(said)),
                    note: markup(said), maxReplays: 3,
                };
            });
        case 'sort':
            return pick(unit.sort, Math.min(12, unit.sort.length)).map((item) => {
                const idx = item.opts ?? unit.sounds.map((_, i) => i);
                const opts = idx.map((i) => unit.sounds[i].ipa);
                return {
                    kind, audio: [item.word],
                    prompt: `Which sound does <b class="tgt">${escapeHtml(item.word)}</b> make?`,
                    options: opts, answer: idx.indexOf(item.sound),
                    note: `${item.word} → ${unit.sounds[item.sound].ipa}`, maxReplays: 3,
                };
            });
    }
}
function buildExam() {
    return shuffle(EXAM).map((item) => {
        const heard = rand(item.options);
        const opts = shuffle(item.options);
        return {
            kind: 'sentence',
            audio: [item.frame.replace('___', heard)],
            prompt: 'Circle the word you hear.',
            options: opts,
            answer: opts.indexOf(heard),
            note: escapeHtml(item.frame.replace('___', heard)),
            maxReplays: 2,
        };
    });
}
/* ============================================================================
   9. VIEWS
   ========================================================================== */
const app = () => $('#view');
let keyHandler = null;
function setView(html) {
    speaker.stop();
    if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
        keyHandler = null;
    }
    const v = app();
    v.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#main').focus({ preventScroll: true });
}
/* ---------- Who are you? (only when reporting is switched on) ---------- */
function viewIdentity() {
    setView(`
    <header class="hero">
      <p class="eyebrow">Accurate English · Chapter 15 · Consonants in Detail</p>
      <h1>The Consonant<br><em>Lab</em></h1>
      <p class="lede">Before you start, tell your teacher who you are. Your scores are sent to
      the class list automatically as you clear each activity.</p>
    </header>

    <section class="card">
      <div class="idform">
        <div class="field">
          <label for="sname">Your full name</label>
          <input type="text" id="sname" autocomplete="name" placeholder="e.g. Roberth Rivera" maxlength="60">
        </div>
        <div class="field">
          <label for="ssec">Section</label>
          <input type="text" id="ssec" autocomplete="off" placeholder="e.g. 11-1" maxlength="20">
        </div>
        <p class="iderr" id="iderr" hidden role="alert">Please fill in both boxes.</p>
        <button class="btn btn-solid lg" id="idgo">Start &rarr;</button>
        <p class="help">Write your name the same way every time so your results stay together.</p>
      </div>
    </section>
  `);
    const go = () => {
        const name = $('#sname').value.trim();
        const section = $('#ssec').value.trim();
        if (!name || !section) {
            $('#iderr').hidden = false;
            return;
        }
        state.student = { name, section };
        saveState();
        viewHome();
    };
    $('#idgo').addEventListener('click', go);
    ['#sname', '#ssec'].forEach((sel) => $(sel).addEventListener('keydown', (e) => {
        if (e.key === 'Enter')
            go();
    }));
    $('#sname').focus();
}
/* ---------- Home ---------- */
function viewHome() {
    const doneCount = UNITS.filter(unitMastered).length;
    const overall = Math.round(UNITS.reduce((s, u) => s + unitScore(u), 0) / UNITS.length);
    const need = 3;
    const examUnlocked = doneCount >= need;
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
      <div class="ipa-row">${u.sounds.map((s) => `<span class="ipa v-${s.voicing}">${s.ipa}</span>`).join('')}</div>
      <div class="meter" role="img" aria-label="Progress ${score} percent"><span style="width:${score}%"></span></div>
      <div class="unit-foot"><span class="pct">${score}%</span><span class="src">${u.book}</span></div>
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
      <p class="lede">Five units on the consonants that decide whether people understand you.
      Study the rules first, then prove you can hear the difference &mdash; every drill plays real
      audio and you decide what was said.</p>
      <div class="stats">
        <div><strong>${doneCount}<span>/${UNITS.length}</span></strong><span class="stat-l">units mastered</span></div>
        <div><strong>${overall}<span>%</span></strong><span class="stat-l">overall accuracy</span></div>
        <div><strong>${state.exam.best}<span>%</span></strong><span class="stat-l">best exam score</span></div>
      </div>
    </header>

    <section class="how">
      <h2 class="rule-h">How this works</h2>
      <ol class="steps">
        <li><span>1</span><b>Study</b><p>The rules straight from the chapter: what the sound is, how your mouth makes it, and which spellings hide it. No test, no pressure.</p></li>
        <li><span>2</span><b>Drill</b><p>Six listening activities per unit &mdash; including two levels of minimal pairs. ${PASS}% to clear each one.</p></li>
        <li><span>3</span><b>Exam</b><p>${EXAM.length} items from the chapter review. Unlocks after ${need} units are mastered.</p></li>
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
        <p class="lede sm">${EXAM.length} sentences from the end-of-chapter review. Circle the word you hear.
        ${state.exam.taken ? `Taken ${state.exam.taken}&times; · best ${state.exam.best}%.` : ''}</p>
      </div>
      <button class="btn btn-solid lg" data-go="exam" ${examUnlocked ? '' : 'disabled'}>
        ${examUnlocked ? 'Start the exam' : `Master ${need - doneCount} more unit${need - doneCount === 1 ? '' : 's'}`}
      </button>
    </section>
  `);
}
/* ---------- Review ---------- */
function viewReview(unit, idx = 0) {
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
            <li>${escapeHtml(s.manner)}</li>
            <li>${escapeHtml(s.place)}</li>
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
    }
    else {
        body = `
      ${card.body ? `<p class="howto">${escapeHtml(card.body)}</p>` : ''}
      ${card.rows ? `<table class="spell"><tbody>${card.rows.map((r) => `
        <tr><th scope="row">${escapeHtml(r.head)}</th>
        <td>${escapeHtml(r.items)}
          <button class="mini" data-say="${escapeHtml(r.items.replace(/[·]/g, ',').replace(/_/g, ' '))}"
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

    <article class="card review-card">
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
}
/* ---------- Drill menu ---------- */
function viewDrills(unit) {
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
        const locked = a.id === 'pairsx' && !cleared(unit, 'pairs');
        return `
        <article class="unit act ${passed ? 'mastered' : best ? 'in-progress' : 'new'}" style="--i:${i}">
          <div class="unit-top">
            <span class="unit-num">${String(i + 1).padStart(2, '0')}</span>
            ${a.hard ? '<span class="chip chip-hard">Expert</span>' : ''}
            ${passed ? '<span class="chip chip-mastered">Cleared</span>' : best ? `<span class="chip chip-in-progress">${best}%</span>` : ''}
          </div>
          <h3>${a.name}</h3>
          <p class="unit-tag">${a.blurb}</p>
          <div class="meter"><span style="width:${best}%"></span></div>
          <div class="unit-actions">
            <button class="btn ${passed ? 'btn-ghost' : 'btn-solid'}" data-run="${a.id}" data-unit="${unit.id}"
                    ${locked ? 'disabled' : ''}>
              ${locked ? 'Clear Minimal Pairs first' : best ? 'Try again' : 'Start'}
            </button>
          </div>
        </article>`;
    }).join('')}
    </div>
  `);
}
let session = null;
function startQuiz(unit, activity) {
    const questions = unit ? buildQuestions(unit, activity) : buildExam();
    session = {
        questions, i: 0, correct: 0, answered: false, unit, activity,
        title: unit ? ACTIVITIES.find((a) => a.id === activity).name : 'Chapter 15 Listening Exam',
    };
    renderQuestion();
}
function renderQuestion() {
    if (!session)
        return;
    const { questions, i, unit, title } = session;
    const q = questions[i];
    const pct = Math.round((i / questions.length) * 100);
    let plays = 0;
    setView(`
    <div class="stack">
      <nav class="crumb">
        <button class="link" data-go="${unit ? 'drills' : 'home'}" data-unit="${unit ? unit.id : ''}">&larr; Leave</button>
        <span>${escapeHtml(title)}</span>
      </nav>
      <div class="qbar"><span style="width:${pct}%"></span></div>
      <p class="qcount">Question ${i + 1} of ${questions.length}<span class="dot">&middot;</span>${session.correct} correct
        <span class="dot">&middot;</span><span id="replays">${q.maxReplays} replay${q.maxReplays === 1 ? '' : 's'} left</span></p>
    </div>

    <section class="card quiz">
      <div class="player">
        <button class="playbtn" id="play" aria-label="Play the audio">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="wave" id="wave" aria-hidden="true">${'<i></i>'.repeat(9)}</div>
        ${q.noSlow ? '' : '<button class="mini slow" id="slow">Slower</button>'}
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
    const wave = $('#wave');
    const playBtn = $('#play');
    const play = (rateMul) => {
        wave.classList.add('on');
        speaker.stop();
        const started = Date.now();
        void speaker.sequence(q.audio, 380, rateMul ?? q.rate ?? 1).then(() => {
            setTimeout(() => wave.classList.remove('on'), Math.max(0, 420 - (Date.now() - started)));
            // Only warm the next question once this one has finished speaking. The
            // neural engine generates on a single worker thread, so starting the
            // prefetch earlier would make the student wait behind it.
            if (i + 1 < questions.length) {
                speaker.prefetch(questions[i + 1].audio, questions[i + 1].rate ?? 1);
            }
        });
    };
    const useReplay = (rateMul) => {
        if (session?.answered) {
            play(rateMul);
            return;
        }
        if (plays >= q.maxReplays)
            return;
        plays++;
        const left = q.maxReplays - plays;
        $('#replays').textContent = `${left} replay${left === 1 ? '' : 's'} left`;
        if (left === 0) {
            playBtn.disabled = true;
            const slow = document.getElementById('slow');
            if (slow)
                slow.disabled = true;
        }
        play(rateMul);
    };
    playBtn.addEventListener('click', () => useReplay());
    const slowBtn = document.getElementById('slow');
    if (slowBtn)
        slowBtn.addEventListener('click', () => useReplay(0.6));
    // The first play is free and does not count against the replay budget.
    setTimeout(() => play(), 260);
    keyHandler = (e) => {
        if (!session || session.answered)
            return;
        if (e.key.toLowerCase() === 'r') {
            useReplay();
            return;
        }
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= q.options.length)
            answer(n - 1);
    };
    document.addEventListener('keydown', keyHandler);
    $('#options').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-pick]');
        if (btn)
            answer(Number(btn.dataset.pick));
    });
}
function answer(choice) {
    if (!session || session.answered)
        return;
    session.answered = true;
    const q = session.questions[session.i];
    const right = choice === q.answer;
    if (right)
        session.correct++;
    $('#play').disabled = false;
    const slow = document.getElementById('slow');
    if (slow)
        slow.disabled = false;
    Array.from(document.querySelectorAll('.opt')).forEach((el, k) => {
        el.setAttribute('disabled', 'true');
        if (k === q.answer)
            el.classList.add('right');
        if (k === choice && !right)
            el.classList.add('wrong');
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
function advance() {
    if (!session)
        return;
    session.i++;
    session.answered = false;
    if (session.i >= session.questions.length)
        finishQuiz();
    else
        renderQuestion();
}
function finishQuiz() {
    if (!session)
        return;
    const { correct, questions, unit, activity, title } = session;
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= PASS;
    if (unit) {
        const prev = state.units[unit.id].best[activity] || 0;
        if (score > prev)
            state.units[unit.id].best[activity] = score;
    }
    else {
        state.exam.taken++;
        if (score > state.exam.best)
            state.exam.best = score;
    }
    saveState();
    report(unit, activity, score, correct, questions.length);
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
        ? mastered ? `Unit ${unit.num} is fully mastered.` : unit ? 'On to the next activity.' : 'Strong finish.'
        : `You need ${PASS}% to clear this one. Re-read the study cards and try again &mdash; the questions reshuffle every time.`}</p>
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
const unitById = (id) => UNITS.find((u) => u.id === id);
function route(go, unitId) {
    switch (go) {
        case 'home':
            viewHome();
            break;
        case 'review':
            viewReview(unitById(unitId), 0);
            break;
        case 'drills':
            viewDrills(unitById(unitId));
            break;
        case 'exam':
            startQuiz(null, 'exam');
            break;
    }
}
function wireGlobalClicks() {
    document.addEventListener('click', (e) => {
        const el = e.target;
        const say = el.closest('[data-say]');
        if (say) {
            const wasOn = say.classList.contains('speaking');
            document.querySelectorAll('.speaking').forEach((n) => n.classList.remove('speaking'));
            speaker.stop();
            if (!wasOn) {
                say.classList.add('speaking');
                void speaker.say(say.dataset.say).then(() => say.classList.remove('speaking'));
            }
            return;
        }
        const go = el.closest('[data-go]');
        if (go && !go.hasAttribute('disabled')) {
            route(go.dataset.go, go.dataset.unit || undefined);
            return;
        }
        const run = el.closest('[data-run]');
        if (run && !run.hasAttribute('disabled')) {
            startQuiz(unitById(run.dataset.unit), run.dataset.run);
            return;
        }
        const rev = el.closest('[data-review]');
        if (rev && !rev.hasAttribute('disabled')) {
            viewReview(unitById($('#view').dataset.unit), Number(rev.dataset.review));
            return;
        }
        const fin = el.closest('[data-finish-review]');
        if (fin) {
            state.units[fin.dataset.finishReview].reviewed = true;
            saveState();
            viewDrills(unitById(fin.dataset.finishReview));
            return;
        }
    });
}
function wireSettings() {
    const rate = $('#rate');
    const rateOut = $('#rate-out');
    const voice = $('#voice');
    const kvoice = $('#kvoice');
    const theme = $('#theme');
    const panel = $('#settings');
    const toggle = $('#settings-toggle');
    const engineRadios = Array.from(document.querySelectorAll('input[name="engine"]'));
    rate.value = String(state.settings.rate);
    rateOut.textContent = `${state.settings.rate.toFixed(2)}×`;
    rate.addEventListener('input', () => {
        state.settings.rate = Number(rate.value);
        rateOut.textContent = `${state.settings.rate.toFixed(2)}×`;
        saveState();
    });
    kvoice.innerHTML = KOKORO_VOICES
        .map((v) => `<option value="${v.id}" ${v.id === state.settings.kokoroVoice ? 'selected' : ''}>${escapeHtml(v.name)}</option>`)
        .join('');
    kvoice.addEventListener('change', () => {
        state.settings.kokoroVoice = kvoice.value;
        saveState();
        void speaker.say('This is the voice you will hear.');
    });
    const paint = () => {
        // Device voices
        const list = speaker.device.list();
        if (!list.length) {
            voice.innerHTML = '<option>No English voice found</option>';
            voice.disabled = true;
        }
        else {
            voice.disabled = false;
            voice.innerHTML = list
                .map((v) => `<option value="${escapeHtml(v.voiceURI)}" ${v.voiceURI === state.settings.voiceURI ? 'selected' : ''}>${escapeHtml(v.name)} — ${escapeHtml(v.lang)}</option>`)
                .join('');
        }
        // Engine panels
        const useK = state.settings.engine === 'kokoro';
        $('#device-opts').hidden = useK;
        $('#kokoro-opts').hidden = !useK;
        engineRadios.forEach((r) => { r.checked = r.value === state.settings.engine; });
        // Kokoro status
        const k = speaker.kokoro;
        const box = $('#kstatus');
        if (!useK) {
            box.hidden = true;
        }
        else {
            box.hidden = false;
            if (k.status === 'loading') {
                box.className = 'kstatus loading';
                box.innerHTML = `<span class="spin" aria-hidden="true"></span>
          Downloading the Kokoro model… ${k.progress}%
          <span class="kbar"><i style="width:${k.progress}%"></i></span>
          <small>About 90 MB, once. Your browser caches it afterwards.</small>`;
            }
            else if (k.status === 'ready') {
                box.className = 'kstatus ready';
                box.innerHTML = 'Kokoro is loaded and ready.';
            }
            else if (k.status === 'error') {
                box.className = 'kstatus error';
                box.innerHTML = `Kokoro could not load, so the device voices are being used instead.
          <small>${escapeHtml(k.error).slice(0, 160)}</small>`;
            }
            else {
                box.className = 'kstatus';
                box.innerHTML = 'Kokoro will download the first time you play something.';
            }
        }
        $('#no-audio').hidden = speaker.device.available || state.settings.engine === 'kokoro';
    };
    speaker.onchange = paint;
    engineRadios.forEach((r) => r.addEventListener('change', () => {
        if (!r.checked)
            return;
        state.settings.engine = r.value;
        saveState();
        paint();
        if (state.settings.engine === 'kokoro') {
            speaker.kokoro.load().then(() => { paint(); void speaker.say('Kokoro is ready.'); }).catch(paint);
        }
    }));
    voice.addEventListener('change', () => {
        state.settings.voiceURI = voice.value;
        saveState();
        void speaker.say('This is the voice you will hear.');
    });
    const who = $('#whoami-field');
    if (reportingOn() && state.student) {
        who.hidden = false;
        $('#whoami').textContent = `${state.student.name} · ${state.student.section}`;
        $('#changeme').addEventListener('click', () => {
            state.student = null;
            saveState();
            viewIdentity();
        });
    }
    paintOutbox();
    $('#test').addEventListener('click', () => void speaker.say('She sells sea shells. They think this. He mentioned the cats and the catch.'));
    const applyTheme = () => {
        const t = state.settings.theme;
        if (t === 'auto')
            delete document.documentElement.dataset.theme;
        else
            document.documentElement.dataset.theme = t;
        theme.textContent = t === 'auto' ? 'Theme: Auto' : t === 'dark' ? 'Theme: Dark' : 'Theme: Light';
    };
    theme.addEventListener('click', () => {
        const order = ['auto', 'dark', 'light'];
        state.settings.theme = order[(order.indexOf(state.settings.theme) + 1) % 3];
        applyTheme();
        saveState();
    });
    applyTheme();
    toggle.addEventListener('click', () => {
        const open = panel.hasAttribute('hidden');
        if (open)
            panel.removeAttribute('hidden');
        else
            panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', String(open));
    });
    $('#reset').addEventListener('click', () => {
        if (!confirm('Erase all progress on this device? This cannot be undone.'))
            return;
        const keep = state.settings;
        state = blankState();
        state.settings = keep;
        loadState();
        saveState();
        viewHome();
    });
    paint();
}
function boot() {
    loadState();
    speaker.init();
    wireGlobalClicks();
    wireSettings();
    if (reportingOn() && !state.student)
        viewIdentity();
    else
        viewHome();
    void flushOutbox();
    // Anything stranded by a dropped connection goes out when the network returns.
    window.addEventListener('online', () => void flushOutbox());
}
if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot);
else
    boot();
