const root = document.documentElement;
const toggle = document.querySelector('.language-toggle');
const current = document.querySelector('.lang-current');
const localized = [...document.querySelectorAll('[data-en][data-bn]')];
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress span');
const heroVideo = document.querySelector('.hero-video');
const videoToggle = document.querySelector('.video-toggle');
const videoIcon = document.querySelector('.video-toggle-icon');
const videoLabel = document.querySelector('.video-toggle-label');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// The inline head script adds .motion only when motion is allowed.
const motionOK = root.classList.contains('motion') && !reduceMotion;
const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
let language = 'en';

/* ---------- Split headings into words ---------- */
const splitTargets = [...new Set([...document.querySelectorAll('[data-split], .section h2:not(.sr-only):not(.v-prize-title)')])];
splitTargets.forEach((element) => { if (!element.dataset.split) element.dataset.split = 'rise'; });

function splitWords(element) {
  const words = element.textContent.trim().split(/\s+/);
  const accent = Number(element.dataset.accentLast || 0);
  element.textContent = '';
  words.forEach((word, index) => {
    const outer = document.createElement('span');
    outer.className = accent && index >= words.length - accent ? 'word is-accent' : 'word';
    const inner = document.createElement('span');
    inner.className = 'word-inner';
    inner.style.setProperty('--i', index);
    inner.textContent = word;
    outer.append(inner);
    element.append(outer);
    if (index === words.length - 1) return;
    const sentenceEnd = element.dataset.break === 'sentence' && /[.।]$/.test(word);
    element.append(sentenceEnd ? document.createElement('br') : ' ');
  });
}
splitTargets.forEach(splitWords);

function updateVideoToggle() {
  if (!heroVideo) return;
  const isPaused = heroVideo.paused;
  videoToggle.setAttribute('aria-pressed', String(isPaused));
  videoToggle.setAttribute('aria-label', isPaused ? 'Play background video' : 'Pause background video');
  videoIcon.textContent = isPaused ? '▶' : 'Ⅱ';
  videoLabel.textContent = language === 'bn'
    ? (isPaused ? 'ভিডিও চালান' : 'ভিডিও থামান')
    : (isPaused ? 'Play film' : 'Pause film');
}

function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
  document.body.classList.toggle('is-bengali', language === 'bn');
  localized.forEach((element) => {
    element.textContent = element.dataset[language];
  });
  splitTargets.forEach(splitWords);
  current.textContent = language === 'en' ? 'বাংলা' : 'English';
  toggle.setAttribute('aria-pressed', String(language === 'bn'));
  toggle.setAttribute('aria-label', language === 'en' ? 'বাংলায় দেখুন' : 'View in English');
  updateVideoToggle();
  updateAnthemState();
  renderMapCard();
  refreshLayout();
}

toggle.addEventListener('click', () => setLanguage(language === 'en' ? 'bn' : 'en'));

if (heroVideo && videoToggle) {
  videoToggle.addEventListener('click', async () => {
    if (heroVideo.paused) {
      try { await heroVideo.play(); } catch (_) { /* Browser may still require a direct gesture. */ }
    } else {
      heroVideo.pause();
    }
    updateVideoToggle();
  });
  heroVideo.addEventListener('play', updateVideoToggle);
  heroVideo.addEventListener('pause', updateVideoToggle);
  updateVideoToggle();
}

/* ---------- Applicant steps ---------- */
const applicantTabs = [...document.querySelectorAll('.applicant-step')];
const applicantPanels = [...document.querySelectorAll('.applicant-panel')];

function activateApplicantStep(index) {
  applicantTabs.forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  applicantPanels.forEach((panel, panelIndex) => {
    const active = panelIndex === index;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
}

applicantTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateApplicantStep(index));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    const nextIndex = (index + direction + applicantTabs.length) % applicantTabs.length;
    activateApplicantStep(nextIndex);
    applicantTabs[nextIndex].focus();
  });
});

/* ---------- Readiness checker ---------- */
const readinessInputs = [...document.querySelectorAll('.readiness-checker input')];
const readinessScore = document.querySelector('.readiness-score');
const readinessProgress = document.querySelector('.checker-progress span');
const readinessMessage = document.querySelector('.checker-message');

