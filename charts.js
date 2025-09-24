let charts = {};

const gaugeNeedle = {
  id: "gaugeNeedle",
  afterDatasetDraw(chart) {
    const dataset = chart.config.data.datasets[0];
    const { ctx } = chart;
    const value = dataset.currentValue || 0;
    const maxValue = dataset.maxValue || 1;

    const angle = (Math.PI * value) / maxValue;
    const cx = chart.width / 2;
    const cy = chart.height - 25;
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

    const lx = 100;
    const ly = 145;
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(value + " " + (dataset.unit || ""), lx, ly);
  },
};

function makeGauge(canvasId, maxValue, unit) {
  const oneThird = Math.floor(maxValue / 3);
  return new Chart(document.getElementById(canvasId), {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [oneThird, oneThird, oneThird, maxValue - oneThird * 3],
          backgroundColor: ["green", "yellow", "red", "red"],
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

export function renderAir(d) {
  charts.aqi = makeGauge("aqiGauge", 100, d.air_quality_unit || "%");
  charts.co2 = makeGauge("co2Gauge", 1000, d.co2_unit || "ppm");
  charts.voc = makeGauge("vocGauge", 100, d.voc_unit || "ppb");

  updateAir({
    air_quality: d.air_quality,
    equivalent_CO2: d.equivalent_CO2,
    total_volatile_compounds: d.total_volatile_compounds,
  });
}

export function updateAir(d, fetchTime) {
  if (charts.aqi) {
    charts.aqi.data.datasets[0].currentValue = d.air_quality || 0;
    charts.aqi.update();
  }
  if (charts.co2) {
    charts.co2.data.datasets[0].currentValue = d.equivalent_CO2 || 0;
    charts.co2.update();
  }
  if (charts.voc) {
    charts.voc.data.datasets[0].currentValue =
      d.total_volatile_compounds || 0;
    charts.voc.update();
  }
  if (fetchTime) {
    document.getElementById("fetchTime").textContent = fetchTime;
  }
}

export function renderPower(d) {
  charts.voltage = makeGauge("voltageGauge", 500, d.voltage?.unit || "V");
  charts.current = makeGauge("currentGauge", 50, d.current?.unit || "A");
  charts.power = makeGauge("powerGauge", 5000, d.power?.unit || "W");
  updatePower(d);
}
export function updatePower(d, fetchTime) {
  if (charts.voltage) {
    charts.voltage.data.datasets[0].currentValue = d.voltage?.value || 0;
    charts.voltage.update();
  }
  if (charts.current) {
    charts.current.data.datasets[0].currentValue = d.current?.value || 0;
    charts.current.update();
  }
  if (charts.power) {
    charts.power.data.datasets[0].currentValue = d.power?.value || 0;
    charts.power.update();
  }
  if (fetchTime) document.getElementById("fetchTime").textContent = fetchTime;
}

function wavelengthToColor(wl) {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / (440 - 380); b = 1; }
  else if (wl >= 440 && wl < 490) { g = (wl - 440) / (490 - 440); b = 1; }
  else if (wl >= 490 && wl < 510) { g = 1; b = -(wl - 510) / (510 - 490); }
  else if (wl >= 510 && wl < 580) { r = (wl - 510) / (580 - 510); g = 1; }
  else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / (645 - 580); }
  else if (wl >= 645 && wl <= 780) { r = 1; }
  r = Math.round(r * 255); g = Math.round(g * 255); b = Math.round(b * 255);
  return `rgb(${r},${g},${b})`;
}

export function renderSpect(d, fetchTime) {
  const wl = d.wavelength || 0;
  const color = wavelengthToColor(wl);
  document.getElementById("colorBox").style.background = color;
  document.getElementById("wavelengthText").textContent = `Wavelength: ${wl} nm`;
  document.getElementById("resultText").textContent = wl >= 395 && wl <= 410 ? "PASS ✅" : "FAIL ❌";
  if (fetchTime) document.getElementById("fetchTime").textContent = fetchTime;
}

export function renderBin(d) {
  const level = d.bin;
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
    `https://www.google.com/maps?q=${d.location.latitude},${d.location.longitude}&hl=es;z=14&output=embed`;
}