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