function updateReadiness() {
  if (!readinessScore) return;
  const count = readinessInputs.filter((input) => input.checked).length;
  readinessScore.textContent = String(count);
  readinessProgress.style.width = `${count * 25}%`;
  readinessMessage.dataset.en = count === 4
    ? 'You are prepared for the announced applicant journey. Wait for the verified application link.'
    : 'Complete the checklist to prepare for the official application.';
  readinessMessage.dataset.bn = count === 4
    ? 'ঘোষিত আবেদন যাত্রার জন্য আপনি প্রস্তুত। যাচাইকৃত আবেদন লিঙ্কের জন্য অপেক্ষা করুন।'
    : 'সরকারি আবেদনের প্রস্তুতির জন্য তালিকাটি সম্পূর্ণ করুন।';
  readinessMessage.textContent = readinessMessage.dataset[language];
  try { localStorage.setItem('krl-applicant-readiness', JSON.stringify(readinessInputs.map((input) => input.checked))); } catch (_) { /* Storage can be unavailable in privacy mode. */ }
}

try {
  const savedReadiness = JSON.parse(localStorage.getItem('krl-applicant-readiness') || '[]');
  readinessInputs.forEach((input, index) => { input.checked = Boolean(savedReadiness[index]); });
} catch (_) { /* Ignore malformed or unavailable local storage. */ }
readinessInputs.forEach((input) => input.addEventListener('change', updateReadiness));
updateReadiness();

/* ---------- Teams ---------- */
const teams = [
  { en: "Cooch Behar Royals", bn: "কোচবিহার রয়্যালস", slug: 'cooch-behar-royals', chant: "রাজার জেলার চাষী আমরা, জিততে ভালোবাসি" },
  { en: "Sundari Terai", bn: "সুন্দরী তেরাই", slug: 'sundari-terai', chant: "বাঘের মতো লড়াই করব, ফসলে আজ ঘর ভরব" },
  { en: "Pahadi Sur", bn: "পাহাড়ি সুর", slug: 'pahadi-sur', chant: "পাহাড় ভালোবাসি, ফসল ফলাবো রাশি রাশি" },
  { en: "Dinajpur Defenders", bn: "দিনাজপুর ডিফেন্ডার্স", slug: 'dinajpur-defenders', chant: "দিনাজপুর এগিয়ে থাকে, দেখি কে হারায় কাকে" },
  { en: "Malda Joddha", bn: "মালদা যোদ্ধা", slug: 'malda-joddha', chant: "ফলের রাজা আমের দেশে, মালদাই জয়ী হবে শেষে" },
  { en: "Murshidabad Maati", bn: "মুর্শিদাবাদ মাটি", slug: 'murshidabad-maati', chant: "নবাবের মাটি নবাবের দেশ, নবাবেরই মতো জেতা অভ্যেস" },
  { en: "Nadia Nayak", bn: "নদীয়া নায়ক", slug: 'nadia-nayak', chant: "নদীয়ার মাটি হবে নাকো ব্যর্থ, আমরাই জিতব, এটাই সত্য" },
  { en: "Chobbish Paraganar Poli Maati", bn: "চব্বিশ পরগনার পলি মাটি", slug: 'chobbish-paraganar-poli-maati', chant: "গঙ্গা দিয়ে বইছে জল, আনন্দে আজ ফলাই ফসল" },
  { en: "Sundarbaner Baagh", bn: "সুন্দরবনের বাঘ", slug: 'sundarbaner-baagh', chant: "বনবিবির শপথ নিয়ে, বলছি যাবো ট্রফি নিয়ে" },
  { en: "Pragatisheel Shilpa Taluk", bn: "প্রগতিশীল শিল্প তালুক", slug: 'pragatisheel-shilpa-taluk', chant: "" },
  { en: "Harit Hooghly", bn: "হরিত হুগলি", slug: 'harit-hooghly', chant: "হুগলির হাসি হুগলির মজা, আমরাই হবো যুদ্ধের রাজা" },
  { en: "Medinipur Agniban", bn: "মেদিনীপুর অগ্নিবাণ", slug: 'medinipur-agniban', chant: "মাটির জেলা মেদিনীপুরে, ফলাব ফসল গোলা ভরে" },
  { en: "Bankura Ghoda", bn: "বাঁকুড়ার ঘোড়া", slug: 'bankura-ghoda', chant: "শক্ত মাটি কম জল, তবুও ফলাই জেতার ফসল" },
  { en: "Sufala Bardhaman", bn: "সুফলা বর্ধমান", slug: 'sufala-bardhaman', chant: "আমরা চাষী বর্ধমানের, দৌড়াবো আজ সমুখপানে" },
  { en: "Birbhum Ravi", bn: "বীরভূমের রবি", slug: 'birbhum-ravi', chant: "লাল মাটির দাপটে, ফলবে ফসল মাঠে মাঠে" }
];

