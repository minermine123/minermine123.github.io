// Element Mixer - Recipe-based crafting game
// Game State
let discoveredElements = new Set(['Water', 'Fire', 'Wind', 'Earth']);
let newlyDiscoveredElements = new Set();
let recentDiscoveries = [];
let workspaceElements = [];
let currentSort = 'time';
let elementCounter = 0;

// Comprehensive Recipe Database (150+ combinations)
const recipes = {
    // Basic combinations
    'Water+Fire': 'Steam',
    'Water+Earth': 'Mud',
    'Water+Wind': 'Wave',
    'Fire+Earth': 'Lava',
    'Fire+Wind': 'Smoke',
    'Earth+Wind': 'Dust',
    
    // Secondary combinations
    'Steam+Earth': 'Geyser',
    'Steam+Fire': 'Energy',
    'Steam+Wind': 'Cloud',
    'Mud+Fire': 'Brick',
    'Mud+Wind': 'Clay',
    'Wave+Wind': 'Storm',
    'Wave+Fire': 'Fog',
    'Lava+Water': 'Stone',
    'Lava+Wind': 'Obsidian',
    'Smoke+Water': 'Smog',
    'Smoke+Wind': 'Pollution',
    'Dust+Water': 'Sand',
    'Dust+Fire': 'Ash',
    
    // Nature elements
    'Water+Stone': 'Erosion',
    'Earth+Water': 'Plant',
    'Plant+Fire': 'Ash',
    'Plant+Water': 'Swamp',
    'Plant+Earth': 'Tree',
    'Plant+Wind': 'Flower',
    'Plant+Stone': 'Moss',
    'Tree+Fire': 'Charcoal',
    'Tree+Water': 'Forest',
    'Tree+Wind': 'Leaf',
    'Flower+Water': 'Garden',
    'Swamp+Fire': 'Gas',
    
    // Weather & Sky
    'Cloud+Water': 'Rain',
    'Cloud+Fire': 'Lightning',
    'Cloud+Wind': 'Hurricane',
    'Cloud+Cloud': 'Sky',
    'Rain+Fire': 'Rainbow',
    'Rain+Wind': 'Thunderstorm',
    'Storm+Fire': 'Lightning',
    'Lightning+Sand': 'Glass',
    'Lightning+Tree': 'Fire',
    
    // Advanced materials
    'Stone+Fire': 'Metal',
    'Stone+Stone': 'Mountain',
    'Metal+Fire': 'Steel',
    'Metal+Water': 'Rust',
    'Steel+Stone': 'Blade',
    'Glass+Metal': 'Mirror',
    'Sand+Fire': 'Glass',
    'Clay+Fire': 'Pottery',
    'Brick+Brick': 'Wall',
    
    // Life & Biology
    'Swamp+Energy': 'Life',
    'Life+Earth': 'Bacteria',
    'Life+Water': 'Fish',
    'Life+Fire': 'Phoenix',
    'Life+Stone': 'Egg',
    'Egg+Fire': 'Bird',
    'Fish+Wind': 'Flying Fish',
    'Bird+Metal': 'Airplane',
    
    // Human civilization
    'Life+Clay': 'Human',
    'Human+Metal': 'Tool',
    'Human+Stone': 'Weapon',
    'Human+Fire': 'Campfire',
    'Human+Water': 'Swimmer',
    'Tool+Tree': 'Wood',
    'Tool+Stone': 'Axe',
    'Wood+Tool': 'House',
    'House+House': 'Village',
    'Village+Village': 'City',
    
    // Food & Agriculture
    'Plant+Human': 'Farmer',
    'Water+Plant': 'Agriculture',
    'Fire+Plant': 'Smoke',
    'Farmer+Plant': 'Food',
    'Food+Fire': 'Cooked Food',
    'Water+Food': 'Soup',
    'Plant+Wind': 'Seed',
    
    // Technology
    'Fire+Stone': 'Furnace',
    'Metal+Tool': 'Machine',
    'Machine+Metal': 'Robot',
    'Energy+Metal': 'Battery',
    'Lightning+Metal': 'Electricity',
    'Electricity+Glass': 'Light Bulb',
    'Electricity+Metal': 'Wire',
    'Machine+Human': 'Cyborg',
    
    // Celestial
    'Fire+Sky': 'Sun',
    'Sky+Stone': 'Moon',
    'Sky+Water': 'Space',
    'Sun+Moon': 'Eclipse',
    'Space+Fire': 'Star',
    'Star+Star': 'Galaxy',
    'Sun+Plant': 'Energy',
    
    // Mystical
    'Energy+Life': 'Soul',
    'Soul+Fire': 'Spirit',
    'Spirit+Water': 'Ghost',
    'Life+Stone': 'Golem',
    'Lightning+Life': 'Frankenstein',
    'Human+Phoenix': 'Wizard',
    'Wizard+Fire': 'Dragon',
    'Dragon+Water': 'Sea Serpent',
    
    // Time & Philosophy
    'Sun+Human': 'Day',
    'Moon+Human': 'Night',
    'Day+Night': 'Time',
    'Time+Human': 'Age',
    'Time+Stone': 'Fossil',
    'Time+Plant': 'Evolution',
    
    // Weather phenomena
    'Water+Cloud': 'Rain',
    'Rain+Sun': 'Rainbow',
    'Cold+Rain': 'Snow',
    'Cold+Water': 'Ice',
    'Ice+Wind': 'Blizzard',
    'Ice+Sun': 'Water',
    
    // Temperature
    'Water+Ice': 'Cold',
    'Fire+Fire': 'Heat',
    'Cold+Heat': 'Temperature',
    'Heat+Metal': 'Molten Metal',
    
    // Geography
    'Mountain+Water': 'River',
    'River+River': 'Ocean',
    'Ocean+Wind': 'Current',
    'Mountain+Fire': 'Volcano',
    'Volcano+Water': 'Island',
    'Sand+Ocean': 'Beach',
    'Stone+Ocean': 'Cliff',
    
    // Construction
    'Stone+Human': 'Statue',
    'Metal+Human': 'Armor',
    'Wall+House': 'Castle',
    'Stone+Fire': 'Forge',
    'Wood+Stone': 'Bridge',
    
    // Natural disasters
    'Earthquake+Water': 'Tsunami',
    'Fire+Forest': 'Wildfire',
    'Volcano+Village': 'Disaster',
    'Wave+City': 'Flood',
    
    // More advanced
    'Obsidian+Tool': 'Knife',
    'Glass+House': 'Greenhouse',
    'Energy+Plant': 'Solar Panel',
    'Wind+Machine': 'Windmill',
    'Water+Machine': 'Waterwheel',
    'Electricity+Sand': 'Computer',
    'Computer+Computer': 'Internet',
    'Internet+Human': 'Social Media',
    
    // Fun combinations
    'Human+Bird': 'Angel',
    'Human+Fish': 'Mermaid',
    'Plant+Ice': 'Snowflake',
    'Rainbow+Human': 'Happiness',
    'Music+Human': 'Dance',
    'Fire+Ice': 'Steam',
};

