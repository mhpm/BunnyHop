import fs from 'fs';
import path from 'path';

const dir = 'public/assets/extracted_all';
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8'));

let html = `<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: sans-serif; background: #263238; color: #fff; padding: 20px; }
.grid { display: flex; flex-wrap: wrap; gap: 15px; }
.card { background: #37474F; border-radius: 8px; padding: 10px; text-align: center; width: 140px; }
.card img { max-width: 120px; max-height: 100px; background: #eceff1; border-radius: 4px; padding: 4px; }
.card p { margin: 5px 0 0; font-size: 13px; color: #80cbc4; }
.dim { font-size: 11px; color: #b0bec5; }
</style>
</head>
<body>
<h2>Extracted Assets from assets.png (${meta.length} items)</h2>
<div class="grid">
`;

for (const item of meta) {
  html += `
  <div class="card">
    <img src="${item.filename}" />
    <p>#${item.id} (${item.filename})</p>
    <div class="dim">${item.w}x${item.h}</div>
  </div>`;
}

html += `</div></body></html>`;

fs.writeFileSync(path.join(dir, 'catalog.html'), html);
console.log('Saved catalog.html');
