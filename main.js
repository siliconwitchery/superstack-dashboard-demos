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
import { getSimulatedData } from "./simulated-data.js";

// Timer loop which fetches data from the Superstack API every second
setInterval(async () => {

  // We'll fallback to simulated data if there isn't fresh data, or of the request fails
  let data = getSimulatedData();

  // Get the deployment ID and API key from the settings page
  let deploymentId = document.getElementById("settings-deployment-id-field").value.trim();
  let apiKey = document.getElementById("settings-api-key-field").value.trim();

  // Get recent device data from the API
  const startTime = new Date();
  startTime.setSeconds(startTime.getSeconds() - 10);

  const filters = encodeURIComponent(JSON.stringify(
    {
      startTime: startTime.toISOString(),
    }));

  const requestResponse = await fetch(`https://super.siliconwitchery.com/api/${deploymentId}/data?filters=${filters}`, {
    method: "GET",
    headers: {
      "X-Api-Key": apiKey,
    },
  });

  // Parse out the json
  const responseJson = await requestResponse.json();

  // Based on the response, update the HTML and fallback to simulated data if needed
  const connectionStatusText = document.getElementById("connection-status-text");
  const connectionStatusChip = document.getElementById("connection-status-chip");
  const simulatedDataNotice = document.getElementById("simulated-data-notice");

  if (!requestResponse.ok) {
    connectionStatusText.textContent = "Disconnected";
    connectionStatusChip.classList.remove("primary");
    connectionStatusChip.classList.add("error");
    simulatedDataNotice.style.display = "block";
    console.log(responseJson);
  }

  else if (responseJson.data.length === 0) {
    connectionStatusText.textContent = "Devices offline";
    connectionStatusChip.classList.remove("primary");
    connectionStatusChip.classList.add("error");
    simulatedDataNotice.style.display = "block";
  }

  else {
    connectionStatusText.textContent = "Connected";
    connectionStatusChip.classList.remove("error");
    connectionStatusChip.classList.add("primary");
    simulatedDataNotice.style.display = "none";
    data = responseJson.data; // Use real data
  }

  // Work backwards through the response data and update each graph
  let airQualityUpdated = false;
  let powerMeterUpdated = false;
  let colorSensorUpdated = false;
  let trashLevelUpdated = false;

  for (const dataPoint of data.reverse()) {

    if (dataPoint.device === "Air Quality Sensors" && !airQualityUpdated) {
      airQualityUpdated = true;

      airQualityIndexChart.data.datasets[0].data[0] = (300 / 5) * dataPoint.data.air_quality_index;
      airQualityIndexChart.data.datasets[0].data[1] = 300 - airQualityIndexChart.data.datasets[0].data[0];
      airQualityIndexChart.update();

      airQualityCo2Chart.data.datasets[0].data[0] = (300 / 3000) * dataPoint.data.carbon_dioxide;
      airQualityCo2Chart.data.datasets[0].data[1] = 300 - airQualityCo2Chart.data.datasets[0].data[0];
      airQualityCo2Chart.update();

      airQualityVocChart.data.datasets[0].data[0] = (300 / 10000) * dataPoint.data.volatile_compounds;
      airQualityVocChart.data.datasets[0].data[1] = 300 - airQualityVocChart.data.datasets[0].data[0];
      airQualityVocChart.update();

      airQualityHumidityChart.data.datasets[0].data[0] = (300 / 100) * dataPoint.data.humidity;
      airQualityHumidityChart.data.datasets[0].data[1] = 300 - airQualityHumidityChart.data.datasets[0].data[0];
      airQualityHumidityChart.update();

      document.getElementById("air-quality-index-value").textContent = dataPoint.data.air_quality_index.toFixed(0);
      document.getElementById("air-quality-co2-value").textContent = dataPoint.data.carbon_dioxide.toFixed(0) + "ppm";
      document.getElementById("air-quality-voc-value").textContent = dataPoint.data.volatile_compounds.toFixed(0) + "ppb";
      document.getElementById("air-quality-humidity-value").textContent = dataPoint.data.humidity.toFixed(0) + "%";
    }

    if (dataPoint.device === "Power Meter" && !powerMeterUpdated) {
      powerMeterUpdated = true;

      powerMeterVoltageChart.data.datasets[0].data[0] = (300 / 24) * dataPoint.data.voltage;
      powerMeterVoltageChart.data.datasets[0].data[1] = 300 - powerMeterVoltageChart.data.datasets[0].data[0];
      powerMeterVoltageChart.update();

      powerMeterCurrentChart.data.datasets[0].data[0] = (300 / 3) * dataPoint.data.current;
      powerMeterCurrentChart.data.datasets[0].data[1] = 300 - powerMeterCurrentChart.data.datasets[0].data[0];
      powerMeterCurrentChart.update();

      powerMeterPowerChart.data.datasets[0].data[0] = (300 / 45) * dataPoint.data.power;
      powerMeterPowerChart.data.datasets[0].data[1] = 300 - powerMeterPowerChart.data.datasets[0].data[0];
      powerMeterPowerChart.update();

      document.getElementById("power-meter-voltage-value").textContent = dataPoint.data.voltage.toFixed(2) + "V";
      document.getElementById("power-meter-current-value").textContent = dataPoint.data.current.toFixed(2) + "A";
      document.getElementById("power-meter-power-value").textContent = dataPoint.data.power.toFixed(2) + "W";

    }

    if (dataPoint.device === "Color Sensor" && !colorSensorUpdated) {
      colorSensorUpdated = true;

      colorSensorSpectrumChart.data.datasets[0].data[0] = (100 / 65536) * dataPoint.data["405nm"];
      colorSensorSpectrumChart.data.datasets[0].data[1] = (100 / 65536) * dataPoint.data["425nm"];
      colorSensorSpectrumChart.data.datasets[0].data[2] = (100 / 65536) * dataPoint.data["450nm"];
      colorSensorSpectrumChart.data.datasets[0].data[3] = (100 / 65536) * dataPoint.data["475nm"];
      colorSensorSpectrumChart.data.datasets[0].data[4] = (100 / 65536) * dataPoint.data["515nm"];
      colorSensorSpectrumChart.data.datasets[0].data[5] = (100 / 65536) * dataPoint.data["555nm"];
      colorSensorSpectrumChart.data.datasets[0].data[6] = (100 / 65536) * dataPoint.data["550nm"];
      colorSensorSpectrumChart.data.datasets[0].data[7] = (100 / 65536) * dataPoint.data["600nm"];
      colorSensorSpectrumChart.data.datasets[0].data[8] = (100 / 65536) * dataPoint.data["640nm"];
      colorSensorSpectrumChart.data.datasets[0].data[9] = (100 / 65536) * dataPoint.data["690nm"];
      colorSensorSpectrumChart.data.datasets[0].data[10] = (100 / 65536) * dataPoint.data["745nm"];
      colorSensorSpectrumChart.data.datasets[0].data[11] = (100 / 65536) * dataPoint.data["855nm"];
      colorSensorSpectrumChart.update();

      // Helper function to determine if value is in a certain range
      function within(data, target, range) {
        return target - data >= -range && target - data <= range;
      }

      document.getElementById("color_check_405nm").textContent = within(dataPoint.data["405nm"], 3840, 1500) ? "✅" : "❌";
      document.getElementById("color_check_425nm").textContent = within(dataPoint.data["425nm"], 7936, 1500) ? "✅" : "❌";
      document.getElementById("color_check_450nm").textContent = within(dataPoint.data["450nm"], 38912, 1500) ? "✅" : "❌";
      document.getElementById("color_check_475nm").textContent = within(dataPoint.data["475nm"], 45056, 1500) ? "✅" : "❌";
      document.getElementById("color_check_515nm").textContent = within(dataPoint.data["515nm"], 15873, 1500) ? "✅" : "❌";
      document.getElementById("color_check_550nm").textContent = within(dataPoint.data["550nm"], 29184, 1500) ? "✅" : "❌";
      document.getElementById("color_check_555nm").textContent = within(dataPoint.data["555nm"], 16129, 1500) ? "✅" : "❌";
      document.getElementById("color_check_600nm").textContent = within(dataPoint.data["600nm"], 52224, 1500) ? "✅" : "❌";
      document.getElementById("color_check_640nm").textContent = within(dataPoint.data["640nm"], 29184, 1500) ? "✅" : "❌";
      document.getElementById("color_check_690nm").textContent = within(dataPoint.data["690nm"], 15616, 1500) ? "✅" : "❌";
      document.getElementById("color_check_745nm").textContent = within(dataPoint.data["745nm"], 4096, 1500) ? "✅" : "❌";
      document.getElementById("color_check_855nm").textContent = within(dataPoint.data["855nm"], 4608, 1500) ? "✅" : "❌";
    }

    if (dataPoint.device === "Trash Level Sensor" && !trashLevelUpdated) {
      trashLevelUpdated = true;

      trashLevelChart.data.datasets[0].data[0] = dataPoint.data.trash_level;
      trashLevelChart.update();

      document.getElementById("trash-level-value").textContent = dataPoint.data.trash_level.toFixed(0) + "cm";
    }

  }
}, 500);

// Open the deployment in Superstack when the user clicks the button
document.getElementById('connection-status-chip')
  .addEventListener('click', async function () {
    const deploymentId = document.getElementById('settings-deployment-id-field').value.trim();
    const deploymentUri = encodeURIComponent(deploymentId);
    window.open(`https://super.siliconwitchery.com/?deployment=${deploymentUri}`, '_blank');
  });