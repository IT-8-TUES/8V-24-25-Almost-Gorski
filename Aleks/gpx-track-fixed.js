let map, gpxTrack, animationMarker, animationPath;
let trackPoints = [];
let currentPointIndex = 0;
let isPlaying = false;
let animationSpeed = 5;
let animationTimer = null;
let elevationData = [];
let elevationChart = null;
let elevationChartCtx = null;

let totalDistance = 0;
let elevationGain = 0;
let maxElevation = 0;

function logDOMStructure() {
  console.log("--- DOM Structure Check ---");
  console.log("Map container:", document.getElementById("map-container"));
  console.log("Map controls:", document.querySelector(".map-controls"));
  console.log("Control buttons:", document.querySelector(".control-buttons"));
  console.log("Play button:", document.getElementById("play-btn"));
  console.log("Elevation chart:", document.getElementById("elevation-chart"));

  const videoContainer = document.querySelector(".video-container");
  const mapContainer = document.getElementById("map-container");
  const mapControls = document.querySelector(".map-controls");
  const trackInfo = document.querySelector(".track-info");

  if (videoContainer) {
    console.log(
      "Video container height:",
      window.getComputedStyle(videoContainer).height
    );
  }

  if (mapContainer) {
    console.log(
      "Map container height:",
      window.getComputedStyle(mapContainer).height
    );
  }

  if (mapControls) {
    console.log(
      "Map controls height:",
      window.getComputedStyle(mapControls).height
    );
  }

  if (trackInfo) {
    console.log(
      "Track info height:",
      window.getComputedStyle(trackInfo).height
    );
  }
}

const getGpxFile = () => {
  const fullUrl = window.location.href.toLowerCase();
  console.log("Full URL:", fullUrl);

  if (fullUrl.includes("musalenski_cirkus")) {
    console.log("Detected: Musalenski cirkus");
    return "Musalensky cirkus.gpx";
  } else if (fullUrl.includes("koncheto")) {
    console.log("Detected: Koncheto");
    return "Koncheto.gpx";
  } else if (fullUrl.includes("baiovo_dupki")) {
    console.log("Detected: Baiovi Dupki");
    return "Baiovi Dupki.gpx";
  } else if (fullUrl.includes("gpx-track-test")) {
    console.log("Detected: Test page");
    return "Musalensky cirkus.gpx";
  }

  console.log("Could not detect page, defaulting to Musalenski cirkus");
  return "Musalensky cirkus.gpx";
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded - initializing GPX track visualization");

  logDOMStructure();

  fixContainerHeights();

  const mapContainer = document.getElementById("map-container");

  if (!mapContainer) {
    console.error("Map container not found!");
    return;
  }

  initMap();
  setupControls();
});

function fixContainerHeights() {
  const videoContainer = document.querySelector(".video-container");
  const mapContainer = document.getElementById("map-container");

  if (videoContainer) {
    videoContainer.style.height = "600px";
    console.log("Set video container height to 600px");
  }

  if (mapContainer) {
    mapContainer.style.height = "60%";
    console.log("Set map container height to 60%");
  }

  const mapControls = document.querySelector(".map-controls");
  if (mapControls) {
    mapControls.style.display = "flex";
    mapControls.style.justifyContent = "space-between";
    mapControls.style.padding = "10px 15px";
    mapControls.style.backgroundColor = "#fff";
    console.log("Applied visibility fixes to map controls");
  }

  const trackInfo = document.querySelector(".track-info");
  if (trackInfo) {
    trackInfo.style.display = "block";
    console.log("Applied visibility fixes to track info");
  }
}

function initMap() {
  console.log("Initializing map");

  map = L.map("map-container", {
    zoomControl: false,
    attributionControl: true,
  });

  map.setView([42.1733, 23.5833], 13);

  L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  }).addTo(map);

  L.control
    .scale({
      imperial: false,
      position: "bottomleft",
    })
    .addTo(map);
  L.control
    .zoom({
      position: "topright",
    })
    .addTo(map);

  createTrackLegend();

  loadGPXTrack();
}

