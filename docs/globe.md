---
layout: default
title: "Interactive 3D Planetary Globe"
---

<div class="card">
    <h2><i class="fas fa-globe"></i> Interactive 3D Moon & Mars Globe</h2>
    <p>Use your mouse to rotate, pan, and zoom the celestial bodies. Click on any landing pin or quick-select button to fly the camera directly to the site and view rover traverse telemetry.</p>
</div>

<div class="grid-2col" style="display:grid;grid-template-columns:2fr 1fr;gap:1.25rem;">
    <!-- Globe Canvas Container -->
    <div style="position:relative;height:650px;border-radius:12px;overflow:hidden;background:#020307;border:1px solid rgba(255,255,255,0.1);">
        <div id="globe-canvas-container" style="width:100%;height:100%;"></div>
        
        <!-- Overlay Controls -->
        <div style="position:absolute;top:1rem;left:1rem;background:rgba(10,14,25,0.85);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);padding:0.75rem 1rem;border-radius:6px;display:flex;flex-direction:column;gap:0.6rem;z-index:10;">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Planetary Body</div>
            <div style="display:flex;gap:0.4rem;">
                <button id="btn-body-moon" class="btn btn-primary" style="padding:0.3rem 0.7rem;font-size:0.8rem;">🌙 Moon</button>
                <button id="btn-body-mars" class="btn btn-secondary" style="padding:0.3rem 0.7rem;font-size:0.8rem;">🔴 Mars</button>
            </div>
            
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);margin-top:0.4rem;text-transform:uppercase;">Quick Fly-To Site</div>
            <div id="globe-site-pills" style="display:flex;flex-wrap:wrap;gap:0.3rem;max-width:280px;"></div>
        </div>
    </div>

    <!-- Site Details Panel -->
    <div style="display:flex;flex-direction:column;gap:1rem;">
        <div class="card" style="margin-bottom:0;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
                <h3 id="site-hero-name" style="margin:0;font-size:1.15rem;color:#f8fafc;">Chang'e-4 — Yutu-2 Rover</h3>
                <span id="site-hero-tag" class="btn btn-primary" style="padding:0.2rem 0.5rem;font-size:0.7rem;">Moon</span>
            </div>
            <div id="site-hero-region" style="font-size:0.82rem;color:var(--accent-cyan);margin-bottom:0.5rem;">Von Kármán Crater (SPA Basin)</div>
            <p id="site-hero-highlight" style="font-size:0.82rem;color:#cbd5e1;line-height:1.4;">
                First ever landing on the lunar farside; >1,600m traverse exploring South Pole-Aitken basin mantle materials.
            </p>

            <table style="width:100%;font-size:0.82rem;margin-top:0.5rem;">
                <tr>
                    <td style="color:var(--text-muted);width:40%;">Coordinates</td>
                    <td id="site-hero-coords" style="font-family:monospace;font-weight:600;color:#f8fafc;">45.457°S, 177.588°E</td>
                </tr>
                <tr>
                    <td style="color:var(--text-muted);">Elevation</td>
                    <td id="site-hero-elev" style="font-family:monospace;font-weight:600;color:#f8fafc;">-5,930 m</td>
                </tr>
                <tr>
                    <td style="color:var(--text-muted);">Landing Year</td>
                    <td id="site-hero-year" style="font-family:monospace;font-weight:600;color:#f8fafc;">2019</td>
                </tr>
            </table>
        </div>

        <div class="card" style="flex:1;margin-bottom:0;display:flex;flex-direction:column;">
            <h3 style="margin-top:0;font-size:1rem;"><i class="fas fa-route"></i> Traverse Waypoints</h3>
            <div id="site-waypoints-list" style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:0.4rem;"></div>
        </div>
    </div>
</div>

<script type="module">
import { PlanetaryGlobe } from "{{ '/assets/js/globe.js' | relative_url }}";

let globeInstance = null;
let sitesData = [];

async function init() {
    const res = await fetch("{{ '/assets/data/landing_sites_traverses.json' | relative_url }}");
    sitesData = await res.json();

    globeInstance = new PlanetaryGlobe('globe-canvas-container', {
        onSiteSelected: (site) => updateDetails(site)
    });
    globeInstance.setSitesData(sitesData);

    const btnMoon = document.getElementById('btn-body-moon');
    const btnMars = document.getElementById('btn-body-mars');

    btnMoon.addEventListener('click', () => {
        btnMoon.className = 'btn btn-primary';
        btnMars.className = 'btn btn-secondary';
        globeInstance.switchBody('Moon');
        renderPills('Moon');
    });

    btnMars.addEventListener('click', () => {
        btnMars.className = 'btn btn-primary';
        btnMoon.className = 'btn btn-secondary';
        globeInstance.switchBody('Mars');
        renderPills('Mars');
    });

    renderPills('Moon');
    const defaultSite = sitesData.find(s => s.id === 'CE-4');
    if (defaultSite) updateDetails(defaultSite);
}

function renderPills(body) {
    const container = document.getElementById('globe-site-pills');
    container.innerHTML = '';
    const filtered = sitesData.filter(s => s.body === body);
    filtered.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.padding = '0.2rem 0.5rem';
        btn.style.fontSize = '0.72rem';
        btn.innerText = `${s.id}`;
        btn.addEventListener('click', () => {
            globeInstance.flyToSite(s.id);
        });
        container.appendChild(btn);
    });
}

function updateDetails(site) {
    document.getElementById('site-hero-name').innerText = `${site.mission} — ${site.vehicle}`;
    document.getElementById('site-hero-tag').innerText = site.body;
    document.getElementById('site-hero-region').innerText = site.region;
    document.getElementById('site-hero-highlight').innerText = site.highlight;
    document.getElementById('site-hero-coords').innerText = `${site.lat > 0 ? site.lat + '°N' : Math.abs(site.lat) + '°S'}, ${site.lon > 0 ? site.lon + '°E' : Math.abs(site.lon) + '°W'}`;
    document.getElementById('site-hero-elev').innerText = `${site.elevation_m} m`;
    document.getElementById('site-hero-year').innerText = site.year;

    const wpContainer = document.getElementById('site-waypoints-list');
    wpContainer.innerHTML = '';
    if (site.traverse_waypoints && site.traverse_waypoints.length > 0) {
        site.traverse_waypoints.forEach(wp => {
            const div = document.createElement('div');
            div.style.background = 'rgba(255,255,255,0.03)';
            div.style.border = '1px solid rgba(255,255,255,0.06)';
            div.style.padding = '0.4rem 0.6rem';
            div.style.borderRadius = '4px';
            div.style.fontSize = '0.78rem';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.innerHTML = `
                <div><strong>${wp.name}</strong><div style="color:var(--text-muted);font-size:0.7rem;">${wp.target}</div></div>
                <div style="text-align:right;font-family:monospace;"><div>${wp.dist_m} m</div><div style="color:var(--accent-cyan);">${wp.day ? 'Day ' + wp.day : 'Sol ' + wp.sol}</div></div>
            `;
            wpContainer.appendChild(div);
        });
    } else {
        wpContainer.innerHTML = '<div style="font-size:0.8rem;color:var(--text-muted);padding:0.5rem;">Stationary Lander (No Rover Traverse)</div>';
    }
}

window.addEventListener('DOMContentLoaded', init);
</script>
