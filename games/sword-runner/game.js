// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function setCanvasSize() {
    const maxWidth = 1200;
    const maxHeight = 600;
    const aspectRatio = maxWidth / maxHeight;
    
    let width = Math.min(window.innerWidth - 40, maxWidth);
    let height = width / aspectRatio;
    
    if (height > window.innerHeight * 0.6) {
        height = window.innerHeight * 0.6;
        width = height * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Game State
let gameRunning = false;
let score = 0;
let enemiesDefeated = 0;
let gameTime = 0;
let currentLevel = 1;
let enemiesNeededForNextLevel = 5;
let enemiesDefeatedThisLevel = 0;

// UI Elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const mobileControls = document.getElementById('mobile-controls');

// Detect Mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
    mobileControls.classList.remove('hidden');
}

// Player Object
const player = {
    x: 100,
    y: 0,
    width: 40,
    height: 60,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    isGrounded: false,
    health: 100,
    maxHealth: 100,
    facing: 1, // 1 = right, -1 = left
    
    // Animation state
    state: 'idle', // idle, running, jumping, attacking
    animationFrame: 0,
    animationTimer: 0,
    animationSpeed: 100, // milliseconds per frame
    attackCooldown: 0,
    attackDuration: 500,
    isAttacking: false
};

// Input State
const keys = {};
let mobileInput = {
    left: false,
    right: false,
    jump: false,
    attack: false
};

// Game Objects
let platforms = [];
let enemies = [];
let coins = [];
let particles = [];

// Constants
const GRAVITY = 0.6;
const GROUND_Y = canvas.height - 80;
const ATTACK_RANGE = 60;
const BASE_ATTACK_DAMAGE = 50;
let ATTACK_DAMAGE = BASE_ATTACK_DAMAGE;

// Level configuration
const LEVEL_CONFIG = {
    enemySpeedMultiplier: 1,
    enemyHealthMultiplier: 1,
    maxEnemies: 3,
    spawnDelay: 3000
};

// Initialize Game
function init() {
    player.x = 100;
    player.y = GROUND_Y - player.height;
    player.velocityX = 0;
    player.velocityY = 0;
    player.health = player.maxHealth;
    player.state = 'idle';
    player.animationFrame = 0;
    
    score = 0;
    enemiesDefeated = 0;
    enemiesDefeatedThisLevel = 0;
    gameTime = 0;
    currentLevel = 1;
    enemiesNeededForNextLevel = 5;
    
    // Reset level config
    LEVEL_CONFIG.enemySpeedMultiplier = 1;
    LEVEL_CONFIG.enemyHealthMultiplier = 1;
    LEVEL_CONFIG.maxEnemies = 3;
    LEVEL_CONFIG.spawnDelay = 3000;
    ATTACK_DAMAGE = BASE_ATTACK_DAMAGE;
    
    platforms = createPlatforms();
    enemies = [];
    coins = [];
    particles = [];
    
    spawnEnemy();
    spawnCoins();
    
    updateUI();
}

// Create Platforms
function createPlatforms() {
    const platformList = [
        { x: 0, y: GROUND_Y, width: canvas.width, height: 20 }, // Ground
        { x: 200, y: GROUND_Y - 120, width: 150, height: 15 },
        { x: 450, y: GROUND_Y - 180, width: 150, height: 15 },
        { x: 700, y: GROUND_Y - 130, width: 150, height: 15 },
        { x: 950, y: GROUND_Y - 100, width: 200, height: 15 }
    ];
    return platformList;
}

