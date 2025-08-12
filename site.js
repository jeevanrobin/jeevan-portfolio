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