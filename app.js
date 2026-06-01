// ==========================================
// AI TRADER - Main Application Logic
// ==========================================

// Configuration
const CONFIG = {
    apiKey: 'demo', // Use a real API key for production
    baseUrl: 'https://api.example.com', // Replace with real API
    updateInterval: 5000, // 5 seconds
};

// State Management
const state = {
    currentSymbol: null,
    marketData: {},
    portfolio: JSON.parse(localStorage.getItem('portfolio')) || [],
    signals: JSON.parse(localStorage.getItem('signals')) || [],
    priceCache: JSON.parse(localStorage.getItem('priceCache')) || {},
};

// ==========================================
// Tab Navigation
// ==========================================
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// ==========================================
// Market Data & Dashboard
// ==========================================
document.getElementById('fetchBtn').addEventListener('click', fetchMarketData);
document.getElementById('stockSymbol').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchMarketData();
});

async function fetchMarketData() {
    const symbol = document.getElementById('stockSymbol').value.toUpperCase().trim();
    
    if (!symbol) {
        showAlert('Please enter a stock symbol', 'error');
        return;
    }

    try {
        showLoading('fetchBtn', true);
        
        // Fetch simulated data
        const data = await getMarketDataSimulated(symbol);
        
        // Update state
        state.currentSymbol = symbol;
        state.marketData = data;
        state.priceCache[symbol] = data.currentPrice;
        localStorage.setItem('priceCache', JSON.stringify(state.priceCache));
        
        // Update UI
        displayMarketData(data);
        updateQuickStats(data);
        
        showAlert(`Market data for ${symbol} loaded successfully!`, 'success');
    } catch (error) {
        showAlert(`Error fetching data: ${error.message}`, 'error');
        console.error('Error:', error);
    } finally {
        showLoading('fetchBtn', false);
    }
}

function displayMarketData(data) {
    const marketDataDiv = document.getElementById('marketData');
    
    const dataItems = `
        <div class="data-item">
            <span class="data-label">Symbol:</span>
            <span class="data-value">${data.symbol}</span>
        </div>
        <div class="data-item">
            <span class="data-label">Current Price:</span>
            <span class="data-value">$${data.currentPrice.toFixed(2)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">24h High:</span>
            <span class="data-value">$${data.high24h.toFixed(2)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">24h Low:</span>
            <span class="data-value">$${data.low24h.toFixed(2)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">Volume:</span>
            <span class="data-value">${(data.volume / 1000000).toFixed(2)}M</span>
        </div>
        <div class="data-item">
            <span class="data-label">52 Week High:</span>
            <span class="data-value">$${data.high52w.toFixed(2)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">52 Week Low:</span>
            <span class="data-value">$${data.low52w.toFixed(2)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">P/E Ratio:</span>
            <span class="data-value">${data.peRatio.toFixed(2)}</span>
        </div>
    `;
    
    marketDataDiv.innerHTML = dataItems;
}

function updateQuickStats(data) {
    document.getElementById('currentPrice').textContent = `$${data.currentPrice.toFixed(2)}`;
    document.getElementById('changePercent').textContent = `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`;
    document.getElementById('marketCap').textContent = `$${(data.marketCap / 1000000000).toFixed(2)}B`;
    
    // Color code the change percent
    const changeElement = document.getElementById('changePercent');
    changeElement.style.color = data.changePercent >= 0 ? '#10b981' : '#ef4444';
}

// ==========================================
// Technical Analysis
// ==========================================
document.getElementById('analyzeBtn').addEventListener('click', performAnalysis);