/* ---------- Anthem ---------- */
const anthemAudio = document.querySelector('.anthem-audio');
const anthemCard = document.querySelector('.anthem-card');
const anthemToggle = document.querySelector('.anthem-toggle');
const anthemIcon = document.querySelector('.anthem-icon');
const anthemProgress = document.querySelector('.anthem-progress');
const anthemTime = document.querySelector('.anthem-time');

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function updateAnthemState() {
  if (!anthemAudio) return;
  const playing = !anthemAudio.paused;
  anthemCard.classList.toggle('is-playing', playing);
  anthemToggle.setAttribute('aria-pressed', String(playing));
  anthemToggle.setAttribute('aria-label', language === 'bn'
    ? (playing ? 'লীগের সংগীত থামান' : 'লীগের সংগীত চালান')
    : (playing ? 'Pause league anthem' : 'Play league anthem'));
  anthemIcon.textContent = playing ? 'Ⅱ' : '▶';
  const duration = Number.isFinite(anthemAudio.duration) ? anthemAudio.duration : 196;
  anthemProgress.max = String(Math.round(duration));
  anthemProgress.value = String(Math.round(anthemAudio.currentTime));
  anthemTime.textContent = `${formatTime(anthemAudio.currentTime)} / ${formatTime(duration)}`;
}

if (anthemAudio) {
anthemToggle.addEventListener('click', async () => {
  if (anthemAudio.paused) {
    try { await anthemAudio.play(); } catch (_) { /* Playback may require another direct gesture. */ }
  } else {
    anthemAudio.pause();
  }
  updateAnthemState();
});
anthemAudio.addEventListener('play', updateAnthemState);
anthemAudio.addEventListener('pause', updateAnthemState);
anthemAudio.addEventListener('timeupdate', updateAnthemState);
anthemAudio.addEventListener('durationchange', updateAnthemState);
anthemAudio.addEventListener('ended', updateAnthemState);
anthemProgress.addEventListener('input', () => {
  anthemAudio.currentTime = Number(anthemProgress.value);
  updateAnthemState();
});
updateAnthemState();
}

/* ---------- FAQ ---------- */
const faqItems = [...document.querySelectorAll('.faq-list details')];

faqItems.forEach((item) => item.addEventListener('toggle', () => {
  if (!item.open) return;
  faqItems.forEach((other) => { if (other !== item) other.open = false; });
}));

/* ---------- Count-ups ---------- */
const counters = [...document.querySelectorAll('[data-count]')];
function runCounter(element) {
  const end = Number(element.dataset.count);
  const duration = reduceMotion ? 0 : 1400;
  const startTime = performance.now();
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const format = (value) => element.dataset.format === 'comma' ? value.toLocaleString('en-IN') : String(value);
  const frame = (now) => {
    const progressValue = duration === 0 ? 1 : Math.min(1, (now - startTime) / duration);
    element.textContent = `${prefix}${format(Math.round(end * easeOut(progressValue)))}${suffix}`;
    if (progressValue < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

if ('IntersectionObserver' in window && motionOK) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: .6 });
  counters.forEach((counter) => counterObserver.observe(counter));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (document.activeElement === link) link.blur();
  });
});

/* =========================================================
   Motion engine
   ========================================================= */

/* ---------- Scroll reveals ---------- */
const revealUp = '.hero-copy, .hero-actions, .faq-intro > p:not(.section-kicker), .roots-spotlight-copy > p:not(.section-kicker), .roots-spotlight-copy > .button, .manifesto-copy > p, blockquote cite, .application-status, .organizer-strip-inner > *, .roots-map, .instalments, .anthem-card, .applicant-portal, .v-intro-row, .v-points-bar, .v-escalator-copy, .v-steps, .v-squad-ring, .v-season, .v-track, .v-economy, .v-cascade, .v-retail, .v-prize-line, .v-cta, .v-team-card, .v-map-stage';
const revealStagger = '.pillars-grid, .roadmap-grid, .faq-list, .v-chapters, .v-pillars, .v-rules, .v-guardians, .v-backer-row, .v-pipeline, .v-awards';

