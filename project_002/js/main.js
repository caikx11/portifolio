// Etch-a-Sketch Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sketchpad = document.getElementById('sketchpad');
    const clearBtn = document.getElementById('clearBtn');
    const rainbowBtn = document.getElementById('rainbowBtn');
    const shadeBtn = document.getElementById('shadeBtn');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');

    // State
    let currentMode = 'normal'; // normal, rainbow, shade
    let gridSize = 16;

    // Initialize the application
    init();

    function init() {
        createGrid(gridSize);
        setupEventListeners();
    }

    function createGrid(size) {
        // Clear existing grid
        sketchpad.innerHTML = '';
        sketchpad.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        sketchpad.style.gridTemplateRows = `repeat(${size}, 1fr)`;

        // Create grid cells
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('sketch-cell');
            cell.addEventListener('mouseover', handleCellMouseOver);
            sketchpad.appendChild(cell);
        }

        // Update size display
        sizeValue.textContent = size;
    }

    function handleCellMouseOver(e) {
        if (!e.buttons) return; // Only draw when mouse button is pressed

        const cell = e.target;

        switch (currentMode) {
            case 'normal':
                cell.style.backgroundColor = '#000000';
                break;
            case 'rainbow':
                const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
                cell.style.backgroundColor = randomColor;
                break;
            case 'shade':
                const currentColor = cell.style.backgroundColor;
                let darkness = 0;

                if (currentColor) {
                    // Extract current darkness from rgb() or hex
                    if (currentColor.startsWith('rgb')) {
                        const rgbMatch = currentColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
                        if (rgbMatch) {
                            const avg = (parseInt(rgbMatch[1]) + parseInt(rgbMatch[2]) + parseInt(rgbMatch[3])) / 3;
                            darkness = 255 - avg;
                        }
                    } else if (currentColor.startsWith('#')) {
                        const hex = currentColor.substring(1);
                        if (hex.length === 3) {
                            const r = parseInt(hex[0] + hex[0], 16);
                            const g = parseInt(hex[1] + hex[1], 16);
                            const b = parseInt(hex[2] + hex[2], 16);
                            darkness = 255 - ((r + g + b) / 3);
                        } else if (hex.length === 6) {
                            const r = parseInt(hex.substring(0, 2), 16);
                            const g = parseInt(hex.substring(2, 4), 16);
                            const b = parseInt(hex.substring(4, 6), 16);
                            darkness = 255 - ((r + g + b) / 3);
                        }
                    }
                }

                // Increase darkness by 10% (up to max)
                const newDarkness = Math.min(255, darkness + 25.5);
                const lightness = 255 - newDarkness;
                cell.style.backgroundColor = `rgb(${lightness}, ${lightness}, ${lightness})`;
                break;
        }
    }

    function setupEventListeners() {
        clearBtn.addEventListener('click', () => {
            const cells = sketchpad.querySelectorAll('.sketch-cell');
            cells.forEach(cell => {
                cell.style.backgroundColor = '';
            });
        });

        rainbowBtn.addEventListener('click', () => {
            currentMode = 'rainbow';
            updateActiveButton(rainbowBtn);
        });

        shadeBtn.addEventListener('click', () => {
            currentMode = 'shade';
            updateActiveButton(shadeBtn);
        });

        // Normal mode is default, so we'll set it when others are deactivated
        document.addEventListener('click', (e) => {
            if (e.target !== rainbowBtn && e.target !== shadeBtn) {
                // Check if click was on a cell or container
                if (!e.target.classList.contains('sketch-cell') &&
                    e.target !== sketchpad &&
                    !sketchpad.contains(e.target)) {
                    currentMode = 'normal';
                    updateActiveButton(null); // No button active
                }
            }
        });

        sizeSlider.addEventListener('input', (e) => {
            gridSize = parseInt(e.target.value);
            createGrid(gridSize);
        });

        // Allow drawing with mouse down (not just hover)
        sketchpad.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent text selection
            handleCellMouseOver(e);
        });

        sketchpad.addEventListener('mouseenter', (e) => {
            if (e.buttons) {
                handleCellMouseOver(e);
            }
        });
    }

    function updateActiveButton(activeBtn) {
        // Remove active class from all buttons
        [clearBtn, rainbowBtn, shadeBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });

        // Add active class to the specified button
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // Initialize with normal mode active (default)
    // No button is active for normal mode by default
});

// Add CSS for active button state
const style = document.createElement('style');
style.textContent = `
    .active {
        background: #4CAF50 !important;
        color: white !important;
        transform: scale(1.05);
    }

    .sketch-cell {
        border: 1px solid #eee;
        background-color: white;
        transition: background-color 0.1s ease;
    }

    .sketch-cell:hover {
        cursor: crosshair;
    }

    .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
        align-items: center;
    }

    .controls button {
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        background-color: #f0f0f0;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
    }

    .controls button:hover:not(.active) {
        background-color: #e0e0e0;
        transform: translateY(-2px);
    }

    .controls label {
        margin-left: 20px;
        font-size: 14px;
    }

    .controls input[type="range"] {
        width: 100px;
        margin: 0 10px;
        vertical-align: middle;
    }

    .sketchpad {
        border: 2px solid #333;
        display: grid;
        background-color: #fafafa;
        margin: 20px 0;
    }

    .info {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 4px;
        border-left: 4px solid #007bff;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
    }
`;
document.head.appendChild(style);