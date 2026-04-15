// Game state
let points = 0;
let clickValue = 1;
let autoClickers = 0;
let autoClickerCost = 10;
let totalClicks = 0;

// DOM elements
const donutBtn = document.getElementById('donutBtn');
const pointsDisplay = document.getElementById('points');
const totalClicksDisplay = document.getElementById('totalClicks');
const autoClickersDisplay = document.getElementById('autoClickers');
const autoClickerCostDisplay = document.getElementById('autoClickerCost');
const buyAutoClickerBtn = document.getElementById('buyAutoClicker');
const particlesContainer = document.getElementById('particlesContainer');

// Initialize game
function init() {
    updateDisplay();
    loadGame();
    
    // Auto-save every 10 seconds
    setInterval(saveGame, 10000);
    
    // Auto-clicker produces 1 point per second per auto-clicker
    setInterval(() => {
        if (autoClickers > 0) {
            points += autoClickers;
            updateDisplay();
        }
    }, 1000);
}

// Donut click handler
donutBtn.addEventListener('click', (e) => {
    points += clickValue;
    totalClicks++;
    
    // Create particle effect
    createParticle(e);
    
    updateDisplay();
});

// Buy auto-clicker
buyAutoClickerBtn.addEventListener('click', () => {
    if (points >= autoClickerCost) {
        points -= autoClickerCost;
        autoClickers++;
        autoClickerCost = Math.floor(autoClickerCost * 1.5);
        updateDisplay();
    }
});

// Create floating particle
function createParticle(e) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = '🍩';
    
    const rect = donutBtn.getBoundingClientRect();
    particle.style.left = rect.left + rect.width / 2 + 'px';
    particle.style.top = rect.top + rect.height / 2 + 'px';
    
    particlesContainer.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 1500);
}

// Update display
function updateDisplay() {
    pointsDisplay.textContent = points;
    totalClicksDisplay.textContent = totalClicks;
    autoClickersDisplay.textContent = autoClickers;
    autoClickerCostDisplay.textContent = autoClickerCost;
    
    // Disable buy button if can't afford
    if (points >= autoClickerCost) {
        buyAutoClickerBtn.classList.remove('disabled');
    } else {
        buyAutoClickerBtn.classList.add('disabled');
    }
}

// Save game
function saveGame() {
    const gameState = {
        points,
        clickValue,
        autoClickers,
        autoClickerCost,
        totalClicks
    };
    localStorage.setItem('donutClickerGame', JSON.stringify(gameState));
}

// Load game
function loadGame() {
    const saved = localStorage.getItem('donutClickerGame');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            points = gameState.points || 0;
            clickValue = gameState.clickValue || 1;
            autoClickers = gameState.autoClickers || 0;
            autoClickerCost = gameState.autoClickerCost || 10;
            totalClicks = gameState.totalClicks || 0;
            updateDisplay();
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
}

// Handle page unload
window.addEventListener('beforeunload', saveGame);

// Start game
init();
