// Game state
let money = 100; // Start with $100 to hire first worker
let voidScience = 0;
let totalVoidScienceGenerated = 0;

// Business data
const businesses = {
    heating: {
        workers: 0,
        baseIncome: 5,
        hireCost: 50,
        costMultiplier: 1.3
    },
    water: {
        workers: 0,
        baseIncome: 7,
        hireCost: 75,
        costMultiplier: 1.3
    },
    construction: {
        workers: 0,
        baseIncome: 12,
        hireCost: 120,
        costMultiplier: 1.3
    },
    electricity: {
        workers: 0,
        baseIncome: 8,
        hireCost: 90,
        costMultiplier: 1.3
    },
    void: {
        workers: 0,
        baseIncome: 0, // Not used - generates Void Science instead
        hireCost: 1, // Costs Void Science to hire
        costMultiplier: 1.4
    }
};

// Upgrades
let speedLevel = 0;
let speedCost = 200;
let incomeLevel = 0;
let incomeCost = 250;
let equipmentLevel = 0;
let equipmentCost = 300;

// Void Science upgrades (can be purchased once)
let hasRealityBender = false;
let hasTimeWarp = false;
let hasGoldenTools = false;

// Spacebar cooldown
let spacebarCooldown = false;
const SPACEBAR_COOLDOWN_MS = 1000; // 1 second cooldown

// DOM elements
const moneyDisplay = document.getElementById('money');
const voidScienceDisplay = document.getElementById('voidScience');
const totalIncomeDisplay = document.getElementById('totalIncome');
const totalWorkersDisplay = document.getElementById('totalWorkers');
const totalVoidScienceDisplay = document.getElementById('totalVoidScience');

const speedLevelDisplay = document.getElementById('speedLevel');
const speedCostDisplay = document.getElementById('speedCost');
const incomeLevelDisplay = document.getElementById('incomeLevel');
const incomeCostDisplay = document.getElementById('incomeCost');
const equipmentLevelDisplay = document.getElementById('equipmentLevel');
const equipmentCostDisplay = document.getElementById('equipmentCost');

const spacebarIndicator = document.getElementById('spacebarIndicator');

// Initialize game
function init() {
    loadGame();
    updateDisplay();
    updateSpacebarGoal();
    setupEventListeners();
    
    // Auto-save every 10 seconds
    setInterval(saveGame, 10000);
    
    // Generate income every 100ms for smooth animation
    setInterval(generateIncome, 100);
}

// Setup event listeners
function setupEventListeners() {
    // Hire worker buttons
    document.querySelectorAll('.hire-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const businessType = btn.getAttribute('data-business');
            hireWorker(businessType);
        });
    });
    
    // Upgrade buttons
    document.getElementById('buySpeed').addEventListener('click', buySpeedUpgrade);
    document.getElementById('buyIncome').addEventListener('click', buyIncomeUpgrade);
    document.getElementById('buyEquipment').addEventListener('click', buyEquipmentUpgrade);
    
    // Void Science upgrades
    document.getElementById('buyReality').addEventListener('click', buyRealityBender);
    document.getElementById('buyTimeWarp').addEventListener('click', buyTimeWarp);
    document.getElementById('buyGoldenTools').addEventListener('click', buyGoldenTools);
    
    // Spacebar for Void Science
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // Always prevent default scroll behavior for spacebar
            e.preventDefault();
            
            if (!spacebarCooldown) {
                // Prevent spacebar from triggering if focused on a button
                if (document.activeElement.tagName === 'BUTTON') {
                    return;
                }
                generateVoidScience();
            }
        }
    });
    
    // Reset game button
    document.getElementById('resetGame').addEventListener('click', resetGame);
}

// Hire worker
function hireWorker(businessType) {
    const business = businesses[businessType];
    const cost = Math.floor(business.hireCost);
    
    // Void Services costs Void Science instead of money
    if (businessType === 'void') {
        if (voidScience >= cost) {
            console.log(`[Hire Void] VS: ${voidScience.toFixed(2)} - ${cost} = ${(voidScience - cost).toFixed(2)}`);
            voidScience -= cost;
            business.workers++;
            business.hireCost = Math.floor(business.hireCost * business.costMultiplier);
            updateDisplay();
            updateSpacebarGoal();
        }
    } else {
        // Regular businesses cost money
        if (money >= cost) {
            money -= cost;
            business.workers++;
            business.hireCost = Math.floor(business.hireCost * business.costMultiplier);
            updateDisplay();
        }
    }
}

