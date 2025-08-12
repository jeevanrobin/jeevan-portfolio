// Tile hover ripple follows cursor
document.querySelectorAll('.tile').forEach(t => {
    t.addEventListener('mousemove', e => {
        const r = t.getBoundingClientRect();
        t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
});

// Reveal on scroll
(function() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
})();

// Footer year (About page)
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Particle outline canvas (animated dots)
(function() {
    const cvs = document.getElementById('outlineCanvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const W = cvs.width, H = cvs.height, CX = W / 2, CY = H / 2;
    const PARTICLES = 240;
    const R1 = 170, R2 = 120;
    const dots = [];

    for (let i = 0; i < PARTICLES; i++) {
        const baseR = i % 2 === 0 ? R1 : R2;
        dots.push({
            a: Math.random() * Math.PI * 2,
            r: baseR + (Math.random() * 6 - 3),
            s: (i % 2 === 0 ? 0.006 : 0.009) * (0.6 + Math.random() * 0.8),
            hue: i % 2 === 0 ? 24 : 140
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(21,26,31,0.35)';
        ctx.fillRect(0, 0, W, H);

        dots.forEach(d => {
            d.a += d.s;
            const x = CX + Math.cos(d.a) * d.r;
            const y = CY + Math.sin(d.a) * d.r * 1.1;
            ctx.beginPath();
            ctx.fillStyle = `hsla(${d.hue}, 95%, 60%, 0.9)`;
            ctx.arc(x, y, 1.7, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
})();