// Element emojis for visual appeal
const elementEmojis = {
    'Water': '💧', 'Fire': '🔥', 'Wind': '🌪️', 'Earth': '🌍',
    'Steam': '♨️', 'Mud': '🟤', 'Wave': '🌊', 'Lava': '🌋',
    'Smoke': '💨', 'Dust': '✨', 'Cloud': '☁️', 'Storm': '⛈️',
    'Stone': '🪨', 'Rain': '🌧️', 'Plant': '🌱', 'Tree': '🌳',
    'Flower': '🌸', 'Energy': '⚡', 'Life': '🧬', 'Human': '👤',
    'Metal': '⚙️', 'Sand': '🏖️', 'Glass': '🪟', 'Ice': '🧊',
    'Snow': '❄️', 'Sun': '☀️', 'Moon': '🌙', 'Star': '⭐',
    'Mountain': '⛰️', 'Volcano': '🌋', 'Ocean': '🌊', 'River': '〰️',
    'Lightning': '⚡', 'Rainbow': '🌈', 'Forest': '🌲', 'Fish': '🐟',
    'Bird': '🦅', 'Tool': '🔨', 'House': '🏠', 'City': '🏙️',
    'Food': '🍎', 'Dragon': '🐉', 'Wizard': '🧙', 'Robot': '🤖',
};

// Initialize game
function init() {
    loadGame();
    renderElementList();
    updateStats();
    setupEventListeners();
    
    // Add starting elements to workspace hint
    setTimeout(() => {
        const hint = document.querySelector('.hint');
        if (workspaceElements.length === 0 && hint) {
            hint.innerHTML = `
                <span class="hint-icon">💡</span>
                <p>Start by dragging elements from the left into this space!</p>
                <p class="hint-sub">Drag one element onto another to combine them</p>
            `;
        }
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            renderElementList();
        });
    });
    
    // Search functionality
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderElementList(e.target.value.toLowerCase());
    });
    
    // Clear workspace
    document.getElementById('clear-workspace').addEventListener('click', clearWorkspace);
    
    // Reset game
    document.getElementById('reset-game').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            resetGame();
        }
    });
}

