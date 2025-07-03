import { planets } from './planets.js';

const container = document.getElementById('planet-controls');

planets.forEach(planet => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <label>${planet.name} Speed:
      <input type="range" id="${planet.name}-speed" min="0.1" max="5" value="${planet.speed}" step="0.1" />
      <span id="${planet.name}-value">${planet.speed}</span>
    </label>
  `;
  container.appendChild(wrapper);

  const slider = wrapper.querySelector(`#${planet.name}-speed`);
  const display = wrapper.querySelector(`#${planet.name}-value`);

  slider.addEventListener("input", (e) => {
    const speed = parseFloat(e.target.value);
    display.textContent = speed;
    const event = new CustomEvent('update-speed', {
      detail: { name: planet.name, speed }
    });
    window.dispatchEvent(event);
  });
});

window.addEventListener('update-speed', (e) => {
  const planetMesh = window.planetMeshes?.[e.detail.name];
  if (planetMesh) {
    planetMesh.userData.speed = e.detail.speed;
  }
});

document.getElementById('toggle-animation').addEventListener('click', () => {
  window.toggleAnimation();
  const btn = document.getElementById('toggle-animation');
  btn.textContent = btn.textContent === 'Pause' ? 'Resume' : 'Pause';
});

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

document.getElementById('zoom-in').addEventListener('click', () => {
  window.cameraZoom('in');
});

document.getElementById('zoom-out').addEventListener('click', () => {
  window.cameraZoom('out');
});
