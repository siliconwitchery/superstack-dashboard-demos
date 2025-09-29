import {
  renderAir,
  updateAir,
  renderPower,
  updatePower,
  renderSpect,
  renderBin,
} from "./charts.js";

///////////////////
// New logic
///////////////////

let apiKey = null;
let deploymentId = null;
let currentType = null;

async function fetchFromApi2(currentType, apiKey, deploymentId) {

  const start = new Date();
  start.setDate(start.getDate() - 20);
  // start.setSeconds(start.getSeconds() - 10);

  const payload = {
    deploymentId: deploymentId,
    devices:[currentType],
    time: { start: start.toISOString().replace("Z", "+00:00") },
  };

  const res = await fetch("https://super.siliconwitchery.com/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    setConnectionStatus(true);
    return await res.json();
  }

}

// Timer loop which keeps updating the graphs
function startTimerLoop() {
  setInterval(async () => {

    apiKey = document.getElementById("apiKey").value.trim();
    deploymentId = document.getElementById("deploymentId").value.trim();

    loadLatest(currentType);

  }, 1000);
}

function Closealltabs() {
  document
    .querySelectorAll("#Closealltabs section")
    .forEach((sec) => (sec.style.display = "none"));
}

async function loadLatest(type) {
  // console.log(`Loading latest data for ${type} with apikey=${apiKey} depid=${deploymentId}`);

  let deviceName;
  if (type === "power") {
    deviceName = "Power Meter";
  } else if (type === "airquality") {
    deviceName = "air_quality";
  } else if (type === "spectrometer") {
    deviceName = "Spectrometer";
  } else if (type === "binsensor") {
    deviceName = "Bin Sensor";
  }

const allData = await fetchFromApi2(deviceName, apiKey, deploymentId);

  if (!allData || allData.length === 0) {
    console.warn("No device data yet for", deviceName);
    return;
  }

  const entry = allData[allData.length - 1];
  show(type, entry);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.parentElement.dataset.type;

      if (type === "settings") {
        Closealltabs();
        document.getElementById("settingsPage").style.display = "block";
      } else if (type === "airquality") {
        Closealltabs();
        document.getElementById("airqualityPage").style.display = "block";
        loadLatest("airquality", false);
      } else if (type === "power") {
        Closealltabs();
        document.getElementById("powerPage").style.display = "block";
        loadLatest("power", false);
      } else if (type === "spectrometer") {
        Closealltabs();
        document.getElementById("spectrometerPage").style.display = "block";
        loadLatest("spectrometer", false);
      } else if (type === "binsensor") {
        Closealltabs();
        document.getElementById("binsensorPage").style.display = "block";
        loadLatest("binsensor", false);
      }
      currentType = type;
    });
  });
});

function setConnectionStatus(connected) {
  const statusEl = document.getElementById("connectionStatus");
  if (!statusEl) return;
  if (connected) {
    statusEl.textContent = "Connected";
    statusEl.classList.remove("not-connected");
    statusEl.classList.add("connected");
  } else {
    statusEl.textContent = "Not Connected";
    statusEl.classList.remove("connected");
    statusEl.classList.add("not-connected");
  }
}

function show(type, entry) {
  const fetchTime = new Date().toLocaleString();

  if (type === "airquality") {
    document.getElementById("airqualityPage").style.display = "block";
    document.getElementById("fanStatus").textContent =
      entry.data?.fan ? "On" : "Off";
    document.getElementById("fetchTimeAir").textContent = fetchTime;

    renderAir({
      air_quality: entry.data?.airquality || 0,
      air_quality_unit: "",
      equivalent_CO2: entry.data?.equivalent_CO2 || 0,
      co2_unit: "ppm",
      total_volatile_compounds: entry.data?.total_volatile_compounds || 0,
      voc_unit: "ppb",
    });
  }

  else if (type === "power") {
    document.getElementById("powerPage").style.display = "block";
    document.getElementById("fetchTimePower").textContent = fetchTime;

    renderPower({
      voltage: { value: entry.data?.voltage || 0, unit: "V" },
      current: { value: entry.data?.current || 0, unit: "A" },
      power: { value: entry.data?.power || 0, unit: "W" },
    });
  }

  else if (type === "spectrometer") {
    document.getElementById("spectrometerPage").style.display = "block";
    document.getElementById("fetchTimeSpect").textContent = fetchTime;

    renderSpect(entry.data || {}, fetchTime);
  }

  else if (type === "binsensor") {
    document.getElementById("binsensorPage").style.display = "block";
    document.getElementById("fetchTimeBin").textContent = fetchTime;

    if (entry.data) {
      renderBin(entry.data);
    } else {
      document.getElementById("binFill").style.height = "0%";
    }
  }
}

// Start the timer loop
startTimerLoop();
