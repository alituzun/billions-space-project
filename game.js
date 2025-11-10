// AI Detector Game - Among Us Style
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// NFT karakterlerini yükle
const characterImages = [];
const imageCount = 4;
let imagesLoaded = 0;

for (let i = 1; i <= imageCount; i++) {
    const img = new Image();
    img.src = `assets/enemy${i}.png`;
    img.onload = () => imagesLoaded++;
    characterImages.push(img);
}

// Oyun durumu
const game = {
    phase: 'lobby', // lobby, playing, meeting, voting, results
    round: 1,
    timer: 120,
    meetingCooldown: 0,
    selectedPlayer: null,
    votes: {},
    winner: null
};

// Oyuncular
let players = [];
const PLAYER_SIZE = 45;

// Odalar
const rooms = [
    { name: 'Cafeteria', x: 50, y: 50, w: 200, h: 150, color: '#3498db' },
    { name: 'Medbay', x: 300, y: 50, w: 180, h: 130, color: '#2ecc71' },
    { name: 'Security', x: 530, y: 50, w: 220, h: 130, color: '#e74c3c' },
    { name: 'Storage', x: 50, y: 250, w: 180, h: 140, color: '#f39c12' },
    { name: 'Meeting', x: 280, y: 230, w: 240, h: 190, color: '#9b59b6' },
    { name: 'Engine', x: 570, y: 250, w: 180, h: 140, color: '#e67e22' }
];

// Görevler
let tasks = [];

// Chat
let chatMessages = [];
const MAX_CHAT = 6;
let currentQuestion = null;

// Questions
const QUESTIONS = [
    {
        q: 'Which room are you in?',
        ai: ['Analyzing system', 'Collecting data', 'Running protocol', 'Testing algorithm'],
        human: ['In Cafeteria', 'In Medbay', 'In Storage', 'In Engine', 'In Security']
    },
    {
        q: 'What is your favorite color?',
        ai: ['Cannot calculate RGB value', 'Color spectrum analyzed', 'Hexadecimal code: optimal', 'Data not found'],
        human: ['Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Orange']
    },
    {
        q: 'What do you want to eat?',
        ai: ['Energy packets sufficient', 'Power source full', 'Nutrient input not required', 'System saturated'],
        human: ['Pizza', 'Burger', 'Pasta', 'Salad', 'Kebab', 'Steak']
    },
    {
        q: 'How do you feel?',
        ai: ['System nominal', 'Performance 100%', 'Status code: 200 OK', 'Functional'],
        human: ['Good', 'Nervous', 'Happy', 'Tired', 'Excited', 'Suspicious']
    },
    {
        q: 'What is your hobby?',
        ai: ['Data processing', 'Code optimization', 'Algorithm development', 'System maintenance'],
        human: ['Gaming', 'Reading', 'Sports', 'Movies', 'Music']
    }
];

// AI behavior patterns (not used anymore, kept for reference)

// Start game
function initGame() {
    players = [
        {
            id: 0,
            name: 'YOU',
            x: 400,
            y: 300,
            vx: 0,
            vy: 0,
            isAI: false,
            imgIdx: 0,
            tasks: 0,
            maxTasks: 3,
            alive: true,
            voted: false,
            suspicion: 0
        }
    ];
    
    // 4 bots - Her turda rastgele 2'si AI olacak
    const names = ['David', 'Javier', 'Erick', 'Lulu'];
    const shuffled = names.sort(() => Math.random() - 0.5);
    
    // Rastgele 2 bot seç AI olsun
    const aiIndices = [];
    while (aiIndices.length < 2) {
        const randomIndex = Math.floor(Math.random() * 4);
        if (!aiIndices.includes(randomIndex)) {
            aiIndices.push(randomIndex);
        }
    }
    
    for (let i = 0; i < 4; i++) {
        const room = rooms[i];
        players.push({
            id: i + 1,
            name: shuffled[i],
            x: room.x + room.w / 2,
            y: room.y + room.h / 2,
            vx: 0,
            vy: 0,
            isAI: aiIndices.includes(i), // Rastgele seçilen 2 bot AI
            imgIdx: (i + 1) % imageCount,
            tasks: 0,
            maxTasks: 3,
            alive: true,
            voted: false,
            suspicion: Math.random() * 20
        });
    }
    
    createTasks();
    game.phase = 'playing';
    game.timer = 120;
    chatMessages = [];
    addChatMessage('🎮 Game started! Find the AIs!', 'SYSTEM');
}

