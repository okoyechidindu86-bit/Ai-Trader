// ==========================================
// Random Joke Generator - Main Application
// ==========================================

// Configuration
const CONFIG = {
    apiUrl: 'https://v2.jokeapi.dev/joke',
    categories: ['general', 'programming', 'knock-knock'],
};

// State Management
const state = {
    currentJoke: null,
    jokeHistory: JSON.parse(localStorage.getItem('jokeHistory')) || [],
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    jokeCount: 0,
    isLoading: false,
    currentCategory: 'all',
    includeOffensive: true,
};

// ==========================================
// DOM Elements
// ==========================================
const getJokeBtn = document.getElementById('getJokeBtn');
const shareBtn = document.getElementById('shareBtn');
const copyBtn = document.getElementById('copyBtn');
const jokeText = document.getElementById('jokeText');
const jokeType = document.getElementById('jokeType');
const filterBtns = document.querySelectorAll('.filter-btn');
const offensiveToggle = document.getElementById('offensiveToggle');
const jokeCountDisplay = document.getElementById('jokeCount');
const statusDisplay = document.getElementById('status');
const historyList = document.getElementById('historyList');
const favoritesList = document.getElementById('favoritesList');
const lastUpdateDisplay = document.getElementById('lastUpdate');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');

// ==========================================
// Event Listeners
// ==========================================
getJokeBtn.addEventListener('click', fetchJoke);
shareBtn.addEventListener('click', shareJoke);
copyBtn.addEventListener('click', copyJoke);
clearHistoryBtn.addEventListener('click', clearHistory);
clearFavoritesBtn.addEventListener('click', clearFavorites);
offensiveToggle.addEventListener('change', (e) => {
    state.includeOffensive = e.target.checked;
});

// Category filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.currentCategory = e.target.dataset.category;
    });
});

// Keyboard shortcut (Space to get joke)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement === document.body) {
        e.preventDefault();
        fetchJoke();
    }
});