if (motionOK && 'IntersectionObserver' in window) {
  const kickers = [...document.querySelectorAll('.section-kicker, .eyebrow')];
  const ups = [...document.querySelectorAll(revealUp)];
  const staggers = [...document.querySelectorAll(revealStagger)];
  kickers.forEach((element) => element.classList.add('rv', 'rv-kicker'));
  ups.forEach((element) => element.classList.add('rv'));
  document.querySelectorAll('.organizer-strip-inner > *').forEach((element, index) => element.style.setProperty('--d', `${index * .12}s`));
  document.querySelectorAll('.hero-actions').forEach((element) => element.style.setProperty('--d', '1.75s'));
  staggers.forEach((group) => {
    group.classList.add('rv-stagger');
    [...group.children].forEach((child, index) => child.style.setProperty('--si', Math.min(index, 8)));
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      element.classList.add('is-in');
      observer.unobserve(element);
      if (element.classList.contains('rv-stagger')) {
        // Hand transforms back to hover styles once the entrance has played.
        const settle = 1100 + Math.min(element.children.length, 9) * 85;
        setTimeout(() => element.classList.remove('rv-stagger'), settle);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -9% 0px' });
  const photos = [...document.querySelectorAll('.ph')];
  photos.forEach((element) => element.classList.add('rv-ph'));
  [...kickers, ...ups, ...staggers, ...splitTargets, ...photos].forEach((element) => revealObserver.observe(element));
}

/* ---------- Stats scene: pinned, one number per scroll step ---------- */
const statScene = document.querySelector('.stat-scene');
const statSticky = statScene ? statScene.querySelector('.stat-sticky') : null;
const statSlides = statScene ? [...statScene.querySelectorAll('.stat-slide')] : [];
const statNumbers = statSlides.map((slide) => slide.querySelector('.stat-number'));
const statRail = statScene ? [...statScene.querySelectorAll('.stat-rail i')] : [];

function formatStat(element, value) {
  const formatted = element.dataset.format === 'comma' ? value.toLocaleString('en-IN') : String(value);
  return `${element.dataset.prefix || ''}${formatted}`;
}

function fitStatNumbers() {
  statNumbers.forEach((element) => {
    const slide = element.parentElement;
    const styles = getComputedStyle(slide);
    const availableWidth = slide.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const availableHeight = window.innerHeight * (window.innerWidth < 560 ? .4 : .5);
    element.style.fontSize = '100px';
    element.textContent = formatStat(element, Number(element.dataset.stat));
    const measured = element.getBoundingClientRect().width || 1;
    const size = Math.min(100 * (availableWidth * .94) / measured, availableHeight / .74);
    element.style.fontSize = `${Math.floor(size)}px`;
    element.dataset.shown = '';
  });
}

function renderStats() {
  const rect = statScene.getBoundingClientRect();
  const viewport = window.innerHeight;
  const total = Math.max(1, rect.height - viewport);
  const last = statSlides.length - 1;
  const position = clamp(-rect.top / total) * last;
  const entry = clamp((viewport - rect.top) / viewport);
  const reveal = (index) => (index === 0 ? 1 : easeInOut(clamp((position - (index - 1) - .12) / .7)));

  statSlides.forEach((slide, index) => {
    const shown = reveal(index);
    const leaving = index < last ? reveal(index + 1) : 0;
    slide.style.setProperty('--r', shown.toFixed(4));
    slide.style.setProperty('--o', leaving.toFixed(4));
    const number = statNumbers[index];
    const countProgress = index === 0 ? easeOut(clamp(entry * 1.15)) : easeOut(shown);
    const text = formatStat(number, Math.round(Number(number.dataset.stat) * countProgress));
    if (number.dataset.shown !== text) {
      number.textContent = text;
      number.dataset.shown = text;
    }
  });

  const active = clamp(Math.round(position), 0, last);
  statRail.forEach((bar, index) => bar.classList.toggle('is-active', index === active));
  statSticky.dataset.tone = ['lime', 'red'].find((tone) => statSlides[active].classList.contains(`stat-${tone}`)) || 'blue';
  statSticky.classList.toggle('is-done', position > last - .08);
}

/* ---------- Roots: route drawn by scroll, instalments fill ---------- */
const roots = document.querySelector('.roots-spotlight');
const routeGhost = roots ? roots.querySelector('.route-ghost') : null;
const routeLine = roots ? roots.querySelector('.route-line') : null;
const routeDot = roots ? roots.querySelector('.route-dot') : null;
const routeLength = routeGhost ? routeGhost.getTotalLength() : 0;
const mapTags = roots ? [
  [roots.querySelector('.tag-globe'), .01],
  [roots.querySelector('.tag-year'), .5],
  [roots.querySelector('.tag-farm'), .96]
] : [];
const instalments = roots ? [...roots.querySelectorAll('.instalment-bar li')] : [];
const rootsDrift = roots ? roots.querySelector('.roots-drift') : null;

function renderRoots() {
  if (!roots) return;
  const rect = roots.getBoundingClientRect();
  const viewport = window.innerHeight;
  const p = clamp((viewport - rect.top) / (viewport + rect.height));
  const route = clamp((p - .16) / .38);
  routeLine.style.strokeDashoffset = (1 - route).toFixed(4);
  const point = routeGhost.getPointAtLength(route * routeLength);
  routeDot.setAttribute('cx', point.x.toFixed(1));
  routeDot.setAttribute('cy', point.y.toFixed(1));
  mapTags.forEach(([tag, threshold]) => tag.classList.toggle('is-on', route >= threshold));
  const filled = clamp((p - .3) / .32) * instalments.length;
  instalments.forEach((item, index) => {
    const fill = clamp(filled - index);
    item.style.setProperty('--fill', fill.toFixed(3));
    item.classList.toggle('is-full', fill > .55);
  });
  rootsDrift.style.setProperty('--drift', (p * 38).toFixed(2));
}

/* ---------- Quote lights up word by word ---------- */
const fillTargets = [...document.querySelectorAll('[data-split="fill"]')];
function renderFill() {
  const viewport = window.innerHeight;
  fillTargets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const p = clamp((viewport * .88 - rect.top) / (viewport * .45));
    const words = element.querySelectorAll('.word-inner');
    const lit = Math.round(p * words.length);
    words.forEach((word, index) => word.classList.toggle('is-lit', index < lit));
  });
}

/* ---------- Parallax + hero ---------- */
const hero = document.querySelector('.hero');
const parallaxItems = [
  [document.querySelector('.manifesto'), -.18],
  [document.querySelector('footer'), -.1]
].filter(([element]) => element);
// Photos drift a little inside their frames while on screen.
const visiblePhotos = new Set();
if ('IntersectionObserver' in window) {
  const photoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visiblePhotos.add(entry.target);
      else visiblePhotos.delete(entry.target);
    });
  }, { rootMargin: '10% 0px' });
  document.querySelectorAll('.ph').forEach((photo) => photoObserver.observe(photo));
}