function loadGPXTrack() {
  const gpxFile = getGpxFile();

  const possiblePaths = [
    `tracks/${gpxFile}`,
    `./tracks/${gpxFile}`,
    `../tracks/${gpxFile}`,
    `../../tracks/${gpxFile}`,
    `../Aleks/tracks/${gpxFile}`,
    `/8V-24-25-Almost-Gorski/Aleks/tracks/${gpxFile}`,
  ];

  console.log("Attempting to load GPX file:", gpxFile);
  console.log("Trying paths:", possiblePaths);

  tryLoadingGpx(possiblePaths, 0);
}

function tryLoadingGpx(paths, index) {
  if (index >= paths.length) {
    console.error("Failed to load GPX file from any of the paths");
    return;
  }

  const currentPath = paths[index];
  console.log(`Trying to load from: ${currentPath}`);

  const gpxLayer = new L.GPX(currentPath, {
    async: true,
    marker_options: {
      startIconUrl: null,
      endIconUrl: null,
      shadowUrl: null,
    },
    polyline_options: {
      color: "#cccccc",
      opacity: 0.75,
      weight: 5,
      lineCap: "round",
    },
  });

  gpxLayer.on("error", function (e) {
    console.warn(`Error loading from ${currentPath}:`, e.error);
    tryLoadingGpx(paths, index + 1);
  });

  gpxLayer.on("loaded", function (e) {
    console.log(`GPX track loaded successfully from ${currentPath}`);
    gpxTrack = e.target;

    processGpxTrack();
  });
  gpxLayer.addTo(map);
}

function processGpxTrack() {
  gpxTrack.getLayers().forEach((layer) => {
    if (layer instanceof L.Polyline) {
      trackPoints = layer.getLatLngs();

      console.log(`Loaded track with ${trackPoints.length} points`);

      if (trackPoints.length === 0) {
        console.error("No points found in the track!");
        return;
      }
      elevationData = trackPoints.map((point, index) => {
        const elevation =
          typeof point.alt === "number"
            ? point.alt
            : typeof point.meta?.ele === "number"
            ? point.meta.ele
            : parseFloat(point.alt) || 0;
        return {
          index: index,
          elevation: elevation,
          latlng: point,
        };
      });

      calculateTrackStats();
      updateTrackStats();

      createTrackLegend();

      drawElevationChart();

      createAnimationPath();

      createAnimationMarker(trackPoints[0]);

      map.fitBounds(gpxTrack.getBounds(), {
        padding: [30, 30],
      });
    }
  });
}

function calculateTrackStats() {
  if (trackPoints.length === 0) return;

  totalDistance = 0;
  for (let i = 1; i < trackPoints.length; i++) {
    totalDistance += trackPoints[i].distanceTo(trackPoints[i - 1]);
  }
  totalDistance = totalDistance / 1000;

  let minEle = Infinity;
  maxElevation = -Infinity;
  let lastElevation = elevationData[0].elevation;
  elevationGain = 0;

  elevationData.forEach((point) => {
    if (point.elevation < minEle) minEle = point.elevation;
    if (point.elevation > maxElevation) maxElevation = point.elevation;

    const diff = point.elevation - lastElevation;
    if (diff > 0) {
      elevationGain += diff;
    }

    lastElevation = point.elevation;
  });

  console.log("Track stats calculated:", {
    distance: totalDistance.toFixed(2) + " km",
    elevationGain: elevationGain.toFixed(0) + " m",
    maxElevation: maxElevation.toFixed(0) + " m",
  });
}

function updateTrackStats() {
  const totalDistanceElement = document.getElementById("total-distance");
  const elevationGainElement = document.getElementById("elevation-gain");
  const maxElevationElement = document.getElementById("max-elevation");
  const currentElevationElement = document.getElementById("current-elevation");

  if (
    !totalDistanceElement ||
    !elevationGainElement ||
    !maxElevationElement ||
    !currentElevationElement
  ) {
    console.error("Missing track stat elements in the DOM");
    return;
  }

  totalDistanceElement.textContent = `${totalDistance.toFixed(2)} km`;
  elevationGainElement.textContent = `${elevationGain.toFixed(0)} m`;
  maxElevationElement.textContent = `${maxElevation.toFixed(0)} m`;
  currentElevationElement.textContent = `${
    trackPoints[0].alt ? trackPoints[0].alt.toFixed(0) : "0"
  } m`;
}

function createAnimationPath() {
  animationPath = L.polyline([], {
    color: "#fc5200",
    weight: 5,
    opacity: 0.9,
    lineCap: "round",
    lineJoin: "round",
    className: "track-path",
  }).addTo(map);
}

