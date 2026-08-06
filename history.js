// history.js
window.history = [];
window.historyIndex = -1;
const MAX_HISTORY = 50;

window.saveHistory = function() {
    if (!canvas) return;
    const json = canvas.toJSON(['id']);
    if (history.length > 0) {
        const last = history[historyIndex] || null;
        if (last && JSON.stringify(last) === JSON.stringify(json)) return;
    }
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(json);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
};

window.undo = function() {
    if (historyIndex > 0) {
        historyIndex--;
        loadHistory(history[historyIndex]);
    }
};
window.redo = function() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadHistory(history[historyIndex]);
    }
};
function loadHistory(json) {
    canvas.loadFromJSON(json, function() {
        canvas.renderAll();
        if (window.updateLayerUI) window.updateLayerUI();
        if (window.syncLayerControls) window.syncLayerControls();
    });
}