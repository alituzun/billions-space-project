# AI Detector Game 🤖🔍

An Among Us-style social deduction game where you need to identify which players are AI and which are human!

## 🎮 Game Overview

You are a human player among 4 bots. **2 of them are secretly AIs**, and your mission is to find and eliminate them before they outnumber the humans!

## 🎯 How to Play

### Controls
- **WASD** or **Arrow Keys** - Move your character
- **SPACE** or click Meeting button - Call an emergency meeting
- **Mouse Click** - Vote during meetings
- **ENTER** - Restart game after game over

### Gameplay
1. **Explore the station** and complete tasks (yellow circles)
2. **Observe other players** - Watch their behavior and movement patterns
3. **Call meetings** - Press SPACE to start a discussion (20 second cooldown)
4. **Ask questions** - During meetings, bots will answer questions
5. **Analyze answers** - AI responses are more robotic and mechanical
6. **Vote wisely** - Click on a player to vote them out
7. **Win condition** - Eliminate all AIs before they equal or outnumber humans

## 🎭 Characters

The game features 4 unique NFT characters:
- **David** - Blue character with newspaper hat
- **Javier** - Yellow-blue striped with dollar signs
- **Erick** - Purple-green earth character with halo
- **Lulu** - Yellow character with gaming controller

## 🧠 How to Detect AIs

### Question Types
During meetings, the game asks random questions:
- "Which room are you in?"
- "What is your favorite color?"
- "What do you want to eat?"
- "How do you feel?"
- "What is your hobby?"

### AI Behavior Patterns
- **Robotic answers**: "Analyzing system", "Cannot calculate RGB value"
- **Technical responses**: "Status code: 200 OK", "Performance 100%"
- **Mechanical language**: "Energy packets sufficient", "Data processing"

### Human Behavior Patterns
- **Natural answers**: "Pizza", "Blue", "Happy"
- **Emotional responses**: "Tired", "Excited", "Nervous"
- **Casual language**: Normal everyday responses

## 🏆 Game Features

- **6 different rooms** to explore (Cafeteria, Medbay, Security, Storage, Meeting, Engine)
- **Task system** - Complete objectives around the station
- **Meeting cooldown** - 20 seconds between meetings
- **Strategic voting** - AI bots will vote based on suspicion levels
- **Dynamic AI selection** - AIs are randomly chosen each game
- **No visual hints** - All chat messages are the same color for maximum difficulty

## 🚀 Deployment

This game is ready for Vercel deployment:

### Option 1: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `billions-space-project`
4. Click "Deploy"
5. Your game will be live at the provided URL

### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Quick Deploy
```bash
git add .
git commit -m "AI Detector Game ready"
git push origin main
```

Then connect your GitHub repo to Vercel for automatic deployments.

## 🛠️ Technical Details

- **Pure JavaScript** - No frameworks required
- **HTML5 Canvas** - All graphics rendered on canvas
- **Responsive design** - Works on desktop browsers
- **NFT character integration** - Custom character sprites

## 📁 Project Structure

```
billions-space-project/
├── index.html          # Main HTML file
├── game.js             # Game logic and rendering
├── vercel.json         # Vercel deployment config
├── assets/             # Character sprites
│   ├── enemy1.png     # David
│   ├── enemy2.png     # Javier
│   ├── enemy3.png     # Erick
│   └── enemy4.png     # Lulu
└── README.md           # This file
```

## 🎨 Credits

Game inspired by Among Us with a unique AI detection twist.
NFT characters and game design by the Billions Space project.

---

**Have fun detecting AIs!** 🕵️‍♂️
