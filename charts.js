let charts = {};

// -------------------- Gauge needle plugin --------------------
const gaugeNeedle = {
  id: "gaugeNeedle",
  afterDatasetDraw(chart) {
    const dataset = chart.config.data.datasets[0];
    const { ctx } = chart;
    const value = (dataset.currentValue || 0).toFixed(2);
    const maxValue = (dataset.maxValue || 1).toFixed(2);

    const angle = (Math.PI * dataset.currentValue) / dataset.maxValue;
    const cx = chart.width / 2;
    const cy = chart.height - 75;
    const r = chart.width / 2.3;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI + angle);
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();

    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(`${value} ${dataset.unit || ""}`, cx, chart.height - 20);

    const endAngle = Math.PI;
    const endX = cx + Math.cos(endAngle) * r + 230;
    const endY = cy + Math.sin(endAngle) * r + 20;

    ctx.font = "14px Arial";
    ctx.fillStyle = "gray";
    ctx.textAlign = "center";
    ctx.fillText(`${maxValue} ${dataset.unit || ""}`, endX, endY - 5);
  },
};

function makeGauge(canvasId, maxValue, unit) {
  return new Chart(document.getElementById(canvasId), {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [maxValue],
          backgroundColor: ["lightblue"],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
          currentValue: 0,
          maxValue: maxValue,
          unit: unit,
        },
      ],
    },
    options: {
      cutout: "70%",
      responsive: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
    plugins: [gaugeNeedle],
  });
}

function wavelengthToColor(wl) {
  let r = 0,
    g = 0,
    b = 0;
  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    b = 1;
  } else if (wl >= 440 && wl < 490) {
    g = (wl - 440) / (490 - 440);
    b = 1;
  } else if (wl >= 490 && wl < 510) {
    g = 1;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1;
  } else if (wl >= 580 && wl < 645) {
    r = 1;
    g = -(wl - 645) / (645 - 580);
  } else if (wl >= 645 && wl <= 780) {
    r = 1;
  }
  r = Math.round(Math.max(0, Math.min(1, r)) * 255);
  g = Math.round(Math.max(0, Math.min(1, g)) * 255);
  b = Math.round(Math.max(0, Math.min(1, b)) * 255);
  return `rgb(${r},${g},${b})`;
}

const SPECTRUM_CHANNELS = [
  { name: "F1", peak: 405, fwhm: 30 },
  { name: "F2", peak: 425, fwhm: 22 },
  { name: "FZ", peak: 450, fwhm: 55 },
  { name: "F3", peak: 475, fwhm: 30 },
  { name: "F4", peak: 515, fwhm: 40 },
  { name: "F5", peak: 550, fwhm: 35 },
  { name: "FY", peak: 555, fwhm: 100 },
  { name: "FXL", peak: 600, fwhm: 80 },
  { name: "F6", peak: 640, fwhm: 50 },
  { name: "F7", peak: 690, fwhm: 55 },
  { name: "F8", peak: 745, fwhm: 60 },
  { name: "NIR", peak: 855, fwhm: 54 }
];

// Acceptable ranges for badges (nm)
const CHANNEL_ACCEPT_RANGES = {
  F1: { min: 395, max: 415 },
  F2: { min: 415, max: 435 },
  F3: { min: 465, max: 485 }
};

function gaussianAt(x, mean, fwhm) {
  const sigma = fwhm / 2.35482004503;
  const z = (x - mean) / sigma;
  return Math.exp(-0.5 * z * z);
}

function extractSpectrumValues(raw) {
  if (!raw) return null;

  if (Array.isArray(raw.channels)) {
    const map = {};
    raw.channels.forEach((c) => {
      if (typeof c.wavelength === "number" && typeof c.value === "number") {
        map[Math.round(c.wavelength)] = c.value;
      }
    });
    return Object.keys(map).length ? map : null;
  }

  const obj = raw.data || raw;
  if (obj && typeof obj === "object") {
    const map = {};
    Object.keys(obj).forEach((k) => {
      const m = /^(\d+)\s*nm$/i.exec(k) || /^(\d+)$/.exec(k);
      if (m && typeof obj[k] === "number") {
        map[Number(m[1])] = obj[k];
      }
    });
    if (Object.keys(map).length) return map;
  }
  return null;
}