function renderParallax() {
  const viewport = window.innerHeight;
  visiblePhotos.forEach((photo) => {
    const rect = photo.getBoundingClientRect();
    const limit = rect.height * .045;
    const offset = Math.max(-limit, Math.min(limit, (rect.top + rect.height / 2 - viewport / 2) * -.06));
    photo.style.setProperty('--py', `${offset.toFixed(1)}px`);
  });
  if (hero) hero.style.setProperty('--hero-p', clamp(window.scrollY / hero.offsetHeight).toFixed(3));
  parallaxItems.forEach(([element, speed]) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > viewport) return;
    const offset = (rect.top + rect.height / 2 - viewport / 2) * speed;
    element.style.setProperty('--para', offset.toFixed(1));
  });
}

/* ---------- Marquees: speed follows scroll velocity ---------- */
const marquees = [...document.querySelectorAll('.marquee')].map((element) => {
  const track = element.querySelector('.marquee-track');
  return { element, track, unit: [...track.children], unitWidth: 0, x: 0, dir: Number(element.dataset.direction || 1), visible: true };
});

function setupMarquees() {
  marquees.forEach((marquee) => {
    const { track, unit } = marquee;
    track.replaceChildren(...unit);
    const firstClone = unit.map((node) => node.cloneNode(true));
    track.append(...firstClone);
    marquee.unitWidth = firstClone[0].offsetLeft - unit[0].offsetLeft;
    if (marquee.unitWidth <= 0) return;
    const copies = Math.ceil(window.innerWidth / marquee.unitWidth) + 1;
    for (let copy = 1; copy < copies; copy += 1) track.append(...unit.map((node) => node.cloneNode(true)));
    marquee.x %= marquee.unitWidth;
  });
}

