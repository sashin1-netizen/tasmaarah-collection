const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.mobile-nav');

function setMenu(open){
  if(!menuButton||!nav)return;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
  nav.classList.toggle('open',open);
}

menuButton?.addEventListener('click',()=>{
  const open=menuButton.getAttribute('aria-expanded')==='true';
  setMenu(!open);
});

nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){
    setMenu(false);
    menuButton.focus();
  }
});