// ==========================================
// Fetch Joke from API
// ==========================================
async function fetchJoke() {
    try {
        setLoading(true);
        updateStatus('Fetching joke...');

        let category = state.currentCategory === 'all' 
            ? 'Any' 
            : state.currentCategory;

        // Build query parameters
        let flags = [];
        if (!state.includeOffensive) {
            flags.push('nsfw');
        }

        const flagParam = flags.length > 0 ? `?type=single&flags=${flags.join(',')}` : '?type=single';
        const url = `${CONFIG.apiUrl}/${category}${flagParam}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            showAlert('No jokes found with these filters', 'error');
            updateStatus('No jokes found');
            return;
        }

        // Format joke
        const joke = formatJoke(data);
        state.currentJoke = joke;

        // Add to history
        addToHistory(joke);

        // Update UI
        displayJoke(joke);
        updateStats();
        updateStatus('Joke loaded!');

        showAlert('Joke loaded successfully!', 'success');
    } catch (error) {
        console.error('Error fetching joke:', error);
        jokeText.textContent = '😅 Oops! Failed to fetch a joke. Please try again.';
        jokeType.textContent = 'Error';
        updateStatus('Error loading joke');
        showAlert(`Error: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

function formatJoke(data) {
    let jokeText = '';

    if (data.type === 'single') {
        jokeText = data.joke;
    } else if (data.type === 'twopart') {
        jokeText = `${data.setup}\n\n${data.delivery}`;
    }

    return {
        text: jokeText,
        category: data.category,
        type: data.type,
        timestamp: new Date().toLocaleString(),
        id: Math.random().toString(36).substr(2, 9)
    };
}

function displayJoke(joke) {
    jokeText.textContent = joke.text;
    jokeType.textContent = joke.category;
    
    // Enable share and copy buttons
    shareBtn.disabled = false;
    copyBtn.disabled = false;

    // Update favorite button state
    const isFavorited = state.favorites.some(fav => fav.id === joke.id);
}

// ==========================================
// History Management
// ==========================================
function addToHistory(joke) {
    // Check if joke already exists
    const exists = state.jokeHistory.some(j => j.id === joke.id);
    if (exists) return;

    state.jokeHistory.unshift(joke);
    
    // Keep only last 20 jokes
    state.jokeHistory = state.jokeHistory.slice(0, 20);
    
    localStorage.setItem('jokeHistory', JSON.stringify(state.jokeHistory));
    state.jokeCount++;
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (state.jokeHistory.length === 0) {
        historyList.innerHTML = '<p class="placeholder">No jokes in history yet</p>';
        return;
    }

    let html = '';
    state.jokeHistory.forEach((joke) => {
        const isFavorited = state.favorites.some(fav => fav.id === joke.id);
        html += `
            <div class="history-item">
                <span class="joke-text-history">${escapeHtml(joke.text)}</span>
                <div class="joke-actions-history">
                    <button class="icon-btn ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite('${joke.id}')" title="Add to favorites">❤️</button>
                    <button class="icon-btn" onclick="copyToClipboard('${escapeHtml(joke.text)}')" title="Copy">📋</button>
                    <button class="icon-btn" onclick="removeFromHistory('${joke.id}')" title="Remove">🗑️</button>
                </div>
            </div>
        `;
    });

    historyList.innerHTML = html;
    document.getElementById('historyCount').textContent = `(${state.jokeHistory.length})`;
}

function removeFromHistory(jokeId) {
    state.jokeHistory = state.jokeHistory.filter(j => j.id !== jokeId);
    localStorage.setItem('jokeHistory', JSON.stringify(state.jokeHistory));
    updateHistoryDisplay();
    showAlert('Joke removed from history', 'success');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        state.jokeHistory = [];
        localStorage.setItem('jokeHistory', JSON.stringify(state.jokeHistory));
        updateHistoryDisplay();
        showAlert('History cleared', 'success');
    }
}

// ==========================================
// Favorites Management
// ==========================================
function toggleFavorite(jokeId) {
    const joke = state.jokeHistory.find(j => j.id === jokeId) || state.currentJoke;
    
    if (!joke) return;

    const isFavorited = state.favorites.some(fav => fav.id === jokeId);

    if (isFavorited) {
        state.favorites = state.favorites.filter(fav => fav.id !== jokeId);
        showAlert('Removed from favorites', 'success');
    } else {
        state.favorites.push(joke);
        showAlert('Added to favorites!', 'success');
    }

    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    updateFavoritesDisplay();
    updateHistoryDisplay();
}

function updateFavoritesDisplay() {
    if (state.favorites.length === 0) {
        favoritesList.innerHTML = '<p class="placeholder">No favorite jokes yet. Click ❤️ to save jokes!</p>';
        return;
    }

    let html = '';
    state.favorites.forEach((joke) => {
        html += `
            <div class="favorite-item">
                <span class="joke-text-favorite">${escapeHtml(joke.text)}</span>
                <div class="joke-actions-favorite">
                    <button class="icon-btn favorited" onclick="toggleFavorite('${joke.id}')" title="Remove from favorites">❤️</button>
                    <button class="icon-btn" onclick="copyToClipboard('${escapeHtml(joke.text)}')" title="Copy">📋</button>
                    <button class="icon-btn" onclick="removeFromFavorites('${joke.id}')" title="Remove">🗑️</button>
                </div>
            </div>
        `;
    });

    favoritesList.innerHTML = html;
    document.getElementById('favoritesCount').textContent = `(${state.favorites.length})`;
}

function removeFromFavorites(jokeId) {
    state.favorites = state.favorites.filter(fav => fav.id !== jokeId);
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    updateFavoritesDisplay();
    showAlert('Removed from favorites', 'success');
}

function clearFavorites() {
    if (confirm('Are you sure you want to clear all favorites?')) {
        state.favorites = [];
        localStorage.setItem('favorites', JSON.stringify(state.favorites));
        updateFavoritesDisplay();
        showAlert('Favorites cleared', 'success');
    }
}

// ==========================================
// Share & Copy Functions
// ==========================================
function shareJoke() {
    if (!state.currentJoke) {
        showAlert('No joke to share!', 'error');
        return;
    }

    const joke = state.currentJoke.text;
    const text = `😂 Check out this joke: "${joke}"`;

    if (navigator.share) {
        navigator.share({
            title: 'Random Joke',
            text: text,
        }).catch(err => console.log('Error sharing:', err));
    } else {
        copyToClipboard(text);
        showAlert('Joke copied to clipboard!', 'success');
    }
}

function copyJoke() {
    if (!state.currentJoke) {
        showAlert('No joke to copy!', 'error');
        return;
    }
    copyToClipboard(state.currentJoke.text);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');
    }).catch(err => {
        showAlert('Failed to copy', 'error');
        console.error('Copy error:', err);
    });
}

// ==========================================
// Utility Functions
// ==========================================
function setLoading(isLoading) {
    state.isLoading = isLoading;
    getJokeBtn.disabled = isLoading;
    if (isLoading) {
        getJokeBtn.innerHTML = '⏳ Loading...';
    } else {
        getJokeBtn.innerHTML = '🎲 Get Random Joke';
    }
}

function updateStatus(status) {
    statusDisplay.textContent = status;
}

function updateStats() {
    jokeCountDisplay.textContent = state.jokeCount;
    updateTimestamp();
}

function updateTimestamp() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    lastUpdateDisplay.textContent = time;
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#00d084' : '#4ecdc4'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-weight: 600;
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// Animation Styles
// ==========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// Initialize Application
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Joke Generator Initialized');
    updateHistoryDisplay();
    updateFavoritesDisplay();
    updateStats();
    
    // Update timestamp every second
    setInterval(updateTimestamp, 1000);
});
