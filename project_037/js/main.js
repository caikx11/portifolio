// Câmara Escura - editor de imagens com canvas
const FILTER_IDS = ['brightness', 'contrast', 'saturation', 'blur', 'grayscale', 'sepia'];
const PRESETS = {
    none: { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: 0, sepia: 0 },
    vivid: { brightness: 5, contrast: 20, saturation: 45, blur: 0, grayscale: 0, sepia: 0 },
    mono: { brightness: 0, contrast: 25, saturation: 0, blur: 0, grayscale: 100, sepia: 0 },
    vintage: { brightness: 8, contrast: -10, saturation: -15, blur: 0, grayscale: 0, sepia: 60 }
};

class ImageEditor {
    constructor() {
        this.img = null;
        this.rotation = 0;
        this.flipped = false;
        this.comparing = false;
        this.canvas = document.getElementById('edit-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }

    $(id) { return document.getElementById(id); }

    init() {
        this.$('image-upload').addEventListener('change', (e) => this.loadFile(e.target.files[0]));
        this.$('reset-btn').addEventListener('click', () => this.resetImage());
        this.$('download-btn').addEventListener('click', () => this.downloadImage());
        this.$('sample-btn').addEventListener('click', () => this.loadSample());
        this.$('rotate-btn').addEventListener('click', () => { this.rotation = (this.rotation + 90) % 360; this.applyFilters(); });
        this.$('flip-btn').addEventListener('click', () => { this.flipped = !this.flipped; this.applyFilters(); });
        const cmp = this.$('compare-btn');
        const set = (v) => { this.comparing = v; this.applyFilters(); };
        ['pointerdown'].forEach(ev => cmp.addEventListener(ev, () => set(true)));
        ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(ev => cmp.addEventListener(ev, () => this.comparing && set(false)));
        cmp.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); set(true); } });
        cmp.addEventListener('keyup', () => set(false));

        FILTER_IDS.forEach(id => this.$(id).addEventListener('input', () => { this.syncLabels(); this.applyFilters(); }));
        document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => this.setValues(PRESETS[b.dataset.preset])));

        const prev = this.$('preview');
        ['dragover', 'dragenter'].forEach(ev => prev.addEventListener(ev, (e) => { e.preventDefault(); prev.classList.add('drag'); }));
        ['dragleave', 'drop'].forEach(ev => prev.addEventListener(ev, () => prev.classList.remove('drag')));
        prev.addEventListener('drop', (e) => { e.preventDefault(); this.loadFile(e.dataTransfer.files[0]); });
    }

    loadFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        this.setImage(url, () => URL.revokeObjectURL(url));
    }

    loadSample() {
        const c = document.createElement('canvas');
        c.width = 960; c.height = 640;
        const g = c.getContext('2d');
        const sky = g.createLinearGradient(0, 0, 0, 640);
        sky.addColorStop(0, '#1f2a6b'); sky.addColorStop(.55, '#e4572e'); sky.addColorStop(1, '#ffc857');
        g.fillStyle = sky; g.fillRect(0, 0, 960, 640);
        g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(660, 330, 90, 0, 7); g.fill();
        [['#2d1e4a', 420, 90], ['#1b1233', 480, 150], ['#0e0a1f', 540, 200]].forEach(([col, y, amp], i) => {
            g.fillStyle = col; g.beginPath(); g.moveTo(0, 640);
            for (let x = 0; x <= 960; x += 20) g.lineTo(x, y + Math.sin(x / (110 - i * 20) + i) * amp * .35);
            g.lineTo(960, 640); g.closePath(); g.fill();
        });
        this.setImage(c.toDataURL('image/png'));
    }

    setImage(src, done) {
        const im = new Image();
        im.onload = () => {
            this.img = im;
            this.rotation = 0;
            this.flipped = false;
            this.$('placeholder').hidden = true;
            this.canvas.hidden = false;
            ['rotate-btn', 'flip-btn', 'compare-btn', 'download-btn'].forEach(id => { this.$(id).disabled = false; });
            this.applyFilters();
            if (done) done();
        };
        im.onerror = () => { this.$('placeholder').textContent = 'Não foi possível abrir esta imagem.'; this.$('placeholder').hidden = false; };
        im.src = src;
    }

    values() {
        const v = {};
        FILTER_IDS.forEach(id => { v[id] = parseInt(this.$(id).value, 10) || 0; });
        return v;
    }

    filterString() {
        const v = this.values();
        return `brightness(${100 + v.brightness}%) contrast(${100 + v.contrast}%) saturate(${100 + v.saturation}%) blur(${v.blur}px) grayscale(${v.grayscale}%) sepia(${v.sepia}%)`;
    }

    syncLabels() {
        const v = this.values();
        FILTER_IDS.forEach(id => { this.$(`${id}-value`).textContent = v[id]; });
    }

    setValues(vals) {
        FILTER_IDS.forEach(id => { this.$(id).value = vals[id]; });
        this.syncLabels();
        this.applyFilters();
    }

    applyFilters() {
        if (!this.img) return;
        const MAX = 1600;
        const scale = Math.min(1, MAX / Math.max(this.img.naturalWidth, this.img.naturalHeight));
        const w = Math.round(this.img.naturalWidth * scale), h = Math.round(this.img.naturalHeight * scale);
        const swap = this.rotation % 180 !== 0;
        this.canvas.width = swap ? h : w;
        this.canvas.height = swap ? w : h;
        const ctx = this.ctx;
        ctx.save();
        ctx.filter = this.comparing ? 'none' : this.filterString();
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        ctx.rotate(this.rotation * Math.PI / 180);
        if (this.flipped) ctx.scale(-1, 1);
        ctx.drawImage(this.img, -w / 2, -h / 2, w, h);
        ctx.restore();
    }

    resetImage() {
        this.rotation = 0;
        this.flipped = false;
        this.setValues(PRESETS.none);
    }

    downloadImage() {
        if (!this.img) return;
        this.comparing = false;
        this.applyFilters();
        const a = document.createElement('a');
        a.download = 'imagem_editada.png';
        a.href = this.canvas.toDataURL('image/png');
        a.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
    window.imageEditor.canvas.hidden = true;
});