// Generate income
function generateIncome() {
    let totalIncome = 0;
    
    for (const [type, business] of Object.entries(businesses)) {
        if (business.workers > 0) {
            const baseIncome = business.baseIncome * business.workers;
            const speedBonus = 1 + (speedLevel * 0.2) + (hasTimeWarp ? 2 : 0);
            const incomeBonus = 1 + (incomeLevel * 0.25) + (hasRealityBender ? 1 : 0);
            const qualityBonus = 1 + (equipmentLevel * 0.15) + (hasGoldenTools ? 2 : 0);
            
            const income = baseIncome * speedBonus * incomeBonus * qualityBonus;
            
            // Void Services generate Void Science instead of money
            if (type === 'void') {
                // Generate 1 Void Science per worker every 10 seconds (0.1 VS per second)
                voidScience += (business.workers * 0.1) / 10;
                totalVoidScienceGenerated += (business.workers * 0.1) / 10;
            } else {
                totalIncome += income;
            }
        }
    }
    
    // Add income (divided by 10 since we update 10 times per second)
    money += totalIncome / 10;
    
    if (totalIncome > 0 || businesses.void.workers > 0) {
        updateDisplay();
    }
}

// Generate Void Science
function generateVoidScience() {
    if (spacebarCooldown) return;
    
    const before = voidScience;
    voidScience++;
    totalVoidScienceGenerated++;
    spacebarCooldown = true;
    
    // Debug log
    console.log(`[Spacebar] VS: ${before.toFixed(2)} → ${voidScience.toFixed(2)}`);
    
    // Visual feedback
    spacebarIndicator.classList.add('pressed');
    createVoidParticle();
    
    // Update goal text
    updateSpacebarGoal();
    
    setTimeout(() => {
        spacebarCooldown = false;
        spacebarIndicator.classList.remove('pressed');
    }, SPACEBAR_COOLDOWN_MS);
    
    updateDisplay();
}

// Create void science particle effect
function createVoidParticle() {
    const particle = document.createElement('div');
    particle.className = 'void-particle';
    particle.textContent = '✨';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = Math.random() * window.innerHeight + 'px';
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 2000);
}

// Update spacebar goal text
function updateSpacebarGoal() {
    const goalElement = document.querySelector('.vs-goal');
    
    if (!hasRealityBender && voidScience < 50) {
        const remaining = 50 - voidScience;
        goalElement.textContent = `Goal: ${remaining.toFixed(0)} more VS for Reality Bender (2x income!)`;
    } else if (!hasRealityBender && voidScience >= 50) {
        goalElement.textContent = `✅ You can buy Reality Bender now! Check the Void Shop ➡️`;
        goalElement.style.color = '#00b894';
        goalElement.style.fontWeight = 'bold';
    } else if (!hasTimeWarp && voidScience < 75) {
        const remaining = 75 - voidScience;
        goalElement.textContent = `Goal: ${remaining.toFixed(0)} more VS for Time Warp (3x speed!)`;
    } else if (!hasTimeWarp && voidScience >= 75) {
        goalElement.textContent = `✅ You can buy Time Warp now! Check the Void Shop ➡️`;
        goalElement.style.color = '#00b894';
        goalElement.style.fontWeight = 'bold';
    } else if (!hasGoldenTools && voidScience < 100) {
        const remaining = 100 - voidScience;
        goalElement.textContent = `Goal: ${remaining.toFixed(0)} more VS for Golden Tools (3x quality!)`;
    } else if (!hasGoldenTools && voidScience >= 100) {
        goalElement.textContent = `✅ You can buy Golden Tools now! Check the Void Shop ➡️`;
        goalElement.style.color = '#00b894';
        goalElement.style.fontWeight = 'bold';
    } else {
        goalElement.textContent = `🎉 All Void upgrades purchased! Hire Void Services for passive VS!`;
        goalElement.style.color = '#fdcb6e';
    }
}

// Buy Speed Upgrade
function buySpeedUpgrade() {
    if (money >= speedCost) {
        money -= speedCost;
        speedLevel++;
        speedCost = Math.floor(speedCost * 1.5);
        updateDisplay();
    }
}

// Buy Income Upgrade
function buyIncomeUpgrade() {
    if (money >= incomeCost) {
        money -= incomeCost;
        incomeLevel++;
        incomeCost = Math.floor(incomeCost * 1.5);
        updateDisplay();
    }
}

// Buy Equipment Upgrade
function buyEquipmentUpgrade() {
    if (money >= equipmentCost) {
        money -= equipmentCost;
        equipmentLevel++;
        equipmentCost = Math.floor(equipmentCost * 1.5);
        updateDisplay();
    }
}