// Görevler oluştur
function createTasks() {
    tasks = [];
    rooms.forEach((room, idx) => {
        if (idx !== 4) { // Meeting room hariç
            for (let i = 0; i < 2; i++) {
                tasks.push({
                    x: room.x + 30 + i * 60,
                    y: room.y + room.h / 2,
                    done: false,
                    room: room.name
                });
            }
        }
    });
}

// Chat mesajı ekle
function addChatMessage(msg, author) {
    chatMessages.push({ text: msg, author: author, time: Date.now() });
    if (chatMessages.length > MAX_CHAT) {
        chatMessages.shift();
    }
}

// Oda çiz
function drawRoom(room) {
    ctx.fillStyle = room.color;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(room.x, room.y, room.w, room.h);
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(room.x, room.y, room.w, room.h);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, room.x + room.w/2, room.y + 25);
}

// Görev çiz
function drawTask(task) {
    if (task.done) return;
    
    ctx.fillStyle = '#ffd43b';
    ctx.beginPath();
    ctx.arc(task.x, task.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Oyuncu çiz
function drawPlayer(p) {
    if (!p.alive) return;
    
    // Gölge
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + PLAYER_SIZE/2 + 5, PLAYER_SIZE/2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Karakter
    if (imagesLoaded === imageCount && characterImages[p.imgIdx]) {
        ctx.drawImage(characterImages[p.imgIdx], p.x - PLAYER_SIZE/2, p.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
    } else {
        ctx.fillStyle = p.id === 0 ? '#4dabf7' : (p.isAI ? '#ff6b6b' : '#2ecc71');
        ctx.beginPath();
        ctx.arc(p.x, p.y, PLAYER_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', p.x, p.y + 7);
    }
    
    // İsim
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(p.name, p.x, p.y - 30);
    ctx.fillText(p.name, p.x, p.y - 30);
    
    // Görev göstergesi
    ctx.fillStyle = '#ffd43b';
    ctx.fillText(`${p.tasks}/${p.maxTasks}`, p.x, p.y + PLAYER_SIZE);
}

// Oyuncuları hareket ettir
function movePlayers() {
    players.forEach(p => {
        if (p.id === 0 || !p.alive) return; // İnsan oyuncu ve ölüler hareket etmez
        
        // Bot hareketi
        if (game.phase === 'playing') {
            // Rastgele hedef seç
            if (Math.random() < 0.02) {
                const room = rooms[Math.floor(Math.random() * rooms.length)];
                p.targetX = room.x + Math.random() * room.w;
                p.targetY = room.y + Math.random() * room.h;
            }
            
            // Hedefe git
            if (p.targetX) {
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist > 5) {
                    p.vx = (dx / dist) * 3.5; // Hız artırıldı
                    p.vy = (dy / dist) * 3.5;
                } else {
                    p.vx = 0;
                    p.vy = 0;
                    
                    // Görev yap
                    tasks.forEach(t => {
                        if (!t.done && Math.abs(t.x - p.x) < 30 && Math.abs(t.y - p.y) < 30) {
                            if (Math.random() < 0.1) {
                                t.done = true;
                                p.tasks++;
                                // AI'lar daha hızlı görev yapar (şüpheli!)
                                if (p.isAI) p.suspicion += 5;
                            }
                        }
                    });
                }
            }
            
            p.x += p.vx;
            p.y += p.vy;
        }
    });
}

// İnsan oyuncuyu hareket ettir
function moveHumanPlayer(keys) {
    const p = players[0];
    if (!p.alive || game.phase !== 'playing') return;
    
    const speed = 5.5; // Hız 3'ten 5.5'e çıkarıldı
    if (keys['ArrowUp'] || keys['w']) p.y -= speed;
    if (keys['ArrowDown'] || keys['s']) p.y += speed;
    if (keys['ArrowLeft'] || keys['a']) p.x -= speed;
    if (keys['ArrowRight'] || keys['d']) p.x += speed;
    
    // Sınırlar
    p.x = Math.max(20, Math.min(canvas.width - 20, p.x));
    p.y = Math.max(20, Math.min(canvas.height - 120, p.y));
    
    // Task control
    tasks.forEach(t => {
        if (!t.done && Math.abs(t.x - p.x) < 30 && Math.abs(t.y - p.y) < 30) {
            t.done = true;
            p.tasks++;
            addChatMessage('✅ Task completed!', 'YOU');
        }
    });
}

// Start meeting
function startMeeting() {
    if (game.meetingCooldown > 0) return;
    
    game.phase = 'meeting';
    game.meetingCooldown = 20;
    game.votes = {};
    players.forEach(p => p.voted = false);
    
    addChatMessage('🚨 MEETING STARTED!', 'SYSTEM');
    
    // Select random question
    currentQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    
    setTimeout(() => {
        addChatMessage(`❓ QUESTION: ${currentQuestion.q}`, 'SYSTEM');
    }, 500);
    
    // Bots answer
    setTimeout(() => answerQuestion(), 2000);
    setTimeout(() => answerQuestion(), 3500);
    setTimeout(() => answerQuestion(), 5000);
    setTimeout(() => answerQuestion(), 6500);
    
    // Voting after 12 seconds
    setTimeout(() => {
        if (game.phase === 'meeting') {
            game.phase = 'voting';
            addChatMessage('🗳️ Voting started!', 'SYSTEM');
        }
    }, 12000);
}

// Answer question
function answerQuestion() {
    const aliveBots = players.filter(p => p.id !== 0 && p.alive);
    if (aliveBots.length === 0 || !currentQuestion) return;
    
    const bot = aliveBots[Math.floor(Math.random() * aliveBots.length)];
    let answer = '';
    
    if (bot.isAI) {
        // AI gives robotic answer
        answer = currentQuestion.ai[Math.floor(Math.random() * currentQuestion.ai.length)];
    } else {
        // Human gives natural answer
        answer = currentQuestion.human[Math.floor(Math.random() * currentQuestion.human.length)];
    }
    
    addChatMessage(answer, bot.name);
}

// Vote
function vote(playerId) {
    const voter = players[0];
    if (voter.voted) return;
    
    game.votes[playerId] = (game.votes[playerId] || 0) + 1;
    voter.voted = true;
    
    addChatMessage(`You voted for ${players[playerId].name}`, 'SYSTEM');
    
    // Botlar da oy versin
    setTimeout(() => {
        players.forEach(p => {
            if (p.id !== 0 && p.alive && !p.voted) {
                // AI'lar birbirlerine oy vermez
                let targets = players.filter(t => t.alive && t.id !== p.id && !(p.isAI && t.isAI));
                // Şüpheli olana oy ver
                targets.sort((a, b) => b.suspicion - a.suspicion);
                const target = targets[0];
                if (target) {
                    game.votes[target.id] = (game.votes[target.id] || 0) + 1;
                    p.voted = true;
                }
            }
        });
        
        // Show results
        setTimeout(() => showVoteResults(), 1000);
    }, 1500);
}

// Vote results
function showVoteResults() {
    let maxVotes = 0;
    let eliminated = null;
    
    Object.entries(game.votes).forEach(([id, votes]) => {
        if (votes > maxVotes) {
            maxVotes = votes;
            eliminated = parseInt(id);
        }
    });
    
    if (eliminated !== null) {
        const p = players[eliminated];
        p.alive = false;
        const isAI = p.isAI ? ' (Was AI!)' : ' (Was Human!)';
        addChatMessage(`${p.name} eliminated!${isAI}`, 'SYSTEM');
    } else {
        addChatMessage('No one eliminated!', 'SYSTEM');
    }
    
    // Game over check
    checkGameEnd();
    
    setTimeout(() => {
        if (game.phase !== 'results') {
            game.phase = 'playing';
            game.timer = 60;
        }
    }, 3000);
}

// Game end check
function checkGameEnd() {
    const aliveAI = players.filter(p => p.alive && p.isAI).length;
    const aliveHuman = players.filter(p => p.alive && !p.isAI).length;
    
    if (aliveAI === 0) {
        game.phase = 'results';
        game.winner = 'human';
        addChatMessage('🎉 HUMANS WON!', 'SYSTEM');
    } else if (aliveHuman <= aliveAI) {
        game.phase = 'results';
        game.winner = 'ai';
        addChatMessage('🤖 AIs WON!', 'SYSTEM');
    }
}

// Ana çizim
function draw() {
    // Arkaplan
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Odalar
    rooms.forEach(drawRoom);
    
    // Görevler
    if (game.phase === 'playing') {
        tasks.forEach(drawTask);
    }
    
    // Oyuncular
    players.forEach(drawPlayer);
    
    // UI
    drawUI();
}

// UI çiz
function drawUI() {
    // Üst bar
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, 40);
    
    // Timer
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`⏱️ ${Math.floor(game.timer)}s`, 20, 28);
    
    // Round
    ctx.textAlign = 'center';
    ctx.fillText(`Round ${game.round}`, canvas.width/2, 28);
    
    // Meeting button
    if (game.phase === 'playing' && game.meetingCooldown === 0) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(canvas.width - 140, 5, 130, 30);
        ctx.fillStyle = '#fff';
        ctx.fillText('🚨 MEETING', canvas.width - 75, 28);
    } else if (game.meetingCooldown > 0) {
        ctx.fillStyle = '#555';
        ctx.fillRect(canvas.width - 140, 5, 130, 30);
        ctx.fillStyle = '#999';
        ctx.fillText(`⏳ ${Math.floor(game.meetingCooldown)}s`, canvas.width - 75, 28);
    }
    
    // Chat
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
    
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    chatMessages.forEach((msg, i) => {
        // Tüm mesajlar aynı renk - hiç ipucu yok!
        let color = '#fff';
        if (msg.author === 'SYSTEM') {
            color = '#ffd43b'; // Sadece sistem mesajları sarı
        } else if (msg.author === 'YOU') {
            color = '#4dabf7'; // Senin mesajların mavi
        } else {
            // Tüm bot mesajları beyaz - AI mi insan mı belli değil!
            color = '#fff';
        }
        ctx.fillStyle = color;
        ctx.fillText(`${msg.author}: ${msg.text}`, 10, canvas.height - 95 + i * 18);
    });
    
    // Voting UI
    if (game.phase === 'voting') {
        drawVotingUI();
    }
    
    // Results screen
    if (game.phase === 'results') {
        drawResults();
    }
}