function createAnimationMarker(startPoint) {
  const arrowIcon = L.divIcon({
    html: "▶",
    className: "arrow-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  animationMarker = L.marker(startPoint, {
    icon: arrowIcon,
    zIndexOffset: 1000,
  }).addTo(map);
  const elevation = startPoint.alt ? startPoint.alt.toFixed(0) : "0";
  const popupContent = `
    <div class="elevation-content">
      <span class="elevation-value">${elevation}</span>
      <span class="elevation-unit">m</span>
    </div>
  `;

  const popup = L.popup({
    autoClose: false,
    closeOnClick: false,
    closeButton: false,
    className: "elevation-popup",
    offset: [0, -15],
  }).setContent(popupContent);

  animationMarker.bindPopup(popup);
  animationMarker.openPopup();
}

function drawElevationChart() {
  const chartContainer = document.getElementById("elevation-chart");

  if (!chartContainer) {
    console.error("Elevation chart container not found!");
    return;
  }

  chartContainer.innerHTML = "";

  const width = chartContainer.clientWidth;
  const height = chartContainer.clientHeight;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  chartContainer.appendChild(svg);

  const xScale =
    (width - padding.left - padding.right) / (elevationData.length - 1);

  let minEle = Math.min(...elevationData.map((d) => d.elevation));
  let maxEle = Math.max(...elevationData.map((d) => d.elevation));

  minEle = Math.floor(minEle * 0.95);
  maxEle = Math.ceil(maxEle * 1.05);

  const yScale = (height - padding.top - padding.bottom) / (maxEle - minEle);

  const points = elevationData.map((d, i) => {
    const x = padding.left + i * xScale;
    const y = height - padding.bottom - (d.elevation - minEle) * yScale;
    return `${x},${y}`;
  });

  const pathLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathLine.setAttribute("d", `M${points.join(" L")}`);
  pathLine.setAttribute("class", "chart-line");
  svg.appendChild(pathLine);

  const areaPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  areaPath.setAttribute(
    "d",
    `M${padding.left},${height - padding.bottom} L${points.join(" L")} L${
      width - padding.right
    },${height - padding.bottom} Z`
  );
  areaPath.setAttribute("class", "chart-area");
  svg.appendChild(areaPath);

  const positionLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  positionLine.setAttribute("x1", padding.left);
  positionLine.setAttribute("y1", padding.top);
  positionLine.setAttribute("x2", padding.left);
  positionLine.setAttribute("y2", height - padding.bottom);
  positionLine.setAttribute("class", "chart-hover-line");
  positionLine.setAttribute("display", "none");
  positionLine.id = "position-line";
  svg.appendChild(positionLine);

  const positionDot = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  positionDot.setAttribute("r", 4);
  positionDot.setAttribute("class", "chart-point");
  positionDot.setAttribute("display", "none");
  positionDot.id = "position-dot";
  svg.appendChild(positionDot);

  const overlay = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  overlay.setAttribute("width", width);
  overlay.setAttribute("height", height);
  overlay.setAttribute("fill", "transparent");
  overlay.onclick = function (event) {
    const rect = chartContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const pointIndex = Math.round((x - padding.left) / xScale);

    if (pointIndex >= 0 && pointIndex < trackPoints.length) {
      jumpToPosition(pointIndex);
    }
  };
  svg.appendChild(overlay);
  elevationChart = svg;
  elevationChartCtx = {
    width,
    height,
    padding,
    xScale,
    yScale,
    minEle,
    maxEle,
  };
}

function updateChartPosition(index) {
  if (!elevationChart || !elevationChartCtx) return;

  const { width, height, padding, xScale, yScale, minEle } = elevationChartCtx;
  const point = elevationData[index];

  const x = padding.left + index * xScale;
  const y = height - padding.bottom - (point.elevation - minEle) * yScale;

  const positionLine = document.getElementById("position-line");
  if (positionLine) {
    positionLine.setAttribute("x1", x);
    positionLine.setAttribute("x2", x);
    positionLine.setAttribute("display", "block");
  }

  const positionDot = document.getElementById("position-dot");
  if (positionDot) {
    positionDot.setAttribute("cx", x);
    positionDot.setAttribute("cy", y);
    positionDot.setAttribute("display", "block");
  }
}

