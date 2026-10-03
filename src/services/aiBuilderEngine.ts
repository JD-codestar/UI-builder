import { ProjectFile } from '../types';

export class AIBuilderEngine {
  /**
   * Generates a complete project based on user prompt
   */
  async *generateProject(prompt: string, modelId: string = 'sonnet-4.5') {
    const p = prompt.toLowerCase();

    // 1. Step 1: Planning
    yield {
      type: 'step',
      step: { title: 'Analyzing requirements & designing app structure', status: 'running' }
    };
    await this.delay(600);

    yield {
      type: 'step',
      step: { title: 'Analyzing requirements & designing app structure', status: 'completed' }
    };

    // 2. Step 2: Code Generation
    yield {
      type: 'step',
      step: { title: 'Generating HTML, CSS, & JavaScript modules', status: 'running' }
    };
    await this.delay(800);

    const files = this.createProjectFiles(prompt);

    yield {
      type: 'step',
      step: { title: 'Generating HTML, CSS, & JavaScript modules', status: 'completed' }
    };

    // 3. Step 3: Bundle & Build
    yield {
      type: 'step',
      step: { title: 'Compiling assets & initializing preview environment', status: 'running' }
    };
    await this.delay(600);

    yield {
      type: 'step',
      step: { title: 'Compiling assets & initializing preview environment', status: 'completed' }
    };

    // 4. Return Final Assistant Message Content + Files
    const textResponse = `I've created your project **"${this.capitalize(prompt)}"**! 

### 📦 Generated Files:
${files.map(f => `- \`${f.name}\` (${f.language})`).join('\n')}

You can interact with the app in the **Live Preview** tab on the right, edit code directly in the **Code Editor**, or switch files in the **File Explorer**!`;

    yield {
      type: 'done',
      message: textResponse,
      files: files
    };
  }

  private createProjectFiles(prompt: string): ProjectFile[] {
    const p = prompt.toLowerCase();

    if (p.includes('snake') || p.includes('game')) {
      return this.getSnakeGameFiles();
    } else if (p.includes('portfolio') || p.includes('resume') || p.includes('website')) {
      return this.getPortfolioFiles();
    } else if (p.includes('todo') || p.includes('task') || p.includes('kanban')) {
      return this.getTodoAppFiles();
    } else if (p.includes('weather')) {
      return this.getWeatherAppFiles();
    } else if (p.includes('calculator')) {
      return this.getCalculatorFiles();
    }

    // Default Custom App Template
    return this.getCustomAppFiles(prompt);
  }

  private getSnakeGameFiles(): ProjectFile[] {
    return [
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Neon Cyber Snake</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="game-container">
    <div class="header">
      <h1>🐍 NEON CYBER SNAKE</h1>
      <div class="score-board">
        <div>SCORE: <span id="score">0</span></div>
        <div>HIGH SCORE: <span id="high-score">0</span></div>
      </div>
    </div>
    
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    
    <div class="controls-hint">
      Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or Arrow Keys to Move
    </div>
    
    <button id="restartBtn" onclick="resetGame()">Restart Game</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        path: 'styles.css',
        name: 'styles.css',
        language: 'css',
        content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #09090b;
  color: #00f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.game-container {
  background: #121218;
  border: 1px solid #1a2035;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 0 40px rgba(0, 240, 255, 0.15);
}
h1 { font-size: 24px; margin-bottom: 16px; letter-spacing: 1px; }
.score-board {
  display: flex; justify-content: space-around;
  font-weight: bold; margin-bottom: 16px; color: #ff007f;
}
canvas {
  background: #050508;
  border: 2px solid #00f0ff;
  border-radius: 8px;
  box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.2);
}
.controls-hint { margin-top: 16px; color: #888; font-size: 13px; }
kbd { background: #222; padding: 2px 6px; border-radius: 4px; color: #fff; }
#restartBtn {
  margin-top: 16px; background: #00f0ff; color: #000;
  border: none; padding: 10px 20px; font-weight: bold;
  border-radius: 8px; cursor: pointer; transition: 0.2s;
}
#restartBtn:hover { background: #ff007f; color: #fff; }`
      },
      {
        path: 'script.js',
        name: 'script.js',
        language: 'javascript',
        content: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1, dy = 0;
let score = 0;
let highScore = localStorage.getItem('snake_high') || 0;
document.getElementById('high-score').innerText = highScore;

let gameLoop;

function start() {
  gameLoop = setInterval(update, 100);
}

function update() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || checkCollision(head)) {
    alert("Game Over! Score: " + score);
    resetGame();
    return;
  }
  
  snake.unshift(head);
  
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById('score').innerText = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snake_high', highScore);
      document.getElementById('high-score').innerText = highScore;
    }
    spawnFood();
  } else {
    snake.pop();
  }
  
  draw();
}

