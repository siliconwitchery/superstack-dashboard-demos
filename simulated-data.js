let idCounter = 56824;

export function getSimulatedData() {
    return [
        {
            "device": "Air Quality Sensors",
            "group": "development",
            "timestamp": "2025-10-01T12:53:27.105791Z",
            "id": idCounter++,
            "data": {
                "humidity": 28 + (Math.random() * 0.5),
                "carbon_dioxide": 301 + (Math.random() * 12),
                "air_quality_index": 1 + (Math.random() * 0.2),
                "volatile_compounds": 58 + (Math.random() * 10)
            }
        },
        {
            "device": "Power Meter",
            "group": "development",
            "timestamp": "2025-10-01T08:50:40.019346Z",
            "id": idCounter++,
            "data": {
                "power": 20.09722900390625 + (Math.random()),
                "current": 1.6802978515625 + (Math.random() * 0.1),
                "voltage": 11.962499618530273 + (Math.random() * 0.3)
            }
        },
        {
            "device": "Color Sensor",
            "group": "development",
            "timestamp": "2025-10-01T12:57:21.160993Z",
            "id": idCounter++,
            "data": {
                "405nm": 829 + (Math.random() * 2000),
                "425nm": 2875 + (Math.random() * 2000),
                "450nm": 15901 + (Math.random() * 2000),
                "475nm": 15296 + (Math.random() * 2000),
                "515nm": 45650 + (Math.random() * 2000),
                "550nm": 49031 + (Math.random() * 2000),
                "555nm": 15542 + (Math.random() * 2000),
                "600nm": 35854 + (Math.random() * 2000),
                "640nm": 23189 + (Math.random() * 2000),
                "690nm": 10920 + (Math.random() * 2000),
                "745nm": 1958 + (Math.random() * 2000),
                "855nm": 1622 + (Math.random() * 2000)
            }
        },
        {
            "device": "Trash Level Sensor",
            "group": "development",
            "timestamp": "2025-10-01T13:31:05.557249Z",
            "id": idCounter++,
            "data": {
                "trash_level": 32 + (Math.random() * 3)
            }
        }
    ]
}