function setupControls() {
  console.log("Setting up controls");

  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");
  const speedSlider = document.getElementById("speed-slider");

  if (!playBtn || !pauseBtn || !stopBtn || !resetBtn || !speedSlider) {
    console.error("Missing control elements:", {
      playBtn: !!playBtn,
      pauseBtn: !!pauseBtn,
      stopBtn: !!stopBtn,
      resetBtn: !!resetBtn,
      speedSlider: !!speedSlider,
    });
    createMissingControls();
    return;
  }

  playBtn.addEventListener("click", () => {
    console.log("Play button clicked");
    if (!isPlaying) {
      startAnimation();
    }
  });

  pauseBtn.addEventListener("click", () => {
    console.log("Pause button clicked");
    if (isPlaying) {
      pauseAnimation();
    }
  });

  stopBtn.addEventListener("click", () => {
    console.log("Stop button clicked");
    stopAnimation();
  });

  resetBtn.addEventListener("click", () => {
    console.log("Reset button clicked");
    resetAnimation();
  });

  speedSlider.addEventListener("input", (e) => {
    animationSpeed = parseInt(e.target.value);
    const speedValueElement = document.getElementById("speed-value");
    if (speedValueElement) {
      speedValueElement.textContent = `${animationSpeed}x`;
    }

    if (isPlaying) {
      pauseAnimation();
      startAnimation();
    }
  });

  const speedValueElement = document.getElementById("speed-value");
  if (speedValueElement) {
    speedValueElement.textContent = `${animationSpeed}x`;
  }
}

