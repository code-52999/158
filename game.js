const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const distanceDisplay = document.getElementById('distance');
const bestDistanceDisplay = document.getElementById('bestDistance');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const finalDistanceDisplay = document.getElementById('finalDistance');
const finalBestDisplay = document.getElementById('finalBest');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GROUND_Y = CANVAS_HEIGHT * 0.7;

const GRAVITY = 0.55;
const ACCELERATION = 0.35;
const BRAKE_POWER = 0.45;
const MAX_SPEED = 14;
const FRICTION = 0.98;
const AIR_RESISTANCE = 0.995;

const WHEEL_RADIUS = 18;
const WHEEL_BASE = 90;
const BIKE_WIDTH = 80;
const BIKE_HEIGHT = 40;

let terrain = [];
const TERRAIN_SEGMENTS = 500;
const SEGMENT_WIDTH = 30;

let bike = {
    x: 200,
    y: GROUND_Y - WHEEL_RADIUS,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    wheelBase: WHEEL_BASE,
    wheelRadius: WHEEL_RADIUS,
    frontWheelX: 0,
    frontWheelY: 0,
    rearWheelX: 0,
    rearWheelY: 0,
    headX: 0,
    headY: 0
};

let camera = {
    x: 0,
    y: 0
};

let keys = {
    right: false,
    left: false
};

let gameState = 'start';
let distance = 0;
let bestDistance = parseInt(localStorage.getItem('bikeGameBest')) || 0;
let gameOverReason = '';

function init() {
    bestDistanceDisplay.textContent = bestDistance;
    generateTerrain();
    resetBike();
    setupEventListeners();
}

function generateTerrain() {
    terrain = [];
    let height = GROUND_Y;
    
    let largeHillPhase = 0;
    let mediumHillPhase = Math.random() * Math.PI * 2;
    let smallHillPhase = Math.random() * Math.PI * 2;
    
    for (let i = 0; i < TERRAIN_SEGMENTS; i++) {
        terrain.push({
            x: i * SEGMENT_WIDTH,
            y: height
        });
        
        if (i < 15) {
            height = GROUND_Y;
            continue;
        }
        
        largeHillPhase += 0.015;
        mediumHillPhase += 0.04;
        smallHillPhase += 0.12;
        
        const largeHill = Math.sin(largeHillPhase) * 60;
        const mediumHill = Math.sin(mediumHillPhase) * 25;
        const smallHill = Math.sin(smallHillPhase) * 10;
        const randomNoise = (Math.random() - 0.5) * 4;
        
        let targetHeight = GROUND_Y + largeHill + mediumHill + smallHill + randomNoise;
        
        targetHeight = Math.max(CANVAS_HEIGHT * 0.3, Math.min(CANVAS_HEIGHT * 0.88, targetHeight));
        
        height += (targetHeight - height) * 0.1;
    }
}

function getTerrainHeight(x) {
    if (x < 0) return terrain[0].y;
    
    const index = Math.floor(x / SEGMENT_WIDTH);
    if (index >= terrain.length - 1) {
        return terrain[terrain.length - 1].y;
    }
    
    const t = (x - terrain[index].x) / SEGMENT_WIDTH;
    return terrain[index].y + t * (terrain[index + 1].y - terrain[index].y);
}

function getTerrainAngle(x) {
    const dx = 20;
    const y1 = getTerrainHeight(x - dx);
    const y2 = getTerrainHeight(x + dx);
    return Math.atan2(y2 - y1, dx * 2);
}

function resetBike() {
    bike.x = 200;
    bike.y = getTerrainHeight(200) - WHEEL_RADIUS - 10;
    bike.vx = 3;
    bike.vy = 0;
    bike.angle = 0;
    bike.angularVelocity = 0;
    distance = 0;
    camera.x = 0;
    updateWheelPositions();
}

function updateWheelPositions() {
    const halfWheelBase = bike.wheelBase / 2;
    
    bike.rearWheelX = bike.x - Math.cos(bike.angle) * halfWheelBase;
    bike.rearWheelY = bike.y - Math.sin(bike.angle) * halfWheelBase;
    
    bike.frontWheelX = bike.x + Math.cos(bike.angle) * halfWheelBase;
    bike.frontWheelY = bike.y + Math.sin(bike.angle) * halfWheelBase;
    
    const headOffsetX = 10;
    const headOffsetY = -48;
    bike.headX = bike.x + headOffsetX * Math.cos(bike.angle) - headOffsetY * Math.sin(bike.angle);
    bike.headY = bike.y + headOffsetX * Math.sin(bike.angle) + headOffsetY * Math.cos(bike.angle);
}

