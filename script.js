const canvas = document.getElementById('heartTreeCanvas');
const ctx = canvas.getContext('2d');

let width, height;

// Debounce helper to prevent excessive resizing calls
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function resize() {
    const parent = document.querySelector('.right-side');
    if (parent) {
        // Get actual display size
        const displayWidth = parent.clientWidth;
        const displayHeight = parent.clientHeight;

        if (displayWidth === 0 || displayHeight === 0) return; // Not visible yet

        // Check Device Pixel Ratio for sharp rendering on mobile
        const dpr = window.devicePixelRatio || 1;

        // Set the internal resolution
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        // Set the CSS display size
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        // Normalize coordinate system to use CSS pixels
        ctx.scale(dpr, dpr);

        // Update global width/height for drawing logic (using logical pixels)
        width = displayWidth;
        height = displayHeight;

        // Redraw
        initTree();
    }
}

// Listen to resize and orientation change
window.addEventListener('resize', debounce(resize, 150));
window.addEventListener('orientationchange', () => setTimeout(resize, 200));

// --- TREE CONFIGURATION ---
const branchColor = '#000000';
const heartColors = ['#ff0000', '#c90000', '#ff4d6d', '#800f2f', '#ff8fa3'];
let maxDepth = 12;

function drawHeart(x, y, size, angle, color) {
    if (!color) color = heartColors[Math.floor(Math.random() * heartColors.length)];

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;

    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);

    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.3);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);

    ctx.fill();
    ctx.restore();
}

function drawBranch(startX, startY, length, angle, depth, currentWidth) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const endX = startX + length * Math.cos(angle);
    const endY = startY + length * Math.sin(angle);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = branchColor;
    ctx.lineWidth = currentWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Hearts on tree (foliage)
    if (depth < 8) {
        const density = 1;
        const baseDelay = (maxDepth - depth) * 50;
        const randomDelay = Math.random() * 500;

        setTimeout(() => {
            for (let j = 0; j < density; j++) {
                const t = Math.random();
                const bx = startX + (endX - startX) * t;
                const by = startY + (endY - startY) * t;

                const spread = 20 * (1 + (8 - depth) / 3);
                const ox = (Math.random() - 0.5) * spread;
                const oy = (Math.random() - 0.5) * spread;

                const hSize = (8 + Math.random() * 10) * 1.2;
                const hAngle = (Math.random() - 0.5) * 1.5;

                drawHeart(bx + ox, by + oy, hSize, hAngle);
            }
        }, baseDelay + randomDelay + 300);
    }

    if (depth === 0) return;

    const subBranches = (Math.random() < 0.8) ? 2 : 3;

    setTimeout(() => {
        for (let i = 0; i < subBranches; i++) {
            const angleVariance = 0.8;
            const newAngle = angle + (Math.random() * angleVariance - angleVariance / 2);
            const newLength = length * (0.7 + Math.random() * 0.1);
            const newWidth = currentWidth * 0.7;

            drawBranch(endX, endY, newLength, newAngle, depth - 1, newWidth);
        }
    }, 10);
}

function initTree() {
    if (!width || !height) return;

    // Clear canvas based on logical size
    ctx.clearRect(0, 0, width, height);

    // Determine screen type
    const isMobile = width < 768 || height < 600;

    let initialLength, initialWidth;

    if (isMobile) {
        // Safe size for mobile to ensure it fits
        maxDepth = 10; // Reduce depth for performance/size on mobile
        initialLength = Math.min(height * 0.22, 110);
        initialWidth = 18;
    } else {
        // Desktop
        maxDepth = 12;
        initialLength = 160;
        initialWidth = 35;
    }

    // Draw trunk from bottom center
    // We start slightly above the bottom to show the root
    drawBranch(width / 2, height, initialLength, -Math.PI / 2, maxDepth, initialWidth);
}

// Falling hearts animation (DOM based)
function spawnFallingHeart() {
    const container = document.querySelector('.right-side');
    if (!container) return;

    const heart = document.createElement('div');
    heart.classList.add('falling-heart-tree');
    heart.innerHTML = '❤';

    const leftPos = 20 + Math.random() * 60;
    const topPos = 10 + Math.random() * 40;

    heart.style.left = leftPos + '%';
    heart.style.top = topPos + '%';

    const size = 15 + Math.random() * 15;
    const color = heartColors[Math.floor(Math.random() * heartColors.length)];
    heart.style.fontSize = size + 'px';
    heart.style.color = color;

    heart.style.animationDuration = (1 + Math.random() * 1.5) + 's';

    container.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 3000);
}

let fallingInterval;

function startFallingHearts() {
    if (fallingInterval) clearInterval(fallingInterval);
    setTimeout(() => {
        fallingInterval = setInterval(spawnFallingHeart, 1500);
    }, 2000);
}

function createFloatingHearts() {
    const container = document.body;
    // Don't remove old ones to avoid flickering, just ensure we have them?
    // Better to clear for reset
    document.querySelectorAll('.floating-heart').forEach(h => h.remove());

    const count = 30;
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.innerHTML = '❤';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
        heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
        container.appendChild(heart);
    }
}

// Boot
window.onload = () => {
    // Force initial resize
    resize();
    createFloatingHearts();
    startFallingHearts();
};

if (canvas) {
    canvas.addEventListener('click', () => {
        initTree();
        startFallingHearts();
    });
}