async function performAnalysis() {
    const symbol = document.getElementById('analysisSymbol').value.toUpperCase().trim();
    const indicator = document.getElementById('indicatorSelect').value;
    
    if (!symbol) {
        showAlert('Please enter a stock symbol', 'error');
        return;
    }

    try {
        showLoading('analyzeBtn', true);
        
        const priceData = generateHistoricalPrices(symbol, 100);
        const results = calculateIndicator(indicator, priceData);
        
        displayAnalysisResults(indicator, results, priceData);
        showAlert(`Analysis complete for ${symbol}!`, 'success');
    } catch (error) {
        showAlert(`Error analyzing: ${error.message}`, 'error');
        console.error('Error:', error);
    } finally {
        showLoading('analyzeBtn', false);
    }
}

function calculateIndicator(type, prices) {
    const closes = prices.map(p => p.close);
    
    switch (type) {
        case 'sma':
            return calculateSMA(closes);
        case 'ema':
            return calculateEMA(closes);
        case 'rsi':
            return calculateRSI(closes);
        case 'macd':
            return calculateMACD(closes);
        case 'bollinger':
            return calculateBollingerBands(closes);
        default:
            return null;
    }
}

function calculateSMA(prices, period = 20) {
    const smaValues = [];
    for (let i = period - 1; i < prices.length; i++) {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        smaValues.push(sum / period);
    }
    return {
        name: 'Simple Moving Average (SMA)',
        period: period,
        current: smaValues[smaValues.length - 1],
        all: smaValues,
        signal: prices[prices.length - 1] > smaValues[smaValues.length - 1] ? 'BUY' : 'SELL'
    };
}

function calculateEMA(prices, period = 20) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // Calculate SMA for first value
    let smaSum = 0;
    for (let i = 0; i < period; i++) {
        smaSum += prices[i];
    }
    ema.push(smaSum / period);
    
    // Calculate EMA
    for (let i = period; i < prices.length; i++) {
        ema.push((prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
    }
    
    return {
        name: 'Exponential Moving Average (EMA)',
        period: period,
        current: ema[ema.length - 1],
        all: ema,
        signal: prices[prices.length - 1] > ema[ema.length - 1] ? 'BUY' : 'SELL'
    };
}

function calculateRSI(prices, period = 14) {
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
        changes.push(prices[i] - prices[i - 1]);
    }
    
    let gains = 0, losses = 0;
    for (let i = 0; i < period; i++) {
        if (changes[i] > 0) gains += changes[i];
        else losses += Math.abs(changes[i]);
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    const rsiValues = [];
    for (let i = period; i < changes.length; i++) {
        const change = changes[i];
        if (change > 0) avgGain = (avgGain * (period - 1) + change) / period;
        else avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
        
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiValues.push(rsi);
    }
    
    const currentRSI = rsiValues[rsiValues.length - 1];
    let signal = 'HOLD';
    if (currentRSI < 30) signal = 'BUY';
    else if (currentRSI > 70) signal = 'SELL';
    
    return {
        name: 'Relative Strength Index (RSI)',
        period: period,
        current: currentRSI,
        all: rsiValues,
        signal: signal,
        overBought: currentRSI > 70,
        overSold: currentRSI < 30
    };
}

function calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
    const emaFast = calculateEMA(prices, fast);
    const emaSlow = calculateEMA(prices, slow);
    
    const macdLine = [];
    const minLength = Math.min(emaFast.all.length, emaSlow.all.length);
    for (let i = 0; i < minLength; i++) {
        macdLine.push(emaFast.all[i] - emaSlow.all[i]);
    }
    
    const signalLine = calculateSMA(macdLine, signal);
    
    const histogram = [];
    for (let i = 0; i < macdLine.length; i++) {
        histogram.push(macdLine[i] - (signalLine.all[i] || signalLine.current));
    }
    
    return {
        name: 'MACD',
        macdLine: macdLine[macdLine.length - 1],
        signalLine: signalLine.current,
        histogram: histogram[histogram.length - 1],
        signal: histogram[histogram.length - 1] > 0 ? 'BUY' : 'SELL'
    };
}

function calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const sma = calculateSMA(prices, period);
    const smaValues = sma.all;
    
    const bands = [];
    for (let i = period - 1; i < prices.length; i++) {
        const dataSlice = prices.slice(i - period + 1, i + 1);
        const mean = dataSlice.reduce((a, b) => a + b) / period;
        const variance = dataSlice.reduce((a, b) => a + Math.pow(b - mean, 2)) / period;
        const std = Math.sqrt(variance);
        
        bands.push({
            upper: mean + (std * stdDev),
            middle: mean,
            lower: mean - (std * stdDev)
        });
    }
    
    const currentBand = bands[bands.length - 1];
    const currentPrice = prices[prices.length - 1];
    let signal = 'HOLD';
    if (currentPrice > currentBand.upper) signal = 'SELL';
    else if (currentPrice < currentBand.lower) signal = 'BUY';
    
    return {
        name: 'Bollinger Bands',
        upper: currentBand.upper,
        middle: currentBand.middle,
        lower: currentBand.lower,
        signal: signal
    };
}

function displayAnalysisResults(type, results, priceData) {
    const resultsDiv = document.getElementById('analysisResults');
    let html = '';
    
    if (type === 'sma' || type === 'ema') {
        html = `
            <div class="indicator-result">
                <h3>${results.name}</h3>
                <p><strong>Period:</strong> ${results.period}</p>
                <p><strong>Current Value:</strong> $${results.current.toFixed(2)}</p>
                <p><strong>Signal:</strong> ${results.signal}</p>
                <div class="signal-status signal-${results.signal === 'BUY' ? 'buy' : 'sell'}">
                    ${results.signal}
                </div>
            </div>
        `;
    } else if (type === 'rsi') {
        html = `
            <div class="indicator-result">
                <h3>${results.name}</h3>
                <p><strong>Current RSI:</strong> ${results.current.toFixed(2)}</p>
                <p><strong>Status:</strong> ${results.overBought ? 'Over-Bought' : results.overSold ? 'Over-Sold' : 'Neutral'}</p>
                <p><strong>Signal:</strong> ${results.signal}</p>
                <div class="signal-status signal-${results.signal === 'BUY' ? 'buy' : results.signal === 'SELL' ? 'sell' : 'hold'}">
                    ${results.signal}
                </div>
            </div>
        `;
    } else if (type === 'macd') {
        html = `
            <div class="indicator-result">
                <h3>${results.name}</h3>
                <p><strong>MACD Line:</strong> ${results.macdLine.toFixed(4)}</p>
                <p><strong>Signal Line:</strong> ${results.signalLine.toFixed(4)}</p>
                <p><strong>Histogram:</strong> ${results.histogram.toFixed(4)}</p>
                <div class="signal-status signal-${results.signal === 'BUY' ? 'buy' : 'sell'}">
                    ${results.signal}
                </div>
            </div>
        `;
    } else if (type === 'bollinger') {
        html = `
            <div class="indicator-result">
                <h3>${results.name}</h3>
                <p><strong>Upper Band:</strong> $${results.upper.toFixed(2)}</p>
                <p><strong>Middle Band:</strong> $${results.middle.toFixed(2)}</p>
                <p><strong>Lower Band:</strong> $${results.lower.toFixed(2)}</p>
                <p><strong>Signal:</strong> ${results.signal}</p>
                <div class="signal-status signal-${results.signal === 'BUY' ? 'buy' : results.signal === 'SELL' ? 'sell' : 'hold'}">
                    ${results.signal}
                </div>
            </div>
        `;
    }
    
    resultsDiv.innerHTML = html;
}

// ==========================================
// AI Trading Signals
// ==========================================
document.getElementById('generateSignalBtn').addEventListener('click', generateTradingSignal);

