---
layout: default
title: "Home"
---

<div class="hero">
    <h1>CLPDS Planetary Exploration Data Visualization Suite</h1>
    <p>A FAIR-compliant planetary data science and interactive WebGL visualization platform for <strong>China's Lunar and Planetary Data Release System (CLPDS)</strong>. Explore in-situ observations, subsurface radar stratigraphy, mineralogical spectroscopy, and planetary environmental timeseries across seven lunar and Martian exploration missions.</p>
    <div class="hero-buttons">
        <a href="{{ site.baseurl }}/globe/" class="btn btn-primary"><i class="fas fa-globe"></i> 3D Planetary Globe</a>
        <a href="{{ site.baseurl }}/radar/" class="btn btn-secondary"><i class="fas fa-satellite-dish"></i> Subsurface Radargram</a>
        <a href="{{ site.baseurl }}/spectroscopy/" class="btn btn-secondary"><i class="fas fa-atom"></i> Spectroscopy Lab</a>
        <a href="{{ site.baseurl }}/publications/" class="btn btn-secondary"><i class="fas fa-file-pdf"></i> Manuscript & Citation</a>
    </div>
</div>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-value">7 Missions</div>
        <div class="stat-label">Chang'e-1 to 6 & Tianwen-1</div>
    </div>
    <div class="stat-card">
        <div class="stat-value">3,666.3 g</div>
        <div class="stat-label">Returned Lunar Samples (CE-5 & 6)</div>
    </div>
    <div class="stat-card">
        <div class="stat-value">2 Farside Sites</div>
        <div class="stat-label">Von Kármán (CE-4) & Apollo Basin (CE-6)</div>
    </div>
    <div class="stat-card">
        <div class="stat-value">1,921 m</div>
        <div class="stat-label">Zhurong Mars Rover Traverse</div>
    </div>
</div>

<div class="card">
    <h2><i class="fas fa-compass"></i> Scientific Overview & Mission Scope</h2>
    <p>The <a href="https://clpds.bao.ac.cn/HomeList?type=1" target="_blank" style="color:var(--accent-cyan);">Lunar and Planetary Data Release System (CLPDS)</a>, hosted by the National Astronomical Observatories of the Chinese Academy of Sciences (NAOC) and China National Space Administration (CNSA), archives scientific data from China's deep space exploration program.</p>
    
    <p>Our visualization suite standardizes and visualizes data across five core domains:</p>
    
    <div class="table-responsive">
        <table>
            <thead>
                <tr>
                    <th>Mission</th>
                    <th>Target & Vehicle</th>
                    <th>Primary Payloads</th>
                    <th>Key Scientific Discoveries</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Chang'e-1 & 2</strong></td>
                    <td>Moon (Orbiters)</td>
                    <td>CCD Camera, LAM Laser, CELMS Radiometer</td>
                    <td>Global 120m/7m mosaics; 3D DEM; first global microwave regolith inventory; Toutatis asteroid flyby (1.3m).</td>
                </tr>
                <tr>
                    <td><strong>Chang'e-3</strong></td>
                    <td>Moon (Mare Imbrium Lander & <em>Yutu</em> Rover)</td>
                    <td>LPR (60/500 MHz), VNIS, APXS, LUT, EUVC</td>
                    <td>New high-iron/intermediate-Ti basalt classification; radar stratigraphy of episodic volcanic flows down to 400m.</td>
                </tr>
                <tr>
                    <td><strong>Chang'e-4</strong></td>
                    <td>Moon Farside (Von Kármán Lander & <em>Yutu-2</em>)</td>
                    <td>LPR (500 MHz), VNIS, LND (Kiel), ASAN (IRF)</td>
                    <td>First farside landing in history; identified mantle-derived low-Ca pyroxenes/olivines; ~40m Finsen crater ejecta profiling.</td>
                </tr>
                <tr>
                    <td><strong>Chang'e-5</strong></td>
                    <td>Moon (Mons Rümker Sample Return)</td>
                    <td>LMS (0.48–3.2 µm), LRPR (2 GHz), PCAM</td>
                    <td>Returned 1,731g of 2.0 Ga youngest lunar basalts; in-situ spectral detection of indigenous water/OH at 2.85 µm.</td>
                </tr>
                <tr>
                    <td><strong>Chang'e-6</strong></td>
                    <td>Moon Farside (Apollo Basin Sample Return)</td>
                    <td>LMS, LRPR, DORN (Radon), NILS (Negative Ions)</td>
                    <td>World's first lunar farside sample return (1,935.3g); discovered low-Ti, KREEP-depleted ancient basalt mantle sources.</td>
                </tr>
                <tr>
                    <td><strong>Tianwen-1</strong></td>
                    <td>Mars (Orbiter & <em>Zhurong</em> Rover)</td>
                    <td>RoRAD (15–35 MHz), MarSCoDe (LIBS), RoMAG, MCS</td>
                    <td>Subsurface multi-layered paleoflood stratigraphy down to 80m; hydrated sulfate duricrust; diurnal boundary layer weather.</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<div class="card">
    <h2><i class="fas fa-cubes"></i> Interactive Modules in this Suite</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1.25rem;">
        <div class="stat-card" style="text-align:left;">
            <h3 style="color:var(--accent-cyan);margin-top:0;"><i class="fas fa-globe"></i> 1. 3D Planetary Globe</h3>
            <p style="font-size:0.85rem;color:var(--text-muted);">Interactive 3D Moon and Mars spheres with precision landing markers, rover traverse splines, and camera fly-to animations.</p>
            <a href="{{ site.baseurl }}/globe/" class="btn btn-secondary" style="margin-top:0.5rem;font-size:0.8rem;">Launch Globe &rarr;</a>
        </div>
        <div class="stat-card" style="text-align:left;">
            <h3 style="color:var(--accent-cyan);margin-top:0;"><i class="fas fa-satellite-dish"></i> 2. Radargram (GPR) Studio</h3>
            <p style="font-size:0.85rem;color:var(--text-muted);">Interactive 2D B-scan echograms for Chang'e-4 LPR & Zhurong RoRAD with dynamic permittivity (&epsilon;<sub>r</sub>) velocity/depth scaling.</p>
            <a href="{{ site.baseurl }}/radar/" class="btn btn-secondary" style="margin-top:0.5rem;font-size:0.8rem;">Launch Radar &rarr;</a>
        </div>
        <div class="stat-card" style="text-align:left;">
            <h3 style="color:var(--accent-cyan);margin-top:0;"><i class="fas fa-atom"></i> 3. Spectroscopy Lab</h3>
            <p style="font-size:0.85rem;color:var(--text-muted);">Vis-NIR reflectance with continuum removal & water detection (2.85 &mu;m) alongside MarSCoDe LIBS laser atomic emission lines.</p>
            <a href="{{ site.baseurl }}/spectroscopy/" class="btn btn-secondary" style="margin-top:0.5rem;font-size:0.8rem;">Launch Lab &rarr;</a>
        </div>
        <div class="stat-card" style="text-align:left;">
            <h3 style="color:var(--accent-cyan);margin-top:0;"><i class="fas fa-cloud-sun"></i> 4. Weather & Geophysics</h3>
            <p style="font-size:0.85rem;color:var(--text-muted);">Diurnal Mars boundary layer temperature, pressure, rotating wind compass, RoMAG magnetic anomalies, and lunar radiation.</p>
            <a href="{{ site.baseurl }}/climate/" class="btn btn-secondary" style="margin-top:0.5rem;font-size:0.8rem;">Launch Weather &rarr;</a>
        </div>
    </div>
</div>
