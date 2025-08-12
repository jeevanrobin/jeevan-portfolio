// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
}

// Smooth anchor scrolling
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// On-scroll reveals
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || els.length===0) {
    els.forEach(el=>el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
  els.forEach(el=>io.observe(el));
})();

// Hero parallax
(function(){
  const hero = document.getElementById('hero');
  if (!hero) return;
  const targets = hero.querySelectorAll('.hero-text h1, .hero-text h2, .hero-text p');
  let raf = null;
  function onMove(e){
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{
      targets.forEach((el, i)=>{
        const depth = (i+1) * 2.5;
        el.style.transform = `translate(${x*depth}px, ${y*depth}px)`;
      });
    });
  }
  function reset(){
    targets.forEach(el=> el.style.transform = 'translate(0,0)');
  }
  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('mouseleave', reset);
})();

// Magnetic buttons
(function(){
  const mags = document.querySelectorAll('.magnetic');
  mags.forEach(btn=>{
    let raf = null;
    const strength = 16;
    function move(e){
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width/2);
      const my = e.clientY - (r.top + r.height/2);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        btn.style.transform = `translate(${mx/r.width*strength}px, ${my/r.height*strength}px)`;
      });
    }
    function leave(){ btn.style.transform = 'translate(0,0)'; }
    btn.addEventListener('mousemove', move);
    btn.addEventListener('mouseleave', leave);
  });
})();
