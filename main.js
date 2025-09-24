import {
  renderAir,
  updateAir,
  renderPower,
  updatePower,
  renderSpect,
  renderBin,
} from "./charts.js";

document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("contentArea");
  let autoRefreshInterval = null;
  let currentType = null;

  let apiKey = null;
  let deploymentId = null;

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.parentElement.dataset.type;
      document.querySelectorAll(".menu-section").forEach((s) =>
        s !== btn.parentElement ? s.classList.remove("active") : null
      );
      document.querySelectorAll(".menu-section").forEach((s) =>
        s.classList.remove("active")
      );
      btn.parentElement.classList.add("active");
      if (btn.parentElement.classList.contains("active")) {
        currentType = type;
        if (type === "settings") {
          renderSettings();
        } else {
          loadLatest(type, false);
          if (autoRefreshInterval) clearInterval(autoRefreshInterval);
          autoRefreshInterval = setInterval(
            () => loadLatest(type, true),
            5000
          );
        }
      } else {
        currentType = null;
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
      }
    });
  });
  const settingsBtn = document.querySelector(
    '.menu-section[data-type="settings"] .menu-btn'
  );
  if (settingsBtn) {
    settingsBtn.click();
  }

  function renderSettings() {
    contentArea.innerHTML = `
      <h2>Settings</h2>
      <form id="apiForm" style="display:flex;flex-direction:column;max-width:400px;gap:10px;">
        <label>API Key:
          <input type="text" id="apiKey" style="width:100%;padding:5px;"/>
        </label>
        <label>Deployment ID:
          <input type="text" id="deploymentId" style="width:100%;padding:5px;"/>
        </label>
        <button type="submit" style="padding:6px 12px;">Connect & Fetch</button>
      </form>
      <p id="apiStatus" style="margin-top:10px;font-weight:bold;"></p>
      <div id="debugPanel" style="margin-top:20px;display:none;">
        <h3>Fetched Data Preview</h3>
        <pre id="debugPayload" style="background:#f0f0f0;padding:10px;overflow:auto;max-height:200px;"></pre>
        <h4>Response (latest entries)</h4>
        <pre id="debugResponse" style="background:#f9f9f9;padding:10px;overflow:auto;max-height:300px;"></pre>
      </div>
    `;

    document
      .getElementById("apiForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const key = document.getElementById("apiKey").value.trim();
        const depId = document.getElementById("deploymentId").value.trim();
        if (!key || !depId) return;

        const statusEl = document.getElementById("apiStatus");
        statusEl.textContent = "Connecting...";
        statusEl.style.color = "black";

        try {
          const start = new Date();
          start.setDate(start.getDate() - 7);
          const payload = {
            deploymentId: depId,
            devices: ["Power Meter"],
            time: { start: start.toISOString().replace("Z", "+00:00") },
          };

          const res = await fetch("https://super.siliconwitchery.com/api/data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": key,
              "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            apiKey = key;
            deploymentId = depId;
            const data = await res.json();
            statusEl.textContent = "✅ Connected";
            statusEl.style.color = "green";

            const preview = data.slice(-2);

            document.getElementById("debugPanel").style.display = "block";
            document.getElementById("debugPayload").textContent =
              JSON.stringify(payload, null, 2);
            document.getElementById("debugResponse").textContent =
              JSON.stringify(preview, null, 2);
          } else {
            apiKey = null;
            deploymentId = null;
            const errTxt = await res.text();
            statusEl.textContent = "❌ Wrong API Key or Deployment ID";
            statusEl.style.color = "red";

            document.getElementById("debugPanel").style.display = "block";
            document.getElementById("debugPayload").textContent =
              JSON.stringify(payload, null, 2);
            document.getElementById("debugResponse").textContent = errTxt;
          }
        } catch (err) {
          console.error(err);
          apiKey = null;
          deploymentId = null;
          statusEl.textContent = "❌ Connection Failed";
          statusEl.style.color = "red";
          document.getElementById("debugPanel").style.display = "block";
          document.getElementById("debugPayload").textContent = "Failed payload";
          document.getElementById("debugResponse").textContent = String(err);
        }
      });
  }

  async function fetchFromApi(deviceName, key, depId) {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const payload = {
      deploymentId: depId,
      devices: [deviceName],
      time: { start: start.toISOString().replace("Z", "+00:00") },
    };

    const res = await fetch("https://super.siliconwitchery.com/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": key,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.log("API fetch failed", res.status, txt);
      throw new Error("API fetch failed " + res.status + ": " + txt);
    } 
    return await res.json();
  }

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

  async function loadLatest(type, silent) {
    try {
      let data;
      if (apiKey && deploymentId) {
        if (type === "power") {
          data = await fetchFromApi("Power Meter", apiKey, deploymentId);
        } else if (type === "airquality") {
          data = await fetchFromApi("Air Quality Sensor", apiKey, deploymentId);
        } else if (type === "spectrometer") {
          data = await fetchFromApi("Spectrometer", apiKey, deploymentId);
        } else if (type === "binsensor") {
          data = await fetchFromApi("Bin Sensor", apiKey, deploymentId);
        }
      }

      if (!data) throw new Error("No API data");
      const entry = data[data.length - 1];
      show(type, entry, silent);
      setConnectionStatus(true);
    } catch (err) {
      console.warn("API failed, fallback to local", err);
      setConnectionStatus(false);
      try {
        const res = await fetch(`data/${type}.json`);
        const data = await res.json();
        if (!data.length) return;
        const entry = data[data.length - 1];
        show(type, entry, silent);
      } catch (e) {
        console.error("Local fallback failed", e);
      }
    }
  }

  function show(type, entry, silent) {
    const fetchTime = new Date().toLocaleString();

    if (type === "airquality") {
      if (!silent) {
        contentArea.innerHTML = `
          <div style="display:flex;justify-content:space-around;">
            <div style="text-align:center;">
              <h3>AQI</h3><canvas id="aqiGauge" width="200" height="150"></canvas>
            </div>
            <div style="text-align:center;">
              <h3>CO₂</h3><canvas id="co2Gauge" width="200" height="150"></canvas>
            </div>
            <div style="text-align:center;">
              <h3>VOC</h3><canvas id="vocGauge" width="200" height="150"></canvas>
            </div>
          </div>
          <p>
          <p>Fetched at: <span id="fetchTime">${fetchTime}</span></p>`;
          // <p>Latest Timestamp: ${entry.timestamp || ""}</p>
        renderAir({
          air_quality: entry.data.airquality,
          air_quality_unit: "",
          equivalent_CO2: entry.data.equivalent_CO2,
          co2_unit: "ppm",
          total_volatile_compounds: entry.data.total_volatile_compounds,
          voc_unit: "ppb",
        });
      } else {
        updateAir(
          {
            air_quality: entry.data.airquality,
            equivalent_CO2: entry.data.equivalent_CO2,
            total_volatile_compounds: entry.data.total_volatile_compounds,
          },
          fetchTime
        );
      }
    }

    else if (type === "power") {
      if (!silent) {
        contentArea.innerHTML = `
          <div style="display:flex;justify-content:space-around;">
            <div style="text-align:center;"><h3>Voltage</h3><canvas id="voltageGauge" width="200" height="150"></canvas></div>
            <div style="text-align:center;"><h3>Current</h3><canvas id="currentGauge" width="200" height="150"></canvas></div>
            <div style="text-align:center;"><h3>Power</h3><canvas id="powerGauge" width="200" height="150"></canvas></div>
          </div>
          <p>Fetched at: <span id="fetchTime">${fetchTime}</span></p>`;
          // <p>Latest Timestamp: ${entry.timestamp || ""}</p>
        renderPower({
          voltage: { value: entry.data.voltage, unit: "V" },
          current: { value: entry.data.current, unit: "A" },
          power: { value: entry.data.power, unit: "W" },
        });
      } else {
        updatePower(
          {
            voltage: { value: entry.data.voltage, unit: "V" },
            current: { value: entry.data.current, unit: "A" },
            power: { value: entry.data.power, unit: "W" },
          },
          fetchTime
        );
      }
    }

    else if (type === "spectrometer") {
      if (!silent) {
        contentArea.innerHTML = `
          <div style="text-align:center;">
            <h3>Spectrum Color</h3>
            <div id="colorBox" style="width:200px;height:200px;margin:auto;border:1px solid #000;"></div>
            <h3 id="wavelengthText"></h3>
            <h2 id="resultText"></h2>
          </div>
          <p>Fetched at: <span id="fetchTime">${fetchTime}</span></p>`;
          // <p>Latest Timestamp: ${entry.timestamp || ""}</p>
      }
      renderSpect(entry.data, fetchTime);
    }

    else if (type === "binsensor") {
      if (!silent) {
        const { latitude, longitude } = entry.data.location;
        contentArea.innerHTML = `
          <div style="text-align:center;position:relative;">
            <h3>Trash Level</h3>
            <div id="binLevelGraphic" style="position:relative;width:100px;height:150px;border:2px solid black;margin:auto;">
              <div id="binFill" style="position:absolute;bottom:0;left:0;width:100%;background:green;height:0%;"></div>
            </div>
            <h3>Location</h3>
            <iframe id="mapFrame" width="600" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
          </div>
          <p>Fetched at: <span id="fetchTime">${fetchTime}</span></p>`;
          // <p>Latest Timestamp: ${entry.timestamp || ""}</p>
        renderBin(entry.data);
      } else {
        document.getElementById("binFill").style.height =
          (entry.data.bin || 0) + "%";
        document.getElementById("fetchTime").textContent = fetchTime;
      }
    }
  }
});
