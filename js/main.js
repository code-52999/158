(function () {
    const canvas = document.getElementById('gameCanvas');
    const distanceDisplay = document.getElementById('distance');
    const bestDistanceDisplay = document.getElementById('bestDistance');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const startScreen = document.getElementById('startScreen');
    const finalDistanceDisplay = document.getElementById('finalDistance');
    const finalBestDisplay = document.getElementById('finalBest');
    const restartBtn = document.getElementById('restartBtn');
    const startBtn = document.getElementById('startBtn');

    function init() {
        GameState.init({
            distanceDisplay,
            bestDistanceDisplay,
            gameOverScreen,
            startScreen,
            finalDistanceDisplay,
            finalBestDisplay
        });

        Terrain.generate();
        BikePhysics.reset();
        Renderer.init(canvas);

        Input.init(canvas, {
            onStart: handleStartFromInput,
            onRestart: handleRestartFromInput
        });

        setupButtonListeners();

        gameLoop();
    }

    function setupButtonListeners() {
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);
    }

    function handleStartFromInput() {
        if (GameState.isStart()) {
            startGame();
        }
    }

    function handleRestartFromInput() {
        if (GameState.isOver()) {
            restartGame();
        }
    }

    function startGame() {
        GameState.startGame();
        BikePhysics.reset();
    }

    function restartGame() {
        GameState.restartGame();
        Terrain.generate();
        BikePhysics.reset();
        Input.reset();
    }

    function update() {
        if (GameState.isPlaying()) {
            const keys = Input.getKeys();
            BikePhysics.update(keys);

            const bike = BikePhysics.getBike();
            GameState.updateDistance(bike.x);
            GameState.checkGameOver(bike);
        }
    }

    function render() {
        const bike = BikePhysics.getBike();
        const camera = BikePhysics.getCamera();
        Renderer.render(bike, camera);
    }

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    init();
})();
