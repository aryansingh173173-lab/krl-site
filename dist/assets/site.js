const toggle = document.querySelector('.language-toggle');
const current = document.querySelector('.lang-current');
const localized = [...document.querySelectorAll('[data-en][data-bn]')];
const heroImage = document.querySelector('.hero-image');
let language = 'en';

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
  heroImage.alt = language === 'en'
    ? 'An illustrative scene of two young farmers overlooking an integrated Bengal farm at sunrise'
    : 'সূর্যোদয়ের সময় সমন্বিত বাংলার খামারের দিকে তাকিয়ে থাকা দুই তরুণ কৃষকের ধারণাভিত্তিক দৃশ্য';
}

toggle.addEventListener('click', () => setLanguage(language === 'en' ? 'bn' : 'en'));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (document.activeElement === link) link.blur();
  });
});
