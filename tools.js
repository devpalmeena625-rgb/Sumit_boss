// tools.js – drawing & transform tools
let drawMode = false;
let drawingTool = 'pen';
let startPoint = null;
let shape = null;
let color = '#ffffff';
let strokeWidth = 3;

// Drawing tool setup
function setDrawMode(mode) {
    drawingTool = mode;
    if (mode === 'pen') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = document.getElementById('drawColor').value;
        canvas.freeDrawingBrush.width = parseInt(document.getElementById('drawWidth').value);
        canvas.freeDrawingBrush.stroke = document.getElementById('drawColor').value;
        canvas.selection = false;
        drawMode = true;
        setStatus('✏️ Pen drawing.');
    } else {
        canvas.isDrawingMode = false;
        canvas.selection = false;
        drawMode = true;
        setStatus(`📏 Drawing ${mode}. Click and drag.`);
    }
}

document.getElementById('drawPen').addEventListener('click', () => setDrawMode('pen'));
document.getElementById('drawLine').addEventListener('click', () => setDrawMode('line'));
document.getElementById('drawRect').addEventListener('click', () => setDrawMode('rect'));
document.getElementById('drawCircle').addEventListener('click', () => setDrawMode('circle'));
document.getElementById('drawPolygon').addEventListener('click', () => setDrawMode('polygon'));
document.getElementById('drawStar').addEventListener('click', () => setDrawMode('star'));
document.getElementById('drawArrow').addEventListener('click', () => setDrawMode('arrow'));

document.getElementById('drawColor').addEventListener('input', function() {
    color = this.value;
    if (canvas.isDrawingMode) canvas.freeDrawingBrush.color = color;
});
document.getElementById('drawWidth').addEventListener('input', function() {
    strokeWidth = parseInt(this.value);
    if (canvas.isDrawingMode) canvas.freeDrawingBrush.width = strokeWidth;
});

canvas.on('mouse:down', function(opt) {
    if (!drawMode || drawingTool === 'pen') return;
    const pointer = canvas.getPointer(opt.e);
    startPoint = { x: pointer.x, y: pointer.y };
    const fill = 'transparent';
    const stroke = color;
    const width = strokeWidth;
    if (drawingTool === 'line') {
        shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], { stroke, strokeWidth: width, selectable: false, evented: false });
        canvas.add(shape);
    } else if (drawingTool === 'rect') {
        shape = new fabric.Rect({ left: pointer.x, top: pointer.y, width: 0, height: 0, fill, stroke, strokeWidth: width, selectable: false, evented: false });
        canvas.add(shape);
    } else if (drawingTool === 'circle') {
        shape = new fabric.Circle({ left: pointer.x, top: pointer.y, radius: 0, fill, stroke, strokeWidth: width, originX: 'center', originY: 'center', selectable: false, evented: false });
        canvas.add(shape);
    } else if (drawingTool === 'polygon') {
        // default pentagon
        const pts = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI/2;
            pts.push({ x: 30 * Math.cos(angle), y: 30 * Math.sin(angle) });
        }
        shape = new fabric.Polygon(pts, { left: pointer.x, top: pointer.y, fill, stroke, strokeWidth: width, selectable: false, evented: false });
        canvas.add(shape);
    } else if (drawingTool === 'star') {
        const pts = [];
        const outer = 30, inner = 15, spikes = 5;
        for (let i = 0; i < spikes*2; i++) {
            const radius = i%2===0 ? outer : inner;
            const angle = (i * Math.PI / spikes) - Math.PI/2;
            pts.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
        }
        shape = new fabric.Polygon(pts, { left: pointer.x, top: pointer.y, fill, stroke, strokeWidth: width, selectable: false, evented: false });
        canvas.add(shape);
    } else if (drawingTool === 'arrow') {
        shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], { stroke, strokeWidth: width, selectable: false, evented: false });
        canvas.add(shape);
    }
    if (shape) canvas.renderAll();
});

