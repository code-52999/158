const CONFIG = {
    canvas: {
        width: 900,
        height: 500,
        groundYRatio: 0.7
    },

    physics: {
        gravity: 0.55,
        acceleration: 0.35,
        brakePower: 0.45,
        maxSpeed: 14,
        friction: 0.98,
        airResistance: 0.995,
        angularDamping: 0.98
    },

    bike: {
        wheelRadius: 18,
        wheelBase: 90,
        width: 80,
        height: 40,
        startX: 200,
        startSpeed: 3
    },

    terrain: {
        segments: 800,
        segmentWidth: 30,
        flatStartSegments: 15,
        largePhaseStep: 0.02,
        mediumPhaseStep: 0.055,
        smallPhaseStep: 0.15,
        largeHillAmplitude: 100,
        mediumHillAmplitude: 45,
        smallHillAmplitude: 16,
        noiseAmplitude: 6,
        smoothingFactor: 0.18,
        minHeightRatio: 0.22,
        maxHeightRatio: 0.92,
        grassThickness: 12,
        extendSegments: 300
    },

    camera: {
        followXOffset: 0.35,
        parallaxBackground: 0.2,
        parallaxHills: 0.3
    },

    game: {
        localStorageKey: 'bikeGameBest',
        maxFallDistance: 200,
        maxBackDistance: 100,
        flipAngleRatio: 0.65,
        headCollisionOffset: 12
    },

    colors: {
        skyTop: '#87CEEB',
        skyMid: '#B0E0E6',
        skyBottom: '#98D8C8',
        cloud: 'rgba(255, 255, 255, 0.8)',
        dirt: '#8B4513',
        grass: '#228B22',
        farHill: '#7EC8A3'
    }
};