// Spawn Enemy
function spawnEnemy() {
    if (enemies.length < LEVEL_CONFIG.maxEnemies) {
        const x = canvas.width + Math.random() * 200;
        const onPlatform = Math.random() > 0.5 && platforms.length > 1;
        let y = GROUND_Y - 40;
        
        if (onPlatform) {
            const platform = platforms[Math.floor(Math.random() * (platforms.length - 1)) + 1];
            y = platform.y - 40;
        }
        
        const baseSpeed = 2 + Math.random() * 2;
        const baseHealth = 50;
        
        enemies.push({
            x: x,
            y: y,
            width: 35,
            height: 40,
            velocityX: -(baseSpeed * LEVEL_CONFIG.enemySpeedMultiplier),
            velocityY: 0,
            health: baseHealth * LEVEL_CONFIG.enemyHealthMultiplier,
            maxHealth: baseHealth * LEVEL_CONFIG.enemyHealthMultiplier,
            type: 'slime'
        });
    }
    
    setTimeout(spawnEnemy, LEVEL_CONFIG.spawnDelay + Math.random() * 2000);
}

// Spawn Coins
function spawnCoins() {
    if (coins.length < 5) {
        platforms.forEach((platform, index) => {
            if (index > 0 && Math.random() > 0.5) {
                coins.push({
                    x: platform.x + platform.width / 2,
                    y: platform.y - 40,
                    width: 20,
                    height: 20,
                    rotation: 0
                });
            }
        });
    }
    
    setTimeout(spawnCoins, 5000);
}

// Input Handlers
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Prevent spacebar from scrolling the page
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
    }
    
    if ((e.key === ' ' || e.key === 'z') && !player.isAttacking) {
        performAttack();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    
    // Prevent spacebar from scrolling the page
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
    }
});

// Mobile Controls
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        
        if (action === 'left') mobileInput.left = true;
        if (action === 'right') mobileInput.right = true;
        if (action === 'jump') handleJump();
        if (action === 'attack') performAttack();
    });
    
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        
        if (action === 'left') mobileInput.left = false;
        if (action === 'right') mobileInput.right = false;
    });
});

// Handle Jump
function handleJump() {
    if (player.isGrounded) {
        player.velocityY = -player.jumpPower;
        player.isGrounded = false;
        player.state = 'jumping';
        player.animationFrame = 0;
    }
}

// Perform Attack
function performAttack() {
    if (!player.isAttacking && player.attackCooldown <= 0) {
        player.isAttacking = true;
        player.state = 'attacking';
        player.animationFrame = 0;
        player.attackCooldown = player.attackDuration;
        
        // Check for enemy hits
        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if enemy is in front of player
            const inFront = (player.facing === 1 && dx > 0) || (player.facing === -1 && dx < 0);
            
            if (distance < ATTACK_RANGE && inFront) {
                enemy.health -= ATTACK_DAMAGE;
                createHitParticles(enemy.x, enemy.y);
                
                if (enemy.health <= 0) {
                    enemiesDefeated++;
                    enemiesDefeatedThisLevel++;
                    score += 100;
                    
                    // Check for level up
                    if (enemiesDefeatedThisLevel >= enemiesNeededForNextLevel) {
                        levelUp();
                    }
                }
            }
        });
        
        setTimeout(() => {
            player.isAttacking = false;
            if (player.state === 'attacking') {
                player.state = 'idle';
            }
        }, player.attackDuration);
    }
}

// Create Hit Particles
function createHitParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 10,
            velocityY: (Math.random() - 0.5) * 10,
            size: 3 + Math.random() * 4,
            life: 30,
            color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
        });
    }
}

// Level Up Function
function levelUp() {
    currentLevel++;
    enemiesDefeatedThisLevel = 0;
    enemiesNeededForNextLevel = Math.floor(5 + currentLevel * 2);
    
    // Increase difficulty
    LEVEL_CONFIG.enemySpeedMultiplier = 1 + (currentLevel - 1) * 0.15;
    LEVEL_CONFIG.enemyHealthMultiplier = 1 + (currentLevel - 1) * 0.2;
    LEVEL_CONFIG.maxEnemies = Math.min(3 + Math.floor(currentLevel / 2), 6);
    LEVEL_CONFIG.spawnDelay = Math.max(2000 - (currentLevel - 1) * 100, 1000);
    
    // Heal player slightly on level up
    player.health = Math.min(player.health + 30, player.maxHealth);
    
    // Bonus score
    score += currentLevel * 200;
    
    // Show level up notification
    showLevelUpNotification();
}