// Buy Reality Bender
function buyRealityBender() {
    if (voidScience >= 50 && !hasRealityBender) {
        voidScience -= 50;
        hasRealityBender = true;
        document.getElementById('buyReality').disabled = true;
        document.getElementById('buyReality').textContent = 'PURCHASED ✓';
        updateSpacebarGoal();
        updateDisplay();
    }
}

// Buy Time Warp
function buyTimeWarp() {
    if (voidScience >= 75 && !hasTimeWarp) {
        voidScience -= 75;
        hasTimeWarp = true;
        document.getElementById('buyTimeWarp').disabled = true;
        document.getElementById('buyTimeWarp').textContent = 'PURCHASED ✓';
        updateSpacebarGoal();
        updateDisplay();
    }
}

// Buy Golden Tools
function buyGoldenTools() {
    if (voidScience >= 100 && !hasGoldenTools) {
        voidScience -= 100;
        hasGoldenTools = true;
        document.getElementById('buyGoldenTools').disabled = true;
        document.getElementById('buyGoldenTools').textContent = 'PURCHASED ✓';
        updateSpacebarGoal();
        updateDisplay();
    }
}

// Calculate total income per second
function calculateTotalIncome() {
    let totalIncome = 0;
    
    for (const [type, business] of Object.entries(businesses)) {
        if (business.workers > 0) {
            const baseIncome = business.baseIncome * business.workers;
            const speedBonus = 1 + (speedLevel * 0.2) + (hasTimeWarp ? 2 : 0);
            const incomeBonus = 1 + (incomeLevel * 0.25) + (hasRealityBender ? 1 : 0);
            const qualityBonus = 1 + (equipmentLevel * 0.15) + (hasGoldenTools ? 2 : 0);
            
            const income = baseIncome * speedBonus * incomeBonus * qualityBonus;
            totalIncome += income;
        }
    }
    
    return totalIncome;
}

// Calculate total workers
function calculateTotalWorkers() {
    let total = 0;
    for (const business of Object.values(businesses)) {
        total += business.workers;
    }
    return total;
}

// Update display
function updateDisplay() {
    // Update main stats
    moneyDisplay.textContent = Math.floor(money).toLocaleString();
    voidScienceDisplay.textContent = Math.floor(voidScience);
    
    // Update Void Science rate
    const vsRate = (businesses.void.workers * 0.1).toFixed(1);
    const vsRateElement = document.getElementById('vsRate');
    if (businesses.void.workers > 0) {
        vsRateElement.textContent = `(+${vsRate}/s)`;
        vsRateElement.style.display = 'inline';
    } else {
        vsRateElement.style.display = 'none';
    }
    
    totalIncomeDisplay.textContent = calculateTotalIncome().toFixed(1);
    totalWorkersDisplay.textContent = calculateTotalWorkers();
    totalVoidScienceDisplay.textContent = totalVoidScienceGenerated.toFixed(1);
    
    // Update upgrade displays
    speedLevelDisplay.textContent = speedLevel;
    speedCostDisplay.textContent = speedCost.toLocaleString();
    incomeLevelDisplay.textContent = incomeLevel;
    incomeCostDisplay.textContent = incomeCost.toLocaleString();
    equipmentLevelDisplay.textContent = equipmentLevel;
    equipmentCostDisplay.textContent = equipmentCost.toLocaleString();
    
    // Update business cards
    for (const [type, business] of Object.entries(businesses)) {
        const card = document.querySelector(`.business-card[data-business="${type}"]`);
        
        card.querySelector('.workers').textContent = business.workers;
        card.querySelector('.hire-cost').textContent = Math.floor(business.hireCost).toLocaleString();
        
        // Calculate effective multipliers
        const speedBonus = 1 + (speedLevel * 0.2) + (hasTimeWarp ? 2 : 0);
        const incomeBonus = 1 + (incomeLevel * 0.25) + (hasRealityBender ? 1 : 0);
        const qualityBonus = 1 + (equipmentLevel * 0.15) + (hasGoldenTools ? 2 : 0);
        
        // Void Services shows VS generation, others show money income
        if (type === 'void') {
            // Void services generate 0.1 VS per worker per second (not affected by money multipliers)
            card.querySelector('.income').textContent = '0.1';
        } else {
            card.querySelector('.income').textContent = (business.baseIncome * incomeBonus).toFixed(1);
        }
        
        card.querySelector('.speed').textContent = speedBonus.toFixed(1);
        card.querySelector('.quality').textContent = qualityBonus.toFixed(1);
        
        // Update button state
        const btn = card.querySelector('.hire-btn');
        
        // Void Services costs Void Science, others cost money
        if (type === 'void') {
            if (voidScience >= business.hireCost) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        } else {
            if (money >= business.hireCost) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        }
    }
    
    // Update upgrade button states
    updateButtonState('buySpeed', speedCost);
    updateButtonState('buyIncome', incomeCost);
    updateButtonState('buyEquipment', equipmentCost);
    
    // Update void science button states
    updateVoidButtonState('buyReality', 50, hasRealityBender);
    updateVoidButtonState('buyTimeWarp', 75, hasTimeWarp);
    updateVoidButtonState('buyGoldenTools', 100, hasGoldenTools);
}

