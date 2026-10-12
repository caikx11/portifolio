// Editor de Imagens Básico
class ImageEditor {
    constructor() {
        this.originalImage = null;
        this.editedImage = null;
        this.canvas = null;
        this.ctx = null;
        this.init();
    }

    init() {
        const uploadInput = document.getElementById('image-upload');
        const resetBtn = document.getElementById('reset-btn');
        const downloadBtn = document.getElementById('download-btn');
        const originalImg = document.getElementById('original-image');
        const editedImg = document.getElementById('edited-image');

        // Event listeners
        uploadInput.addEventListener('change', (e) => this.loadImage(e.target.files[0]));
        resetBtn.addEventListener('click', () => this.resetImage());
        downloadBtn.addEventListener('click', () => this.downloadImage());

        // Filter controls
        const filters = ['brightness', 'contrast', 'saturation', 'blur', 'grayscale', 'sepia'];
        filters.forEach(filterId => {
            const slider = document.getElementById(filterId);
            const valueSpan = document.getElementById(`${filterId}-value`);
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value;
                this.applyFilters();
            });
        });
    }

    loadImage(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage = new Image();
            this.originalImage.onload = () => {
                // Reset edited image to original
                this.editedImage = this.originalImage;
                originalImg.src = this.originalImage.src;
                editedImg.src = this.originalImage.src;
                this.createCanvas();
                this.applyFilters();
            };
            this.originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    createCanvas() {
        if (!this.originalImage) return;

        // Create canvas if it doesn't exist
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            // Insert canvas before edited image
            const editedImg = document.getElementById('edited-image');
            editedImg.parentNode.insertBefore(this.canvas, editedImg.nextSibling);
        }

        // Set canvas size to match image
        this.canvas.width = this.originalImage.width;
        this.canvas.height = this.originalImage.height;
    }

    applyFilters() {
        if (!this.originalImage || !this.canvas || !this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw original image
        this.ctx.drawImage(this.originalImage, 0, 0);

        // Get filter values
        const brightness = parseInt(document.getElementById('brightness').value);
        const contrast = parseInt(document.getElementById('contrast').value);
        const saturation = parseInt(document.getElementById('saturation').value);
        const blur = parseInt(document.getElementById('blur').value);
        const grayscale = parseInt(document.getElementById('grayscale').value);
        const sepia = parseInt(document.getElementById('sepia').value);

        // Apply filters using CSS
        this.canvas.style.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
            blur(${blur}px)
            grayscale(${grayscale}%)
            sepia(${sepia}%)
        `;

        // To actually apply the filters to the image data, we need to redraw
        // For simplicity in this basic editor, we'll use the CSS approach for display
        // But to get the actual pixel data for download, we need to use Canvas API filters
        // Let's implement a basic approach using globalCompositeOperation for some filters

        // Actually, let's redraw with proper filter application
        this.ctx.save();
        this.ctx.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
            blur(${blur}px)
            grayscale(${grayscale}%)
            sepia(${sepia}%)
        `;
        this.ctx.drawImage(this.originalImage, 0, 0);
        this.ctx.restore();

        // Update the edited image src with canvas data
        document.getElementById('edited-image').src = this.canvas.toDataURL();
    }

    resetImage() {
        // Reset all sliders
        document.getElementById('brightness').value = 0;
        document.getElementById('contrast').value = 0;
        document.getElementById('saturation').value = 0;
        document.getElementById('blur').value = 0;
        document.getElementById('grayscale').value = 0;
        document.getElementById('sepia').value = 0;

        // Update value displays
        document.getElementById('brightness-value').textContent = '0';
        document.getElementById('contrast-value').textContent = '0';
        document.getElementById('saturation-value').textContent = '0';
        document.getElementById('blur-value').textContent = '0';
        document.getElementById('grayscale-value').textContent = '0';
        document.getElementById('sepia-value').textContent = '0';

        // Reset image
        if (this.originalImage) {
            document.getElementById('edited-image').src = this.originalImage.src;
            this.editedImage = this.originalImage;
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.originalImage, 0, 0);
            }
        }
    }

    downloadImage() {
        if (!this.canvas) {
            alert('Nenhuma imagem para baixar');
            return;
        }

        const link = document.createElement('a');
        link.download = 'imagem_editada.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
});