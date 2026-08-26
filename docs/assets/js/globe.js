import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export class PlanetaryGlobe {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.onSiteSelected = options.onSiteSelected || (() => {});
    this.currentBody = 'Moon'; // 'Moon' or 'Mars'
    this.sitesData = [];
    this.markerObjects = [];
    this.traverseLines = [];
    this.activeSite = null;

    this.initThree();
    this.initLighting();
    this.initStarfield();
    this.createPlanetaryBody();
    this.setupEvents();
    this.animate();
  }

  initThree() {
    this.width = this.container.clientWidth || 800;
    this.height = this.container.clientHeight || 600;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 3.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.25;
    this.controls.maxDistance = 6.0;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.4;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.globeRadius = 1.0;
  }

  initLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 3, 5);
    this.scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x4361ee, 0.25);
    fillLight.position.set(-5, -2, -3);
    this.scene.add(fillLight);
  }

  initStarfield() {
    const starsCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      const r = 40 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);

      const brightness = 0.6 + Math.random() * 0.4;
      colors[i] = brightness;
      colors[i + 1] = brightness;
      colors[i + 2] = brightness;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starField = new THREE.Points(geometry, material);
    this.scene.add(starField);
  }

  createProceduralTexture(bodyType) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (bodyType === 'Moon') {
      // Lunar surface gradient & mare basements
      ctx.fillStyle = '#8a8d91';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dark Maria (Oceanus Procellarum, Mare Imbrium, Mare Tranquillitatis, SPA Basin)
      const maria = [
        { x: 750, y: 320, rx: 220, ry: 160, col: '#45484f' }, // Oceanus Procellarum
        { x: 920, y: 260, rx: 140, ry: 110, col: '#3e4147' }, // Mare Imbrium
        { x: 1200, y: 490, rx: 90, ry: 70, col: '#484b52' }, // Mare Tranquillitatis
        { x: 1040, y: 380, rx: 110, ry: 90, col: '#40434a' }, // Mare Serenitatis
        { x: 1700, y: 780, rx: 260, ry: 190, col: '#3b3d42' }, // SPA Basin (Farside)
        { x: 1350, y: 720, rx: 130, ry: 100, col: '#42454a' } // Apollo Basin
      ];

      maria.forEach(m => {
        const grad = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.rx);
        grad.addColorStop(0, m.col);
        grad.addColorStop(0.7, m.col);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Impact craters & ray systems
      for (let i = 0; i < 400; i++) {
        const cx = Math.random() * canvas.width;
        const cy = Math.random() * canvas.height;
        const cr = 2 + Math.random() * 14;
        ctx.fillStyle = Math.random() > 0.6 ? '#bcc0c7' : '#333538';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Mars surface (Rust-red, Hellas Planitia, Utopia, Tharsis, Polar Caps)
      ctx.fillStyle = '#b7410e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Darker volcanic regions (Syrtis Major, Acidalia, Utopia Planitia)
      const features = [
        { x: 600, y: 380, rx: 280, ry: 180, col: '#6e260e' }, // Utopia Planitia
        { x: 1100, y: 520, rx: 180, ry: 120, col: '#4a1908' }, // Syrtis Major
        { x: 1500, y: 400, rx: 320, ry: 200, col: '#7a2d12' }, // Tharsis / Olympus
        { x: 1250, y: 780, rx: 220, ry: 140, col: '#9c3814' } // Hellas Basin
      ];

      features.forEach(f => {
        const grad = ctx.createRadialGradient(f.x, f.y, 10, f.x, f.y, f.rx);
        grad.addColorStop(0, f.col);
        grad.addColorStop(0.8, f.col);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.rx, f.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Polar Ice Caps
      // North Pole
      const npGrad = ctx.createRadialGradient(canvas.width / 2, 0, 0, canvas.width / 2, 0, 90);
      npGrad.addColorStop(0, '#ffffff');
      npGrad.addColorStop(0.7, '#e0f2fe');
      npGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = npGrad;
      ctx.fillRect(0, 0, canvas.width, 90);

      // South Pole
      const spGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height, 0, canvas.width / 2, canvas.height, 70);
      spGrad.addColorStop(0, '#ffffff');
      spGrad.addColorStop(0.6, '#e0f2fe');
      spGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = spGrad;
      ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
    }

    return new THREE.CanvasTexture(canvas);
  }

  createPlanetaryBody() {
    if (this.globeMesh) {
      this.scene.remove(this.globeMesh);
      this.globeMesh.geometry.dispose();
      this.globeMesh.material.dispose();
    }

    const geometry = new THREE.SphereGeometry(this.globeRadius, 64, 64);
    
    // Texture loader with procedural fallback
    const texture = this.createProceduralTexture(this.currentBody);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.88,
      metalness: 0.12
    });

    this.globeMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.globeMesh);

    // Atmosphere halo for Mars
    if (this.atmosphereMesh) {
      this.scene.remove(this.atmosphereMesh);
    }
    if (this.currentBody === 'Mars') {
      const atmoGeom = new THREE.SphereGeometry(this.globeRadius * 1.025, 32, 32);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0xe76f51,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide
      });
      this.atmosphereMesh = new THREE.Mesh(atmoGeom, atmoMat);
      this.scene.add(this.atmosphereMesh);
    }

    this.renderLandingSites();
  }

  switchBody(body) {
    if (this.currentBody === body) return;
    this.currentBody = body;
    this.createPlanetaryBody();
  }

  setSitesData(data) {
    this.sitesData = data;
    this.renderLandingSites();
  }

  latLonToVector3(lat, lon, radius = 1.0) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  clearMarkers() {
    this.markerObjects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.markerObjects = [];

    this.traverseLines.forEach(line => {
      this.scene.remove(line);
      if (line.geometry) line.geometry.dispose();
      if (line.material) line.material.dispose();
    });
    this.traverseLines = [];
  }

  renderLandingSites() {
    this.clearMarkers();

    const filtered = this.sitesData.filter(s => s.body === this.currentBody);

    filtered.forEach(site => {
      const pos = this.latLonToVector3(site.lat, site.lon, this.globeRadius * 1.01);

      // Pin base cone
      const pinGeom = new THREE.ConeGeometry(0.025, 0.07, 16);
      pinGeom.translate(0, 0.035, 0);
      pinGeom.rotateX(Math.PI / 2);

      const colorHex = parseInt(site.color.replace('#', '0x'), 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });

      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.lookAt(new THREE.Vector3(0, 0, 0));
      pinMesh.rotateX(Math.PI);
      pinMesh.userData = { site };

      // Outer glow pulse ring
      const ringGeom = new THREE.RingGeometry(0.03, 0.045, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(this.latLonToVector3(site.lat, site.lon, this.globeRadius * 1.006));
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      this.scene.add(pinMesh);
      this.scene.add(ringMesh);
      this.markerObjects.push(pinMesh, ringMesh);

      // Render Rover Traverse Path if waypoints exist
      if (site.traverse_waypoints && site.traverse_waypoints.length > 1) {
        const points = site.traverse_waypoints.map(wp => {
          const wLat = site.lat + wp.dlat;
          const wLon = site.lon + wp.dlon;
          return this.latLonToVector3(wLat, wLon, this.globeRadius * 1.012);
        });

        const curve = new THREE.CatmullRomCurve3(points);
        const curvePoints = curve.getPoints(50);
        const pathGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const pathMat = new THREE.LineBasicMaterial({
          color: 0x00f2fe,
          linewidth: 3,
          transparent: true,
          opacity: 0.9
        });
        const pathLine = new THREE.Line(pathGeom, pathMat);
        this.scene.add(pathLine);
        this.traverseLines.push(pathLine);
      }
    });
  }

  flyToSite(siteId) {
    const site = this.sitesData.find(s => s.id === siteId);
    if (!site) return;

    if (site.body !== this.currentBody) {
      this.switchBody(site.body);
    }

    this.activeSite = site;
    this.controls.autoRotate = false;

    const targetPos = this.latLonToVector3(site.lat, site.lon, 2.3);
    this.animateCameraTo(targetPos, new THREE.Vector3(0, 0, 0), 1200);
    this.onSiteSelected(site);
  }

  animateCameraTo(targetPos, targetLookAt, durationMs = 1000) {
    const startPos = this.camera.position.clone();
    const startTime = performance.now();

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1.0);
      // Smooth easeInOutCubic
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.copy(targetLookAt);
      this.controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(animateStep);
      }
    };
    requestAnimationFrame(animateStep);
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.width = this.container.clientWidth || 800;
      this.height = this.container.clientHeight || 600;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    this.renderer.domElement.addEventListener('mousemove', (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / this.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / this.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.markerObjects.filter(m => m.userData && m.userData.site));

      if (intersects.length > 0) {
        this.renderer.domElement.style.cursor = 'pointer';
      } else {
        this.renderer.domElement.style.cursor = 'grab';
      }
    });

    this.renderer.domElement.addEventListener('click', () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.markerObjects.filter(m => m.userData && m.userData.site));

      if (intersects.length > 0) {
        const site = intersects[0].object.userData.site;
        this.flyToSite(site.id);
      }
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();

    // Subtle pulse on rings
    const time = performance.now() * 0.003;
    const scale = 1.0 + 0.12 * Math.sin(time);
    this.markerObjects.forEach(obj => {
      if (obj.geometry instanceof THREE.RingGeometry) {
        obj.scale.set(scale, scale, scale);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}