function createMissingControls() {
  console.log("Creating missing controls");

  const videoContainer = document.querySelector(".video-container");
  if (!videoContainer) {
    console.error("Video container not found, cannot create controls");
    return;
  }

  let mapControls = document.querySelector(".map-controls");

  if (!mapControls) {
    mapControls = document.createElement("div");
    mapControls.className = "map-controls";
    mapControls.style.cssText =
      "background-color: #fff; padding: 10px 15px; border-bottom: 1px solid #eaeaea; display: flex; justify-content: space-between; align-items: center;";
    videoContainer.appendChild(mapControls);
  }

  let controlButtons = document.querySelector(".control-buttons");
  if (!controlButtons) {
    controlButtons = document.createElement("div");
    controlButtons.className = "control-buttons";
    controlButtons.style.cssText = "display: flex; gap: 10px;";
    mapControls.appendChild(controlButtons);
  }

  if (!document.getElementById("play-btn")) {
    const playBtn = document.createElement("button");
    playBtn.id = "play-btn";
    playBtn.className = "control-btn";
    playBtn.textContent = "Play";
    playBtn.style.cssText =
      "background-color: #fc5200; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;";
    controlButtons.appendChild(playBtn);
  }

  if (!document.getElementById("pause-btn")) {
    const pauseBtn = document.createElement("button");
    pauseBtn.id = "pause-btn";
    pauseBtn.className = "control-btn";
    pauseBtn.textContent = "Pause";
    pauseBtn.style.cssText =
      "background-color: #fc5200; color: white; border: none; padding: 0.375rem 0.75rem; border-radius: 0.25rem; cursor: pointer; font-weight: 600;";
    controlButtons.appendChild(pauseBtn);
  }

  if (!document.getElementById("stop-btn")) {
    const stopBtn = document.createElement("button");
    stopBtn.id = "stop-btn";
    stopBtn.className = "control-btn";
    stopBtn.textContent = "Stop";
    stopBtn.style.cssText =
      "background-color: #fc5200; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;";
    controlButtons.appendChild(stopBtn);
  }

  if (!document.getElementById("reset-btn")) {
    const resetBtn = document.createElement("button");
    resetBtn.id = "reset-btn";
    resetBtn.className = "control-btn";
    resetBtn.textContent = "Reset";
    resetBtn.style.cssText =
      "background-color: #fc5200; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;";
    controlButtons.appendChild(resetBtn);
  }

  let speedControl = document.querySelector(".speed-control");
  if (!speedControl) {
    speedControl = document.createElement("div");
    speedControl.className = "speed-control";
    speedControl.style.cssText =
      "display: flex; align-items: center; gap: 0.625rem;";
    mapControls.appendChild(speedControl);

    const label = document.createElement("label");
    label.setAttribute("for", "speed-slider");
    label.textContent = "Speed:";
    speedControl.appendChild(label);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = "speed-slider";
    slider.min = "1";
    slider.max = "10";
    slider.value = "5";
    slider.className = "slider";
    slider.style.cssText = "width: 100px; cursor: pointer;";
    speedControl.appendChild(slider);

    const valueDisplay = document.createElement("span");
    valueDisplay.id = "speed-value";
    valueDisplay.textContent = "5x";
    valueDisplay.style.cssText =
      "font-weight: 600; min-width: 30px; text-align: center;";
    speedControl.appendChild(valueDisplay);
  }

  let trackInfo = document.querySelector(".track-info");
  if (!trackInfo) {
    trackInfo = document.createElement("div");
    trackInfo.className = "track-info";
    trackInfo.style.cssText = "padding: 0.9375rem; background-color: #fff;";
    videoContainer.appendChild(trackInfo);

    const chartDiv = document.createElement("div");
    chartDiv.className = "elevation-chart";
    chartDiv.id = "elevation-chart";
    chartDiv.style.cssText =
      "height: 5rem; background-color: #f8f8f8; margin-bottom: 0.9375rem; border-radius: 0.3125rem;";
    trackInfo.appendChild(chartDiv);

    const statsDiv = document.createElement("div");
    statsDiv.className = "track-stats";
    statsDiv.style.cssText = "display: flex; flex-wrap: wrap; gap: 15px;";
    trackInfo.appendChild(statsDiv);

    const stats = [
      { id: "total-distance", label: "Distance:", value: "0 km" },
      { id: "elevation-gain", label: "Elevation Gain:", value: "0 m" },
      { id: "max-elevation", label: "Max Elevation:", value: "0 m" },
      { id: "current-elevation", label: "Current Elevation:", value: "0 m" },
    ];

    stats.forEach((stat) => {
      const statDiv = document.createElement("div");
      statDiv.className = "stat";
      statDiv.style.cssText =
        "min-width: 7.5rem; padding: 0.3125rem 0.625rem; background-color: #f8f8f8; border-radius: 0.3125rem;";

      const labelSpan = document.createElement("span");
      labelSpan.className = "stat-label";
      labelSpan.textContent = stat.label;
      labelSpan.style.cssText =
        "font-size: 0.85rem; color: #666; display: block;";
      statDiv.appendChild(labelSpan);

      const valueSpan = document.createElement("span");
      valueSpan.id = stat.id;
      valueSpan.className = "stat-value";
      valueSpan.textContent = stat.value;
      valueSpan.style.cssText = "font-weight: 700; color: #333;";
      statDiv.appendChild(valueSpan);

      statsDiv.appendChild(statDiv);
    });
  }

  setTimeout(() => {
    setupControls();
  }, 100);
}

function startAnimation() {
  if (isPlaying || !trackPoints || trackPoints.length === 0) return;

  isPlaying = true;

  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (playBtn) playBtn.disabled = true;
  if (pauseBtn) pauseBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = false;
  if (resetBtn) resetBtn.disabled = true;

  const baseDelay = 100;
  const delay = baseDelay / animationSpeed;

  animationTimer = setInterval(() => {
    currentPointIndex++;

    if (currentPointIndex >= trackPoints.length) {
      stopAnimation();
      return;
    }

    updatePosition();
  }, delay);
}

function pauseAnimation() {
  if (!isPlaying) return;

  isPlaying = false;
  clearInterval(animationTimer);

  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");

  if (playBtn) playBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
}

function stopAnimation() {
  pauseAnimation();

  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (stopBtn) stopBtn.disabled = true;
  if (resetBtn) resetBtn.disabled = false;
}

function resetAnimation() {
  pauseAnimation();
  currentPointIndex = 0;

  if (animationPath) {
    animationPath.setLatLngs([]);
  }

  if (animationMarker && trackPoints && trackPoints.length > 0) {
    animationMarker.setLatLng(trackPoints[0]);
    const elevation = trackPoints[0].alt ? trackPoints[0].alt.toFixed(0) : "0";
    const content = `
      <div class="elevation-content">
        <span class="elevation-value">${elevation}</span>
        <span class="elevation-unit">m</span>
      </div>
    `;
    animationMarker.getPopup().setContent(content);
  }

  updatePosition();

  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (playBtn) playBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = true;
  if (resetBtn) resetBtn.disabled = true;
}

