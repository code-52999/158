const BikePhysics = (function () {
    let bike = createBike();
    let camera = { x: 0, y: 0 };

    function createBike() {
        return {
            x: CONFIG.bike.startX,
            y: 0,
            vx: 0,
            vy: 0,
            angle: 0,
            angularVelocity: 0,
            wheelBase: CONFIG.bike.wheelBase,
            wheelRadius: CONFIG.bike.wheelRadius,
            frontWheelX: 0,
            frontWheelY: 0,
            rearWheelX: 0,
            rearWheelY: 0,
            headX: 0,
            headY: 0
        };
    }

    function reset() {
        bike = createBike();
        bike.y = Terrain.getHeight(CONFIG.bike.startX) - CONFIG.bike.wheelRadius - 10;
        bike.vx = CONFIG.bike.startSpeed;
        bike.angle = 0;
        bike.angularVelocity = 0;
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

    function update(keys) {
        bike.vy += CONFIG.physics.gravity;

        if (keys.right) {
            bike.vx += CONFIG.physics.acceleration * Math.cos(bike.angle);
            bike.vy += CONFIG.physics.acceleration * Math.sin(bike.angle) * 0.3;

            if (bike.vx > CONFIG.physics.maxSpeed) bike.vx = CONFIG.physics.maxSpeed;
        }

        if (keys.left) {
            bike.vx -= CONFIG.physics.brakePower;
            if (bike.vx < -CONFIG.physics.maxSpeed * 0.5) bike.vx = -CONFIG.physics.maxSpeed * 0.5;
        }

        bike.vx *= CONFIG.physics.airResistance;
        bike.angularVelocity *= CONFIG.physics.angularDamping;

        bike.x += bike.vx;
        bike.y += bike.vy;
        bike.angle += bike.angularVelocity;

        updateWheelPositions();

        const rearGroundY = Terrain.getHeight(bike.rearWheelX);
        const frontGroundY = Terrain.getHeight(bike.frontWheelX);

        let rearOnGround = false;
        let frontOnGround = false;

        if (bike.rearWheelY + CONFIG.bike.wheelRadius > rearGroundY) {
            bike.rearWheelY = rearGroundY - CONFIG.bike.wheelRadius;
            rearOnGround = true;
        }

        if (bike.frontWheelY + CONFIG.bike.wheelRadius > frontGroundY) {
            bike.frontWheelY = frontGroundY - CONFIG.bike.wheelRadius;
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

            bike.angle += angleDiff * 0.4;
            bike.angularVelocity += angleDiff * 0.15;

            if (rearOnGround && frontOnGround) {
                bike.vx *= CONFIG.physics.friction;

                const terrainAngle = Terrain.getAngle(bike.x);
                const normalAngle = terrainAngle + Math.PI / 2;
                const normalV = bike.vx * Math.cos(normalAngle) + bike.vy * Math.sin(normalAngle);

                if (normalV > 0) {
                    bike.vx -= normalV * Math.cos(normalAngle) * 0.8;
                    bike.vy -= normalV * Math.sin(normalAngle) * 0.8;
                }

                const tangentAngle = terrainAngle;
                const tangentV = bike.vx * Math.cos(tangentAngle) + bike.vy * Math.sin(tangentAngle);
                bike.vx = tangentV * Math.cos(terrainAngle);
                bike.vy = tangentV * Math.sin(terrainAngle);
            }

            if (rearOnGround && !frontOnGround) {
                bike.angularVelocity += 0.012;
            }
            if (frontOnGround && !rearOnGround) {
                bike.angularVelocity -= 0.025;
            }

            if (keys.right && rearOnGround) {
                bike.angularVelocity -= 0.012 + Math.max(0, bike.vx) * 0.0018;
            }
            if (keys.left && frontOnGround) {
                bike.angularVelocity += 0.015;
            }
        } else {
            if (keys.right) {
                bike.angularVelocity -= 0.014;
            }
            if (keys.left) {
                bike.angularVelocity += 0.008;
            }
        }

        updateWheelPositions();

        camera.x = bike.x - CONFIG.canvas.width * CONFIG.camera.followXOffset;
        if (camera.x < 0) camera.x = 0;
    }

    function getBike() {
        return bike;
    }

    function getCamera() {
        return camera;
    }

    function getDistance() {
        return Math.floor(Math.max(0, bike.x) / 10);
    }

    return {
        reset,
        update,
        getBike,
        getCamera,
        getDistance
    };
})();
