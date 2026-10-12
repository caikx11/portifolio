// Meme templates (using placeholder images)
const templates = [
    {
        id: 'drake',
        name: 'Drake',
        image: 'https://i.imgflip.com/30b1gx.jpg'
    },
    {
        id: 'distracted-bf',
        name: 'Namorado Distraído',
        image: 'https://i.imgflip.com/1ur9b0.jpg'
    },
    {
        id: 'change-mind',
        name: 'Mude Minha Opinião',
        image: 'https://i.imgflip.com/24y43o.jpg'
    },
    {
        id: 'expanding-brain',
        name: 'Cérebro Expandindo',
        image: 'https://i.imgflip.com/1ur9b0.jpg'
    },
    {
        id: 'two-buttons',
        name: 'Dois Botões',
        image: 'https://i.imgflip.com/2/285468.jpg'
    },
    {
        id: 'roll-safe',
        name: 'Roll Safe',
        image: 'https://i.imgflip.com/1o4y0l.jpg'
    },
    {
        id: 'this-is-fine',
        name: 'Tudo Bem',
        image: 'https://i.imgflip.com/2g0j4.jpg'
    },
    {
        id: 'surprised-pikachu',
        name: 'Pikachu Surpreso',
        image: 'https://i.imgflip.com/2/1otk96.jpg'
    }
];

// Application state
let currentImage = null;
let currentTemplate = null;

// DOM Elements
const memeContainer = document.getElementById('meme-container');
const memeImage = document.getElementById('meme-image');
const topTextElement = document.getElementById('top-text');
const bottomTextElement = document.getElementById('bottom-text');
const placeholder = document.getElementById('placeholder');
const templatesContainer = document.getElementById('templates');
const imageUpload = document.getElementById('image-upload');
const topTextInput = document.getElementById('top-text-input');
const bottomTextInput = document.getElementById('bottom-text-input');
const fontSizeInput = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const fontColorInput = document.getElementById('font-color');
const strokeColorInput = document.getElementById('stroke-color');
const strokeWidthInput = document.getElementById('stroke-width');
const strokeWidthValue = document.getElementById('stroke-width-value');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');

// Initialize the application
function init() {
    // Load templates
    loadTemplates();

    // Add event listeners
    imageUpload.addEventListener('change', handleImageUpload);
    topTextInput.addEventListener('input', updateTopText);
    bottomTextInput.addEventListener('input', updateBottomText);
    fontSizeInput.addEventListener('input', updateFontSize);
    fontColorInput.addEventListener('input', updateFontColor);
    strokeColorInput.addEventListener('input', updateStrokeColor);
    strokeWidthInput.addEventListener('input', updateStrokeWidth);
    downloadBtn.addEventListener('click', downloadMeme);
    shareBtn.addEventListener('click', shareMeme);

    // Initialize text elements with current styles
    updateFontSize();
    updateFontColor();
    updateStrokeColor();
    updateStrokeWidth();
}

// Load templates
function loadTemplates() {
    templatesContainer.innerHTML = templates.map(template => `
        <button class="template-btn" data-template="${template.id}" title="${template.name}">
            <img src="${template.image}" alt="${template.name}">
        </button>
    `).join('');

    // Add click events to template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const templateId = btn.dataset.template;
            selectTemplate(templateId);
        });
    });
}

