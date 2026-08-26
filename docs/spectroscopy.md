---
layout: default
title: "Spectroscopy & LIBS Lab"
---

<div class="card">
    <h2><i class="fas fa-atom"></i> Planetary Spectroscopy & In-Situ Chemistry Laboratory</h2>
    <p>Analyze calibrated Vis-NIR reflectance spectra from <strong>Chang'e-3/4 VNIS</strong> and <strong>Chang'e-5 LMS</strong> (including in-situ water/hydroxyl detection at 2.85 &mu;m) and laser-induced breakdown spectroscopy (LIBS) atomic emission lines from <strong>Tianwen-1 MarSCoDe</strong>.</p>
</div>

<div class="grid-2col" style="display:grid;grid-template-columns:2fr 1fr;gap:1.25rem;">
    <div class="card" style="margin-bottom:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
            <div style="display:flex;gap:0.4rem;">
                <button id="btn-spec-refl" class="btn btn-primary" style="padding:0.35rem 0.8rem;font-size:0.8rem;">Vis-NIR Reflectance</button>
                <button id="btn-spec-libs" class="btn btn-secondary" style="padding:0.35rem 0.8rem;font-size:0.8rem;">Zhurong LIBS Laser</button>
            </div>
            <div id="spec-cr-wrapper" style="font-size:0.82rem;">
                <label style="cursor:pointer;">
                    <input type="checkbox" id="spec-continuum-chk"> Remove Spectral Continuum
                </label>
            </div>
        </div>

        <div style="height:400px;background:#070a12;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:0.5rem;position:relative;">
            <canvas id="spectroscopy-canvas" style="width:100%;height:100%;"></canvas>
        </div>

        <div id="spec-sample-toggles" style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1rem;"></div>
    </div>

    <!-- Features and Minerals Panel -->
    <div class="card" style="margin-bottom:0;display:flex;flex-direction:column;">
        <h3 style="margin-top:0;font-size:1.05rem;"><i class="fas fa-gem"></i> Spectral Identifiers</h3>
        <div id="spec-features-list" style="max-height:480px;overflow-y:auto;display:flex;flex-direction:column;gap:0.5rem;"></div>
    </div>
</div>

<script type="module">
import { SpectroscopyLab } from "{{ '/assets/js/spectroscopy.js' | relative_url }}";

let specLab = null;
let spectralData = null;

async function init() {
    const res = await fetch("{{ '/assets/data/spectral_library_data.json' | relative_url }}");
    spectralData = await res.json();

    specLab = new SpectroscopyLab('spectroscopy-canvas');
    specLab.loadData(spectralData);

    const btnRefl = document.getElementById('btn-spec-refl');
    const btnLibs = document.getElementById('btn-spec-libs');
    const crWrapper = document.getElementById('spec-cr-wrapper');

    btnRefl.addEventListener('click', () => {
        btnRefl.className = 'btn btn-primary';
        btnLibs.className = 'btn btn-secondary';
        crWrapper.style.display = 'block';
        specLab.setMode('reflectance');
        renderLegends();
    });

    btnLibs.addEventListener('click', () => {
        btnLibs.className = 'btn btn-primary';
        btnRefl.className = 'btn btn-secondary';
        crWrapper.style.display = 'none';
        specLab.setMode('libs');
        renderLegends();
    });

    document.getElementById('spec-continuum-chk').addEventListener('change', (e) => {
        specLab.toggleContinuumRemoval(e.target.checked);
    });

    renderLegends();
}

function renderLegends() {
    const legendContainer = document.getElementById('spec-sample-toggles');
    const featuresContainer = document.getElementById('spec-features-list');
    legendContainer.innerHTML = '';
    featuresContainer.innerHTML = '';

    if (specLab.mode === 'reflectance') {
        const samples = spectralData.reflectance_spectra.samples;
        samples.forEach(s => {
            const btn = document.createElement('button');
            const isActive = specLab.activeSampleIds.has(s.id);
            btn.className = isActive ? 'btn btn-primary' : 'btn btn-secondary';
            btn.style.padding = '0.25rem 0.6rem';
            btn.style.fontSize = '0.75rem';
            btn.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${s.color};margin-right:4px;"></span>${s.name}`;
            btn.addEventListener('click', () => {
                specLab.toggleSample(s.id);
                renderLegends();
            });
            legendContainer.appendChild(btn);

            if (isActive && s.absorption_features) {
                s.absorption_features.forEach(f => {
                    const div = document.createElement('div');
                    div.style.background = 'rgba(255,255,255,0.03)';
                    div.style.border = '1px solid rgba(255,255,255,0.06)';
                    div.style.padding = '0.5rem';
                    div.style.borderRadius = '4px';
                    div.style.fontSize = '0.78rem';
                    div.innerHTML = `
                        <div style="font-weight:700;color:var(--accent-gold);">${f.band} (~${f.center_nm} nm)</div>
                        <div style="color:var(--text-muted);font-size:0.72rem;">${s.name}</div>
                        <div style="color:#cbd5e1;font-size:0.75rem;margin-top:0.2rem;">${f.description}</div>
                    `;
                    featuresContainer.appendChild(div);
                });
            }
        });
    } else {
        const libs = spectralData.libs_spectra;
        legendContainer.innerHTML = `<div style="font-size:0.82rem;color:var(--accent-cyan);">Target: <strong>${libs.target}</strong></div>`;
        libs.lines.forEach(l => {
            const div = document.createElement('div');
            div.style.background = 'rgba(255,255,255,0.03)';
            div.style.border = '1px solid rgba(255,255,255,0.06)';
            div.style.padding = '0.45rem';
            div.style.borderRadius = '4px';
            div.style.fontSize = '0.78rem';
            div.innerHTML = `
                <div style="font-weight:700;color:var(--accent-cyan);">${l.elem} Line (${l.wl} nm)</div>
                <div style="color:var(--text-muted);font-size:0.72rem;">Intensity: ${l.intensity} counts | FWHM: ${l.fwhm} nm</div>
            `;
            featuresContainer.appendChild(div);
        });
    }
}

window.addEventListener('DOMContentLoaded', init);
</script>
