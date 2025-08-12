// Tile hover ripple follows cursor
document.querySelectorAll('.tile').forEach(t=>{
  t.addEventListener('mousemove', e=>{
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// Reveal on scroll
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  els.forEach(el=>io.observe(el));
})();

// Footer year on about page
const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

/* Silhouette particle animation using assets/profile.png (transparent background) */
(function(){
  const cvs = document.getElementById('outlineCanvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const W = cvs.width, H = cvs.height;

  const img = new Image();
  img.src = 'assets/profile.png'; // your transparent PNG
  img.onload = () => buildFromImage(img);

  function buildFromImage(img){
    const pad = 40;
    const scale = Math.min((W-2*pad)/img.width, (H-2*pad)/img.height);
    const drawW = Math.round(img.width*scale);
    const drawH = Math.round(img.height*scale);
    const dx = Math.round((W - drawW)/2);
    const dy = Math.round((H - drawH)/2);

    const tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = H;
    const tctx = tmp.getContext('2d');
    tctx.clearRect(0,0,W,H);
    tctx.drawImage(img, dx, dy, drawW, drawH);

    const { data } = tctx.getImageData(0,0,W,H);

    const A_TH = 30;
    const edge = new Uint8Array(W*H);
    for (let y=1; y<H-1; y++){
      for (let x=1; x<W-1; x++){
        const i = (y*W + x)*4 + 3;
        const a = data[i];
        if (a > A_TH){
          const n1 = data[((y-1)*W + x)*4 + 3];
          const n2 = data[((y+1)*W + x)*4 + 3];
          const n3 = data[(y*W + (x-1))*4 + 3];
          const n4 = data[(y*W + (x+1))*4 + 3];
          if (n1<=A_TH || n2<=A_TH || n3<=A_TH || n4<=A_TH){
            edge[y*W + x] = 1;
          }
        }
      }
    }

    const TARGET_POINTS = 320;
    const MIN_DIST = 6;
    const pts = [];
    function tooClose(x,y){
      for (let k=0;k<pts.length;k++){
        const dx = pts[k].x - x, dy = pts[k].y - y;
        if (dx*dx + dy*dy < MIN_DIST*MIN_DIST) return true;
      }
      return false;
    }
    let attempts = 0, maxAttempts = W*H*3;
    while (pts.length < TARGET_POINTS && attempts < maxAttempts){
      attempts++;
      const x = (Math.random()*W)|0;
      const y = (Math.random()*H)|0;
      if (edge[y*W + x] === 1 && !tooClose(x,y)){
        pts.push({ x, y });
      }
    }
    if (pts.length < TARGET_POINTS*0.6){
      const MIN_DIST2 = 4;
      for (let y=0; y<H; y+=2){
        for (let x=0; x<W; x+=2){
          if (edge[y*W + x] === 1){
            let ok = true;
            for (let k=0;k<pts.length;k++){
              const dx = pts[k].x - x, dy = pts[k].y - y;
              if (dx*dx + dy*dy < MIN_DIST2*MIN_DIST2){ ok=false; break; }
            }
            if (ok) pts.push({ x, y });
          }
        }
      }
    }

    const particles = pts.map(p => ({
      ox: p.x, oy: p.y,
      a: Math.random()*Math.PI*2,
      s: 0.8 + Math.random()*1.2,
      r: 0.8 + Math.random()*1.2,
      hue: 48
    }));

    function draw(){
      ctx.fillStyle = 'rgba(21,26,31,0.35)';
      ctx.fillRect(0,0,W,H);

      particles.forEach(p=>{
        p.a += 0.04 * p.s;
        const x = p.ox + Math.cos(p.a) * p.r;
        const y = p.oy + Math.sin(p.a) * p.r;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue},95%,60%,0.9)`;
        ctx.arc(x,y,1.4,0,Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
})();

// ==== Custom cursor (dot + ring with easing) ====
(function(){
// Guard: prevent multiple initializations on hot reloads
if (!window.__cursorInit){
window.__cursorInit = true;

(function(){
// Skip on touch devices
if (!window.matchMedia || !matchMedia('(pointer:fine)').matches) return;

const root = document.documentElement;
const cur = document.getElementById('cursor');
if (!cur) return;

const dot  = cur.querySelector('.cursor__dot');
const ring = cur.querySelector('.cursor__ring');

// Mouse and eased ring positions
let mx = innerWidth/2, my = innerHeight/2;
let rx = mx, ry = my;

// Use a time-based smoothing for consistent feel across refresh rates
let last = performance.now();
const baseEase = 0.18;

function onMove(e){
  // clientX/clientY are in CSS pixels; no need to scale for DPR
  mx = e.clientX;
  my = e.clientY;
}
window.addEventListener('mousemove', onMove, { passive: true });

// Hover state on interactive elements
const hoverables = 'a,button,.magnet,.tile';
document.addEventListener('mouseover', e=>{
  if (e.target.closest(hoverables)) cur.classList.add('cursor--hover');
});
document.addEventListener('mouseout', e=>{
  if (e.target.closest(hoverables)) cur.classList.remove('cursor--hover');
});

// Click pulse
document.addEventListener('mousedown', ()=>{
  const p = document.createElement('div');
  p.className = 'cursor__pulse';
  p.style.left = mx + 'px';
  p.style.top  = my + 'px';
  cur.appendChild(p);
  setTimeout(()=>p.remove(), 520);
});

// Resize safety to keep cursor on canvas
window.addEventListener('mouseleave', ()=>{
  // Park off-screen to avoid a dot stuck at edges
  mx = -100; my = -100;
});
window.addEventListener('mouseenter', (e)=>{
  mx = e.clientX; my = e.clientY;
});

// Animation loop
function frame(now){
  const dt = Math.min(32, now - last); // clamp to avoid huge jumps
  last = now;

  const ease = 1 - Math.pow(1 - baseEase, dt / 16.67); // normalize to ~60fps
  rx += (mx - rx) * ease;
  ry += (my - ry) * ease;

  // Apply positions
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
})();

// ==== Magnetic hover on elements with .magnet ====
(function(){
const strength = 18; // px pull at edge
const mags = document.querySelectorAll('.magnet');
mags.forEach(el=>{
  let raf = 0;
  function move(e){
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width/2)) / (r.width/2);
    const y = (e.clientY - (r.top + r.height/2)) / (r.height/2);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{
      el.style.transform = `translate(${x*strength}px, ${y*strength}px)`;
    });
  }
  function leave(){
    el.style.transform = 'translate(0,0)';
  }
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseleave', leave);
});
})();

// ==== Tile spotlight: follow cursor with easing per tile ====
(function(){
const tiles = document.querySelectorAll('.tile');
tiles.forEach(tile=>{
  let sx = 0, sy = 0, tx = 0, ty = 0;
  const ease = 0.22;

  function update() {
    sx += (tx - sx) * ease;
    sy += (ty - sy) * ease;
    tile.style.setProperty('--spot-x', sx + '%');
    tile.style.setProperty('--spot-y', sy + '%');
    raf = requestAnimationFrame(update);
  }
  let raf = requestAnimationFrame(update);

  function onMove(e){
    const r = tile.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    tx = x; ty = y;
  }
  function onLeave(){
    tx = 100; ty = 0; // park light to top-right corner
  }
  tile.addEventListener('mousemove', onMove);
  tile.addEventListener('mouseleave', onLeave);
  onLeave();
});
})();