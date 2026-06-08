const Renderer = (function () {
    let ctx = null;
    let canvas = null;

    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawBackground(camera) {
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, CONFIG.colors.skyTop);
        gradient.addColorStop(0.6, CONFIG.colors.skyMid);
        gradient.addColorStop(1, CONFIG.colors.skyBottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = CONFIG.colors.cloud;
        const cloudOffset = (camera.x * CONFIG.camera.parallaxBackground) % 400;

        for (let i = 0; i < 6; i++) {
            const cloudX = (i * 400 - cloudOffset) % (canvas.width + 400) - 100;
            const cloudY = 50 + (i % 3) * 40;
            drawCloud(cloudX, cloudY);
        }

        ctx.fillStyle = CONFIG.colors.farHill;
        const hillOffset = camera.x * CONFIG.camera.parallaxHills;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x < canvas.width + 100; x += 50) {
            const hillX = x + hillOffset;
            const y = canvas.height * 0.65 + Math.sin(hillX * 0.01) * 30 + Math.sin(hillX * 0.025) * 20;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
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

    function drawTerrain(camera) {
        Terrain.ensureUpTo(camera.x + canvas.width + CONFIG.terrain.segmentWidth * 4);

        const segments = Terrain.getSegments();
        const startIndex = Math.max(0, Math.floor(camera.x / CONFIG.terrain.segmentWidth) - 2);
        const endIndex = Math.min(segments.length - 1, Math.ceil((camera.x + canvas.width) / CONFIG.terrain.segmentWidth) + 2);

        ctx.fillStyle = CONFIG.colors.dirt;
        ctx.beginPath();
        ctx.moveTo(segments[startIndex].x - camera.x, canvas.height);

        for (let i = startIndex; i <= endIndex; i++) {
            ctx.lineTo(segments[i].x - camera.x, segments[i].y);
        }

        ctx.lineTo(segments[endIndex].x - camera.x + 50, canvas.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = CONFIG.colors.grass;
        ctx.beginPath();
        ctx.moveTo(segments[startIndex].x - camera.x, segments[startIndex].y);

        for (let i = startIndex; i <= endIndex; i++) {
            ctx.lineTo(segments[i].x - camera.x, segments[i].y);
        }

        ctx.lineTo(segments[endIndex].x - camera.x + 50, segments[endIndex].y + CONFIG.terrain.grassThickness);

        for (let i = endIndex; i >= startIndex; i--) {
            ctx.lineTo(segments[i].x - camera.x, segments[i].y + CONFIG.terrain.grassThickness);
        }

        ctx.closePath();
        ctx.fill();
    }

    function drawBike(bike, camera) {
        ctx.save();
        ctx.translate(bike.x - camera.x, bike.y);
        ctx.rotate(bike.angle);

        const halfWheelBase = bike.wheelBase / 2;

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-halfWheelBase, 0, CONFIG.bike.wheelRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(halfWheelBase, 0, CONFIG.bike.wheelRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-halfWheelBase, 0, CONFIG.bike.wheelRadius * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(halfWheelBase, 0, CONFIG.bike.wheelRadius * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(-halfWheelBase + 5, -CONFIG.bike.wheelRadius - 5);
        ctx.lineTo(halfWheelBase - 10, -CONFIG.bike.wheelRadius - 5);
        ctx.lineTo(halfWheelBase - 20, -CONFIG.bike.wheelRadius + 15);
        ctx.lineTo(-halfWheelBase + 10, -CONFIG.bike.wheelRadius + 15);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.ellipse(-halfWheelBase + 15, -CONFIG.bike.wheelRadius + 3, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-halfWheelBase - 8, -CONFIG.bike.wheelRadius - 18, 25, 8);

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(halfWheelBase - 15, -CONFIG.bike.wheelRadius - 20, 20, 12);

        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(halfWheelBase + 3, -CONFIG.bike.wheelRadius - 14, 4, 0, Math.PI * 2);
        ctx.fill();

        const seatX = 10;
        const seatY = -CONFIG.bike.wheelRadius - 5;

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

    function render(bike, camera) {
        clear();
        drawBackground(camera);
        drawTerrain(camera);
        drawBike(bike, camera);
    }

    return {
        init,
        render
    };
})();