/* ---------- Header + progress + nav ---------- */
let lastHeaderY = window.scrollY;
function renderChrome() {
  const y = window.scrollY;
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.transform = `scaleX(${Math.min(1, y / scrollable)})`;
  header.classList.toggle('is-scrolled', y > 24);
  const delta = y - lastHeaderY;
  if (Math.abs(delta) > 6) {
    header.classList.toggle('is-hidden', motionOK && delta > 0 && y > window.innerHeight * .7);
    lastHeaderY = y;
  }
}

const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const inBand = new Set();
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) inBand.add(entry.target.id);
      else inBand.delete(entry.target.id);
    });
    navLinks.forEach((link) => link.classList.toggle('is-current', inBand.has(link.getAttribute('href').slice(1))));
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) navObserver.observe(target);
  });
}

/* ---------- Cursor ring + magnetic controls ---------- */
const cursor = document.querySelector('.cursor-ring');
const pointer = { x: -100, y: -100, cx: -100, cy: -100 };
if (motionOK && finePointer) {
  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    cursor.classList.add('is-on');
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  document.addEventListener('pointerover', (event) => {
    cursor.classList.toggle('is-hover', Boolean(event.target.closest('a, button, summary, label, input, [data-tilt], .team-chip')));
  });

  document.querySelectorAll('.button, .team-arrow, .anthem-toggle, .language-toggle, .footer-top').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * .22;
      const y = (event.clientY - bounds.top - bounds.height / 2) * .3;
      element.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
}

/* ---------- KRL Vision: animated team map ---------- */
const mapScene = document.querySelector('.v-map-scene');
const mapSvg = mapScene ? mapScene.querySelector('.v-map') : null;
const mapRail = mapScene ? mapScene.querySelector('.v-map-rail') : null;
const mapCard = mapScene ? mapScene.querySelector('.v-team-card') : null;
const mapData = window.KRL_MAP;
const SVG_NS = 'http://www.w3.org/2000/svg';
const toBengaliDigits = (value) => String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[digit]);
// Team 8 and 9 share both 24 Parganas districts; their markers sit on the north and the Sundarban south.
const nodeAnchors = { 8: ['north-24-parganas', 0], 9: ['south-24-parganas', .22] };
const teamNotes = {
  8: { en: 'Shares North and South 24 Parganas with Sundarbaner Baagh, split by constituency', bn: 'উত্তর ও দক্ষিণ ২৪ পরগনা সুন্দরবনের বাঘের সঙ্গে ভাগ, বিধানসভা কেন্দ্র অনুযায়ী' },
  9: { en: 'Mangrove resilience in the Sundarban belt', bn: 'সুন্দরবন অঞ্চলে ম্যানগ্রোভের শক্তি' },
  10: { en: 'Urban rooftop farming in Kolkata and Howrah', bn: 'কলকাতা ও হাওড়ায় শহরের ছাদে চাষ' }
};
let mapPaths = [];
let mapNodes = [];
let mapButtons = [];
let mapProgressLine;
let mapIndex = -1;
let mapCardTimer;

function svgElement(tag, attributes) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function buildMap() {
  mapSvg.setAttribute('viewBox', mapData.viewBox);
  const districtLayer = svgElement('g', { class: 'v-districts' });
  mapPaths = mapData.districts.map((district) => {
    const path = svgElement('path', { d: district.d, class: 'v-dist', pathLength: 1 });
    path.dataset.teams = district.teams.join(' ');
    path.dataset.slug = district.slug;
    path.addEventListener('click', () => {
      const options = district.teams.map((team) => team - 1);
      const next = options.includes(mapIndex) ? options[(options.indexOf(mapIndex) + 1) % options.length] : options[0];
      goToMapTeam(next);
    });
    districtLayer.append(path);
    return path;
  });
  mapSvg.append(districtLayer);

  const centers = teams.map((_, index) => {
    const team = index + 1;
    const anchor = nodeAnchors[team];
    const owned = anchor ? mapPaths.filter((path) => path.dataset.slug === anchor[0]) : mapPaths.filter((path) => path.dataset.teams.split(' ').map(Number).includes(team));
    const boxes = owned.map((path) => path.getBBox());
    const x1 = Math.min(...boxes.map((box) => box.x));
    const y1 = Math.min(...boxes.map((box) => box.y));
    const x2 = Math.max(...boxes.map((box) => box.x + box.width));
    const y2 = Math.max(...boxes.map((box) => box.y + box.height));
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 + (anchor ? anchor[1] * (y2 - y1) : 0) };
  });
  const route = `M${centers.map((point) => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' L')}`;
  mapSvg.append(svgElement('path', { d: route, class: 'v-link' }));
  mapProgressLine = svgElement('path', { d: route, class: 'v-link-progress', pathLength: 1 });
  mapSvg.append(mapProgressLine);
  mapNodes = centers.map((point) => {
    const node = svgElement('g', { class: 'v-node', transform: `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})` });
    node.append(svgElement('circle', { r: 7, class: 'v-node-pulse' }), svgElement('circle', { r: 4, class: 'v-node-core' }));
    mapSvg.append(node);
    return node;
  });

  mapButtons = teams.map((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(index + 1).padStart(2, '0');
    button.addEventListener('click', () => goToMapTeam(index));
    mapRail.append(button);
    return button;
  });
}

