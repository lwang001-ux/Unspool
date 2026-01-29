# Unspool - Twitter Archive Portfolio

Turn your Twitter archive into a viewable portfolio.

## Getting Started

### For Claude Code:

1. Open your terminal
2. Navigate to this folder:
   ```bash
   cd unspool-claude-code
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to the URL shown (usually http://localhost:5173)

### Project Structure

```
unspool-claude-code/
├── src/
│   ├── App.jsx          # Main Unspool component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

### Features

- **Tweet Generator**: Daily inspiration with auto-drip functionality
- **Sample Unspool**: Your archived tweets with images
- **Archive Manager**: Load and shuffle your Twitter archive
- **Portfolio Highlights**: Auto-curated project showcase

### Adding Your Twitter Archive

1. Download your Twitter archive from Twitter
2. Extract the `tweets.js` file
3. Parse it and add tweets to the `REAL_ARCHIVE` array in `App.jsx`

### Built With

- React 18
- Vite
- Pure CSS (no frameworks)

---

Created with ❤️ for maker educators
