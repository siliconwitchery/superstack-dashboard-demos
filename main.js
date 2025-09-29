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

    // document
    //   .getElementById("apiForm")
    //   .addEventListener("submit", async (e) => {
    //     e.preventDefault();
    //     apiKeyGlobal = document.getElementById("apiKey").value.trim();
    //     deploymentIdGlobal = document.getElementById("deploymentId").value.trim();
    //     return
    //     if (!key || !depId) return;

    //     const statusEl = document.getElementById("apiStatus");
    //     statusEl.textContent = "Connecting...";
    //     statusEl.style.color = "black";

    //     try {
    //       const start = new Date();
    //       start.setDate(start.getDate() - 7);
    //       const payload = {
    //         deploymentId: depId,
    //         devices: ["Power Meter"],
    //         time: { start: start.toISOString().replace("Z", "+00:00") },
    //       };

    //       const res = await fetch("https://super.siliconwitchery.com/api/data", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //           "X-Api-Key": key,
    //         },
    //         body: JSON.stringify(payload),
    //       });

    //       if (res.ok) {
    //         apiKey = key;
    //         deploymentId = depId;
    //         const data = await res.json();
    //         statusEl.textContent = "✅ Connected";
    //         statusEl.style.color = "green";

    //         const preview = data.slice(-2);

    //         document.getElementById("debugPanel").style.display = "block";
    //         document.getElementById("debugPayload").textContent =
    //           JSON.stringify(payload, null, 2);
    //         document.getElementById("debugResponse").textContent =
    //           JSON.stringify(preview, null, 2);
    //       } else {
    //         apiKey = null;
    //         deploymentId = null;
    //         const errTxt = await res.text();
    //         statusEl.textContent = "❌ Wrong API Key or Deployment ID";
    //         statusEl.style.color = "red";

    //         document.getElementById("debugPanel").style.display = "block";
    //         document.getElementById("debugPayload").textContent =
    //           JSON.stringify(payload, null, 2);
    //         document.getElementById("debugResponse").textContent = errTxt;
    //       }
    //     } catch (err) {
    //       console.error(err);
    //       apiKey = null;
    //       deploymentId = null;
    //       statusEl.textContent = "❌ Connection Failed";
    //       statusEl.style.color = "red";
    //       document.getElementById("debugPanel").style.display = "block";
    //       document.getElementById("debugPayload").textContent = "Failed payload";
    //       document.getElementById("debugResponse").textContent = String(err);
    //     }
    //   });
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
});

///////////////////
// New logic
///////////////////

// Global placeholders for the API key and deployment ID strings
let apiKeyGlobal = null;
let deploymentIdGlobal = null;

async function fetchFromApi2(apiKey, deploymentId) {

  if (apiKey == null || deploymentId == null) {
    console.log("Not connected yet")
    return null
  }

  const start = new Date();
  start.setDate(start.getDate() - 7); // TODO make this 10 seconds before NOW

  const payload = {
    deploymentId: deploymentId,
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
    return await res.json();
  }

  const txt = await res.text();
  console.log("API fetch failed", res.status, txt);
}

// Timer loop which keeps updating the graphs
function startTimerLoop() {
  setInterval(async () => {
    console.log('Timer tick at:', new Date().toLocaleString());

    // Get the key and deployment ID
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      apiKey = document.getElementById("apiKey").value.trim();
      deploymentId = document.getElementById("deploymentId").value.trim();
    }

    // Fetch data from the API
    let result = await fetchFromApi2(apiKey, deploymentId)

    if (result != null) {
      setConnectionStatus(true);
      console.log(result);
      // TODO: update charts
    } else {
      setConnectionStatus(false);
      // If result contains air quality device name
      // Update air quality graphs

      // If result contains power device name
      // Update power device graphs

      // etc. Hardcode the names of the devices in here. Take the last value and apply them 
    }

  }, 1000);
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

function show(type, entry, silent) {
  const fetchTime = new Date().toLocaleString();

  if (type === "airquality") {
    document.getElementById("settingsPage").style.display = "none";
    document.getElementById("airqualityPage").style.display = "block";

    document.getElementById("fanStatus").textContent = entry.data.fan
      ? "On"
      : "Off";
    document.getElementById("fetchTimeAir").textContent = fetchTime;

    if (!silent) {
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
    document.getElementById("settingsPage").style.display = "none";
    document.getElementById("powerPage").style.display = "block";
    document.getElementById("fetchTimePower").textContent = fetchTime;

    if (!silent) {
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
    document.getElementById("settingsPage").style.display = "none";
    document.getElementById("spectrometerPage").style.display = "block";
    document.getElementById("fetchTimeSpect").textContent = fetchTime;

    renderSpect(entry.data, fetchTime);
  }

  else if (type === "binsensor") {
    document.getElementById("settingsPage").style.display = "none";
    document.getElementById("binsensorPage").style.display = "block";
    document.getElementById("fetchTimeBin").textContent = fetchTime;

    if (!silent) {
      renderBin(entry.data);
    } else {
      document.getElementById("binFill").style.height =
        (entry.data.bin || 0) + "%";
    }
  }
}



// Start the timer loop
startTimerLoop();