// Render element list in sidebar
function renderElementList(searchTerm = '') {
    const elementList = document.getElementById('element-list');
    let elements = Array.from(discoveredElements);
    
    // Filter by search
    if (searchTerm) {
        elements = elements.filter(el => el.toLowerCase().includes(searchTerm));
    }
    
    // Sort elements
    if (currentSort === 'name') {
        elements.sort();
    }
    // 'time' sort keeps original discovery order (no sorting needed)
    
    elementList.innerHTML = elements.map(element => {
        const emoji = elementEmojis[element] || '🔮';
        const isNew = newlyDiscoveredElements.has(element);
        return `
            <div class="element-item ${isNew ? 'new' : ''}" draggable="true" data-element="${element}">
                <span>${emoji} ${element}</span>
                ${isNew ? '<span class="element-badge">NEW</span>' : ''}
            </div>
        `;
    }).join('');
    
    // Add drag event listeners
    elementList.querySelectorAll('.element-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('click', (e) => addToWorkspace(e.currentTarget.dataset.element));
    });
    
    // Clear NEW badges after 3 seconds
    setTimeout(() => {
        newlyDiscoveredElements.clear();
        renderElementList(searchTerm);
    }, 3000);
}

// Add element to workspace
function addToWorkspace(elementName) {
    const workspace = document.getElementById('workspace');
    const workspaceRect = workspace.getBoundingClientRect();
    
    // Hide hint if showing
    const hint = workspace.querySelector('.hint');
    if (hint && workspaceElements.length === 0) {
        hint.style.display = 'none';
    }
    
    // Random position in workspace
    const x = Math.random() * (workspaceRect.width - 150) + 20;
    const y = Math.random() * (workspaceRect.height - 80) + 20;
    
    const id = `element-${elementCounter++}`;
    const emoji = elementEmojis[elementName] || '🔮';
    
    const elementDiv = document.createElement('div');
    elementDiv.className = 'workspace-element';
    elementDiv.id = id;
    elementDiv.draggable = true;
    elementDiv.dataset.element = elementName;
    elementDiv.style.left = `${x}px`;
    elementDiv.style.top = `${y}px`;
    elementDiv.innerHTML = `${emoji} ${elementName}`;
    
    workspace.appendChild(elementDiv);
    
    // Add to tracking
    workspaceElements.push({
        id: id,
        element: elementName,
        div: elementDiv
    });
    
    // Setup drag events
    elementDiv.addEventListener('dragstart', handleWorkspaceDragStart);
    elementDiv.addEventListener('dragover', handleDragOver);
    elementDiv.addEventListener('drop', handleDrop);
    elementDiv.addEventListener('dragend', handleDragEnd);
}

// Drag and drop handlers
let draggedElement = null;

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.element);
    draggedElement = { type: 'sidebar', element: e.currentTarget.dataset.element };
}

function handleWorkspaceDragStart(e) {
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.element);
    draggedElement = { type: 'workspace', element: e.currentTarget.dataset.element, div: e.currentTarget };
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedElement.type === 'workspace' ? 'move' : 'copy';
    
    if (e.currentTarget.classList.contains('workspace-element')) {
        e.currentTarget.classList.add('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (e.currentTarget.id === 'workspace') {
        // Dropped on workspace from sidebar - add element
        if (draggedElement.type === 'sidebar') {
            addToWorkspace(draggedElement.element);
        }
    } else if (e.currentTarget.classList.contains('workspace-element')) {
        // Dropped on another element - try to combine
        const element1 = draggedElement.element;
        const element2 = e.currentTarget.dataset.element;
        
        if (element1 !== element2) {
            combineElements(element1, element2, draggedElement.div, e.currentTarget);
        }
    }
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.workspace-element').forEach(el => {
        el.classList.remove('drag-over');
    });
    draggedElement = null;
}

