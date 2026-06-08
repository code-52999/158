const Input = (function () {
    let keys = {
        right: false,
        left: false
    };

    let canvas = null;
    let onStart = null;
    let onRestart = null;

    function init(canvasElement, callbacks) {
        canvas = canvasElement;
        onStart = callbacks.onStart || null;
        onRestart = callbacks.onRestart || null;

        setupMouseListeners();
        setupKeyboardListeners();
        setupTouchListeners();
    }

    function setupMouseListeners() {
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
    }

    function setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = true;
            }
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = true;
            }
            if (e.key === ' ' && onStart) {
                onStart();
            }
            if (e.key === 'r' || e.key === 'R') {
                if (onRestart) {
                    onRestart();
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
    }

    function setupTouchListeners() {
        canvas.addEventListener('touchstart', handleTouch);
        canvas.addEventListener('touchmove', handleTouch);
        canvas.addEventListener('touchend', () => {
            keys.left = false;
            keys.right = false;
        });
    }

    function handleTouch(e) {
        e.preventDefault();

        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;

        if (x < canvas.width / 2) {
            keys.left = true;
            keys.right = false;
        } else {
            keys.right = true;
            keys.left = false;
        }
    }

    function getKeys() {
        return keys;
    }

    function reset() {
        keys.left = false;
        keys.right = false;
    }

    return {
        init,
        getKeys,
        reset
    };
})();
