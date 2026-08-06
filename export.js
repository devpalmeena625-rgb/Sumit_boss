// export.js
document.getElementById('downloadPNG').addEventListener('click', function() {
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    downloadImage(dataURL, 'edited.png');
});
document.getElementById('downloadJPG').addEventListener('click', function() {
    const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
    downloadImage(dataURL, 'edited.jpg');
});
function downloadImage(dataURL, filename) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatus(`⬇️ Downloaded ${filename}`);
}