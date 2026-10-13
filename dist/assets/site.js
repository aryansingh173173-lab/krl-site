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
const splitTargets = [...new Set([...document.querySelectorAll('[data-split], .section h2:not(.sr-only)')])];
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
  teamPrev.setAttribute('aria-label', language === 'bn' ? 'আগের দল' : 'Previous team');
  teamNext.setAttribute('aria-label', language === 'bn' ? 'পরের দল' : 'Next team');
  teamImage.alt = language === 'bn' ? `${teams[activeTeam].name} দলের ব্যাজ` : `${teams[activeTeam].name} badge`;
  faqSearch.placeholder = faqSearch.dataset[language === 'bn' ? 'placeholderBn' : 'placeholderEn'];
  filterFaq();
  updateAnthemState();
  refreshLayout();
}

toggle.addEventListener('click', () => setLanguage(language === 'en' ? 'bn' : 'en'));

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

/* ---------- Tabs ---------- */
const roleTabs = [...document.querySelectorAll('.role-tab')];
const rolePanels = [...document.querySelectorAll('.role-panel')];

const modelTabs = [...document.querySelectorAll('.model-tab')];
const modelPanels = [...document.querySelectorAll('.model-panel')];

function activateModel(model) {
  modelTabs.forEach((tab) => {
    const active = tab.dataset.model === model;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  modelPanels.forEach((panel) => {
    const active = panel.id === `model-${model}`;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
}

modelTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateModel(tab.dataset.model));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    const next = modelTabs[(index + direction + modelTabs.length) % modelTabs.length];
    activateModel(next.dataset.model);
    next.focus();
  });
});

function activateRole(role) {
  roleTabs.forEach((tab) => {
    const active = tab.dataset.role === role;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  rolePanels.forEach((panel) => {
    const active = panel.id === `role-${role}`;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
}

roleTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateRole(tab.dataset.role));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    const next = roleTabs[(index + direction + roleTabs.length) % roleTabs.length];
    activateRole(next.dataset.role);
    next.focus();
  });
});

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
  { name: 'Himalayan Giants', slug: 'himalayan-giants', chant: 'পাহাড় ভালোবাসি, ফসল ফলাবো রাশি রাশি' },
  { name: 'Terai Tigers', slug: 'terai-tigers', chant: 'বাঘের মতো লড়াই করব, ফসলে আজ ঘর ভরব' },
  { name: 'Cooch Behar Royals', slug: 'cooch-behar-royals', chant: 'রাজার জেলার চাষী আমরা, জিততে ভালোবাসি' },
  { name: 'Dinajpur Defenders', slug: 'dinajpur-defenders', chant: 'দিনাজপুর এগিয়ে থাকে, দেখি কে হারায় কাকে' },
  { name: 'Malda Kings', slug: 'malda-kings', chant: 'ফলের রাজা আমের দেশে, মালদাই জয়ী হবে শেষে' },
  { name: 'Murshidabad Nawabs', slug: 'murshidabad-nawabs', chant: 'নবাবের মাটি নবাবের দেশ, নবাবেরই মতো জেতা অভ্যেস' },
  { name: 'Nadia Warriors', slug: 'nadia-warriors', chant: 'নদীয়ার মাটি হবে নাকো ব্যর্থ, আমরাই জিতব, এটাই সত্য' },
  { name: 'Bardhaman Super Kings', slug: 'bardhaman-super-kings', chant: 'আমরা চাষী বর্ধমানের, দৌড়াবো আজ সমুখপানে' },
  { name: 'Hooghly Harvesters', slug: 'hooghly-harvesters', chant: 'হুগলির হাসি হুগলির মজা, আমরাই হবো যুদ্ধের রাজা' },
  { name: 'Birbhum Blasters', slug: 'birbhum-blasters', chant: 'লাল মাটির দাপটে, ফলবে ফসল মাঠে মাঠে' },
  { name: 'Bankura Bulls', slug: 'bankura-bulls', chant: 'শক্ত মাটি কম জল, তবুও ফলাই জেতার ফসল' },
  { name: 'Purulia Panthers', slug: 'purulia-panthers', chant: 'পুরুলিয়াকে রুক্ষ ভাবো? দেখো সবাইকে হারিয়ে দেবো' },
  { name: 'Medinipur Mavericks', slug: 'medinipur-mavericks', chant: 'মাটির জেলা মেদিনীপুরে, ফলাব ফসল গোলা ভরে' },
  { name: 'Ganga Gladiators', slug: 'ganga-gladiators', chant: 'গঙ্গা দিয়ে বইছে জল, আনন্দে আজ ফলাই ফসল' },
  { name: 'Sundarban Strikers', slug: 'sundarban-strikers', chant: 'বনবিবির শপথ নিয়ে, বলছি যাবো ট্রফি নিয়ে' }
];