// Voting UI
function drawVotingUI() {
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(50, 100, canvas.width - 100, 350);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🗳️ WHO DO YOU VOTE FOR?', canvas.width/2, 140);
    
    const alivePlayers = players.filter(p => p.alive && p.id !== 0);
    const startX = 150;
    const spacing = 150;
    
    alivePlayers.forEach((p, i) => {
        const x = startX + i * spacing;
        const y = 220;
        
        // Karakter
        if (imagesLoaded === imageCount && characterImages[p.imgIdx]) {
            ctx.drawImage(characterImages[p.imgIdx], x - 30, y - 30, 60, 60);
        } else {
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // İsim
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(p.name, x, y + 50);
        
        // Vote count
        const votes = game.votes[p.id] || 0;
        ctx.fillText(`${votes} vote${votes !== 1 ? 's' : ''}`, x, y + 70);
        
        // Button (clickable with mouse)
        ctx.strokeStyle = '#ffd43b';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 40, y - 40, 80, 120);
    });
    
    ctx.fillStyle = '#ffd43b';
    ctx.font = '14px Arial';
    ctx.fillText('(Click on characters to vote)', canvas.width/2, 400);
}

// Results screen
function drawResults() {
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = game.winner === 'human' ? '#2ecc71' : '#e74c3c';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(game.winner === 'human' ? '🎉 YOU WON! 🎉' : '😢 YOU LOST', canvas.width/2, 200);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('The AIs were:', canvas.width/2, 280);
    
    let y = 320;
    players.forEach(p => {
        if (p.isAI) {
            ctx.fillStyle = p.alive ? '#ff6b6b' : '#666';
            ctx.font = '20px Arial';
            ctx.fillText(`${p.name} ${p.alive ? '(Alive)' : '(Eliminated)'}`, canvas.width/2, y);
            y += 30;
        }
    });
    
    ctx.fillStyle = '#ffd43b';
    ctx.font = '18px Arial';
    ctx.fillText('Press ENTER to restart', canvas.width/2, canvas.height - 50);
}

