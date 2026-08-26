---
layout: default
title: "Subsurface Radargram (GPR) Studio"
---

<div class="card">
    <h2><i class="fas fa-satellite-dish"></i> Ground Penetrating Radar (GPR) Subsurface Stratigraphy</h2>
    <p>Explore high-frequency radar B-scan profiles from <strong>Chang'e-4 LPR (500 MHz)</strong> across the lunar farside ejecta blanket in Von Kármán crater and <strong>Tianwen-1 Zhurong RoRAD (15–35 MHz)</strong> across Utopia Planitia paleoflood channels on Mars.</p>
</div>

<div class="card" style="margin-bottom:1rem;padding:1rem;">
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center;">
        <div>
            <label style="font-size:0.8rem;color:var(--text-muted);">Mission Profile:</label>
            <select id="radar-mission-select" style="background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);padding:0.3rem 0.6rem;border-radius:4px;font-size:0.82rem;">
                <option value="lunar_change_4">Chang'e-4 LPR (Lunar Farside 500 MHz, 0–40m)</option>
                <option value="mars_zhurong">Tianwen-1 Zhurong RoRAD (Utopia Planitia 25 MHz, 0–80m)</option>
            </select>
        </div>
        <div>
            <label style="font-size:0.8rem;color:var(--text-muted);">Colormap:</label>
            <select id="radar-cmap-select" style="background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);padding:0.3rem 0.6rem;border-radius:4px;font-size:0.82rem;">
                <option value="seismic">Seismic (Red-Blue)</option>
                <option value="grayscale">Grayscale / Density</option>
                <option value="viridis">Viridis</option>
                <option value="magma">Magma</option>
                <option value="cyan">Cyan Glow</option>
            </select>
        </div>
        <div>
            <label style="font-size:0.8rem;color:var(--text-muted);">Gain: <span id="radar-gain-val" style="color:var(--accent-cyan);">1.6x</span></label>
            <input type="range" id="radar-gain-slider" min="0.5" max="4.0" step="0.1" value="1.6">
        </div>
        <div>
            <label style="font-size:0.8rem;color:var(--text-muted);">Dielectric Permittivity (&epsilon;<sub>r</sub>): <span id="radar-eps-val" style="color:var(--accent-cyan);">3.2</span></label>
            <input type="range" id="radar-eps-slider" min="2.0" max="8.0" step="0.1" value="3.2">
        </div>
        <div>
            <label style="font-size:0.82rem;cursor:pointer;">
                <input type="checkbox" id="radar-toggle-layers" checked> Show Geological Units
            </label>
        </div>
    </div>
</div>

<div style="background:rgba(15,23,42,0.9);padding:0.5rem 1rem;border:1px solid rgba(255,255,255,0.1);border-radius:6px;margin-bottom:1rem;font-size:0.82rem;font-family:monospace;" id="radar-live-readout">
    Hover crosshair over echogram to inspect trace depth, travel time, and stratigraphy...
</div>

<div style="display:flex;background:#000;border:1px solid rgba(255,255,255,0.1);border-radius:8px;overflow:hidden;height:500px;">
    <canvas id="radargram-canvas" style="flex:1;height:100%;cursor:crosshair;"></canvas>
    <div style="width:300px;background:rgba(18,24,42,0.9);border-left:1px solid rgba(255,255,255,0.1);padding:1rem;overflow-y:auto;">
        <h4 style="margin-top:0;font-size:0.9rem;color:#f8fafc;margin-bottom:0.75rem;">Stratigraphic Layers</h4>
        <div id="radar-layers-list"></div>
    </div>
</div>

<script type="module">
import { RadargramViewer } from "{{ '/assets/js/radargram.js' | relative_url }}";

let radarViewer = null;
let radargramData = null;

async function init() {
    const res = await fetch("{{ '/assets/data/radargram_data.json' | relative_url }}");
    radargramData = await res.json();

    radarViewer = new RadargramViewer('radargram-canvas', {
        onInfoUpdate: (info) => {
            document.getElementById('radar-live-readout').innerHTML = `
                <span>Trace: <strong>#${info.trace}</strong> (${info.distance} m)</span> |
                <span>Time: <strong>${info.time.toFixed(1)} ns</strong></span> |
                <span>Depth: <strong style="color:var(--accent-cyan)">${info.depth} m</strong></span> |
                <span>Layer: <strong style="color:var(--accent-gold)">${info.layer}</strong></span>
            `;
        }
    });

    radarViewer.loadData(radargramData);
    renderLayers('lunar_change_4');

    document.getElementById('radar-mission-select').addEventListener('change', (e) => {
        radarViewer.setDataset(e.target.value);
        renderLayers(e.target.value);
    });

    document.getElementById('radar-cmap-select').addEventListener('change', (e) => {
        radarViewer.setColormap(e.target.value);
    });

    document.getElementById('radar-gain-slider').addEventListener('input', (e) => {
        document.getElementById('radar-gain-val').innerText = `${e.target.value}x`;
        radarViewer.setGain(e.target.value);
    });

    document.getElementById('radar-eps-slider').addEventListener('input', (e) => {
        document.getElementById('radar-eps-val').innerText = e.target.value;
        radarViewer.setEpsilon(e.target.value);
    });

    document.getElementById('radar-toggle-layers').addEventListener('change', (e) => {
        radarViewer.toggleLayers(e.target.checked);
    });
}

function renderLayers(key) {
    const container = document.getElementById('radar-layers-list');
    container.innerHTML = '';
    const ds = radargramData[key];
    if (ds && ds.layers) {
        ds.layers.forEach(l => {
            const div = document.createElement('div');
            div.style.background = 'rgba(255,255,255,0.03)';
            div.style.borderLeft = '3px solid var(--accent-cyan)';
            div.style.padding = '0.5rem';
            div.style.borderRadius = '4px';
            div.style.marginBottom = '0.6rem';
            div.style.fontSize = '0.78rem';
            div.innerHTML = `
                <div style="font-weight:700;color:var(--accent-cyan);">${l.name}</div>
                <div style="color:var(--text-muted);font-size:0.72rem;margin:0.2rem 0;">Depth: ${l.depth_range_m[0]} - ${l.depth_range_m[1]} m</div>
                <div style="color:#cbd5e1;font-size:0.72rem;">${l.description}</div>
            `;
            div.addEventListener('mouseenter', () => radarViewer.highlightLayer(l.id));
            div.addEventListener('mouseleave', () => radarViewer.highlightLayer(null));
            container.appendChild(div);
        });
    }
}

window.addEventListener('DOMContentLoaded', init);
</script>
