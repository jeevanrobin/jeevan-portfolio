const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* Radar chart (no libs) */
(function(){
  const data = [
    { label:'GCP', value:92 },
    { label:'Kubernetes', value:88 },
    { label:'Terraform', value:85 },
    { label:'CI/CD', value:86 },
    { label:'Observability', value:80 },
    { label:'Security', value:78 }
  ];
  const svg = document.getElementById('skillRadar');
  if (!svg) return;

  const W = 300, H = 300, cx = W / 2, cy = H / 2, radius = 110, levels = 5;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const styles = getComputedStyle(document.documentElement);
  const ink = styles.getPropertyValue('--ink').trim() || '#fff';
  const brand = styles.getPropertyValue('--brand').trim() || '#ffd60a';
  const accent = styles.getPropertyValue('--accent').trim() || '#ffb703';

  const gGrid = document.createElementNS('http://www.w3.org/2000/svg','g');
  gGrid.setAttribute('class','radar-grid');
  svg.appendChild(gGrid);

  // Concentric polygons (levels)
  for(let l=1; l<=levels; l++){
    const r = radius * (l/levels);
    const pts = data.map((_,i)=>{
      const ang = (-Math.PI/2) + (i*2*Math.PI/data.length);
      return [cx + r*Math.cos(ang), cy + r*Math.sin(ang)];
    }).map(p=>p.join(',')).join(' ');
    const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('stroke', 'rgba(255,214,10,0.15)');
    poly.setAttribute('fill', 'none');
    gGrid.appendChild(poly);
  }

  // Axes and labels
  const gAxes = document.createElementNS('http://www.w3.org/2000/svg','g');
  gAxes.setAttribute('class','radar-axis');
  svg.appendChild(gAxes);

  data.forEach((d,i)=>{
    const ang = (-Math.PI/2) + (i*2*Math.PI/data.length);
    const x = cx + radius*Math.cos(ang);
    const y = cy + radius*Math.sin(ang);

    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',cx); line.setAttribute('y1',cy);
    line.setAttribute('x2',x);  line.setAttribute('y2',y);
    line.setAttribute('stroke','rgba(255,214,10,0.15)');
    gAxes.appendChild(line);

    const lx = cx + (radius+16)*Math.cos(ang);
    const ly = cy + (radius+16)*Math.sin(ang);
    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x', lx);
    label.setAttribute('y', ly);
    label.setAttribute('text-anchor', Math.cos(ang)>0.2 ? 'start' : (Math.cos(ang)<-0.2 ? 'end' : 'middle'));
    label.setAttribute('dominant-baseline', 'middle');
    label.textContent = d.label;
    label.style.fill = ink;
    label.style.fontSize = '12px';
    gAxes.appendChild(label);
  });

  // Data polygon
  const gData = document.createElementNS('http://www.w3.org/2000/svg','g');
  gData.setAttribute('class','radar-data');
  svg.appendChild(gData);

  const pts = data.map((d,i)=>{
    const ang = (-Math.PI/2) + (i*2*Math.PI/data.length);
    const r = radius*(d.value/100);
    return [cx + r*Math.cos(ang), cy + r*Math.sin(ang)];
  });

  const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
  poly.setAttribute('class','radar-shape');
  poly.setAttribute('points', pts.map(p=>p.join(',')).join(' '));
  poly.setAttribute('fill', 'rgba(255,214,10,0.12)');
  poly.setAttribute('stroke', brand);
  gData.appendChild(poly);

  // Points
  const gPts = document.createElementNS('http://www.w3.org/2000/svg','g');
  gPts.setAttribute('class','radar-points');
  pts.forEach(([x,y])=>{
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r',3.5);
    c.setAttribute('fill', accent); c.setAttribute('stroke', '#000'); c.setAttribute('stroke-width','0.5');
    gPts.appendChild(c);
  });
})();