// Show Level Up Notification
function showLevelUpNotification() {
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <h2>🎉 LEVEL ${currentLevel}! 🎉</h2>
        <p>Enemies are stronger!</p>
        <p>+30 Health Restored</p>
        <p>Bonus: ${currentLevel * 200} points</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 2500);
}

// Update Function
function update(deltaTime) {
    if (!gameRunning) return;
    
    gameTime += deltaTime;
    
    // Update player cooldowns
    if (player.attackCooldown > 0) {
        player.attackCooldown -= deltaTime;
    }
    
    // Player movement
    player.velocityX = 0;
    
    if (keys['arrowleft'] || keys['a'] || mobileInput.left) {
        player.velocityX = -player.speed;
        player.facing = -1;
        if (player.isGrounded && !player.isAttacking) {
            player.state = 'running';
        }
    }
    if (keys['arrowright'] || keys['d'] || mobileInput.right) {
        player.velocityX = player.speed;
        player.facing = 1;
        if (player.isGrounded && !player.isAttacking) {
            player.state = 'running';
        }
    }
    
    if ((keys['arrowup'] || keys['w']) && player.isGrounded) {
        handleJump();
    }
    
    // Set idle state if not moving and grounded
    if (player.velocityX === 0 && player.isGrounded && !player.isAttacking) {
        player.state = 'idle';
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Platform collision
    player.isGrounded = false;
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.velocityY >= 0) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isGrounded = true;
            
            if (player.state === 'jumping') {
                player.state = 'idle';
            }
        }
    });
    
    // Update animation
    updateAnimation(deltaTime);
    
    // Update enemies
    updateEnemies();
    
    // Update coins
    updateCoins();
    
    // Update particles
    updateParticles();
    
    // Update UI
    updateUI();
    
    // Check game over
    if (player.health <= 0) {
        gameOver();
    }
}

// Update Animation
function updateAnimation(deltaTime) {
    player.animationTimer += deltaTime;
    
    let frameCount = 1;
    let animSpeed = player.animationSpeed;
    
    switch (player.state) {
        case 'idle':
            frameCount = 1;
            break;
        case 'running':
            frameCount = 6;
            animSpeed = 80;
            break;
        case 'jumping':
            frameCount = 5;
            animSpeed = 100;
            break;
        case 'attacking':
            frameCount = 5;
            animSpeed = 100;
            break;
    }
    
    if (player.animationTimer >= animSpeed) {
        player.animationTimer = 0;
        player.animationFrame = (player.animationFrame + 1) % frameCount;
    }
}

// Update Enemies
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x += enemy.velocityX;
        
        // Apply gravity to enemies
        enemy.velocityY += GRAVITY;
        enemy.y += enemy.velocityY;
        
        // Enemy platform collision
        platforms.forEach(platform => {
            if (enemy.x + enemy.width > platform.x &&
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height > platform.y &&
                enemy.y + enemy.height < platform.y + platform.height &&
                enemy.velocityY >= 0) {
                
                enemy.y = platform.y - enemy.height;
                enemy.velocityY = 0;
            }
        });
        
        // Check collision with player
        if (!player.isAttacking &&
            player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height) {
            
            player.health -= 0.5; // Damage over time when touching
        }
        
        // Remove dead or off-screen enemies
        if (enemy.health <= 0 || enemy.x < -enemy.width) {
            enemies.splice(index, 1);
        }
    });
}

// Update Coins
function updateCoins() {
    coins.forEach((coin, index) => {
        coin.rotation += 0.05;
        
        // Check collision with player
        if (player.x + player.width > coin.x &&
            player.x < coin.x + coin.width &&
            player.y + player.height > coin.y &&
            player.y < coin.y + coin.height) {
            
            score += 50;
            coins.splice(index, 1);
            createCoinParticles(coin.x, coin.y);
        }
    });
}