// Update button state helper
function updateButtonState(buttonId, cost) {
    const btn = document.getElementById(buttonId);
    if (money >= cost) {
        btn.classList.remove('disabled');
    } else {
        btn.classList.add('disabled');
    }
}

// Update void button state helper
function updateVoidButtonState(buttonId, cost, isPurchased) {
    const btn = document.getElementById(buttonId);
    if (isPurchased) {
        btn.classList.add('purchased');
        btn.disabled = true;
    } else if (voidScience >= cost) {
        btn.classList.remove('disabled');
    } else {
        btn.classList.add('disabled');
    }
}

// Save game
function saveGame() {
    const gameState = {
        money,
        voidScience,
        totalVoidScienceGenerated,
        businesses,
        speedLevel,
        speedCost,
        incomeLevel,
        incomeCost,
        equipmentLevel,
        equipmentCost,
        hasRealityBender,
        hasTimeWarp,
        hasGoldenTools
    };
    localStorage.setItem('houseTycoonGame', JSON.stringify(gameState));
}

// Load game
function loadGame() {
    const saved = localStorage.getItem('houseTycoonGame');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            money = gameState.money || 100; // Default to starting money
            voidScience = gameState.voidScience || 0;
            totalVoidScienceGenerated = gameState.totalVoidScienceGenerated || 0;
            
            // Load businesses
            if (gameState.businesses) {
                for (const [type, data] of Object.entries(gameState.businesses)) {
                    if (businesses[type]) {
                        businesses[type].workers = data.workers || 0;
                        businesses[type].hireCost = data.hireCost || businesses[type].hireCost;
                    }
                }
            }
            
            speedLevel = gameState.speedLevel || 0;
            speedCost = gameState.speedCost || 200;
            incomeLevel = gameState.incomeLevel || 0;
            incomeCost = gameState.incomeCost || 250;
            equipmentLevel = gameState.equipmentLevel || 0;
            equipmentCost = gameState.equipmentCost || 300;
            
            hasRealityBender = gameState.hasRealityBender || false;
            hasTimeWarp = gameState.hasTimeWarp || false;
            hasGoldenTools = gameState.hasGoldenTools || false;
            
            updateDisplay();
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
}

// Handle page unload
window.addEventListener('beforeunload', saveGame);

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
        // Clear the save
        localStorage.removeItem('houseTycoonGame');
        
        // Reset all variables to initial state
        money = 100;
        voidScience = 0;
        totalVoidScienceGenerated = 0;
        
        // Reset businesses
        businesses.heating.workers = 0;
        businesses.heating.hireCost = 50;
        businesses.water.workers = 0;
        businesses.water.hireCost = 75;
        businesses.construction.workers = 0;
        businesses.construction.hireCost = 120;
        businesses.electricity.workers = 0;
        businesses.electricity.hireCost = 90;
        businesses.void.workers = 0;
        businesses.void.hireCost = 1;
        
        // Reset upgrades
        speedLevel = 0;
        speedCost = 200;
        incomeLevel = 0;
        incomeCost = 250;
        equipmentLevel = 0;
        equipmentCost = 300;
        
        // Reset void upgrades
        hasRealityBender = false;
        hasTimeWarp = false;
        hasGoldenTools = false;
        
        // Reset void upgrade buttons
        const buyRealityBtn = document.getElementById('buyReality');
        buyRealityBtn.disabled = false;
        buyRealityBtn.classList.remove('purchased');
        buyRealityBtn.innerHTML = 'Buy - ✨<span id="realityCost">50</span> VS';
        
        const buyTimeWarpBtn = document.getElementById('buyTimeWarp');
        buyTimeWarpBtn.disabled = false;
        buyTimeWarpBtn.classList.remove('purchased');
        buyTimeWarpBtn.innerHTML = 'Buy - ✨<span id="timeWarpCost">75</span> VS';
        
        const buyGoldenToolsBtn = document.getElementById('buyGoldenTools');
        buyGoldenToolsBtn.disabled = false;
        buyGoldenToolsBtn.classList.remove('purchased');
        buyGoldenToolsBtn.innerHTML = 'Buy - ✨<span id="goldenToolsCost">100</span> VS';
        
        // Update display and goal
        updateDisplay();
        updateSpacebarGoal();
    }
}

// Start game
init();
