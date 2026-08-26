# CLPDS Planetary Exploration Data Visualization Suite
### China's Lunar and Planetary Data Release System (CLPDS) Interactive Scientific Explorer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r160-blue.svg)](https://threejs.org/)
[![PDS4 Standard](https://img.shields.io/badge/Data_Standard-PDS4_/_PDS3-green.svg)](https://clpds.bao.ac.cn)

---

## 🌟 Overview

This repository hosts a multi-mission scientific data exploration and interactive visualization suite for **China's Lunar and Planetary Data Release System ([CLPDS](https://clpds.bao.ac.cn/HomeList?type=1))**, managed by the National Astronomical Observatories of the Chinese Academy of Sciences (NAOC) and the China National Space Administration (CNSA).

It brings together high-precision data across seven planetary exploration vehicles spanning the Moon and Mars:
- **Chang'e-1 (CE-1) & Chang'e-2 (CE-2)**: Global lunar orbiters, CCD stereoscopic maps, microwave radiometer (CELMS), and asteroid Toutatis flyby.
- **Chang'e-3 (CE-3)**: Mare Imbrium lander and *Yutu* rover with Lunar Penetrating Radar (LPR) and Vis-NIR Spectrometer (VNIS).
- **Chang'e-4 (CE-4)**: World's first farside lander and *Yutu-2* rover in Von Kármán crater (South Pole-Aitken Basin).
- **Chang'e-5 (CE-5)**: Lunar sample return (1,731 g) from Mons Rümker with in-situ Lunar Mineralogical Spectrometer (LMS) water detection.
- **Chang'e-6 (CE-6)**: World's first lunar farside sample return (1,935.3 g) from Apollo Basin with DORN and NILS international payloads.
- **Tianwen-1 (TW-1)**: Mars orbiter & *Zhurong* rover in Southern Utopia Planitia with RoRAD polarimetric radar, MarSCoDe LIBS laser, RoMAG magnetometers, and Mars Climate Station (MCS).

---

## 🚀 Key Interactive Visualizations

```
                                CLPDS Visualization Suite
                                           │
  ┌───────────────────┬────────────────────┼────────────────────┬───────────────────┐
  ▼                   ▼                    ▼                    ▼                   ▼
1. 3D Planetary     2. Subsurface        3. Vis-NIR & LIBS    4. Mars Climate     5. Mission
   Globe & Routes      Radargram Studio     Spectroscopy Lab     & Geophysics        Matrix
  - Three.js WebGL    - Dual frequency     - Continuum-removed  - Diurnal LTST      - Payload specs
  - Moon & Mars         echograms            mineral bands        temperature / P   - PDS hierarchy
  - Landing sites     - Permittivity (εᵣ)  - Water band at      - Wind polar dial   - Sample stats
  - Rover traverses     velocity depth       2.85 µm (LMS)      - RoMAG surface |B| - Citations
  - Quick fly-to      - Colormap shaders   - LIBS atomic lines  - LND Moon dose
```

### 1. 🌍 Interactive 3D Planetary Globe & Landing Sites
- Realistic 3D Moon and Mars globes rendered with WebGL / Three.js.
- Accurate coordinates and landing site pins for Chang'e-3/4/5/6, Tianwen-1 Zhurong, Apollo 11/17, and NASA Mars rovers.
- Camera fly-to animations smoothly focusing on any site with interactive rover traverse waypoints and milestone logs.

### 2. 📡 Subsurface Radargram (GPR) Studio
- Interactive 2D B-scan radargrams modeled from published LPR (CE-4 500 MHz) and RoRAD (Tianwen-1 25 MHz) discoveries.
- Real-time dielectric permittivity slider ($\varepsilon_r \in [2.0, 8.0]$) recalculating radar velocity ($v = c/\sqrt{\varepsilon_r}$) and true depth.
- Colormap selection (Seismic, Grayscale, Viridis, Magma, Cyan Glow) with gain multiplier and geological layer segmentation.
- Crosshair inspection showing trace numbers, distance, two-way travel time, depth, and stratigraphic classification.

### 3. 🔬 Vis-NIR Spectroscopy & LIBS Laboratory
- Vis-NIR reflectance curves ($450\text{--}3200\text{ nm}$) comparing lunar farside mantle pyroxenes/olivines with young basalts.
- Upper convex hull continuum removal toggle.
- In-situ hydroxyl ($OH/\text{H}_2\text{O}$) absorption feature highlighting at $2.85\text{ }\mu\text{m}$ (Chang'e-5 LMS).
- MarSCoDe Laser-Induced Breakdown Spectroscopy (LIBS) emission spectra ($240\text{--}850\text{ nm}$) with peak tags for $\text{Si}, \text{Mg}, \text{Fe}, \text{Ca}, \text{Ti}, \text{Na}, \text{K}, \text{H}_\alpha, \text{O}$.

### 4. 🌪️ Mars Weather & Geophysics Dashboard
- Zhurong Mars Climate Station (MCS) diurnal cycles ($00:00 - 24:00\text{ LTST}$) for air temperature, ground temperature, and atmospheric pressure.
- Interactive rotating wind compass and wind speed vector.
- RoMAG surface remanent magnetic field variation ($\Delta B_x, \Delta B_y, \Delta B_z, |B|$) along Utopia Planitia traverse.
- Chang'e-4 LND lunar farside radiation dosimetry (GCR and secondary neutron dose rates).

### 5. 📚 Mission Science Matrix & Catalog
- Comprehensive technical breakdown of all 7 missions, payload suites, data processing levels, and scientific milestones.

---

## 💻 How to Run Locally

You can view the visualization in any modern web browser:

```bash
cd /Users/drb_laptop/Documents/AIRI_to_AIR/clpds-planetary-visualization/docs
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your web browser.

---

## 📂 Repository Structure

```
clpds-planetary-visualization/
├── data/                               # JSON scientific datasets
│   ├── missions_metadata.json
│   ├── landing_sites_traverses.json
│   ├── radargram_data.json
│   ├── spectral_library_data.json
│   └── martian_climate_data.json
├── docs/                               # Standalone web app (GitHub Pages ready)
│   ├── index.html
│   └── assets/
│       ├── css/style.css
│       ├── data/ (mirrored JSONs)
│       ├── js/
│       │   ├── app.js
│       │   ├── globe.js
│       │   ├── radargram.js
│       │   ├── spectroscopy.js
│       │   └── climate.js
│       └── textures/
├── scripts/
│   └── generate_clpds_datasets.py      # Scientific calibration & dataset generator
└── README.md
```

---

## 📖 Key References & Literature
- **Su et al. (2014)**: *Lunar Penetrating Radar on the Chang'e-3 Rover*. Research.
- **Lai et al. (2020)**: *First panoramic view of the lunar farside subsurface*. Science Advances.
- **Li et al. (2020)**: *Chang'e-4 initial spectral analysis of lunar farside materials*. Science Advances.
- **Li et al. (2022)**: *In situ detection of water on the Moon by the Chang'e-5 lander*. Nature Communications.
- **Zhang et al. (2022)**: *Layered subsurface in Utopia Planitia on Mars*. Nature.
- **Liu et al. (2022)**: *Zhurong rover discovers hydrated sulfate minerals in Utopia Planitia*. Nature Communications.
- **Peng et al. (2022)**: *Mars Climate Station on the Zhurong rover*. Earth and Planetary Physics.
