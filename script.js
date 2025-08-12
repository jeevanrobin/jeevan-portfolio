// Years
const y1 = document.getElementById('year');
if (y1) y1.textContent = new Date().getFullYear();
const y2 = document.getElementById('year2');
if (y2) y2.textContent = new Date().getFullYear();

// Smooth anchor scroll (works for sidebar links too)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block:'start' });
    }
  });
});

// On-scroll reveal
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || els.length===0) {
    els.forEach(el=>el.classList.add('in')); return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
  els.forEach(el=>io.observe(el));
})();
