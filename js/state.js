const GameState = (function () {
    const STATE_START = 'start';
    const STATE_PLAYING = 'playing';
    const STATE_OVER = 'over';

    let currentState = STATE_START;
    let distance = 0;
    let bestDistance = 0;
    let gameOverReason = '';

    let ui = {
        distanceDisplay: null,
        bestDistanceDisplay: null,
        gameOverScreen: null,
        startScreen: null,
        finalDistanceDisplay: null,
        finalBestDisplay: null
    };

    function init(elements) {
        ui.distanceDisplay = elements.distanceDisplay;
        ui.bestDistanceDisplay = elements.bestDistanceDisplay;
        ui.gameOverScreen = elements.gameOverScreen;
        ui.startScreen = elements.startScreen;
        ui.finalDistanceDisplay = elements.finalDistanceDisplay;
        ui.finalBestDisplay = elements.finalBestDisplay;

        loadBestDistance();
        updateBestDisplay();
    }

    function loadBestDistance() {
        try {
            const saved = localStorage.getItem(CONFIG.game.localStorageKey);
            if (saved) {
                bestDistance = parseInt(saved) || 0;
            }
        } catch (e) {
            bestDistance = 0;
        }
    }

    function saveBestDistance() {
        try {
            localStorage.setItem(CONFIG.game.localStorageKey, bestDistance);
        } catch (e) {}
    }

    function updateDistanceDisplay() {
        if (ui.distanceDisplay) {
            ui.distanceDisplay.textContent = distance;
        }
    }

    function updateBestDisplay() {
        if (ui.bestDistanceDisplay) {
            ui.bestDistanceDisplay.textContent = bestDistance;
        }
    }

    function updateDistance(bikeX) {
        const currentDistance = Math.floor(Math.max(0, bikeX) / 10);
        if (currentDistance > distance) {
            distance = currentDistance;
            updateDistanceDisplay();
        }
    }

    function checkGameOver(bike) {
        const groundYHead = Terrain.getHeight(bike.headX);

        if (bike.headY + CONFIG.game.headCollisionOffset > groundYHead) {
            endGame('头部撞到地面了！');
            return true;
        }

        const normalizedAngle = bike.angle % (Math.PI * 2);
        const absAngle = Math.abs(normalizedAngle > Math.PI ? normalizedAngle - Math.PI * 2 : normalizedAngle);

        if (absAngle > Math.PI * CONFIG.game.flipAngleRatio) {
            endGame('翻车了！');
            return true;
        }

        if (bike.y > CONFIG.canvas.height + CONFIG.game.maxFallDistance) {
            endGame('掉下去了！');
            return true;
        }

        if (bike.x < -CONFIG.game.maxBackDistance) {
            endGame('退太远了！');
            return true;
        }

        return false;
    }

    function endGame(reason) {
        currentState = STATE_OVER;
        gameOverReason = reason;

        if (distance > bestDistance) {
            bestDistance = distance;
            saveBestDistance();
            updateBestDisplay();
        }

        if (ui.finalDistanceDisplay) {
            ui.finalDistanceDisplay.textContent = distance;
        }
        if (ui.finalBestDisplay) {
            ui.finalBestDisplay.textContent = bestDistance;
        }
        if (ui.gameOverScreen) {
            ui.gameOverScreen.querySelector('h2').textContent = reason;
            ui.gameOverScreen.classList.remove('hidden');
        }
    }

    function startGame() {
        currentState = STATE_PLAYING;
        distance = 0;
        gameOverReason = '';
        updateDistanceDisplay();

        if (ui.startScreen) {
            ui.startScreen.classList.add('hidden');
        }
    }

    function restartGame() {
        currentState = STATE_PLAYING;
        distance = 0;
        gameOverReason = '';
        updateDistanceDisplay();

        if (ui.gameOverScreen) {
            ui.gameOverScreen.classList.add('hidden');
        }
    }

    function isPlaying() {
        return currentState === STATE_PLAYING;
    }

    function isStart() {
        return currentState === STATE_START;
    }

    function isOver() {
        return currentState === STATE_OVER;
    }

    function getState() {
        return currentState;
    }

    function getDistance() {
        return distance;
    }

    function getBestDistance() {
        return bestDistance;
    }

    function getGameOverReason() {
        return gameOverReason;
    }

    return {
        STATE_START,
        STATE_PLAYING,
        STATE_OVER,
        init,
        updateDistance,
        checkGameOver,
        startGame,
        restartGame,
        isPlaying,
        isStart,
        isOver,
        getState,
        getDistance,
        getBestDistance,
        getGameOverReason
    };
})();
