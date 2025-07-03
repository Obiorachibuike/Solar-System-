import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.178.0/+esm';
import { planets } from './planets.js';
import './ui.js';
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/+esm';

let scene, camera, renderer, sun, planetMeshes = {}, animationRunning = true;
const clock = new THREE.Clock();

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solarCanvas') });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.PointLight(0xffffff, 2);
  scene.add(light);

  // Sun
  const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Pulse animation for sun
  gsap.to(sun.scale, {
    x: 1.05,
    y: 1.05,
    z: 1.05,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut'
  });

  // Create planets
  planets.forEach(planet => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: planet.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { ...planet, angle: 0 };
    scene.add(mesh);
    planetMeshes[planet.name] = mesh;

    // Self-rotation using GSAP
    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      duration: 5,
      repeat: -1,
      ease: "linear"
    });
  });

  window.planetMeshes = planetMeshes;

  window.toggleAnimation = () => {
    animationRunning = !animationRunning;
    animationRunning ? gsap.globalTimeline.resume() : gsap.globalTimeline.pause();
  };

  addStarField();
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onPlanetClick);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  if (animationRunning) {
    const delta = clock.getDelta();
    Object.values(planetMeshes).forEach(mesh => {
      mesh.userData.angle += delta * mesh.userData.speed * 0.05;
      mesh.position.x = mesh.userData.distance * Math.cos(mesh.userData.angle);
      mesh.position.z = mesh.userData.distance * Math.sin(mesh.userData.angle);
    });
  }
  renderer.render(scene, camera);
}

function addStarField(count = 500) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    );
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(Object.values(planetMeshes));
  if (intersects.length > 0) {
    const planetName = intersects[0].object.userData.name;
    tooltip.style.display = "block";
    tooltip.textContent = planetName;
    tooltip.style.left = event.clientX + 10 + 'px';
    tooltip.style.top = event.clientY + 10 + 'px';
  } else {
    tooltip.style.display = "none";
  }
}

function onPlanetClick() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(Object.values(planetMeshes));
  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    const planetPos = clicked.position.clone();
    const targetPos = planetPos.clone().normalize().multiplyScalar(planetPos.length() - 5);
    gsap.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: "power2.out"
    });
  }
}

window.cameraZoom = function (direction) {
  const zoomSpeed = 2;
  const newZ = camera.position.z + (direction === 'in' ? -zoomSpeed : zoomSpeed);
  // Prevent zooming in too close or too far
  const clampedZ = THREE.MathUtils.clamp(newZ, 5, 100);

  gsap.to(camera.position, {
    z: clampedZ,
    duration: 0.6,
    ease: "power2.out"
  });
};