function jumpToPosition(index) {
  if (index < 0 || index >= trackPoints.length) return;

  pauseAnimation();
  currentPointIndex = index;

  const pathPoints = trackPoints.slice(0, currentPointIndex + 1);
  animationPath.setLatLngs(pathPoints);

  updatePosition();

  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (playBtn) playBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = false;
  if (resetBtn) resetBtn.disabled = false;
}

function updatePosition() {
  if (!trackPoints || currentPointIndex >= trackPoints.length) return;

  const currentPoint = trackPoints[currentPointIndex];

  if (animationMarker) {
    animationMarker.setLatLng(currentPoint);

    if (currentPointIndex < trackPoints.length - 1) {
      const nextPoint = trackPoints[currentPointIndex + 1];
      const angle = getBearing(currentPoint, nextPoint);

      const arrowIcon = L.divIcon({
        html: "▶",
        className: "arrow-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        style: `transform: rotate(${angle}deg);`,
      });

      animationMarker.setIcon(arrowIcon);
    }
    if (animationMarker.getPopup()) {
      const elevation =
        typeof currentPoint.alt === "number"
          ? currentPoint.alt
          : typeof currentPoint.meta?.ele === "number"
          ? currentPoint.meta.ele
          : parseFloat(currentPoint.alt) || 0;

      const content = `
        <div class="elevation-content">
          <span class="elevation-value">${elevation.toFixed(0)}</span>
          <span class="elevation-unit">m</span>
        </div>
      `;
      animationMarker.getPopup().setContent(content);
    }
  }

  if (animationPath) {
    const pathPoints = trackPoints.slice(0, currentPointIndex + 1);
    animationPath.setLatLngs(pathPoints);
  }

  const currentElevationElement = document.getElementById("current-elevation");
  if (currentElevationElement) {
    currentElevationElement.textContent = `${
      currentPoint.alt ? currentPoint.alt.toFixed(0) : "0"
    } m`;
  }

  updateChartPosition(currentPointIndex);

  if (window.trackLegendControl && currentPointIndex % 10 === 0) {
    createTrackLegend();
  }

  if (map) {
    map.panTo(currentPoint);
  }
}

function getBearing(start, end) {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return bearing;
}

