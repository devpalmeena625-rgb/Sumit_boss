// utils.js – shared helpers
window.getActiveImage = function() {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'image') return obj;
    return null;
};
window.getActiveObject = function() {
    return canvas.getActiveObject();
};
window.setStatus = function(msg) {
    document.getElementById('status').textContent = msg;
};
window.fitCanvas = function() {
    const container = document.getElementById('canvas-container');
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w < 100 || h < 100) return;
    const ratio = Math.min(1, (w-20)/800, (h-20)/600);
    if (ratio < 1) { canvas.setWidth(800*ratio); canvas.setHeight(600*ratio); }
    else { canvas.setWidth(800); canvas.setHeight(600); }
    canvas.calcOffset();
    canvas.renderAll();
};