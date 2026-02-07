const canvas = document.getElementById('heartTreeCanvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    const parent = document.querySelector('.right-side');
    if (parent) {
        width = canvas.width = parent.offsetWidth;
        height = canvas.height = parent.offsetHeight;
    }
}

window.addEventListener('resize', () => {
    resize();
    initTree();
});
resize();

// --- CONFIGURATION ---
const maxDepth = 12;
const trunkWidth = 35;
const branchColor = '#000000';
const heartColors = ['#ff0000', '#c90000', '#ff4d6d', '#800f2f', '#ff8fa3'];

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

    // --- FOLIAGE (HEARTS ON TREE) ---
    // Restoring hearts as requested. 
    // "appear after trunk" and "gradually" -> Delayed rendering
    // "not too many" -> Reduced density (density = 1)
    if (depth < 8) {
        const density = 1;

        // Delay calculations to make hearts pop in AFTER branches are drawn
        const baseDelay = (12 - depth) * 100; // Base delay based on distance from trunk
        const randomDelay = Math.random() * 2000; // Random spread up to 2s

        setTimeout(() => {
            for (let j = 0; j < density; j++) {
                const t = Math.random();
                const bx = startX + (endX - startX) * t;
                const by = startY + (endY - startY) * t;

                const spread = 20 * (1 + (8 - depth) / 3);
                const ox = (Math.random() - 0.5) * spread;
                const oy = (Math.random() - 0.5) * spread;

                const hSize = (12 + Math.random() * 15) * 1.3;
                const hAngle = (Math.random() - 0.5) * 1.5;

                drawHeart(bx + ox, by + oy, hSize, hAngle);
            }
        }, baseDelay + randomDelay + 500); // +500ms to ensure trunk is mostly done
    }

    if (depth === 0) return;

    // --- BRANCHING LOGIC ---
    // Keep branches snappy
    const r = Math.random();
    let subBranches;
    if (r < 0.4) subBranches = 2;
    else if (r < 0.9) subBranches = 3;
    else subBranches = 4;

    setTimeout(() => {
        for (let i = 0; i < subBranches; i++) {
            const angleVariance = 1.0;
            const newAngle = angle + (Math.random() * angleVariance - angleVariance / 2);
            const newLength = length * (0.65 + Math.random() * 0.15);
            const newWidth = currentWidth * 0.7;

            drawBranch(endX, endY, newLength, newAngle, depth - 1, newWidth);
        }
    }, 5);
}

function initTree() {
    if (!width || !height) resize();
    ctx.clearRect(0, 0, width, height);

    // Start drawing trunk - Increased length from 120 to 160
    drawBranch(width / 2, height, 160, -Math.PI / 2, maxDepth, trunkWidth);
}

// Falling hearts animation 
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

    // "Falling faster" -> Reduced duration (1s to 2.5s)
    heart.style.animationDuration = (1 + Math.random() * 1.5) + 's';

    container.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 3000);
}

let fallingInterval;

function startFallingHearts() {
    if (fallingInterval) clearInterval(fallingInterval);
    // "Appear AFTER trunk" -> Wait 3 seconds before starting the rain
    setTimeout(() => {
        // "Don't put too many" -> Slower interval (1500ms instead of 1000ms)
        fallingInterval = setInterval(spawnFallingHeart, 1500);
    }, 3000);
}

function createFloatingHearts() {
    const container = document.body;
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

window.onload = () => {
    resize();
    createFloatingHearts();
    setTimeout(initTree, 100);
    startFallingHearts(); // This now has internal delay
};

if (canvas) {
    canvas.addEventListener('click', () => {
        initTree();
        startFallingHearts();
    });
}