async function generateTradingSignal() {
    const symbol = document.getElementById('signalSymbol').value.toUpperCase().trim();
    
    if (!symbol) {
        showAlert('Please enter a stock symbol', 'error');
        return;
    }

    try {
        showLoading('generateSignalBtn', true);
        
        const signal = await generateAISignal(symbol);
        
        // Add to signal history
        state.signals.unshift({
            ...signal,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 signals
        state.signals = state.signals.slice(0, 50);
        localStorage.setItem('signals', JSON.stringify(state.signals));
        
        displayTradingSignal(signal);
        updateSignalHistory();
        
        showAlert(`Trading signal generated for ${symbol}!`, 'success');
    } catch (error) {
        showAlert(`Error generating signal: ${error.message}`, 'error');
        console.error('Error:', error);
    } finally {
        showLoading('generateSignalBtn', false);
    }
}

async function generateAISignal(symbol) {
    // Simulate AI analysis by combining multiple indicators
    const priceData = generateHistoricalPrices(symbol, 100);
    const closes = priceData.map(p => p.close);
    
    const sma = calculateSMA(closes);
    const ema = calculateEMA(closes);
    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);
    const bb = calculateBollingerBands(closes);
    
    // AI scoring system
    let buyScore = 0, sellScore = 0;
    
    // SMA/EMA signals
    if (sma.signal === 'BUY') buyScore += 1; else sellScore += 1;
    if (ema.signal === 'BUY') buyScore += 1; else sellScore += 1;
    
    // RSI signals
    if (rsi.signal === 'BUY') buyScore += 2; else if (rsi.signal === 'SELL') sellScore += 2;
    
    // MACD signals
    if (macd.signal === 'BUY') buyScore += 1.5; else sellScore += 1.5;
    
    // Bollinger Bands signals
    if (bb.signal === 'BUY') buyScore += 1; else if (bb.signal === 'SELL') sellScore += 1;
    
    let recommendation = 'HOLD';
    let confidence = 0;
    
    if (buyScore > sellScore) {
        recommendation = 'BUY';
        confidence = Math.min(100, (buyScore / (buyScore + sellScore)) * 100);
    } else if (sellScore > buyScore) {
        recommendation = 'SELL';
        confidence = Math.min(100, (sellScore / (buyScore + sellScore)) * 100);
    } else {
        confidence = 50;
    }
    
    return {
        symbol: symbol,
        recommendation: recommendation,
        confidence: confidence,
        indicators: {
            sma: sma.signal,
            ema: ema.signal,
            rsi: rsi.signal,
            macd: macd.signal,
            bb: bb.signal
        },
        targetPrice: closes[closes.length - 1] * (recommendation === 'BUY' ? 1.05 : recommendation === 'SELL' ? 0.95 : 1),
        stopLoss: closes[closes.length - 1] * (recommendation === 'BUY' ? 0.97 : 1.03),
    };
}

function displayTradingSignal(signal) {
    const resultsDiv = document.getElementById('signalResults');
    
    const signalClass = `signal-${signal.recommendation.toLowerCase()}`;
    
    const html = `
        <div class="signal-box">
            <h3>${signal.symbol} - ${signal.recommendation}</h3>
            <p><strong>Confidence:</strong> ${signal.confidence.toFixed(2)}%</p>
            <p><strong>Indicators Agreement:</strong></p>
            <ul>
                <li>SMA: ${signal.indicators.sma}</li>
                <li>EMA: ${signal.indicators.ema}</li>
                <li>RSI: ${signal.indicators.rsi}</li>
                <li>MACD: ${signal.indicators.macd}</li>
                <li>Bollinger Bands: ${signal.indicators.bb}</li>
            </ul>
            <p><strong>Target Price:</strong> $${signal.targetPrice.toFixed(2)}</p>
            <p><strong>Stop Loss:</strong> $${signal.stopLoss.toFixed(2)}</p>
            <div class="signal-status ${signalClass}">
                ${signal.recommendation}
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

function updateSignalHistory() {
    const historyDiv = document.getElementById('signalHistory');
    
    if (state.signals.length === 0) {
        historyDiv.innerHTML = '<p class="placeholder">No signals generated yet</p>';
        return;
    }
    
    let html = '';
    state.signals.slice(0, 10).forEach(signal => {
        const date = new Date(signal.timestamp).toLocaleString();
        const signalClass = `signal-${signal.recommendation.toLowerCase()}`;
        
        html += `
            <div class="signal-box">
                <h3>${signal.symbol} - <span class="signal-status ${signalClass}">${signal.recommendation}</span></h3>
                <p><strong>Time:</strong> ${date}</p>
                <p><strong>Confidence:</strong> ${signal.confidence.toFixed(2)}%</p>
                <p><strong>Target:</strong> $${signal.targetPrice.toFixed(2)} | <strong>Stop Loss:</strong> $${signal.stopLoss.toFixed(2)}</p>
            </div>
        `;
    });
    
    historyDiv.innerHTML = html;
}

// ==========================================
// Portfolio Management
// ==========================================
document.getElementById('addPortfolioBtn').addEventListener('click', addToPortfolio);

function addToPortfolio() {
    const symbol = document.getElementById('portfolioSymbol').value.toUpperCase().trim();
    const quantity = parseInt(document.getElementById('portfolioQuantity').value);
    const buyPrice = parseFloat(document.getElementById('portfolioBuyPrice').value);
    
    if (!symbol || !quantity || !buyPrice) {
        showAlert('Please fill in all portfolio fields', 'error');
        return;
    }
    
    if (quantity <= 0 || buyPrice <= 0) {
        showAlert('Quantity and Buy Price must be greater than 0', 'error');
        return;
    }
    
    // Check if holding exists
    const existingIndex = state.portfolio.findIndex(h => h.symbol === symbol);
    
    if (existingIndex !== -1) {
        // Update existing holding
        state.portfolio[existingIndex].quantity += quantity;
        state.portfolio[existingIndex].totalCost += quantity * buyPrice;
        state.portfolio[existingIndex].avgPrice = state.portfolio[existingIndex].totalCost / state.portfolio[existingIndex].quantity;
    } else {
        // Add new holding
        state.portfolio.push({
            symbol: symbol,
            quantity: quantity,
            buyPrice: buyPrice,
            avgPrice: buyPrice,
            totalCost: quantity * buyPrice,
            currentPrice: buyPrice,
            addedAt: new Date().toISOString()
        });
    }
    
    // Save to localStorage
    localStorage.setItem('portfolio', JSON.stringify(state.portfolio));
    
    // Clear inputs
    document.getElementById('portfolioSymbol').value = '';
    document.getElementById('portfolioQuantity').value = '1';
    document.getElementById('portfolioBuyPrice').value = '';
    
    // Update UI
    updatePortfolioUI();
    showAlert(`${symbol} added to portfolio!`, 'success');
}

function updatePortfolioUI() {
    updatePortfolioSummary();
    updateHoldingsTable();
}

function updatePortfolioSummary() {
    let totalInvestment = 0;
    let currentValue = 0;
    
    state.portfolio.forEach(holding => {
        totalInvestment += holding.totalCost;
        currentValue += holding.quantity * holding.currentPrice;
    });
    
    const totalPnL = currentValue - totalInvestment;
    
    document.getElementById('totalInvestment').textContent = `$${totalInvestment.toFixed(2)}`;
    document.getElementById('currentValue').textContent = `$${currentValue.toFixed(2)}`;
    document.getElementById('totalPnL').textContent = `$${totalPnL.toFixed(2)}`;
    
    // Color code PnL
    const pnlElement = document.getElementById('totalPnL');
    pnlElement.style.color = totalPnL >= 0 ? '#10b981' : '#ef4444';
}

function updateHoldingsTable() {
    const holdingsDiv = document.getElementById('holdings');
    
    if (state.portfolio.length === 0) {
        holdingsDiv.innerHTML = '<p class="placeholder">No holdings in portfolio</p>';
        return;
    }
    
    let html = `
        <div class="holdings-header">
            <div>Symbol</div>
            <div>Quantity</div>
            <div>Avg Price</div>
            <div>Current Price</div>
            <div>Total Value</div>
            <div>Action</div>
        </div>
    `;
    
    state.portfolio.forEach((holding, index) => {
        const totalValue = holding.quantity * holding.currentPrice;
        const pnl = totalValue - holding.totalCost;
        const pnlPercent = (pnl / holding.totalCost) * 100;
        const pnlClass = pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
        
        html += `
            <div class="holdings-row" data-label="Holdings">
                <div>${holding.symbol}</div>
                <div>${holding.quantity}</div>
                <div>$${holding.avgPrice.toFixed(2)}</div>
                <div>$${holding.currentPrice.toFixed(2)}</div>
                <div class="${pnlClass}">
                    $${totalValue.toFixed(2)}
                    <br><small>${pnl >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%</small>
                </div>
                <div>
                    <button class="btn btn-small btn-danger" onclick="removeFromPortfolio(${index})">Remove</button>
                </div>
            </div>
        `;
    });
    
    holdingsDiv.innerHTML = html;
}

function removeFromPortfolio(index) {
    if (confirm('Are you sure you want to remove this holding?')) {
        state.portfolio.splice(index, 1);
        localStorage.setItem('portfolio', JSON.stringify(state.portfolio));
        updatePortfolioUI();
        showAlert('Holding removed from portfolio', 'success');
    }
}

// ==========================================
// Utility Functions
// ==========================================

// Simulated Market Data (for demo purposes)
async function getMarketDataSimulated(symbol) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate realistic random prices
    const basePrice = Math.random() * 300 + 50;
    const variation = basePrice * 0.05;
    
    return {
        symbol: symbol,
        currentPrice: basePrice + (Math.random() * variation - variation / 2),
        high24h: basePrice * 1.03,
        low24h: basePrice * 0.97,
        high52w: basePrice * 1.25,
        low52w: basePrice * 0.8,
        volume: Math.random() * 100000000 + 10000000,
        changePercent: (Math.random() * 5 - 2.5),
        marketCap: Math.random() * 500000000000 + 100000000000,
        peRatio: Math.random() * 30 + 10,
    };
}

function generateHistoricalPrices(symbol, days = 100) {
    const prices = [];
    let price = Math.random() * 300 + 50;
    
    for (let i = 0; i < days; i++) {
        const change = (Math.random() - 0.48) * 2;
        price += change;
        prices.push({
            date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
            close: Math.max(price, 10),
            high: Math.max(price) * 1.01,
            low: Math.max(price) * 0.99,
            volume: Math.random() * 1000000 + 100000
        });
    }
    
    return prices;
}

function showAlert(message, type = 'info') {
    // Create a simple alert system
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#6366f1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

function showLoading(elementId, show) {
    const element = document.getElementById(elementId);
    if (show) {
        element.disabled = true;
        element.textContent = 'Loading...';
    } else {
        element.disabled = false;
        element.textContent = element.dataset.originalText || element.textContent;
    }
}

// Add animation styles
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
    // Store original button text
    document.querySelectorAll('.btn').forEach(btn => {
        btn.dataset.originalText = btn.textContent;
    });
    
    // Update portfolio UI on load
    updatePortfolioUI();
    updateSignalHistory();
    
    console.log('AI Trader Application Initialized');
});

// Periodically update portfolio with simulated price changes
setInterval(() => {
    if (state.portfolio.length > 0) {
        state.portfolio.forEach(holding => {
            // Simulate small price changes
            holding.currentPrice *= (1 + (Math.random() - 0.5) * 0.02);
        });
        updatePortfolioSummary();
    }
}, 10000); // Update every 10 seconds
