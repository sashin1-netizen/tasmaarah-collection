const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

// Client photographs are stored as text-safe base64 assets so they can be
// committed through the connected GitHub workflow. They are decoded only in
// the browser and remain the client's genuine photographs.
const encodedPhotos = [
  {
    selector: '.hero-visual .primary',
    source: 'assets/images/hero-blue-gift.webp.b64',
    position: 'center center',
    label: 'Tasmaarah Collection acrylic gift presentation with fashion, fragrance and blue floral styling'
  },
  {
    selector: '.cards .card:nth-child(2) .photo-placeholder',
    source: 'assets/images/clear-display-box.webp.b64',
    position: 'center center',
    label: 'Clear Perspex Tasmaarah Collection presentation box'
  }
];

async function hydratePhoto({ selector, source, position, label }) {
  const node = document.querySelector(selector);
  if (!node) return;

  try {
    const response = await fetch(source, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Image source returned ${response.status}`);
    const base64 = (await response.text()).trim();
    if (!base64) throw new Error('Image source was empty');

    node.textContent = '';
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', label);
    node.style.backgroundImage = `url("data:image/webp;base64,${base64}")`;
    node.style.backgroundSize = 'cover';
    node.style.backgroundPosition = position || 'center';
    node.style.backgroundRepeat = 'no-repeat';
    node.classList.add('real-photo');
  } catch (error) {
    console.warn(`Could not load ${source}`, error);
  }
}

encodedPhotos.forEach(hydratePhoto);

const photoOverrides = document.createElement('style');
photoOverrides.textContent = `
  .photo-placeholder.real-photo::before { display: none; }
  .photo-placeholder.real-photo { color: transparent; }
  .hero-visual .primary.real-photo { background-color: #d8c8b5; }
  .cards .photo-placeholder.real-photo { transition: transform .45s ease; }
  .cards .card:hover .photo-placeholder.real-photo { transform: scale(1.012); }
  @media (prefers-reduced-motion: reduce) {
    .cards .card:hover .photo-placeholder.real-photo { transform: none; }
  }
`;
document.head.appendChild(photoOverrides);

document.querySelector('#quote-form')?.addEventListener('submit', (event) => {
  event.preventDefault();

  const occasion = document.querySelector('#occasion-input')?.value.trim() || '';
  const service = document.querySelector('#service-input')?.value.trim() || '';
  const message = document.querySelector('#message-input')?.value.trim() || '';

  const lines = [
    "Hi Tasmaarah Collection, I'd like to request a quote.",
    occasion ? `Occasion: ${occasion}` : '',
    service ? `Interested in: ${service}` : '',
    message ? `Details: ${message}` : ''
  ].filter(Boolean);

  const url = `https://wa.me/27635409729?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});
