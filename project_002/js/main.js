// Etch-a-Sketch com pointer events (mouse, toque e caneta)
document.addEventListener('DOMContentLoaded', () => {
    const pad = document.getElementById('sketchpad');
    const modeBtns = { normal: 'normalBtn', rainbow: 'rainbowBtn', shade: 'shadeBtn', eraser: 'eraserBtn' };
    const slider = document.getElementById('sizeSlider');
    const picker = document.getElementById('colorPicker');
    const frame = document.querySelector('.screen-frame');
    let mode = 'normal', size = 16, drawing = false, hue = 0, cells = [];

    function build(n) {
        size = n;
        pad.innerHTML = '';
        pad.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
        pad.style.gridTemplateRows = `repeat(${n}, 1fr)`;
        cells = [];
        const frag = document.createDocumentFragment();
        for (let i = 0; i < n * n; i++) {
            const c = document.createElement('div');
            c.className = 'sketch-cell';
            c.dataset.shade = '0';
            frag.appendChild(c); cells.push(c);
        }
        pad.appendChild(frag);
        document.getElementById('sizeValue').textContent = n;
        document.getElementById('sizeValue2').textContent = n;
    }

    function paint(c) {
        if (!c || !c.classList.contains('sketch-cell')) return;
        if (mode === 'normal') { c.style.backgroundColor = picker.value; c.dataset.shade = '0'; }
        else if (mode === 'rainbow') { hue = (hue + 37) % 360; c.style.backgroundColor = `hsl(${hue} 85% 55%)`; c.dataset.shade = '0'; }
        else if (mode === 'eraser') { c.style.backgroundColor = ''; c.dataset.shade = '0'; }
        else {
            const s = Math.min(10, (+c.dataset.shade || 0) + 1);
            c.dataset.shade = s;
            const l = Math.round(100 - s * 9);
            c.style.backgroundColor = `hsl(220 8% ${l}%)`;
        }
    }
    function at(e) { return document.elementFromPoint(e.clientX, e.clientY); }

    pad.addEventListener('pointerdown', e => { drawing = true; pad.setPointerCapture(e.pointerId); paint(at(e)); e.preventDefault(); });
    pad.addEventListener('pointermove', e => { if (drawing) paint(at(e)); });
    ['pointerup', 'pointercancel'].forEach(t => pad.addEventListener(t, () => { drawing = false; }));

    Object.entries(modeBtns).forEach(([m, id]) => {
        document.getElementById(id).addEventListener('click', () => {
            mode = m;
            Object.values(modeBtns).forEach(i => {
                const b = document.getElementById(i);
                const on = i === id;
                b.classList.toggle('active', on);
                b.setAttribute('aria-pressed', on);
            });
        });
    });
    picker.addEventListener('input', () => document.getElementById('normalBtn').click());
    slider.addEventListener('input', () => build(+slider.value));
    document.getElementById('gridToggle').addEventListener('change', e => pad.classList.toggle('no-grid', !e.target.checked));
    document.getElementById('clearBtn').addEventListener('click', () => {
        frame.classList.remove('shaking'); void frame.offsetWidth; frame.classList.add('shaking');
        cells.forEach(c => { c.style.backgroundColor = ''; c.dataset.shade = '0'; });
    });
    build(size);
});
