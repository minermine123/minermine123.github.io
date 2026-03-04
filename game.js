// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size based on screen
function setCanvasSize() {
    const maxWidth = 1200;
    const maxHeight = 800;
    const aspectRatio = maxWidth / maxHeight;
    
    // Calculate available space (leaving room for header, controls, padding)
    const isMobileView = window.innerWidth <= 768;
    const padding = isMobileView ? 40 : 60;
    const headerHeight = isMobileView ? 180 : 200; // Header + stats + info
    const controlsHeight = isMobileView ? 220 : 0; // Mobile controls if needed
    
    const containerWidth = Math.min(window.innerWidth - padding, maxWidth);
    const containerHeight = window.innerHeight - headerHeight - controlsHeight;
    
    if (containerWidth / aspectRatio <= containerHeight) {
        canvas.width = containerWidth;
        canvas.height = containerWidth / aspectRatio;
    } else {
        canvas.height = Math.min(containerHeight, maxHeight);
        canvas.width = canvas.height * aspectRatio;
    }
    
    // Ensure minimum size for playability
    if (canvas.width < 320) canvas.width = 320;
    if (canvas.height < 240) canvas.height = 240;
}

setCanvasSize();

// Game state
let gameRunning = true;
let score = 0;
let lives = 3;
let gameSpeed = 1;
let isMobile = false;

// Player (popcorn kernel)
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 5,
    dx: 0,
    dy: 0
};

// Heat sources (enemies)
let heatSources = [];
const heatSourceSpeed = 2;
const maxHeatSources = 5;

// Water drops (falling hazards)
let waterDrops = [];
const waterDropSpeed = 3;
const maxWaterDrops = 8;

// Controls
const keys = {};
let spacePressed = false;
const mobileInput = {
    up: false,
    down: false,
    left: false,
    right: false
};

// Detect mobile device
function detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Initialize game
function init() {
    isMobile = detectMobile();
    
    // Show/hide mobile controls
    const mobileControls = document.getElementById('mobileControls');
    const controlsText = document.getElementById('controlsText');
    
    if (isMobile) {
        mobileControls.classList.remove('hidden');
        controlsText.textContent = 'Avoid the heat! 🔥 Use the controls below!';
        setupMobileControls();
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Add life when spacebar is pressed
        if (e.key === ' ' && !spacePressed) {
            spacePressed = true;
            lives++;
            updateLivesDisplay();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        
        // Reset spacebar flag
        if (e.key === ' ') {
            spacePressed = false;
        }
    });
    
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Create initial heat sources
    for (let i = 0; i < 3; i++) {
        createHeatSource();
    }
    
    gameLoop();
}

// Setup mobile controls
function setupMobileControls() {
    const buttons = document.querySelectorAll('.dpad-btn');
    
    buttons.forEach(button => {
        const direction = button.dataset.direction;
        
        // Touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileInput[direction] = true;
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileInput[direction] = false;
        });
        
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            mobileInput[direction] = false;
        });
        
        // Mouse events (for testing on desktop)
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            mobileInput[direction] = true;
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            mobileInput[direction] = false;
        });
        
        button.addEventListener('mouseleave', (e) => {
            mobileInput[direction] = false;
        });
    });
}

// Handle window resize
function handleResize() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    setCanvasSize();
    
    // Adjust player position proportionally
    player.x = (player.x / oldWidth) * canvas.width;
    player.y = (player.y / oldHeight) * canvas.height;
    
    // Adjust heat sources
    heatSources.forEach(heat => {
        heat.x = (heat.x / oldWidth) * canvas.width;
        heat.y = (heat.y / oldHeight) * canvas.height;
    });
    
    // Adjust water drops
    waterDrops.forEach(drop => {
        drop.x = (drop.x / oldWidth) * canvas.width;
        drop.y = (drop.y / oldHeight) * canvas.height;
    });
    
    // Check if device type changed
    const wasMobile = isMobile;
    isMobile = detectMobile();
    
    if (wasMobile !== isMobile) {
        const mobileControls = document.getElementById('mobileControls');
        const controlsText = document.getElementById('controlsText');
        
        if (isMobile) {
            mobileControls.classList.remove('hidden');
            controlsText.textContent = 'Avoid the heat! 🔥 Use the controls below!';
            setupMobileControls();
        } else {
            mobileControls.classList.add('hidden');
            controlsText.textContent = 'Use Arrow Keys or WASD to move! Avoid the heat! 🔥';
        }
    }
}