function createTrackLegend() {
  if (window.trackLegendControl) {
    window.trackLegendControl.remove();
    map.removeControl(window.trackLegendControl);
  }

  window.trackLegendControl = L.control({ position: "bottomright" });

  window.trackLegendControl.onAdd = function () {
    const div = L.DomUtil.create("div", "track-legend");
    div.style.cssText =
      "background: white; padding: 0.75rem; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 0.8125rem; max-width: 15rem; backdrop-filter: blur(5px);";
    const trackInfo = getTrackNameInBulgarian();

    const progress = trackPoints
      ? Math.round((currentPointIndex / (trackPoints.length - 1)) * 100)
      : 0;

    const currentPoint = trackPoints && trackPoints[currentPointIndex];
    const currentElevation = currentPoint
      ? (typeof currentPoint.alt === "number"
          ? currentPoint.alt
          : typeof currentPoint.meta?.ele === "number"
          ? currentPoint.meta.ele
          : parseFloat(currentPoint.alt) || 0
        ).toFixed(0)
      : "0";
    const avgSpeedKmH = 3.5;
    const currentPace =
      trackPoints && currentPointIndex > 0
        ? calculateCurrentPace(currentPointIndex)
        : 0;

    const estimatedHours = totalDistance / avgSpeedKmH;
    const hours = Math.floor(estimatedHours);
    const minutes = Math.round((estimatedHours - hours) * 60);

    const elapsedDistance = trackPoints
      ? calculateDistance(0, currentPointIndex)
      : 0;
    const remainingDistance = totalDistance - elapsedDistance;
    div.innerHTML = `      <style>
        .legend-title { 
          font-weight: bold; 
          margin-bottom: 0.625rem; 
          color: #1a1a1a; 
          font-size: 0.875rem;
          text-shadow: 0 1px 1px rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .legend-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.3125rem;
          color: white;
          font-weight: bold;
          text-transform: uppercase;
        }        .legend-badge.very-hard {
          background-color: #ff3b30;
        }
        .legend-badge.hard {
          background-color: #fc5200;
        }
        .legend-item { 
          display: flex; 
          justify-content: space-between; 
          margin: 0.375rem 0;
          align-items: center;
        }
        .legend-label { 
          color: #555; 
          font-size: 0.75rem;
        }
        .legend-value { 
          font-weight: 600; 
          color: #1a1a1a;
          font-size: 0.75rem;
        }
        .legend-divider { 
          border-top: 1px solid rgba(0,0,0,0.08); 
          margin: 10px 0; 
        }
        .legend-track { 
          background: #e6e6e6; 
          height: 6px; 
          border-radius: 3px; 
          margin: 8px 0;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }
        .legend-progress { 
          background: linear-gradient(90deg, #fc5200, #ff7340);
          height: 100%; 
          border-radius: 3px;
          transition: width 0.3s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .style-indicator { 
          display: inline-block; 
          width: 30px; 
          height: 4px; 
          vertical-align: middle;
          border-radius: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .highlight-value {
          color: #fc5200;
          font-weight: 700;
        }      </style>      <div class="legend-title">
        ${trackInfo.name}
        <span class="legend-badge ${
          trackInfo.difficulty
        }">${trackInfo.difficulty.toUpperCase().replace("-", " ")}</span>
      </div>
      <div class="legend-divider"></div>      <div class="legend-item">
        <span class="legend-label">Разстояние:</span>
        <span class="legend-value">
          <span class="highlight-value">${elapsedDistance.toFixed(
            2
          )}</span> / ${totalDistance.toFixed(2)} км
        </span>
      </div>
      <div class="legend-item">
        <span class="legend-label">Оставащо:</span>
        <span class="legend-value">${remainingDistance.toFixed(2)} км</span>
      </div>
      <div class="legend-item">
        <span class="legend-label">Темпо:</span>
        <span class="legend-value">${currentPace.toFixed(1)} км/ч</span>
      </div>
      <div class="legend-item">
        <span class="legend-label">Денивелация:</span>
        <span class="legend-value">↑ ${elevationGain.toFixed(0)} м</span>
      </div>
      <div class="legend-item">
        <span class="legend-label">Височина:</span>
        <span class="legend-value">
          <span class="highlight-value">${currentElevation}</span> / ${maxElevation.toFixed(
      0
    )} м
        </span>
      </div>
      <div class="legend-item">
        <span class="legend-label">Време (приблиз.):</span>
        <span class="legend-value">${hours}ч ${minutes}мин</span>
      </div>
      <div class="legend-divider"></div>
      <div class="legend-item">
        <span class="legend-label">Напредък:</span>
        <span class="legend-value">${progress}%</span>
      </div>
      <div class="legend-track">
        <div class="legend-progress" style="width: ${progress}%"></div>
      </div>
      <div class="legend-divider"></div>
      <div class="legend-item">
        <span class="legend-label">Цял маршрут:</span>
        <span><div class="style-indicator" style="background: #cccccc"></div></span>
      </div>
      <div class="legend-item">
        <span class="legend-label">Изминат път:</span>
        <span><div class="style-indicator" style="background: #fc5200"></div></span>
      </div>
    `;

    return div;
  };

  window.trackLegendControl.addTo(map);
}

function getTrackNameInBulgarian() {
  const url = window.location.href.toLowerCase();

  if (url.includes("musalenski_cirkus")) {
    return { name: "Мусаленски циркус", difficulty: "very-hard" };
  } else if (url.includes("koncheto")) {
    return { name: "Кончето", difficulty: "very-hard" };
  } else if (url.includes("baiovo_dupki")) {
    return { name: "Баюви дупки", difficulty: "hard" };
  }
}

function calculateCurrentPace(currentIndex) {
  if (!trackPoints || currentIndex < 10) return 0;

  const startIndex = Math.max(0, currentIndex - 10);
  const distance = calculateDistance(startIndex, currentIndex);
  const timeInHours = distance / 3.5;

  return timeInHours > 0 ? distance / timeInHours : 0;
}

function calculateDistance(startIndex, endIndex) {
  if (!trackPoints || startIndex >= endIndex) return 0;

  let distance = 0;
  for (let i = startIndex + 1; i <= endIndex; i++) {
    distance += trackPoints[i].distanceTo(trackPoints[i - 1]);
  }
  return distance / 1000;
}