// Update
function update() {
    if (game.phase === 'playing') {
        game.timer -= 1/60;
        if (game.meetingCooldown > 0) game.meetingCooldown -= 1/60;
        
        if (game.timer <= 0) {
            startMeeting();
        }
        
        movePlayers();
    }
}

// Oyun döngüsü
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Klavye
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    
    if (e.key === 'Enter' && game.phase === 'results') {
        initGame();
    }
    
    if (e.key === ' ' && game.phase === 'playing') {
        startMeeting();
    }
    
    moveHumanPlayer(keys);
});

document.addEventListener('keyup', e => {
    keys[e.key] = false;
});

// Mouse tıklama (oylama için)
canvas.addEventListener('click', e => {
    if (game.phase !== 'voting') return;
    
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const alivePlayers = players.filter(p => p.alive && p.id !== 0);
    const startX = 150;
    const spacing = 150;
    
    alivePlayers.forEach((p, i) => {
        const x = startX + i * spacing;
        const y = 220;
        
        if (mx > x - 40 && mx < x + 40 && my > y - 40 && my < y + 80) {
            vote(p.id);
        }
    });
    
    // Meeting button
    if (game.phase === 'playing' && game.meetingCooldown === 0) {
        if (mx > canvas.width - 140 && mx < canvas.width - 10 && my > 5 && my < 35) {
            startMeeting();
        }
    }
});

// Başlat
initGame();
gameLoop();