// Create heat source
function createHeatSource() {
    const side = Math.floor(Math.random() * 4);
    let x, y, dx, dy;
    
    // Spawn from random side
    switch(side) {
        case 0: // Top
            x = Math.random() * canvas.width;
            y = -30;
            break;
        case 1: // Right
            x = canvas.width + 30;
            y = Math.random() * canvas.height;
            break;
        case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + 30;
            break;
        case 3: // Left
            x = -30;
            y = Math.random() * canvas.height;
            break;
    }
    
    // Calculate direction toward player
    const angle = Math.atan2(player.y - y, player.x - x);
    dx = Math.cos(angle) * heatSourceSpeed * gameSpeed;
    dy = Math.sin(angle) * heatSourceSpeed * gameSpeed;
    
    const isGreen = Math.random() < 0.5;
    const size = isGreen ? 35 : 25;

    heatSources.push({ x, y, dx, dy, size, type: isGreen ? 'green' : 'red' });
}

// Create water drop
function createWaterDrop() {
    const x = Math.random() * canvas.width;
    const y = -20;
    const size = 12 + Math.random() * 8; // Random size between 12-20
    
    waterDrops.push({ x, y, size, speed: waterDropSpeed * (0.8 + Math.random() * 0.4) });
}

// Update player movement
function updatePlayer() {
    player.dx = 0;
    player.dy = 0;
    
    // Keyboard controls
    if (keys['ArrowUp'] || keys['w'] || keys['W']) player.dy = -player.speed;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) player.dy = player.speed;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.dx = -player.speed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) player.dx = player.speed;
    
    // Mobile controls
    if (mobileInput.up) player.dy = -player.speed;
    if (mobileInput.down) player.dy = player.speed;
    if (mobileInput.left) player.dx = -player.speed;
    if (mobileInput.right) player.dx = player.speed;
    
    // Update position
    player.x += player.dx;
    player.y += player.dy;
    
    // Keep player in bounds
    if (player.x < player.size) player.x = player.size;
    if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
    if (player.y < player.size) player.y = player.size;
    if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
}

// Update heat sources
function updateHeatSources() {
    // Move heat sources
    for (let i = heatSources.length - 1; i >= 0; i--) {
        const heat = heatSources[i];
        heat.x += heat.dx;
        heat.y += heat.dy;
        
        // Check collision with player
        const dist = Math.hypot(player.x - heat.x, player.y - heat.y);
        if (dist < player.size + heat.size) {
            // Player got hit!
            lives--;
            updateLivesDisplay();
            heatSources.splice(i, 1);
            
            if (lives <= 0) {
                endGame();
                return;
            }
            continue;
        }
        
        // Remove if off screen
        if (heat.x < -50 || heat.x > canvas.width + 50 || 
            heat.y < -50 || heat.y > canvas.height + 50) {
            heatSources.splice(i, 1);
        }
    }
    
    // Add new heat sources
    if (heatSources.length < maxHeatSources && Math.random() < 0.02) {
        createHeatSource();
    }
}

// Update water drops
function updateWaterDrops() {
    // Move water drops
    for (let i = waterDrops.length - 1; i >= 0; i--) {
        const drop = waterDrops[i];
        drop.y += drop.speed * gameSpeed;
        
        // Check collision with player
        const dist = Math.hypot(player.x - drop.x, player.y - drop.y);
        if (dist < player.size + drop.size) {
            // Player got hit by water!
            lives--;
            updateLivesDisplay();
            waterDrops.splice(i, 1);
            
            if (lives <= 0) {
                endGame();
                return;
            }
            continue;
        }
        
        // Remove if off screen
        if (drop.y > canvas.height + 30) {
            waterDrops.splice(i, 1);
        }
    }
    
    // Add new water drops
    if (waterDrops.length < maxWaterDrops && Math.random() < 0.03) {
        createWaterDrop();
    }
}