function renderMapCard() {
  if (!mapCard || mapIndex < 0) return;
  const team = teams[mapIndex];
  const districts = mapData.districts.filter((district) => district.teams.includes(mapIndex + 1)).map((district) => district[language]);
  const seats = mapData.seats[mapIndex + 1];
  const badge = mapCard.querySelector('.v-team-badge');
  badge.src = `assets/teams/${team.slug}-${language}.webp`;
  badge.alt = language === 'bn' ? `${team.bn} দলের ব্যাজ` : `${team.en} badge`;
  mapCard.querySelector('.v-team-count').innerHTML = `<b>${String(mapIndex + 1).padStart(2, '0')}</b> / 15`;
  mapCard.querySelector('.v-team-name').textContent = team[language];
  mapCard.querySelector('.v-team-districts').textContent = districts.join(language === 'bn' ? ', ' : ' · ');
  mapCard.querySelector('.v-team-meta').textContent = language === 'bn'
    ? `${toBengaliDigits(seats)}টি বিধানসভা কেন্দ্র · ৩০০টি খামার`
    : `${seats} constituencies · 300 farms`;
  const chant = mapCard.querySelector('.v-team-chant');
  chant.hidden = !team.chant;
  chant.textContent = team.chant ? `“${team.chant}”` : '';
  const note = mapCard.querySelector('.v-team-note');
  note.hidden = !teamNotes[mapIndex + 1];
  note.textContent = teamNotes[mapIndex + 1] ? teamNotes[mapIndex + 1][language] : '';
  mapButtons.forEach((button, index) => button.setAttribute('aria-label', teams[index][language]));
}

function setMapTeam(index) {
  if (index === mapIndex) return;
  const first = mapIndex < 0;
  mapIndex = index;
  const team = index + 1;
  mapPaths.forEach((path) => {
    const owners = path.dataset.teams.split(' ').map(Number);
    path.classList.toggle('is-active', owners.includes(team));
    path.classList.toggle('is-past', !owners.includes(team) && owners.some((owner) => owner < team));
  });
  mapNodes.forEach((node, nodeIndex) => {
    node.classList.toggle('is-active', nodeIndex === index);
    node.classList.toggle('is-past', nodeIndex < index);
  });
  mapButtons.forEach((button, buttonIndex) => {
    button.classList.toggle('is-active', buttonIndex === index);
    button.classList.toggle('is-past', buttonIndex < index);
    button.setAttribute('aria-pressed', String(buttonIndex === index));
  });
  mapProgressLine.style.strokeDashoffset = (1 - index / (teams.length - 1)).toFixed(4);
  clearTimeout(mapCardTimer);
  if (first || !motionOK) {
    renderMapCard();
    return;
  }
  mapCard.classList.add('is-changing');
  mapCardTimer = setTimeout(() => {
    renderMapCard();
    mapCard.classList.remove('is-changing');
  }, 220);
}