function updatePhysics() {
    if (gameState !== 'playing') return;
    
    bike.vy += GRAVITY;
    
    if (keys.right) {
        bike.vx += ACCELERATION * Math.cos(bike.angle);
        bike.vy += ACCELERATION * Math.sin(bike.angle) * 0.3;
        
        if (bike.vx > MAX_SPEED) bike.vx = MAX_SPEED;
    }
    
    if (keys.left) {
        bike.vx -= BRAKE_POWER;
        if (bike.vx < -MAX_SPEED * 0.5) bike.vx = -MAX_SPEED * 0.5;
    }
    
    bike.vx *= AIR_RESISTANCE;
    bike.angularVelocity *= 0.98;
    
    bike.x += bike.vx;
    bike.y += bike.vy;
    bike.angle += bike.angularVelocity;
    
    updateWheelPositions();
    
    const rearGroundY = getTerrainHeight(bike.rearWheelX);
    const frontGroundY = getTerrainHeight(bike.frontWheelX);
    
    let rearOnGround = false;
    let frontOnGround = false;
    
    if (bike.rearWheelY + WHEEL_RADIUS > rearGroundY) {
        bike.rearWheelY = rearGroundY - WHEEL_RADIUS;
        rearOnGround = true;
    }
    
    if (bike.frontWheelY + WHEEL_RADIUS > frontGroundY) {
        bike.frontWheelY = frontGroundY - WHEEL_RADIUS;
        frontOnGround = true;
    }
    
    if (rearOnGround || frontOnGround) {
        const centerX = (bike.rearWheelX + bike.frontWheelX) / 2;
        const centerY = (bike.rearWheelY + bike.frontWheelY) / 2;
        
        bike.x = centerX;
        bike.y = centerY;
        
        const targetAngle = Math.atan2(
            bike.frontWheelY - bike.rearWheelY,
            bike.frontWheelX - bike.rearWheelX
        );
        
        let angleDiff = targetAngle - bike.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        bike.angle += angleDiff * 0.3;
        bike.angularVelocity += angleDiff * 0.1;
        
        if (rearOnGround && frontOnGround) {
            bike.vx *= FRICTION;
            
            const normalAngle = getTerrainAngle(bike.x) + Math.PI / 2;
            const normalV = bike.vx * Math.cos(normalAngle) + bike.vy * Math.sin(normalAngle);
            
            if (normalV > 0) {
                bike.vx -= normalV * Math.cos(normalAngle) * 0.5;
                bike.vy -= normalV * Math.sin(normalAngle) * 0.5;
            }
        }
        
        if (rearOnGround && !frontOnGround) {
            bike.angularVelocity += 0.025;
        }
        if (frontOnGround && !rearOnGround) {
            bike.angularVelocity -= 0.025;
        }
        
        if (keys.right && rearOnGround) {
            bike.angularVelocity -= 0.012;
        }
        if (keys.left && frontOnGround) {
            bike.angularVelocity += 0.015;
        }
    } else {
        if (keys.right) {
            bike.angularVelocity -= 0.008;
        }
        if (keys.left) {
            bike.angularVelocity += 0.008;
        }
    }
    
    updateWheelPositions();
    
    const currentDistance = Math.floor(Math.max(0, bike.x) / 10);
    if (currentDistance > distance) {
        distance = currentDistance;
        distanceDisplay.textContent = distance;
    }
    
    camera.x = bike.x - CANVAS_WIDTH * 0.35;
    if (camera.x < 0) camera.x = 0;
    
    checkGameOver();
}

function checkGameOver() {
    const groundYHead = getTerrainHeight(bike.headX);
    
    if (bike.headY + 12 > groundYHead) {
        endGame('头部撞到地面了！');
        return;
    }
    
    const normalizedAngle = bike.angle % (Math.PI * 2);
    const absAngle = Math.abs(normalizedAngle > Math.PI ? normalizedAngle - Math.PI * 2 : normalizedAngle);
    
    if (absAngle > Math.PI * 0.65) {
        endGame('翻车了！');
        return;
    }
    
    if (bike.y > CANVAS_HEIGHT + 200) {
        endGame('掉下去了！');
        return;
    }
    
    if (bike.x < -100) {
        endGame('退太远了！');
        return;
    }
}

