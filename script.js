const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.site-nav');
function setMenu(open){if(!menuButton||!nav)return;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');nav.classList.toggle('open',open)}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus()}});
const form=document.querySelector('#quote-form');
form?.addEventListener('submit',event=>{
 event.preventDefault();
 const data=new FormData(form);
 const msg=`Hi Tasmaarah Collection, I'd like a quote.\n\nName: ${data.get('name')}\nOccasion: ${data.get('occasion')}\nService: ${data.get('service')}\nMaterial: ${data.get('material')}\nSize: ${data.get('size')}\nDetails: ${data.get('details')||'Not provided'}`;
 window.open(`https://wa.me/27635409729?text=${encodeURIComponent(msg)}`,'_blank','noopener');
});