// Select a template
function selectTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    currentTemplate = template;
    currentImage = template.image;

    // Update active state
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.template-btn[data-template="${templateId}"]`).classList.add('active');

    // Load image
    loadImage(template.image);
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
    }

    // Clear template selection
    currentTemplate = null;
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
        currentImage = event.target.result;
        loadImage(currentImage);
    };
    reader.readAsDataURL(file);
}

// Load image into meme container
function loadImage(src) {
    memeImage.src = src;
    memeImage.onload = () => {
        placeholder.style.display = 'none';
        memeContainer.style.display = 'block';
    };
    memeImage.onerror = () => {
        alert('Erro ao carregar a imagem. Tente novamente.');
        placeholder.style.display = 'block';
        memeContainer.style.display = 'none';
    };
}

// Update top text
function updateTopText() {
    topTextElement.textContent = topTextInput.value;
}

// Update bottom text
function updateBottomText() {
    bottomTextElement.textContent = bottomTextInput.value;
}

// Update font size
function updateFontSize() {
    const size = fontSizeInput.value;
    fontSizeValue.textContent = `${size}px`;
    topTextElement.style.fontSize = `${size}px`;
    bottomTextElement.style.fontSize = `${size}px`;
}

// Update font color
function updateFontColor() {
    const color = fontColorInput.value;
    topTextElement.style.color = color;
    bottomTextElement.style.color = color;
}

// Update stroke color
function updateStrokeColor() {
    const color = strokeColorInput.value;
    topTextElement.style.webkitTextStrokeColor = color;
    topTextElement.style.textStrokeColor = color;
    bottomTextElement.style.webkitTextStrokeColor = color;
    bottomTextElement.style.textStrokeColor = color;
}

// Update stroke width
function updateStrokeWidth() {
    const width = strokeWidthInput.value;
    strokeWidthValue.textContent = `${width}px`;
    topTextElement.style.webkitTextStrokeWidth = `${width}px`;
    topTextElement.style.textStrokeWidth = `${width}px`;
    bottomTextElement.style.webkitTextStrokeWidth = `${width}px`;
    bottomTextElement.style.textStrokeWidth = `${width}px`;
}

// Download meme
function downloadMeme() {
    if (!currentImage) {
        alert('Por favor, selecione uma imagem primeiro.');
        return;
    }

    // Create a canvas to render the meme
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to match the image
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = currentImage;

    img.onload = () => {
        // Calculate dimensions to fit in canvas
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        // Scale down if needed
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Draw top text
        drawText(ctx, topTextInput.value, width / 2, height * 0.1, width);

        // Draw bottom text
        drawText(ctx, bottomTextInput.value, width / 2, height * 0.9, width, true);

        // Download
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    img.onerror = () => {
        alert('Erro ao processar a imagem. Tente novamente.');
    };
}

// Draw text on canvas
function drawText(ctx, text, x, y, maxWidth, isBottom = false) {
    if (!text.trim()) return;

    const fontSize = parseInt(fontSizeInput.value);
    const fontColor = fontColorInput.value;
    const strokeColor = strokeColorInput.value;
    const strokeWidth = parseInt(strokeWidthInput.value);

    ctx.font = `${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.fillStyle = fontColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.textAlign = 'center';
    ctx.textBaseline = isBottom ? 'bottom' : 'top';

    // Word wrap
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth * 0.9 && currentLine) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    });
    lines.push(currentLine.trim());

    // Draw each line
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;

    lines.forEach((line, index) => {
        const lineY = isBottom ? y - (lines.length - 1 - index) * lineHeight : y + index * lineHeight;
        ctx.strokeText(line, x, lineY);
        ctx.fillText(line, x, lineY);
    });
}

// Share meme
async function shareMeme() {
    if (!currentImage) {
        alert('Por favor, selecione uma imagem primeiro.');
        return;
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = currentImage;

    img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        drawText(ctx, topTextInput.value, width / 2, height * 0.1, width);
        drawText(ctx, bottomTextInput.value, width / 2, height * 0.9, width, true);

        // Convert to blob and share
        canvas.toBlob(async (blob) => {
            if (navigator.share) {
                try {
                    const file = new File([blob], 'meme.png', { type: 'image/png' });
                    await navigator.share({
                        title: 'Meu Meme',
                        text: 'Confira este meme que criei!',
                        files: [file]
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('Erro ao compartilhar:', err);
                        alert('Erro ao compartilhar. Tente baixar a imagem.');
                    }
                }
            } else {
                alert('Compartilhamento não suportado neste navegador. Use o botão de download.');
            }
        }, 'image/png');
    };

    img.onerror = () => {
        alert('Erro ao processar a imagem para compartilhamento.');
    };
}

// Initialize the application when DOM loads
document.addEventListener('DOMContentLoaded', init);