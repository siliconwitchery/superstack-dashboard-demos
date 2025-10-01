const doughnutChartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    rotation: -150,
    borderWidth: 0
}

const doughnutChartColors = [
    'rgb(255, 99, 132)',
    'rgba(54, 162, 235, 0)',
]

const barChartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
}

const spectrumChartColors = [
    'rgb(130, 0, 200)',
    'rgb(84, 0, 255)',
    'rgb(0, 70, 255)',
    'rgb(0, 192, 255)',
    'rgb(31, 255, 0)',
    'rgb(179, 255, 0)',
    'rgb(163, 255, 0)',
    'rgb(255, 190, 0)',
    'rgb(255, 33, 0)',
    'rgb(214, 0, 0)',
    'rgb(163, 0, 0)',
    'rgb(50, 0, 0)',
]

export var airQualityChart = new Chart(document.getElementById("air-quality-chart"), {
    type: "doughnut",
    data: { datasets: [{ data: [300, 60], backgroundColor: doughnutChartColors }] },
    options: doughnutChartOptions
});

export var airQualityCo2Chart = new Chart(document.getElementById("air-quality-co2-chart"), {
    type: "doughnut",
    data: { datasets: [{ data: [300, 60], backgroundColor: doughnutChartColors }] },
    options: doughnutChartOptions
});

export var airQualityVocChart = new Chart(document.getElementById("air-quality-voc-chart"), {
    type: "doughnut",
    data: { datasets: [{ data: [300, 60], backgroundColor: doughnutChartColors }] },
    options: doughnutChartOptions
});

export var airQualityHumidityChart = new Chart(document.getElementById("air-quality-humidity-chart"), {
    type: "doughnut",
    data: { datasets: [{ data: [300, 60], backgroundColor: doughnutChartColors }] },
    options: doughnutChartOptions
});

export var powerMeterVoltageChart = new Chart(document.getElementById("power-meter-voltage-chart"), {
    type: "doughnut",
    data: { datasets: [{ data: [300, 60], backgroundColor: doughnutChartColors }] },
    options: doughnutChartOptions
});

export var powerMeterCurrentChart = new Chart(document.getElementById("power-meter-current-chart"), {
    type: "doughnut",
    data: { datasets: [{ data: [300, 60], backgroundColor: doughnutChartColors }] },
    options: doughnutChartOptions
});

export var powerMeterPowerChart = new Chart(document.getElementById("power-meter-power-chart"), {
    type: "doughnut",
    data: { datasets: [{ data: [300, 60], backgroundColor: doughnutChartColors }] },
    options: doughnutChartOptions
});

export var colorSensorSpectrumChart = new Chart(document.getElementById("color-sensor-spectrum-chart"), {
    type: "bar",
    data: {
        labels: ["405", "425", "450", "475", "515", "555", "550", "600", "640", "690", "745", "855"],
        datasets: [{ data: [405, 425, 450, 475, 515, 555, 550, 600, 640, 690, 745, 855], backgroundColor: spectrumChartColors }]
    },
    options: barChartOptions
});

export var trashLevelChart = new Chart(document.getElementById("trash-level-chart"), {
    type: "bar",
    data: {
        labels: ["Level (cm)"],
        datasets: [{ data: [45], backgroundColor: ['#cfbcff'] }]
    },
    options: barChartOptions
});