function goToMapTeam(index) {
  if (!mapScene.classList.contains('is-pinned')) {
    setMapTeam(index);
    return;
  }
  const top = mapScene.getBoundingClientRect().top + window.scrollY;
  const travel = mapScene.offsetHeight - window.innerHeight;
  window.scrollTo({ top: top + ((index + .5) / teams.length) * travel, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function renderMap() {
  if (!mapScene) return;
  const rect = mapScene.getBoundingClientRect();
  const viewport = window.innerHeight;
  if (rect.bottom < -viewport || rect.top > viewport * 1.5) return;
  const entry = clamp((viewport - rect.top) / (viewport * .85));
  const count = mapPaths.length;
  mapPaths.forEach((path, index) => {
    const drawn = clamp(entry * 1.7 - (index / count) * .7);
    path.style.strokeDashoffset = (1 - drawn).toFixed(3);
    path.style.fillOpacity = clamp(drawn * 1.6 - .6).toFixed(3);
  });
  const linksOn = clamp(entry * 2 - 1);
  mapSvg.style.setProperty('--links', linksOn.toFixed(3));
  const p = clamp(-rect.top / Math.max(1, rect.height - viewport));
  setMapTeam(Math.min(teams.length - 1, Math.floor(p * teams.length)));
}

/* Hovering a pillar card highlights its share of the points bar. */
const pointsBar = document.querySelector('.v-points-bar');
document.querySelectorAll('.v-pillars article').forEach((card) => {
  if (!pointsBar) return;
  card.addEventListener('pointerenter', () => { pointsBar.dataset.active = card.dataset.pillar; });
  card.addEventListener('pointerleave', () => { delete pointsBar.dataset.active; });
});

if (mapScene && mapData) {
  buildMap();
  setMapTeam(0);
}

/* ---------- Frame loop ---------- */
let lastFrame = performance.now();
let lastScrollY = window.scrollY;
let velocity = 0;
let scrollDirection = 1;
let needsRender = true;

function renderScroll() {
  renderChrome();
  if (!motionOK) return;
  renderParallax();
  if (statScene && statScene.classList.contains('is-pinned')) renderStats();
  renderRoots();
  renderFill();
  renderMap();
}

function frame(now) {
  const dt = Math.min(64, now - lastFrame) / 1000;
  lastFrame = now;
  const y = window.scrollY;
  const delta = y - lastScrollY;
  lastScrollY = y;
  velocity += (delta - velocity) * .1;
  if (delta !== 0) {
    scrollDirection = delta > 0 ? 1 : -1;
    needsRender = true;
  }
  if (needsRender) {
    renderScroll();
    needsRender = false;
  }

  marquees.forEach((marquee) => {
    if (!marquee.visible || !marquee.unitWidth) return;
    const boost = 1 + Math.min(Math.abs(velocity) * .35, 9);
    marquee.x -= 70 * boost * dt * marquee.dir * scrollDirection;
    marquee.x %= marquee.unitWidth;
    if (marquee.x > 0) marquee.x -= marquee.unitWidth;
    marquee.track.style.transform = `translate3d(${marquee.x.toFixed(2)}px, 0, 0)`;
  });

  if (finePointer) {
    pointer.cx += (pointer.x - pointer.cx) * .2;
    pointer.cy += (pointer.y - pointer.cy) * .2;
    cursor.style.transform = `translate3d(${pointer.cx.toFixed(1)}px, ${pointer.cy.toFixed(1)}px, 0)`;
  }
  requestAnimationFrame(frame);
}

function refreshLayout() {
  if (motionOK) {
    fitStatNumbers();
    setupMarquees();
  }
  needsRender = true;
}

if (motionOK) {
  if (statScene) statScene.classList.add('is-pinned');
  if (mapScene) mapScene.classList.add('is-pinned');
  if ('IntersectionObserver' in window) {
    const marqueeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const marquee = marquees.find((item) => item.element === entry.target);
        if (marquee) marquee.visible = entry.isIntersecting;
      });
    });
    marquees.forEach((marquee) => marqueeObserver.observe(marquee.element));
  }
  refreshLayout();
  if (document.fonts) {
    // Measurements depend on Anton; re-fit once it has actually loaded.
    document.fonts.load('400 100px Anton').then(refreshLayout, () => {});
    document.fonts.addEventListener('loadingdone', refreshLayout);
  }
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshLayout, 150);
  });
  requestAnimationFrame(frame);
} else {
  window.addEventListener('scroll', renderChrome, { passive: true });
  renderChrome();
}

/* ---------- Phone menu ---------- */
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };
  menuToggle.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.desktop-nav a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
}

/* ---------- Remember the language across pages (shared with the district tool) ---------- */
toggle.addEventListener('click', () => {
  try { localStorage.setItem('krl-lang', JSON.stringify(language)); } catch (_) { /* Storage can be unavailable. */ }
});
// Bangla is the default; English only if the visitor chose it before.
let savedLanguage = null;
try { savedLanguage = JSON.parse(localStorage.getItem('krl-lang')); } catch (_) { /* Ignore unavailable storage. */ }
if (savedLanguage !== 'en') setLanguage('bn');