function endGame(reason) {
    gameState = 'over';
    gameOverReason = reason;
    
    if (distance > bestDistance) {
        bestDistance = distance;
        localStorage.setItem('bikeGameBest', bestDistance);
        bestDistanceDisplay.textContent = bestDistance;
    }
    
    finalDistanceDisplay.textContent = distance;
    finalBestDisplay.textContent = bestDistance;
    
    gameOverScreen.querySelector('h2').textContent = reason;
    gameOverScreen.classList.remove('hidden');
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#B0E0E6');
    gradient.addColorStop(1, '#98D8C8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const cloudOffset = (camera.x * 0.2) % 400;
    
    for (let i = 0; i < 6; i++) {
        const cloudX = (i * 400 - cloudOffset) % (CANVAS_WIDTH + 400) - 100;
        const cloudY = 50 + (i % 3) * 40;
        drawCloud(cloudX, cloudY);
    }
    
    ctx.fillStyle = '#7EC8A3';
    const hillOffset = camera.x * 0.3;
    
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    
    for (let x = 0; x < CANVAS_WIDTH + 100; x += 50) {
        const hillX = x + hillOffset;
        const y = CANVAS_HEIGHT * 0.65 + Math.sin(hillX * 0.01) * 30 + Math.sin(hillX * 0.025) * 20;
        ctx.lineTo(x, y);
    }
    
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 30, y - 10, 30, 0, Math.PI * 2);
    ctx.arc(x + 60, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 30, y + 10, 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawTerrain() {
    const startIndex = Math.max(0, Math.floor(camera.x / SEGMENT_WIDTH) - 2);
    const endIndex = Math.min(terrain.length - 1, Math.ceil((camera.x + CANVAS_WIDTH) / SEGMENT_WIDTH) + 2);
    
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(terrain[startIndex].x - camera.x, CANVAS_HEIGHT);
    
    for (let i = startIndex; i <= endIndex; i++) {
        ctx.lineTo(terrain[i].x - camera.x, terrain[i].y);
    }
    
    ctx.lineTo(terrain[endIndex].x - camera.x + 50, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(terrain[startIndex].x - camera.x, terrain[startIndex].y);
    
    for (let i = startIndex; i <= endIndex; i++) {
        ctx.lineTo(terrain[i].x - camera.x, terrain[i].y);
    }
    
    ctx.lineTo(terrain[endIndex].x - camera.x + 50, terrain[endIndex].y + 12);
    
    for (let i = endIndex; i >= startIndex; i--) {
        ctx.lineTo(terrain[i].x - camera.x, terrain[i].y + 12);
    }
    
    ctx.closePath();
    ctx.fill();
}

function drawBike() {
    ctx.save();
    ctx.translate(bike.x - camera.x, bike.y);
    ctx.rotate(bike.angle);
    
    const halfWheelBase = bike.wheelBase / 2;
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-halfWheelBase, 0, WHEEL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(halfWheelBase, 0, WHEEL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-halfWheelBase, 0, WHEEL_RADIUS * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(halfWheelBase, 0, WHEEL_RADIUS * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(-halfWheelBase + 5, -WHEEL_RADIUS - 5);
    ctx.lineTo(halfWheelBase - 10, -WHEEL_RADIUS - 5);
    ctx.lineTo(halfWheelBase - 20, -WHEEL_RADIUS + 15);
    ctx.lineTo(-halfWheelBase + 10, -WHEEL_RADIUS + 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(-halfWheelBase + 15, -WHEEL_RADIUS + 3, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-halfWheelBase - 8, -WHEEL_RADIUS - 18, 25, 8);
    
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(halfWheelBase - 15, -WHEEL_RADIUS - 20, 20, 12);
    
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(halfWheelBase + 3, -WHEEL_RADIUS - 14, 4, 0, Math.PI * 2);
    ctx.fill();
    
    const seatX = 10;
    const seatY = -WHEEL_RADIUS - 5;
    
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(seatX, seatY - 25, 14, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(seatX - 2, seatY - 28, 14, Math.PI * 0.2, Math.PI * 0.8, true);
    ctx.fill();
    
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.ellipse(seatX, seatY - 8, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(seatX - 5, seatY - 2, 10, 12);
    
    ctx.strokeStyle = '#ffeaa7';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(seatX + 5, seatY - 5);
    ctx.lineTo(seatX + 25, seatY - 15);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(seatX - 5, seatY - 5);
    ctx.lineTo(seatX - 20, seatY - 10);
    ctx.stroke();
    
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawBackground();
    drawTerrain();
    drawBike();
}

function gameLoop() {
    updatePhysics();
    draw();
    requestAnimationFrame(gameLoop);
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        
        if (e.button === 0) {
            keys.left = true;
        } else if (e.button === 2) {
            keys.right = true;
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            keys.left = false;
        } else if (e.button === 2) {
            keys.right = false;
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        keys.left = false;
        keys.right = false;
    });
    
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            keys.right = true;
        }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            keys.left = true;
        }
        if (e.key === ' ' && gameState === 'start') {
            startGame();
        }
        if (e.key === 'r' || e.key === 'R') {
            if (gameState === 'over') {
                restartGame();
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            keys.right = false;
        }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            keys.left = false;
        }
    });
    
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', () => {
        keys.left = false;
        keys.right = false;
    });
    
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
}

function handleTouch(e) {
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    
    if (x < CANVAS_WIDTH / 2) {
        keys.left = true;
        keys.right = false;
    } else {
        keys.right = true;
        keys.left = false;
    }
}

function startGame() {
    gameState = 'playing';
    startScreen.classList.add('hidden');
    resetBike();
}

function restartGame() {
    gameState = 'playing';
    gameOverScreen.classList.add('hidden');
    generateTerrain();
    resetBike();
}

init();
gameLoop();
