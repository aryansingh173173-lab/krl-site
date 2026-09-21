const toggle = document.querySelector('.language-toggle');
const current = document.querySelector('.lang-current');
const localized = [...document.querySelectorAll('[data-en][data-bn]')];
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress span');
const glow = document.querySelector('.cursor-glow');
const heroVideo = document.querySelector('.hero-video');
const videoToggle = document.querySelector('.video-toggle');
const videoIcon = document.querySelector('.video-toggle-icon');
const videoLabel = document.querySelector('.video-toggle-label');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let language = 'en';

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

function updateScrollState() {
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.transform = `scaleX(${Math.min(1, window.scrollY / scrollable)})`;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const roleTabs = [...document.querySelectorAll('.role-tab')];
const rolePanels = [...document.querySelectorAll('.role-panel')];

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
    teamImage.alt = `${team.name} badge`;
    teamName.textContent = team.name;
    teamChant.textContent = `“${team.chant}”`;
    teamCurrent.textContent = String(activeTeam + 1).padStart(2, '0');
    teamChips.forEach((chip, chipIndex) => {
      const selected = chipIndex === activeTeam;
      chip.classList.toggle('is-active', selected);
      chip.setAttribute('aria-pressed', String(selected));
      if (selected) chip.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    });
    teamFeature.classList.remove('is-changing');
  }, reduceMotion ? 0 : 180);
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

const revealTargets = [...document.querySelectorAll('.section')];
const staggerTargets = [...document.querySelectorAll('.numbers-grid, .journey-grid, .award-cards, .support-list')];

if ('IntersectionObserver' in window && !reduceMotion) {
  revealTargets.forEach((element) => element.classList.add('reveal-ready'));
  staggerTargets.forEach((element) => element.classList.add('stagger-ready'));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .11 });
  [...revealTargets, ...staggerTargets].forEach((element) => revealObserver.observe(element));
}

const counters = [...document.querySelectorAll('[data-count]')];
function runCounter(element) {
  const end = Number(element.dataset.count);
  const duration = reduceMotion ? 0 : 1100;
  const startTime = performance.now();
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const format = (value) => element.dataset.format === 'comma' ? value.toLocaleString('en-IN') : String(value);
  const frame = (now) => {
    const progressValue = duration === 0 ? 1 : Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    element.textContent = `${prefix}${format(Math.round(end * eased))}${suffix}`;
    if (progressValue < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: .65 });
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(runCounter);
}

if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - .5) * -8;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - .5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (document.activeElement === link) link.blur();
  });
});
