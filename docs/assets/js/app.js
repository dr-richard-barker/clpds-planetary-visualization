import { PlanetaryGlobe } from './globe.js';
import { RadargramViewer } from './radargram.js';
import { SpectroscopyLab } from './spectroscopy.js';
import { ClimateDashboard } from './climate.js';

class CLPDSApp {
  constructor() {
    this.globe = null;
    this.radargram = null;
    this.spectroscopy = null;
    this.climate = null;

    this.datasets = {};
    this.init();
  }

  async init() {
    this.setupTabs();
    await this.loadAllData();
    this.initGlobe();
    this.initRadargram();
    this.initSpectroscopy();
    this.initClimate();
    this.populateCatalog();
  }

  setupTabs() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        navButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(targetTab);
        if (activePane) activePane.classList.add('active');

        // Trigger redraws for canvas modules when entering tabs
        if (targetTab === 'tab-radargram' && this.radargram) {
          setTimeout(() => this.radargram.render(), 50);
        } else if (targetTab === 'tab-spectroscopy' && this.spectroscopy) {
          setTimeout(() => this.spectroscopy.render(), 50);
        } else if (targetTab === 'tab-climate' && this.climate) {
          setTimeout(() => this.climate.render(), 50);
        }
      });
    });
  }

  async loadAllData() {
    try {
      const [missions, sites, radargrams, spectra, climate] = await Promise.all([
        fetch('./assets/data/missions_metadata.json').then(r => r.json()),
        fetch('./assets/data/landing_sites_traverses.json').then(r => r.json()),
        fetch('./assets/data/radargram_data.json').then(r => r.json()),
        fetch('./assets/data/spectral_library_data.json').then(r => r.json()),
        fetch('./assets/data/martian_climate_data.json').then(r => r.json())
      ]);

      this.datasets = { missions, sites, radargrams, spectra, climate };
    } catch (err) {
      console.error('Failed to load CLPDS datasets:', err);
    }
  }

  initGlobe() {
    this.globe = new PlanetaryGlobe('globe-canvas-container', {
      onSiteSelected: (site) => this.displaySiteDetails(site)
    });

    if (this.datasets.sites) {
      this.globe.setSitesData(this.datasets.sites);
      // Select first site (Chang'e-4)
      const defaultSite = this.datasets.sites.find(s => s.id === 'CE-4');
      if (defaultSite) {
        this.displaySiteDetails(defaultSite);
      }
    }

    // Body toggle buttons
    const btnMoon = document.getElementById('btn-body-moon');
    const btnMars = document.getElementById('btn-body-mars');

    if (btnMoon && btnMars) {
      btnMoon.addEventListener('click', () => {
        btnMoon.classList.add('active');
        btnMars.classList.remove('active', 'mars');
        this.globe.switchBody('Moon');
        this.updateSitePills('Moon');
      });

      btnMars.addEventListener('click', () => {
        btnMars.classList.add('active', 'mars');
        btnMoon.classList.remove('active');
        this.globe.switchBody('Mars');
        this.updateSitePills('Mars');
      });
    }

    this.updateSitePills('Moon');
  }

  updateSitePills(body) {
    const container = document.getElementById('globe-site-pills');
    if (!container || !this.datasets.sites) return;

    container.innerHTML = '';
    const filtered = this.datasets.sites.filter(s => s.body === body);

    filtered.forEach(site => {
      const pill = document.createElement('button');
      pill.className = 'site-pill';
      pill.innerText = `${site.id} (${site.mission})`;
      pill.addEventListener('click', () => {
        document.querySelectorAll('.site-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.globe.flyToSite(site.id);
      });
      container.appendChild(pill);
    });
  }

  displaySiteDetails(site) {
    const elName = document.getElementById('site-hero-name');
    const elTag = document.getElementById('site-hero-tag');
    const elRegion = document.getElementById('site-hero-region');
    const elHighlight = document.getElementById('site-hero-highlight');
    const elCoords = document.getElementById('site-hero-coords');
    const elElev = document.getElementById('site-hero-elev');
    const elYear = document.getElementById('site-hero-year');
    const wpContainer = document.getElementById('site-waypoints-list');

    if (elName) elName.innerText = `${site.mission} — ${site.vehicle}`;
    if (elTag) {
      elTag.innerText = site.body;
      elTag.className = `mission-tag ${site.body === 'Moon' ? 'tag-moon' : 'tag-mars'}`;
    }
    if (elRegion) elRegion.innerText = site.region;
    if (elHighlight) elHighlight.innerText = site.highlight;
    if (elCoords) elCoords.innerText = `${site.lat > 0 ? site.lat + '°N' : Math.abs(site.lat) + '°S'}, ${site.lon > 0 ? site.lon + '°E' : Math.abs(site.lon) + '°W'}`;
    if (elElev) elElev.innerText = `${site.elevation_m} m`;
    if (elYear) elYear.innerText = site.year;

    if (wpContainer) {
      wpContainer.innerHTML = '';
      if (site.traverse_waypoints && site.traverse_waypoints.length > 0) {
        site.traverse_waypoints.forEach(wp => {
          const item = document.createElement('div');
          item.className = 'waypoint-item';
          item.innerHTML = `
            <div>
              <strong>${wp.name}</strong>
              <div style="font-size:0.72rem;color:#94a3b8;">${wp.target}</div>
            </div>
            <div style="text-align:right;font-family:var(--font-mono);font-size:0.75rem;">
              <div>${wp.dist_m} m</div>
              <div style="color:var(--accent-cyan);">${wp.day ? 'Day ' + wp.day : 'Sol ' + wp.sol}</div>
            </div>
          `;
          wpContainer.appendChild(item);
        });
      } else {
        wpContainer.innerHTML = '<div style="font-size:0.8rem;color:#64748b;padding:0.5rem;">Stationary Lander (No Rover Traverse)</div>';
      }
    }
  }

  initRadargram() {
    this.radargram = new RadargramViewer('radargram-canvas', {
      onInfoUpdate: (info) => {
        const readout = document.getElementById('radar-live-readout');
        if (readout) {
          readout.innerHTML = `
            <span>Trace: <strong>#${info.trace}</strong> (${info.distance} m)</span> |
            <span>Time: <strong>${info.time.toFixed(1)} ns</strong></span> |
            <span>Depth: <strong style="color:var(--accent-cyan)">${info.depth} m</strong></span> |
            <span>Layer: <strong style="color:var(--accent-gold)">${info.layer}</strong></span>
          `;
        }
      }
    });

    if (this.datasets.radargrams) {
      this.radargram.loadData(this.datasets.radargrams);
      this.updateRadarLayerList('lunar_change_4');
    }

    // Dataset switch
    const selMission = document.getElementById('radar-mission-select');
    if (selMission) {
      selMission.addEventListener('change', (e) => {
        const key = e.target.value;
        this.radargram.setDataset(key);
        this.updateRadarLayerList(key);
      });
    }

    // Colormap switch
    const selCmap = document.getElementById('radar-cmap-select');
    if (selCmap) {
      selCmap.addEventListener('change', (e) => this.radargram.setColormap(e.target.value));
    }

    // Gain slider
    const slGain = document.getElementById('radar-gain-slider');
    if (slGain) {
      slGain.addEventListener('input', (e) => {
        document.getElementById('radar-gain-val').innerText = `${e.target.value}x`;
        this.radargram.setGain(e.target.value);
      });
    }

    // Dielectric slider
    const slEps = document.getElementById('radar-eps-slider');
    if (slEps) {
      slEps.addEventListener('input', (e) => {
        document.getElementById('radar-eps-val').innerText = e.target.value;
        this.radargram.setEpsilon(e.target.value);
      });
    }

    // Toggle layers checkbox
    const chkLayers = document.getElementById('radar-toggle-layers');
    if (chkLayers) {
      chkLayers.addEventListener('change', (e) => this.radargram.toggleLayers(e.target.checked));
    }
  }

  updateRadarLayerList(datasetKey) {
    const listContainer = document.getElementById('radar-layers-list');
    if (!listContainer || !this.datasets.radargrams) return;

    listContainer.innerHTML = '';
    const ds = this.datasets.radargrams[datasetKey];

    if (ds.layers) {
      ds.layers.forEach(l => {
        const card = document.createElement('div');
        card.className = 'layer-card';
        card.innerHTML = `
          <div style="font-weight:700;color:var(--accent-cyan);margin-bottom:0.2rem;">${l.name}</div>
          <div style="font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem;">Depth: ${l.depth_range_m[0]} - ${l.depth_range_m[1]} m | εᵣ: ${l.dielectric_permittivity}</div>
          <div style="font-size:0.75rem;color:#cbd5e1;">${l.description}</div>
        `;
        card.addEventListener('mouseenter', () => this.radargram.highlightLayer(l.id));
        card.addEventListener('mouseleave', () => this.radargram.highlightLayer(null));
        listContainer.appendChild(card);
      });
    }
  }

  initSpectroscopy() {
    this.spectroscopy = new SpectroscopyLab('spectroscopy-canvas');
    if (this.datasets.spectra) {
      this.spectroscopy.loadData(this.datasets.spectra);
      this.populateSpectralLegends();
    }

    // Mode Toggle (Reflectance vs LIBS)
    const btnRefl = document.getElementById('btn-spec-refl');
    const btnLibs = document.getElementById('btn-spec-libs');
    const crToggleWrapper = document.getElementById('spec-cr-wrapper');

    if (btnRefl && btnLibs) {
      btnRefl.addEventListener('click', () => {
        btnRefl.classList.add('active');
        btnLibs.classList.remove('active');
        if (crToggleWrapper) crToggleWrapper.style.display = 'flex';
        this.spectroscopy.setMode('reflectance');
        this.populateSpectralLegends();
      });

      btnLibs.addEventListener('click', () => {
        btnLibs.classList.add('active');
        btnRefl.classList.remove('active');
        if (crToggleWrapper) crToggleWrapper.style.display = 'none';
        this.spectroscopy.setMode('libs');
        this.populateSpectralLegends();
      });
    }

    // Continuum removal checkbox
    const chkCR = document.getElementById('spec-continuum-chk');
    if (chkCR) {
      chkCR.addEventListener('change', (e) => this.spectroscopy.toggleContinuumRemoval(e.target.checked));
    }
  }

  populateSpectralLegends() {
    const legendContainer = document.getElementById('spec-sample-toggles');
    const featuresContainer = document.getElementById('spec-features-list');
    if (!legendContainer || !this.datasets.spectra) return;

    legendContainer.innerHTML = '';
    if (featuresContainer) featuresContainer.innerHTML = '';

    if (this.spectroscopy.mode === 'reflectance') {
      const samples = this.datasets.spectra.reflectance_spectra.samples;
      samples.forEach(s => {
        const item = document.createElement('div');
        item.className = 'spec-legend-item';
        const isActive = this.spectroscopy.activeSampleIds.has(s.id);
        item.style.opacity = isActive ? '1.0' : '0.4';

        item.innerHTML = `
          <div class="color-dot" style="background:${s.color}"></div>
          <span>${s.name}</span>
        `;
        item.addEventListener('click', () => {
          this.spectroscopy.toggleSample(s.id);
          this.populateSpectralLegends();
        });
        legendContainer.appendChild(item);

        // Add feature annotations if active
        if (isActive && s.absorption_features && featuresContainer) {
          s.absorption_features.forEach(f => {
            const featCard = document.createElement('div');
            featCard.className = 'feature-badge';
            featCard.innerHTML = `
              <div class="f-title">${f.band} (~${f.center_nm} nm)</div>
              <div style="font-size:0.75rem;color:var(--text-secondary);">${s.name}</div>
              <div style="font-size:0.75rem;color:#cbd5e1;margin-top:0.2rem;">${f.description}</div>
            `;
            featuresContainer.appendChild(featCard);
          });
        }
      });
    } else {
      const libs = this.datasets.spectra.libs_spectra;
      legendContainer.innerHTML = `<div style="font-size:0.82rem;color:var(--accent-cyan);">Active Target: <strong>${libs.target}</strong> (${libs.lines.length} Element Transition Lines)</div>`;

      if (featuresContainer) {
        libs.lines.forEach(l => {
          const featCard = document.createElement('div');
          featCard.className = 'feature-badge';
          featCard.innerHTML = `
            <div class="f-title" style="color:var(--accent-cyan);">${l.elem} Line (${l.wl} nm)</div>
            <div style="font-size:0.75rem;color:#94a3b8;">Emission Intensity: ${l.intensity} counts | FWHM: ${l.fwhm} nm</div>
          `;
          featuresContainer.appendChild(featCard);
        });
      }
    }
  }

  initClimate() {
    this.climate = new ClimateDashboard();
    if (this.datasets.climate) {
      this.climate.loadData(this.datasets.climate);
    }

    const slider = document.getElementById('climate-time-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.climate.setHourIndex(parseInt(e.target.value));
        this.climate.render();
      });
    }

    // Metric selector buttons
    const metricBtns = document.querySelectorAll('.climate-metric-btn');
    metricBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        metricBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const metric = btn.getAttribute('data-metric');
        this.climate.setMetric(metric);
      });
    });
  }

  populateCatalog() {
    const grid = document.getElementById('mission-catalog-grid');
    if (!grid || !this.datasets.missions) return;

    grid.innerHTML = '';
    Object.values(this.datasets.missions).forEach(m => {
      const card = document.createElement('div');
      card.className = 'mission-catalog-card';

      const instBadges = m.instruments
        ? m.instruments.map(i => `<span class="inst-pill">${i.acronym}</span>`).join('')
        : '';

      const discList = m.key_discoveries
        ? m.key_discoveries.map(d => `<li style="margin-bottom:0.25rem;">${d}</li>`).join('')
        : '';

      card.innerHTML = `
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
            <h3 style="font-size:1.1rem;color:#f8fafc;">${m.name}</h3>
            <span class="mission-tag ${m.target.includes('Moon') ? 'tag-moon' : 'tag-mars'}">${m.type}</span>
          </div>
          <div style="font-size:0.75rem;color:var(--accent-cyan);font-family:var(--font-mono);margin-bottom:0.5rem;">
            Launch: ${m.launch_date} | Target: ${m.target}
          </div>
          <p style="font-size:0.8rem;color:#94a3b8;margin-bottom:0.6rem;">${m.primary_objectives}</p>
          <div style="font-size:0.75rem;font-weight:700;color:#cbd5e1;margin-bottom:0.3rem;">Payload Suite:</div>
          <div class="instrument-pill-group">${instBadges}</div>
        </div>
        <div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid rgba(255,255,255,0.08);">
          <div style="font-size:0.75rem;font-weight:700;color:var(--accent-gold);margin-bottom:0.3rem;">Key Discoveries:</div>
          <ul style="font-size:0.75rem;color:#cbd5e1;padding-left:1.1rem;">${discList}</ul>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new CLPDSApp();
});