// Combine two elements
function combineElements(element1, element2, div1, div2) {
    // Try both orders
    let key1 = `${element1}+${element2}`;
    let key2 = `${element2}+${element1}`;
    
    let result = recipes[key1] || recipes[key2];
    
    if (result) {
        const isNewDiscovery = !discoveredElements.has(result);
        
        // Add to discovered elements
        if (isNewDiscovery) {
            discoveredElements.add(result);
            newlyDiscoveredElements.add(result);
            addToRecentDiscoveries(result);
        }
        
        // Remove the combined elements from workspace
        if (div1 && div1.parentElement) {
            div1.remove();
            workspaceElements = workspaceElements.filter(e => e.div !== div1);
        }
        if (div2 && div2.parentElement) {
            div2.remove();
            workspaceElements = workspaceElements.filter(e => e.div !== div2);
        }
        
        // Add result to workspace
        addToWorkspace(result);
        
        // Show result popup
        showResultPopup(result, isNewDiscovery);
        
        // Update UI
        renderElementList();
        updateStats();
        saveGame();
    } else {
        // No recipe found - show failure
        showResultPopup(null, false);
    }
}

// Show result popup
function showResultPopup(element, isNew) {
    const popup = document.getElementById('result-popup');
    const resultElement = document.getElementById('result-element');
    const resultMessage = document.getElementById('result-message');
    const resultIcon = popup.querySelector('.result-icon');
    
    if (element) {
        const emoji = elementEmojis[element] || '🔮';
        resultElement.textContent = `${emoji} ${element}`;
        
        if (isNew) {
            resultMessage.textContent = '🎉 NEW DISCOVERY! 🎉';
            resultMessage.className = 'result-message new-discovery';
            resultIcon.textContent = '🌟';
        } else {
            resultMessage.textContent = 'You created this!';
            resultMessage.className = 'result-message';
            resultIcon.textContent = '✨';
        }
    } else {
        resultElement.textContent = 'Nothing happened...';
        resultMessage.textContent = 'Try a different combination!';
        resultMessage.className = 'result-message';
        resultIcon.textContent = '❌';
    }
    
    // Show popup
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('show'), 10);
    
    // Hide after 2 seconds
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.classList.add('hidden'), 300);
    }, 2000);
}

// Add to recent discoveries
function addToRecentDiscoveries(element) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    recentDiscoveries.unshift({ element, time: timeStr });
    
    // Keep only last 10
    if (recentDiscoveries.length > 10) {
        recentDiscoveries = recentDiscoveries.slice(0, 10);
    }
    
    renderDiscoveries();
}

// Render discoveries panel
function renderDiscoveries() {
    const discoveriesList = document.getElementById('discoveries-list');
    
    if (recentDiscoveries.length === 0) {
        discoveriesList.innerHTML = '<p class="no-discoveries">No discoveries yet!<br>Start combining elements!</p>';
    } else {
        discoveriesList.innerHTML = recentDiscoveries.map(d => {
            const emoji = elementEmojis[d.element] || '🔮';
            return `
                <div class="discovery-item">
                    ${emoji} ${d.element}
                    <div class="discovery-time">${d.time}</div>
                </div>
            `;
        }).join('');
    }
}

// Update stats
function updateStats() {
    document.getElementById('discovered-count').textContent = discoveredElements.size;
    
    // Calculate total possible (base elements + recipe count)
    const totalPossible = 4 + Object.keys(recipes).length;
    document.getElementById('total-count').textContent = totalPossible;
}

// Clear workspace
function clearWorkspace() {
    const workspace = document.getElementById('workspace');
    workspace.querySelectorAll('.workspace-element').forEach(el => el.remove());
    workspaceElements = [];
    
    // Show hint again
    const hint = workspace.querySelector('.hint');
    if (hint) {
        hint.style.display = 'block';
    }
}

// Reset game
function resetGame() {
    discoveredElements = new Set(['Water', 'Fire', 'Wind', 'Earth']);
    newlyDiscoveredElements = new Set();
    recentDiscoveries = [];
    workspaceElements = [];
    
    clearWorkspace();
    renderElementList();
    renderDiscoveries();
    updateStats();
    saveGame();
}

// Save game to localStorage
function saveGame() {
    const gameState = {
        discovered: Array.from(discoveredElements),
        discoveries: recentDiscoveries
    };
    localStorage.setItem('elementMixerGame', JSON.stringify(gameState));
}

// Load game from localStorage
function loadGame() {
    const saved = localStorage.getItem('elementMixerGame');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            discoveredElements = new Set(gameState.discovered || ['Water', 'Fire', 'Wind', 'Earth']);
            recentDiscoveries = gameState.discoveries || [];
            renderDiscoveries();
        } catch (e) {
            console.error('Failed to load game:', e);
        }
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', init);
