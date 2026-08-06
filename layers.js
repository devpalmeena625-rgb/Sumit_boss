// layers.js
window.selectedObject = null;

window.updateLayerUI = function() {
    const list = document.getElementById('layerList');
    list.innerHTML = '';
    const objects = canvas.getObjects().filter(o => o.type !== 'background' && o.type !== 'rect' && o.type !== 'line' && o.type !== 'circle' && o.type !== 'path' && o.type !== 'polygon' && o.type !== 'triangle');
    objects.forEach((obj, idx) => {
        const div = document.createElement('div');
        div.className = 'layer-item' + (obj === selectedObject ? ' active' : '');
        let name = obj.type === 'image' ? '🖼️ Image' : (obj.type === 'text' || obj.type === 'i-text') ? '📝 Text' : '📦 ' + obj.type;
        if (obj._originalElement) name = '🖼️ Image';
        div.innerHTML = `${name} #${idx+1} <span class="del" data-idx="${idx}">✕</span>`;
        div.addEventListener('click', () => {
            canvas.setActiveObject(obj);
            canvas.renderAll();
            window.updateLayerUI();
            window.syncLayerControls();
        });
        div.querySelector('.del').addEventListener('click', (e) => {
            e.stopPropagation();
            canvas.remove(obj);
            canvas.renderAll();
            saveHistory();
            window.updateLayerUI();
            window.syncLayerControls();
            setStatus('🗑️ Layer deleted.');
        });
        list.appendChild(div);
    });
};

window.syncLayerControls = function() {
    const obj = selectedObject;
    if (obj) {
        document.getElementById('opacitySlider').value = (obj.opacity || 1) * 100;
        document.getElementById('opacityVal').textContent = Math.round((obj.opacity || 1) * 100) + '%';
        const blend = obj.blendMode || 'normal';
        document.getElementById('blendModeSelect').value = blend;
    } else {
        document.getElementById('opacitySlider').value = 100;
        document.getElementById('opacityVal').textContent = '100%';
        document.getElementById('blendModeSelect').value = 'normal';
    }
};

// Layer operations
document.getElementById('duplicateLayer').addEventListener('click', function() {
    const obj = selectedObject;
    if (!obj) { setStatus('⚠️ Select a layer to duplicate.'); return; }
    obj.clone(function(clone) {
        clone.set({ left: obj.left + 20, top: obj.top + 20 });
        canvas.add(clone);
        canvas.setActiveObject(clone);
        canvas.renderAll();
        saveHistory();
        window.updateLayerUI();
        window.syncLayerControls();
        setStatus('📋 Layer duplicated.');
    });
});

document.getElementById('mergeSelected').addEventListener('click', function() {
    const active = canvas.getActiveObject();
    if (!active) { setStatus('⚠️ Select a layer to merge down.'); return; }
    const objects = canvas.getObjects();
    const index = objects.indexOf(active);
    if (index <= 0) { setStatus('⚠️ No layer below to merge.'); return; }
    const below = objects[index - 1];
    if (!below) return;
    const group = new fabric.Group([below, active], { left: below.left, top: below.top });
    canvas.remove(below);
    canvas.remove(active);
    group.cloneAsImage(function(img) {
        img.set({ left: group.left, top: group.top });
        canvas.add(img);
        canvas.remove(group);
        canvas.renderAll();
        saveHistory();
        window.updateLayerUI();
        window.syncLayerControls();
        setStatus('🔗 Merged selected with below.');
    });
});

document.getElementById('mergeAll').addEventListener('click', function() {
    const objects = canvas.getObjects().filter(o => o.type !== 'background');
    if (objects.length < 2) { setStatus('⚠️ Need at least 2 layers.'); return; }
    const group = new fabric.Group(objects, { left: 0, top: 0 });
    objects.forEach(o => canvas.remove(o));
    group.cloneAsImage(function(img) {
        img.set({ left: 0, top: 0 });
        canvas.add(img);
        canvas.remove(group);
        canvas.renderAll();
        saveHistory();
        window.updateLayerUI();
        window.syncLayerControls();
        setStatus('🔗 Merged all layers.');
    });
});

document.getElementById('deleteLayer').addEventListener('click', function() {
    const obj = selectedObject;
    if (!obj) { setStatus('⚠️ Select a layer.'); return; }
    canvas.remove(obj);
    canvas.renderAll();
    saveHistory();
    window.updateLayerUI();
    window.syncLayerControls();
    setStatus('🗑️ Layer deleted.');
});

document.getElementById('bringForward').addEventListener('click', function() {
    const obj = selectedObject;
    if (!obj) { setStatus('⚠️ Select a layer.'); return; }
    canvas.bringForward(obj);
    canvas.renderAll();
    saveHistory();
    window.updateLayerUI();
});
document.getElementById('sendBackward').addEventListener('click', function() {
    const obj = selectedObject;
    if (!obj) { setStatus('⚠️ Select a layer.'); return; }
    canvas.sendBackward(obj);
    canvas.renderAll();
    saveHistory();
    window.updateLayerUI();
});

document.getElementById('opacitySlider').addEventListener('input', function() {
    const val = parseInt(this.value);
    document.getElementById('opacityVal').textContent = val + '%';
    const obj = selectedObject;
    if (obj) {
        obj.opacity = val / 100;
        canvas.renderAll();
        saveHistory();
    }
});

document.getElementById('blendModeSelect').addEventListener('change', function() {
    const obj = selectedObject;
    if (obj) {
        obj.blendMode = this.value;
        canvas.renderAll();
        saveHistory();
    }
});