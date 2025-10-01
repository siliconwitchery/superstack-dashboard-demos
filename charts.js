let charts = {};

const gaugeNeedle = {
  id: "gaugeNeedle",
  afterDatasetDraw(chart) {
    const dataset = chart.config.data.datasets[0];
    const { ctx } = chart;
    const value = (dataset.currentValue || 0).toFixed(2);
    const maxValue = (dataset.maxValue || 0).toFixed(0);

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
    ctx.fillText(`${value} ${dataset.unit || ""}`, cx, chart.height - 20);

    const endAngle = Math.PI;
    const endX = cx + Math.cos(endAngle) * r + 240;
    const endY = cy + Math.sin(endAngle) * r + 20;
    ctx.fillText(`${maxValue}`, endX, endY - 5);
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
      animation: true,
      plugins: { legend: { display: false }, position: 'top', tooltip: { enabled: false } },
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
function textColorFor(rgb) {
  const m = rgb.match(/\d+/g) || [0, 0, 0];
  const [r, g, b] = m.map(Number);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; 
  return luma > 160 ? "#000" : "#fff";
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

const CHANNEL_ACCEPT_RANGES = {
  405: { min: 758, max: 778 },
  425: { min: 2806, max: 2826 },
  450: { min: 15862, max: 15882 },
  475: { min: 15350, max: 15370 },
  515: { min: 45558, max: 45578 },
  550: { min: 15094, max: 15114 },
  555: { min: 4830, max: 4850 },
  600: { min: 35574, max: 35594 },
  640: { min: 23030, max: 23050 },
  690: { min: 10742, max: 10762 },
  745: { min: 1782, max: 1802 },
  855: { min: 1526, max: 1546 }
};

function gaussianAt(x, mean, fwhm) {
  const sigma = fwhm / 2.35482004503;
  const z = (x - mean) / sigma;
  return Math.exp(-0.5 * z * z);
}

function extractSpectrumValues(raw) {
  if (!raw) return null;
  const obj = raw.data || raw;
  if (obj && typeof obj === "object") {
    const map = {};
    Object.keys(obj).forEach((k) => {
      const m = /^(\d+)\s*nm$/i.exec(k) || /^(\d+)$/.exec(k);
      if (m && typeof obj[k] === "number") {
        map[Number(m[1])] = obj[k];
      }
    });
    return map;
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
          title: { display: true, text: "spectral responsivity (scaled)" },
          grid: { color: "rgba(0,0,0,0.08)" }
        }
      },
      plugins: {
        legend: { display: false }, 
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
let MAX_COUNT = 65535

function updateSpectrum(valuesByNm, maxCount) {
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

  const samples = SPECTRUM_CHANNELS.map((ch) => ({
    x: ch.peak,
    y: amp(ch.peak)
  }));

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

function ensureStatusRow() {
  const container =
    document.getElementById("channelStatusRow") ||
    document.querySelector(".channel-status");
  if (!container || container.dataset.built === "1") return;

  container.innerHTML = "";
  SPECTRUM_CHANNELS.forEach((ch) => {
    const item = document.createElement("div");
    item.className = "status-item";

    const emoji = document.createElement("span");
    emoji.id = `status${ch.name}`;
    emoji.className = "emoji";
    emoji.textContent = "❌";

    const chip = document.createElement("span");
    chip.className = "chip";
    const bg = wavelengthToColor(ch.peak);
    chip.style.background = bg;
    chip.style.color = textColorFor(bg);
    chip.textContent = ch.name;

    item.appendChild(emoji);
    item.appendChild(chip);
    container.appendChild(item);
  });

  container.dataset.built = "1";
}

function setEmoji(id, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = ok ? "✅" : "❌";
}

function updateChannelBadgesFromCounts(valuesByNm) {
  if (!valuesByNm || typeof valuesByNm !== "object") {
    SPECTRUM_CHANNELS.forEach((ch) =>
      setEmoji(`status${ch.name}`, false)
    );
    return;
  }
  console.log(valuesByNm);
  SPECTRUM_CHANNELS.forEach((ch) => {
    const wl = ch.peak;
    const range = CHANNEL_ACCEPT_RANGES[wl];
    const raw = valuesByNm[wl] ?? valuesByNm[String(wl)];
    const val = Number(raw);
    const ok =
      Number.isFinite(val) && range && val >= range.min && val <= range.max;
  setEmoji(`status${ch.name}`, ok);
  });
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
  ensureStatusRow();
  if (!charts.spectrum) {
    const canvas = document.getElementById("spectrumChart");
    if (canvas) charts.spectrum = makeSpectrumChart("spectrumChart");
  }

  const values = extractSpectrumValues(d);

  if (!values || Object.keys(values).length === 0) {
    updateSpectrum({}, MAX_COUNT);
    const box = document.getElementById("colorBox");
    if (box) box.style.background = "#eee";
    const wlText = document.getElementById("wavelengthText");
    if (wlText) wlText.textContent = "No spectrometer data";
    updateChannelBadgesFromCounts(null);
    document.getElementById("resultText").textContent = " ";
    if (fetchTime)
      document.getElementById("fetchTimeSpect").textContent = fetchTime;
    return;
  }

  updateSpectrum(values, MAX_COUNT);
  console.log(values);

  const peakWl =
    Object.entries(values).reduce(
      (best, [k, v]) => (v > best.v ? { wl: Number(k), v } : best),
      { wl: 0, v: -1 }
    ).wl || 0;


  updateChannelBadgesFromCounts(values);

  document.getElementById("resultText").textContent =
    peakWl >= 395 && peakWl <= 410 ? "PASS ✅" : " ";

  if (fetchTime)
    document.getElementById("fetchTimeSpect").textContent = fetchTime;
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