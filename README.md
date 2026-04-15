# Rohan's Games 🎮

A collection of fun, interactive browser games built by Rohan M. All games are built with vanilla JavaScript and HTML5 Canvas.

**Play now at: [minermine.fun](https://minermine.fun)**

![Game Preview](https://img.shields.io/badge/status-live-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 🎮 Available Games

### 1. Don't Get Popped! 🍿

A fast-paced survival game where you control a popcorn kernel trying to avoid heat sources and water drops.

**Features:**
- Multiple control schemes (keyboard, mouse, touch)
- Responsive design for all devices
- Lives system and progressive difficulty
- Smooth 60 FPS canvas animations

[Play Don't Get Popped!](https://minermine.fun/games/dont-get-popped/)

---

## 🏗️ Project Structure

```
minermine123.github.io/
├── index.html              # Main game selection homepage
├── homepage.css            # Styles for game selection page
├── games/
│   └── dont-get-popped/
│       ├── index.html      # Game HTML
│       ├── game.js         # Game logic (680 lines)
│       └── style.css       # Game styles
├── CNAME                   # Custom domain (minermine.fun)
└── README.md              # This file
```

---

## 🛠️ Technology Stack

- **HTML5** - Structure and Canvas element
- **CSS3** - Styling with flexbox, gradients, and media queries
- **JavaScript (ES6+)** - Game logic and interactivity
- **Canvas API** - 2D rendering and animations
- **GitHub Pages** - Hosting and deployment
- **Custom Domain** - minermine.fun via CNAME

---

## 🚀 Local Development

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/minermine123/minermine123.github.io.git
   cd minermine123.github.io
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

### Adding a New Game

1. **Create a new game directory**
   ```bash
   mkdir -p games/your-game-name
   ```

2. **Add game files**
   ```
   games/your-game-name/
   ├── index.html
   ├── game.js
   └── style.css
   ```

3. **Update homepage**
   Edit `index.html` to add your game card:
   ```html
   <a href="games/your-game-name/index.html" class="game-card">
       <div class="game-icon">🎲</div>
       <h3>Your Game Name</h3>
       <p>Game description here</p>
       <div class="play-btn">Play Now</div>
   </a>
   ```

4. **Add back button to your game**
   In your game's HTML header:
   ```html
   <a href="../../index.html" class="back-btn">← Back to Games</a>
   ```

### Deployment

Changes are automatically deployed via GitHub Pages:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

The site updates within minutes at [minermine.fun](https://minermine.fun)!

---

## 📱 Responsive Design

All games and the homepage adapt to any screen size:

- **Desktop (>768px)**: Full-size layouts, keyboard controls
- **Tablet (≤768px)**: Medium layouts, touch-friendly
- **Mobile (≤480px)**: Optimized layouts, mobile controls

---

## 🎨 Design Guidelines

When creating new games for this site:

1. **Use consistent styling** - Match the yellow/orange gradient theme
2. **Make it responsive** - Test on mobile, tablet, and desktop
3. **Add a back button** - Link to `../../index.html`
4. **Include clear instructions** - Tell players how to play
5. **Optimize performance** - Aim for 60 FPS smooth gameplay

---

## 🔮 Upcoming Games

- 🎯 **Game 2** - Coming soon!
- 🚀 **Game 3** - Coming soon!

Have ideas for new games? Let's build them!

---

## 📝 Best Practices Used

✅ **Vanilla JavaScript** - No frameworks, pure performance  
✅ **Responsive Design** - Mobile-first approach  
✅ **Performance Optimization** - requestAnimationFrame for smooth 60 FPS  
✅ **User Experience** - Visual feedback and intuitive controls  
✅ **Clean Code** - Modular functions with clear naming  
✅ **Browser Compatibility** - Works on all modern browsers  
✅ **Accessibility** - Touch-friendly targets, clear UI

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-game`)
3. Add your game or improvements
4. Commit your changes (`git commit -m 'Add amazing game'`)
5. Push to the branch (`git push origin feature/amazing-game`)
6. Open a Pull Request

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👤 Author

**Rohan M.**

- Website: [minermine.fun](https://minermine.fun)
- GitHub: [@minermine123](https://github.com/minermine123)

---

## 🙏 Acknowledgments

- Built with vanilla JavaScript - no libraries required!
- Inspired by classic arcade games
- Thanks to the HTML5 Canvas API for making 2D games accessible

---

## 📚 Resources

- [Live Site](https://minermine.fun) - Play the games
- [GitHub Pages Documentation](https://pages.github.com) - Deployment guide
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - For game rendering
- [Game Loop Pattern](https://developer.mozilla.org/en-US/docs/Games/Anatomy) - Game development basics

---

**Made with ❤️ by Rohan M.**

*Choose your game and have fun!* 🎮
