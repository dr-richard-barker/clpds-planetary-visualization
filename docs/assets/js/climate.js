export class ClimateDashboard {
  constructor(options = {}) {
    this.data = null;
    this.currentHourIndex = 48; // default to noon (12:00 LTST)
    this.activeMetric = 'temperature'; // 'temperature', 'pressure', 'magnetometer', 'radiation'
  }

  loadData(climateData) {
    this.data = climateData;
    this.render();
  }

  setHourIndex(idx) {
    this.currentHourIndex = idx;
    this.updateLiveReadouts();
  }

  setMetric(metric) {
    this.activeMetric = metric;
    this.render();
  }

  updateLiveReadouts() {
    if (!this.data) return;

    const diurnal = this.data.diurnal_cycle_sol_100;
    const h = diurnal.ltst_hours[this.currentHourIndex];
    const tAir = diurnal.air_temp_c[this.currentHourIndex];
    const tGnd = diurnal.ground_temp_c[this.currentHourIndex];
    const pres = diurnal.pressure_pa[this.currentHourIndex];
    const wSpeed = diurnal.wind_speed_ms[this.currentHourIndex];
    const wDir = diurnal.wind_direction_deg[this.currentHourIndex];

    const elTime = document.getElementById('climate-live-time');
    const elAir = document.getElementById('climate-live-tair');
    const elGnd = document.getElementById('climate-live-tgnd');
    const elPres = document.getElementById('climate-live-pres');
    const elWind = document.getElementById('climate-live-wind');
    const elNeedle = document.getElementById('compass-needle');

    if (elTime) elTime.innerText = `${Math.floor(h).toString().padStart(2, '0')}:${Math.floor((h % 1) * 60).toString().padStart(2, '0')} LTST`;
    if (elAir) elAir.innerText = `${tAir.toFixed(1)} °C`;
    if (elGnd) elGnd.innerText = `${tGnd.toFixed(1)} °C`;
    if (elPres) elPres.innerText = `${pres.toFixed(1)} Pa`;
    if (elWind) elWind.innerText = `${wSpeed.toFixed(1)} m/s (${wDir.toFixed(0)}°)`;
    if (elNeedle) elNeedle.style.transform = `rotate(${wDir}deg)`;
  }

  render() {
    if (!this.data) return;
    this.updateLiveReadouts();
    this.renderChart('climate-chart-canvas');
  }

  renderChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth || 800;
    canvas.height = canvas.clientHeight || 340;

    const cw = canvas.width;
    const ch = canvas.height;
    const padding = { left: 65, right: 35, top: 30, bottom: 45 };
    const plotW = cw - padding.left - padding.right;
    const plotH = ch - padding.top - padding.bottom;

    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, cw, ch);

    if (this.activeMetric === 'temperature') {
      this.plotTemperature(ctx, padding, plotW, plotH);
    } else if (this.activeMetric === 'pressure') {
      this.plotPressure(ctx, padding, plotW, plotH);
    } else if (this.activeMetric === 'magnetometer') {
      this.plotMagnetometer(ctx, padding, plotW, plotH);
    } else {
      this.plotRadiation(ctx, padding, plotW, plotH);
    }
  }

  plotTemperature(ctx, padding, plotW, plotH) {
    const d = this.data.diurnal_cycle_sol_100;
    const xVals = d.ltst_hours;
    const yAir = d.air_temp_c;
    const yGnd = d.ground_temp_c;

    const minY = -90;
    const maxY = 0;

    this.drawAxes(ctx, padding, plotW, plotH, 0, 24, minY, maxY, 'Local True Solar Time (Hours)', 'Temperature (°C)');

    // Plot Ground Temp (Red-Orange)
    ctx.strokeStyle = '#e76f51';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < xVals.length; i++) {
      const x = padding.left + (xVals[i] / 24.0) * plotW;
      const y = padding.top + plotH - ((yGnd[i] - minY) / (maxY - minY)) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Plot Air Temp (Cyan)
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < xVals.length; i++) {
      const x = padding.left + (xVals[i] / 24.0) * plotW;
      const y = padding.top + plotH - ((yAir[i] - minY) / (maxY - minY)) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Active time indicator line
    const curX = padding.left + (xVals[this.currentHourIndex] / 24.0) * plotW;
    ctx.strokeStyle = '#ffb703';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(curX, padding.top);
    ctx.lineTo(curX, padding.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  plotPressure(ctx, padding, plotW, plotH) {
    const d = this.data.diurnal_cycle_sol_100;
    const xVals = d.ltst_hours;
    const yPres = d.pressure_pa;

    const minY = 740;
    const maxY = 800;

    this.drawAxes(ctx, padding, plotW, plotH, 0, 24, minY, maxY, 'Local True Solar Time (Hours)', 'Atmospheric Pressure (Pa)');

    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < xVals.length; i++) {
      const x = padding.left + (xVals[i] / 24.0) * plotW;
      const y = padding.top + plotH - ((yPres[i] - minY) / (maxY - minY)) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  plotMagnetometer(ctx, padding, plotW, plotH) {
    const mag = this.data.romag_mars_surface_magnetic_field;
    const dist = mag.traverse_distance_m;
    const bTot = mag.b_magnitude_nt;

    const minY = 80;
    const maxY = 180;
    const maxDist = dist[dist.length - 1];

    this.drawAxes(ctx, padding, plotW, plotH, 0, maxDist, minY, maxY, 'Zhurong Rover Traverse Distance (m)', '|B| Magnetic Field (nT)');

    ctx.strokeStyle = '#9d4edd';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < dist.length; i++) {
      const x = padding.left + (dist[i] / maxDist) * plotW;
      const y = padding.top + plotH - ((bTot[i] - minY) / (maxY - minY)) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  plotRadiation(ctx, padding, plotW, plotH) {
    const rad = this.data.lunar_change_4_radiation_lnd;
    const hours = rad.lunar_day_hours;
    const dose = rad.dose_rate_usv_per_hour;

    const minY = 40;
    const maxY = 80;
    const maxH = hours[hours.length - 1];

    this.drawAxes(ctx, padding, plotW, plotH, 0, maxH, minY, maxY, 'Lunar Day Elapsed Hours (Chang\'e-4 LND)', 'Radiation Dose Rate (µSv/h)');

    ctx.strokeStyle = '#2a9d8f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < hours.length; i++) {
      const x = padding.left + (hours[i] / maxH) * plotW;
      const y = padding.top + plotH - ((dose[i] - minY) / (maxY - minY)) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawAxes(ctx, padding, plotW, plotH, minX, maxX, minY, maxY, xTitle, yTitle) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding.left, padding.top, plotW, plotH);

    // Y Ticks
    const yTicks = 5;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yTicks; i++) {
      const frac = i / yTicks;
      const y = padding.top + plotH - frac * plotH;
      const val = Math.round(minY + frac * (maxY - minY));
      ctx.fillText(val, padding.left - 8, y);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();
    }

    // X Ticks
    const xTicks = 6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i <= xTicks; i++) {
      const frac = i / xTicks;
      const x = padding.left + frac * plotW;
      const val = Math.round(minX + frac * (maxX - minX));
      ctx.fillText(val, x, padding.top + plotH + 8);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + plotH);
      ctx.stroke();
    }

    ctx.fillStyle = '#f8fafc';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(xTitle, padding.left + plotW / 2, padding.top + plotH + 26);

    ctx.save();
    ctx.translate(16, padding.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yTitle, 0, 0);
    ctx.restore();
  }
}