canvas.on('mouse:move', function(opt) {
    if (!drawMode || drawingTool === 'pen' || !shape || !startPoint) return;
    const pointer = canvas.getPointer(opt.e);
    if (drawingTool === 'line' || drawingTool === 'arrow') {
        shape.set({ x2: pointer.x, y2: pointer.y });
    } else if (drawingTool === 'rect') {
        const left = Math.min(startPoint.x, pointer.x);
        const top = Math.min(startPoint.y, pointer.y);
        shape.set({ left, top, width: Math.abs(pointer.x - startPoint.x), height: Math.abs(pointer.y - startPoint.y) });
    } else if (drawingTool === 'circle') {
        const radius = Math.sqrt((pointer.x - startPoint.x)**2 + (pointer.y - startPoint.y)**2);
        shape.set({ radius, left: startPoint.x, top: startPoint.y });
    } else if (drawingTool === 'polygon' || drawingTool === 'star') {
        // not dynamic resize, keep as is
    }
    canvas.renderAll();
});

canvas.on('mouse:up', function(opt) {
    if (!drawMode || drawingTool === 'pen' || !shape) return;
    if (drawingTool === 'arrow') {
        const p1 = { x: shape.x1, y: shape.y1 };
        const p2 = { x: shape.x2, y: shape.y2 };
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const headLen = 15;
        const headAngle = 0.5;
        const pts = [
            { x: p2.x, y: p2.y },
            { x: p2.x - headLen * Math.cos(angle - headAngle), y: p2.y - headLen * Math.sin(angle - headAngle) },
            { x: p2.x - headLen * Math.cos(angle + headAngle), y: p2.y - headLen * Math.sin(angle + headAngle) }
        ];
        const triangle = new fabric.Polygon(pts, { fill: color, stroke: color, strokeWidth: 1, selectable: false, evented: false });
        canvas.add(triangle);
        const group = new fabric.Group([shape, triangle], { left: 0, top: 0 });
        canvas.remove(shape);
        canvas.remove(triangle);
        canvas.add(group);
        shape = group;
    }
    shape.selectable = true;
    shape.evented = true;
    shape = null;
    startPoint = null;
    canvas.renderAll();
    saveHistory();
    setStatus(`✅ ${drawingTool} drawn.`);
});

document.getElementById('clearDraw').addEventListener('click', function() {
    const toRemove = canvas.getObjects().filter(o => o.type !== 'image' && o.type !== 'text' && o.type !== 'i-text');
    toRemove.forEach(o => canvas.remove(o));
    canvas.renderAll();
    saveHistory();
    setStatus('🧹 Cleared drawings.');
});

// Text
document.getElementById('addText').addEventListener('click', function() {
    const text = prompt('Enter text:', 'DEEPSEEK');
    if (!text) return;
    const font = document.getElementById('fontFamily').value;
    const size = parseInt(document.getElementById('fontSize').value);
    const color = document.getElementById('fontColor').value;
    const txt = new fabric.IText(text, {
        left: 100, top: 100,
        fontSize: size, fill: color,
        fontFamily: font,
        selectable: true, evented: true,
    });
    canvas.add(txt);
    canvas.setActiveObject(txt);
    canvas.renderAll();
    saveHistory();
    updateLayerUI();
    setStatus('📝 Text added.');
});

document.getElementById('boldBtn').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'text' || obj.type === 'i-text')) {
        obj.fontWeight = obj.fontWeight === 'bold' ? 'normal' : 'bold';
        canvas.renderAll(); saveHistory();
    }
});
document.getElementById('italicBtn').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'text' || obj.type === 'i-text')) {
        obj.fontStyle = obj.fontStyle === 'italic' ? 'normal' : 'italic';
        canvas.renderAll(); saveHistory();
    }
});
document.getElementById('underlineBtn').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'text' || obj.type === 'i-text')) {
        obj.underline = !obj.underline;
        canvas.renderAll(); saveHistory();
    }
});
document.getElementById('textStrokeBtn').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'text' || obj.type === 'i-text')) {
        obj.stroke = obj.stroke ? null : '#000';
        obj.strokeWidth = obj.stroke ? 2 : 0;
        canvas.renderAll(); saveHistory();
    }
});
document.getElementById('textShadowBtn').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'text' || obj.type === 'i-text')) {
        obj.shadow = obj.shadow ? null : new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 10, offsetX: 5, offsetY: 5 });
        canvas.renderAll(); saveHistory();
    }
});
document.getElementById('textBgBtn').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'text' || obj.type === 'i-text')) {
        obj.backgroundColor = obj.backgroundColor ? null : 'rgba(0,0,0,0.5)';
        canvas.renderAll(); saveHistory();
    }
});