function makeSpectrumChart(canvasId) {
  return new Chart(document.getElementById(canvasId), {
    type: "line",
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      parsing: false,
      interaction: { mode: "nearest", intersect: false },
      scales: {
        x: {
          type: "linear",
          min: 350,
          max: 900,
          title: { display: true, text: "wavelength / λ [nm]" },
          grid: { color: "rgba(0,0,0,0.08)" }
        },
        y: {
          min: 0,
          max: 1,
          title: {
            display: true,
            text: "spectral responsivity (scaled)"
          },
          grid: { color: "rgba(0,0,0,0.08)" }
        }
      },
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: {
          callbacks: {
            label(ctx) {
              const x = ctx.raw?.x ?? ctx.parsed.x;
              const y = ctx.raw?.y ?? ctx.parsed.y;
              return `${ctx.dataset.label}: ${y.toFixed(3)} @ ${x} nm`;
            }
          }
        }
      },
      elements: { point: { radius: 0 } }
    }
  });
}

function updateSpectrum(valuesByNm, maxCount = 65535) {
  if (!charts.spectrum) return;

  const amp = (nm) => (valuesByNm[nm] || 0) / maxCount;

  const xMin = 350;
  const xMax = 900;
  const step = 1;
  const xs = [];
  for (let x = xMin; x <= xMax; x += step) xs.push(x);

  const curveDatasets = SPECTRUM_CHANNELS.map((ch) => {
    const color = wavelengthToColor(ch.peak);
    const a = amp(ch.peak);
    const data = xs.map((x) => ({ x, y: a * gaussianAt(x, ch.peak, ch.fwhm) }));
    return {
      label: ch.name,
      data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      fill: false
    };
  });

  const samples = Object.keys(valuesByNm)
    .map((k) => Number(k))
    .sort((a, b) => a - b)
    .map((wl) => ({ x: wl, y: (valuesByNm[wl] || 0) / maxCount }));

  const samplesDataset = {
    label: "Samples",
    type: "scatter",
    data: samples,
    showLine: false,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: (ctx) => {
      const wl = ctx.raw?.x ?? 0;
      return wavelengthToColor(wl);
    },
    pointBorderColor: "rgba(0,0,0,0.25)"
  };

  charts.spectrum.data.datasets = [...curveDatasets, samplesDataset];
  charts.spectrum.update();
}

function setBadge(id, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = ok ? "true" : "false";
  el.classList.remove("true", "false");
  el.classList.add(ok ? "true" : "false");
}

function updateChannelBadges(wavelengthNm) {
  if (typeof wavelengthNm !== "number" || Number.isNaN(wavelengthNm)) return;
  setBadge(
    "f1Status",
    wavelengthNm >= CHANNEL_ACCEPT_RANGES.F1.min &&
      wavelengthNm <= CHANNEL_ACCEPT_RANGES.F1.max
  );
  setBadge(
    "f2Status",
    wavelengthNm >= CHANNEL_ACCEPT_RANGES.F2.min &&
      wavelengthNm <= CHANNEL_ACCEPT_RANGES.F2.max
  );
  setBadge(
    "f3Status",
    wavelengthNm >= CHANNEL_ACCEPT_RANGES.F3.min &&
      wavelengthNm <= CHANNEL_ACCEPT_RANGES.F3.max
  );
}

