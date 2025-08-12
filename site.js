// Particle outline canvas (animated dots from image edge)
(function(){
const cvs = document.getElementById('outlineCanvas');
if (!cvs) return;
const ctx = cvs.getContext('2d');
const W = cvs.width, H = cvs.height;

// 1) Load the transparent headshot
const img = new Image();
img.src = 'assets/profile.png';
img.onload = () => buildFromImage(img);

function buildFromImage(img){
// 2) Fit image into canvas while preserving aspect
ctx.clearRect(0,0,W,H);
const pad = 40; // inner padding
const scale = Math.min((W-2*pad)/img.width, (H-2*pad)/img.height);
const drawW = Math.round(img.width*scale);
const drawH = Math.round(img.height*scale);
const dx = Math.round((W - drawW)/2);
const dy = Math.round((H - drawH)/2);

// 3) Draw onto a temp canvas to read alpha
const tmp = document.createElement('canvas');
tmp.width = W; tmp.height = H;
const tctx = tmp.getContext('2d');
tctx.clearRect(0,0,W,H);
tctx.drawImage(img, dx, dy, drawW, drawH);

const { data } = tctx.getImageData(0,0,W,H);

// 4) Edge detection (simple alpha edge)
// Mark pixels where alpha crosses a threshold and has a transparent neighbor
const A_TH = 30; // alpha threshold (0-255)
const edge = new Uint8Array(W*H);
for (let y=1; y<H-1; y++){
  for (let x=1; x<W-1; x++){
    const i = (y*W + x)*4 + 3; // alpha channel index
    const a = data[i];
    if (a > A_TH){
      // If any neighbor is near transparent => edge
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

// 5) Sample edge points (Poisson-ish thinning to keep spacing)
const TARGET_POINTS = 400; // more points for denser outline
const MIN_DIST = 5;        // closer spacing
const pts = [];

function tooClose(x,y){
  for (let k=0;k<pts.length;k++){
    const dx = pts[k].x - x, dy = pts[k].y - y;
    if (dx*dx + dy*dy < MIN_DIST*MIN_DIST) return true;
  }
  return false;
}

// Randomly scan to distribute samples
let attempts = 0, maxAttempts = W*H*3;
while (pts.length < TARGET_POINTS && attempts < maxAttempts){
  attempts++;
  const x = (Math.random()*W)|0;
  const y = (Math.random()*H)|0;
  if (edge[y*W + x] === 1 && !tooClose(x,y)){
    pts.push({ x, y });
  }
}

// Fallback: if too few points, relax spacing
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

// 6) Animate particles along local tangents
const particles = pts.map((p, i) => ({
  x: p.x, y: p.y,
  ox: p.x, oy: p.y,
  hue: 48, // brand yellow for all
  a: Math.random()*Math.PI*2,
  s: 0.8 + Math.random()*1.2,
  r: 0.8 + Math.random()*1.2
}));

function draw(){
  // trail
  ctx.fillStyle = 'rgba(21,26,31,0.35)';
  ctx.fillRect(0,0,W,H);

  particles.forEach(p=>{
    // small orbital motion
    p.a += 0.04 * p.s;
    const x = p.ox + Math.cos(p.a) * p.r;
    const y = p.oy + Math.sin(p.a) * p.r;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue},95%,55%,0.92)`; // slightly lighter
    ctx.arc(x,y,1.4,0,Math.PI*2);
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
draw();
}
})();