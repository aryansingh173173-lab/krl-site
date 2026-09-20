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