export function renderAir(d, fetchTime) {
  if (!charts.aqi) charts.aqi = makeGauge("aqiGauge", 10, d.air_quality_unit || "");
  if (!charts.co2) charts.co2 = makeGauge("co2Gauge", 1000, d.co2_unit || "ppm");
  if (!charts.voc) charts.voc = makeGauge("vocGauge", 1000, d.voc_unit || "ppb");

  charts.aqi.data.datasets[0].currentValue = d.air_quality || 0;
  charts.co2.data.datasets[0].currentValue = d.equivalent_CO2 || 0;
  charts.voc.data.datasets[0].currentValue = d.total_volatile_compounds || 0;

  charts.aqi.update();
  charts.co2.update();
  charts.voc.update();

  if (fetchTime) document.getElementById("fetchTimeAir").textContent = fetchTime;
}

export function renderPower(d, fetchTime) {
  if (!charts.voltage) charts.voltage = makeGauge("voltageGauge", 24, d.voltage?.unit || "V");
  if (!charts.current) charts.current = makeGauge("currentGauge", 4, d.current?.unit || "A");
  if (!charts.power)   charts.power   = makeGauge("powerGauge", 50, d.power?.unit   || "W");

  charts.voltage.data.datasets[0].currentValue = d.voltage?.value || 0;
  charts.current.data.datasets[0].currentValue = d.current?.value || 0;
  charts.power.data.datasets[0].currentValue   = d.power?.value   || 0;

  charts.voltage.update();
  charts.current.update();
  charts.power.update();

  if (fetchTime) document.getElementById("fetchTimePower").textContent = fetchTime;
}

export function renderSpect(d, fetchTime) {
  if (!charts.spectrum) {
    const canvas = document.getElementById("spectrumChart");
    if (canvas) charts.spectrum = makeSpectrumChart("spectrumChart");
  }

  const values = extractSpectrumValues(d);
  const wlFromPayload =
    typeof d?.wavelength === "number" ? Number(d.wavelength) : null;

  const apply = (map, maxCount = 65535) => {
    updateSpectrum(map, maxCount);

    const peakWl =
      Object.entries(map).reduce(
        (best, [k, v]) => (v > best.v ? { wl: Number(k), v } : best),
        { wl: 0, v: -1 }
      ).wl || 0;

    const uiWl = wlFromPayload ?? peakWl;

    document.getElementById("colorBox").style.background =
      wavelengthToColor(uiWl);
    document.getElementById(
      "wavelengthText"
    ).textContent = `Measured wavelength: ${uiWl} nm`;

    // Per-channel true/false for F1–F3
    updateChannelBadges(uiWl);

    // Keep old single PASS check for F1 range
    document.getElementById("resultText").textContent =
      uiWl >= 395 && uiWl <= 410 ? "PASS ✅" : " ";
  };

  if (values) {
    apply(values, d.maxCount || 65535);
  } else {
    fetch("data/colors.json")
      .then((r) => r.json())
      .then((json) => {
        const map =
          extractSpectrumValues(json) ||
          (Array.isArray(json.channels)
            ? json.channels.reduce((acc, c) => {
                acc[Math.round(c.wavelength)] = c.value;
                return acc;
              }, {})
            : extractSpectrumValues(json.data));
        apply(map || {}, json.maxCount || 65535);
      })
      .catch(() => {});
   }

  if (fetchTime) document.getElementById("fetchTimeSpect").textContent = fetchTime;
}

export function renderBin(d, fetchTime) {
  const level = d.bin || 0;
  const binFill = document.getElementById("binFill");
  binFill.style.height = level + "%";

  let label = document.getElementById("binLabel");
  if (!label) {
    label = document.createElement("div");
    label.id = "binLabel";
    label.style.position = "absolute";
    label.style.top = "50%";
    label.style.left = "50%";
    label.style.transform = "translate(-50%, -50%)";
    label.style.fontWeight = "bold";
    label.style.fontSize = "20px";
    document.getElementById("binLevelGraphic").appendChild(label);
  }
  label.textContent = level + "%";

  document.getElementById("mapFrame").src =
    `https://www.google.com/maps?q=${d.location?.latitude || 0},${d.location?.longitude || 0}&hl=es;z=14&output=embed`;

  if (fetchTime) document.getElementById("fetchTimeBin").textContent = fetchTime;
}