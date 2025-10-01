export function getDummyData() {
    return [
        {
            "device_name": "Air Quality Sensors",
            "device_group": "development",
            "timestamp": "2025-10-01T12:53:27.105791Z",
            "data_uuid": "3d521ded-8f65-44c1-a446-e19ae6e0ac78",
            "data": {
                "humidity": 28 + (Math.random() * 5),
                "carbon_dioxide": 301 + (Math.random() * 12),
                "air_quality_index": 3.004554271697998 + (Math.random()),
                "volatile_compounds": 58 + (Math.random() * 10)
            }
        },
        {
            "device_name": "Power Meter",
            "device_group": "development",
            "timestamp": "2025-10-01T08:50:40.019346Z",
            "data_uuid": "3a3ea342-eb92-4fe7-aa56-60fc697781bd",
            "data": {
                "power": 20.09722900390625 + (Math.random()),
                "current": 1.6802978515625 + (Math.random() * 0.1),
                "voltage": 11.962499618530273 + (Math.random() * 0.3)
            }
        },
        {
            "device_name": "Color Sensor",
            "device_group": "development",
            "timestamp": "2025-10-01T12:57:21.160993Z",
            "data_uuid": "3b678867-2500-46d0-b403-113ff396e3dc",
            "data": {
                "405": 829 + (Math.random() * 2000),
                "425": 2875 + (Math.random() * 2000),
                "450": 15901 + (Math.random() * 2000),
                "475": 15296 + (Math.random() * 2000),
                "515": 45650 + (Math.random() * 2000),
                "550": 49031 + (Math.random() * 2000),
                "555": 15542 + (Math.random() * 2000),
                "600": 35854 + (Math.random() * 2000),
                "640": 23189 + (Math.random() * 2000),
                "690": 10920 + (Math.random() * 2000),
                "745": 1958 + (Math.random() * 2000),
                "855": 1622 + (Math.random() * 2000)
            }
        },
        {
            "device_name": "Trash Level Sensor",
            "device_group": "development",
            "timestamp": "2025-10-01T13:31:05.557249Z",
            "data_uuid": "33aeed11-3ccd-4df0-ae9e-874f18c492ed",
            "data": {
                "trash_level": 32 + (Math.random() * 3)
            }
        }
    ]
}