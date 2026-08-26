---
layout: default
title: "Mars Weather & Geophysics"
---

<div class="card">
    <h2><i class="fas fa-cloud-sun"></i> Martian Meteorology & Planetary Geophysics</h2>
    <p>Examine diurnal temperature and pressure cycles from the <strong>Mars Climate Station (MCS)</strong> in Utopia Planitia, track surface crustal magnetic field variations recorded by <strong>Zhurong RoMAG</strong>, and monitor lunar farside radiation equivalent doses from <strong>Chang'e-4 LND</strong>.</p>
</div>

<div class="grid-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
    <!-- Live Instrument Gauges -->
    <div class="card" style="margin-bottom:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="margin:0;font-size:1.1rem;"><i class="fas fa-temperature-high"></i> Live Diurnal Scrub (Sol 100)</h3>
            <span id="climate-live-time" style="font-family:monospace;color:var(--accent-gold);font-weight:700;">12:00 LTST</span>
        </div>

        <div style="margin-bottom:1.25rem;">
            <label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:0.3rem;">Scrub Local True Solar Time (LTST):</label>
            <input type="range" id="climate-time-slider" min="0" max="96" value="48" style="width:100%;">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.5rem;">
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:0.75rem;border-radius:6px;">
                <div style="font-size:0.75rem;color:var(--text-muted);">Air Temperature</div>
                <div id="climate-live-tair" style="font-size:1.3rem;font-weight:700;color:var(--accent-cyan);font-family:monospace;">-42.5 °C</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:0.75rem;border-radius:6px;">
                <div style="font-size:0.75rem;color:var(--text-muted);">Ground Temperature</div>
                <div id="climate-live-tgnd" style="font-size:1.3rem;font-weight:700;color:var(--accent-mars);font-family:monospace;">-22.8 °C</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:0.75rem;border-radius:6px;">
                <div style="font-size:0.75rem;color:var(--text-muted);">Atmospheric Pressure</div>
                <div id="climate-live-pres" style="font-size:1.3rem;font-weight:700;color:var(--accent-blue);font-family:monospace;">765.2 Pa</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:0.75rem;border-radius:6px;">
                <div style="font-size:0.75rem;color:var(--text-muted);">Wind Velocity</div>
                <div id="climate-live-wind" style="font-size:1.3rem;font-weight:700;color:var(--accent-gold);font-family:monospace;">6.2 m/s (210°)</div>
            </div>
        </div>

        <!-- Compass -->
        <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:140px;height:140px;border-radius:50%;border:2px dashed rgba(255,255,255,0.2);position:relative;display:flex;align-items:center;justify-content:center;">
                <span style="position:absolute;top:4px;font-size:0.7rem;font-weight:700;color:var(--text-muted);">N</span>
                <span style="position:absolute;bottom:4px;font-size:0.7rem;font-weight:700;color:var(--text-muted);">S</span>
                <span style="position:absolute;right:6px;font-size:0.7rem;font-weight:700;color:var(--text-muted);">E</span>
                <span style="position:absolute;left:6px;font-size:0.7rem;font-weight:700;color:var(--text-muted);">W</span>
                <div id="compass-needle" style="width:4px;height:60px;background:linear-gradient(to top, transparent 50%, var(--accent-mars) 50%);position:absolute;transform-origin:50% 100%;top:10px;transform:rotate(210deg);transition:transform 0.4s ease;"></div>
                <div style="width:10px;height:10px;border-radius:50%;background:#ffffff;z-index:2;"></div>
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">Surface Wind Azimuth Vector</div>
        </div>
    </div>

    <!-- Timeseries Chart -->
    <div class="card" style="margin-bottom:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.4rem;">
            <h3 style="margin:0;font-size:1.1rem;"><i class="fas fa-chart-line"></i> Timeseries Plot</h3>
            <div style="display:flex;gap:0.3rem;">
                <button class="btn btn-primary metric-btn" data-metric="temperature" style="padding:0.25rem 0.55rem;font-size:0.75rem;">Temp</button>
                <button class="btn btn-secondary metric-btn" data-metric="pressure" style="padding:0.25rem 0.55rem;font-size:0.75rem;">Pressure</button>
                <button class="btn btn-secondary metric-btn" data-metric="magnetometer" style="padding:0.25rem 0.55rem;font-size:0.75rem;">RoMAG |B|</button>
                <button class="btn btn-secondary metric-btn" data-metric="radiation" style="padding:0.25rem 0.55rem;font-size:0.75rem;">LND Dose</button>
            </div>
        </div>

        <div style="height:340px;position:relative;">
            <canvas id="climate-chart-canvas" style="width:100%;height:100%;"></canvas>
        </div>
    </div>
</div>

<script type="module">
import { ClimateDashboard } from "{{ '/assets/js/climate.js' | relative_url }}";

let climateDash = null;

async function init() {
    const res = await fetch("{{ '/assets/data/martian_climate_data.json' | relative_url }}");
    const data = await res.json();

    climateDash = new ClimateDashboard();
    climateDash.loadData(data);

    document.getElementById('climate-time-slider').addEventListener('input', (e) => {
        climateDash.setHourIndex(parseInt(e.target.value));
        climateDash.render();
    });

    const metricBtns = document.querySelectorAll('.metric-btn');
    metricBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            metricBtns.forEach(b => b.className = 'btn btn-secondary metric-btn');
            btn.className = 'btn btn-primary metric-btn';
            climateDash.setMetric(btn.getAttribute('data-metric'));
        });
    });
}

window.addEventListener('DOMContentLoaded', init);
</script>