// Draw player (kernel)
function drawPlayer() {
    ctx.fillStyle = '#f9ca24';
    ctx.strokeStyle = '#f0932b';
    ctx.lineWidth = 3;
    
    // Draw kernel shape
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Add detail
    ctx.fillStyle = '#f0932b';
    ctx.beginPath();
    ctx.arc(player.x - 5, player.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 5, player.y + 5, 4, 0, Math.PI * 2);
    ctx.fill();
}

// Draw heat sources
function drawHeatSources() {
    heatSources.forEach(heat => {
        // Draw flame
        const gradient = ctx.createRadialGradient(heat.x, heat.y, 5, heat.x, heat.y, heat.size);
        if (heat.type === 'green') {
            gradient.addColorStop(0, '#b7f34a');
            gradient.addColorStop(0.5, '#6fdc3b');
            gradient.addColorStop(1, '#2bbf4b');
        } else {
            gradient.addColorStop(0, '#ff6348');
            gradient.addColorStop(0.5, '#ff4757');
            gradient.addColorStop(1, '#ff3838');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(heat.x, heat.y, heat.size, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        ctx.fillStyle = heat.type === 'green' ? 'rgba(160, 255, 140, 0.6)' : 'rgba(255, 255, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(heat.x, heat.y, heat.size * (heat.type === 'green' ? 0.65 : 0.5), 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw water drops
function drawWaterDrops() {
    waterDrops.forEach(drop => {
        // Draw water drop with gradient
        const gradient = ctx.createRadialGradient(drop.x, drop.y - drop.size * 0.2, 2, drop.x, drop.y, drop.size);
        gradient.addColorStop(0, 'rgba(173, 216, 230, 0.9)'); // Light blue
        gradient.addColorStop(0.5, 'rgba(100, 149, 237, 0.8)'); // Cornflower blue
        gradient.addColorStop(1, 'rgba(65, 105, 225, 0.7)'); // Royal blue
        
        ctx.fillStyle = gradient;
        
        // Draw teardrop shape
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Add highlight for water shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(drop.x - drop.size * 0.2, drop.y - drop.size * 0.3, drop.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Add steam effect (small wavy lines above drop)
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.3)';
        ctx.lineWidth = 1;
        const steamY = drop.y - drop.size - 5;
        for (let s = 0; s < 2; s++) {
            ctx.beginPath();
            ctx.moveTo(drop.x - 3 + s * 6, steamY);
            ctx.lineTo(drop.x - 3 + s * 6, steamY - 5);
            ctx.stroke();
        }
    });
}

// Update score
function updateScore() {
    score++;
    document.getElementById('score').textContent = score;
    
    // Increase difficulty
    if (score % 100 === 0) {
        gameSpeed += 0.1;
    }
}

// Update lives display
function updateLivesDisplay() {
    document.getElementById('lives').textContent = lives;
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    clearCanvas();
    updatePlayer();
    updateHeatSources();
    updateWaterDrops();
    drawWaterDrops();
    drawHeatSources();
    drawPlayer();
    updateScore();
    
    requestAnimationFrame(gameLoop);
}

// End game
function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Restart game
function restartGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    gameSpeed = 1;
    heatSources = [];
    waterDrops = [];
    
    // Reset mobile input
    mobileInput.up = false;
    mobileInput.down = false;
    mobileInput.left = false;
    mobileInput.right = false;
    
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('gameOver').classList.add('hidden');
    
    // Create initial heat sources
    for (let i = 0; i < 3; i++) {
        createHeatSource();
    }
    
    gameLoop();
}

// Start game
init();