function draw() {
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#00f0ff';
  snake.forEach((part, i) => {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
  });
  
  ctx.fillStyle = '#ff007f';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function checkCollision(head) {
  return snake.some(part => part.x === head.x && part.y === head.y);
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 1; dy = 0;
  score = 0;
  document.getElementById('score').innerText = 0;
  spawnFood();
}

window.addEventListener('keydown', e => {
  if ((e.key === 'ArrowUp' || e.key === 'w') && dy !== 1) { dx = 0; dy = -1; }
  if ((e.key === 'ArrowDown' || e.key === 's') && dy !== -1) { dx = 0; dy = 1; }
  if ((e.key === 'ArrowLeft' || e.key === 'a') && dx !== 1) { dx = -1; dy = 0; }
  if ((e.key === 'ArrowRight' || e.key === 'd') && dx !== -1) { dx = 1; dy = 0; }
});

start();`
      }
    ];
  }

  private getPortfolioFiles(): ProjectFile[] {
    return [
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Alex Rivera - AI & Software Engineer</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <nav class="navbar">
    <div class="logo">⚡ Alex.dev</div>
    <div class="links">
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>
  
  <section class="hero">
    <h1>Building Next-Gen <span class="highlight">AI Systems</span> & Web Apps</h1>
    <p>Full Stack Engineer specializing in React, TypeScript, Python, and Intelligent Web Experiences.</p>
    <div class="hero-btns">
      <a href="#projects" class="btn primary">View Work</a>
      <a href="#contact" class="btn secondary">Get in Touch</a>
    </div>
  </section>
  
  <section id="projects" class="projects">
    <h2>Featured Projects</h2>
    <div class="grid">
      <div class="card">
        <h3>🚀 Bolt V2 AI Builder</h3>
        <p>Interactive full-stack web builder generating apps in real time.</p>
      </div>
      <div class="card">
        <h3>🧠 DeepSeek Reasoning Engine</h3>
        <p>Step-by-step neural reasoning visualization dashboard.</p>
      </div>
      <div class="card">
        <h3>🌐 Cyber Canvas Studio</h3>
        <p>High performance 3D WebGL interactive canvas app.</p>
      </div>
    </div>
  </section>
</body>
</html>`
      },
      {
        path: 'styles.css',
        name: 'styles.css',
        language: 'css',
        content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a0a0c; color: #e4e4e7; line-height: 1.6;
}
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 40px; border-bottom: 1px solid #1c1c22;
}
.logo { font-size: 20px; font-weight: bold; color: #38bdf8; }
.links a { color: #a1a1aa; margin-left: 20px; text-decoration: none; }
.links a:hover { color: #fff; }
.hero {
  text-align: center; padding: 100px 20px; max-width: 800px; margin: 0 auto;
}
.hero h1 { font-size: 48px; margin-bottom: 16px; }
.highlight { color: #38bdf8; }
.hero p { font-size: 18px; color: #a1a1aa; margin-bottom: 30px; }
.hero-btns { display: flex; gap: 16px; justify-content: center; }
.btn {
  padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 600;
}
.btn.primary { background: #38bdf8; color: #000; }
.btn.secondary { border: 1px solid #27272a; color: #fff; }
.projects { padding: 60px 40px; max-width: 1000px; margin: 0 auto; }
.projects h2 { font-size: 28px; margin-bottom: 30px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.card {
  background: #121217; border: 1px solid #27272a; border-radius: 16px; padding: 24px;
}
.card h3 { margin-bottom: 8px; color: #38bdf8; }`
      }
    ];
  }

  private getTodoAppFiles(): ProjectFile[] {
    return [
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Minimal Task Manager</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="todo-card">
    <h2>📋 Task Flow</h2>
    <div class="input-row">
      <input type="text" id="taskInput" placeholder="Add a new task...">
      <button onclick="addTask()">Add</button>
    </div>
    <ul id="taskList"></ul>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        path: 'styles.css',
        name: 'styles.css',
        language: 'css',
        content: `body { background: #0f172a; color: #fff; font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
.todo-card { background: #1e293b; padding: 30px; border-radius: 16px; width: 360px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
h2 { margin-top: 0; color: #38bdf8; }
.input-row { display: flex; gap: 8px; margin-bottom: 20px; }
input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; }
button { background: #38bdf8; border: none; padding: 10px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }
ul { list-style: none; padding: 0; margin: 0; }
li { background: #334155; padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
li.done { text-decoration: line-through; opacity: 0.6; }`
      },
      {
        path: 'script.js',
        name: 'script.js',
        language: 'javascript',
        content: `function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const li = document.createElement('li');
  li.innerHTML = \`<span>\${text}</span> <button onclick="this.parentElement.remove()" style="background:#ef4444;padding:4px 8px;">✕</button>\`;
  li.addEventListener('click', (e) => { if(e.target.tagName !== 'BUTTON') li.classList.toggle('done'); });
  document.getElementById('taskList').appendChild(li);
  input.value = '';
}`
      }
    ];
  }

  private getWeatherAppFiles(): ProjectFile[] {
    return [
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Glassmorphic Weather Hub</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="weather-card">
    <div class="search">
      <input type="text" id="cityInput" value="San Francisco">
      <button onclick="getWeather()">Search</button>
    </div>
    <div class="weather-info">
      <h1 id="city">San Francisco</h1>
      <div class="temp"><span id="tempVal">72</span>°F</div>
      <p id="desc">☀️ Clear & Sunny</p>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        path: 'styles.css',
        name: 'styles.css',
        language: 'css',
        content: `body { background: linear-gradient(135deg, #0f172a, #1e1b4b); color: #fff; font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
.weather-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); padding: 40px; border-radius: 24px; width: 340px; text-align: center; }
.search { display: flex; gap: 8px; margin-bottom: 24px; }
input { flex: 1; padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: #fff; }
button { background: #38bdf8; border: none; padding: 10px 16px; border-radius: 12px; font-weight: bold; cursor: pointer; }
.temp { font-size: 64px; font-weight: bold; color: #38bdf8; margin: 10px 0; }`
      },
      {
        path: 'script.js',
        name: 'script.js',
        language: 'javascript',
        content: `function getWeather() {
  const city = document.getElementById('cityInput').value;
  document.getElementById('city').innerText = city;
  document.getElementById('tempVal').innerText = Math.floor(Math.random() * 20) + 65;
}`
      }
    ];
  }

  private getCalculatorFiles(): ProjectFile[] {
    return [
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Modern Calculator</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="calc">
    <div id="display">0</div>
    <div class="keys">
      <button onclick="clearDisplay()">C</button>
      <button onclick="press('/')">/</button>
      <button onclick="press('*')">*</button>
      <button onclick="press('-')">-</button>
      <button onclick="press('7')">7</button>
      <button onclick="press('8')">8</button>
      <button onclick="press('9')">9</button>
      <button onclick="press('+')">+</button>
      <button onclick="press('4')">4</button>
      <button onclick="press('5')">5</button>
      <button onclick="press('6')">6</button>
      <button onclick="calculate()" class="equal">=</button>
      <button onclick="press('1')">1</button>
      <button onclick="press('2')">2</button>
      <button onclick="press('3')">3</button>
      <button onclick="press('0')">0</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        path: 'styles.css',
        name: 'styles.css',
        language: 'css',
        content: `body { background: #09090b; color: #fff; font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
.calc { background: #18181b; padding: 20px; border-radius: 20px; border: 1px solid #27272a; width: 280px; }
#display { background: #09090b; font-size: 32px; padding: 20px; text-align: right; border-radius: 12px; margin-bottom: 16px; color: #38bdf8; overflow: hidden; }
.keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
button { background: #27272a; border: none; color: #fff; padding: 16px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; }
button.equal { grid-row: span 2; background: #38bdf8; color: #000; }`
      },
      {
        path: 'script.js',
        name: 'script.js',
        language: 'javascript',
        content: `let exp = '';
function press(val) { exp += val; document.getElementById('display').innerText = exp; }
function clearDisplay() { exp = ''; document.getElementById('display').innerText = '0'; }
function calculate() { try { exp = eval(exp).toString(); document.getElementById('display').innerText = exp; } catch(e) { document.getElementById('display').innerText = 'Error'; exp = ''; } }`
      }
    ];
  }

  private getCustomAppFiles(prompt: string): ProjectFile[] {
    const title = this.capitalize(prompt);
    return [
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="app-card">
    <div class="header">
      <span class="badge">⚡ Bolt Generated</span>
      <h1>${title}</h1>
      <p>Interactive web application compiled with zero token limits.</p>
    </div>

    <div class="interactive-box">
      <h3>Live Interactive Demo</h3>
      <p id="status">Status: Ready</p>
      <button class="action-btn" onclick="triggerAction()">Trigger Action</button>
      <div id="output" class="output-box">Output will appear here...</div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        path: 'styles.css',
        name: 'styles.css',
        language: 'css',
        content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0d0d11;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.app-card {
  background: #16161e;
  border: 1px solid #272738;
  border-radius: 20px;
  padding: 36px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
.badge {
  background: rgba(20, 136, 252, 0.15);
  color: #4da5fc;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
}
h1 { font-size: 26px; margin: 12px 0 6px 0; }
p { color: #8a8a9e; font-size: 14px; margin-bottom: 24px; }
.interactive-box {
  background: #0d0d11;
  border: 1px solid #272738;
  border-radius: 14px;
  padding: 20px;
}
.action-btn {
  background: #1488fc;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  margin: 12px 0;
  transition: background 0.2s;
}
.action-btn:hover { background: #1a94ff; }
.output-box {
  background: #16161e;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  color: #a0a0b0;
}`
      },
      {
        path: 'script.js',
        name: 'script.js',
        language: 'javascript',
        content: `let count = 0;
function triggerAction() {
  count++;
  document.getElementById('status').innerText = 'Status: Active (Run #' + count + ')';
  document.getElementById('output').innerText = 'Action executed successfully at ' + new Date().toLocaleTimeString() + '!';
}`
      }
    ];
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
