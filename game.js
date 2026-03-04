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

// Touch drag controls
let touchActive = false;
let touchId = null;
let lastTouchX = 0;
let lastTouchY = 0;

// Detect mobile device
function detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Initialize game
function init() {
    isMobile = detectMobile();
    
    // Show/hide mobile controls and add life button
    const mobileControls = document.getElementById('mobileControls');
    const controlsText = document.getElementById('controlsText');
    const addLifeBtn = document.getElementById('addLifeBtn');
    
    if (isMobile) {
        mobileControls.classList.remove('hidden');
        addLifeBtn.classList.remove('hidden');
        controlsText.textContent = 'Avoid the heat! 🔥 Drag the kernel or use controls below!';
        setupMobileControls();
    }
    
    // Add life button click handler
    addLifeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        lives++;
        updateLivesDisplay();
    });
    
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
    
    // Add touch drag controls on canvas
    setupTouchDrag();
}

// Setup touch drag on canvas
function setupTouchDrag() {
    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // Mouse events for desktop testing
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
}

// Get canvas coordinates from touch/mouse event
function getCanvasCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// Check if touch is on player
function isTouchOnPlayer(x, y) {
    const dist = Math.hypot(x - player.x, y - player.y);
    return dist <= player.size + 10; // Add a bit of tolerance
}

// Touch event handlers
function handleTouchStart(e) {
    e.preventDefault();
    
    if (touchActive) return; // Already tracking a touch
    
    const touch = e.changedTouches[0];
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
    
    if (isTouchOnPlayer(coords.x, coords.y)) {
        touchActive = true;
        touchId = touch.identifier;
        lastTouchX = coords.x;
        lastTouchY = coords.y;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (!touchActive) return;
    
    // Find the touch we're tracking
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
            const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
            
            // Move player to touch position
            player.x = coords.x;
            player.y = coords.y;
            
            // Keep player in bounds
            if (player.x < player.size) player.x = player.size;
            if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
            if (player.y < player.size) player.y = player.size;
            if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
            
            lastTouchX = coords.x;
            lastTouchY = coords.y;
            break;
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    // Check if our tracked touch ended
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
            touchActive = false;
            touchId = null;
            break;
        }
    }
}

// Mouse event handlers (for desktop testing)
function handleMouseDown(e) {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    if (isTouchOnPlayer(coords.x, coords.y)) {
        touchActive = true;
        lastTouchX = coords.x;
        lastTouchY = coords.y;
    }
}

function handleMouseMove(e) {
    if (!touchActive) return;
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    // Move player to mouse position
    player.x = coords.x;
    player.y = coords.y;
    
    // Keep player in bounds
    if (player.x < player.size) player.x = player.size;
    if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
    if (player.y < player.size) player.y = player.size;
    if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
    
    lastTouchX = coords.x;
    lastTouchY = coords.y;
}

function handleMouseUp(e) {
    touchActive = false;
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
        const addLifeBtn = document.getElementById('addLifeBtn');
        
        if (isMobile) {
            mobileControls.classList.remove('hidden');
            addLifeBtn.classList.remove('hidden');
            controlsText.textContent = 'Avoid the heat! 🔥 Drag the kernel or use controls below!';
            setupMobileControls();
        } else {
            mobileControls.classList.add('hidden');
            addLifeBtn.classList.add('hidden');
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
    // Add glow effect if touch is active
    if (touchActive) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f9ca24';
    }
    
    ctx.fillStyle = '#f9ca24';
    ctx.strokeStyle = '#f0932b';
    ctx.lineWidth = 3;
    
    // Draw kernel shape
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
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
    
    // Reset touch drag
    touchActive = false;
    touchId = null;
    
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
