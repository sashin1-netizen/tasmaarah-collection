const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.mobile-nav');
menuButton?.addEventListener('click',()=>{
  const open=menuButton.getAttribute('aria-expanded')==='true';
  menuButton.setAttribute('aria-expanded',String(!open));
  nav?.classList.toggle('open',!open);
});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
}));