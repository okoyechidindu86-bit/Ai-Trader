# AI Trader 📈

An intelligent trading platform built with HTML, CSS, and JavaScript. Analyze stocks, generate trading signals, and manage your investment portfolio all from your web browser.

## Features

### 1. **Real-time Market Data**
- Fetch live stock information
- View 24-hour and 52-week highs/lows
- Track trading volume and P/E ratios
- Quick stats dashboard

### 2. **Technical Analysis**
Multiple technical indicators for in-depth market analysis:
- **Simple Moving Average (SMA)** - Identify trends
- **Exponential Moving Average (EMA)** - Weight recent prices
- **Relative Strength Index (RSI)** - Detect overbought/oversold conditions
- **MACD** - Momentum indicator
- **Bollinger Bands** - Volatility analysis

### 3. **AI Trading Signals**
- Intelligent signal generation combining multiple indicators
- Confidence scoring system
- Target price and stop-loss recommendations
- Signal history tracking
- Consensus-based decision making

### 4. **Portfolio Management**
- Add/manage stock holdings
- Track average buy price and current price
- Real-time P&L calculations
- Portfolio performance summary
- Local storage persistence

### 5. **Web Dashboard**
- Beautiful dark-themed interface
- Responsive design (desktop, tablet, mobile)
- Tab-based navigation
- Real-time updates
- Smooth animations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/okoyechidindu86-bit/Ai-Trader.git
cd Ai-Trader
```

2. Open `index.html` in your web browser

3. Start trading!

## Usage

### Dashboard Tab
1. Enter a stock symbol (e.g., AAPL, MSFT, GOOGL)
2. Click "Fetch Data" to get current market information
3. View quick stats and market data

### Analysis Tab
1. Enter a stock symbol
2. Select a technical indicator from the dropdown
3. Click "Analyze" to see detailed analysis
4. Interpret the buy/sell/hold signals

### Trading Signals Tab
1. Enter a stock symbol
2. Click "Generate Signal" to get AI-powered recommendation
3. Review confidence level and indicator agreement
4. Check target price and stop-loss levels
5. View signal history

### Portfolio Tab
1. Enter stock symbol, quantity, and buy price
2. Click "Add to Portfolio" to track your holdings
3. Monitor portfolio summary with P&L
4. View detailed holdings with percentage gains/losses
5. Remove holdings as needed

## Technical Indicators Explained

### Simple Moving Average (SMA)
Smooths price data by calculating the average price over a specific period. Helps identify trends.

### Exponential Moving Average (EMA)
Similar to SMA but gives more weight to recent prices, making it more responsive to price changes.

### Relative Strength Index (RSI)
Measures the magnitude of price changes to evaluate overbought/oversold conditions.
- RSI > 70: Overbought (potential SELL signal)
- RSI < 30: Oversold (potential BUY signal)
- RSI 30-70: Neutral (HOLD)

### MACD
Momentum indicator showing relationship between two moving averages.
- Positive histogram: BUY signal
- Negative histogram: SELL signal

### Bollinger Bands
Shows volatility and trend reversal points using upper and lower bands.
- Price above upper band: Potential SELL
- Price below lower band: Potential BUY
- Price within bands: HOLD

## AI Signal Generation

The AI trading signal system works by:
1. Calculating 5 technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
2. Assigning weighted scores to each indicator's signal
3. Computing confidence based on indicator agreement
4. Generating BUY/SELL/HOLD recommendations
5. Calculating target prices and stop-loss levels

**Confidence Scoring:**
- Higher confidence = Better indicator alignment
- Each indicator contributes based on signal strength
- Final recommendation requires majority agreement

## Data Storage

- **Portfolio**: Stored in browser's localStorage
- **Price Cache**: Historical prices stored locally
- **Signal History**: Last 50 signals kept in memory
- **Data Persistence**: Survives browser refresh

## API Integration

Currently uses simulated data for demonstration. To integrate real API data:

1. **Alpha Vantage** (Free tier available):
```javascript
const apiKey = 'YOUR_API_KEY';
const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`;
```

2. **Finnhub** (Free tier available):
```javascript
const apiKey = 'YOUR_API_KEY';
const url = `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`;
```

3. **IEX Cloud** (Free tier available):
```javascript
const apiKey = 'YOUR_API_KEY';
const url = `https://cloud.iexapis.com/stable/stock/AAPL/quote?token=${apiKey}`;
```

Replace the `getMarketDataSimulated()` function in `app.js` with actual API calls.

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Keyboard Shortcuts

- `Enter` in stock symbol field: Fetch market data

## Disclaimer

⚠️ **Important**: This application is for educational purposes only. It is NOT financial advice. Always:
- Do your own research
- Consult with a financial advisor
- Never invest more than you can afford to lose
- Understand the risks involved in trading

The AI signals are based on technical analysis patterns and should not be used as the sole basis for trading decisions.

## Future Enhancements

- [ ] Real-time API integration
- [ ] Advanced charting capabilities
- [ ] Backtesting engine
- [ ] Paper trading mode
- [ ] Alert notifications
- [ ] Multiple watchlists
- [ ] Machine learning predictions
- [ ] Sentiment analysis
- [ ] Options trading support
- [ ] Multi-asset class support (crypto, forex, commodities)

## Performance Tips

1. Use fewer indicators for faster analysis
2. Limit portfolio size for smoother performance
3. Clear signal history periodically
4. Use on desktop for best experience

## Troubleshooting

**Issue**: Data not loading
- Check browser console for errors (F12)
- Ensure API is responding (if using real API)
- Clear browser cache

**Issue**: Portfolio data lost
- Check if localStorage is enabled
- Look for browser storage settings
- Export portfolio data before clearing cache

**Issue**: Slow performance
- Reduce number of holdings in portfolio
- Clear signal history
- Close other browser tabs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## Changelog

### Version 1.0.0
- Initial release
- Core features implemented
- Technical analysis indicators
- AI signal generation
- Portfolio management
- Responsive UI

---

**Happy Trading! 📈💰**

*Remember: Past performance is not indicative of future results. Trade responsibly!*