document.getElementById('addEmoji').addEventListener('click', function() {
    const emoji = prompt('Enter emoji:', '😎');
    if (!emoji) return;
    const txt = new fabric.Text(emoji, {
        left: 150, top: 150, fontSize: 60,
        fontFamily: 'Segoe UI Emoji, Apple Color Emoji, sans-serif',
        selectable: true, evented: true,
    });
    canvas.add(txt);
    canvas.setActiveObject(txt);
    canvas.renderAll();
    saveHistory();
    updateLayerUI();
    setStatus(`✅ Sticker ${emoji} added.`);
});

// Crop
let cropRect = null;
document.getElementById('cropBtn').addEventListener('click', function() {
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'image') { setStatus('⚠️ Select an image.'); return; }
    if (cropRect) {
        const rect = cropRect;
        const imgObj = rect._imageRef || active;
        if (imgObj) {
            const left = rect.left - imgObj.left;
            const top = rect.top - imgObj.top;
            const w = rect.width * (1 / imgObj.scaleX);
            const h = rect.height * (1 / imgObj.scaleY);
            imgObj.filters.push(new fabric.filters.Crop({
                left: Math.round(left / imgObj.scaleX),
                top: Math.round(top / imgObj.scaleY),
                width: Math.round(w),
                height: Math.round(h),
            }));
            imgObj.applyFilters();
            canvas.remove(rect);
            cropRect = null;
            canvas.renderAll();
            saveHistory();
            setStatus('✅ Cropped!');
            updateLayerUI();
        }
        return;
    }
    const imgObj = active;
    const rect = new fabric.Rect({
        left: imgObj.left + 20,
        top: imgObj.top + 20,
        width: imgObj.width * imgObj.scaleX * 0.6,
        height: imgObj.height * imgObj.scaleY * 0.6,
        fill: 'rgba(0,0,0,0.3)',
        stroke: '#e94560',
        strokeWidth: 2,
        strokeDashArray: [5,5],
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        originX: 'left',
        originY: 'top',
    });
    rect._imageRef = imgObj;
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    cropRect = rect;
    setStatus('✂️ Resize rectangle, then click Crop again.');
});

// Rotate, Flip, Resize
document.getElementById('rotateLeft').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (!obj) { setStatus('⚠️ Select an object.'); return; }
    obj.rotate((obj.angle || 0) - 90);
    canvas.renderAll(); saveHistory(); setStatus('↺ Rotated left');
});
document.getElementById('rotateRight').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (!obj) { setStatus('⚠️ Select an object.'); return; }
    obj.rotate((obj.angle || 0) + 90);
    canvas.renderAll(); saveHistory(); setStatus('↻ Rotated right');
});
document.getElementById('flipH').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (!obj) { setStatus('⚠️ Select an object.'); return; }
    obj.flipX = !obj.flipX;
    canvas.renderAll(); saveHistory(); setStatus('⇔ Flipped H');
});
document.getElementById('flipV').addEventListener('click', function() {
    const obj = canvas.getActiveObject();
    if (!obj) { setStatus('⚠️ Select an object.'); return; }
    obj.flipY = !obj.flipY;
    canvas.renderAll(); saveHistory(); setStatus('⇕ Flipped V');
});
document.getElementById('resizeSlider').addEventListener('input', function() {
    const val = parseInt(this.value);
    document.getElementById('resizeVal').textContent = val + '%';
    const obj = canvas.getActiveObject();
    if (!obj) return;
    if (!obj._origScaleX) { obj._origScaleX = obj.scaleX || 1; obj._origScaleY = obj.scaleY || 1; }
    const factor = val / 100;
    obj.scaleX = obj._origScaleX * factor;
    obj.scaleY = obj._origScaleY * factor;
    canvas.renderAll();
});
document.getElementById('zoomSlider').addEventListener('input', function() {
    const val = parseInt(this.value);
    document.getElementById('zoomVal').textContent = val + '%';
    canvas.setZoom(val / 100);
});