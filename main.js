import {
  airQualityIndexChart,
  airQualityCo2Chart,
  airQualityVocChart,
  airQualityHumidityChart,
  powerMeterVoltageChart,
  powerMeterCurrentChart,
  powerMeterPowerChart,
  colorSensorSpectrumChart,
  trashLevelChart,
} from "./chart-settings.js";

// Simulated data that is used when there's no connection
import { getSimulatedData } from "./simulated-data.js"

// References to dynamic elements on the page
const connectionStatusChip = document.getElementById("connection-status-chip")
const simulatedDataNotice = document.getElementById("simulated-data-notice")

// Timer loop which fetches data from the Superstack API every second
setInterval(async () => {

  // Get the deployment ID and API key from the settings page
  let deploymentId = document.getElementById("settings-deployment-id-field").value.trim();
  let apiKey = document.getElementById("settings-api-key-field").value.trim();

  // Get recent device data from the API
  const startTime = new Date();
  startTime.setSeconds(startTime.getSeconds() - 10);

  const requestPayload = {
    deploymentId: deploymentId,
    time: { start: startTime.toISOString().replace("Z", "+00:00") },
  };

  const requestResponse = await fetch("https://super.siliconwitchery.com/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(requestPayload),
  });

  // If the request was successful, parse out the json
  let data

  if (requestResponse.ok) {
    data = await requestResponse.json()
  }

  // Based on the response, update the HTML and fallback to simulated data if needed
  if (!requestResponse.ok) {
    connectionStatusChip.textContent = "Disconnected";
    connectionStatusChip.classList.remove("primary");
    connectionStatusChip.classList.add("error");
    simulatedDataNotice.style.display = "block";
    data = getSimulatedData().reverse()
  }

  else if (data.length === 0) {
    connectionStatusChip.textContent = "Devices offline";
    connectionStatusChip.classList.remove("primary");
    connectionStatusChip.classList.add("error");
    simulatedDataNotice.style.display = "block";
    data = getSimulatedData().reverse()
  }

  else {
    connectionStatusChip.textContent = "Connected";
    connectionStatusChip.classList.remove("error");
    connectionStatusChip.classList.add("primary");
    simulatedDataNotice.style.display = "none";
  }

  // Work backwards through the response data and update each graph
  let airQualityUpdated = false;
  let powerMeterUpdated = false;
  let colorSensorUpdated = false;
  let trashLevelUpdated = false;

  for (const dataPoint of data) {

    if (dataPoint.device_name === "Air Quality Sensors" && !airQualityUpdated) {
      airQualityUpdated = true

      airQualityIndexChart.data.datasets[0].data[0] = (300 / 10) * dataPoint.data.air_quality_index;
      airQualityIndexChart.data.datasets[0].data[1] = 300 - airQualityIndexChart.data.datasets[0].data[0];
      airQualityIndexChart.update()

      airQualityCo2Chart.data.datasets[0].data[0] = (300 / 1000) * dataPoint.data.carbon_dioxide;
      airQualityCo2Chart.data.datasets[0].data[1] = 300 - airQualityCo2Chart.data.datasets[0].data[0];
      airQualityCo2Chart.update()

      airQualityVocChart.data.datasets[0].data[0] = (300 / 1000) * dataPoint.data.volatile_compounds;
      airQualityVocChart.data.datasets[0].data[1] = 300 - airQualityVocChart.data.datasets[0].data[0];
      airQualityVocChart.update()

      airQualityHumidityChart.data.datasets[0].data[0] = (300 / 100) * dataPoint.data.humidity;
      airQualityHumidityChart.data.datasets[0].data[1] = 300 - airQualityHumidityChart.data.datasets[0].data[0];
      airQualityHumidityChart.update()

      document.getElementById("air-quality-index-value").textContent = dataPoint.data.air_quality_index.toFixed(0);
      document.getElementById("air-quality-co2-value").textContent = dataPoint.data.carbon_dioxide.toFixed(0) + "ppm";
      document.getElementById("air-quality-voc-value").textContent = dataPoint.data.volatile_compounds.toFixed(0) + "ppm";
      document.getElementById("air-quality-humidity-value").textContent = dataPoint.data.humidity.toFixed(0) + "%";
    }

    if (dataPoint.device_name === "Power Meter" && !powerMeterUpdated) {
      powerMeterUpdated = true

      powerMeterVoltageChart.data.datasets[0].data[0] = (300 / 24) * dataPoint.data.voltage;
      powerMeterVoltageChart.data.datasets[0].data[1] = 300 - powerMeterVoltageChart.data.datasets[0].data[0];
      powerMeterVoltageChart.update()

      powerMeterCurrentChart.data.datasets[0].data[0] = (300 / 3) * dataPoint.data.current;
      powerMeterCurrentChart.data.datasets[0].data[1] = 300 - powerMeterCurrentChart.data.datasets[0].data[0];
      powerMeterCurrentChart.update()

      powerMeterPowerChart.data.datasets[0].data[0] = (300 / 45) * dataPoint.data.power;
      powerMeterPowerChart.data.datasets[0].data[1] = 300 - powerMeterPowerChart.data.datasets[0].data[0];
      powerMeterPowerChart.update()

      document.getElementById("power-meter-voltage-value").textContent = dataPoint.data.voltage.toFixed(2) + "V";
      document.getElementById("power-meter-current-value").textContent = dataPoint.data.current.toFixed(2) + "A";
      document.getElementById("power-meter-power-value").textContent = dataPoint.data.power.toFixed(2) + "W";

    }

    if (dataPoint.device_name === "Color Sensor" && !colorSensorUpdated) {
      colorSensorUpdated = true

      colorSensorSpectrumChart.data.datasets[0].data[0] = (100 / 65536) * dataPoint.data["405"];
      colorSensorSpectrumChart.data.datasets[0].data[1] = (100 / 65536) * dataPoint.data["425"];
      colorSensorSpectrumChart.data.datasets[0].data[2] = (100 / 65536) * dataPoint.data["450"];
      colorSensorSpectrumChart.data.datasets[0].data[3] = (100 / 65536) * dataPoint.data["475"];
      colorSensorSpectrumChart.data.datasets[0].data[4] = (100 / 65536) * dataPoint.data["515"];
      colorSensorSpectrumChart.data.datasets[0].data[5] = (100 / 65536) * dataPoint.data["555"];
      colorSensorSpectrumChart.data.datasets[0].data[6] = (100 / 65536) * dataPoint.data["550"];
      colorSensorSpectrumChart.data.datasets[0].data[7] = (100 / 65536) * dataPoint.data["600"];
      colorSensorSpectrumChart.data.datasets[0].data[8] = (100 / 65536) * dataPoint.data["640"];
      colorSensorSpectrumChart.data.datasets[0].data[9] = (100 / 65536) * dataPoint.data["690"];
      colorSensorSpectrumChart.data.datasets[0].data[10] = (100 / 65536) * dataPoint.data["745"];
      colorSensorSpectrumChart.data.datasets[0].data[11] = (100 / 65536) * dataPoint.data["855"];
      colorSensorSpectrumChart.update()
    }

    if (dataPoint.device_name === "Trash Level Sensor" && !trashLevelUpdated) {
      trashLevelUpdated = true

      trashLevelChart.data.datasets[0].data[0] = (100 / 74) * dataPoint.data.trash_level;
      trashLevelChart.update()

      document.getElementById("trash-level-value").textContent = dataPoint.data.trash_level.toFixed(0) + "cm / 74cm";
    }

  }
}, 1000);