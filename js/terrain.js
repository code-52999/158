const Terrain = (function () {
    let segments = [];
    let phase = {
        large: 0,
        medium: 0,
        small: 0,
        currentHeight: 0
    };

    const groundY = CONFIG.canvas.height * CONFIG.canvas.groundYRatio;

    function appendSegment() {
        const index = segments.length;
        segments.push({
            x: index * CONFIG.terrain.segmentWidth,
            y: phase.currentHeight
        });

        if (index < CONFIG.terrain.flatStartSegments) {
            phase.currentHeight = groundY;
            return;
        }

        phase.large += CONFIG.terrain.largePhaseStep;
        phase.medium += CONFIG.terrain.mediumPhaseStep;
        phase.small += CONFIG.terrain.smallPhaseStep;

        const largeHill = Math.sin(phase.large) * CONFIG.terrain.largeHillAmplitude;
        const mediumHill = Math.sin(phase.medium) * CONFIG.terrain.mediumHillAmplitude;
        const smallHill = Math.sin(phase.small) * CONFIG.terrain.smallHillAmplitude;
        const randomNoise = (Math.random() - 0.5) * CONFIG.terrain.noiseAmplitude;

        let targetHeight = groundY + largeHill + mediumHill + smallHill + randomNoise;

        targetHeight = Math.max(
            CONFIG.canvas.height * CONFIG.terrain.minHeightRatio,
            Math.min(CONFIG.canvas.height * CONFIG.terrain.maxHeightRatio, targetHeight)
        );

        phase.currentHeight += (targetHeight - phase.currentHeight) * CONFIG.terrain.smoothingFactor;
    }

    function generate() {
        segments = [];
        phase.large = 0;
        phase.medium = Math.random() * Math.PI * 2;
        phase.small = Math.random() * Math.PI * 2;
        phase.currentHeight = groundY;

        for (let i = 0; i < CONFIG.terrain.segments; i++) {
            appendSegment();
        }
    }

    function extend(segmentsToAdd = CONFIG.terrain.extendSegments) {
        for (let i = 0; i < segmentsToAdd; i++) {
            appendSegment();
        }
    }

    function ensureUpTo(x) {
        while ((segments.length - 1) * CONFIG.terrain.segmentWidth < x) {
            appendSegment();
        }
    }

    function getHeight(x) {
        if (x < 0) return segments[0].y;

        const index = Math.floor(x / CONFIG.terrain.segmentWidth);
        if (index >= segments.length - 1) {
            ensureUpTo(x + CONFIG.terrain.segmentWidth * 2);
        }

        if (index >= segments.length - 1) {
            return segments[segments.length - 1].y;
        }

        const t = (x - segments[index].x) / CONFIG.terrain.segmentWidth;
        return segments[index].y + t * (segments[index + 1].y - segments[index].y);
    }

    function getAngle(x) {
        const dx = 20;
        const y1 = getHeight(x - dx);
        const y2 = getHeight(x + dx);
        return Math.atan2(y2 - y1, dx * 2);
    }

    function getSegments() {
        return segments;
    }

    function getGroundY() {
        return groundY;
    }

    return {
        generate,
        extend,
        ensureUpTo,
        getHeight,
        getAngle,
        getSegments,
        getGroundY
    };
})();
