export class RadargramViewer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.data = null;
    this.currentKey = 'lunar_change_4'; // 'lunar_change_4' or 'mars_zhurong'
    this.colormap = 'seismic'; // 'seismic', 'grayscale', 'viridis', 'magma', 'cyan'
    this.gain = 1.6;
    this.customEpsilon = null;
    this.showLayers = true;
    this.activeLayerId = null;

    this.onInfoUpdate = options.onInfoUpdate || (() => {});

    this.setupEvents();
  }

  loadData(radargramData) {
    this.data = radargramData;
    this.customEpsilon = this.data[this.currentKey].default_dielectric_constant;
    this.render();
  }

  setDataset(key) {
    if (!this.data || !this.data[key]) return;
    this.currentKey = key;
    this.customEpsilon = this.data[key].default_dielectric_constant;
    this.activeLayerId = null;
    this.render();
  }

  setColormap(cmap) {
    this.colormap = cmap;
    this.render();
  }

  setGain(val) {
    this.gain = parseFloat(val);
    this.render();
  }

  setEpsilon(val) {
    this.customEpsilon = parseFloat(val);
    this.render();
  }

  toggleLayers(show) {
    this.showLayers = show;
    this.render();
  }

  highlightLayer(layerId) {
    this.activeLayerId = layerId;
    this.render();
  }

  getColor(val, cmap) {
    // val is in [-1, 1] amplified by gain
    const clamped = Math.max(-1.0, Math.min(1.0, val * this.gain));
    const norm = (clamped + 1.0) / 2.0; // [0, 1]

    if (cmap === 'grayscale') {
      const g = Math.floor(norm * 255);
      return [g, g, g];
    } else if (cmap === 'seismic') {
      // Negative: Deep Blue -> Light Blue -> White (0) -> Light Red -> Deep Red
      if (clamped < 0) {
        const t = (clamped + 1.0); // 0 to 1
        const r = Math.floor(t * 255);
        const g = Math.floor(t * 255);
        const b = 255;
        return [r, g, b];
      } else {
        const t = clamped; // 0 to 1
        const r = 255;
        const g = Math.floor((1 - t) * 255);
        const b = Math.floor((1 - t) * 255);
        return [r, g, b];
      }
    } else if (cmap === 'viridis') {
      // Approx viridis
      const r = Math.floor(255 * Math.sin(norm * Math.PI * 0.9));
      const g = Math.floor(255 * Math.sin(norm * Math.PI * 0.7 + 0.2));
      const b = Math.floor(255 * Math.cos(norm * Math.PI * 0.5));
      return [r, g, b];
    } else if (cmap === 'magma') {
      // Purple -> Orange -> Yellow
      const r = Math.floor(255 * Math.pow(norm, 0.7));
      const g = Math.floor(200 * Math.pow(norm, 1.8));
      const b = Math.floor(255 * (1 - norm) * Math.sin(norm * Math.PI));
      return [r, g, b];
    } else {
      // Cyan Glow
      const r = Math.floor(20 + 80 * norm);
      const g = Math.floor(180 * norm + 75 * norm * norm);
      const b = Math.floor(255 * norm);
      return [r, g, b];
    }
  }

  render() {
    if (!this.data || !this.data[this.currentKey]) return;

    const dataset = this.data[this.currentKey];
    const matrix = dataset.matrix;
    const nSamples = matrix.length;
    const nTraces = matrix[0].length;

    // Resize canvas internal buffer
    this.canvas.width = this.canvas.clientWidth || 800;
    this.canvas.height = this.canvas.clientHeight || 480;

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    const padding = { left: 70, right: 30, top: 40, bottom: 45 };
    const plotW = cw - padding.left - padding.right;
    const plotH = ch - padding.top - padding.bottom;

    // Background
    this.ctx.fillStyle = '#05070d';
    this.ctx.fillRect(0, 0, cw, ch);

    // Create Offscreen Image Data for matrix
    const imgData = this.ctx.createImageData(nTraces, nSamples);
    const buf = imgData.data;

    for (let r = 0; r < nSamples; r++) {
      for (let c = 0; c < nTraces; c++) {
        const val = matrix[r][c];
        const [red, green, blue] = this.getColor(val, this.colormap);
        const idx = (r * nTraces + c) * 4;
        buf[idx] = red;
        buf[idx + 1] = green;
        buf[idx + 2] = blue;
        buf[idx + 3] = 255;
      }
    }

    // Draw rescaled matrix
    const offCanvas = document.createElement('canvas');
    offCanvas.width = nTraces;
    offCanvas.height = nSamples;
    const offCtx = offCanvas.getContext('2d');
    offCtx.putImageData(imgData, 0, 0);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(offCanvas, padding.left, padding.top, plotW, plotH);

    // Draw Axes & Grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(padding.left, padding.top, plotW, plotH);

    // Calculate dynamic depth based on current epsilon
    const eps = this.customEpsilon || dataset.default_dielectric_constant;
    const v = 0.299792458 / Math.sqrt(eps); // m/ns
    const maxTime = dataset.time_ns[dataset.time_ns.length - 1];
    const maxDepth = (maxTime * v) / 2.0;
    const maxDist = dataset.distance_m[dataset.distance_m.length - 1];

    // Axis Labels & Ticks
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '11px -apple-system, sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    // Left Y Axis: Depth (m) & Time (ns)
    const yTicks = 6;
    for (let i = 0; i <= yTicks; i++) {
      const frac = i / yTicks;
      const y = padding.top + frac * plotH;
      const dVal = (frac * maxDepth).toFixed(1);
      const tVal = Math.round(frac * maxTime);

      this.ctx.fillText(`${dVal} m`, padding.left - 8, y);
      
      // Grid line
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(padding.left + plotW, y);
      this.ctx.stroke();
    }

    // Bottom X Axis: Traverse Distance (m)
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    const xTicks = 8;
    for (let i = 0; i <= xTicks; i++) {
      const frac = i / xTicks;
      const x = padding.left + frac * plotW;
      const distVal = (frac * maxDist).toFixed(0);

      this.ctx.fillText(`${distVal} m`, x, padding.top + plotH + 8);
    }

    // Axis Titles
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = '12px -apple-system, sans-serif';
    this.ctx.fillText(`Traverse Distance (m) — ${nTraces} Traces`, padding.left + plotW / 2, padding.top + plotH + 28);

    this.ctx.save();
    this.ctx.translate(16, padding.top + plotH / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText(`Apparent Depth (m) [εᵣ = ${eps.toFixed(1)}, v = ${v.toFixed(3)} m/ns]`, 0, 0);
    this.ctx.restore();

    // Draw Geological Layer Annotations
    if (this.showLayers && dataset.layers) {
      dataset.layers.forEach(l => {
        const [dMin, dMax] = l.depth_range_m;
        const y1 = padding.top + (dMin / maxDepth) * plotH;
        const y2 = padding.top + (dMax / maxDepth) * plotH;

        const isHighlight = this.activeLayerId === l.id;

        this.ctx.strokeStyle = isHighlight ? '#00f2fe' : 'rgba(0, 242, 254, 0.45)';
        this.ctx.lineWidth = isHighlight ? 2 : 1;
        this.ctx.setLineDash([4, 4]);

        this.ctx.beginPath();
        this.ctx.moveTo(padding.left, y1);
        this.ctx.lineTo(padding.left + plotW, y1);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(padding.left, y2);
        this.ctx.lineTo(padding.left + plotW, y2);
        this.ctx.stroke();

        this.ctx.setLineDash([]);

        // Layer Label Box
        if (y1 < padding.top + plotH) {
          this.ctx.fillStyle = isHighlight ? 'rgba(0, 242, 254, 0.85)' : 'rgba(15, 23, 42, 0.8)';
          this.ctx.fillRect(padding.left + 8, y1 + 4, 180, 18);
          this.ctx.fillStyle = isHighlight ? '#050811' : '#00f2fe';
          this.ctx.font = '10px -apple-system, sans-serif';
          this.ctx.textAlign = 'left';
          this.ctx.fillText(l.name.substring(0, 28), padding.left + 12, y1 + 16);
        }
      });
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => this.render());

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.data || !this.data[this.currentKey]) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const padding = { left: 70, right: 30, top: 40, bottom: 45 };
      const plotW = this.canvas.width - padding.left - padding.right;
      const plotH = this.canvas.height - padding.top - padding.bottom;

      if (
        mouseX >= padding.left &&
        mouseX <= padding.left + plotW &&
        mouseY >= padding.top &&
        mouseY <= padding.top + plotH
      ) {
        const dataset = this.data[this.currentKey];
        const nTraces = dataset.traces_count;
        const nSamples = dataset.matrix.length;

        const traceFrac = (mouseX - padding.left) / plotW;
        const sampleFrac = (mouseY - padding.top) / plotH;

        const traceIdx = Math.min(nTraces - 1, Math.floor(traceFrac * nTraces));
        const sampleIdx = Math.min(nSamples - 1, Math.floor(sampleFrac * nSamples));

        const distM = dataset.distance_m[traceIdx];
        const timeNs = dataset.time_ns[sampleIdx];
        const eps = this.customEpsilon || dataset.default_dielectric_constant;
        const v = 0.299792458 / Math.sqrt(eps);
        const depthM = (timeNs * v) / 2.0;
        const amp = dataset.matrix[sampleIdx][traceIdx];

        // Find active layer
        let currentLayer = 'Bedrock / Unclassified';
        if (dataset.layers) {
          dataset.layers.forEach(l => {
            if (depthM >= l.depth_range_m[0] && depthM <= l.depth_range_m[1]) {
              currentLayer = l.name;
            }
          });
        }

        this.onInfoUpdate({
          trace: traceIdx,
          distance: distM,
          time: timeNs,
          depth: depthM.toFixed(2),
          amplitude: amp,
          layer: currentLayer,
          mouseX,
          mouseY
        });
      }
    });
  }
}
