// app.js – main
window.canvas = null;

function initApp() {
    canvas = new fabric.Canvas('editorCanvas', {
        backgroundColor: '#1e1e2e',
        width: 800,
        height: 600,
        selection: true,
        preserveObjectStacking: true,
    });
    canvas.wrapperEl.id = 'editorCanvas';
    const container = document.getElementById('canvas-container');
    container.innerHTML = '';
    container.appendChild(canvas.wrapperEl);
    fitCanvas();
    // Events
    canvas.on('object:added', saveHistory);
    canvas.on('object:removed', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('selection:created', (e) => { selectedObject = e.selected[0] || null; updateLayerUI(); syncLayerControls(); });
    canvas.on('selection:updated', (e) => { selectedObject = e.selected[0] || null; updateLayerUI(); syncLayerControls(); });
    canvas.on('selection:cleared', () => { selectedObject = null; updateLayerUI(); syncLayerControls(); });
    setStatus('💀 Ultimate Pro Max ready.');
    updateLayerUI();
    syncLayerControls();
    // Reset
    document.getElementById('resetBtn').addEventListener('click', function() {
        canvas.clear();
        canvas.setBackgroundColor('#1e1e2e', function(){});
        canvas.renderAll();
        history = [];
        historyIndex = -1;
        selectedObject = null;
        cropRect = null;
        updateLayerUI();
        syncLayerControls();
        setStatus('🔄 Canvas reset.');
    });
    document.getElementById('bgColor').addEventListener('input', function() {
        canvas.setBackgroundColor(this.value, function() { canvas.renderAll(); });
    });
    // Upload
    document.getElementById('uploadInput').addEventListener('change', function(e) {
        const files = e.target.files;
        if (!files.length) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(ev) {
                fabric.Image.fromURL(ev.target.result, function(img) {
                    const maxW = 400, maxH = 300;
                    let scale = 1;
                    if (img.width > maxW) scale = maxW / img.width;
                    if (img.height * scale > maxH) scale = maxH / img.height;
                    img.scale(scale);
                    img.set({
                        left: Math.random() * (canvas.width - img.width*scale),
                        top: Math.random() * (canvas.height - img.height*scale),
                        selectable: true, evented: true,
                    });
                    canvas.add(img);
                    canvas.renderAll();
                    saveHistory();
                    updateLayerUI();
                    syncLayerControls();
                    setStatus(`✅ Uploaded ${file.name}`);
                }, { crossOrigin: 'anonymous' });
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    });
}

document.addEventListener('DOMContentLoaded', initApp);