const teamFeature = document.querySelector('.team-feature');
const teamImage = document.querySelector('#team-feature-image');
const teamName = document.querySelector('#team-feature-name');
const teamChant = document.querySelector('#team-feature-chant');
const teamCurrent = document.querySelector('#team-current');
const teamChips = [...document.querySelectorAll('.team-chip')];
const teamPrev = document.querySelector('.team-prev');
const teamNext = document.querySelector('.team-next');
let activeTeam = 0;
let teamChangeTimer;

function showTeam(index) {
  const nextIndex = (index + teams.length) % teams.length;
  if (nextIndex === activeTeam && teamName.textContent === teams[nextIndex].name) return;
  activeTeam = nextIndex;
  clearTimeout(teamChangeTimer);
  teamFeature.classList.add('is-changing');
  teamChangeTimer = setTimeout(() => {
    const team = teams[activeTeam];
    teamImage.src = `assets/teams/${team.slug}.jpg`;
    teamImage.alt = language === 'bn' ? `${team.name} দলের ব্যাজ` : `${team.name} badge`;
    teamName.textContent = team.name;
    teamChant.textContent = `“${team.chant}”`;
    teamCurrent.textContent = String(activeTeam + 1).padStart(2, '0');
    teamChips.forEach((chip, chipIndex) => {
      const selected = chipIndex === activeTeam;
      chip.classList.toggle('is-active', selected);
      chip.setAttribute('aria-pressed', String(selected));
      if (selected) {
        const rail = chip.parentElement;
        rail.scrollTo({ left: chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
    teamFeature.classList.remove('is-changing');
  }, reduceMotion ? 0 : 260);
}

teamChips.forEach((chip) => chip.addEventListener('click', () => showTeam(Number(chip.dataset.teamIndex))));
teamPrev.addEventListener('click', () => showTeam(activeTeam - 1));
teamNext.addEventListener('click', () => showTeam(activeTeam + 1));
document.querySelector('.team-explorer').addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  if (event.target.matches('input, audio')) return;
  event.preventDefault();
  showTeam(activeTeam + (event.key === 'ArrowRight' ? 1 : -1));
});

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

/* ---------- FAQ ---------- */
const faqSearch = document.querySelector('.faq-search input');
const faqItems = [...document.querySelectorAll('.faq-list details')];
const faqEmpty = document.querySelector('.faq-empty');

function filterFaq() {
  const term = faqSearch.value.trim().toLocaleLowerCase(language === 'bn' ? 'bn' : 'en');
  let visibleCount = 0;
  faqItems.forEach((item) => {
    const visible = !term || item.textContent.toLocaleLowerCase(language === 'bn' ? 'bn' : 'en').includes(term);
    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  faqEmpty.hidden = visibleCount !== 0;
}

faqSearch.addEventListener('input', filterFaq);
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

/* ---------- Tilt cards ---------- */
if (motionOK && finePointer) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - .5) * -10;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - .5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
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
const revealUp = '.hero-copy, .hero-actions, .model-heading > p, .teams-heading > p, .sponsor-journey-heading > p, .section-heading > p, .awards-heading > p, .living-farms-heading > p, .support-intro > p:not(.section-kicker), .faq-intro > p:not(.section-kicker), .faq-search, .roots-spotlight-copy > p:not(.section-kicker), .roots-spotlight-copy > .button, .manifesto-copy > p, blockquote cite, .score-layout > div > p:not(.section-kicker), .league-mechanics-grid > div > p:not(.section-kicker), .proof-grid > div > p:not(.section-kicker), .proof-stat, .application-status, .organizer-strip-inner > *, .roots-map, .instalments, .team-feature, .anthem-card, .role-stage, .model-explorer, .applicant-portal';
const revealStagger = '.pillars-grid, .journey-grid, .roadmap-grid, .living-farms-grid, .award-cards, .support-list, .league-funnel, .faq-list, .score-demo, .team-rail, .role-switcher, .sponsor-journey-grid';

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
  [...kickers, ...ups, ...staggers, ...splitTargets].forEach((element) => revealObserver.observe(element));
}

/* ---------- Stats scene: pinned, one number per scroll step ---------- */
const statScene = document.querySelector('.stat-scene');
const statSticky = statScene.querySelector('.stat-sticky');
const statSlides = [...statScene.querySelectorAll('.stat-slide')];
const statNumbers = statSlides.map((slide) => slide.querySelector('.stat-number'));
const statRail = [...statScene.querySelectorAll('.stat-rail i')];

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
  statSticky.dataset.tone = statSlides[active].classList.contains('stat-lime') ? 'lime' : 'blue';
  statSticky.classList.toggle('is-done', position > last - .08);
}

/* ---------- Sponsor journey: vertical scroll drives a sideways track ---------- */
const hsSection = document.querySelector('.sponsor-journey');
const hsTrack = hsSection.querySelector('.hs-track');
const hsQuery = window.matchMedia('(min-width: 901px)');
let hsOverflow = 0;

function setupHorizontal() {
  const enable = motionOK && hsQuery.matches;
  hsSection.classList.toggle('is-hscroll', enable);
  if (!enable) {
    hsSection.style.height = '';
    hsTrack.style.transform = '';
    hsOverflow = 0;
    return;
  }
  hsOverflow = Math.max(0, hsTrack.scrollWidth - window.innerWidth);
  hsSection.style.height = `${window.innerHeight + hsOverflow}px`;
}

function renderHorizontal() {
  if (!hsOverflow) return;
  const rect = hsSection.getBoundingClientRect();
  const p = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
  hsTrack.style.transform = `translate3d(${(-p * hsOverflow).toFixed(1)}px, 0, 0)`;
}

/* ---------- Roots: route drawn by scroll, instalments fill ---------- */
const roots = document.querySelector('.roots-spotlight');
const routeGhost = roots.querySelector('.route-ghost');
const routeLine = roots.querySelector('.route-line');
const routeDot = roots.querySelector('.route-dot');
const routeLength = routeGhost.getTotalLength();
const mapTags = [
  [roots.querySelector('.tag-globe'), .01],
  [roots.querySelector('.tag-year'), .5],
  [roots.querySelector('.tag-farm'), .96]
];
const instalments = [...roots.querySelectorAll('.instalment-bar li')];
const rootsDrift = roots.querySelector('.roots-drift');

function renderRoots() {
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

/* ---------- Journey line ---------- */
const journey = document.querySelector('.journey-grid');
const journeySteps = [...journey.children];
function renderJourney() {
  const rect = journey.getBoundingClientRect();
  const viewport = window.innerHeight;
  const p = clamp((viewport * .85 - rect.top) / (viewport * .55));
  journey.style.setProperty('--line-p', p.toFixed(3));
  journeySteps.forEach((step, index) => step.classList.toggle('is-lit', p >= index / journeySteps.length + .02));
}

/* ---------- Parallax + hero ---------- */
const hero = document.querySelector('.hero');
const parallaxItems = [
  [document.querySelector('.manifesto'), -.18],
  [document.querySelector('footer'), -.1]
];
function renderParallax() {
  const viewport = window.innerHeight;
  hero.style.setProperty('--hero-p', clamp(window.scrollY / hero.offsetHeight).toFixed(3));
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

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
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
  if (statScene.classList.contains('is-pinned')) renderStats();
  renderHorizontal();
  renderRoots();
  renderFill();
  renderJourney();
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
    setupHorizontal();
    setupMarquees();
  }
  needsRender = true;
}

if (motionOK) {
  statScene.classList.add('is-pinned');
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
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshLayout);
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