// Create Coin Particles
function createCoinParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 8,
            velocityY: (Math.random() - 0.5) * 8,
            size: 4,
            life: 25,
            color: '#FFD700'
        });
    }
}

// Update Particles
function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Draw Stick Figure based on animation frames
function drawStickFigure(x, y, state, frame, facing) {
    ctx.save();
    ctx.translate(x + 20, y + 30); // Center point
    ctx.scale(facing, 1); // Flip horizontally when facing left
    
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Body proportions
    const headRadius = 8;
    const bodyLength = 20;
    const armLength = 15;
    const legLength = 18;
    
    if (state === 'running') {
        // Running animation frames
        const runCycle = [
            // Frame positions based on the image
            { legAngle1: -30, legAngle2: 30, armAngle1: 30, armAngle2: -30 },
            { legAngle1: -15, legAngle2: 45, armAngle1: 45, armAngle2: -40 },
            { legAngle1: 0, legAngle2: 50, armAngle1: 50, armAngle2: -45 },
            { legAngle1: 30, legAngle2: -30, armAngle1: -30, armAngle2: 30 },
            { legAngle1: 45, legAngle2: -15, armAngle1: -40, armAngle2: 45 },
            { legAngle1: 50, legAngle2: 0, armAngle1: -45, armAngle2: 50 }
        ];
        
        const pose = runCycle[frame % runCycle.length];
        
        // Head
        ctx.beginPath();
        ctx.arc(0, -bodyLength - headRadius, headRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -bodyLength - headRadius, 2, 0, Math.PI * 2);
        ctx.arc(3, -bodyLength - headRadius, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(0, -bodyLength);
        ctx.lineTo(0, 0);
        ctx.stroke();
        
        // Arms with sword
        drawArm(0, -bodyLength + 5, armLength, pose.armAngle1, true); // Sword arm
        drawArm(0, -bodyLength + 5, armLength, pose.armAngle2, false);
        
        // Legs
        drawLeg(0, 0, legLength, pose.legAngle1);
        drawLeg(0, 0, legLength, pose.legAngle2);
        
    } else if (state === 'jumping') {
        // Jumping animation
        const jumpCycle = [
            { legAngle: -20, armAngle: -45 },
            { legAngle: 0, armAngle: -60 },
            { legAngle: 30, armAngle: -80 },
            { legAngle: 45, armAngle: -70 },
            { legAngle: 20, armAngle: -50 }
        ];
        
        const pose = jumpCycle[Math.min(frame, jumpCycle.length - 1)];
        
        // Head
        ctx.beginPath();
        ctx.arc(0, -bodyLength - headRadius, headRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -bodyLength - headRadius, 2, 0, Math.PI * 2);
        ctx.arc(3, -bodyLength - headRadius, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(0, -bodyLength);
        ctx.lineTo(0, 0);
        ctx.stroke();
        
        // Arms
        drawArm(0, -bodyLength + 5, armLength, pose.armAngle, true);
        drawArm(0, -bodyLength + 5, armLength, -30, false);
        
        // Legs tucked
        drawLeg(0, 0, legLength, pose.legAngle);
        drawLeg(0, 0, legLength, pose.legAngle + 15);
        
    } else if (state === 'attacking') {
        // Attacking animation
        const attackCycle = [
            { armAngle: 45, swordAngle: 0 },
            { armAngle: -30, swordAngle: -45 },
            { armAngle: -90, swordAngle: -90 },
            { armAngle: -120, swordAngle: -100 },
            { armAngle: -60, swordAngle: -80 }
        ];
        
        const pose = attackCycle[Math.min(frame, attackCycle.length - 1)];
        
        // Head
        ctx.beginPath();
        ctx.arc(0, -bodyLength - headRadius, headRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -bodyLength - headRadius, 2, 0, Math.PI * 2);
        ctx.arc(3, -bodyLength - headRadius, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Body leaning
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(0, -bodyLength);
        ctx.lineTo(2, 0);
        ctx.stroke();
        
        // Attacking arm with sword
        drawAttackArm(0, -bodyLength + 5, armLength, pose.armAngle, pose.swordAngle);
        
        // Other arm
        drawArm(0, -bodyLength + 5, armLength, 30, false);
        
        // Legs
        drawLeg(2, 0, legLength, -10);
        drawLeg(2, 0, legLength, 20);
        
    } else {
        // Idle state
        // Head
        ctx.beginPath();
        ctx.arc(0, -bodyLength - headRadius, headRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -bodyLength - headRadius, 2, 0, Math.PI * 2);
        ctx.arc(3, -bodyLength - headRadius, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(0, -bodyLength);
        ctx.lineTo(0, 0);
        ctx.stroke();
        
        // Arms
        drawArm(0, -bodyLength + 5, armLength, 20, true);
        drawArm(0, -bodyLength + 5, armLength, -20, false);
        
        // Legs
        drawLeg(0, 0, legLength, 5);
        drawLeg(0, 0, legLength, -5);
    }
    
    ctx.restore();
}

// Helper function to draw arm
function drawArm(x, y, length, angle, hasSword) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();
    
    if (hasSword) {
        drawSword(length, 0);
    }
    
    ctx.restore();
}

// Helper function to draw attacking arm
function drawAttackArm(x, y, length, armAngle, swordAngle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((armAngle * Math.PI) / 180);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();
    
    ctx.translate(length, 0);
    ctx.rotate((swordAngle * Math.PI) / 180);
    drawSword(0, 0);
    
    ctx.restore();
}

// Helper function to draw leg
function drawLeg(x, y, length, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, length);
    ctx.stroke();
    
    ctx.restore();
}

// Helper function to draw sword
function drawSword(x, y) {
    ctx.save();
    ctx.translate(x, y);
    
    // Sword blade
    ctx.fillStyle = '#C0C0C0';
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(18, -1);
    ctx.lineTo(18, 1);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Sword tip (darker)
    ctx.fillStyle = '#A0A0A0';
    ctx.beginPath();
    ctx.moveTo(18, -1);
    ctx.lineTo(22, 0);
    ctx.lineTo(18, 1);
    ctx.closePath();
    ctx.fill();
    
    // Handle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-3, -1.5, 3, 3);
    
    // Guard
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-1, -4, 2, 8);
    
    ctx.restore();
}

// Draw Function
function draw() {
    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground gradient
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, canvas.height);
    groundGradient.addColorStop(0, '#90EE90');
    groundGradient.addColorStop(1, '#228B22');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    // Draw platforms
    platforms.forEach((platform, index) => {
        if (index === 0) return; // Skip ground platform
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
    });
    
    // Draw coins
    coins.forEach(coin => {
        ctx.save();
        ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
        ctx.rotate(coin.rotation);
        
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FFA500';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        
        ctx.restore();
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
        // Enemy body (slime)
        ctx.fillStyle = '#32CD32';
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(enemy.x + 10, enemy.y + 15, 3, 0, Math.PI * 2);
        ctx.arc(enemy.x + 25, enemy.y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Health bar
        const healthBarWidth = enemy.width;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 10, healthBarWidth, 4);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y - 10, healthBarWidth * healthPercent, 4);
    });
    
    // Draw particles
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    // Draw player
    drawStickFigure(player.x, player.y, player.state, player.animationFrame, player.facing);
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('enemies-defeated').textContent = enemiesDefeated;
    document.getElementById('current-level').textContent = currentLevel;
    document.getElementById('level-progress').textContent = `${enemiesDefeatedThisLevel}/${enemiesNeededForNextLevel}`;
    
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('health-fill').style.width = healthPercent + '%';
}

// Game Loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    update(deltaTime);
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Start Game
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameRunning = true;
    init();
    requestAnimationFrame(gameLoop);
});

// Restart Game
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    init();
});

// Game Over
function gameOver() {
    gameRunning = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-enemies').textContent = enemiesDefeated;
    document.getElementById('final-level').textContent = currentLevel;
    gameOverScreen.classList.remove('hidden');
}

// Initialize
init();
