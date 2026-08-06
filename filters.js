// filters.js
function applyFilterToImage(filterType) {
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'image') {
        setStatus('⚠️ Select an image layer.');
        return;
    }
    let filters = [];
    switch(filterType) {
        case 'sepia': filters.push(new fabric.filters.Sepia()); break;
        case 'grayscale': filters.push(new fabric.filters.Grayscale()); break;
        case 'invert': filters.push(new fabric.filters.Invert()); break;
        case 'emboss': filters.push(new fabric.filters.Convolute({ matrix: [-2,-1,0,-1,1,1,0,1,2] })); break;
        case 'vintage': filters.push(new fabric.filters.Sepia()); filters.push(new fabric.filters.Vintage()); break;
        case 'solarize': filters.push(new fabric.filters.Solarize()); break;
        case 'posterize': filters.push(new fabric.filters.Posterize({ levels: 4 })); break;
        case 'oil': filters.push(new fabric.filters.Oil()); break;
        case 'edge': filters.push(new fabric.filters.Convolute({ matrix: [0,1,0,1,-4,1,0,1,0] })); break;
        case 'glow': filters.push(new fabric.filters.Glow()); break;
        case 'vignette': filters.push(new fabric.filters.Vignette()); break;
        case 'bloom': filters.push(new fabric.filters.Bloom()); break;
        case 'pixelate': filters.push(new fabric.filters.Pixelate({ blocksize: 8 })); break;
        case 'noise': filters.push(new fabric.filters.Noise({ noise: 50 })); break;
        case 'sharpen': filters.push(new fabric.filters.Convolute({ matrix: [0,-1,0,-1,5,-1,0,-1,0] })); break;
        case 'blur': filters.push(new fabric.filters.Blur({ blur: 0.3 })); break;
        case 'tint': filters.push(new fabric.filters.Tint({ color: '#ff8800', opacity: 0.3 })); break;
        case 'vibrance': filters.push(new fabric.filters.Vibrance({ vibrance: 0.3 })); break;
        default: setStatus('❌ Unknown filter.'); return;
    }
    obj.filters = filters;
    obj.applyFilters();
    canvas.renderAll();
    saveHistory();
    setStatus(`✅ Applied ${filterType} filter.`);
}

// Attach filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const filter = this.dataset.filter;
        applyFilterToImage(filter);
    });
});

// Adjustment sliders
['brightnessSlider','contrastSlider','saturationSlider','hueSlider','gammaSlider'].forEach(id => {
    document.getElementById(id).addEventListener('input', function() {
        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') {
            const val = this.value;
            const labelId = id.replace('Slider','Val');
            document.getElementById(labelId).textContent = val;
            setStatus('⚠️ Select an image layer.');
            return;
        }
        updateAdjustments(obj);
    });
});

function updateAdjustments(obj) {
    const bright = parseInt(document.getElementById('brightnessSlider').value);
    const contrast = parseInt(document.getElementById('contrastSlider').value);
    const sat = parseInt(document.getElementById('saturationSlider').value);
    const hue = parseInt(document.getElementById('hueSlider').value);
    const gamma = parseFloat(document.getElementById('gammaSlider').value);
    document.getElementById('brightnessVal').textContent = bright;
    document.getElementById('contrastVal').textContent = contrast;
    document.getElementById('saturationVal').textContent = sat;
    document.getElementById('hueVal').textContent = hue;
    document.getElementById('gammaVal').textContent = gamma;
    let filters = [];
    if (bright !== 0) filters.push(new fabric.filters.Brightness({ brightness: bright/100 }));
    if (contrast !== 0) filters.push(new fabric.filters.Contrast({ contrast: contrast/100 }));
    if (sat !== 0) filters.push(new fabric.filters.Saturation({ saturation: sat/100 }));
    if (hue !== 0) filters.push(new fabric.filters.HueRotation({ rotation: hue/180 * Math.PI }));
    if (gamma !== 1) filters.push(new fabric.filters.Gamma({ gamma: [gamma, gamma, gamma] }));
    obj.filters = filters;
    obj.applyFilters();
    canvas.renderAll();
    saveHistory();
}