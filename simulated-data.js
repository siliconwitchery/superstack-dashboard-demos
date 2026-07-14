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
                "405nm": 16 + (Math.random() * 2 - 1),
                "425nm": 32 + (Math.random() * 2 - 1),
                "450nm": 156 + (Math.random() * 2 - 1),
                "475nm": 178 + (Math.random() * 2 - 1),
                "515nm": 321 + (Math.random() * 2 - 1),
                "550nm": 117 + (Math.random() * 2 - 1),
                "555nm": 323 + (Math.random() * 2 - 1),
                "600nm": 207 + (Math.random() * 2 - 1),
                "640nm": 116 + (Math.random() * 2 - 1),
                "690nm": 62 + (Math.random() * 2 - 1),
                "745nm": 17 + (Math.random() * 2 - 1),
                "855nm": 19 + (Math.random() * 2 - 1)
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