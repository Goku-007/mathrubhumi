// Utility to detect user inactivity and invoke a callback after a timeout.
// Usage: startIdleTimer(callback, timeoutMs);

let timerId = null;
let activityHandler = null;

export const startIdleTimer = (onIdle, timeoutMs) => {
    // Clear any existing timer/listeners
    stopIdleTimer();

    const resetTimer = () => {
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(onIdle, timeoutMs);
    };

    // List of events that constitute activity
    const events = [
        'mousemove',
        'mousedown',
        'keypress',
        'touchstart',
        'scroll',
    ];

    activityHandler = resetTimer;
    events.forEach((e) => window.addEventListener(e, activityHandler));

    // Start the first timer
    resetTimer();
};

export const stopIdleTimer = () => {
    if (timerId) clearTimeout(timerId);
    if (activityHandler) {
        const events = [
            'mousemove',
            'mousedown',
            'keypress',
            'touchstart',
            'scroll',
        ];
        events.forEach((e) => window.removeEventListener(e, activityHandler));
    }
    timerId = null;
    activityHandler = null;
};
