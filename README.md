# Superstack Dashboard Demos

A simple, live IoT dashboard demo showcasing how to create real-time data visualization for Superstack deployments using just two core files.

## Overview

This single-page web application demonstrates how to build a live dashboard for viewing IoT sensor data from Superstack deployments. The dashboard displays real-time data from four different IoT device types:

- **Air Quality Sensors** - Air quality index, CO2, volatile compounds, and humidity
- **Power Meter** - Voltage, current, and power consumption
- **Color Sensor** - Light spectrum analysis across multiple wavelengths
- **Trash Level Sensor** - Fill level monitoring

To see the code running on each device, check out the Superstack deployment [here](https://super.siliconwitchery.com/?deployment=2b549e58-b05b-4a24-8266-2843b6538de6).

## Architecture

The entire dashboard is built with just **two main files**:

### `index.html`
- Contains the complete UI structure with navigation tabs for each IoT device type
- Uses BeerCSS for modern, responsive styling
- Includes Chart.js for data visualization
- Features a settings panel where users can enter their deployment ID and API key

### `main.js`
- Handles all the application logic and data fetching
- Imports chart configurations from `chart-settings.js`
- Runs a timer loop that fetches data from the Superstack API every second
- Updates charts and displays in real-time based on the latest sensor readings
- Manages connection status and error handling

## External Dependencies

Only **two external libraries** are used:

1. **BeerCSS** - Modern CSS framework for styling and responsive design
2. **Chart.js** - Powerful charting library for creating interactive data visualizations

## Code Structure
- `index.html` – Main HTML file with UI structure
- `main.js` – Core application logic and data fetching
- `chart-settings.js` – Chart configuration and setup
- `simulated-data.js` - Data that is used to render the graphs while not connected

### Key Components

- **Data Fetching**: The app polls the Superstack API every second to get the latest sensor data
- **Real-time Updates**: Charts and displays update automatically as new data arrives
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Shows connection status and handles API errors gracefully

## Getting Started

1. Clone this repository
2. Open `index.html` in a web browser
3. Navigate to the Settings tab
4. Enter your Superstack deployment ID and API key
5. The dashboard will automatically connect and start displaying live data

## Security Note

⚠️ **Important**: In this demo, the API key is entered directly by the user in the browser for simplicity. In a production environment, this should **never** be done. API keys should be:

- Stored securely on a backend server
- Never exposed in client-side code
- Protected using proper authentication and authorization
- Never shared publicly in HTML or JavaScript files

## Live Demo

Visit the live demo at: [https://demos.siliconwitchery.com](https://demos.siliconwitchery.com)

## Contributing

Feel free to submit issues and enhancement requests!
