export class SpectroscopyLab {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.data = null;
    this.mode = 'reflectance'; // 'reflectance' or 'libs'
    this.activeSampleIds = new Set(['ce4_spa_regolith', 'ce5_young_basalt', 'lab_clinopyroxene', 'lab_olivine']);
    this.continuumRemoved = false;
    this.hoverPoint = null;

    this.onFeatureSelected = options.onFeatureSelected || (() => {});

    this.setupEvents();
  }

  loadData(spectralData) {
    this.data = spectralData;
    this.render();
  }

  setMode(m) {
    this.mode = m;
    this.hoverPoint = null;
    this.render();
  }

  toggleSample(sampleId) {
    if (this.activeSampleIds.has(sampleId)) {
      this.activeSampleIds.delete(sampleId);
    } else {
      this.activeSampleIds.add(sampleId);
    }
    this.render();
  }

  toggleContinuumRemoval(enabled) {
    this.continuumRemoved = enabled;
    this.render();
  }

  removeContinuum(wavelengths, spectrum) {
    // Upper convex hull continuum removal for VNIS/LMS Vis-NIR spectra
    const n = wavelengths.length;
    const continuum = new Array(n);
    
    // Fit linear continuum between anchor points (e.g. 700nm, 1550nm, 2600nm)
    const iStart = 0;
    const iMid = Math.floor(n * 0.45);
    const iEnd = n - 1;

    const slope1 = (spectrum[iMid] - spectrum[iStart]) / (wavelengths[iMid] - wavelengths[iStart]);
    const slope2 = (spectrum[iEnd] - spectrum[iMid]) / (wavelengths[iEnd] - wavelengths[iMid]);

    for (let i = 0; i < n; i++) {
      const wl = wavelengths[i];
      let contVal;
      if (i <= iMid) {
        contVal = spectrum[iStart] + slope1 * (wl - wavelengths[iStart]);
      } else {
        contVal = spectrum[iMid] + slope2 * (wl - wavelengths[iMid]);
      }
      continuum[i] = Math.max(contVal, spectrum[i]);
    }

    const norm = new Array(n);
    for (let i = 0; i < n; i++) {
      norm[i] = continuum[i] > 0 ? spectrum[i] / continuum[i] : 1.0;
    }
    return norm;
  }

  render() {
    if (!this.data) return;

    this.canvas.width = this.canvas.clientWidth || 800;
    this.canvas.height = this.canvas.clientHeight || 420;

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const padding = { left: 65, right: 35, top: 35, bottom: 45 };
    const plotW = cw - padding.left - padding.right;
    const plotH = ch - padding.top - padding.bottom;

    // Background
    this.ctx.fillStyle = '#070a12';
    this.ctx.fillRect(0, 0, cw, ch);

    if (this.mode === 'reflectance') {
      this.renderReflectance(padding, plotW, plotH);
    } else {
      this.renderLIBS(padding, plotW, plotH);
    }
  }

  renderReflectance(padding, plotW, plotH) {
    const specData = this.data.reflectance_spectra;
    const wavelengths = specData.wavelengths_nm;
    const minWl = wavelengths[0];
    const maxWl = wavelengths[wavelengths.length - 1];

    let minVal = 0.0;
    let maxVal = this.continuumRemoved ? 1.05 : 0.45;
    if (this.continuumRemoved) {
      minVal = 0.70;
    }

    // Grid & Axis
    this.drawGridAndAxes(
      padding, plotW, plotH,
      minWl, maxWl, minVal, maxVal,
      'Wavelength (nm)',
      this.continuumRemoved ? 'Normalized Reflectance (R / Rc)' : 'Absolute Reflectance Factor'
    );

    // Plot each active sample
    specData.samples.forEach(sample => {
      if (!this.activeSampleIds.has(sample.id)) return;

      const curve = this.continuumRemoved
        ? this.removeContinuum(wavelengths, sample.spectrum)
        : sample.spectrum;

      this.ctx.strokeStyle = sample.color;
      this.ctx.lineWidth = 2.2;
      this.ctx.beginPath();

      for (let i = 0; i < wavelengths.length; i++) {
        const x = padding.left + ((wavelengths[i] - minWl) / (maxWl - minWl)) * plotW;
        const y = padding.top + plotH - ((curve[i] - minVal) / (maxVal - minVal)) * plotH;

        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();

      // Draw feature pins
      if (sample.absorption_features) {
        sample.absorption_features.forEach(f => {
          const wl = f.center_nm;
          const idx = Math.min(wavelengths.length - 1, Math.max(0, Math.floor(((wl - minWl) / (maxWl - minWl)) * wavelengths.length)));
          const x = padding.left + ((wl - minWl) / (maxWl - minWl)) * plotW;
          const y = padding.top + plotH - ((curve[idx] - minVal) / (maxVal - minVal)) * plotH;

          // Pin marker
          this.ctx.fillStyle = sample.color;
          this.ctx.beginPath();
          this.ctx.arc(x, y, 4, 0, Math.PI * 2);
          this.ctx.fill();

          // Dotted drop line
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          this.ctx.lineWidth = 1;
          this.ctx.setLineDash([2, 3]);
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x, padding.top + plotH);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
        });
      }
    });
  }

  renderLIBS(padding, plotW, plotH) {
    const libsData = this.data.libs_spectra;
    const wavelengths = libsData.wavelengths_nm;
    const counts = libsData.counts;
    const lines = libsData.lines;

    const minWl = wavelengths[0];
    const maxWl = wavelengths[wavelengths.length - 1];
    const minVal = 0;
    const maxVal = 1400;

    this.drawGridAndAxes(
      padding, plotW, plotH,
      minWl, maxWl, minVal, maxVal,
      'Wavelength (nm) — MarSCoDe Spectrometer',
      'Photon Emission Intensity (Counts)'
    );

    // Draw LIBS spectrum line
    this.ctx.strokeStyle = '#00f2fe';
    this.ctx.lineWidth = 1.8;
    this.ctx.beginPath();

    for (let i = 0; i < wavelengths.length; i++) {
      const x = padding.left + ((wavelengths[i] - minWl) / (maxWl - minWl)) * plotW;
      const y = padding.top + plotH - ((counts[i] - minVal) / (maxVal - minVal)) * plotH;

      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();

    // Draw LIBS element peak labels
    lines.forEach(l => {
      const x = padding.left + ((l.wl - minWl) / (maxWl - minWl)) * plotW;
      const y = padding.top + plotH - ((l.intensity - minVal) / (maxVal - minVal)) * plotH;

      // Peak circle
      this.ctx.fillStyle = '#ffb703';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Peak label text
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(l.elem, x, y - 8);
    });
  }

  drawGridAndAxes(padding, plotW, plotH, minX, maxX, minY, maxY, xTitle, yTitle) {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(padding.left, padding.top, plotW, plotH);

    // Y Ticks
    const yTicks = 5;
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '11px -apple-system, sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    for (let i = 0; i <= yTicks; i++) {
      const frac = i / yTicks;
      const y = padding.top + plotH - frac * plotH;
      const val = (minY + frac * (maxY - minY)).toFixed(2);

      this.ctx.fillText(val, padding.left - 8, y);

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(padding.left + plotW, y);
      this.ctx.stroke();
    }

    // X Ticks
    const xTicks = 6;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';

    for (let i = 0; i <= xTicks; i++) {
      const frac = i / xTicks;
      const x = padding.left + frac * plotW;
      const val = Math.round(minX + frac * (maxX - minX));

      this.ctx.fillText(val, x, padding.top + plotH + 8);

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding.top);
      this.ctx.lineTo(x, padding.top + plotH);
      this.ctx.stroke();
    }

    // Axis Titles
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = '12px -apple-system, sans-serif';
    this.ctx.fillText(xTitle, padding.left + plotW / 2, padding.top + plotH + 26);

    this.ctx.save();
    this.ctx.translate(16, padding.top + plotH / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText(yTitle, 0, 0);
    this.ctx.restore();
  }

  setupEvents() {
    window.addEventListener('resize', () => this.render());
  }
}
